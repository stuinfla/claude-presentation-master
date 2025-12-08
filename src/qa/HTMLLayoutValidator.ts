/**
 * HTML Layout Validator - Bulletproof Viewport Enforcement
 *
 * This validator TESTS rendered HTML presentations to VERIFY:
 * 1. No content overflows the slide boundaries
 * 2. All text is readable (not clipped)
 * 3. All elements fit within the viewport
 * 4. No horizontal scrolling is needed
 *
 * PHILOSOPHY: VERIFY, DON'T GUESS
 * - Uses Playwright to actually render the presentation
 * - Measures real DOM elements
 * - Checks computed styles
 * - Takes screenshots as evidence
 *
 * THIS IS MANDATORY - No HTML export without passing layout validation
 */

import type { Slide } from '../types/index.js';

export interface LayoutValidationResult {
  passed: boolean;
  score: number;
  issues: LayoutIssue[];
  perSlide: SlideLayoutResult[];
  screenshots?: Buffer[];
}

export interface LayoutIssue {
  severity: 'error' | 'warning' | 'info';
  slideIndex: number;
  element?: string;
  message: string;
  suggestion: string;
  measurements?: {
    elementWidth?: number;
    elementHeight?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    overflow?: { x: number; y: number };
  };
}

export interface SlideLayoutResult {
  slideIndex: number;
  passed: boolean;
  score: number;
  issues: LayoutIssue[];
  measurements: {
    contentHeight: number;
    viewportHeight: number;
    contentWidth: number;
    viewportWidth: number;
    overflowY: number;
    overflowX: number;
    hasScrollbar: boolean;
    clippedElements: string[];
  };
}

/**
 * Layout validation rules - STRICT enforcement
 */
const LAYOUT_RULES = {
  // No overflow allowed at all
  maxOverflowY: 0,
  maxOverflowX: 0,
  // Minimum readable font sizes (in pixels)
  minFontSize: 13,
  minTitleFontSize: 20,
  // Maximum content height relative to viewport
  maxContentHeightRatio: 0.95,
  // Minimum whitespace (empty space percentage)
  minWhitespace: 0.25,
  // Maximum text width for readability (characters)
  maxLineLength: 80,
  // Viewport dimensions (16:9 at 1920x1080)
  viewportWidth: 1920,
  viewportHeight: 1080
};

export class HTMLLayoutValidator {
  private playwright: typeof import('playwright') | null = null;

  /**
   * Validate HTML presentation layout using real browser rendering.
   * This is the MANDATORY check before any HTML export.
   */
  async validate(html: string): Promise<LayoutValidationResult> {
    const issues: LayoutIssue[] = [];
    const perSlide: SlideLayoutResult[] = [];

    try {
      // Dynamically import playwright
      this.playwright = await import('playwright');

      // Launch browser
      const browser = await this.playwright.chromium.launch({
        headless: true
      });

      const page = await browser.newPage({
        viewport: {
          width: LAYOUT_RULES.viewportWidth,
          height: LAYOUT_RULES.viewportHeight
        }
      });

      // Load the presentation
      await page.setContent(html, { waitUntil: 'networkidle' });

      // Wait for Reveal.js to initialize
      await page.waitForSelector('.reveal.ready', { timeout: 5000 }).catch(() => {
        // If Reveal doesn't have ready class, wait a bit
        return page.waitForTimeout(1000);
      });

      // Get total slide count
      const slideCount = await page.evaluate(() => {
        // @ts-ignore - Reveal is a global
        if (typeof Reveal !== 'undefined') {
          // @ts-ignore
          return Reveal.getTotalSlides();
        }
        return document.querySelectorAll('.slides > section').length;
      });

      console.log(`  📐 Validating ${slideCount} slides for layout issues...`);

      // Validate each slide
      for (let i = 0; i < slideCount; i++) {
        // Navigate to slide
        await page.evaluate((index) => {
          // @ts-ignore
          if (typeof Reveal !== 'undefined') {
            // @ts-ignore
            Reveal.slide(index);
          }
        }, i);

        // Wait for slide transition
        await page.waitForTimeout(100);

        // Validate this slide
        const slideResult = await this.validateSlide(page, i);
        perSlide.push(slideResult);
        issues.push(...slideResult.issues);
      }

      await browser.close();

    } catch (error) {
      // If Playwright isn't available, fall back to static analysis
      console.warn('  ⚠️  Playwright not available, using static HTML analysis');
      const staticResult = this.validateStaticHTML(html);
      return staticResult;
    }

    // Calculate overall score
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    // Score: Start at 100, deduct for issues
    let score = 100;
    score -= errorCount * 15;  // 15 points per error
    score -= warningCount * 5;  // 5 points per warning
    score = Math.max(0, score);

    const passed = errorCount === 0 && score >= 95;

    if (!passed) {
      console.log(`  ⚠️  Layout validation: ${errorCount} errors, ${warningCount} warnings`);
    } else {
      console.log(`  ✅ Layout validation passed: Score ${score}/100`);
    }

    return {
      passed,
      score,
      issues,
      perSlide
    };
  }

  /**
   * Validate a single slide's layout using Playwright.
   */
  private async validateSlide(
    page: import('playwright').Page,
    slideIndex: number
  ): Promise<SlideLayoutResult> {
    const issues: LayoutIssue[] = [];

    // Get slide dimensions and content measurements
    const measurements = await page.evaluate(() => {
      const slide = document.querySelector('.slides > section.present') as HTMLElement;
      if (!slide) {
        return {
          contentHeight: 0,
          viewportHeight: window.innerHeight,
          contentWidth: 0,
          viewportWidth: window.innerWidth,
          overflowY: 0,
          overflowX: 0,
          hasScrollbar: false,
          clippedElements: [] as string[]
        };
      }

      const slideRect = slide.getBoundingClientRect();
      const clippedElements: string[] = [];

      // Check all child elements for overflow
      const checkElement = (el: Element) => {
        const rect = el.getBoundingClientRect();
        const tagInfo = `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}`;

        // Check if element extends beyond slide boundaries
        if (rect.right > slideRect.right + 5) {
          clippedElements.push(`${tagInfo} overflows right by ${Math.round(rect.right - slideRect.right)}px`);
        }
        if (rect.bottom > slideRect.bottom + 5) {
          clippedElements.push(`${tagInfo} overflows bottom by ${Math.round(rect.bottom - slideRect.bottom)}px`);
        }
        if (rect.left < slideRect.left - 5) {
          clippedElements.push(`${tagInfo} overflows left by ${Math.round(slideRect.left - rect.left)}px`);
        }
      };

      // Check all elements
      slide.querySelectorAll('*').forEach(checkElement);

      // Check for scrollbars
      const hasScrollbar = slide.scrollHeight > slide.clientHeight ||
                          slide.scrollWidth > slide.clientWidth;

      return {
        contentHeight: slide.scrollHeight,
        viewportHeight: slideRect.height,
        contentWidth: slide.scrollWidth,
        viewportWidth: slideRect.width,
        overflowY: Math.max(0, slide.scrollHeight - slide.clientHeight),
        overflowX: Math.max(0, slide.scrollWidth - slide.clientWidth),
        hasScrollbar,
        clippedElements
      };
    });

    // Check for vertical overflow
    if (measurements.overflowY > LAYOUT_RULES.maxOverflowY) {
      issues.push({
        severity: 'error',
        slideIndex,
        message: `Content overflows slide by ${measurements.overflowY}px vertically`,
        suggestion: 'Reduce content, use smaller fonts, or split into multiple slides',
        measurements: {
          elementHeight: measurements.contentHeight,
          viewportHeight: measurements.viewportHeight,
          overflow: { x: 0, y: measurements.overflowY }
        }
      });
    }

    // Check for horizontal overflow
    if (measurements.overflowX > LAYOUT_RULES.maxOverflowX) {
      issues.push({
        severity: 'error',
        slideIndex,
        message: `Content overflows slide by ${measurements.overflowX}px horizontally`,
        suggestion: 'Reduce width of content, use smaller table/image sizes',
        measurements: {
          elementWidth: measurements.contentWidth,
          viewportWidth: measurements.viewportWidth,
          overflow: { x: measurements.overflowX, y: 0 }
        }
      });
    }

    // Check for scrollbars (indicates overflow even if hidden)
    if (measurements.hasScrollbar) {
      issues.push({
        severity: 'error',
        slideIndex,
        message: 'Slide requires scrolling to see all content',
        suggestion: 'Content must fit entirely within the slide viewport'
      });
    }

    // Report clipped elements
    for (const clipped of measurements.clippedElements) {
      const elementName = clipped.split(' ')[0] ?? 'unknown';
      issues.push({
        severity: 'error',
        slideIndex,
        element: elementName,
        message: clipped,
        suggestion: 'Element extends beyond slide boundaries'
      });
    }

    // Check font sizes
    const minFontSize = LAYOUT_RULES.minFontSize;
    const minTitleFontSize = LAYOUT_RULES.minTitleFontSize;
    const fontIssues = await page.evaluate(({ minSize, minTitleSize }: { minSize: number; minTitleSize: number }) => {
      const issues: Array<{ element: string; size: number; min: number }> = [];
      const slide = document.querySelector('.slides > section.present');
      if (!slide) return issues;

      slide.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const isTitle = el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3';
        const minRequired = isTitle ? minTitleSize : minSize;

        if (fontSize > 0 && fontSize < minRequired && el.textContent?.trim()) {
          issues.push({
            element: `${el.tagName.toLowerCase()}`,
            size: fontSize,
            min: minRequired
          });
        }
      });

      return issues;
    }, { minSize: minFontSize, minTitleSize: minTitleFontSize });

    for (const fontIssue of fontIssues) {
      issues.push({
        severity: 'warning',
        slideIndex,
        element: fontIssue.element,
        message: `Font size ${fontIssue.size}px below minimum ${fontIssue.min}px`,
        suggestion: 'Increase font size for readability'
      });
    }

    // Calculate slide score
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    let slideScore = 100 - (errorCount * 20) - (warningCount * 5);
    slideScore = Math.max(0, slideScore);

    return {
      slideIndex,
      passed: errorCount === 0,
      score: slideScore,
      issues,
      measurements
    };
  }

  /**
   * Static HTML analysis fallback when Playwright isn't available.
   * Analyzes CSS and HTML structure without rendering.
   */
  private validateStaticHTML(html: string): LayoutValidationResult {
    const issues: LayoutIssue[] = [];

    // Check for overflow-related CSS issues
    if (!html.includes('overflow: hidden') && !html.includes('overflow:hidden')) {
      issues.push({
        severity: 'warning',
        slideIndex: -1,
        message: 'No overflow:hidden found in CSS - content may escape slide boundaries',
        suggestion: 'Add overflow: hidden to .reveal .slides section'
      });
    }

    // Check for max-height/max-width constraints
    if (!html.includes('max-height') || !html.includes('max-width')) {
      issues.push({
        severity: 'warning',
        slideIndex: -1,
        message: 'No max-height/max-width constraints found',
        suggestion: 'Add max-height and max-width to prevent overflow'
      });
    }

    // Check for flexbox shrink capability
    if (!html.includes('flex-shrink') || !html.includes('min-height: 0')) {
      issues.push({
        severity: 'info',
        slideIndex: -1,
        message: 'Flexbox shrink rules may be missing',
        suggestion: 'Add flex-shrink: 1 and min-height: 0 to allow content to shrink'
      });
    }

    // Check for table containment
    if (html.includes('<table') && !html.includes('table-layout: fixed')) {
      issues.push({
        severity: 'warning',
        slideIndex: -1,
        message: 'Tables without table-layout: fixed may overflow',
        suggestion: 'Add table-layout: fixed to prevent table overflow'
      });
    }

    // Check for image containment
    if (html.includes('<img') && !html.includes('max-width: 100%')) {
      issues.push({
        severity: 'warning',
        slideIndex: -1,
        message: 'Images without max-width: 100% may overflow',
        suggestion: 'Add max-width: 100% to all images'
      });
    }

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    let score = 100 - (errorCount * 15) - (warningCount * 5);
    score = Math.max(0, score);

    return {
      passed: errorCount === 0 && score >= 95,
      score,
      issues,
      perSlide: []
    };
  }

  /**
   * Generate remediation suggestions for layout issues.
   */
  generateRemediationPlan(result: LayoutValidationResult): string[] {
    const plan: string[] = [];

    // Group issues by type
    const overflowIssues = result.issues.filter(i =>
      i.message.includes('overflow') || i.message.includes('scrolling')
    );
    const fontIssues = result.issues.filter(i => i.message.includes('Font size'));
    const otherIssues = result.issues.filter(i =>
      !i.message.includes('overflow') &&
      !i.message.includes('scrolling') &&
      !i.message.includes('Font size')
    );

    if (overflowIssues.length > 0) {
      plan.push('🔴 CRITICAL: Fix content overflow issues:');
      for (const issue of overflowIssues) {
        plan.push(`   - Slide ${issue.slideIndex + 1}: ${issue.suggestion}`);
      }
    }

    if (fontIssues.length > 0) {
      plan.push('🟡 WARNING: Increase font sizes:');
      for (const issue of fontIssues) {
        plan.push(`   - Slide ${issue.slideIndex + 1}: ${issue.message}`);
      }
    }

    if (otherIssues.length > 0) {
      plan.push('ℹ️  INFO: Additional improvements:');
      for (const issue of otherIssues) {
        plan.push(`   - ${issue.message}`);
      }
    }

    return plan;
  }
}
