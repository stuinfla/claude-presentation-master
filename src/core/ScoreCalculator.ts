/**
 * Score Calculator - QA Score Computation
 *
 * Calculates presentation quality scores based on:
 * - Visual quality (35%)
 * - Content quality (30%)
 * - Expert methodology compliance (25%)
 * - Accessibility (10%)
 */

import type { QAResults, QAIssue } from '../types/index.js';

interface ScoreWeights {
  visual: number;
  content: number;
  expert: number;
  accessibility: number;
}

interface ScoreBreakdown {
  visual: number;
  content: number;
  expert: number;
  accessibility: number;
  total: number;
  penalties: number;
  details: ScoreDetail[];
}

interface ScoreDetail {
  category: string;
  check: string;
  score: number;
  maxScore: number;
  notes?: string;
}

export class ScoreCalculator {
  private readonly weights: ScoreWeights = {
    visual: 35,
    content: 30,
    expert: 25,
    accessibility: 10
  };

  /**
   * Calculate overall QA score from results.
   */
  calculate(results: QAResults): number {
    const breakdown = this.getBreakdown(results);
    return Math.round(breakdown.total);
  }

  /**
   * Get detailed score breakdown.
   */
  getBreakdown(results: QAResults): ScoreBreakdown {
    const details: ScoreDetail[] = [];

    // Calculate visual score
    const visualScore = this.calculateVisualScore(results.visual, details);

    // Calculate content score
    const contentScore = this.calculateContentScore(results.content, details);

    // Calculate expert score
    const expertScore = this.calculateExpertScore(results.expert, details);

    // Calculate accessibility score
    const accessibilityScore = this.calculateAccessibilityScore(results.accessibility, details);

    // Apply penalties for issues
    const penalties = this.calculatePenalties(results.issues);

    // Weighted total
    const rawTotal = (
      visualScore * (this.weights.visual / 100) +
      contentScore * (this.weights.content / 100) +
      expertScore * (this.weights.expert / 100) +
      accessibilityScore * (this.weights.accessibility / 100)
    );

    const total = Math.max(0, rawTotal - penalties);

    return {
      visual: visualScore,
      content: contentScore,
      expert: expertScore,
      accessibility: accessibilityScore,
      total,
      penalties,
      details
    };
  }

  /**
   * Calculate visual quality score.
   */
  private calculateVisualScore(
    visual: QAResults['visual'],
    details: ScoreDetail[]
  ): number {
    let score = 0;
    const maxScore = 100;

    // Whitespace (25 points)
    const whitespaceTarget = 35; // 35% minimum for keynote
    const whitespaceScore = Math.min(25, (visual.whitespacePercentage / whitespaceTarget) * 25);
    details.push({
      category: 'visual',
      check: 'whitespace',
      score: whitespaceScore,
      maxScore: 25,
      notes: `${visual.whitespacePercentage.toFixed(1)}% whitespace (target: ${whitespaceTarget}%+)`
    });
    score += whitespaceScore;

    // Layout balance (25 points)
    const balanceScore = visual.layoutBalance * 25;
    details.push({
      category: 'visual',
      check: 'layout_balance',
      score: balanceScore,
      maxScore: 25,
      notes: `Balance score: ${(visual.layoutBalance * 100).toFixed(0)}%`
    });
    score += balanceScore;

    // Contrast (25 points)
    const contrastTarget = 4.5;
    const contrastScore = Math.min(25, (visual.contrastRatio / contrastTarget) * 25);
    details.push({
      category: 'visual',
      check: 'contrast',
      score: contrastScore,
      maxScore: 25,
      notes: `Contrast ratio: ${visual.contrastRatio.toFixed(2)} (target: ${contrastTarget}+)`
    });
    score += contrastScore;

    // Font consistency (15 points)
    const fontScore = visual.fontFamilies <= 2 ? 15 : Math.max(0, 15 - (visual.fontFamilies - 2) * 5);
    details.push({
      category: 'visual',
      check: 'font_families',
      score: fontScore,
      maxScore: 15,
      notes: `${visual.fontFamilies} font families (max: 2)`
    });
    score += fontScore;

    // Color restraint (10 points)
    const colorScore = visual.colorCount <= 5 ? 10 : Math.max(0, 10 - (visual.colorCount - 5) * 2);
    details.push({
      category: 'visual',
      check: 'color_count',
      score: colorScore,
      maxScore: 10,
      notes: `${visual.colorCount} colors used (recommended: ≤5)`
    });
    score += colorScore;

    return Math.min(100, (score / maxScore) * 100);
  }

  /**
   * Calculate content quality score.
   */
  private calculateContentScore(
    content: QAResults['content'],
    details: ScoreDetail[]
  ): number {
    let score = 0;
    const maxScore = 100;

    // Word count compliance (30 points)
    const withinLimitCount = content.perSlide.filter(s => s.withinLimit).length;
    const totalSlides = content.perSlide.length;
    const wordCountScore = totalSlides > 0 ? (withinLimitCount / totalSlides) * 30 : 30;
    details.push({
      category: 'content',
      check: 'word_count',
      score: wordCountScore,
      maxScore: 30,
      notes: `${withinLimitCount}/${totalSlides} slides within word limit`
    });
    score += wordCountScore;

    // Action titles (20 points)
    const actionTitleCount = content.perSlide.filter(s => s.hasActionTitle).length;
    const actionTitleScore = totalSlides > 0 ? (actionTitleCount / totalSlides) * 20 : 20;
    details.push({
      category: 'content',
      check: 'action_titles',
      score: actionTitleScore,
      maxScore: 20,
      notes: `${actionTitleCount}/${totalSlides} slides have action titles`
    });
    score += actionTitleScore;

    // Glance test (20 points)
    const glancePassCount = content.glanceTest.filter(g => g.passed).length;
    const glanceTotal = content.glanceTest.length;
    const glanceScore = glanceTotal > 0 ? (glancePassCount / glanceTotal) * 20 : 20;
    details.push({
      category: 'content',
      check: 'glance_test',
      score: glanceScore,
      maxScore: 20,
      notes: `${glancePassCount}/${glanceTotal} slides pass 3-second glance test`
    });
    score += glanceScore;

    // Signal-to-noise ratio (15 points)
    const snrPassCount = content.signalNoise.filter(s => s.passed).length;
    const snrTotal = content.signalNoise.length;
    const snrScore = snrTotal > 0 ? (snrPassCount / snrTotal) * 15 : 15;
    details.push({
      category: 'content',
      check: 'signal_noise',
      score: snrScore,
      maxScore: 15,
      notes: `${snrPassCount}/${snrTotal} slides have good signal-to-noise ratio`
    });
    score += snrScore;

    // One idea per slide (15 points)
    const oneIdeaPassCount = content.oneIdea.filter(o => o.passed).length;
    const oneIdeaTotal = content.oneIdea.length;
    const oneIdeaScore = oneIdeaTotal > 0 ? (oneIdeaPassCount / oneIdeaTotal) * 15 : 15;
    details.push({
      category: 'content',
      check: 'one_idea',
      score: oneIdeaScore,
      maxScore: 15,
      notes: `${oneIdeaPassCount}/${oneIdeaTotal} slides focus on one idea`
    });
    score += oneIdeaScore;

    return Math.min(100, (score / maxScore) * 100);
  }

  /**
   * Calculate expert methodology compliance score.
   */
  private calculateExpertScore(
    expert: QAResults['expert'],
    details: ScoreDetail[]
  ): number {
    let score = 0;
    const maxScore = 100;

    // Duarte (30 points)
    const duarteScore = expert.duarte.score * 0.3;
    details.push({
      category: 'expert',
      check: 'duarte',
      score: duarteScore,
      maxScore: 30,
      notes: `Nancy Duarte principles: ${expert.duarte.score}/100`
    });
    score += duarteScore;

    // Reynolds (25 points)
    const reynoldsScore = expert.reynolds.score * 0.25;
    details.push({
      category: 'expert',
      check: 'reynolds',
      score: reynoldsScore,
      maxScore: 25,
      notes: `Garr Reynolds principles: ${expert.reynolds.score}/100`
    });
    score += reynoldsScore;

    // Gallo (25 points)
    const galloScore = expert.gallo.score * 0.25;
    details.push({
      category: 'expert',
      check: 'gallo',
      score: galloScore,
      maxScore: 25,
      notes: `Carmine Gallo principles: ${expert.gallo.score}/100`
    });
    score += galloScore;

    // Anderson (20 points)
    const andersonScore = expert.anderson.score * 0.2;
    details.push({
      category: 'expert',
      check: 'anderson',
      score: andersonScore,
      maxScore: 20,
      notes: `Chris Anderson principles: ${expert.anderson.score}/100`
    });
    score += andersonScore;

    return Math.min(100, (score / maxScore) * 100);
  }

  /**
   * Calculate accessibility compliance score.
   */
  private calculateAccessibilityScore(
    accessibility: QAResults['accessibility'],
    details: ScoreDetail[]
  ): number {
    let score = 0;
    const maxScore = 100;

    // WCAG level (40 points)
    const wcagScores: Record<string, number> = {
      'AAA': 40,
      'AA': 35,
      'A': 25,
      'FAIL': 0
    };
    const wcagScore = wcagScores[accessibility.wcagLevel] ?? 0;
    details.push({
      category: 'accessibility',
      check: 'wcag_level',
      score: wcagScore,
      maxScore: 40,
      notes: `WCAG ${accessibility.wcagLevel} compliance`
    });
    score += wcagScore;

    // Contrast issues (25 points)
    const contrastPenalty = Math.min(25, accessibility.contrastIssues.length * 5);
    const contrastScore = 25 - contrastPenalty;
    details.push({
      category: 'accessibility',
      check: 'contrast_issues',
      score: contrastScore,
      maxScore: 25,
      notes: `${accessibility.contrastIssues.length} contrast issues found`
    });
    score += contrastScore;

    // Font size issues (20 points)
    const fontPenalty = Math.min(20, accessibility.fontSizeIssues.length * 5);
    const fontScore = 20 - fontPenalty;
    details.push({
      category: 'accessibility',
      check: 'font_size_issues',
      score: fontScore,
      maxScore: 20,
      notes: `${accessibility.fontSizeIssues.length} font size issues found`
    });
    score += fontScore;

    // Color blind safe (15 points)
    const colorBlindScore = accessibility.colorBlindSafe ? 15 : 0;
    details.push({
      category: 'accessibility',
      check: 'color_blind_safe',
      score: colorBlindScore,
      maxScore: 15,
      notes: accessibility.colorBlindSafe ? 'Color blind safe' : 'Potential color blind issues'
    });
    score += colorBlindScore;

    return Math.min(100, (score / maxScore) * 100);
  }

  /**
   * Calculate penalties from issues.
   */
  private calculatePenalties(issues: QAIssue[]): number {
    let penalty = 0;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          penalty += 5;
          break;
        case 'warning':
          penalty += 2;
          break;
        case 'info':
          penalty += 0.5;
          break;
      }
    }

    // Cap penalties at 30 points
    return Math.min(30, penalty);
  }

  /**
   * Get human-readable grade from score.
   */
  getGrade(score: number): string {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }

  /**
   * Get pass/fail status.
   */
  isPassing(score: number, threshold = 95): boolean {
    return score >= threshold;
  }

  /**
   * Format score for display.
   */
  formatScore(score: number): string {
    return `${Math.round(score)}/100 (${this.getGrade(score)})`;
  }

  /**
   * Generate summary report.
   */
  generateReport(results: QAResults): string {
    const breakdown = this.getBreakdown(results);
    const lines: string[] = [];

    lines.push('═══════════════════════════════════════════');
    lines.push('          PRESENTATION QA REPORT           ');
    lines.push('═══════════════════════════════════════════');
    lines.push('');
    lines.push(`Overall Score: ${this.formatScore(breakdown.total)}`);
    lines.push(`Status: ${this.isPassing(breakdown.total) ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');
    lines.push('─────────────────────────────────────────');
    lines.push('Category Breakdown:');
    lines.push('─────────────────────────────────────────');
    lines.push(`  Visual Quality:    ${breakdown.visual.toFixed(1)}/100 (weight: 35%)`);
    lines.push(`  Content Quality:   ${breakdown.content.toFixed(1)}/100 (weight: 30%)`);
    lines.push(`  Expert Compliance: ${breakdown.expert.toFixed(1)}/100 (weight: 25%)`);
    lines.push(`  Accessibility:     ${breakdown.accessibility.toFixed(1)}/100 (weight: 10%)`);
    lines.push('');

    if (breakdown.penalties > 0) {
      lines.push(`  Penalties Applied: -${breakdown.penalties.toFixed(1)} points`);
      lines.push('');
    }

    // Issues summary
    const errors = results.issues.filter(i => i.severity === 'error');
    const warnings = results.issues.filter(i => i.severity === 'warning');

    if (errors.length > 0 || warnings.length > 0) {
      lines.push('─────────────────────────────────────────');
      lines.push('Issues Found:');
      lines.push('─────────────────────────────────────────');

      if (errors.length > 0) {
        lines.push(`  ❌ Errors: ${errors.length}`);
        for (const error of errors.slice(0, 5)) {
          lines.push(`     • ${error.message}`);
        }
        if (errors.length > 5) {
          lines.push(`     ... and ${errors.length - 5} more`);
        }
      }

      if (warnings.length > 0) {
        lines.push(`  ⚠️  Warnings: ${warnings.length}`);
        for (const warning of warnings.slice(0, 5)) {
          lines.push(`     • ${warning.message}`);
        }
        if (warnings.length > 5) {
          lines.push(`     ... and ${warnings.length - 5} more`);
        }
      }
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════');

    return lines.join('\n');
  }
}
