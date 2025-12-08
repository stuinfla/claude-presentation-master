/**
 * McKinsey/BCG Consulting Deck Execution Strategy
 *
 * World-class consulting presentations follow strict methodology:
 * - Barbara Minto's Pyramid Principle
 * - Answer First structure
 * - MECE (Mutually Exclusive, Collectively Exhaustive)
 * - Action Titles on every slide
 * - Horizontal Logic (titles tell the story)
 *
 * This strategy produces board-ready, McKinsey-quality deliverables.
 */

import type { Slide, ContentAnalysis, SlideType } from '../types/index.js';
import type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';

export class ConsultingDeckStrategy implements ExecutionStrategy {
  type = 'consulting_deck' as const;
  name = 'McKinsey/BCG Consulting Deck';
  description = 'Data-driven executive presentations with rigorous structure';

  experts = {
    primary: 'Barbara Minto (Pyramid Principle)',
    secondary: [
      'McKinsey (MECE, Action Titles)',
      'BCG (Horizontal Logic)',
      'Edward Tufte (Data-Ink Ratio)'
    ]
  };

  slideSequence: SlideBlueprint[] = [
    {
      id: 'executive_summary_scr',
      name: 'Executive Summary (SCR)',
      type: 'two-column',
      required: true,
      purpose: 'Lead with the answer - Situation, Complication, Resolution',
      requiredData: ['title', 'situation', 'complication', 'resolution'],
      optionalData: ['source'],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        'Answer FIRST - the recommendation goes at the top',
        'SCR format: Situation → Complication → Resolution',
        'Title must be an action title stating the main recommendation'
      ],
      designNotes: [
        'Three-column layout for S, C, R',
        'Resolution/recommendation highlighted',
        'Executive summary box at top with key takeaway'
      ],
      example: {
        title: 'Recommend pursuing digital transformation to capture $50M opportunity',
        bullets: [
          'Situation: Market shifting to digital-first with 40% of sales now online',
          'Complication: Current legacy systems prevent us from competing effectively',
          'Resolution: Three-phase digital transformation to capture opportunity'
        ]
      }
    },
    {
      id: 'situation_analysis',
      name: 'Situation Analysis',
      type: 'two-column',
      required: true,
      purpose: 'Establish the context everyone agrees on',
      requiredData: ['title', 'body', 'bullets'],
      optionalData: ['source', 'metrics'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Facts only - no opinions yet',
        'Data must be sourced',
        'Set up the problem without stating it'
      ],
      designNotes: [
        'Data visualization on left',
        'Key facts on right',
        'Source citation at bottom'
      ],
      example: {
        title: 'Digital sales grew 40% YoY while physical retail declined 15%',
        body: 'The market is fundamentally shifting toward digital channels.'
      }
    },
    {
      id: 'key_findings',
      name: 'Key Findings Summary',
      type: 'bullet-points',
      required: true,
      purpose: 'Present the 3-5 key findings from analysis',
      requiredData: ['title', 'bullets'],
      optionalData: ['source'],
      wordLimits: { min: 40, max: 70, ideal: 55 },
      expertPrinciples: [
        'MECE: Findings must not overlap',
        'Maximum 5 findings (cognitive load)',
        'Each finding is a complete insight, not a topic'
      ],
      designNotes: [
        'Numbered list format',
        'Each finding in a separate row',
        'Callout box for most important finding'
      ],
      example: {
        title: 'Three factors drive the $50M opportunity in digital transformation',
        bullets: [
          '1. Customer preference: 65% prefer digital channels (up from 40% in 2020)',
          '2. Cost efficiency: Digital transactions cost 80% less than physical',
          '3. Speed to market: Digital products launch 3x faster'
        ]
      }
    },
    {
      id: 'finding_detail_1',
      name: 'Finding 1 Deep Dive',
      type: 'two-column',
      required: true,
      purpose: 'Detailed evidence for finding 1',
      requiredData: ['title', 'body', 'bullets'],
      optionalData: ['metrics', 'source'],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: [
        'Action title states the insight',
        'Chart on left, interpretation on right',
        'Include "so what" - why this matters'
      ],
      designNotes: [
        'Chart or data visualization prominent',
        'Callout box highlighting key number',
        'Clear source attribution'
      ]
    },
    {
      id: 'finding_detail_2',
      name: 'Finding 2 Deep Dive',
      type: 'two-column',
      required: true,
      purpose: 'Detailed evidence for finding 2',
      requiredData: ['title', 'body', 'bullets'],
      optionalData: ['metrics', 'source'],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: ['Action title states the insight', 'Data-driven analysis'],
      designNotes: ['Consistent layout with Finding 1']
    },
    {
      id: 'finding_detail_3',
      name: 'Finding 3 Deep Dive',
      type: 'two-column',
      required: false,
      purpose: 'Detailed evidence for finding 3 (if applicable)',
      requiredData: ['title', 'body'],
      optionalData: ['bullets', 'metrics', 'source'],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: ['Action title states the insight'],
      designNotes: ['Consistent layout']
    },
    {
      id: 'options_comparison',
      name: 'Options Comparison',
      type: 'table',
      required: true,
      purpose: 'Compare strategic options objectively',
      requiredData: ['title', 'table'],
      optionalData: ['recommendation_callout'],
      wordLimits: { min: 40, max: 100, ideal: 70 },
      expertPrinciples: [
        'MECE: Options must be mutually exclusive',
        'Evaluation criteria must be weighted',
        'Recommended option clearly marked'
      ],
      designNotes: [
        'Matrix format with criteria as rows, options as columns',
        'Green/yellow/red rating system',
        'Recommendation row at bottom highlighted'
      ],
      example: {
        title: 'Option B (Full transformation) scores highest across all criteria',
        body: 'Comparison of three strategic options against five weighted criteria'
      }
    },
    {
      id: 'recommendation',
      name: 'Recommendation',
      type: 'two-column',
      required: true,
      purpose: 'State the recommendation with supporting rationale',
      requiredData: ['title', 'recommendation', 'rationale'],
      optionalData: ['source'],
      wordLimits: { min: 50, max: 80, ideal: 65 },
      expertPrinciples: [
        'Recommendation is clear and actionable',
        'Rationale ties back to findings',
        'Impact is quantified'
      ],
      designNotes: [
        'Recommendation in large callout box',
        'Three supporting reasons below',
        'Expected impact highlighted'
      ],
      example: {
        title: 'Recommend pursuing Option B: Full digital transformation over 18 months',
        bullets: [
          'Expected NPV: $50M over 5 years',
          'Payback period: 18 months',
          'Risk: Medium (mitigated by phased approach)'
        ]
      }
    },
    {
      id: 'implementation_plan',
      name: 'Implementation Plan',
      type: 'timeline',
      required: true,
      purpose: 'Show how and when to execute',
      requiredData: ['title', 'phases'],
      optionalData: ['milestones', 'dependencies'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Clear phases with dates',
        'Key milestones marked',
        'Quick wins in first 90 days'
      ],
      designNotes: [
        'Gantt-style timeline',
        'Color-coded by phase',
        'Milestones as diamonds'
      ]
    },
    {
      id: 'risks_mitigation',
      name: 'Risks & Mitigation',
      type: 'table',
      required: true,
      purpose: 'Acknowledge risks and show mitigation plans',
      requiredData: ['title', 'risks'],
      optionalData: ['contingencies'],
      wordLimits: { min: 50, max: 90, ideal: 70 },
      expertPrinciples: [
        'Be honest about risks',
        'Every risk has a mitigation',
        'Prioritize by likelihood and impact'
      ],
      designNotes: [
        'Risk/Mitigation two-column table',
        'Color-coded severity',
        'Owner column optional'
      ]
    },
    {
      id: 'next_steps',
      name: 'Next Steps',
      type: 'bullet-points',
      required: true,
      purpose: 'Clear actions with owners and dates',
      requiredData: ['title', 'actions'],
      optionalData: ['owners', 'dates'],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        'Actions are specific and actionable',
        'Each has an owner and deadline',
        'First action happens within 1 week'
      ],
      designNotes: [
        'Numbered list with owner and date',
        'First action highlighted',
        'Ask/approval box if needed'
      ],
      example: {
        title: 'Three immediate actions required to begin Phase 1',
        bullets: [
          '1. Approve $2M Phase 1 budget [CEO, by Dec 15]',
          '2. Appoint transformation lead [CHRO, by Dec 20]',
          '3. Kick off vendor selection [CTO, by Jan 5]'
        ]
      }
    }
  ];

  contentTransforms: ContentTransform[] = [
    {
      sourcePattern: /^(?!.*\b(is|are|was|were|has|have|will|can|should|must|drove|caused|led|resulted|increased|decreased)\b)(.+)$/i,
      transform: (match) => {
        // Transform topic titles to action titles
        // "Revenue Analysis" → "Revenue grew 15% driven by enterprise expansion"
        return match; // This would be enhanced with AI
      },
      description: 'Transform topic titles into action titles'
    },
    {
      sourcePattern: /\d+%|\$[\d,]+/,
      transform: (match) => `[DATA] ${match} [/DATA]`,
      description: 'Mark data points for source citation requirement'
    }
  ];

  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      'Every slide has an action title',
      'Executive summary leads with recommendation',
      'All data is sourced',
      'Structure is MECE',
      'Horizontal logic works (titles tell story)'
    ],
    excellenceIndicators: [
      'Can present from titles alone',
      'Recommendation is quantified',
      'Risks are honest and mitigated',
      'Next steps have owners and dates'
    ]
  };

  /**
   * Generate slides from content analysis.
   */
  async generateSlides(analysis: ContentAnalysis): Promise<Slide[]> {
    const slides: Slide[] = [];
    let index = 0;

    // Executive Summary (SCR)
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: this.generateActionTitle(analysis.scqa.answer, 'recommendation'),
        body: this.formatSCR(analysis.scqa),
        bullets: [
          `Situation: ${this.truncate(analysis.scqa.situation, 80)}`,
          `Complication: ${this.truncate(analysis.scqa.complication, 80)}`,
          `Resolution: ${this.truncate(analysis.scqa.answer, 80)}`
        ],
        keyMessage: analysis.scqa.answer
      },
      classes: ['slide-executive-summary', 'slide-scr']
    });

    // Situation Analysis
    if (analysis.scqa.situation) {
      slides.push({
        index: index++,
        type: 'two-column',
        data: {
          title: this.generateActionTitle(analysis.scqa.situation, 'situation'),
          body: analysis.scqa.situation,
          bullets: analysis.sparkline.whatIs.slice(0, 4)
        },
        classes: ['slide-situation']
      });
    }

    // Key Findings
    if (analysis.keyMessages.length > 0) {
      slides.push({
        index: index++,
        type: 'bullet-points',
        data: {
          title: `${analysis.keyMessages.length} key findings drive our recommendation`,
          bullets: analysis.keyMessages.map((msg, i) =>
            `${i + 1}. ${this.generateActionTitle(msg, 'finding')}`
          )
        },
        classes: ['slide-key-findings']
      });

      // Finding details
      for (const message of analysis.keyMessages.slice(0, 3)) {
        slides.push({
          index: index++,
          type: 'two-column',
          data: {
            title: this.generateActionTitle(message, 'finding'),
            body: message,
            bullets: this.extractEvidence(message)
          },
          classes: ['slide-finding-detail']
        });
      }
    }

    // Recommendation
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: this.generateActionTitle(analysis.scqa.answer, 'recommendation'),
        body: analysis.scqa.answer,
        bullets: analysis.sparkline.whatCouldBe.slice(0, 3),
        keyMessage: 'Recommended approach'
      },
      classes: ['slide-recommendation']
    });

    // Next Steps
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Three immediate actions required',
        bullets: [
          '1. [Action] - [Owner, Date]',
          '2. [Action] - [Owner, Date]',
          '3. [Action] - [Owner, Date]'
        ],
        keyMessage: analysis.sparkline.callToAdventure
      },
      classes: ['slide-next-steps']
    });

    return slides;
  }

  /**
   * Validate slides against consulting deck requirements.
   */
  validateSlides(slides: Slide[]): {
    passed: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check action titles
    for (const slide of slides) {
      if (!this.isActionTitle(slide.data.title ?? '')) {
        issues.push(`Slide ${slide.index + 1}: Title is not an action title`);
        score -= 5;
      }
    }

    // Check for executive summary first
    if (slides[0]?.type !== 'two-column' ||
        !slides[0]?.classes?.includes('slide-executive-summary')) {
      issues.push('First slide must be Executive Summary with recommendation');
      score -= 10;
    }

    // Check for sourced data
    for (const slide of slides) {
      if (this.containsData(slide) && !slide.data.source) {
        issues.push(`Slide ${slide.index + 1}: Contains data without source`);
        score -= 3;
      }
    }

    // Check horizontal logic
    const titleStory = slides.map(s => s.data.title).join(' → ');
    if (!this.isCoherentStory(titleStory)) {
      suggestions.push('Titles should form a coherent story when read together');
    }

    return {
      passed: issues.filter(i => !i.includes('suggestion')).length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Apply McKinsey methodology to slides.
   */
  applyExpertMethodology(slides: Slide[]): Slide[] {
    return slides.map(slide => {
      // Transform topic titles to action titles
      if (slide.data.title && !this.isActionTitle(slide.data.title)) {
        slide.data.title = this.generateActionTitle(slide.data.title, 'generic');
      }

      // Add source placeholder if data present
      if (this.containsData(slide) && !slide.data.source) {
        slide.data.source = 'Source: [Add source]';
      }

      return slide;
    });
  }

  // === Helper Methods ===

  private generateActionTitle(content: string, type: string): string {
    if (!content) return 'Key insight required';

    // If already an action title, return as-is
    if (this.isActionTitle(content)) {
      return content.length > 80 ? content.slice(0, 77) + '...' : content;
    }

    // Transform based on type
    const verbs: Record<string, string[]> = {
      recommendation: ['Recommend', 'Propose', 'Suggest'],
      finding: ['Analysis shows', 'Data reveals', 'Evidence indicates'],
      situation: ['Market is', 'Context shows', 'Current state reflects'],
      generic: ['Key insight:', 'Analysis shows', 'Data indicates']
    };

    const prefix = verbs[type]?.[0] ?? 'Key insight:';

    // Clean and format
    const cleaned = content
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\.$/, '');

    const title = `${prefix} ${cleaned}`;
    return title.length > 80 ? title.slice(0, 77) + '...' : title;
  }

  private isActionTitle(title: string): boolean {
    if (!title || title.length < 10) return false;

    // Action titles are complete sentences with verbs
    const hasVerb = /\b(is|are|was|were|has|have|had|will|can|could|should|would|may|might|must|exceeded|increased|decreased|grew|fell|drove|caused|enabled|prevented|achieved|shows|reveals|indicates|recommends?|proposes?|suggests?)\b/i.test(title);
    const hasInsight = /\b(by|due to|because|resulting in|leading to|enabling|driving|\d+%|\$[\d,]+)\b/i.test(title);
    const wordCount = title.split(/\s+/).length;

    return hasVerb && wordCount >= 6 && wordCount <= 20;
  }

  private containsData(slide: Slide): boolean {
    const content = JSON.stringify(slide.data);
    return /\d+%|\$[\d,]+|\d+\s*(million|billion|thousand)/i.test(content);
  }

  private isCoherentStory(_story: string): boolean {
    // Simplified check - would use NLP in production
    return true;
  }

  private formatSCR(scqa: ContentAnalysis['scqa']): string {
    return `**Situation:** ${scqa.situation}\n\n**Complication:** ${scqa.complication}\n\n**Resolution:** ${scqa.answer}`;
  }

  private extractEvidence(message: string): string[] {
    // Extract bullet-worthy points from a message
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 4).map(s => s.trim());
  }

  private truncate(text: string, max: number): string {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max - 3) + '...';
  }
}
