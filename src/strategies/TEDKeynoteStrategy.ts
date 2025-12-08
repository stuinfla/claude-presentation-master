/**
 * TED-Style Keynote Execution Strategy
 *
 * World-class inspirational presentations follow:
 * - Nancy Duarte's Sparkline (What Is vs What Could Be)
 * - Chris Anderson's One Idea Rule
 * - Garr Reynolds' Presentation Zen
 * - Carmine Gallo's Rule of Three
 *
 * This strategy produces TED-quality keynote presentations.
 */

import type { Slide, ContentAnalysis } from '../types/index.js';
import type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';

export class TEDKeynoteStrategy implements ExecutionStrategy {
  type = 'ted_keynote' as const;
  name = 'TED-Style Keynote';
  description = 'High-impact inspirational presentations for general audiences';

  experts = {
    primary: 'Nancy Duarte (Sparkline, STAR Moment)',
    secondary: [
      'Chris Anderson (One Idea)',
      'Garr Reynolds (Presentation Zen)',
      'Carmine Gallo (Rule of Three)'
    ]
  };

  slideSequence: SlideBlueprint[] = [
    {
      id: 'opening_hook',
      name: 'Opening Hook',
      type: 'title',
      required: true,
      purpose: 'Grab attention in first 10 seconds',
      requiredData: ['title'],
      optionalData: ['subtitle'],
      wordLimits: { min: 1, max: 10, ideal: 6 },
      expertPrinciples: [
        'Start with something unexpected',
        'Create curiosity gap',
        'Connect emotionally immediately'
      ],
      designNotes: [
        'Full-bleed dramatic image or',
        'Large bold text on dark background',
        '50%+ whitespace'
      ],
      example: {
        title: 'What if everything you knew was wrong?'
      }
    },
    {
      id: 'what_is_1',
      name: 'Current Reality (Pain Point)',
      type: 'single-statement',
      required: true,
      purpose: 'Establish the current problematic reality',
      requiredData: ['title'],
      optionalData: ['keyMessage'],
      wordLimits: { min: 3, max: 12, ideal: 8 },
      expertPrinciples: [
        'Show the pain of the status quo',
        'Make it relatable',
        'Use concrete examples'
      ],
      designNotes: [
        'Dark, heavy visual feeling',
        'One powerful statement',
        'No bullets ever'
      ],
      example: {
        title: 'We\'re drowning in information.'
      }
    },
    {
      id: 'what_could_be_1',
      name: 'First Glimpse of Possibility',
      type: 'single-statement',
      required: true,
      purpose: 'Contrast with a vision of what could be',
      requiredData: ['title'],
      optionalData: ['keyMessage'],
      wordLimits: { min: 3, max: 12, ideal: 8 },
      expertPrinciples: [
        'Create contrast with previous slide',
        'Use aspirational language',
        'Make them feel possibility'
      ],
      designNotes: [
        'Lighter, brighter visual',
        'One hopeful statement',
        'Visual contrast from previous'
      ],
      example: {
        title: 'But what if we could find clarity?'
      }
    },
    {
      id: 'what_is_2',
      name: 'Deeper Problem (Build Tension)',
      type: 'big-idea',
      required: true,
      purpose: 'Deepen the tension, show more pain',
      requiredData: ['title'],
      optionalData: ['keyMessage'],
      wordLimits: { min: 3, max: 15, ideal: 10 },
      expertPrinciples: [
        'Oscillate back to reality',
        'Deepen the emotional stakes',
        'Make them uncomfortable with status quo'
      ],
      designNotes: [
        'Return to darker palette',
        'Tension-building visual'
      ],
      example: {
        title: 'Every day, 300 billion emails. 4 hours wasted.'
      }
    },
    {
      id: 'what_could_be_2',
      name: 'Building Vision',
      type: 'big-idea',
      required: true,
      purpose: 'Expand the vision of what\'s possible',
      requiredData: ['title'],
      optionalData: ['keyMessage'],
      wordLimits: { min: 3, max: 15, ideal: 10 },
      expertPrinciples: [
        'Build on previous possibility',
        'Make it more concrete',
        'Show a path forward'
      ],
      designNotes: [
        'Back to lighter palette',
        'Hopeful, energizing'
      ]
    },
    {
      id: 'star_moment',
      name: 'STAR Moment',
      type: 'big-number',
      required: true,
      purpose: 'Something They\'ll Always Remember',
      requiredData: ['title'],
      optionalData: ['subtitle', 'keyMessage'],
      wordLimits: { min: 1, max: 10, ideal: 5 },
      expertPrinciples: [
        'This is THE moment they remember',
        'Dramatic statistic, demo, or revelation',
        'Emotional peak of presentation'
      ],
      designNotes: [
        'Maximum visual impact',
        'Could be a number, image, or demo',
        'This slide gets the gasp'
      ],
      example: {
        title: '1 Second',
        subtitle: 'The time you have to make a first impression'
      }
    },
    {
      id: 'what_could_be_3',
      name: 'The New Bliss',
      type: 'single-statement',
      required: true,
      purpose: 'Paint the picture of the transformed future',
      requiredData: ['title'],
      optionalData: ['keyMessage'],
      wordLimits: { min: 3, max: 12, ideal: 8 },
      expertPrinciples: [
        'This is the resolution',
        'Make them want this future',
        'Emotionally satisfying'
      ],
      designNotes: [
        'Brightest, most hopeful visual',
        'Sense of resolution and peace'
      ],
      example: {
        title: 'A world where every message matters.'
      }
    },
    {
      id: 'call_to_adventure',
      name: 'Call to Adventure',
      type: 'cta',
      required: true,
      purpose: 'What should they do now?',
      requiredData: ['title'],
      optionalData: ['body', 'keyMessage'],
      wordLimits: { min: 3, max: 15, ideal: 10 },
      expertPrinciples: [
        'Clear, actionable next step',
        'Make it feel achievable',
        'End on energy and hope'
      ],
      designNotes: [
        'Strong, clear CTA',
        'Contact info if relevant',
        'Leave them inspired to act'
      ],
      example: {
        title: 'Join the clarity revolution.',
        body: 'Start today. One email at a time.'
      }
    }
  ];

  contentTransforms: ContentTransform[] = [
    {
      sourcePattern: /bullet|list|points/i,
      transform: () => '',
      description: 'Remove all bullet points - TED keynotes never use them'
    },
    {
      sourcePattern: /(\d+%|\$[\d,]+(?:\s*(?:million|billion))?)/,
      transform: (match) => match,
      description: 'Preserve dramatic statistics for STAR moments'
    }
  ];

  qualityBenchmarks = {
    minScore: 95,
    criticalChecks: [
      'No slide has more than 15 words',
      'No bullet points anywhere',
      'Sparkline structure is present (What Is vs What Could Be)',
      'STAR moment exists',
      'Ends with clear Call to Adventure'
    ],
    excellenceIndicators: [
      'Emotional contrast is palpable',
      'Can be presented without reading',
      'Audience would remember STAR moment',
      'One clear idea per presentation'
    ]
  };

  /**
   * Generate TED-style keynote slides from content analysis.
   */
  async generateSlides(analysis: ContentAnalysis): Promise<Slide[]> {
    const slides: Slide[] = [];
    let index = 0;

    // Opening Hook
    const hookText = analysis.starMoments[0] ||
                    analysis.scqa.question ||
                    this.createHook(analysis.keyMessages[0] ?? '');
    slides.push({
      index: index++,
      type: 'title',
      data: {
        title: this.distillToHook(hookText),
        keyMessage: 'Opening hook'
      },
      classes: ['slide-title', 'slide-hook']
    });

    // What Is 1 - Current Reality
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.distillToStatement(analysis.scqa.situation || analysis.sparkline.whatIs[0] || ''),
        keyMessage: 'Current reality'
      },
      classes: ['slide-single-statement', 'slide-what-is']
    });

    // What Could Be 1 - First Possibility
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.distillToStatement(analysis.sparkline.whatCouldBe[0] || analysis.scqa.answer || ''),
        keyMessage: 'Possibility'
      },
      classes: ['slide-single-statement', 'slide-what-could-be']
    });

    // What Is 2 - Deepen the Problem
    if (analysis.scqa.complication) {
      slides.push({
        index: index++,
        type: 'big-idea',
        data: {
          title: this.distillToStatement(analysis.scqa.complication),
          keyMessage: 'The challenge'
        },
        classes: ['slide-big-idea', 'slide-what-is']
      });
    }

    // What Could Be 2 - Build Vision
    if (analysis.sparkline.whatCouldBe[1]) {
      slides.push({
        index: index++,
        type: 'big-idea',
        data: {
          title: this.distillToStatement(analysis.sparkline.whatCouldBe[1]),
          keyMessage: 'Building the vision'
        },
        classes: ['slide-big-idea', 'slide-what-could-be']
      });
    }

    // STAR Moment - The memorable peak
    const starContent = this.findBestStarMoment(analysis);
    slides.push({
      index: index++,
      type: 'big-number',
      data: {
        title: starContent.number || starContent.statement,
        subtitle: starContent.context,
        keyMessage: 'STAR moment - they\'ll remember this'
      },
      classes: ['slide-big-number', 'slide-star-moment']
    });

    // New Bliss - The transformed future
    slides.push({
      index: index++,
      type: 'single-statement',
      data: {
        title: this.distillToStatement(analysis.scqa.answer || analysis.sparkline.whatCouldBe.slice(-1)[0] || ''),
        keyMessage: 'The new bliss'
      },
      classes: ['slide-single-statement', 'slide-new-bliss']
    });

    // Call to Adventure
    slides.push({
      index: index++,
      type: 'cta',
      data: {
        title: this.createCallToAdventure(analysis.sparkline.callToAdventure || analysis.scqa.answer || ''),
        body: 'Start today.',
        keyMessage: 'What to do next'
      },
      classes: ['slide-cta', 'slide-call-to-adventure']
    });

    return slides;
  }

  /**
   * Validate slides against TED keynote requirements.
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

    // Check word counts
    for (const slide of slides) {
      const wordCount = this.countWords(slide);
      if (wordCount > 15) {
        issues.push(`Slide ${slide.index + 1}: ${wordCount} words exceeds 15 word limit`);
        score -= 10;
      }
    }

    // Check for bullets
    for (const slide of slides) {
      if (slide.data.bullets && slide.data.bullets.length > 0) {
        issues.push(`Slide ${slide.index + 1}: Contains bullet points (not allowed in TED keynotes)`);
        score -= 15;
      }
    }

    // Check for STAR moment
    const hasStarMoment = slides.some(s =>
      s.classes?.includes('slide-star-moment') || s.type === 'big-number'
    );
    if (!hasStarMoment) {
      issues.push('Missing STAR moment (Something They\'ll Always Remember)');
      score -= 15;
    }

    // Check for Sparkline structure
    const hasWhatIs = slides.some(s => s.classes?.includes('slide-what-is'));
    const hasWhatCouldBe = slides.some(s => s.classes?.includes('slide-what-could-be'));
    if (!hasWhatIs || !hasWhatCouldBe) {
      issues.push('Missing Sparkline structure (need What Is vs What Could Be contrast)');
      score -= 10;
    }

    // Check for Call to Adventure
    const hasCTA = slides.some(s =>
      s.classes?.includes('slide-call-to-adventure') || s.type === 'cta'
    );
    if (!hasCTA) {
      issues.push('Missing Call to Adventure at end');
      score -= 10;
    }

    // Suggestions
    if (slides.length > 12) {
      suggestions.push('Consider reducing slides - TED talks typically have 8-12 slides');
    }

    return {
      passed: issues.length === 0 && score >= 95,
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Apply Duarte methodology to slides.
   */
  applyExpertMethodology(slides: Slide[]): Slide[] {
    return slides.map(slide => {
      // Remove bullets
      if (slide.data.bullets) {
        // Convert bullets to a single statement
        const combined = slide.data.bullets.join(' ');
        slide.data.title = this.distillToStatement(combined);
        delete slide.data.bullets;
      }

      // Reduce word count
      if (slide.data.title && this.countWords({ data: { title: slide.data.title } } as Slide) > 15) {
        slide.data.title = this.distillToStatement(slide.data.title);
      }

      // Add Sparkline class markers
      if (slide.data.keyMessage?.toLowerCase().includes('current') ||
          slide.data.keyMessage?.toLowerCase().includes('reality') ||
          slide.data.keyMessage?.toLowerCase().includes('problem')) {
        if (!slide.classes) slide.classes = [];
        slide.classes.push('slide-what-is');
      }

      if (slide.data.keyMessage?.toLowerCase().includes('could') ||
          slide.data.keyMessage?.toLowerCase().includes('possibility') ||
          slide.data.keyMessage?.toLowerCase().includes('vision')) {
        if (!slide.classes) slide.classes = [];
        slide.classes.push('slide-what-could-be');
      }

      return slide;
    });
  }

  // === Helper Methods ===

  private distillToStatement(text: string): string {
    if (!text) return 'Key insight here';

    // Clean and extract core message
    let clean = text
      .replace(/\[.*?\]/g, '')  // Remove markers
      .replace(/^\s*(the|a|an)\s+/i, '')  // Remove articles
      .trim();

    // Take first sentence or phrase
    const firstSentence = clean.split(/[.!?]/)[0] ?? clean;

    // Limit to ~10 words
    const words = firstSentence.split(/\s+/).slice(0, 12);
    return words.join(' ');
  }

  private distillToHook(text: string): string {
    // Create an attention-grabbing hook
    const statement = this.distillToStatement(text);

    // Make it a question if it isn't
    if (!statement.includes('?')) {
      return `What if ${statement.toLowerCase().replace(/^what if /i, '')}?`;
    }

    return statement;
  }

  private createHook(message: string): string {
    if (!message) return 'What if everything changed?';
    return `What if ${message.toLowerCase()}?`;
  }

  private createCallToAdventure(content: string): string {
    if (!content) return 'Join us. Start today.';

    const core = this.distillToStatement(content);

    // Make it action-oriented
    if (!core.match(/^(join|start|begin|create|build|make|be|do|take)/i)) {
      return `Start ${core.toLowerCase()}`;
    }

    return core;
  }

  private findBestStarMoment(analysis: ContentAnalysis): {
    number?: string;
    statement: string;
    context?: string;
  } {
    // Look for dramatic statistics
    for (const star of analysis.starMoments) {
      const numMatch = star.match(/(\d+[%xX]|\$[\d,]+(?:\s*(?:million|billion))?)/);
      if (numMatch) {
        return {
          number: numMatch[1],
          statement: star,
          context: star.replace(numMatch[1] ?? '', '').trim()
        };
      }
    }

    // Use the most dramatic statement
    if (analysis.starMoments[0]) {
      return {
        statement: this.distillToStatement(analysis.starMoments[0])
      };
    }

    // Fallback
    return {
      statement: this.distillToStatement(analysis.scqa.answer || analysis.keyMessages[0] || 'The moment of truth')
    };
  }

  private countWords(slide: Slide): number {
    let text = '';
    if (slide.data.title) text += slide.data.title + ' ';
    if (slide.data.subtitle) text += slide.data.subtitle + ' ';
    if (slide.data.body) text += slide.data.body + ' ';

    return text.split(/\s+/).filter(w => w.length > 0).length;
  }
}
