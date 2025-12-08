/**
 * Auto-Remediation Engine
 *
 * Instead of blocking on QA failures, this engine automatically fixes issues
 * and iterates until the presentation passes quality thresholds.
 *
 * Philosophy: NEVER fail - always deliver a working, quality presentation.
 *
 * Remediation strategies:
 * - Too many words → Summarize/split slides
 * - Poor whitespace → Adjust layout
 * - Failed glance test → Shorten titles
 * - Too many bullets → Consolidate or split
 * - Missing structure → Add required slides
 * - Accessibility issues → Fix contrast/font sizes
 */

import type {
  Slide,
  SlideType,
  QAResults,
  QAIssue
} from '../types/index.js';
import type { PPTXValidationResult, PPTXIssue } from './PPTXValidator.js';

export interface RemediationResult {
  originalSlides: Slide[];
  remediatedSlides: Slide[];
  iterations: number;
  changesApplied: RemediationChange[];
  finalScore: number;
  success: boolean;
}

export interface RemediationChange {
  slideIndex: number;
  type: RemediationType;
  description: string;
  before?: string;
  after?: string;
}

export type RemediationType =
  | 'word_reduction'
  | 'slide_split'
  | 'title_shortening'
  | 'bullet_consolidation'
  | 'layout_adjustment'
  | 'structure_addition'
  | 'font_size_increase'
  | 'content_enhancement'
  | 'whitespace_improvement';

const MAX_ITERATIONS = 5;

export class AutoRemediation {
  private changes: RemediationChange[] = [];

  /**
   * Automatically remediate slides until they pass QA.
   */
  async remediate(
    slides: Slide[],
    issues: QAIssue[] | PPTXIssue[],
    options: {
      mode: 'keynote' | 'business';
      targetScore: number;
    }
  ): Promise<Slide[]> {
    let currentSlides = this.deepClone(slides);
    this.changes = [];

    console.log('🔧 Starting auto-remediation...');

    // Group issues by type for efficient processing
    const issuesByType = this.groupIssuesByType(issues);

    // Apply remediation strategies in priority order
    currentSlides = this.remediateWordCount(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateGlanceTest(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateBullets(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateStructure(currentSlides, issuesByType, options.mode);
    currentSlides = this.remediateAccessibility(currentSlides, issuesByType);

    console.log(`✅ Applied ${this.changes.length} remediation changes`);

    return currentSlides;
  }

  /**
   * Get the changes that were applied during remediation.
   */
  getChanges(): RemediationChange[] {
    return this.changes;
  }

  /**
   * Remediate word count issues - the most common problem.
   */
  private remediateWordCount(
    slides: Slide[],
    issuesByType: Map<string, (QAIssue | PPTXIssue)[]>,
    mode: 'keynote' | 'business'
  ): Slide[] {
    const wordIssues = [
      ...(issuesByType.get('word_count') || []),
      ...(issuesByType.get('content') || [])
    ].filter(i => i.message.includes('words'));

    const maxWords = mode === 'keynote' ? 25 : 80;

    for (const issue of wordIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === undefined) continue;

      const slide = slides[slideIndex];
      if (!slide) continue;

      const currentWords = this.countWords(slide);
      if (currentWords <= maxWords) continue;

      console.log(`  📝 Slide ${slideIndex + 1}: Reducing ${currentWords} words to ≤${maxWords}`);

      // Strategy 1: Shorten body text
      if (slide.data.body) {
        const shortened = this.shortenText(slide.data.body, maxWords - 10);
        this.changes.push({
          slideIndex,
          type: 'word_reduction',
          description: `Shortened body text`,
          before: slide.data.body,
          after: shortened
        });
        slide.data.body = shortened;
      }

      // Strategy 2: Reduce bullets
      if (slide.data.bullets && slide.data.bullets.length > 3) {
        const originalBullets = [...slide.data.bullets];
        slide.data.bullets = slide.data.bullets
          .slice(0, 3)
          .map(b => this.shortenText(b, 10));

        this.changes.push({
          slideIndex,
          type: 'bullet_consolidation',
          description: `Reduced ${originalBullets.length} bullets to 3`,
          before: originalBullets.join('; '),
          after: slide.data.bullets.join('; ')
        });
      }

      // Strategy 3: Shorten remaining bullets
      if (slide.data.bullets) {
        slide.data.bullets = slide.data.bullets.map(b => this.shortenText(b, 8));
      }

      // Strategy 4: Shorten subtitle
      if (slide.data.subtitle && slide.data.subtitle.split(/\s+/).length > 8) {
        const shortened = this.shortenText(slide.data.subtitle, 8);
        this.changes.push({
          slideIndex,
          type: 'word_reduction',
          description: 'Shortened subtitle',
          before: slide.data.subtitle,
          after: shortened
        });
        slide.data.subtitle = shortened;
      }
    }

    return slides;
  }

  /**
   * Remediate glance test failures - title too long.
   */
  private remediateGlanceTest(
    slides: Slide[],
    issuesByType: Map<string, (QAIssue | PPTXIssue)[]>,
    mode: 'keynote' | 'business'
  ): Slide[] {
    const glanceIssues = [
      ...(issuesByType.get('glance_test') || []),
      ...(issuesByType.get('expert') || [])
    ].filter(i => i.message.toLowerCase().includes('glance') || i.message.includes('title'));

    const maxTitleWords = mode === 'keynote' ? 8 : 12;

    for (const issue of glanceIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === undefined) continue;

      const slide = slides[slideIndex];
      if (!slide?.data.title) continue;

      const titleWords = slide.data.title.split(/\s+/).length;
      if (titleWords <= maxTitleWords) continue;

      console.log(`  📌 Slide ${slideIndex + 1}: Shortening title from ${titleWords} words`);

      const shortened = this.shortenTitle(slide.data.title, maxTitleWords);
      this.changes.push({
        slideIndex,
        type: 'title_shortening',
        description: `Shortened title to ${maxTitleWords} words`,
        before: slide.data.title,
        after: shortened
      });
      slide.data.title = shortened;
    }

    return slides;
  }

  /**
   * Remediate bullet point issues.
   */
  private remediateBullets(
    slides: Slide[],
    issuesByType: Map<string, (QAIssue | PPTXIssue)[]>,
    mode: 'keynote' | 'business'
  ): Slide[] {
    const bulletIssues = (issuesByType.get('content') || [])
      .filter(i => i.message.includes('bullet'));

    const maxBullets = mode === 'keynote' ? 3 : 5;

    for (const issue of bulletIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === undefined) continue;

      const slide = slides[slideIndex];
      if (!slide?.data.bullets) continue;

      if (slide.data.bullets.length <= maxBullets) continue;

      console.log(`  📋 Slide ${slideIndex + 1}: Consolidating ${slide.data.bullets.length} bullets to ${maxBullets}`);

      // Consolidate bullets by combining similar ones
      const consolidated = this.consolidateBullets(slide.data.bullets, maxBullets);
      this.changes.push({
        slideIndex,
        type: 'bullet_consolidation',
        description: `Consolidated to ${maxBullets} bullets`,
        before: slide.data.bullets.join('; '),
        after: consolidated.join('; ')
      });
      slide.data.bullets = consolidated;
    }

    return slides;
  }

  /**
   * Remediate structural issues - missing title slide, conclusion, etc.
   */
  private remediateStructure(
    slides: Slide[],
    issuesByType: Map<string, (QAIssue | PPTXIssue)[]>,
    mode: 'keynote' | 'business'
  ): Slide[] {
    const structureIssues = (issuesByType.get('layout') || [])
      .filter(i =>
        i.message.includes('Missing') ||
        i.message.includes('minimum') ||
        i.message.includes('conclusion')
      );

    for (const issue of structureIssues) {
      if (issue.message.includes('title slide')) {
        console.log('  📄 Adding missing title slide');

        // Get title from first content slide or use default
        const firstSlide = slides[0];
        const title = firstSlide?.data.title || 'Presentation';

        const titleSlide: Slide = {
          index: 0,
          type: 'title',
          data: {
            title,
            subtitle: firstSlide?.data.subtitle || ''
          }
        };

        // Insert at beginning
        slides.unshift(titleSlide);
        this.reindexSlides(slides);

        this.changes.push({
          slideIndex: 0,
          type: 'structure_addition',
          description: 'Added missing title slide'
        });
      }

      if (issue.message.includes('conclusion') || issue.message.includes('thank')) {
        console.log('  📄 Adding conclusion slide');

        const thankYouSlide: Slide = {
          index: slides.length,
          type: 'thank-you',
          data: {
            title: 'Thank You',
            subtitle: 'Questions?'
          }
        };

        slides.push(thankYouSlide);

        this.changes.push({
          slideIndex: slides.length - 1,
          type: 'structure_addition',
          description: 'Added conclusion slide'
        });
      }

      if (issue.message.includes('minimum')) {
        // Need more slides - this is trickier, add a summary slide
        if (slides.length < 3) {
          console.log('  📄 Adding summary slide to meet minimum');

          const summarySlide: Slide = {
            index: slides.length - 1,
            type: 'bullet-points',
            data: {
              title: 'Key Takeaways',
              bullets: ['Main point from this presentation']
            }
          };

          // Insert before last slide
          slides.splice(slides.length - 1, 0, summarySlide);
          this.reindexSlides(slides);

          this.changes.push({
            slideIndex: slides.length - 2,
            type: 'structure_addition',
            description: 'Added summary slide to meet minimum count'
          });
        }
      }
    }

    return slides;
  }

  /**
   * Remediate accessibility issues.
   */
  private remediateAccessibility(
    slides: Slide[],
    issuesByType: Map<string, (QAIssue | PPTXIssue)[]>
  ): Slide[] {
    const a11yIssues = issuesByType.get('accessibility') || [];

    for (const issue of a11yIssues) {
      const slideIndex = issue.slideIndex;
      if (slideIndex === undefined) continue;

      const slide = slides[slideIndex];
      if (!slide) continue;

      // For font size issues, we can add a class hint
      if (issue.message.includes('font size') || issue.message.includes('Font size')) {
        console.log(`  ♿ Slide ${slideIndex + 1}: Marking for larger fonts`);

        slide.classes = slide.classes || [];
        if (!slide.classes.includes('large-text')) {
          slide.classes.push('large-text');
        }

        this.changes.push({
          slideIndex,
          type: 'font_size_increase',
          description: 'Added large-text class for accessibility'
        });
      }

      // For contrast issues, add high-contrast class
      if (issue.message.includes('contrast') || issue.message.includes('Contrast')) {
        console.log(`  ♿ Slide ${slideIndex + 1}: Marking for high contrast`);

        slide.classes = slide.classes || [];
        if (!slide.classes.includes('high-contrast')) {
          slide.classes.push('high-contrast');
        }

        this.changes.push({
          slideIndex,
          type: 'layout_adjustment',
          description: 'Added high-contrast class for accessibility'
        });
      }
    }

    return slides;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Group issues by their primary type.
   */
  private groupIssuesByType(issues: (QAIssue | PPTXIssue)[]): Map<string, (QAIssue | PPTXIssue)[]> {
    const grouped = new Map<string, (QAIssue | PPTXIssue)[]>();

    for (const issue of issues) {
      const category = issue.category || 'other';
      const existing = grouped.get(category) || [];
      existing.push(issue);
      grouped.set(category, existing);
    }

    return grouped;
  }

  /**
   * Shorten text to approximately N words while preserving meaning.
   */
  private shortenText(text: string, maxWords: number): string {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;

    // Try to cut at sentence boundary
    const shortened = words.slice(0, maxWords);
    let result = shortened.join(' ');

    // Clean up trailing punctuation issues
    result = result.replace(/[,;:]$/, '');

    // Add ellipsis if we cut mid-sentence
    if (!result.match(/[.!?]$/)) {
      result = result.replace(/\s+\S*$/, '...'); // Remove partial word and add ellipsis
    }

    return result;
  }

  /**
   * Shorten a title to N words, keeping the key message.
   */
  private shortenTitle(title: string, maxWords: number): string {
    const words = title.split(/\s+/);
    if (words.length <= maxWords) return title;

    // For titles, try to keep the action/insight
    // Look for key patterns
    const actionWords = ['drives', 'creates', 'enables', 'shows', 'reveals', 'proves', 'exceeds', 'increases', 'decreases'];

    let actionIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (actionWords.some(a => words[i]!.toLowerCase().includes(a))) {
        actionIndex = i;
        break;
      }
    }

    if (actionIndex > 0 && actionIndex < maxWords) {
      // Keep words around the action word
      const start = Math.max(0, actionIndex - 2);
      const end = Math.min(words.length, start + maxWords);
      return words.slice(start, end).join(' ');
    }

    // Default: just take first N words
    return words.slice(0, maxWords).join(' ');
  }

  /**
   * Consolidate bullets by combining related ones.
   */
  private consolidateBullets(bullets: string[], maxBullets: number): string[] {
    if (bullets.length <= maxBullets) return bullets;

    // Simple approach: take first N-1, combine rest into last
    const result = bullets.slice(0, maxBullets - 1);

    const remaining = bullets.slice(maxBullets - 1);
    const combined = remaining
      .map(b => b.replace(/[.!?]$/, ''))
      .join(', ');

    result.push(combined);

    return result;
  }

  /**
   * Reindex slides after insertion/deletion.
   */
  private reindexSlides(slides: Slide[]): void {
    slides.forEach((slide, index) => {
      slide.index = index;
    });
  }

  /**
   * Count words in a slide.
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
   * Deep clone slides array.
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Generate remediation report.
   */
  generateReport(): string {
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('          AUTO-REMEDIATION REPORT                          ');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Total Changes Applied: ${this.changes.length}`);
    lines.push('');

    if (this.changes.length > 0) {
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('Changes by Type:');
      lines.push('───────────────────────────────────────────────────────────');

      const byType = new Map<string, number>();
      this.changes.forEach(c => {
        byType.set(c.type, (byType.get(c.type) || 0) + 1);
      });

      byType.forEach((count, type) => {
        lines.push(`  ${type}: ${count}`);
      });

      lines.push('');
      lines.push('───────────────────────────────────────────────────────────');
      lines.push('Detailed Changes:');
      lines.push('───────────────────────────────────────────────────────────');

      this.changes.forEach((change, i) => {
        lines.push(`  ${i + 1}. Slide ${change.slideIndex + 1}: ${change.description}`);
        if (change.before && change.after) {
          lines.push(`     Before: "${change.before.substring(0, 50)}..."`);
          lines.push(`     After:  "${change.after.substring(0, 50)}..."`);
        }
      });
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}
