/**
 * Slide Factory - Creates Slides from Content Analysis
 *
 * Generates slide structures based on:
 * - Presentation mode (keynote vs business)
 * - Content analysis results
 * - Expert methodology recommendations
 */

import type {
  Slide,
  SlideType,
  SlideData,
  ContentAnalysis,
  PresentationMode
} from '../types/index.js';

interface SlideTemplate {
  type: SlideType;
  requiredFields: string[];
  optionalFields: string[];
  keynoteSuitable: boolean;
  businessSuitable: boolean;
  maxWords: number;
}

export class SlideFactory {
  private readonly templates: Map<SlideType, SlideTemplate>;

  constructor() {
    this.templates = this.initializeTemplates();
  }

  /**
   * Create slides from analyzed content.
   */
  async createSlides(analysis: ContentAnalysis, mode: PresentationMode): Promise<Slide[]> {
    const slides: Slide[] = [];
    let slideIndex = 0;

    // 1. Title slide (always first)
    slides.push(this.createTitleSlide(slideIndex++, analysis));

    // 2. Agenda slide (for business presentations with 5+ key points)
    if (mode === 'business' && analysis.keyMessages.length >= 2) {
      slides.push(this.createAgendaSlide(slideIndex++, analysis));
    }

    // 3. Situation/Context slide (from SCQA)
    if (analysis.scqa.situation) {
      slides.push(this.createContextSlide(slideIndex++, analysis, mode));
    }

    // 4. Problem/Complication slide
    if (analysis.scqa.complication) {
      slides.push(this.createProblemSlide(slideIndex++, analysis, mode));
    }

    // 5. Key message slides (main content)
    for (const message of analysis.keyMessages) {
      slides.push(this.createMessageSlide(slideIndex++, message, mode));
    }

    // 6. STAR moment slides (if any)
    for (const starMoment of analysis.starMoments.slice(0, 2)) {
      slides.push(this.createStarMomentSlide(slideIndex++, starMoment, mode));
    }

    // 7. Solution/Answer slide
    if (analysis.scqa.answer) {
      slides.push(this.createSolutionSlide(slideIndex++, analysis, mode));
    }

    // 8. Call to action slide
    if (analysis.sparkline.callToAdventure) {
      slides.push(this.createCTASlide(slideIndex++, analysis, mode));
    }

    // 9. Thank you slide (always last)
    slides.push(this.createThankYouSlide(slideIndex++));

    return slides;
  }

  /**
   * Create a title slide.
   */
  private createTitleSlide(index: number, analysis: ContentAnalysis): Slide {
    // Use the first key message or SCQA answer as subtitle
    const subtitle = analysis.keyMessages[0] ?? analysis.scqa.answer ?? '';

    return {
      index,
      type: 'title',
      data: {
        title: analysis.titles[0] ?? 'Presentation',
        subtitle: this.truncate(subtitle, 60),
        keyMessage: analysis.scqa.answer
      },
      classes: ['slide-title']
    };
  }

  /**
   * Create an agenda slide.
   */
  private createAgendaSlide(index: number, analysis: ContentAnalysis): Slide {
    return {
      index,
      type: 'agenda',
      data: {
        title: 'Agenda',
        bullets: analysis.keyMessages.map((msg, i) => `${i + 1}. ${this.truncate(msg, 50)}`)
      },
      classes: ['slide-agenda']
    };
  }

  /**
   * Create a context/situation slide.
   */
  private createContextSlide(index: number, analysis: ContentAnalysis, mode: PresentationMode): Slide {
    if (mode === 'keynote') {
      return {
        index,
        type: 'single-statement',
        data: {
          title: this.truncate(analysis.scqa.situation, 80),
          keyMessage: 'The current state'
        },
        classes: ['slide-single-statement']
      };
    }

    return {
      index,
      type: 'two-column',
      data: {
        title: 'Current Situation',
        body: analysis.scqa.situation,
        bullets: analysis.sparkline.whatIs.slice(0, 3)
      },
      classes: ['slide-two-column']
    };
  }

  /**
   * Create a problem/complication slide.
   */
  private createProblemSlide(index: number, analysis: ContentAnalysis, mode: PresentationMode): Slide {
    if (mode === 'keynote') {
      return {
        index,
        type: 'big-idea',
        data: {
          title: this.truncate(analysis.scqa.complication, 60),
          keyMessage: 'The challenge we face'
        },
        classes: ['slide-big-idea']
      };
    }

    return {
      index,
      type: 'bullet-points',
      data: {
        title: 'The Challenge',
        body: analysis.scqa.complication,
        bullets: this.extractBullets(analysis.scqa.complication)
      },
      classes: ['slide-bullet-points']
    };
  }

  /**
   * Create a key message slide.
   */
  private createMessageSlide(index: number, message: string, mode: PresentationMode): Slide {
    if (mode === 'keynote') {
      // For keynote: single statement, big impact
      return {
        index,
        type: 'single-statement',
        data: {
          title: this.truncate(message, 60),
          keyMessage: message
        },
        classes: ['slide-single-statement']
      };
    }

    // For business: more detail allowed
    return {
      index,
      type: 'bullet-points',
      data: {
        title: this.extractActionTitle(message),
        body: message,
        bullets: this.extractBullets(message)
      },
      classes: ['slide-bullet-points']
    };
  }

  /**
   * Create a STAR moment slide.
   */
  private createStarMomentSlide(index: number, starMoment: string, mode: PresentationMode): Slide {
    // Check if it contains a statistic
    const statMatch = starMoment.match(/(\d+[%xX]|\$[\d,]+(?:\s*(?:million|billion))?)/);

    if (statMatch && statMatch[1]) {
      const stat = statMatch[1];
      return {
        index,
        type: 'big-number',
        data: {
          title: stat,
          subtitle: this.removeStatistic(starMoment, stat),
          keyMessage: starMoment
        },
        classes: ['slide-big-number']
      };
    }

    // Otherwise use as a quote or big idea
    if (mode === 'keynote') {
      return {
        index,
        type: 'big-idea',
        data: {
          title: this.truncate(starMoment, 80),
          keyMessage: 'A key insight'
        },
        classes: ['slide-big-idea']
      };
    }

    return {
      index,
      type: 'quote',
      data: {
        quote: starMoment,
        attribution: 'Key Insight'
      },
      classes: ['slide-quote']
    };
  }

  /**
   * Create a solution/answer slide.
   */
  private createSolutionSlide(index: number, analysis: ContentAnalysis, mode: PresentationMode): Slide {
    if (mode === 'keynote') {
      return {
        index,
        type: 'big-idea',
        data: {
          title: this.truncate(analysis.scqa.answer, 60),
          keyMessage: 'Our answer'
        },
        classes: ['slide-big-idea']
      };
    }

    return {
      index,
      type: 'two-column',
      data: {
        title: 'The Solution',
        body: analysis.scqa.answer,
        bullets: analysis.sparkline.whatCouldBe.slice(0, 4)
      },
      classes: ['slide-two-column']
    };
  }

  /**
   * Create a call-to-action slide.
   */
  private createCTASlide(index: number, analysis: ContentAnalysis, mode: PresentationMode): Slide {
    return {
      index,
      type: 'cta',
      data: {
        title: mode === 'keynote' ? 'Take Action' : 'Next Steps',
        body: analysis.sparkline.callToAdventure,
        keyMessage: 'What we need from you'
      },
      classes: ['slide-cta']
    };
  }

  /**
   * Create a thank you slide.
   */
  private createThankYouSlide(index: number): Slide {
    return {
      index,
      type: 'thank-you',
      data: {
        title: 'Thank You',
        subtitle: 'Questions?'
      },
      classes: ['slide-thank-you']
    };
  }

  /**
   * Initialize slide templates with constraints.
   */
  private initializeTemplates(): Map<SlideType, SlideTemplate> {
    const templates = new Map<SlideType, SlideTemplate>();

    // Title slides
    templates.set('title', {
      type: 'title',
      requiredFields: ['title'],
      optionalFields: ['subtitle', 'author', 'date'],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 15
    });

    // Big idea (keynote)
    templates.set('big-idea', {
      type: 'big-idea',
      requiredFields: ['title'],
      optionalFields: ['keyMessage'],
      keynoteSuitable: true,
      businessSuitable: false,
      maxWords: 10
    });

    // Single statement (keynote)
    templates.set('single-statement', {
      type: 'single-statement',
      requiredFields: ['title'],
      optionalFields: ['keyMessage'],
      keynoteSuitable: true,
      businessSuitable: false,
      maxWords: 15
    });

    // Big number
    templates.set('big-number', {
      type: 'big-number',
      requiredFields: ['title'],
      optionalFields: ['subtitle', 'source'],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 10
    });

    // Quote
    templates.set('quote', {
      type: 'quote',
      requiredFields: ['quote'],
      optionalFields: ['attribution', 'source'],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 30
    });

    // Bullet points (business)
    templates.set('bullet-points', {
      type: 'bullet-points',
      requiredFields: ['title', 'bullets'],
      optionalFields: ['body'],
      keynoteSuitable: false,
      businessSuitable: true,
      maxWords: 80
    });

    // Two column (business)
    templates.set('two-column', {
      type: 'two-column',
      requiredFields: ['title'],
      optionalFields: ['body', 'bullets', 'images'],
      keynoteSuitable: false,
      businessSuitable: true,
      maxWords: 100
    });

    // Agenda
    templates.set('agenda', {
      type: 'agenda',
      requiredFields: ['title', 'bullets'],
      optionalFields: [],
      keynoteSuitable: false,
      businessSuitable: true,
      maxWords: 50
    });

    // CTA
    templates.set('cta', {
      type: 'cta',
      requiredFields: ['title'],
      optionalFields: ['body', 'keyMessage'],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 30
    });

    // Thank you
    templates.set('thank-you', {
      type: 'thank-you',
      requiredFields: ['title'],
      optionalFields: ['subtitle'],
      keynoteSuitable: true,
      businessSuitable: true,
      maxWords: 10
    });

    return templates;
  }

  // === Helper Methods ===

  /**
   * Truncate text to max length at word boundary.
   */
  private truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text ?? '';
    }

    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.7) {
      return truncated.slice(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  /**
   * Extract an action title from a message.
   */
  private extractActionTitle(message: string): string {
    // Take first sentence or first N words
    const firstSentence = message.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length <= 50) {
      return firstSentence;
    }

    const words = message.split(/\s+/).slice(0, 6);
    return words.join(' ');
  }

  /**
   * Extract bullet points from text.
   */
  private extractBullets(text: string): string[] {
    if (!text) return [];

    // Check for explicit bullets
    const bulletMatches = text.match(/\[BULLET\]\s*(.+)/g);
    if (bulletMatches && bulletMatches.length > 0) {
      return bulletMatches.map(b => b.replace('[BULLET]', '').trim()).slice(0, 5);
    }

    // Split into sentences and use as bullets
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  /**
   * Remove a statistic from text.
   */
  private removeStatistic(text: string, stat: string): string {
    return text.replace(stat, '').replace(/^\s*[-–—:,]\s*/, '').trim();
  }
}
