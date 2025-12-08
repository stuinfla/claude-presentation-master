/**
 * PPTX Validator Tests
 *
 * Comprehensive test suite for PowerPoint presentation validation.
 * Ensures all PPTX exports meet quality standards.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PPTXValidator } from '../qa/PPTXValidator.js';
import type { Slide, SlideType } from '../types/index.js';

describe('PPTXValidator', () => {
  let validator: PPTXValidator;

  beforeAll(() => {
    validator = new PPTXValidator();
  });

  describe('Slide Validation', () => {
    it('should pass a valid keynote presentation', async () => {
      const slides = createValidKeynoteSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(95);
    });

    it('should pass a valid business presentation', async () => {
      const slides = createValidBusinessSlides();
      const result = await validator.validate(slides, { mode: 'business' });

      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(95);
    });

    it('should fail when word count exceeds keynote limit', async () => {
      const slides = createOverloadedSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      expect(result.passed).toBe(false);
      const wordCountErrors = result.issues.filter(
        i => i.severity === 'error' && i.message.includes('words exceeds')
      );
      expect(wordCountErrors.length).toBeGreaterThan(0);
    });

    it('should warn when business slides are too sparse', async () => {
      const slides = createSparseSlides();
      const result = await validator.validate(slides, { mode: 'business' });

      const sparseWarnings = result.issues.filter(
        i => i.severity === 'warning' && i.message.includes('sparse')
      );
      expect(sparseWarnings.length).toBeGreaterThan(0);
    });

    it('should fail when too many bullets per slide', async () => {
      const slides = createBulletOverloadSlides();
      const result = await validator.validate(slides, { mode: 'keynote', strictMode: true });

      const bulletErrors = result.issues.filter(
        i => i.message.includes('bullets exceeds')
      );
      expect(bulletErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Structure Validation', () => {
    it('should error when missing title slide', async () => {
      const slides = createSlidesWithoutTitle();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const titleError = result.issues.find(i => i.message.includes('Missing title slide'));
      expect(titleError).toBeDefined();
      expect(titleError?.severity).toBe('error');
    });

    it('should error when less than 3 slides', async () => {
      const slides = createTwoSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const countError = result.issues.find(i => i.message.includes('minimum is 3'));
      expect(countError).toBeDefined();
      expect(countError?.severity).toBe('error');
    });

    it('should warn when no conclusion slide', async () => {
      const slides = createSlidesWithoutConclusion();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const conclusionWarning = result.issues.find(i => i.message.includes('conclusion'));
      expect(conclusionWarning).toBeDefined();
    });

    it('should note duplicate consecutive slide types', async () => {
      const slides = createDuplicateTypeSlides();
      const result = await validator.validate(slides, { mode: 'business' });

      const duplicateNote = result.issues.find(i => i.message.includes('same layout type'));
      expect(duplicateNote).toBeDefined();
    });
  });

  describe('Expert Methodology Validation', () => {
    it('should validate Rule of Three', async () => {
      const slides = createFourBulletSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const ruleOfThreeWarning = result.issues.find(
        i => i.message.includes('Rule of Three')
      );
      expect(ruleOfThreeWarning).toBeDefined();
    });

    it('should check signal-to-noise ratio', async () => {
      const slides = createNoisySlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const noiseWarning = result.issues.find(i => i.message.includes('noise'));
      expect(noiseWarning).toBeDefined();
    });

    it('should validate glance test for titles', async () => {
      const slides = createLongTitleSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const glanceWarning = result.issues.find(i => i.message.includes('glance test'));
      expect(glanceWarning).toBeDefined();
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score between 0 and 100', async () => {
      const slides = createValidKeynoteSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should deduct more points for errors than warnings', async () => {
      const goodSlides = createValidKeynoteSlides();
      const badSlides = createOverloadedSlides();

      const goodResult = await validator.validate(goodSlides, { mode: 'keynote' });
      const badResult = await validator.validate(badSlides, { mode: 'keynote' });

      expect(goodResult.score).toBeGreaterThan(badResult.score);
    });

    it('should enforce threshold correctly', async () => {
      const slides = createValidKeynoteSlides();

      const result95 = await validator.validate(slides, { mode: 'keynote', threshold: 95 });
      const result100 = await validator.validate(slides, { mode: 'keynote', threshold: 100 });

      // With threshold 95, should pass if score >= 95
      // With threshold 100, may fail if score < 100
      expect(result95.passed || result95.score >= 95).toBe(true);
    });
  });

  describe('Per-Slide Metrics', () => {
    it('should track word count per slide', async () => {
      const slides = createValidKeynoteSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      result.perSlide.forEach(s => {
        expect(s.metrics.wordCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should detect slides with and without titles', async () => {
      const slides = createMixedTitleSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const withTitle = result.perSlide.filter(s => s.metrics.hasTitle);
      const withoutTitle = result.perSlide.filter(s => !s.metrics.hasTitle);

      expect(withTitle.length).toBeGreaterThan(0);
      expect(withoutTitle.length).toBeGreaterThan(0);
    });

    it('should track content presence', async () => {
      const slides = createValidKeynoteSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });

      const withContent = result.perSlide.filter(s => s.metrics.hasContent);
      expect(withContent.length).toBe(slides.length);
    });
  });

  describe('Report Generation', () => {
    it('should generate comprehensive report', async () => {
      const slides = createValidKeynoteSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });
      const report = validator.generateReport(result);

      expect(report).toContain('POWERPOINT PRESENTATION QA REPORT');
      expect(report).toContain('Overall Score');
      expect(report).toContain('Total Slides');
      expect(report).toContain('Issues by Category');
    });

    it('should list errors and warnings in report', async () => {
      const slides = createOverloadedSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });
      const report = validator.generateReport(result);

      expect(report).toContain('ERRORS');
    });
  });

  describe('QAResults Conversion', () => {
    it('should convert to standard QAResults format', async () => {
      const slides = createValidKeynoteSlides();
      const result = await validator.validate(slides, { mode: 'keynote' });
      const qaResults = validator.toQAResults(result, 'keynote');

      expect(qaResults.visual).toBeDefined();
      expect(qaResults.content).toBeDefined();
      expect(qaResults.expert).toBeDefined();
      expect(qaResults.accessibility).toBeDefined();
      expect(qaResults.issues).toBeDefined();
    });
  });
});

// Test fixtures

function createSlide(
  index: number,
  type: SlideType,
  data: Record<string, any>
): Slide {
  return {
    index,
    type,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      body: data.body,
      bullets: data.bullets,
      keyMessage: data.keyMessage,
      ...data
    }
  };
}

function createValidKeynoteSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Welcome', subtitle: 'A brief intro' }),
    createSlide(1, 'big-idea', { title: 'The Big Idea' }),
    createSlide(2, 'bullet-points', { title: 'Key Points', bullets: ['Point 1', 'Point 2', 'Point 3'] }),
    createSlide(3, 'quote', { quote: 'Great quote here', attribution: 'Author' }),
    createSlide(4, 'thank-you', { title: 'Thank You' })
  ];
}

function createValidBusinessSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Quarterly Business Review', subtitle: 'Q4 2024 Performance Analysis' }),
    createSlide(1, 'agenda', { title: 'Agenda', bullets: ['Financial Overview', 'Key Metrics', 'Action Items'] }),
    createSlide(2, 'two-column', {
      title: 'Revenue Performance Exceeded Targets',
      body: 'Our Q4 revenue of $12.5M exceeded the target by 15%, driven by strong enterprise sales and improved customer retention rates.',
      bullets: ['Enterprise deals up 23%', 'Retention improved to 94%', 'ARPU increased 12%']
    }),
    createSlide(3, 'metrics-grid', {
      title: 'Key Performance Indicators',
      metrics: [
        { value: '$12.5M', label: 'Revenue', trend: 'up' },
        { value: '94%', label: 'Retention', trend: 'up' },
        { value: '2,450', label: 'Customers', trend: 'up' }
      ]
    }),
    createSlide(4, 'thank-you', { title: 'Questions?', subtitle: 'Contact: team@example.com' })
  ];
}

function createOverloadedSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title', subtitle: 'Subtitle' }),
    createSlide(1, 'bullet-points', {
      title: 'This slide has way too much content that violates the word limit',
      body: 'This is additional body text that makes the slide even more overloaded with content that should not be on a single keynote slide because it violates all the principles of good presentation design according to experts like Nancy Duarte, Garr Reynolds, and Carmine Gallo who all recommend simplicity and focus.'
    }),
    createSlide(2, 'thank-you', { title: 'End' })
  ];
}

function createSparseSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title', subtitle: 'Sub' }),
    createSlide(1, 'bullet-points', { title: 'Point', bullets: ['One'] }),
    createSlide(2, 'bullet-points', { title: 'Another', bullets: ['Two'] }),
    createSlide(3, 'thank-you', { title: 'End' })
  ];
}

function createBulletOverloadSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'bullet-points', {
      title: 'Too Many Bullets',
      bullets: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven']
    }),
    createSlide(2, 'thank-you', { title: 'End' })
  ];
}

function createSlidesWithoutTitle(): Slide[] {
  return [
    createSlide(0, 'big-idea', { title: 'Big Idea' }),
    createSlide(1, 'bullet-points', { title: 'Points', bullets: ['A', 'B', 'C'] }),
    createSlide(2, 'thank-you', { title: 'End' })
  ];
}

function createTwoSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'bullet-points', { title: 'Content' })
  ];
}

function createSlidesWithoutConclusion(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'bullet-points', { title: 'Points', bullets: ['A', 'B'] }),
    createSlide(2, 'bullet-points', { title: 'More Points', bullets: ['C', 'D'] })
  ];
}

function createDuplicateTypeSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'big-idea', { title: 'Idea 1' }),
    createSlide(2, 'big-idea', { title: 'Idea 2' }),
    createSlide(3, 'big-idea', { title: 'Idea 3' }),
    createSlide(4, 'thank-you', { title: 'End' })
  ];
}

function createFourBulletSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'bullet-points', {
      title: 'Points',
      bullets: ['One', 'Two', 'Three', 'Four']
    }),
    createSlide(2, 'thank-you', { title: 'End' })
  ];
}

function createNoisySlides(): Slide[] {
  const longContent = Array(10).fill('This is filler content that adds noise to the slide.').join(' ');
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'bullet-points', { title: 'Noisy', body: longContent }),
    createSlide(2, 'bullet-points', { title: 'More Noise', body: longContent }),
    createSlide(3, 'bullet-points', { title: 'Even More', body: longContent }),
    createSlide(4, 'thank-you', { title: 'End' })
  ];
}

function createLongTitleSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'big-idea', {
      title: 'This is an extremely long title that takes much more than three seconds to read and comprehend which violates the glance test principle established by Nancy Duarte'
    }),
    createSlide(2, 'thank-you', { title: 'End' })
  ];
}

function createMixedTitleSlides(): Slide[] {
  return [
    createSlide(0, 'title', { title: 'Title' }),
    createSlide(1, 'big-idea', { title: 'Has Title' }),
    createSlide(2, 'full-image', { images: [{ src: 'image.jpg', alt: 'Image' }] }),
    createSlide(3, 'thank-you', { title: 'End' })
  ];
}
