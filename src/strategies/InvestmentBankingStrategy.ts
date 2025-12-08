/**
 * Investment Banking Pitch Book Execution Strategy
 *
 * World-class IB presentations follow strict Wall Street standards:
 * - Analyst Academy / Wall Street Prep methodology
 * - Multiple valuation methodologies (DCF, Comps, Precedents)
 * - Football field visualization
 * - Bank credentials and tombstones
 * - Sources & Uses, Pro Forma analysis
 *
 * Design Standards:
 * - Garamond or Times New Roman font
 * - Navy blue and grayscale color scheme
 * - Precise numerical formatting
 * - Every number sourced
 * - Professional footer with page numbers
 *
 * This strategy produces Goldman/Morgan Stanley quality pitch books.
 */

import type { Slide, ContentAnalysis } from '../types/index.js';
import type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';

export class InvestmentBankingStrategy implements ExecutionStrategy {
  type = 'investment_banking' as const;
  name = 'Investment Banking Pitch Book';
  description = 'Wall Street quality pitch books with rigorous valuation analysis';

  experts = {
    primary: 'Analyst Academy / Wall Street Prep',
    secondary: [
      'Mergers & Inquisitions (Brian DeChesare)',
      'Breaking Into Wall Street',
      'Street of Walls'
    ]
  };

  // IB Design Standards
  designStandards = {
    fonts: {
      primary: 'Garamond',
      fallback: 'Times New Roman',
      sizes: {
        title: 14,
        subtitle: 12,
        body: 10,
        footnote: 8,
        tableHeader: 9,
        tableBody: 8
      }
    },
    colors: {
      primary: '#1a365d',      // Navy blue
      secondary: '#2d4a6f',    // Lighter navy
      accent: '#c5a572',       // Gold accent
      background: '#ffffff',
      text: '#000000',
      tableHeader: '#1a365d',
      tableAlt: '#f7f7f7'
    },
    margins: {
      top: 0.5,
      bottom: 0.5,
      left: 0.75,
      right: 0.75
    },
    footer: {
      format: 'Confidential | {company} | {date} | Page {n}',
      height: 0.3
    }
  };

  slideSequence: SlideBlueprint[] = [
    {
      id: 'title',
      name: 'Title Page',
      type: 'title',
      required: true,
      purpose: 'Professional cover with bank branding',
      requiredData: ['title', 'clientName', 'date'],
      optionalData: ['dealType', 'bankLogo'],
      wordLimits: { min: 5, max: 20, ideal: 12 },
      expertPrinciples: [
        'Clean, professional design',
        'Bank logo prominently placed',
        'Confidential marking required',
        'Date must be exact'
      ],
      designNotes: [
        'Bank logo top left',
        'Deal type centered',
        'Client name prominent',
        'CONFIDENTIAL watermark or footer'
      ],
      example: {
        title: 'Project Falcon',
        subtitle: 'Confidential Information Memorandum'
      }
    },
    {
      id: 'table_of_contents',
      name: 'Table of Contents',
      type: 'bullet-points',
      required: true,
      purpose: 'Navigation for long pitch books',
      requiredData: ['sections'],
      optionalData: [],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Section numbers aligned',
        'Page numbers right-aligned',
        'Main sections bolded',
        'Subsections indented'
      ],
      designNotes: [
        'Tab leader dots between title and page',
        'Consistent indentation',
        'Usually 5-10 main sections'
      ]
    },
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      type: 'two-column',
      required: true,
      purpose: 'One-page deal overview for decision-makers',
      requiredData: ['title', 'situation', 'recommendation', 'keyMetrics'],
      optionalData: ['timeline'],
      wordLimits: { min: 100, max: 200, ideal: 150 },
      expertPrinciples: [
        'Must fit on one page',
        'Key metrics in callout boxes',
        'Recommendation prominent',
        'Timeline if applicable'
      ],
      designNotes: [
        'Three-column layout common',
        'Metrics in colored boxes',
        'Clear section dividers'
      ]
    },
    {
      id: 'situation_overview',
      name: 'Situation Overview',
      type: 'two-column',
      required: true,
      purpose: 'Context on company and strategic situation',
      requiredData: ['companyDescription', 'currentSituation'],
      optionalData: ['history', 'ownership'],
      wordLimits: { min: 80, max: 150, ideal: 110 },
      expertPrinciples: [
        'Factual, not promotional',
        'Key metrics highlighted',
        'Ownership structure clear'
      ],
      designNotes: [
        'Company logo if available',
        'Key stats in sidebar'
      ]
    },
    {
      id: 'bank_credentials',
      name: 'Bank Credentials',
      type: 'grid',
      required: true,
      purpose: 'Establish credibility with relevant experience',
      requiredData: ['transactions', 'expertise'],
      optionalData: ['rankings', 'awards'],
      wordLimits: { min: 50, max: 120, ideal: 85 },
      expertPrinciples: [
        'Only show RELEVANT transactions',
        'Recent deals preferred (last 3 years)',
        'Include deal values',
        'Show sector expertise'
      ],
      designNotes: [
        'Tombstone format for deals',
        '2x3 or 3x3 grid typical',
        'Each tombstone: logo, company, role, value'
      ],
      example: {
        title: 'Select Transaction Experience'
      }
    },
    {
      id: 'market_overview',
      name: 'Market Overview',
      type: 'two-column',
      required: true,
      purpose: 'Industry context and trends',
      requiredData: ['marketSize', 'trends', 'keyPlayers'],
      optionalData: ['growthRate', 'forecast'],
      wordLimits: { min: 80, max: 150, ideal: 115 },
      expertPrinciples: [
        'All data sourced (IBISWorld, Capital IQ, etc.)',
        'TAM/SAM/SOM if applicable',
        'Trend arrows on charts',
        'Competitive positioning'
      ],
      designNotes: [
        'Market size chart',
        'Key players logos',
        'Growth indicators'
      ]
    },
    {
      id: 'valuation_summary',
      name: 'Valuation Summary',
      type: 'big-number',
      required: true,
      purpose: 'High-level valuation range',
      requiredData: ['valuationRange', 'methodology'],
      optionalData: ['impliedMultiples'],
      wordLimits: { min: 30, max: 80, ideal: 55 },
      expertPrinciples: [
        'Range, not point estimate',
        'Show all methodologies used',
        'Footnote key assumptions',
        'Reference to detailed pages'
      ],
      designNotes: [
        'Range bar visualization',
        'Methodology breakdown',
        'Clear currency/units'
      ],
      example: {
        title: 'Implied Enterprise Value: $450M - $550M'
      }
    },
    {
      id: 'comparable_companies',
      name: 'Comparable Company Analysis',
      type: 'table',
      required: true,
      purpose: 'Trading multiples from peer group',
      requiredData: ['companies', 'metrics'],
      optionalData: ['medians', 'quartiles'],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        'Minimum 5-8 comparable companies',
        'Multiple metrics: EV/Revenue, EV/EBITDA, P/E',
        'Mean/Median clearly marked',
        'Applied multiple highlighted'
      ],
      designNotes: [
        'Horizontal table format',
        'Shaded header row',
        'Target company row highlighted',
        'Sources at bottom (Capital IQ, Bloomberg)'
      ]
    },
    {
      id: 'precedent_transactions',
      name: 'Precedent Transactions Analysis',
      type: 'table',
      required: true,
      purpose: 'Historical M&A transaction multiples',
      requiredData: ['transactions', 'metrics'],
      optionalData: ['premiums', 'controlPremium'],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        'Recent transactions (3-5 years)',
        'Show premiums paid',
        'Control premium discussion',
        'Deal rationale notes'
      ],
      designNotes: [
        'Date, Acquirer, Target, Value, Multiples',
        'Sorted by date (newest first)',
        'Mean/Median row'
      ]
    },
    {
      id: 'dcf_analysis',
      name: 'DCF Analysis',
      type: 'table',
      required: true,
      purpose: 'Discounted cash flow valuation',
      requiredData: ['projections', 'wacc', 'terminalValue'],
      optionalData: ['sensitivityTable'],
      wordLimits: { min: 60, max: 120, ideal: 90 },
      expertPrinciples: [
        '5-year projection minimum',
        'Clear WACC calculation',
        'Terminal value method stated',
        'Sensitivity table required'
      ],
      designNotes: [
        'Cash flow waterfall',
        'WACC build-up shown',
        'Terminal value calculation',
        'Sensitivity matrix: WACC vs Terminal Growth'
      ]
    },
    {
      id: 'football_field',
      name: 'Football Field Chart',
      type: 'chart',
      required: true,
      purpose: 'Visual summary of all valuation methodologies',
      requiredData: ['valuationRanges'],
      optionalData: ['currentPrice', 'targetPrice'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'All methodologies on one chart',
        'Horizontal bar format',
        'Reference price line if public',
        'Clear labels for each range'
      ],
      designNotes: [
        'Horizontal bars by methodology',
        'Vertical reference lines',
        'Color-coded by methodology type',
        'Legend clear'
      ],
      example: {
        title: 'Summary Valuation Analysis'
      }
    },
    {
      id: 'sources_uses',
      name: 'Sources & Uses of Funds',
      type: 'table',
      required: true,
      purpose: 'Deal financing structure',
      requiredData: ['sources', 'uses'],
      optionalData: ['proForma'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Sources = Uses (must balance)',
        'Show each debt tranche',
        'Equity contribution clear',
        'Fees itemized'
      ],
      designNotes: [
        'Two-column table',
        'Sources on left, Uses on right',
        'Totals bolded',
        'Percentages shown'
      ]
    },
    {
      id: 'pro_forma_capitalization',
      name: 'Pro Forma Capitalization',
      type: 'table',
      required: true,
      purpose: 'Post-transaction capital structure',
      requiredData: ['debtSchedule', 'equity'],
      optionalData: ['covenants', 'amortization'],
      wordLimits: { min: 50, max: 100, ideal: 75 },
      expertPrinciples: [
        'Show current vs pro forma',
        'All debt tranches listed',
        'Credit metrics calculated',
        'Leverage ratios shown'
      ],
      designNotes: [
        'Before/After columns',
        'Debt by seniority',
        'Key ratios highlighted'
      ]
    },
    {
      id: 'process_timeline',
      name: 'Process Timeline',
      type: 'timeline',
      required: true,
      purpose: 'Transaction execution roadmap',
      requiredData: ['phases', 'milestones'],
      optionalData: ['workstreams'],
      wordLimits: { min: 30, max: 70, ideal: 50 },
      expertPrinciples: [
        'Key milestones dated',
        'Decision points marked',
        'Regulatory timeline if applicable',
        'Realistic durations'
      ],
      designNotes: [
        'Horizontal Gantt-style',
        'Phases color-coded',
        'Milestones as diamonds',
        'Current date marked'
      ]
    },
    {
      id: 'risk_factors',
      name: 'Risk Factors',
      type: 'bullet-points',
      required: true,
      purpose: 'Key risks and mitigants',
      requiredData: ['risks', 'mitigants'],
      optionalData: [],
      wordLimits: { min: 60, max: 120, ideal: 90 },
      expertPrinciples: [
        'Honest about material risks',
        'Each risk has mitigation',
        'Organized by category',
        'Legal will review'
      ],
      designNotes: [
        'Risk | Mitigation two-column',
        'Severity indicators',
        'Grouped by type'
      ]
    },
    {
      id: 'appendix_divider',
      name: 'Appendix Divider',
      type: 'section-break',
      required: false,
      purpose: 'Separate main deck from detailed appendices',
      requiredData: ['title'],
      optionalData: [],
      wordLimits: { min: 1, max: 5, ideal: 2 },
      expertPrinciples: [
        'Clear visual break',
        'Lists appendix sections'
      ],
      designNotes: [
        'Full-page title',
        'Bank colors'
      ]
    }
  ];

  contentTransforms: ContentTransform[] = [
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*(?:million|mn|M)\b/gi,
      transform: (match) => {
        const num = parseFloat(match.match(/[\d.]+/)?.[0] ?? '0');
        return `$${num.toFixed(1)}M`;
      },
      description: 'Standardize million format to $XM'
    },
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*(?:billion|bn|B)\b/gi,
      transform: (match) => {
        const num = parseFloat(match.match(/[\d.]+/)?.[0] ?? '0');
        return `$${num.toFixed(1)}B`;
      },
      description: 'Standardize billion format to $XB'
    },
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*x\s*(ebitda|revenue|earnings)/gi,
      transform: (match) => match.replace(/x\s*/i, 'x ').toUpperCase(),
      description: 'Standardize multiple format (e.g., 5.0x EBITDA)'
    },
    {
      sourcePattern: /\b(?:source|src):\s*/gi,
      transform: () => 'Source: ',
      description: 'Standardize source citations'
    }
  ];

  qualityBenchmarks = {
    minScore: 98,
    criticalChecks: [
      'Football field chart included',
      'All valuations have ranges',
      'Every number is sourced',
      'Multiple valuation methodologies used',
      'Sources & Uses balances',
      'Pro forma cap table complete',
      'Bank credentials relevant to deal'
    ],
    excellenceIndicators: [
      'Sensitivity tables included',
      'Transaction timeline realistic',
      'Risk factors honest and mitigated',
      'Comparable selection justified',
      'DCF assumptions well-documented'
    ]
  };

  /**
   * Generate investment banking slides from content analysis.
   */
  async generateSlides(analysis: ContentAnalysis): Promise<Slide[]> {
    const slides: Slide[] = [];
    let index = 0;

    // Title Page
    slides.push({
      index: index++,
      type: 'title',
      data: {
        title: analysis.scqa.situation ? `Project ${this.generateCodeName()}` : 'Confidential Information Memorandum',
        subtitle: 'CONFIDENTIAL',
        keyMessage: this.formatDate(new Date())
      },
      classes: ['slide-title', 'slide-ib-cover']
    });

    // Table of Contents
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Table of Contents',
        bullets: [
          'I. Executive Summary',
          'II. Situation Overview',
          'III. Bank Credentials',
          'IV. Market Overview',
          'V. Valuation Analysis',
          'VI. Transaction Structure',
          'VII. Process & Timeline',
          'VIII. Appendix'
        ]
      },
      classes: ['slide-toc']
    });

    // Executive Summary
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: 'Executive Summary',
        body: analysis.scqa.situation ?? 'Situation overview',
        bullets: [
          analysis.scqa.complication ?? 'Key consideration',
          analysis.scqa.answer ?? 'Recommended approach'
        ],
        keyMessage: 'Key metrics and recommendation'
      },
      classes: ['slide-executive-summary', 'slide-ib']
    });

    // Situation Overview
    if (analysis.scqa.situation) {
      slides.push({
        index: index++,
        type: 'two-column',
        data: {
          title: 'Situation Overview',
          body: analysis.scqa.situation,
          bullets: analysis.sparkline.whatIs.slice(0, 4)
        },
        classes: ['slide-situation', 'slide-ib']
      });
    }

    // Bank Credentials (placeholder)
    slides.push({
      index: index++,
      type: 'grid',
      data: {
        title: 'Select Transaction Experience',
        body: 'Relevant M&A and capital markets experience',
        keyMessage: '[Insert tombstones]'
      },
      classes: ['slide-credentials', 'slide-ib']
    });

    // Market Overview
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: 'Market Overview',
        body: 'Industry dynamics and competitive landscape',
        bullets: analysis.keyMessages.slice(0, 4)
      },
      classes: ['slide-market', 'slide-ib']
    });

    // Valuation Summary
    const valuationData = this.extractValuationData(analysis);
    slides.push({
      index: index++,
      type: 'big-number',
      data: {
        title: valuationData.range,
        subtitle: 'Implied Enterprise Value',
        body: valuationData.methodology,
        keyMessage: 'Based on multiple valuation approaches'
      },
      classes: ['slide-valuation-summary', 'slide-ib']
    });

    // Comparable Companies Analysis
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Comparable Company Analysis',
        body: 'Trading multiples from public peer group',
        keyMessage: 'Source: Capital IQ, Bloomberg'
      },
      classes: ['slide-comps', 'slide-ib']
    });

    // Precedent Transactions
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Precedent Transactions Analysis',
        body: 'Historical M&A transaction multiples',
        keyMessage: 'Source: Capital IQ, MergerMarket'
      },
      classes: ['slide-precedents', 'slide-ib']
    });

    // DCF Analysis
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Discounted Cash Flow Analysis',
        body: 'Intrinsic value based on projected cash flows',
        keyMessage: 'Sensitivity: WACC vs Terminal Growth'
      },
      classes: ['slide-dcf', 'slide-ib']
    });

    // Football Field
    slides.push({
      index: index++,
      type: 'chart',
      data: {
        title: 'Summary Valuation Analysis',
        body: valuationData.range,
        keyMessage: 'Football field showing all methodologies'
      },
      classes: ['slide-football-field', 'slide-ib']
    });

    // Sources & Uses
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Sources & Uses of Funds',
        body: 'Transaction financing structure'
      },
      classes: ['slide-sources-uses', 'slide-ib']
    });

    // Pro Forma Capitalization
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Pro Forma Capitalization',
        body: 'Post-transaction capital structure'
      },
      classes: ['slide-cap-table', 'slide-ib']
    });

    // Process Timeline
    slides.push({
      index: index++,
      type: 'timeline',
      data: {
        title: 'Indicative Process Timeline',
        body: 'Key milestones and decision points'
      },
      classes: ['slide-timeline', 'slide-ib']
    });

    // Risk Factors
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Key Risk Factors & Mitigants',
        bullets: [
          'Market risk: [Description] | Mitigation: [Approach]',
          'Execution risk: [Description] | Mitigation: [Approach]',
          'Regulatory risk: [Description] | Mitigation: [Approach]'
        ]
      },
      classes: ['slide-risks', 'slide-ib']
    });

    return slides;
  }

  /**
   * Validate slides against IB pitch book requirements.
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

    // Check for football field
    const hasFootballField = slides.some(s =>
      s.classes?.includes('slide-football-field') || s.type === 'chart'
    );
    if (!hasFootballField) {
      issues.push('Missing football field chart - required for valuation summary');
      score -= 10;
    }

    // Check for multiple valuation methodologies
    const hasComps = slides.some(s => s.classes?.includes('slide-comps'));
    const hasPrecedents = slides.some(s => s.classes?.includes('slide-precedents'));
    const hasDCF = slides.some(s => s.classes?.includes('slide-dcf'));

    if (!hasComps) {
      issues.push('Missing comparable company analysis');
      score -= 10;
    }
    if (!hasPrecedents) {
      issues.push('Missing precedent transactions analysis');
      score -= 10;
    }
    if (!hasDCF) {
      issues.push('Missing DCF analysis');
      score -= 10;
    }

    // Check for sources & uses
    const hasSourcesUses = slides.some(s => s.classes?.includes('slide-sources-uses'));
    if (!hasSourcesUses) {
      issues.push('Missing sources & uses of funds');
      score -= 8;
    }

    // Check for sourced data
    for (const slide of slides) {
      if (this.containsFinancialData(slide) && !slide.data.source) {
        issues.push(`Slide ${slide.index + 1}: Financial data without source citation`);
        score -= 2;
      }
    }

    // Check for bank credentials
    const hasCredentials = slides.some(s => s.classes?.includes('slide-credentials'));
    if (!hasCredentials) {
      suggestions.push('Consider adding bank credentials/transaction experience');
    }

    return {
      passed: issues.filter(i => !i.includes('Consider')).length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Apply IB methodology to slides.
   */
  applyExpertMethodology(slides: Slide[]): Slide[] {
    return slides.map(slide => {
      // Add source placeholders
      if (this.containsFinancialData(slide) && !slide.data.source) {
        slide.data.source = 'Source: [Capital IQ, Bloomberg, Company Filings]';
      }

      // Add IB class if not present
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes('slide-ib')) {
        slide.classes.push('slide-ib');
      }

      // Format numbers consistently
      if (slide.data.body) {
        slide.data.body = this.formatNumbers(slide.data.body);
      }
      if (slide.data.title) {
        slide.data.title = this.formatNumbers(slide.data.title);
      }

      return slide;
    });
  }

  // === Helper Methods ===

  private generateCodeName(): string {
    const words = ['Falcon', 'Eagle', 'Phoenix', 'Atlas', 'Titan', 'Apex', 'Summit', 'Crown'];
    return words[Math.floor(Math.random() * words.length)] ?? 'Project';
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  private extractValuationData(analysis: ContentAnalysis): {
    range: string;
    methodology: string;
  } {
    // Look for valuation data in the analysis
    for (const star of analysis.starMoments) {
      const valueMatch = star.match(/\$[\d,.]+\s*(?:million|billion|M|B)?/i);
      if (valueMatch) {
        return {
          range: valueMatch[0],
          methodology: 'DCF, Comparable Companies, Precedent Transactions'
        };
      }
    }

    return {
      range: '$[X]M - $[Y]M',
      methodology: 'DCF, Comparable Companies, Precedent Transactions'
    };
  }

  private containsFinancialData(slide: Slide): boolean {
    const content = JSON.stringify(slide.data);
    return /\$[\d,]+|\d+\.\d+x|\d+%|\bEBITDA\b|\bRevenue\b|\bEV\b/i.test(content);
  }

  private formatNumbers(text: string): string {
    return text
      .replace(/(\d+(?:\.\d+)?)\s*(?:million|mn)\b/gi, (_, n) => `$${parseFloat(n).toFixed(1)}M`)
      .replace(/(\d+(?:\.\d+)?)\s*(?:billion|bn)\b/gi, (_, n) => `$${parseFloat(n).toFixed(1)}B`)
      .replace(/(\d+(?:\.\d+)?)\s*x\b/gi, (_, n) => `${parseFloat(n).toFixed(1)}x`);
  }
}
