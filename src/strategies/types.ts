/**
 * Execution Strategy Types
 *
 * Types for the presentation execution strategy system.
 */

import type { Slide, SlideType, ContentAnalysis, PresentationType } from '../types/index.js';

/**
 * A blueprint for a single slide in a presentation.
 */
export interface SlideBlueprint {
  /** Unique identifier for this slide in the sequence */
  id: string;
  /** Human-readable name */
  name: string;
  /** Slide type to use */
  type: SlideType;
  /** Is this slide required or optional? */
  required: boolean;
  /** Purpose of this slide (for content guidance) */
  purpose: string;
  /** Data fields this slide needs */
  requiredData: string[];
  /** Optional data fields */
  optionalData: string[];
  /** Word count constraints */
  wordLimits: {
    min: number;
    max: number;
    ideal: number;
  };
  /** Expert principles that apply to this slide */
  expertPrinciples: string[];
  /** Visual design notes */
  designNotes: string[];
  /** Example content (for guidance) */
  example?: {
    title?: string;
    subtitle?: string;
    bullets?: string[];
    body?: string;
  };
}

/**
 * A content transformation rule.
 */
export interface ContentTransform {
  /** What to look for in the source content */
  sourcePattern: string | RegExp;
  /** How to transform it */
  transform: (match: string, analysis: ContentAnalysis) => string;
  /** Description of the transformation */
  description: string;
}

/**
 * An execution strategy for a presentation type.
 */
export interface ExecutionStrategy {
  /** Presentation type this strategy is for */
  type: PresentationType;
  /** Human-readable name */
  name: string;
  /** Description */
  description: string;

  /** Expert methodologies to apply */
  experts: {
    primary: string;
    secondary: string[];
  };

  /** The slide sequence (ordered list of blueprints) */
  slideSequence: SlideBlueprint[];

  /** Content transformation rules */
  contentTransforms: ContentTransform[];

  /** Quality benchmarks */
  qualityBenchmarks: {
    minScore: number;
    criticalChecks: string[];
    excellenceIndicators: string[];
  };

  /**
   * Generate slides from content analysis.
   */
  generateSlides(analysis: ContentAnalysis): Promise<Slide[]>;

  /**
   * Validate slides against this strategy's requirements.
   */
  validateSlides(slides: Slide[]): {
    passed: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  };

  /**
   * Apply expert methodology transformations.
   */
  applyExpertMethodology(slides: Slide[]): Slide[];
}

/**
 * Slide sequence for different presentation types.
 */
export const SLIDE_SEQUENCES: Record<PresentationType, string[]> = {
  ted_keynote: [
    'title_impact',
    'what_is_1',          // Current reality (pain)
    'what_could_be_1',    // Vision (possibility)
    'what_is_2',          // More reality (tension)
    'what_could_be_2',    // More vision (building)
    'star_moment',        // The memorable moment
    'what_could_be_3',    // The new bliss
    'call_to_adventure'   // What to do next
  ],

  sales_pitch: [
    'title_impact',
    'problem_statement',   // Their pain
    'cost_of_inaction',    // Agitate the problem
    'solution_overview',   // Your answer
    'how_it_works',        // The mechanism
    'social_proof',        // Who else uses it
    'case_study',          // Proof it works
    'pricing',             // What it costs
    'call_to_action'       // Next step
  ],

  consulting_deck: [
    'executive_summary_scr',  // Answer first
    'situation_analysis',     // Context
    'key_findings',          // What we found
    'finding_1_detail',      // Deep dive 1
    'finding_2_detail',      // Deep dive 2
    'finding_3_detail',      // Deep dive 3
    'options_comparison',    // Alternatives
    'recommendation',        // Our recommendation
    'implementation_plan',   // How to do it
    'risks_mitigation',      // What could go wrong
    'next_steps'             // Immediate actions
  ],

  investment_banking: [
    'title',
    'table_of_contents',
    'executive_summary',
    'situation_overview',
    'bank_credentials',
    'relevant_experience',
    'market_overview',
    'valuation_summary',
    'comparable_companies',
    'precedent_transactions',
    'dcf_analysis',
    'football_field',
    'sources_uses',
    'pro_forma_capitalization',
    'process_timeline',
    'risk_factors',
    'appendix_divider'
  ],

  investor_pitch: [
    'title_company',        // Company purpose (1 sentence)
    'problem',              // The problem
    'solution',             // Your solution
    'why_now',              // Market timing
    'market_size',          // TAM/SAM/SOM
    'product',              // How it works
    'business_model',       // How you make money
    'traction',             // Proof of progress
    'competition',          // Competitive landscape
    'team',                 // Why this team
    'financials',           // Key numbers
    'the_ask'               // What you need
  ],

  technical_presentation: [
    'title',
    'agenda',
    'problem_context',
    'current_architecture',
    'proposed_solution',
    'architecture_diagram',
    'data_flow',
    'implementation_phases',
    'tradeoffs_analysis',
    'performance_metrics',
    'next_steps',
    'qa_discussion'
  ],

  all_hands: [
    'title_energy',
    'wins_celebration',
    'key_metrics',
    'metric_deep_dive',
    'challenges_learnings',
    'roadmap',
    'spotlight_team',
    'announcements',
    'call_to_action'
  ]
};

/**
 * Expert methodology applications by type.
 */
export const EXPERT_APPLICATIONS: Record<PresentationType, {
  primary: string;
  principles: string[];
}> = {
  ted_keynote: {
    primary: 'Nancy Duarte',
    principles: [
      'Create contrast between "What Is" and "What Could Be"',
      'Include one STAR moment (Something They\'ll Always Remember)',
      'End with a clear Call to Adventure',
      'One idea per slide, max 10 words',
      'Images over text, emotion over data'
    ]
  },

  sales_pitch: {
    primary: 'Robert Cialdini',
    principles: [
      'Reciprocity: Give value before asking',
      'Social Proof: Show who else uses it',
      'Authority: Establish credibility early',
      'Scarcity: Create urgency',
      'Liking: Show you understand their pain',
      'Commitment: Get small yeses before the big ask'
    ]
  },

  consulting_deck: {
    primary: 'Barbara Minto',
    principles: [
      'Answer first: Lead with the recommendation',
      'MECE: Arguments must be Mutually Exclusive, Collectively Exhaustive',
      'Horizontal logic: Slide titles tell the complete story',
      'Action titles: Every slide title is a complete sentence with an insight',
      'Source everything: No unsourced data'
    ]
  },

  investment_banking: {
    primary: 'Analyst Academy',
    principles: [
      'Precision: All numbers verified and sourced',
      'Multiple methodologies: DCF, Comps, Precedents',
      'Football field: Show valuation ranges clearly',
      'Sensitivity tables: Show how assumptions affect value',
      'Credentials matter: Relevant deal experience upfront'
    ]
  },

  investor_pitch: {
    primary: 'Sequoia Capital',
    principles: [
      '10-15 slides maximum',
      'Market size with sources (TAM/SAM/SOM)',
      'Traction with real numbers',
      'Team credibility is essential',
      'Clear ask with use of funds'
    ]
  },

  technical_presentation: {
    primary: 'Edward Tufte',
    principles: [
      'Data-ink ratio: Every element must convey information',
      'Architecture diagrams must be clear and labeled',
      'Show tradeoffs explicitly',
      'Performance data is required',
      'Action titles even for technical content'
    ]
  },

  all_hands: {
    primary: 'Carmine Gallo',
    principles: [
      'Start with wins and celebrations',
      'Make numbers meaningful (not just big)',
      'Include human stories',
      'Keep energy high',
      'Clear call to action at the end'
    ]
  }
};
