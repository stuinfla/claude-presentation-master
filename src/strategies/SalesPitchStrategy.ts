/**
 * Sales Pitch Execution Strategy
 *
 * World-class sales presentations leverage proven persuasion methodologies:
 * - Robert Cialdini's 6 Principles of Persuasion
 * - SPIN Selling (Rackham)
 * - Challenger Sale methodology
 * - Oren Klaff's Pitch Anything (STRONG)
 * - Chris Voss's negotiation techniques
 *
 * Key Principles:
 * - Problem-agitation-solution structure
 * - Social proof and testimonials
 * - Clear ROI/value proposition
 * - Urgency and scarcity
 * - Strong call to action
 *
 * This strategy produces enterprise-grade sales decks.
 */

import type { Slide, ContentAnalysis } from '../types/index.js';
import type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';

export class SalesPitchStrategy implements ExecutionStrategy {
  type = 'sales_pitch' as const;
  name = 'Sales Pitch Deck';
  description = 'Persuasive sales presentations using Cialdini and SPIN methodologies';

  experts = {
    primary: 'Robert Cialdini (6 Principles of Persuasion)',
    secondary: [
      'Neil Rackham (SPIN Selling)',
      'Matthew Dixon (Challenger Sale)',
      'Oren Klaff (Pitch Anything)',
      'Chris Voss (Never Split the Difference)'
    ]
  };

  // Cialdini's 6 Principles mapped to slides
  cialdiniPrinciples = {
    reciprocity: 'Give value before asking',
    commitment: 'Get small yeses first',
    socialProof: 'Show who else uses it',
    authority: 'Establish credibility',
    liking: 'Build rapport and connection',
    scarcity: 'Create urgency'
  };

  // SPIN framework
  spinFramework = {
    situation: 'Understanding their current state',
    problem: 'Uncovering pain points',
    implication: 'Exploring consequences of inaction',
    needPayoff: 'Showing value of solution'
  };

  slideSequence: SlideBlueprint[] = [
    {
      id: 'title_impact',
      name: 'Opening Hook',
      type: 'title',
      required: true,
      purpose: 'Grab attention and establish relevance',
      requiredData: ['title', 'tagline'],
      optionalData: ['companyLogo'],
      wordLimits: { min: 5, max: 15, ideal: 10 },
      expertPrinciples: [
        'Lead with the outcome they want',
        'Speak to their pain directly',
        'Establish credibility immediately (Authority)',
        'Create curiosity'
      ],
      designNotes: [
        'Bold, confident statement',
        'Logo positioned professionally',
        'Clean, trustworthy design'
      ],
      example: {
        title: 'Cut Your Customer Acquisition Cost by 50%',
        subtitle: 'How 500+ companies did it'
      }
    },
    {
      id: 'problem_statement',
      name: 'Their Pain (Situation + Problem)',
      type: 'single-statement',
      required: true,
      purpose: 'Show you understand their problem deeply',
      requiredData: ['problem'],
      optionalData: ['statistics', 'industry_context'],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        'SPIN: Articulate THEIR situation',
        'Be specific - use their industry/language',
        'Cialdini Liking: Show you understand them',
        'Use "you" language, not "we"'
      ],
      designNotes: [
        'Focus on their world',
        'Empathetic, not condescending',
        'One clear problem'
      ],
      example: {
        title: 'Your sales team spends 70% of time on non-selling activities'
      }
    },
    {
      id: 'cost_of_inaction',
      name: 'Cost of Inaction (Implication)',
      type: 'big-number',
      required: true,
      purpose: 'Agitate the problem - show what inaction costs',
      requiredData: ['cost', 'timeframe'],
      optionalData: ['comparison'],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        'SPIN Implication: What happens if nothing changes?',
        'Quantify the pain ($, time, opportunities)',
        'Make it visceral and real',
        'Create urgency'
      ],
      designNotes: [
        'Big, impactful number',
        'Clear timeframe',
        'Emotional impact'
      ],
      example: {
        title: '$2.4M',
        subtitle: 'Lost revenue per year from inefficient processes'
      }
    },
    {
      id: 'solution_overview',
      name: 'Your Solution',
      type: 'single-statement',
      required: true,
      purpose: 'Present the answer to their pain',
      requiredData: ['solution', 'benefit'],
      optionalData: ['differentiator'],
      wordLimits: { min: 15, max: 40, ideal: 25 },
      expertPrinciples: [
        'SPIN Need-Payoff: Show the value',
        'Focus on outcomes, not features',
        'One clear value proposition',
        'Tie directly to their problem'
      ],
      designNotes: [
        'Simple, clear message',
        'Benefit-first language',
        'Product image optional'
      ],
      example: {
        title: 'Automate your sales workflow',
        subtitle: 'Give your team back 20 hours a week'
      }
    },
    {
      id: 'how_it_works',
      name: 'How It Works',
      type: 'bullet-points',
      required: true,
      purpose: 'Explain the mechanism simply',
      requiredData: ['steps'],
      optionalData: ['demo', 'screenshot'],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        '3 steps maximum',
        'Easy to understand in 30 seconds',
        'Show, don\'t tell (demo/screenshot)',
        'Remove friction from understanding'
      ],
      designNotes: [
        'Visual process flow',
        '1-2-3 numbered steps',
        'Icons for each step'
      ],
      example: {
        bullets: [
          '1. Connect your CRM in 2 clicks',
          '2. Our AI prioritizes your leads',
          '3. Your team focuses on closing'
        ]
      }
    },
    {
      id: 'social_proof',
      name: 'Social Proof',
      type: 'grid',
      required: true,
      purpose: 'Show who else trusts you (Cialdini Social Proof)',
      requiredData: ['logos', 'testimonials'],
      optionalData: ['metrics', 'caseStudies'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Cialdini Social Proof: "People like you use this"',
        'Relevant logos (same industry/size)',
        'Specific testimonials with names',
        'Numbers > vague claims'
      ],
      designNotes: [
        'Logo wall of customers',
        'Quote with photo and name',
        'Metrics if impressive'
      ],
      example: {
        title: 'Trusted by 500+ companies',
        bullets: [
          '"Increased our conversion by 40%" - Sarah, VP Sales at Stripe'
        ]
      }
    },
    {
      id: 'case_study',
      name: 'Case Study',
      type: 'two-column',
      required: true,
      purpose: 'Concrete proof it works',
      requiredData: ['company', 'challenge', 'result'],
      optionalData: ['quote', 'timeline'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Similar company to prospect',
        'Specific numbers and results',
        'Before/After format',
        'Quote from decision-maker'
      ],
      designNotes: [
        'Company logo prominent',
        'Before → After metrics',
        'Quote with attribution'
      ],
      example: {
        title: 'How Acme Corp increased sales 40%',
        bullets: [
          'Challenge: Low conversion rates',
          'Solution: Implemented our platform',
          'Result: 40% increase in 90 days'
        ]
      }
    },
    {
      id: 'roi_value',
      name: 'ROI / Value Calculation',
      type: 'big-number',
      required: true,
      purpose: 'Quantify the value clearly',
      requiredData: ['roi', 'timeframe'],
      optionalData: ['calculation', 'comparison'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Make the ROI undeniable',
        'Show payback period',
        'Compare to cost of status quo',
        'Conservative estimates build trust'
      ],
      designNotes: [
        'Big ROI number',
        'Show the math simply',
        'Payback timeline'
      ],
      example: {
        title: '10x ROI',
        subtitle: 'Payback in 3 months'
      }
    },
    {
      id: 'pricing',
      name: 'Pricing / Investment',
      type: 'table',
      required: true,
      purpose: 'Present the investment clearly',
      requiredData: ['pricing'],
      optionalData: ['tiers', 'comparison'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Frame as investment, not cost',
        'Anchor high if multiple tiers',
        'Cialdini Contrast: Show value vs. price',
        'Make the choice easy'
      ],
      designNotes: [
        '3 tiers typical',
        'Popular tier highlighted',
        'Clear feature differentiation'
      ],
      example: {
        title: 'Simple, Transparent Pricing'
      }
    },
    {
      id: 'objection_handling',
      name: 'Common Questions',
      type: 'bullet-points',
      required: false,
      purpose: 'Pre-emptively address objections',
      requiredData: ['questions', 'answers'],
      optionalData: [],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        'Address top 3 objections',
        'Flip concerns into benefits',
        'Be honest about limitations',
        'Chris Voss: Label their fears'
      ],
      designNotes: [
        'Q&A format',
        'Concise answers',
        'Honest and direct'
      ]
    },
    {
      id: 'urgency_scarcity',
      name: 'Limited Offer',
      type: 'single-statement',
      required: false,
      purpose: 'Create urgency (Cialdini Scarcity)',
      requiredData: ['offer', 'deadline'],
      optionalData: ['bonus'],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        'Cialdini Scarcity: Limited time/quantity',
        'Must be genuine, not manipulative',
        'Clear deadline or limit',
        'Bonus for acting now'
      ],
      designNotes: [
        'Bold offer',
        'Clear deadline',
        'Urgency indicators'
      ],
      example: {
        title: 'Start this week: Get 2 months free'
      }
    },
    {
      id: 'call_to_action',
      name: 'Call to Action',
      type: 'cta',
      required: true,
      purpose: 'Clear next step',
      requiredData: ['action', 'contact'],
      optionalData: ['calendar', 'phone'],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        'Single, clear action',
        'Low friction (book a call, not buy now)',
        'Cialdini Commitment: Small first step',
        'Multiple contact options'
      ],
      designNotes: [
        'Big CTA button/text',
        'Contact info clear',
        'Simple and direct'
      ],
      example: {
        title: 'Let\'s Talk',
        body: 'Book a 15-minute call: calendly.com/example'
      }
    }
  ];

  contentTransforms: ContentTransform[] = [
    {
      sourcePattern: /we\s+(offer|provide|have)/gi,
      transform: (match) => match.replace(/we\s+(offer|provide|have)/i, 'you get'),
      description: 'Convert "we offer" to "you get" (customer-centric language)'
    },
    {
      sourcePattern: /our\s+(product|solution|platform)/gi,
      transform: () => 'your solution',
      description: 'Convert "our product" to "your solution"'
    },
    {
      sourcePattern: /(\d+)\s*%?\s*(increase|improvement|growth)/gi,
      transform: (match) => match.toUpperCase(),
      description: 'Emphasize growth metrics'
    },
    {
      sourcePattern: /(\d+)\s*%?\s*(reduction|decrease|savings)/gi,
      transform: (match) => match.toUpperCase(),
      description: 'Emphasize savings metrics'
    }
  ];

  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      'Problem clearly articulated',
      'Cost of inaction quantified',
      'Solution tied to problem',
      'Social proof present',
      'ROI demonstrated',
      'Clear call to action'
    ],
    excellenceIndicators: [
      'Customer-centric language (you > we)',
      'Specific case study included',
      'Objections pre-handled',
      'Urgency without manipulation',
      'Multiple Cialdini principles applied'
    ]
  };

  /**
   * Generate sales pitch slides from content analysis.
   */
  async generateSlides(analysis: ContentAnalysis): Promise<Slide[]> {
    const slides: Slide[] = [];
    let index = 0;

    // Opening Hook
    slides.push({
      index: index++,
      type: 'title',
      data: {
        title: this.createHook(analysis.scqa.answer ?? analysis.keyMessages[0] ?? ''),
        subtitle: this.createCredibility(analysis),
        keyMessage: 'Opening impact'
      },
      classes: ['slide-title', 'slide-sales-pitch', 'slide-hook']
    });

    // Problem Statement (SPIN: Situation + Problem)
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.formatAsProblem(analysis.sparkline.whatIs[0] ?? analysis.scqa.complication ?? ''),
        keyMessage: 'Their pain'
      },
      classes: ['slide-problem', 'slide-sales-pitch']
    });

    // Cost of Inaction (SPIN: Implication)
    const costData = this.extractCostData(analysis);
    slides.push({
      index: index++,
      type: 'big-number',
      data: {
        title: costData.amount,
        subtitle: costData.context,
        keyMessage: 'Cost of inaction'
      },
      classes: ['slide-cost', 'slide-sales-pitch']
    });

    // Solution (SPIN: Need-Payoff)
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.formatAsSolution(analysis.scqa.answer ?? analysis.sparkline.whatCouldBe[0] ?? ''),
        keyMessage: 'Your solution'
      },
      classes: ['slide-solution', 'slide-sales-pitch']
    });

    // How It Works
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'How It Works',
        bullets: this.extractSteps(analysis),
        keyMessage: 'Simple process'
      },
      classes: ['slide-how-it-works', 'slide-sales-pitch']
    });

    // Social Proof
    slides.push({
      index: index++,
      type: 'grid',
      data: {
        title: 'Trusted by Industry Leaders',
        bullets: [
          '[Customer testimonial with name and title]',
          '[Specific result achieved]'
        ],
        keyMessage: 'Social proof'
      },
      classes: ['slide-social-proof', 'slide-sales-pitch']
    });

    // Case Study
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: 'Customer Success Story',
        body: 'Challenge → Solution → Result',
        bullets: [
          'Challenge: [Their problem]',
          'Solution: [How you helped]',
          'Result: [Quantified outcome]'
        ],
        keyMessage: 'Proof it works'
      },
      classes: ['slide-case-study', 'slide-sales-pitch']
    });

    // ROI
    const roiData = this.extractROI(analysis);
    slides.push({
      index: index++,
      type: 'big-number',
      data: {
        title: roiData.roi,
        subtitle: roiData.payback,
        keyMessage: 'Clear ROI'
      },
      classes: ['slide-roi', 'slide-sales-pitch']
    });

    // Pricing
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Investment Options',
        body: 'Choose the plan that fits your needs',
        keyMessage: 'Transparent pricing'
      },
      classes: ['slide-pricing', 'slide-sales-pitch']
    });

    // Call to Action
    slides.push({
      index: index++,
      type: 'cta',
      data: {
        title: this.createCTA(analysis.sparkline.callToAdventure),
        body: 'Book a call: [contact info]',
        keyMessage: 'Next step'
      },
      classes: ['slide-cta', 'slide-sales-pitch']
    });

    return slides;
  }

  /**
   * Validate slides against sales pitch requirements.
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

    // Check for problem
    const hasProblem = slides.some(s => s.classes?.includes('slide-problem'));
    if (!hasProblem) {
      issues.push('Missing clear problem statement');
      score -= 10;
    }

    // Check for cost of inaction
    const hasCost = slides.some(s => s.classes?.includes('slide-cost'));
    if (!hasCost) {
      issues.push('Missing cost of inaction (SPIN Implication)');
      score -= 8;
    }

    // Check for solution
    const hasSolution = slides.some(s => s.classes?.includes('slide-solution'));
    if (!hasSolution) {
      issues.push('Missing solution slide');
      score -= 10;
    }

    // Check for social proof
    const hasSocialProof = slides.some(s => s.classes?.includes('slide-social-proof'));
    if (!hasSocialProof) {
      issues.push('Missing social proof (Cialdini principle)');
      score -= 8;
    }

    // Check for ROI
    const hasROI = slides.some(s => s.classes?.includes('slide-roi'));
    if (!hasROI) {
      issues.push('Missing ROI/value slide');
      score -= 8;
    }

    // Check for CTA
    const hasCTA = slides.some(s => s.classes?.includes('slide-cta'));
    if (!hasCTA) {
      issues.push('Missing call to action');
      score -= 10;
    }

    // Check for "we" vs "you" language
    for (const slide of slides) {
      const content = JSON.stringify(slide.data).toLowerCase();
      const weCount = (content.match(/\bwe\b/g) || []).length;
      const youCount = (content.match(/\byou\b/g) || []).length;

      if (weCount > youCount * 2) {
        suggestions.push(`Slide ${slide.index + 1}: Use more "you" language (customer-centric)`);
      }
    }

    // Check for case study
    const hasCaseStudy = slides.some(s => s.classes?.includes('slide-case-study'));
    if (!hasCaseStudy) {
      suggestions.push('Consider adding a specific case study for credibility');
    }

    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Apply sales methodology to slides.
   */
  applyExpertMethodology(slides: Slide[]): Slide[] {
    return slides.map(slide => {
      // Add sales-pitch class
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes('slide-sales-pitch')) {
        slide.classes.push('slide-sales-pitch');
      }

      // Convert "we" to "you" language
      if (slide.data.title) {
        slide.data.title = this.convertToYouLanguage(slide.data.title);
      }
      if (slide.data.body) {
        slide.data.body = this.convertToYouLanguage(slide.data.body);
      }

      return slide;
    });
  }

  // === Helper Methods ===

  private createHook(text: string): string {
    if (!text) return 'Transform Your Business';

    // Make it outcome-focused
    const cleaned = text.trim();
    if (cleaned.match(/^(how|what|why)/i)) {
      return cleaned;
    }

    // Convert to result-oriented
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  private createCredibility(analysis: ContentAnalysis): string {
    for (const star of analysis.starMoments) {
      if (star.match(/\d+.*companies|customers|clients/i)) {
        return star;
      }
    }
    return 'Join 500+ companies who trust us';
  }

  private formatAsProblem(text: string): string {
    if (!text) return 'Your biggest challenge';
    const cleaned = text.replace(/^(the\s+)?problem\s+(is\s+)?/i, '').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  private formatAsSolution(text: string): string {
    if (!text) return 'Your solution is here';
    return text.replace(/\bwe\b/gi, 'you').replace(/\bour\b/gi, 'your');
  }

  private extractCostData(analysis: ContentAnalysis): { amount: string; context: string } {
    for (const star of analysis.starMoments) {
      const match = star.match(/\$[\d,.]+(?:\s*(?:million|billion|M|B|K))?/i);
      if (match) {
        return {
          amount: match[0],
          context: star.replace(match[0], '').trim() || 'lost annually'
        };
      }
    }

    return {
      amount: '$[X]',
      context: 'lost annually due to this problem'
    };
  }

  private extractSteps(analysis: ContentAnalysis): string[] {
    // Try to extract steps from key messages
    const steps = analysis.keyMessages.slice(0, 3).map((msg, i) =>
      `${i + 1}. ${msg.length > 50 ? msg.slice(0, 47) + '...' : msg}`
    );

    if (steps.length === 0) {
      return [
        '1. Connect in 2 minutes',
        '2. Our system does the work',
        '3. You see results'
      ];
    }

    return steps;
  }

  private extractROI(analysis: ContentAnalysis): { roi: string; payback: string } {
    for (const star of analysis.starMoments) {
      const match = star.match(/(\d+)x\s*(?:ROI|return)/i);
      if (match) {
        return {
          roi: `${match[1]}x ROI`,
          payback: 'Payback in 90 days'
        };
      }
    }

    return {
      roi: '[X]x ROI',
      payback: 'Payback in [Y] days'
    };
  }

  private createCTA(callToAdventure: string | null): string {
    if (callToAdventure) {
      return callToAdventure;
    }
    return 'Let\'s Talk';
  }

  private convertToYouLanguage(text: string): string {
    return text
      .replace(/\bwe offer\b/gi, 'you get')
      .replace(/\bour (product|solution|platform|system)\b/gi, 'your $1')
      .replace(/\bwe provide\b/gi, 'you receive')
      .replace(/\bwe help\b/gi, 'you\'ll have');
  }
}
