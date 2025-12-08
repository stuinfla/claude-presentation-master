/**
 * Hallucination Detector
 *
 * Verifies that all facts, statistics, and claims in the presentation
 * are sourced from the original content. ZERO TOLERANCE for hallucinations.
 *
 * Checks:
 * - Numbers and statistics must appear in source content
 * - Company names must be in source content
 * - Dates and timelines must be verifiable
 * - Quotes must be exact matches
 * - Claims must be supported by source material
 *
 * Philosophy: If it's not in the source, it shouldn't be in the presentation.
 */

import type { Slide, ContentAnalysis } from '../types/index.js';

export interface FactCheckResult {
  passed: boolean;
  score: number;
  totalFacts: number;
  verifiedFacts: number;
  unverifiedFacts: number;
  issues: FactCheckIssue[];
  warnings: FactCheckWarning[];
}

export interface FactCheckIssue {
  slideIndex: number;
  slideTitle: string;
  fact: string;
  type: 'number' | 'statistic' | 'company' | 'date' | 'quote' | 'claim';
  severity: 'error' | 'warning';
  message: string;
  suggestion: string;
}

export interface FactCheckWarning {
  slideIndex: number;
  message: string;
}

export class HallucinationDetector {
  // Patterns to extract facts from slides
  private numberPattern = /\$?[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|M|B|K|%|x))?/gi;
  private percentagePattern = /\d+(?:\.\d+)?%/g;
  private datePattern = /\b(?:19|20)\d{2}\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?/gi;
  private companyPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|LLC|Ltd|Co|Group|Holdings|Partners)\.?)?/g;
  private quotePattern = /"[^"]+"|'[^']+'/g;

  /**
   * Check all slides against source content for hallucinations.
   */
  async checkForHallucinations(
    slides: Slide[],
    sourceContent: string,
    analysis: ContentAnalysis
  ): Promise<FactCheckResult> {
    const issues: FactCheckIssue[] = [];
    const warnings: FactCheckWarning[] = [];
    let totalFacts = 0;
    let verifiedFacts = 0;

    // Normalize source content for comparison
    const normalizedSource = this.normalizeText(sourceContent);
    const sourceNumbers = this.extractNumbers(sourceContent);
    const sourceCompanies = this.extractCompanies(sourceContent);
    const sourceDates = this.extractDates(sourceContent);

    console.log(`🔍 Fact-checking ${slides.length} slides against source content...`);
    console.log(`   Source contains: ${sourceNumbers.length} numbers, ${sourceCompanies.length} companies, ${sourceDates.length} dates`);

    for (const slide of slides) {
      const slideText = this.getSlideText(slide);

      // Check numbers and statistics
      const slideNumbers = this.extractNumbers(slideText);
      for (const num of slideNumbers) {
        totalFacts++;
        if (this.isNumberInSource(num, sourceNumbers)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: num,
            type: num.includes('%') ? 'statistic' : 'number',
            severity: 'error',
            message: `Number "${num}" not found in source content`,
            suggestion: `Remove or replace with a number from the source material`
          });
        }
      }

      // Check percentages
      const slidePercentages = slideText.match(this.percentagePattern) || [];
      for (const pct of slidePercentages) {
        if (!sourceNumbers.some(n => n.includes(pct.replace('%', '')))) {
          // Already counted in numbers, just add a warning if not found
          if (!issues.some(i => i.fact === pct)) {
            warnings.push({
              slideIndex: slide.index,
              message: `Percentage "${pct}" may not be directly from source`
            });
          }
        }
      }

      // Check company names
      const slideCompanies = this.extractCompanies(slideText);
      for (const company of slideCompanies) {
        // Skip common words that look like company names
        if (this.isCommonWord(company)) continue;

        totalFacts++;
        if (this.isCompanyInSource(company, sourceCompanies, normalizedSource)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: company,
            type: 'company',
            severity: 'error',
            message: `Company/name "${company}" not found in source content`,
            suggestion: `Verify this name appears in the source or remove it`
          });
        }
      }

      // Check dates
      const slideDates = this.extractDates(slideText);
      for (const date of slideDates) {
        totalFacts++;
        if (this.isDateInSource(date, sourceDates, normalizedSource)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: date,
            type: 'date',
            severity: 'warning',
            message: `Date "${date}" not found in source content`,
            suggestion: `Verify this date is from the source or use a more general timeframe`
          });
        }
      }

      // Check quotes
      const slideQuotes = slideText.match(this.quotePattern) || [];
      for (const quote of slideQuotes) {
        totalFacts++;
        const cleanQuote = quote.replace(/["']/g, '').toLowerCase();
        if (normalizedSource.includes(cleanQuote)) {
          verifiedFacts++;
        } else {
          issues.push({
            slideIndex: slide.index,
            slideTitle: slide.data.title ?? `Slide ${slide.index + 1}`,
            fact: quote,
            type: 'quote',
            severity: 'error',
            message: `Quote not found in source content`,
            suggestion: `Use exact wording from source or paraphrase without quotes`
          });
        }
      }

      // Check for unsupported claims (heuristic)
      this.checkForUnsupportedClaims(slide, normalizedSource, issues, warnings);
    }

    // Calculate score
    const unverifiedFacts = totalFacts - verifiedFacts;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    let score = 100;

    // Deduct points for errors
    score -= errorCount * 10; // Heavy penalty for hallucinations
    score -= warnings.length * 2;

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Passed only if NO errors (warnings are acceptable)
    const passed = errorCount === 0;

    return {
      passed,
      score,
      totalFacts,
      verifiedFacts,
      unverifiedFacts,
      issues,
      warnings
    };
  }

  /**
   * Generate a fact-check report.
   */
  generateReport(result: FactCheckResult): string {
    const lines: string[] = [
      '',
      '═══════════════════════════════════════════════════════════',
      '📋 HALLUCINATION CHECK REPORT',
      '═══════════════════════════════════════════════════════════',
      '',
      `Status: ${result.passed ? '✅ PASSED - All facts verified' : '❌ FAILED - Unverified facts detected'}`,
      `Score: ${result.score}/100`,
      '',
      `Facts Checked: ${result.totalFacts}`,
      `  ✅ Verified: ${result.verifiedFacts}`,
      `  ❌ Unverified: ${result.unverifiedFacts}`,
      ''
    ];

    if (result.issues.length > 0) {
      lines.push('ISSUES (Must Fix):');
      for (const issue of result.issues) {
        lines.push(`  ❌ Slide ${issue.slideIndex + 1}: ${issue.type.toUpperCase()}`);
        lines.push(`     "${issue.fact}"`);
        lines.push(`     ${issue.message}`);
        lines.push(`     💡 ${issue.suggestion}`);
        lines.push('');
      }
    }

    if (result.warnings.length > 0) {
      lines.push('WARNINGS (Review):');
      for (const warning of result.warnings) {
        lines.push(`  ⚠️  Slide ${warning.slideIndex + 1}: ${warning.message}`);
      }
      lines.push('');
    }

    if (result.passed) {
      lines.push('✅ All facts in the presentation are sourced from the original content.');
      lines.push('   Zero hallucinations detected.');
    } else {
      lines.push('❌ HALLUCINATIONS DETECTED');
      lines.push('   The presentation contains facts not found in the source content.');
      lines.push('   These must be removed or replaced with verified information.');
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Auto-remediate hallucinations by removing unverified facts.
   */
  remediate(
    slides: Slide[],
    result: FactCheckResult
  ): Slide[] {
    const remediatedSlides = JSON.parse(JSON.stringify(slides)) as Slide[];

    for (const issue of result.issues) {
      if (issue.severity === 'error') {
        const slide = remediatedSlides.find(s => s.index === issue.slideIndex);
        if (slide) {
          // Replace the unverified fact with a placeholder
          const placeholder = this.getPlaceholder(issue.type);

          if (slide.data.title) {
            slide.data.title = slide.data.title.replace(issue.fact, placeholder);
          }
          if (slide.data.subtitle) {
            slide.data.subtitle = slide.data.subtitle.replace(issue.fact, placeholder);
          }
          if (slide.data.body) {
            slide.data.body = slide.data.body.replace(issue.fact, placeholder);
          }
          if (slide.data.bullets) {
            slide.data.bullets = slide.data.bullets.map(b =>
              b.replace(issue.fact, placeholder)
            );
          }

          console.log(`   🔧 Removed unverified ${issue.type}: "${issue.fact}"`);
        }
      }
    }

    return remediatedSlides;
  }

  // === Private Helper Methods ===

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getSlideText(slide: Slide): string {
    let text = '';
    if (slide.data.title) text += slide.data.title + ' ';
    if (slide.data.subtitle) text += slide.data.subtitle + ' ';
    if (slide.data.body) text += slide.data.body + ' ';
    if (slide.data.bullets) text += slide.data.bullets.join(' ') + ' ';
    if (slide.data.keyMessage) text += slide.data.keyMessage + ' ';
    return text;
  }

  private extractNumbers(text: string): string[] {
    const matches = text.match(this.numberPattern) || [];
    return matches.map(m => m.replace(/,/g, '').trim());
  }

  private extractCompanies(text: string): string[] {
    const matches = text.match(this.companyPattern) || [];
    return [...new Set(matches)]; // Deduplicate
  }

  private extractDates(text: string): string[] {
    const matches = text.match(this.datePattern) || [];
    return [...new Set(matches)];
  }

  private isNumberInSource(num: string, sourceNumbers: string[]): boolean {
    const cleanNum = num.replace(/[,$%xMBK]/gi, '').trim();

    // Check for exact match or close match
    for (const sourceNum of sourceNumbers) {
      const cleanSource = sourceNum.replace(/[,$%xMBK]/gi, '').trim();
      if (cleanNum === cleanSource) return true;

      // Check if numbers are close (within 1%)
      const numValue = parseFloat(cleanNum);
      const sourceValue = parseFloat(cleanSource);
      if (!isNaN(numValue) && !isNaN(sourceValue)) {
        const diff = Math.abs(numValue - sourceValue) / Math.max(numValue, sourceValue);
        if (diff < 0.01) return true; // Within 1%
      }
    }

    return false;
  }

  private isCompanyInSource(company: string, sourceCompanies: string[], normalizedSource: string): boolean {
    const cleanCompany = company.toLowerCase().trim();

    // Check exact match in companies
    if (sourceCompanies.some(c => c.toLowerCase() === cleanCompany)) return true;

    // Check if mentioned anywhere in source
    if (normalizedSource.includes(cleanCompany)) return true;

    // Check partial match (e.g., "Acme" matches "Acme Corp")
    for (const sourceCompany of sourceCompanies) {
      if (sourceCompany.toLowerCase().includes(cleanCompany) ||
          cleanCompany.includes(sourceCompany.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  private isDateInSource(date: string, sourceDates: string[], normalizedSource: string): boolean {
    const cleanDate = date.toLowerCase().trim();

    // Check exact match
    if (sourceDates.some(d => d.toLowerCase() === cleanDate)) return true;

    // Check if year is mentioned
    const yearMatch = date.match(/\b(19|20)\d{2}\b/);
    if (yearMatch && normalizedSource.includes(yearMatch[0])) return true;

    return false;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'The', 'This', 'That', 'These', 'Those', 'What', 'How', 'Why', 'When', 'Where',
      'Our', 'Your', 'Their', 'Key', 'Main', 'Next', 'Last', 'First', 'Second', 'Third',
      'Start', 'End', 'Begin', 'Stop', 'New', 'Old', 'Good', 'Bad', 'Best', 'Worst',
      'More', 'Less', 'Most', 'Least', 'All', 'None', 'Some', 'Any', 'Each', 'Every',
      'Today', 'Tomorrow', 'Yesterday', 'Now', 'Then', 'Here', 'There', 'Summary',
      'Overview', 'Introduction', 'Conclusion', 'Recommendation', 'Action', 'Plan',
      'Strategy', 'Approach', 'Method', 'Process', 'Step', 'Phase', 'Stage'
    ];
    return commonWords.includes(word);
  }

  private checkForUnsupportedClaims(
    slide: Slide,
    normalizedSource: string,
    issues: FactCheckIssue[],
    warnings: FactCheckWarning[]
  ): void {
    const slideText = this.getSlideText(slide);

    // Check for strong claims that need verification
    const claimIndicators = [
      /\bwill\s+(increase|decrease|grow|shrink|improve|reduce)/gi,
      /\bguaranteed?\b/gi,
      /\b(proven|verified|confirmed)\s+to\b/gi,
      /\b(always|never|every|none)\b/gi,
      /\b(best|worst|leading|largest|smallest|first|only)\b/gi
    ];

    for (const pattern of claimIndicators) {
      const matches = slideText.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Check if this claim language appears in source
          const cleanMatch = match.toLowerCase().trim();
          if (!normalizedSource.includes(cleanMatch)) {
            warnings.push({
              slideIndex: slide.index,
              message: `Strong claim "${match}" may need source verification`
            });
          }
        }
      }
    }
  }

  private getPlaceholder(type: string): string {
    switch (type) {
      case 'number':
      case 'statistic':
        return '[NUMBER FROM SOURCE]';
      case 'company':
        return '[COMPANY NAME]';
      case 'date':
        return '[DATE]';
      case 'quote':
        return '[QUOTE FROM SOURCE]';
      case 'claim':
        return '[VERIFIED CLAIM]';
      default:
        return '[VERIFY]';
    }
  }
}
