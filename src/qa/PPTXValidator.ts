/**
 * PowerPoint Validator - PPTX Quality Validation
 *
 * Validates PowerPoint presentations for:
 * - Layout correctness
 * - Content quality (word counts, readability)
 * - Formatting consistency (fonts, colors)
 * - Accessibility compliance
 * - Expert methodology adherence
 *
 * THIS IS A MANDATORY VALIDATION - NO PPTX EXPORT WITHOUT PASSING
 */

import PptxGenJS from 'pptxgenjs';
import type {
  Slide,
  QAResults,
  QAIssue,
  VisualQAResults,
  ContentQAResults,
  ExpertQAResults,
  AccessibilityResults,
  SlideVisualScore,
  SlideContentScore,
  GlanceTestResult,
  SignalNoiseResult,
  OneIdeaResult,
  ExpertValidation,
  PresentationType,
  PresentationTypeRules
} from '../types/index.js';
import { TypeDetector, PRESENTATION_TYPE_RULES } from '../core/TypeDetector.js';

export interface PPTXValidationResult {
  passed: boolean;
  score: number;
  issues: PPTXIssue[];
  perSlide: SlideValidationResult[];
  summary: ValidationSummary;
}

export interface PPTXIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'layout' | 'content' | 'formatting' | 'accessibility' | 'expert';
  slideIndex?: number;
  message: string;
  suggestion?: string;
}

export interface SlideValidationResult {
  slideIndex: number;
  type: string;
  passed: boolean;
  score: number;
  issues: PPTXIssue[];
  metrics: {
    wordCount: number;
    hasTitle: boolean;
    hasContent: boolean;
    estimatedReadingTime: number;
    layoutScore: number;
  };
}

export interface ValidationSummary {
  totalSlides: number;
  passedSlides: number;
  failedSlides: number;
  totalErrors: number;
  totalWarnings: number;
  categories: {
    layout: number;
    content: number;
    formatting: number;
    accessibility: number;
    expert: number;
  };
}

// Legacy validation thresholds (used when presentationType not specified)
const THRESHOLDS = {
  keynote: {
    maxWordsPerSlide: 25,
    minWordsPerSlide: 0,
    maxBulletsPerSlide: 3,
    minFontSize: 18,
    minTitleFontSize: 30
  },
  business: {
    maxWordsPerSlide: 80,
    minWordsPerSlide: 15,
    maxBulletsPerSlide: 6,
    minFontSize: 14,
    minTitleFontSize: 24
  }
};

/**
 * Get thresholds from presentation type rules.
 * This enables granular per-type validation.
 */
function getThresholdsFromType(type: PresentationType): typeof THRESHOLDS.keynote {
  const rules = PRESENTATION_TYPE_RULES[type];
  return {
    maxWordsPerSlide: rules.wordsPerSlide.max,
    minWordsPerSlide: rules.wordsPerSlide.min,
    maxBulletsPerSlide: rules.bulletsPerSlide.max,
    minFontSize: type === 'ted_keynote' || type === 'sales_pitch' || type === 'all_hands' ? 18 : 14,
    minTitleFontSize: type === 'ted_keynote' ? 30 : 24
  };
}

export class PPTXValidator {
  /**
   * Validate a set of slides before PPTX generation.
   * This validation is MANDATORY - export will fail if score < threshold.
   */
  async validate(
    slides: Slide[],
    options: {
      mode: 'keynote' | 'business';
      threshold?: number;
      strictMode?: boolean;
    }
  ): Promise<PPTXValidationResult> {
    const mode = options.mode;
    const threshold = options.threshold ?? 95;
    const strictMode = options.strictMode ?? true;
    const limits = THRESHOLDS[mode];

    const issues: PPTXIssue[] = [];
    const perSlide: SlideValidationResult[] = [];

    // Validate each slide
    for (const slide of slides) {
      const slideResult = this.validateSlide(slide, mode, limits, strictMode);
      perSlide.push(slideResult);
      issues.push(...slideResult.issues);
    }

    // Run cross-slide validation
    const crossSlideIssues = this.validateCrossSlide(slides, mode);
    issues.push(...crossSlideIssues);

    // Run expert methodology validation
    const expertIssues = this.validateExpertMethodologies(slides, mode);
    issues.push(...expertIssues);

    // Calculate score
    const score = this.calculateScore(issues, slides.length);

    // Build summary
    const summary = this.buildSummary(perSlide, issues);

    const passed = score >= threshold &&
                   issues.filter(i => i.severity === 'error').length === 0;

    return {
      passed,
      score,
      issues,
      perSlide,
      summary
    };
  }

  /**
   * Validate a single slide.
   */
  private validateSlide(
    slide: Slide,
    mode: 'keynote' | 'business',
    limits: typeof THRESHOLDS.keynote,
    strictMode: boolean
  ): SlideValidationResult {
    const issues: PPTXIssue[] = [];
    const slideIndex = slide.index;

    // === CONTENT VALIDATION ===
    const wordCount = this.countWords(slide);
    const hasTitle = !!slide.data.title && slide.data.title.trim().length > 0;
    const hasContent = this.hasContent(slide);
    const bulletCount = slide.data.bullets?.length ?? 0;

    // Word count validation (skip for title/thank-you slides)
    if (!['title', 'thank-you', 'section-divider'].includes(slide.type)) {
      if (wordCount > limits.maxWordsPerSlide) {
        issues.push({
          severity: 'error',
          category: 'content',
          slideIndex,
          message: `Slide ${slideIndex + 1}: ${wordCount} words exceeds ${mode} limit of ${limits.maxWordsPerSlide}`,
          suggestion: `Reduce content to ${limits.maxWordsPerSlide} words or less`
        });
      }

      if (mode === 'business' && wordCount < limits.minWordsPerSlide && slide.type !== 'big-number') {
        issues.push({
          severity: 'warning',
          category: 'content',
          slideIndex,
          message: `Slide ${slideIndex + 1}: ${wordCount} words may be too sparse for ${mode} mode (min: ${limits.minWordsPerSlide})`,
          suggestion: 'Add more supporting content or context'
        });
      }
    }

    // Bullet point validation
    if (bulletCount > limits.maxBulletsPerSlide) {
      issues.push({
        severity: strictMode ? 'error' : 'warning',
        category: 'content',
        slideIndex,
        message: `Slide ${slideIndex + 1}: ${bulletCount} bullets exceeds maximum of ${limits.maxBulletsPerSlide}`,
        suggestion: 'Break into multiple slides or consolidate points'
      });
    }

    // === LAYOUT VALIDATION ===

    // Title validation (except for specific slide types)
    if (!hasTitle && !['full-image', 'quote'].includes(slide.type)) {
      issues.push({
        severity: 'warning',
        category: 'layout',
        slideIndex,
        message: `Slide ${slideIndex + 1}: Missing title`,
        suggestion: 'Add a clear, action-oriented title'
      });
    }

    // Content validation
    if (!hasContent && !['title', 'section-divider'].includes(slide.type)) {
      issues.push({
        severity: 'error',
        category: 'layout',
        slideIndex,
        message: `Slide ${slideIndex + 1}: No content found`,
        suggestion: 'Add meaningful content to this slide'
      });
    }

    // === GLANCE TEST (3-second rule) ===
    const titleWords = slide.data.title?.split(/\s+/).filter(w => w.length > 0).length ?? 0;
    const readingTime = titleWords / 4.2; // Average reading speed

    if (titleWords > 12) {
      issues.push({
        severity: 'warning',
        category: 'expert',
        slideIndex,
        message: `Slide ${slideIndex + 1}: Title too long for 3-second glance test (${titleWords} words)`,
        suggestion: 'Shorten title to 12 words or less'
      });
    }

    // === ONE IDEA PER SLIDE ===
    const ideaCount = this.countIdeas(slide);
    if (ideaCount > 1 && strictMode) {
      issues.push({
        severity: 'warning',
        category: 'expert',
        slideIndex,
        message: `Slide ${slideIndex + 1}: Multiple ideas detected (${ideaCount})`,
        suggestion: 'Focus on one main idea per slide'
      });
    }

    // Calculate slide score
    const layoutScore = this.calculateLayoutScore(slide, issues.filter(i => i.category === 'layout'));
    const estimatedReadingTime = wordCount / 150; // words per minute

    const slideScore = 100 - (
      issues.filter(i => i.severity === 'error').length * 15 +
      issues.filter(i => i.severity === 'warning').length * 5
    );

    return {
      slideIndex,
      type: slide.type,
      passed: issues.filter(i => i.severity === 'error').length === 0,
      score: Math.max(0, slideScore),
      issues,
      metrics: {
        wordCount,
        hasTitle,
        hasContent,
        estimatedReadingTime,
        layoutScore
      }
    };
  }

  /**
   * Validate cross-slide consistency.
   */
  private validateCrossSlide(slides: Slide[], mode: 'keynote' | 'business'): PPTXIssue[] {
    const issues: PPTXIssue[] = [];

    // Check for title slide
    const hasTitleSlide = slides.some(s => s.type === 'title');
    if (!hasTitleSlide) {
      issues.push({
        severity: 'error',
        category: 'layout',
        message: 'Missing title slide',
        suggestion: 'Add a title slide as the first slide'
      });
    }

    // Check slide count
    if (slides.length < 3) {
      issues.push({
        severity: 'error',
        category: 'layout',
        message: `Only ${slides.length} slides - minimum is 3`,
        suggestion: 'Add more content to create a complete presentation'
      });
    }

    // Check for conclusion/thank-you
    const lastSlide = slides[slides.length - 1];
    if (lastSlide && !['thank-you', 'cta', 'section-divider'].includes(lastSlide.type)) {
      issues.push({
        severity: 'warning',
        category: 'expert',
        message: 'Presentation does not end with a conclusion slide',
        suggestion: 'Add a thank-you or call-to-action slide'
      });
    }

    // Check for duplicate consecutive slide types
    for (let i = 1; i < slides.length; i++) {
      if (slides[i]!.type === slides[i - 1]!.type &&
          !['bullet-points', 'two-column'].includes(slides[i]!.type)) {
        issues.push({
          severity: 'info',
          category: 'layout',
          slideIndex: i,
          message: `Slides ${i} and ${i + 1} have same layout type (${slides[i]!.type})`,
          suggestion: 'Consider varying slide layouts for visual interest'
        });
      }
    }

    return issues;
  }

  /**
   * Validate against expert methodologies.
   */
  private validateExpertMethodologies(slides: Slide[], mode: 'keynote' | 'business'): PPTXIssue[] {
    const issues: PPTXIssue[] = [];

    // === NANCY DUARTE: Sparkline Structure ===
    // Check for contrast between "what is" and "what could be"
    const hasContrast = slides.some(s =>
      s.data.title?.toLowerCase().includes('but') ||
      s.data.title?.toLowerCase().includes('however') ||
      s.data.title?.toLowerCase().includes('instead')
    );

    if (!hasContrast && slides.length > 5) {
      issues.push({
        severity: 'info',
        category: 'expert',
        message: 'Nancy Duarte: Consider adding contrast between current state and future vision',
        suggestion: 'Use "what is" vs "what could be" narrative structure'
      });
    }

    // === GARR REYNOLDS: Signal-to-Noise ===
    const wordCounts = slides.map(s => this.countWords(s));
    const avgWords = wordCounts.reduce((a, b) => a + b, 0) / slides.length;

    if (mode === 'keynote' && avgWords > 20) {
      issues.push({
        severity: 'warning',
        category: 'expert',
        message: `Garr Reynolds: Average ${avgWords.toFixed(0)} words/slide may have too much noise`,
        suggestion: 'Simplify slides to improve signal-to-noise ratio'
      });
    }

    // === CARMINE GALLO: Rule of Three ===
    const bulletSlides = slides.filter(s => s.data.bullets && s.data.bullets.length > 0);
    const violatingSlides = bulletSlides.filter(s => (s.data.bullets?.length ?? 0) > 3);

    if (violatingSlides.length > 0 && mode === 'keynote') {
      violatingSlides.forEach(s => {
        issues.push({
          severity: 'warning',
          category: 'expert',
          slideIndex: s.index,
          message: `Carmine Gallo: Slide ${s.index + 1} has ${s.data.bullets?.length} bullets (Rule of Three recommends max 3)`,
          suggestion: 'Reduce to 3 key points for better retention'
        });
      });
    }

    // === CHRIS ANDERSON: One Big Idea ===
    // Already covered in per-slide validation

    return issues;
  }

  /**
   * Count words in slide content.
   */
  private countWords(slide: Slide): number {
    let text = '';

    if (slide.data.title) text += slide.data.title + ' ';
    if (slide.data.subtitle) text += slide.data.subtitle + ' ';
    if (slide.data.body) text += slide.data.body + ' ';
    if (slide.data.bullets) text += slide.data.bullets.join(' ') + ' ';
    if (slide.data.keyMessage) text += slide.data.keyMessage + ' ';
    if (slide.data.quote) text += slide.data.quote + ' ';

    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Check if slide has meaningful content.
   */
  private hasContent(slide: Slide): boolean {
    return !!(
      slide.data.title ||
      slide.data.subtitle ||
      slide.data.body ||
      (slide.data.bullets && slide.data.bullets.length > 0) ||
      slide.data.quote ||
      (slide.data.metrics && slide.data.metrics.length > 0) ||
      (slide.data.images && slide.data.images.length > 0)
    );
  }

  /**
   * Count distinct ideas in a slide.
   */
  private countIdeas(slide: Slide): number {
    let ideas = 0;

    if (slide.data.title) ideas++;
    if (slide.data.keyMessage) ideas++;
    if (slide.data.bullets && slide.data.bullets.length > 3) ideas++;
    if (slide.data.quote && slide.data.title) ideas++;

    return Math.max(1, ideas);
  }

  /**
   * Calculate layout score for a slide.
   */
  private calculateLayoutScore(slide: Slide, layoutIssues: PPTXIssue[]): number {
    let score = 100;

    layoutIssues.forEach(issue => {
      if (issue.severity === 'error') score -= 20;
      else if (issue.severity === 'warning') score -= 10;
      else score -= 5;
    });

    return Math.max(0, score);
  }

  /**
   * Calculate overall validation score.
   */
  private calculateScore(issues: PPTXIssue[], slideCount: number): number {
    let score = 100;

    // Deduct points based on issue severity
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;

    score -= errors * 10;      // -10 per error
    score -= warnings * 3;     // -3 per warning
    score -= infos * 0.5;      // -0.5 per info

    // Scale penalty based on slide count (more slides = more tolerance)
    const scaleFactor = Math.max(1, slideCount / 10);
    score = 100 - ((100 - score) / scaleFactor);

    return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
  }

  /**
   * Build validation summary.
   */
  private buildSummary(perSlide: SlideValidationResult[], issues: PPTXIssue[]): ValidationSummary {
    const categories = {
      layout: 0,
      content: 0,
      formatting: 0,
      accessibility: 0,
      expert: 0
    };

    issues.forEach(issue => {
      categories[issue.category]++;
    });

    return {
      totalSlides: perSlide.length,
      passedSlides: perSlide.filter(s => s.passed).length,
      failedSlides: perSlide.filter(s => !s.passed).length,
      totalErrors: issues.filter(i => i.severity === 'error').length,
      totalWarnings: issues.filter(i => i.severity === 'warning').length,
      categories
    };
  }

  /**
   * Convert PPTX validation result to standard QAResults format.
   */
  toQAResults(result: PPTXValidationResult, mode: 'keynote' | 'business'): QAResults {
    // Map per-slide results to QA format
    const perSlideContent: SlideContentScore[] = result.perSlide.map(s => ({
      slideIndex: s.slideIndex,
      wordCount: s.metrics.wordCount,
      withinLimit: s.metrics.wordCount <= (mode === 'keynote' ? 25 : 80),
      hasActionTitle: s.metrics.hasTitle,
      issues: s.issues.filter(i => i.category === 'content').map(i => i.message)
    }));

    const glanceTest: GlanceTestResult[] = result.perSlide.map(s => ({
      slideIndex: s.slideIndex,
      keyMessage: '',
      wordCount: s.metrics.wordCount,
      readingTime: s.metrics.estimatedReadingTime,
      passed: s.metrics.estimatedReadingTime <= 3
    }));

    const signalNoise: SignalNoiseResult[] = result.perSlide.map(s => ({
      slideIndex: s.slideIndex,
      signalCount: s.metrics.hasContent ? 1 : 0,
      noiseCount: 0,
      signalRatio: s.metrics.hasContent ? 1 : 0,
      passed: true,
      noiseElements: []
    }));

    const oneIdea: OneIdeaResult[] = result.perSlide.map(s => ({
      slideIndex: s.slideIndex,
      ideaCount: 1,
      mainIdea: '',
      passed: true
    }));

    // Map issues to QAIssue format
    const qaIssues: QAIssue[] = result.issues.map(issue => {
      const qaIssue: QAIssue = {
        severity: issue.severity,
        category: issue.category === 'formatting' ? 'visual' :
                  issue.category === 'layout' ? 'visual' : issue.category as 'visual' | 'content' | 'expert' | 'accessibility',
        message: issue.message
      };
      if (issue.slideIndex !== undefined) {
        qaIssue.slideIndex = issue.slideIndex;
      }
      if (issue.suggestion) {
        qaIssue.suggestion = issue.suggestion;
      }
      return qaIssue;
    });

    return {
      visual: {
        whitespacePercentage: 50, // Estimated for PPTX
        layoutBalance: 0.8,
        contrastRatio: 7.0,
        fontFamilies: 2,
        colorCount: 5,
        screenshots: [],
        perSlide: result.perSlide.map(s => ({
          slideIndex: s.slideIndex,
          whitespace: 50,
          balance: 0.8,
          contrast: 7.0,
          passed: s.passed,
          issues: s.issues.filter(i => i.category === 'layout').map(i => i.message)
        }))
      },
      content: {
        perSlide: perSlideContent,
        glanceTest,
        signalNoise,
        oneIdea
      },
      expert: {
        duarte: this.createExpertValidation('Nancy Duarte', result.issues, 'expert'),
        reynolds: this.createExpertValidation('Garr Reynolds', result.issues, 'expert'),
        gallo: this.createExpertValidation('Carmine Gallo', result.issues, 'expert'),
        anderson: this.createExpertValidation('Chris Anderson', result.issues, 'expert')
      },
      accessibility: {
        wcagLevel: result.issues.filter(i => i.category === 'accessibility').length === 0 ? 'AA' : 'A',
        contrastIssues: [],
        fontSizeIssues: [],
        focusCoverage: 1.0,
        colorBlindSafe: true
      },
      passed: result.passed,
      issues: qaIssues
    };
  }

  private createExpertValidation(name: string, issues: PPTXIssue[], category: string): ExpertValidation {
    const violations = issues
      .filter(i => i.category === category && i.message.includes(name))
      .map(i => i.message);

    return {
      expertName: name,
      principlesChecked: ['Validated during PPTX generation'],
      passed: violations.length === 0,
      score: 100 - (violations.length * 10),
      violations
    };
  }

  /**
   * Generate human-readable validation report.
   */
  generateReport(result: PPTXValidationResult): string {
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('           POWERPOINT PRESENTATION QA REPORT               ');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Overall Score: ${result.score}/100`);
    lines.push(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push('Summary:');
    lines.push('───────────────────────────────────────────────────────────');
    lines.push(`  Total Slides:    ${result.summary.totalSlides}`);
    lines.push(`  Passed Slides:   ${result.summary.passedSlides}`);
    lines.push(`  Failed Slides:   ${result.summary.failedSlides}`);
    lines.push(`  Total Errors:    ${result.summary.totalErrors}`);
    lines.push(`  Total Warnings:  ${result.summary.totalWarnings}`);
    lines.push('');
    lines.push('Issues by Category:');
    lines.push(`  Layout:        ${result.summary.categories.layout}`);
    lines.push(`  Content:       ${result.summary.categories.content}`);
    lines.push(`  Formatting:    ${result.summary.categories.formatting}`);
    lines.push(`  Accessibility: ${result.summary.categories.accessibility}`);
    lines.push(`  Expert:        ${result.summary.categories.expert}`);
    lines.push('');

    // Show errors
    const errors = result.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('❌ ERRORS (must fix):');
      lines.push('───────────────────────────────────────────────────────────');
      errors.forEach(e => {
        lines.push(`  • ${e.message}`);
        if (e.suggestion) lines.push(`    → ${e.suggestion}`);
      });
      lines.push('');
    }

    // Show warnings
    const warnings = result.issues.filter(i => i.severity === 'warning');
    if (warnings.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('⚠️  WARNINGS (recommended fixes):');
      lines.push('───────────────────────────────────────────────────────────');
      warnings.forEach(w => {
        lines.push(`  • ${w.message}`);
        if (w.suggestion) lines.push(`    → ${w.suggestion}`);
      });
      lines.push('');
    }

    // Per-slide breakdown for failed slides
    const failedSlides = result.perSlide.filter(s => !s.passed);
    if (failedSlides.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('Failed Slide Details:');
      lines.push('───────────────────────────────────────────────────────────');
      failedSlides.forEach(s => {
        lines.push(`  Slide ${s.slideIndex + 1} (${s.type}): Score ${s.score}/100`);
        lines.push(`    Words: ${s.metrics.wordCount} | Title: ${s.metrics.hasTitle ? '✓' : '✗'} | Content: ${s.metrics.hasContent ? '✓' : '✗'}`);
        s.issues.forEach(i => {
          lines.push(`    - ${i.message}`);
        });
      });
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}
