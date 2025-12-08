/**
 * All-Hands Meeting Execution Strategy
 *
 * World-class all-hands presentations follow engagement best practices:
 * - Carmine Gallo's Talk Like TED principles
 * - Company culture and celebration focus
 * - Transparent communication
 * - Energy and motivation
 *
 * Key Principles:
 * - Start with wins and celebrations
 * - Make numbers meaningful (not just big)
 * - Include human stories
 * - Keep energy high
 * - Clear call to action at the end
 *
 * This strategy produces engaging company-wide presentations.
 */

import type { Slide, ContentAnalysis } from '../types/index.js';
import type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';

export class AllHandsStrategy implements ExecutionStrategy {
  type = 'all_hands' as const;
  name = 'All-Hands Meeting';
  description = 'Engaging company-wide presentations that inform and inspire';

  experts = {
    primary: 'Carmine Gallo (Talk Like TED)',
    secondary: [
      'Nancy Duarte (Sparkline for internal comms)',
      'Brené Brown (Vulnerability in leadership)',
      'Simon Sinek (Start With Why)',
      'Pat Lencioni (Team Health)'
    ]
  };

  // Engagement principles
  engagementPrinciples = {
    emotionalArc: 'Start positive, address challenges, end with inspiration',
    storyTelling: 'Include at least one human story',
    numbers: 'Make metrics meaningful with context',
    recognition: 'Celebrate team and individual wins',
    transparency: 'Be honest about challenges',
    callToAction: 'Clear ask or focus for the team'
  };

  slideSequence: SlideBlueprint[] = [
    {
      id: 'title_energy',
      name: 'Opening Title',
      type: 'title',
      required: true,
      purpose: 'Set the energy and theme',
      requiredData: ['title', 'theme'],
      optionalData: ['date', 'eventName'],
      wordLimits: { min: 3, max: 15, ideal: 8 },
      expertPrinciples: [
        'Energizing, not boring',
        'Theme or focus for this period',
        'Sets the tone for the meeting',
        'Visual interest'
      ],
      designNotes: [
        'Bold, exciting design',
        'Company branding',
        'Theme visual'
      ],
      example: {
        title: 'Q4 All-Hands: Finishing Strong',
        subtitle: 'December 2024'
      }
    },
    {
      id: 'wins_celebration',
      name: 'Wins & Celebrations',
      type: 'grid',
      required: true,
      purpose: 'Start positive - celebrate recent wins',
      requiredData: ['wins'],
      optionalData: ['teamRecognition', 'milestones'],
      wordLimits: { min: 30, max: 70, ideal: 50 },
      expertPrinciples: [
        'ALWAYS start with wins',
        'Name individuals and teams',
        'Mix big and small wins',
        'Create positive momentum'
      ],
      designNotes: [
        'Celebratory design',
        'Team photos if available',
        'Achievement badges/icons'
      ],
      example: {
        title: 'Celebrating Our Wins! 🎉',
        bullets: [
          'Shipped v2.0 ahead of schedule - Engineering team',
          'Won Acme Corp ($500K ARR) - Sales team',
          'NPS up 20 points - Customer Success'
        ]
      }
    },
    {
      id: 'key_metrics',
      name: 'Key Metrics Overview',
      type: 'big-number',
      required: true,
      purpose: 'Business health at a glance',
      requiredData: ['metrics'],
      optionalData: ['comparison', 'trends'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Make numbers meaningful',
        'Compare to goals or previous period',
        'Color-code up/down trends',
        'Keep it to 3-5 key metrics'
      ],
      designNotes: [
        'Dashboard-style layout',
        'Green/red trend arrows',
        'Clear labels'
      ],
      example: {
        title: '$12.5M ARR',
        subtitle: '↑ 25% from last quarter | 104% to goal'
      }
    },
    {
      id: 'metric_deep_dive',
      name: 'Metric Deep Dive',
      type: 'two-column',
      required: true,
      purpose: 'Explain the story behind key numbers',
      requiredData: ['metric', 'explanation'],
      optionalData: ['chart', 'context'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Context matters more than numbers',
        'Explain what drove the change',
        'Connect to company goals',
        'Be honest about misses too'
      ],
      designNotes: [
        'Chart on left, context on right',
        'Trend visualization',
        'Key driver callouts'
      ]
    },
    {
      id: 'customer_story',
      name: 'Customer Spotlight',
      type: 'two-column',
      required: false,
      purpose: 'Bring customer impact to life',
      requiredData: ['story'],
      optionalData: ['quote', 'photo', 'metrics'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Human story, not just metrics',
        'Show real impact',
        'Include quote if possible',
        'Connect work to purpose'
      ],
      designNotes: [
        'Customer photo/logo',
        'Quote prominent',
        'Impact metrics'
      ],
      example: {
        title: 'Customer Spotlight: How we helped Sarah at Acme',
        bullets: [
          '"Your product saved us 10 hours a week"',
          'Impact: $100K cost savings for their team'
        ]
      }
    },
    {
      id: 'challenges_learnings',
      name: 'Challenges & Learnings',
      type: 'bullet-points',
      required: true,
      purpose: 'Honest about what\'s hard and what we learned',
      requiredData: ['challenges', 'learnings'],
      optionalData: ['actions'],
      wordLimits: { min: 40, max: 80, ideal: 60 },
      expertPrinciples: [
        'Brené Brown: Vulnerability builds trust',
        'Be honest about misses',
        'Focus on learnings, not blame',
        'Show what we\'re doing about it'
      ],
      designNotes: [
        'Balanced, not doom-and-gloom',
        'Learnings highlighted',
        'Action-oriented'
      ],
      example: {
        title: 'What We Learned This Quarter',
        bullets: [
          'Challenge: Enterprise deals took longer than expected',
          'Learning: We need dedicated solution engineers',
          'Action: Hiring 2 SEs in Q1'
        ]
      }
    },
    {
      id: 'roadmap',
      name: 'What\'s Next / Roadmap',
      type: 'timeline',
      required: true,
      purpose: 'Where we\'re headed',
      requiredData: ['roadmap', 'priorities'],
      optionalData: ['dates', 'milestones'],
      wordLimits: { min: 30, max: 70, ideal: 50 },
      expertPrinciples: [
        'Clear priorities (3-5 max)',
        'Timeline if applicable',
        'Connect to strategy',
        'Exciting but realistic'
      ],
      designNotes: [
        'Visual roadmap',
        'Priority indicators',
        'Milestone markers'
      ],
      example: {
        title: 'Q1 Priorities',
        bullets: [
          '1. Launch mobile app (Feb)',
          '2. Expand to European market (Mar)',
          '3. Hit $15M ARR milestone (Q1 end)'
        ]
      }
    },
    {
      id: 'team_spotlight',
      name: 'Team Spotlight',
      type: 'grid',
      required: true,
      purpose: 'Recognize and humanize team members',
      requiredData: ['spotlights'],
      optionalData: ['newHires', 'promotions', 'anniversaries'],
      wordLimits: { min: 30, max: 60, ideal: 45 },
      expertPrinciples: [
        'Celebrate people, not just work',
        'Mix of recognition types',
        'Include fun facts',
        'New hires and anniversaries'
      ],
      designNotes: [
        'Photos prominent',
        'Names and roles',
        'Fun personal touches'
      ],
      example: {
        title: 'Team Spotlight',
        bullets: [
          'Welcome new hires: Alex, Jordan, Sam!',
          'Promotions: Maria → Sr. Engineer, Tom → Manager',
          'Work anniversaries: Lisa (5 yrs!), Mike (3 yrs)'
        ]
      }
    },
    {
      id: 'announcements',
      name: 'Announcements',
      type: 'bullet-points',
      required: true,
      purpose: 'Important updates everyone needs to know',
      requiredData: ['announcements'],
      optionalData: ['dates', 'links'],
      wordLimits: { min: 20, max: 50, ideal: 35 },
      expertPrinciples: [
        'Keep it brief',
        'Action-oriented',
        'Links for details',
        'Dates for deadlines'
      ],
      designNotes: [
        'Clear, scannable',
        'Icons for categories',
        'Deadlines highlighted'
      ],
      example: {
        title: 'Announcements',
        bullets: [
          'Office closed Dec 24-Jan 1',
          'New benefits portal - check email for link',
          'Q4 review cycle starts Dec 15'
        ]
      }
    },
    {
      id: 'call_to_action',
      name: 'Focus / Call to Action',
      type: 'single-statement',
      required: true,
      purpose: 'What we\'re asking of everyone',
      requiredData: ['focus'],
      optionalData: ['theme', 'motivation'],
      wordLimits: { min: 10, max: 30, ideal: 20 },
      expertPrinciples: [
        'One clear ask or focus',
        'Motivational close',
        'Connect to purpose',
        'Leave them energized'
      ],
      designNotes: [
        'Inspiring visual',
        'Bold statement',
        'Memorable close'
      ],
      example: {
        title: 'Our Focus: Delight Every Customer',
        subtitle: 'Let\'s finish 2024 stronger than we started 💪'
      }
    },
    {
      id: 'qa',
      name: 'Q&A',
      type: 'single-statement',
      required: false,
      purpose: 'Open floor for questions',
      requiredData: [],
      optionalData: ['submittedQuestions'],
      wordLimits: { min: 5, max: 15, ideal: 10 },
      expertPrinciples: [
        'Make time for questions',
        'Anonymous question collection',
        'Psychological safety'
      ],
      designNotes: [
        'Simple Q&A slide',
        'Maybe fun GIF/image'
      ]
    }
  ];

  contentTransforms: ContentTransform[] = [
    {
      sourcePattern: /we\s+failed\s+to/gi,
      transform: () => 'we learned from',
      description: 'Reframe failures as learnings'
    },
    {
      sourcePattern: /(\d+)\s*%\s*(growth|increase)/gi,
      transform: (match) => `↑ ${match}`,
      description: 'Add growth arrow indicator'
    },
    {
      sourcePattern: /(\d+)\s*%\s*(decline|decrease)/gi,
      transform: (match) => `↓ ${match}`,
      description: 'Add decline arrow indicator'
    }
  ];

  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      'Starts with wins/celebrations',
      'Key metrics are contextualized',
      'Challenges are addressed honestly',
      'Roadmap is clear',
      'Team recognition included',
      'Ends with clear focus/CTA'
    ],
    excellenceIndicators: [
      'Customer story included',
      'Human stories, not just data',
      'Balanced positive and honest',
      'Energizing and motivating',
      'Psychological safety demonstrated'
    ]
  };

  /**
   * Generate all-hands slides from content analysis.
   */
  async generateSlides(analysis: ContentAnalysis): Promise<Slide[]> {
    const slides: Slide[] = [];
    let index = 0;

    // Opening Title
    slides.push({
      index: index++,
      type: 'title',
      data: {
        title: this.createTitle(analysis),
        subtitle: this.getCurrentPeriod(),
        keyMessage: 'All-hands meeting'
      },
      classes: ['slide-title', 'slide-all-hands']
    });

    // Wins & Celebrations
    slides.push({
      index: index++,
      type: 'grid',
      data: {
        title: 'Celebrating Our Wins! 🎉',
        bullets: this.extractWins(analysis),
        keyMessage: 'Start with wins'
      },
      classes: ['slide-wins', 'slide-all-hands']
    });

    // Key Metrics
    const metricsData = this.extractMetrics(analysis);
    slides.push({
      index: index++,
      type: 'big-number',
      data: {
        title: metricsData.primary,
        subtitle: metricsData.context,
        keyMessage: 'Business health'
      },
      classes: ['slide-metrics', 'slide-all-hands']
    });

    // Metric Deep Dive
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: 'What\'s Driving Our Growth',
        body: analysis.scqa.answer ?? 'Key insights from this period',
        bullets: analysis.keyMessages.slice(0, 4),
        keyMessage: 'Context behind the numbers'
      },
      classes: ['slide-deep-dive', 'slide-all-hands']
    });

    // Customer Story (optional but valuable)
    slides.push({
      index: index++,
      type: 'two-column',
      data: {
        title: 'Customer Spotlight',
        body: '[Customer story that connects work to impact]',
        bullets: [
          'Customer: [Name]',
          'Challenge: [What they faced]',
          'Impact: [How we helped]'
        ],
        keyMessage: 'Why our work matters'
      },
      classes: ['slide-customer', 'slide-all-hands']
    });

    // Challenges & Learnings
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Challenges & What We Learned',
        bullets: this.extractChallenges(analysis),
        keyMessage: 'Honest reflection'
      },
      classes: ['slide-challenges', 'slide-all-hands']
    });

    // Roadmap
    slides.push({
      index: index++,
      type: 'timeline',
      data: {
        title: 'What\'s Next',
        bullets: this.extractRoadmap(analysis),
        keyMessage: 'Looking ahead'
      },
      classes: ['slide-roadmap', 'slide-all-hands']
    });

    // Team Spotlight
    slides.push({
      index: index++,
      type: 'grid',
      data: {
        title: 'Team Spotlight',
        bullets: [
          'Welcome new team members: [Names]',
          'Promotions: [Names and new roles]',
          'Anniversaries: [Names and years]'
        ],
        keyMessage: 'Celebrating our people'
      },
      classes: ['slide-team', 'slide-all-hands']
    });

    // Announcements
    slides.push({
      index: index++,
      type: 'bullet-points',
      data: {
        title: 'Announcements',
        bullets: [
          '[Important announcement 1]',
          '[Important announcement 2]',
          '[Important announcement 3]'
        ],
        keyMessage: 'Need to know'
      },
      classes: ['slide-announcements', 'slide-all-hands']
    });

    // Call to Action
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.createCTA(analysis),
        subtitle: 'Thank you for everything you do! 💪',
        keyMessage: 'Our focus'
      },
      classes: ['slide-cta', 'slide-all-hands']
    });

    // Q&A
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: 'Questions?',
        keyMessage: 'Open floor'
      },
      classes: ['slide-qa', 'slide-all-hands']
    });

    return slides;
  }

  /**
   * Validate slides against all-hands requirements.
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

    // Check for wins
    const hasWins = slides.some(s => s.classes?.includes('slide-wins'));
    if (!hasWins) {
      issues.push('Missing wins/celebrations slide (always start positive!)');
      score -= 10;
    } else {
      // Check wins is early
      const winsIndex = slides.findIndex(s => s.classes?.includes('slide-wins'));
      if (winsIndex > 2) {
        suggestions.push('Move wins/celebrations closer to the beginning');
      }
    }

    // Check for metrics
    const hasMetrics = slides.some(s => s.classes?.includes('slide-metrics'));
    if (!hasMetrics) {
      issues.push('Missing key metrics overview');
      score -= 8;
    }

    // Check for challenges
    const hasChallenges = slides.some(s => s.classes?.includes('slide-challenges'));
    if (!hasChallenges) {
      issues.push('Missing challenges/learnings (transparency is key)');
      score -= 8;
    }

    // Check for roadmap
    const hasRoadmap = slides.some(s => s.classes?.includes('slide-roadmap'));
    if (!hasRoadmap) {
      issues.push('Missing roadmap/what\'s next');
      score -= 8;
    }

    // Check for team spotlight
    const hasTeam = slides.some(s => s.classes?.includes('slide-team'));
    if (!hasTeam) {
      suggestions.push('Consider adding team spotlight for recognition');
    }

    // Check for CTA
    const hasCTA = slides.some(s => s.classes?.includes('slide-cta'));
    if (!hasCTA) {
      issues.push('Missing call to action/focus');
      score -= 8;
    }

    // Check for customer story
    const hasCustomer = slides.some(s => s.classes?.includes('slide-customer'));
    if (!hasCustomer) {
      suggestions.push('Consider adding customer story to connect work to impact');
    }

    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Apply all-hands methodology to slides.
   */
  applyExpertMethodology(slides: Slide[]): Slide[] {
    return slides.map(slide => {
      // Add all-hands class
      if (!slide.classes) slide.classes = [];
      if (!slide.classes.includes('slide-all-hands')) {
        slide.classes.push('slide-all-hands');
      }

      // Reframe negative language
      if (slide.data.body) {
        slide.data.body = this.reframeLanguage(slide.data.body);
      }
      if (slide.data.bullets) {
        slide.data.bullets = slide.data.bullets.map(b => this.reframeLanguage(b));
      }

      return slide;
    });
  }

  // === Helper Methods ===

  private createTitle(analysis: ContentAnalysis): string {
    const period = this.getCurrentPeriod();
    if (analysis.scqa.answer) {
      return `${period}: ${analysis.scqa.answer.slice(0, 30)}`;
    }
    return `${period} All-Hands`;
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter} ${now.getFullYear()}`;
  }

  private extractWins(analysis: ContentAnalysis): string[] {
    // Look for positive achievements in the analysis
    const wins: string[] = [];

    for (const star of analysis.starMoments) {
      if (star.match(/achieved|launched|won|shipped|completed|exceeded/i)) {
        wins.push(star.slice(0, 60));
      }
    }

    // Default wins if none found
    if (wins.length === 0) {
      return [
        '[Major achievement 1] - [Team]',
        '[Major achievement 2] - [Team]',
        '[Major achievement 3] - [Team]'
      ];
    }

    return wins.slice(0, 4);
  }

  private extractMetrics(analysis: ContentAnalysis): { primary: string; context: string } {
    for (const star of analysis.starMoments) {
      const match = star.match(/\$[\d,.]+(?:\s*(?:million|billion|M|B|ARR))?/i);
      if (match) {
        return {
          primary: match[0],
          context: star.replace(match[0], '').trim() || 'Key business metric'
        };
      }
    }

    return {
      primary: '$[X]M ARR',
      context: '↑ [Y]% from last period'
    };
  }

  private extractChallenges(analysis: ContentAnalysis): string[] {
    // Look for challenges in the analysis
    const challenges: string[] = [];

    if (analysis.scqa.complication) {
      challenges.push(`Challenge: ${analysis.scqa.complication.slice(0, 50)}`);
      challenges.push('Learning: [What we learned]');
      challenges.push('Action: [What we\'re doing about it]');
    }

    if (challenges.length === 0) {
      return [
        'Challenge: [Biggest challenge this period]',
        'Learning: [Key insight from it]',
        'Action: [What we\'re doing about it]'
      ];
    }

    return challenges;
  }

  private extractRoadmap(analysis: ContentAnalysis): string[] {
    const roadmap: string[] = [];

    for (const item of analysis.sparkline.whatCouldBe) {
      if (item.length > 0) {
        roadmap.push(item.slice(0, 50));
      }
    }

    if (roadmap.length === 0) {
      return [
        '1. [Priority 1] - [Timeline]',
        '2. [Priority 2] - [Timeline]',
        '3. [Priority 3] - [Timeline]'
      ];
    }

    return roadmap.slice(0, 4).map((item, i) => `${i + 1}. ${item}`);
  }

  private createCTA(analysis: ContentAnalysis): string {
    if (analysis.sparkline.callToAdventure) {
      return analysis.sparkline.callToAdventure;
    }
    return 'Our Focus: [One clear priority]';
  }

  private reframeLanguage(text: string): string {
    return text
      .replace(/we failed to/gi, 'we learned from')
      .replace(/we missed/gi, 'we\'re working to improve')
      .replace(/problem is/gi, 'opportunity is');
  }
}
