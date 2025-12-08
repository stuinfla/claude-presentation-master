/**
 * Investor/VC Pitch Deck Execution Strategy
 *
 * World-class investor presentations follow proven structures:
 * - Sequoia Capital pitch deck template
 * - Y Combinator demo day format
 * - First Round Capital best practices
 *
 * Key Principles:
 * - 10-15 slides maximum
 * - Market size with TAM/SAM/SOM
 * - Traction with real numbers
 * - Team credibility essential
 * - Clear ask with use of funds
 *
 * This strategy produces Series A/B quality pitch decks.
 */

import type { Slide, ContentAnalysis } from '../types/index.js';
import type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';

export class InvestorPitchStrategy implements ExecutionStrategy {
  type = 'investor_pitch' as const;
  name = 'VC/Investor Pitch Deck';
  description = 'Venture capital pitch decks following Sequoia/YC format';

  experts = {
    primary: 'Sequoia Capital Pitch Deck Template',
    secondary: [
      'Y Combinator (Demo Day Format)',
      'First Round Capital',
      'Bessemer Venture Partners',
      'DocSend Pitch Deck Research'
    ]
  };

  // Famous pitch deck insights
  referenceDecks = {
    airbnb: {
      slides: 10,
      keyElements: ['Problem/Solution clarity', 'Market validation', 'Simple metrics'],
      lesson: 'Keep it simple, show the opportunity'
    },
    linkedin: {
      slides: 15,
      keyElements: ['Network effects', 'Viral growth model', 'Monetization path'],
      lesson: 'Show how growth compounds'
    },
    uber: {
      slides: 12,
      keyElements: ['Market size', 'Unit economics', 'Expansion strategy'],
      lesson: 'Demonstrate massive market opportunity'
    },
    buffer: {
      slides: 10,
      keyElements: ['Transparency', 'Real metrics', 'Authentic story'],
      lesson: 'Honesty and real numbers win'
    }
  };

  slideSequence: SlideBlueprint[] = [
    {
      id: 'title_company',
      name: 'Title / Company Purpose',
      type: 'title',
      required: true,
      purpose: 'Hook investors with a powerful one-liner',
      requiredData: ['companyName', 'tagline'],
      optionalData: ['logo'],
      wordLimits: { min: 3, max: 15, ideal: 8 },
      expertPrinciples: [
        'One sentence that explains what you do',
        'Must be instantly understandable',
        'Avoid jargon and buzzwords',
        'Y Combinator: "What do you make?"'
      ],
      designNotes: [
        'Logo prominent',
        'Tagline large and clear',
        'Minimal visual clutter',
        'Contact info optional'
      ],
      example: {
        title: 'Airbnb',
        subtitle: 'Book rooms with locals, rather than hotels'
      }
    },
    {
      id: 'problem',
      name: 'The Problem',
      type: 'single-statement',
      required: true,
      purpose: 'Make investors FEEL the pain',
      requiredData: ['problem', 'impact'],
      optionalData: ['statistics'],
      wordLimits: { min: 10, max: 40, ideal: 25 },
      expertPrinciples: [
        'Be specific, not abstract',
        'Quantify the pain if possible',
        'Personal story is powerful',
        'Investors must believe this problem exists'
      ],
      designNotes: [
        'One clear problem statement',
        'Supporting stat if available',
        'Visual representation of pain'
      ],
      example: {
        title: 'Hotels are expensive and impersonal',
        subtitle: 'Travelers pay $150/night for cookie-cutter rooms'
      }
    },
    {
      id: 'solution',
      name: 'Your Solution',
      type: 'single-statement',
      required: true,
      purpose: 'Clear explanation of what you built',
      requiredData: ['solution', 'howItWorks'],
      optionalData: ['demo', 'screenshot'],
      wordLimits: { min: 10, max: 40, ideal: 25 },
      expertPrinciples: [
        'Explain in one sentence',
        'Show, don\'t tell (screenshot/demo)',
        'Focus on user benefit, not features',
        'How does it solve the problem above?'
      ],
      designNotes: [
        'Product screenshot or demo',
        'Simple explanation',
        'Before/After if applicable'
      ],
      example: {
        title: 'We let people book rooms with locals',
        subtitle: 'Unique stays at half the price'
      }
    },
    {
      id: 'why_now',
      name: 'Why Now?',
      type: 'bullet-points',
      required: true,
      purpose: 'Explain the market timing',
      requiredData: ['marketShifts', 'timing'],
      optionalData: ['trends'],
      wordLimits: { min: 20, max: 60, ideal: 40 },
      expertPrinciples: [
        'Why hasn\'t this been built before?',
        'What changed recently?',
        'Technology shift, behavior shift, regulation shift',
        'Urgency is key'
      ],
      designNotes: [
        '3-4 key reasons',
        'Each with clear evidence',
        'Timeline if relevant'
      ],
      example: {
        bullets: [
          'Mobile phones in everyone\'s pocket',
          'Trust in strangers normalized (eBay, rideshare)',
          'Travel demand at all-time high'
        ]
      }
    },
    {
      id: 'market_size',
      name: 'Market Size (TAM/SAM/SOM)',
      type: 'big-number',
      required: true,
      purpose: 'Show the opportunity is HUGE',
      requiredData: ['tam', 'sam', 'som'],
      optionalData: ['sources', 'growthRate'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'TAM: Total addressable market',
        'SAM: Serviceable addressable market',
        'SOM: Serviceable obtainable market',
        'MUST cite sources',
        'Bottom-up analysis preferred'
      ],
      designNotes: [
        'Nested circles or bars',
        'Clear $X B/M numbers',
        'Source at bottom',
        'Growth rate highlighted'
      ],
      example: {
        title: '$532B',
        subtitle: 'Global accommodation market'
      }
    },
    {
      id: 'product',
      name: 'Product / How It Works',
      type: 'two-column',
      required: true,
      purpose: 'Show the product in action',
      requiredData: ['productDescription', 'keyFeatures'],
      optionalData: ['screenshots', 'demo'],
      wordLimits: { min: 20, max: 60, ideal: 40 },
      expertPrinciples: [
        'Screenshot or demo video',
        '3 key features max',
        'Focus on user experience',
        'Show, don\'t tell'
      ],
      designNotes: [
        'Product screenshot prominent',
        'Feature callouts',
        'User testimonial optional'
      ]
    },
    {
      id: 'business_model',
      name: 'Business Model',
      type: 'bullet-points',
      required: true,
      purpose: 'How you make money',
      requiredData: ['revenueModel', 'pricing'],
      optionalData: ['unitEconomics', 'ltv', 'cac'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Clear revenue streams',
        'Unit economics if available',
        'LTV:CAC ratio if known',
        'Path to profitability'
      ],
      designNotes: [
        'Simple diagram if needed',
        'Key metrics highlighted',
        'Pricing tiers if B2B'
      ],
      example: {
        bullets: [
          '10% commission on each booking',
          'LTV: $1,200 | CAC: $120 | LTV:CAC: 10:1',
          'Gross margin: 85%'
        ]
      }
    },
    {
      id: 'traction',
      name: 'Traction / Metrics',
      type: 'big-number',
      required: true,
      purpose: 'Prove you\'re not just an idea',
      requiredData: ['metrics'],
      optionalData: ['growth', 'milestones'],
      wordLimits: { min: 15, max: 50, ideal: 30 },
      expertPrinciples: [
        'Real numbers only - no vanity metrics',
        'Show growth rate (MoM, YoY)',
        'Revenue, users, engagement - pick strongest',
        'Up-and-to-the-right chart'
      ],
      designNotes: [
        'One primary metric BIG',
        'Growth chart if impressive',
        'Milestone timeline optional'
      ],
      example: {
        title: '$2.5M ARR',
        subtitle: 'Growing 25% MoM'
      }
    },
    {
      id: 'competition',
      name: 'Competition / Differentiation',
      type: 'table',
      required: true,
      purpose: 'Show awareness of landscape and your edge',
      requiredData: ['competitors', 'differentiation'],
      optionalData: ['positioningMatrix'],
      wordLimits: { min: 25, max: 60, ideal: 45 },
      expertPrinciples: [
        'Never say "no competition"',
        '2x2 matrix is classic',
        'Your company in top-right',
        'Focus on your unique angle'
      ],
      designNotes: [
        '2x2 positioning matrix OR',
        'Feature comparison table',
        'You highlighted'
      ],
      example: {
        title: 'We\'re the only platform that...'
      }
    },
    {
      id: 'team',
      name: 'Team',
      type: 'grid',
      required: true,
      purpose: 'Why THIS team will win',
      requiredData: ['founders', 'expertise'],
      optionalData: ['advisors', 'hiresNeeded'],
      wordLimits: { min: 30, max: 80, ideal: 55 },
      expertPrinciples: [
        'Relevant experience highlighted',
        'Past wins/exits mentioned',
        'Why you\'re uniquely qualified',
        'Advisors if impressive'
      ],
      designNotes: [
        'Photos if available',
        'Key credentials (logos)',
        '2-3 founders max featured',
        'LinkedIn-style layout'
      ],
      example: {
        bullets: [
          'CEO: Former Booking.com, scaled to $1B',
          'CTO: Ex-Google, built Maps team',
          'COO: 3x founder, 2 exits'
        ]
      }
    },
    {
      id: 'financials',
      name: 'Financial Projections',
      type: 'table',
      required: true,
      purpose: 'Show the path to scale',
      requiredData: ['projections'],
      optionalData: ['assumptions', 'milestones'],
      wordLimits: { min: 20, max: 60, ideal: 40 },
      expertPrinciples: [
        '3-5 year projections',
        'Bottom-up, not top-down',
        'Be able to defend assumptions',
        'Show path to profitability'
      ],
      designNotes: [
        'Simple chart or table',
        'Key milestones marked',
        'Break-even highlighted'
      ]
    },
    {
      id: 'the_ask',
      name: 'The Ask',
      type: 'cta',
      required: true,
      purpose: 'Clear funding request and use of funds',
      requiredData: ['amount', 'useOfFunds'],
      optionalData: ['terms', 'timeline'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Specific amount requested',
        'Clear use of funds',
        '18-24 month runway typically',
        'What milestones will this achieve?'
      ],
      designNotes: [
        'Amount prominent',
        'Pie chart for use of funds',
        'Next milestones listed'
      ],
      example: {
        title: 'Raising $5M Series A',
        bullets: [
          '40% - Engineering (hire 5)',
          '30% - Sales & Marketing',
          '20% - Operations',
          '10% - G&A'
        ]
      }
    }
  ];

  contentTransforms: ContentTransform[] = [
    {
      sourcePattern: /(\d+)\s*(?:monthly active users?|MAU)/gi,
      transform: (match) => {
        const num = parseInt(match.match(/\d+/)?.[0] ?? '0');
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M MAU`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K MAU`;
        return `${num} MAU`;
      },
      description: 'Format user metrics'
    },
    {
      sourcePattern: /(\d+)%?\s*(?:month over month|MoM|mom)/gi,
      transform: (match) => {
        const num = parseInt(match.match(/\d+/)?.[0] ?? '0');
        return `${num}% MoM`;
      },
      description: 'Standardize growth rate format'
    },
    {
      sourcePattern: /(\d+(?:\.\d+)?)\s*(?:million|M)\s*(?:ARR|arr)/gi,
      transform: (match) => {
        const num = parseFloat(match.match(/[\d.]+/)?.[0] ?? '0');
        return `$${num.toFixed(1)}M ARR`;
      },
      description: 'Format ARR metrics'
    }
  ];

  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      'Problem clearly articulated',
      'Solution clearly solves the problem',
      'Market size sourced (TAM/SAM/SOM)',
      'Traction with real numbers',
      'Team credentials clear',
      'Ask is specific with use of funds'
    ],
    excellenceIndicators: [
      'Compelling "why now" narrative',
      'Strong unit economics',
      'Clear competitive differentiation',
      'Realistic but ambitious projections',
      'Deck under 15 slides'
    ]
  };

  /**
   * Generate investor pitch slides from content analysis.
   */
  async generateSlides(analysis: ContentAnalysis): Promise<Slide[]> {
    const slides: Slide[] = [];
    let index = 0;

    // Title / Company Purpose
    slides.push({
      index: index++,
      type: 'title',
      data: {
        title: analysis.scqa.answer ? this.extractCompanyName(analysis.scqa.answer) : 'Company Name',
        subtitle: this.createTagline(analysis.scqa.answer ?? analysis.keyMessages[0] ?? ''),
        keyMessage: 'Company purpose'
      },
      classes: ['slide-title', 'slide-investor-pitch']
    });

    // Problem
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.formatAsProblem(analysis.sparkline.whatIs[0] ?? analysis.scqa.complication ?? ''),
        keyMessage: 'The problem we solve'
      },
      classes: ['slide-problem', 'slide-investor-pitch']
    });

    // Solution
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.formatAsSolution(analysis.scqa.answer ?? analysis.sparkline.whatCouldBe[0] ?? ''),
        keyMessage: 'Our solution'
      },
      classes: ['slide-solution', 'slide-investor-pitch']
    });

    // Why Now
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Why Now?',
        bullets: this.extractWhyNow(analysis),
        keyMessage: 'Market timing'
      },
      classes: ['slide-why-now', 'slide-investor-pitch']
    });

    // Market Size
    const marketData = this.extractMarketData(analysis);
    slides.push({
      index: index++,
      type: 'big-number',
      data: {
        title: marketData.tam,
        subtitle: 'Total Addressable Market',
        bullets: [
          `SAM: ${marketData.sam}`,
          `SOM: ${marketData.som}`
        ],
        keyMessage: 'Market opportunity'
      },
      classes: ['slide-market-size', 'slide-investor-pitch']
    });

    // Product
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: 'How It Works',
        body: analysis.scqa.answer ?? 'Product description',
        bullets: analysis.keyMessages.slice(0, 3),
        keyMessage: 'Product overview'
      },
      classes: ['slide-product', 'slide-investor-pitch']
    });

    // Business Model
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Business Model',
        bullets: [
          'Revenue model: [Primary revenue stream]',
          'Pricing: [Pricing structure]',
          'Unit economics: LTV $[X] | CAC $[Y]'
        ],
        keyMessage: 'How we make money'
      },
      classes: ['slide-business-model', 'slide-investor-pitch']
    });

    // Traction
    const tractionData = this.extractTraction(analysis);
    slides.push({
      index: index++,
      type: 'big-number',
      data: {
        title: tractionData.primaryMetric,
        subtitle: tractionData.growth,
        body: 'Key milestones achieved',
        keyMessage: 'Proof of traction'
      },
      classes: ['slide-traction', 'slide-investor-pitch']
    });

    // Competition
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Competitive Landscape',
        body: 'We\'re uniquely positioned because...',
        keyMessage: 'Our differentiation'
      },
      classes: ['slide-competition', 'slide-investor-pitch']
    });

    // Team
    slides.push({
      index: index++,
      type: 'grid',
      data: {
        title: 'The Team',
        bullets: [
          'Founder 1: [Role] - [Relevant experience]',
          'Founder 2: [Role] - [Relevant experience]',
          'Advisors: [Key advisors]'
        ],
        keyMessage: 'Why we\'ll win'
      },
      classes: ['slide-team', 'slide-investor-pitch']
    });

    // Financials
    slides.push({
      index: index++,
      type: 'table',
      data: {
        title: 'Financial Projections',
        body: '3-year revenue projection',
        keyMessage: 'Path to scale'
      },
      classes: ['slide-financials', 'slide-investor-pitch']
    });

    // The Ask
    slides.push({
      index: index++,
      type: 'cta',
      data: {
        title: 'Raising $[X]M [Round]',
        bullets: [
          '[X]% - Engineering',
          '[Y]% - Sales & Marketing',
          '[Z]% - Operations'
        ],
        body: 'This will achieve: [Key milestones]',
        keyMessage: 'Our ask'
      },
      classes: ['slide-ask', 'slide-investor-pitch']
    });

    return slides;
  }

  /**
   * Validate slides against investor pitch requirements.
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

    // Check slide count
    if (slides.length > 15) {
      issues.push(`Deck has ${slides.length} slides - should be 10-15 max`);
      score -= 5;
    }

    // Check for problem slide
    const hasProblem = slides.some(s => s.classes?.includes('slide-problem'));
    if (!hasProblem) {
      issues.push('Missing clear problem statement');
      score -= 10;
    }

    // Check for solution slide
    const hasSolution = slides.some(s => s.classes?.includes('slide-solution'));
    if (!hasSolution) {
      issues.push('Missing solution slide');
      score -= 10;
    }

    // Check for market size
    const hasMarket = slides.some(s => s.classes?.includes('slide-market-size'));
    if (!hasMarket) {
      issues.push('Missing market size (TAM/SAM/SOM)');
      score -= 10;
    }

    // Check for traction
    const hasTraction = slides.some(s => s.classes?.includes('slide-traction'));
    if (!hasTraction) {
      issues.push('Missing traction/metrics slide');
      score -= 10;
    }

    // Check for team
    const hasTeam = slides.some(s => s.classes?.includes('slide-team'));
    if (!hasTeam) {
      issues.push('Missing team slide');
      score -= 8;
    }

    // Check for ask
    const hasAsk = slides.some(s => s.classes?.includes('slide-ask'));
    if (!hasAsk) {
      issues.push('Missing "The Ask" slide with use of funds');
      score -= 10;
    }

    // Suggestions
    const hasWhyNow = slides.some(s => s.classes?.includes('slide-why-now'));
    if (!hasWhyNow) {
      suggestions.push('Consider adding "Why Now?" slide for stronger narrative');
    }

    const hasCompetition = slides.some(s => s.classes?.includes('slide-competition'));
    if (!hasCompetition) {
      suggestions.push('Consider adding competitive landscape/differentiation');
    }

    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Apply investor pitch methodology to slides.
   */
  applyExpertMethodology(slides: Slide[]): Slide[] {
    return slides.map(slide => {
      // Add investor-pitch class
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes('slide-investor-pitch')) {
        slide.classes.push('slide-investor-pitch');
      }

      // Format metrics consistently
      if (slide.data.title) {
        slide.data.title = this.formatMetrics(slide.data.title);
      }

      return slide;
    });
  }

  // === Helper Methods ===

  private extractCompanyName(text: string): string {
    // Try to extract a company name from the text
    const match = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/);
    return match?.[0] ?? 'Company Name';
  }

  private createTagline(text: string): string {
    // Create a short, punchy tagline
    const words = text.split(/\s+/).slice(0, 10);
    return words.join(' ');
  }

  private formatAsProblem(text: string): string {
    if (!text) return 'The problem we solve';
    // Make it sound like a problem
    const cleaned = text.replace(/^(the\s+)?problem\s+(is\s+)?/i, '').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  private formatAsSolution(text: string): string {
    if (!text) return 'Our solution';
    // Make it action-oriented
    const cleaned = text.replace(/^(we\s+)?(our\s+)?solution\s+(is\s+)?/i, '').trim();
    if (!cleaned.match(/^we\s/i)) {
      return 'We ' + cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    }
    return cleaned;
  }

  private extractWhyNow(analysis: ContentAnalysis): string[] {
    const reasons: string[] = [];

    // Look for trend indicators
    if (analysis.sparkline.whatIs.length > 0) {
      reasons.push(`Market shift: ${analysis.sparkline.whatIs[0]?.slice(0, 50)}`);
    }

    // Default reasons if none found
    if (reasons.length === 0) {
      reasons.push(
        'Technology enabler: [New technology/platform]',
        'Behavior change: [Changed user expectations]',
        'Market timing: [Why the market is ready now]'
      );
    }

    return reasons.slice(0, 4);
  }

  private extractMarketData(analysis: ContentAnalysis): {
    tam: string;
    sam: string;
    som: string;
  } {
    // Look for market size data in analysis
    for (const star of analysis.starMoments) {
      const match = star.match(/\$[\d,.]+\s*(?:billion|B)/i);
      if (match) {
        return {
          tam: match[0],
          sam: '[SAM calculation]',
          som: '[SOM calculation]'
        };
      }
    }

    return {
      tam: '$[X]B',
      sam: '$[Y]B',
      som: '$[Z]M'
    };
  }

  private extractTraction(analysis: ContentAnalysis): {
    primaryMetric: string;
    growth: string;
  } {
    // Look for traction data
    for (const star of analysis.starMoments) {
      const revenueMatch = star.match(/\$[\d,.]+\s*(?:million|M|ARR)/i);
      const growthMatch = star.match(/(\d+)%?\s*(?:growth|MoM|YoY)/i);

      if (revenueMatch) {
        return {
          primaryMetric: revenueMatch[0],
          growth: growthMatch ? `${growthMatch[1]}% growth` : 'Growing fast'
        };
      }
    }

    return {
      primaryMetric: '$[X]M ARR',
      growth: '[Y]% MoM growth'
    };
  }

  private formatMetrics(text: string): string {
    return text
      .replace(/(\d+)\s*(?:million|M)\s*(?:users?)/gi, (_, n) => `${parseInt(n).toLocaleString()}M users`)
      .replace(/(\d+(?:\.\d+)?)\s*(?:million|M)\s*(?:ARR)/gi, (_, n) => `$${parseFloat(n).toFixed(1)}M ARR`)
      .replace(/(\d+)%?\s*(?:MoM|month.over.month)/gi, (_, n) => `${n}% MoM`);
  }
}
