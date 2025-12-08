/**
 * Technical Presentation Execution Strategy
 *
 * World-class technical presentations follow rigorous standards:
 * - Edward Tufte's Visual Display principles
 * - C4 Model for architecture diagrams
 * - RFC/Design Doc structure
 * - Data-driven decision making
 *
 * Key Principles:
 * - High data-ink ratio
 * - Clear architecture diagrams
 * - Explicit tradeoffs
 * - Performance data required
 * - Action titles even for technical content
 *
 * This strategy produces architecture review quality presentations.
 */

import type { Slide, ContentAnalysis } from '../types/index.js';
import type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';

export class TechnicalPresentationStrategy implements ExecutionStrategy {
  type = 'technical_presentation' as const;
  name = 'Technical Presentation';
  description = 'System design and architecture presentations for engineering audiences';

  experts = {
    primary: 'Edward Tufte (Visual Display of Quantitative Information)',
    secondary: [
      'C4 Model (Simon Brown)',
      'Google Design Doc Format',
      'RFC Process',
      'DORA Metrics'
    ]
  };

  // C4 Model diagram levels
  c4Levels = {
    context: 'System Context - How system fits in the world',
    container: 'Containers - High-level building blocks',
    component: 'Components - Inside each container',
    code: 'Code - Implementation details'
  };

  // Architecture diagram standards
  diagramStandards = {
    colors: {
      external: '#999999',
      system: '#1168bd',
      container: '#438dd5',
      component: '#85bbf0',
      database: '#f5a623',
      message: '#6b9e78'
    },
    shapes: {
      person: 'Stick figure or rounded rectangle',
      system: 'Large rectangle with border',
      container: 'Rectangle',
      database: 'Cylinder',
      queue: 'Rectangle with wave bottom'
    },
    labels: {
      required: ['Name', 'Technology', 'Description'],
      optional: ['Protocol', 'Port', 'Data flow']
    }
  };

  slideSequence: SlideBlueprint[] = [
    {
      id: 'title',
      name: 'Title',
      type: 'title',
      required: true,
      purpose: 'Clear identification of what this presentation covers',
      requiredData: ['title', 'author', 'date'],
      optionalData: ['version', 'status'],
      wordLimits: { min: 5, max: 20, ideal: 12 },
      expertPrinciples: [
        'Clear, descriptive title',
        'Date and version visible',
        'Author/team ownership clear',
        'Status (Draft, Final, Proposed)'
      ],
      designNotes: [
        'Clean, professional',
        'Team/company branding',
        'RFC/ADR number if applicable'
      ],
      example: {
        title: 'RFC-2024-001: Migrating to Event-Driven Architecture',
        subtitle: 'Architecture Decision Record - Draft v0.2'
      }
    },
    {
      id: 'agenda',
      name: 'Agenda / TL;DR',
      type: 'bullet-points',
      required: true,
      purpose: 'Quick overview and navigation',
      requiredData: ['agenda'],
      optionalData: ['estimatedTime'],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        'TL;DR at the top for busy engineers',
        'Clear section breakdown',
        'Time estimates if long',
        'Skip to specific sections'
      ],
      designNotes: [
        'Numbered sections',
        'Current section indicator',
        'Page numbers'
      ],
      example: {
        title: 'TL;DR & Agenda',
        bullets: [
          'TL;DR: Migrate from REST to event-driven to reduce latency 50%',
          '1. Context & Problem (5 min)',
          '2. Proposed Solution (10 min)',
          '3. Tradeoffs & Risks (5 min)'
        ]
      }
    },
    {
      id: 'problem_context',
      name: 'Problem / Context',
      type: 'two-column',
      required: true,
      purpose: 'Why are we doing this? What problem does it solve?',
      requiredData: ['problem', 'context', 'metrics'],
      optionalData: ['history'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Data-driven problem statement',
        'Current performance metrics',
        'Why now? What changed?',
        'Impact of not solving'
      ],
      designNotes: [
        'Metrics visualization',
        'Current state diagram optional',
        'Source data citations'
      ],
      example: {
        title: 'Current API latency exceeds SLA 40% of the time',
        bullets: [
          'P99 latency: 2.3s (SLA: 500ms)',
          'Error rate: 2.1% (SLA: 0.1%)',
          'User complaints up 300% in Q3'
        ]
      }
    },
    {
      id: 'current_architecture',
      name: 'Current Architecture',
      type: 'diagram',
      required: true,
      purpose: 'Show the current state (C4 Level 2)',
      requiredData: ['diagram'],
      optionalData: ['dataFlow', 'bottlenecks'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'C4 Container diagram level',
        'Highlight pain points',
        'Show data flows',
        'Mark bottlenecks'
      ],
      designNotes: [
        'Standard C4 notation',
        'Bottlenecks in red',
        'Data flow arrows labeled'
      ]
    },
    {
      id: 'proposed_solution',
      name: 'Proposed Solution',
      type: 'single-statement',
      required: true,
      purpose: 'One sentence summary of the solution',
      requiredData: ['solution', 'benefit'],
      optionalData: [],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        'One clear solution statement',
        'Expected improvement',
        'High-level approach',
        'Link to detailed section'
      ],
      designNotes: [
        'Bold, clear statement',
        'Expected metrics improvement',
        'Simple before/after'
      ],
      example: {
        title: 'Migrate to event-driven architecture with Kafka',
        subtitle: 'Reduce P99 latency from 2.3s to <200ms'
      }
    },
    {
      id: 'architecture_diagram',
      name: 'Proposed Architecture',
      type: 'diagram',
      required: true,
      purpose: 'Show the target state (C4 Level 2)',
      requiredData: ['diagram'],
      optionalData: ['legend'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'C4 Container diagram',
        'Clear labeling',
        'Technology choices visible',
        'New components highlighted'
      ],
      designNotes: [
        'Standard C4 notation',
        'New components in green',
        'Removed components grayed'
      ]
    },
    {
      id: 'data_flow',
      name: 'Data Flow',
      type: 'diagram',
      required: true,
      purpose: 'Show how data moves through the system',
      requiredData: ['dataFlow'],
      optionalData: ['sequenceDiagram'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Numbered sequence',
        'Happy path and error paths',
        'Latency expectations per step',
        'Data transformations noted'
      ],
      designNotes: [
        'Sequence diagram OR',
        'Data flow diagram',
        'Latency annotations'
      ]
    },
    {
      id: 'implementation_phases',
      name: 'Implementation Plan',
      type: 'timeline',
      required: true,
      purpose: 'How we get from here to there',
      requiredData: ['phases', 'milestones'],
      optionalData: ['team', 'resources'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Phased approach',
        'Rollback points',
        'Feature flags strategy',
        'Parallel vs serial'
      ],
      designNotes: [
        'Gantt-style timeline',
        'Milestones marked',
        'Dependencies shown'
      ],
      example: {
        title: 'Three-phase migration over 8 weeks',
        bullets: [
          'Phase 1 (2 weeks): Event bus setup + shadow traffic',
          'Phase 2 (4 weeks): Service-by-service migration',
          'Phase 3 (2 weeks): Cutover + monitoring'
        ]
      }
    },
    {
      id: 'tradeoffs_analysis',
      name: 'Tradeoffs',
      type: 'table',
      required: true,
      purpose: 'Honest assessment of tradeoffs',
      requiredData: ['tradeoffs'],
      optionalData: ['alternatives'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Show both pros and cons',
        'Compare to alternatives',
        'Be honest about risks',
        'Explain why this choice'
      ],
      designNotes: [
        'Pros/Cons columns',
        'Alternative comparison table',
        'Chosen option highlighted'
      ],
      example: {
        title: 'Kafka vs RabbitMQ vs SQS',
        bullets: [
          'Kafka: Best throughput, complexity',
          'RabbitMQ: Good DX, limited scale',
          'SQS: Managed, higher latency'
        ]
      }
    },
    {
      id: 'performance_metrics',
      name: 'Expected Performance',
      type: 'table',
      required: true,
      purpose: 'Quantified expected improvements',
      requiredData: ['metrics', 'targets'],
      optionalData: ['benchmarks'],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        'Current vs Target comparison',
        'DORA metrics if applicable',
        'SLA/SLO alignment',
        'How we\'ll measure'
      ],
      designNotes: [
        'Before/After table',
        'Green for improvement',
        'Measurement method noted'
      ],
      example: {
        title: 'Expected Metrics Improvement',
        bullets: [
          'P99 Latency: 2.3s → 200ms (-91%)',
          'Throughput: 1K → 10K rps (+900%)',
          'Error Rate: 2.1% → 0.05% (-98%)'
        ]
      }
    },
    {
      id: 'risks_mitigation',
      name: 'Risks & Mitigation',
      type: 'table',
      required: true,
      purpose: 'What could go wrong and how we handle it',
      requiredData: ['risks', 'mitigations'],
      optionalData: ['rollback'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Identify real risks',
        'Mitigation for each',
        'Rollback strategy',
        'Monitoring/alerting plan'
      ],
      designNotes: [
        'Risk | Mitigation | Owner table',
        'Severity indicators',
        'Rollback highlighted'
      ]
    },
    {
      id: 'next_steps',
      name: 'Next Steps / Decision',
      type: 'bullet-points',
      required: true,
      purpose: 'Clear actions needed',
      requiredData: ['actions'],
      optionalData: ['owners', 'dates', 'decision'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Clear decision needed',
        'Action items with owners',
        'Timeline for decision',
        'Follow-up meetings scheduled'
      ],
      designNotes: [
        'Decision box at top',
        'Numbered action items',
        'Owners in brackets'
      ],
      example: {
        title: 'Decision Needed: Approve migration plan',
        bullets: [
          '1. Review design doc [Team, by 12/15]',
          '2. Approve resource allocation [Eng Lead, by 12/20]',
          '3. Begin Phase 1 [Migration Team, 01/05]'
        ]
      }
    },
    {
      id: 'qa_discussion',
      name: 'Q&A / Discussion',
      type: 'single-statement',
      required: false,
      purpose: 'Open floor for questions',
      requiredData: [],
      optionalData: ['openQuestions'],
      wordLimits: { min: 5, max: 20, ideal: 10 },
      expertPrinciples: [
        'List known open questions',
        'Contact info for follow-up',
        'Link to design doc'
      ],
      designNotes: [
        'Simple Q&A slide',
        'Contact/doc links'
      ]
    }
  ];

  contentTransforms: ContentTransform[] = [
    {
      sourcePattern: /(\d+)\s*(?:ms|milliseconds?)/gi,
      transform: (match) => match.replace(/milliseconds?/i, 'ms'),
      description: 'Standardize milliseconds to ms'
    },
    {
      sourcePattern: /(\d+)\s*(?:rps|requests?\s*per\s*second)/gi,
      transform: (match) => {
        const num = parseInt(match.match(/\d+/)?.[0] ?? '0');
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K rps`;
        return `${num} rps`;
      },
      description: 'Format requests per second'
    },
    {
      sourcePattern: /P\s*(\d+)/gi,
      transform: (match) => match.replace(/P\s*/i, 'P'),
      description: 'Standardize percentile notation (P99)'
    }
  ];

  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      'Problem quantified with metrics',
      'Architecture diagrams present',
      'Tradeoffs explicitly discussed',
      'Performance expectations defined',
      'Risks identified with mitigations',
      'Clear decision/action needed'
    ],
    excellenceIndicators: [
      'C4 notation used correctly',
      'Data flows documented',
      'Rollback strategy defined',
      'Phased implementation plan',
      'Monitoring plan included'
    ]
  };

  /**
   * Generate technical presentation slides from content analysis.
   */
  async generateSlides(analysis: ContentAnalysis): Promise<Slide[]> {
    const slides: Slide[] = [];
    let index = 0;

    // Title
    slides.push({
      index: index++,
      type: 'title',
      data: {
        title: this.formatTechnicalTitle(analysis.scqa.answer ?? ''),
        subtitle: 'Architecture Decision Record',
        keyMessage: new Date().toISOString().split('T')[0]
      },
      classes: ['slide-title', 'slide-technical']
    });

    // TL;DR + Agenda
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'TL;DR & Agenda',
        bullets: [
          `TL;DR: ${this.extractTLDR(analysis)}`,
          '1. Problem Context',
          '2. Proposed Solution',
          '3. Architecture & Data Flow',
          '4. Tradeoffs & Risks',
          '5. Next Steps'
        ],
        keyMessage: 'Quick overview'
      },
      classes: ['slide-agenda', 'slide-technical']
    });

    // Problem Context
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: this.formatProblemTitle(analysis.scqa.complication ?? ''),
        body: analysis.scqa.situation ?? 'Current situation',
        bullets: analysis.sparkline.whatIs.slice(0, 4),
        keyMessage: 'The problem'
      },
      classes: ['slide-problem', 'slide-technical']
    });

    // Current Architecture
    slides.push({
      index: index++,
      type: 'diagram',
      data: {
        title: 'Current Architecture',
        body: '[Insert C4 Container Diagram]',
        keyMessage: 'As-is state'
      },
      classes: ['slide-current-arch', 'slide-technical']
    });

    // Proposed Solution
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.formatSolutionTitle(analysis.scqa.answer ?? ''),
        subtitle: 'Expected improvement: [metrics]',
        keyMessage: 'The solution'
      },
      classes: ['slide-solution', 'slide-technical']
    });

    // Proposed Architecture
    slides.push({
      index: index++,
      type: 'diagram',
      data: {
        title: 'Proposed Architecture',
        body: '[Insert C4 Container Diagram - Target State]',
        keyMessage: 'To-be state'
      },
      classes: ['slide-proposed-arch', 'slide-technical']
    });

    // Data Flow
    slides.push({
      index: index++,
      type: 'diagram',
      data: {
        title: 'Data Flow',
        body: '[Insert Sequence Diagram or Data Flow Diagram]',
        keyMessage: 'How data moves'
      },
      classes: ['slide-data-flow', 'slide-technical']
    });

    // Implementation Plan
    slides.push({
      index: index++,
      type: 'timeline',
      data: {
        title: 'Implementation Plan',
        bullets: [
          'Phase 1: [Description] - [Duration]',
          'Phase 2: [Description] - [Duration]',
          'Phase 3: [Description] - [Duration]'
        ],
        keyMessage: 'Execution roadmap'
      },
      classes: ['slide-implementation', 'slide-technical']
    });

    // Tradeoffs
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Tradeoffs Analysis',
        body: 'Comparing alternatives',
        bullets: [
          'Option A: [Pros] | [Cons]',
          'Option B: [Pros] | [Cons]',
          'Recommended: Option [X]'
        ],
        keyMessage: 'Why this approach'
      },
      classes: ['slide-tradeoffs', 'slide-technical']
    });

    // Performance Metrics
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Expected Performance',
        bullets: [
          'Metric 1: [Current] → [Target] ([% change])',
          'Metric 2: [Current] → [Target] ([% change])',
          'Metric 3: [Current] → [Target] ([% change])'
        ],
        keyMessage: 'Measurable outcomes'
      },
      classes: ['slide-metrics', 'slide-technical']
    });

    // Risks
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Risks & Mitigation',
        bullets: [
          'Risk 1: [Description] | Mitigation: [Approach]',
          'Risk 2: [Description] | Mitigation: [Approach]',
          'Rollback: [Strategy]'
        ],
        keyMessage: 'Risk management'
      },
      classes: ['slide-risks', 'slide-technical']
    });

    // Next Steps
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Decision Needed: Approve proposal',
        bullets: [
          '1. [Action] - [Owner, Date]',
          '2. [Action] - [Owner, Date]',
          '3. [Action] - [Owner, Date]'
        ],
        keyMessage: 'Next steps'
      },
      classes: ['slide-next-steps', 'slide-technical']
    });

    // Q&A
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: 'Questions?',
        body: 'Design doc: [link]\nContact: [email]',
        keyMessage: 'Discussion'
      },
      classes: ['slide-qa', 'slide-technical']
    });

    return slides;
  }

  /**
   * Validate slides against technical presentation requirements.
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

    // Check for problem with metrics
    const hasProblem = slides.some(s => s.classes?.includes('slide-problem'));
    if (!hasProblem) {
      issues.push('Missing problem context slide');
      score -= 10;
    }

    // Check for architecture diagrams
    const hasCurrentArch = slides.some(s => s.classes?.includes('slide-current-arch'));
    const hasProposedArch = slides.some(s => s.classes?.includes('slide-proposed-arch'));

    if (!hasCurrentArch) {
      issues.push('Missing current architecture diagram');
      score -= 8;
    }
    if (!hasProposedArch) {
      issues.push('Missing proposed architecture diagram');
      score -= 10;
    }

    // Check for tradeoffs
    const hasTradeoffs = slides.some(s => s.classes?.includes('slide-tradeoffs'));
    if (!hasTradeoffs) {
      issues.push('Missing tradeoffs analysis');
      score -= 8;
    }

    // Check for metrics
    const hasMetrics = slides.some(s => s.classes?.includes('slide-metrics'));
    if (!hasMetrics) {
      issues.push('Missing expected performance metrics');
      score -= 8;
    }

    // Check for risks
    const hasRisks = slides.some(s => s.classes?.includes('slide-risks'));
    if (!hasRisks) {
      issues.push('Missing risks and mitigation');
      score -= 8;
    }

    // Check for data flow
    const hasDataFlow = slides.some(s => s.classes?.includes('slide-data-flow'));
    if (!hasDataFlow) {
      suggestions.push('Consider adding data flow diagram');
    }

    // Check for implementation plan
    const hasImplementation = slides.some(s => s.classes?.includes('slide-implementation'));
    if (!hasImplementation) {
      suggestions.push('Consider adding phased implementation plan');
    }

    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Apply technical methodology to slides.
   */
  applyExpertMethodology(slides: Slide[]): Slide[] {
    return slides.map(slide => {
      // Add technical class
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes('slide-technical')) {
        slide.classes.push('slide-technical');
      }

      // Format technical metrics
      if (slide.data.body) {
        slide.data.body = this.formatTechnicalMetrics(slide.data.body);
      }
      if (slide.data.bullets) {
        slide.data.bullets = slide.data.bullets.map(b => this.formatTechnicalMetrics(b));
      }

      return slide;
    });
  }

  // === Helper Methods ===

  private formatTechnicalTitle(text: string): string {
    if (!text) return 'Technical Proposal';

    // Make it action-oriented
    const cleaned = text.trim();
    if (!cleaned.match(/^(migrate|implement|refactor|upgrade|add|remove|replace)/i)) {
      return `Proposal: ${cleaned}`;
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  private extractTLDR(analysis: ContentAnalysis): string {
    if (analysis.scqa.answer) {
      return analysis.scqa.answer.length > 80
        ? analysis.scqa.answer.slice(0, 77) + '...'
        : analysis.scqa.answer;
    }
    return '[Brief summary of proposal]';
  }

  private formatProblemTitle(text: string): string {
    if (!text) return 'Current system limitations';

    // Make it measurable
    const cleaned = text.trim();
    if (!cleaned.match(/\d+/)) {
      return cleaned;
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  private formatSolutionTitle(text: string): string {
    if (!text) return 'Proposed solution';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private formatTechnicalMetrics(text: string): string {
    return text
      .replace(/(\d+)\s*milliseconds?/gi, '$1ms')
      .replace(/(\d+)\s*requests?\s*per\s*second/gi, '$1 rps')
      .replace(/P\s*(\d+)/gi, 'P$1')
      .replace(/(\d+)\s*%\s*(increase|improvement)/gi, '+$1% $2')
      .replace(/(\d+)\s*%\s*(decrease|reduction)/gi, '-$1% $2');
  }
}
