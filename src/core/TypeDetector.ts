/**
 * Presentation Type Detector
 *
 * Determines the appropriate presentation type based on:
 * 1. Explicit presentationType configuration
 * 2. Audience specification
 * 3. Goal specification
 * 4. Keyword analysis of content
 * 5. Legacy mode fallback
 *
 * Each presentation type has distinct validation rules that do not conflict.
 */

import type { PresentationConfig, PresentationType, PresentationTypeRules } from '../types/index.js';

/**
 * Mapping from audience to presentation type
 */
const AUDIENCE_TO_TYPE: Record<string, PresentationType> = {
  'board_of_directors': 'consulting_deck',
  'sales_prospect': 'sales_pitch',
  'investors_vcs': 'investor_pitch',
  'general_audience_keynote': 'ted_keynote',
  'technical_team': 'technical_presentation',
  'all_hands_meeting': 'all_hands'
};

/**
 * Mapping from goal to presentation type
 */
const GOAL_TO_TYPE: Record<string, PresentationType> = {
  'get_approval': 'consulting_deck',
  'inform_educate': 'technical_presentation',
  'persuade_sell': 'sales_pitch',
  'inspire_motivate': 'ted_keynote',
  'report_results': 'consulting_deck',
  'raise_funding': 'investor_pitch'
};

/**
 * Keywords that trigger specific presentation types
 */
const KEYWORD_TRIGGERS: Record<PresentationType, string[]> = {
  'ted_keynote': ['TED', 'TEDx', 'keynote', 'inspire', 'motivational', 'launch event'],
  'sales_pitch': ['sales', 'customer', 'prospect', 'demo', 'pitch', 'convert'],
  'consulting_deck': ['McKinsey', 'BCG', 'consulting', 'strategy', 'board', 'executive', 'recommendation'],
  'investment_banking': ['M&A', 'IPO', 'valuation', 'pitch book', 'investment bank', 'due diligence', 'fairness opinion'],
  'investor_pitch': ['investor', 'VC', 'venture', 'fundraising', 'Series A', 'seed', 'angel'],
  'technical_presentation': ['architecture', 'engineering', 'technical', 'code', 'system design', 'API'],
  'all_hands': ['all-hands', 'town hall', 'company update', 'quarterly', 'team meeting']
};

/**
 * Mapping from legacy mode to default presentation type
 */
const MODE_TO_TYPE: Record<string, PresentationType> = {
  'keynote': 'ted_keynote',
  'business': 'consulting_deck'
};

/**
 * Validation rules for each presentation type
 */
export const PRESENTATION_TYPE_RULES: Record<PresentationType, PresentationTypeRules> = {
  'ted_keynote': {
    id: 'ted_keynote',
    name: 'TED-Style Keynote',
    description: 'High-impact inspirational presentations for general audiences',
    wordsPerSlide: { min: 1, max: 15, ideal: 8 },
    whitespace: { min: 40, ideal: 50 },
    bulletsPerSlide: { max: 0 },  // NO bullets
    actionTitlesRequired: false,
    sourcesRequired: false,
    scoringWeights: {
      visual_quality: 40,
      content_quality: 25,
      expert_compliance: 25,
      accessibility: 10
    }
  },
  'sales_pitch': {
    id: 'sales_pitch',
    name: 'Sales Pitch Deck',
    description: 'Persuasive presentations to convert prospects',
    wordsPerSlide: { min: 10, max: 30, ideal: 20 },
    whitespace: { min: 35, ideal: 40 },
    bulletsPerSlide: { max: 4 },
    actionTitlesRequired: false,
    sourcesRequired: false,
    scoringWeights: {
      visual_quality: 35,
      content_quality: 30,
      expert_compliance: 25,
      accessibility: 10
    }
  },
  'consulting_deck': {
    id: 'consulting_deck',
    name: 'McKinsey/BCG Consulting Deck',
    description: 'Data-driven executive presentations with rigorous structure',
    wordsPerSlide: { min: 40, max: 80, ideal: 60 },
    whitespace: { min: 25, ideal: 30, max: 35 },
    bulletsPerSlide: { max: 5 },
    actionTitlesRequired: true,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 25,
      content_quality: 35,
      expert_compliance: 30,
      accessibility: 10
    }
  },
  'investment_banking': {
    id: 'investment_banking',
    name: 'Investment Banking Pitch Book',
    description: 'Financial presentations for M&A, IPO, and capital raising',
    wordsPerSlide: { min: 50, max: 120, ideal: 80 },
    whitespace: { min: 20, ideal: 25, max: 30 },
    bulletsPerSlide: { max: 7 },
    actionTitlesRequired: true,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 20,
      content_quality: 40,
      expert_compliance: 30,
      accessibility: 10
    }
  },
  'investor_pitch': {
    id: 'investor_pitch',
    name: 'Investor/VC Pitch Deck',
    description: 'Startup fundraising presentations',
    wordsPerSlide: { min: 20, max: 50, ideal: 35 },
    whitespace: { min: 30, ideal: 35 },
    bulletsPerSlide: { max: 4 },
    actionTitlesRequired: false,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 30,
      content_quality: 35,
      expert_compliance: 25,
      accessibility: 10
    }
  },
  'technical_presentation': {
    id: 'technical_presentation',
    name: 'Technical/Engineering Presentation',
    description: 'Detailed technical presentations for engineering audiences',
    wordsPerSlide: { min: 40, max: 100, ideal: 70 },
    whitespace: { min: 25, ideal: 30 },
    bulletsPerSlide: { max: 7 },
    actionTitlesRequired: true,
    sourcesRequired: true,
    scoringWeights: {
      visual_quality: 25,
      content_quality: 35,
      expert_compliance: 30,
      accessibility: 10
    }
  },
  'all_hands': {
    id: 'all_hands',
    name: 'All-Hands/Company Update',
    description: 'Internal company-wide updates and announcements',
    wordsPerSlide: { min: 15, max: 40, ideal: 25 },
    whitespace: { min: 35, ideal: 40 },
    bulletsPerSlide: { max: 5 },
    actionTitlesRequired: false,
    sourcesRequired: false,
    scoringWeights: {
      visual_quality: 35,
      content_quality: 30,
      expert_compliance: 25,
      accessibility: 10
    }
  }
};

export class TypeDetector {
  /**
   * Detect the presentation type from configuration.
   * Priority:
   * 1. Explicit presentationType
   * 2. Audience mapping
   * 3. Goal mapping
   * 4. Content keyword analysis
   * 5. Legacy mode fallback
   */
  detectType(config: PresentationConfig): PresentationType {
    // 1. Explicit presentation type
    if (config.presentationType) {
      console.log(`📋 Using explicit presentation type: ${config.presentationType}`);
      return config.presentationType;
    }

    // 2. Audience-based detection
    if (config.audience) {
      const type = AUDIENCE_TO_TYPE[config.audience];
      if (type) {
        console.log(`👥 Detected type from audience (${config.audience}): ${type}`);
        return type;
      }
    }

    // 3. Goal-based detection
    if (config.goal) {
      const type = GOAL_TO_TYPE[config.goal];
      if (type) {
        console.log(`🎯 Detected type from goal (${config.goal}): ${type}`);
        return type;
      }
    }

    // 4. Keyword-based detection from content and title
    const textToAnalyze = `${config.title} ${config.content}`.toLowerCase();
    const keywordType = this.detectFromKeywords(textToAnalyze);
    if (keywordType) {
      console.log(`🔍 Detected type from keywords: ${keywordType}`);
      return keywordType;
    }

    // 5. Legacy mode fallback
    const fallbackType = MODE_TO_TYPE[config.mode] || 'consulting_deck';
    console.log(`⚙️  Using legacy mode fallback (${config.mode}): ${fallbackType}`);
    return fallbackType;
  }

  /**
   * Detect presentation type from keyword analysis.
   */
  private detectFromKeywords(text: string): PresentationType | null {
    const scores: Record<PresentationType, number> = {
      'ted_keynote': 0,
      'sales_pitch': 0,
      'consulting_deck': 0,
      'investment_banking': 0,
      'investor_pitch': 0,
      'technical_presentation': 0,
      'all_hands': 0
    };

    // Count keyword matches
    for (const [type, keywords] of Object.entries(KEYWORD_TRIGGERS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          scores[type as PresentationType]++;
        }
      }
    }

    // Find the type with the highest score
    let maxScore = 0;
    let bestType: PresentationType | null = null;

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestType = type as PresentationType;
      }
    }

    // Only return if we found at least one match
    return maxScore > 0 ? bestType : null;
  }

  /**
   * Get validation rules for a presentation type.
   */
  getRules(type: PresentationType): PresentationTypeRules {
    return PRESENTATION_TYPE_RULES[type];
  }

  /**
   * Get all available presentation types.
   */
  getAvailableTypes(): PresentationType[] {
    return Object.keys(PRESENTATION_TYPE_RULES) as PresentationType[];
  }

  /**
   * Map legacy mode to a presentation type.
   */
  modeToType(mode: 'keynote' | 'business'): PresentationType {
    return MODE_TO_TYPE[mode] ?? 'consulting_deck';
  }

  /**
   * Map presentation type back to legacy mode for compatibility.
   */
  typeToMode(type: PresentationType): 'keynote' | 'business' {
    // Map presentation types to their closest legacy mode
    switch (type) {
      case 'ted_keynote':
      case 'sales_pitch':
      case 'all_hands':
        return 'keynote';
      case 'consulting_deck':
      case 'investment_banking':
      case 'investor_pitch':
      case 'technical_presentation':
        return 'business';
      default:
        return 'business';
    }
  }

  /**
   * Get word limits for a presentation type.
   */
  getWordLimits(type: PresentationType): { min: number; max: number; ideal: number } {
    return PRESENTATION_TYPE_RULES[type].wordsPerSlide;
  }

  /**
   * Check if action titles are required for a type.
   */
  requiresActionTitles(type: PresentationType): boolean {
    return PRESENTATION_TYPE_RULES[type].actionTitlesRequired;
  }

  /**
   * Check if sources are required for a type.
   */
  requiresSources(type: PresentationType): boolean {
    return PRESENTATION_TYPE_RULES[type].sourcesRequired;
  }

  /**
   * Get scoring weights for a presentation type.
   */
  getScoringWeights(type: PresentationType): {
    visual_quality: number;
    content_quality: number;
    expert_compliance: number;
    accessibility: number;
  } {
    return PRESENTATION_TYPE_RULES[type].scoringWeights;
  }
}
