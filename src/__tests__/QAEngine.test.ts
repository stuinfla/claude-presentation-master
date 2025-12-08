/**
 * QA Engine Tests
 *
 * Comprehensive test suite for the presentation quality assurance system.
 * These tests ensure that the QA system catches all quality issues
 * before presentations are exported.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { QAEngine } from '../qa/QAEngine.js';
import { ScoreCalculator } from '../core/ScoreCalculator.js';

describe('QAEngine', () => {
  let qaEngine: QAEngine;
  let scoreCalculator: ScoreCalculator;

  beforeAll(() => {
    qaEngine = new QAEngine();
    scoreCalculator = new ScoreCalculator();
  });

  describe('HTML Validation', () => {
    it('should pass a well-formed presentation', async () => {
      const html = createValidPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });
      const score = scoreCalculator.calculate(results);

      expect(score).toBeGreaterThanOrEqual(80);
      expect(results.issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should fail a presentation with too many words per slide', async () => {
      const html = createOverloadedPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      const contentIssues = results.issues.filter(i => i.category === 'content');
      expect(contentIssues.length).toBeGreaterThan(0);
    });

    it('should detect missing whitespace', async () => {
      const html = createDensePresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      expect(results.visual.whitespacePercentage).toBeLessThan(35);
    });

    it('should validate glance test (3-second rule)', async () => {
      const html = createLongTitlePresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      const failedGlanceTests = results.content.glanceTest.filter(g => !g.passed);
      expect(failedGlanceTests.length).toBeGreaterThan(0);
    });

    it('should check font family consistency', async () => {
      const html = createMultiFontPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      expect(results.visual.fontFamilies).toBeGreaterThan(2);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate weighted scores correctly', async () => {
      const html = createValidPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });
      const score = scoreCalculator.calculate(results);

      // Score should be between 0 and 100
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should deduct points for errors', async () => {
      const goodHtml = createValidPresentation();
      const badHtml = createOverloadedPresentation();

      const goodResults = await qaEngine.validate(goodHtml, { mode: 'keynote' });
      const badResults = await qaEngine.validate(badHtml, { mode: 'keynote' });

      const goodScore = scoreCalculator.calculate(goodResults);
      const badScore = scoreCalculator.calculate(badResults);

      expect(goodScore).toBeGreaterThan(badScore);
    });

    it('should generate correct grades', () => {
      expect(scoreCalculator.getGrade(97)).toBe('A+');
      expect(scoreCalculator.getGrade(92)).toBe('A');
      expect(scoreCalculator.getGrade(87)).toBe('A-');
      expect(scoreCalculator.getGrade(82)).toBe('B+');
      expect(scoreCalculator.getGrade(77)).toBe('B');
      expect(scoreCalculator.getGrade(72)).toBe('B-');
      expect(scoreCalculator.getGrade(67)).toBe('C+');
      expect(scoreCalculator.getGrade(62)).toBe('C');
      expect(scoreCalculator.getGrade(57)).toBe('C-');
      expect(scoreCalculator.getGrade(52)).toBe('D');
      expect(scoreCalculator.getGrade(40)).toBe('F');
    });

    it('should enforce 95 threshold for passing by default', () => {
      expect(scoreCalculator.isPassing(96)).toBe(true);
      expect(scoreCalculator.isPassing(95)).toBe(true);
      expect(scoreCalculator.isPassing(94)).toBe(false);
    });
  });

  describe('Expert Methodology Validation', () => {
    it('should validate against Nancy Duarte principles', async () => {
      const html = createValidPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      expect(results.expert.duarte.principlesChecked.length).toBeGreaterThan(0);
    });

    it('should validate against Garr Reynolds principles', async () => {
      const html = createValidPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      expect(results.expert.reynolds.principlesChecked.length).toBeGreaterThan(0);
    });

    it('should check one idea per slide', async () => {
      const html = createValidPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      const multiIdeaSlides = results.content.oneIdea.filter(o => !o.passed);
      expect(multiIdeaSlides.length).toBe(0);
    });
  });

  describe('Accessibility Validation', () => {
    it('should check font sizes', async () => {
      const html = createSmallFontPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      expect(results.accessibility.fontSizeIssues.length).toBeGreaterThan(0);
    });

    it('should determine WCAG compliance level', async () => {
      const html = createValidPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });

      expect(['A', 'AA', 'AAA', 'FAIL']).toContain(results.accessibility.wcagLevel);
    });
  });

  describe('Report Generation', () => {
    it('should generate human-readable report', async () => {
      const html = createValidPresentation();
      const results = await qaEngine.validate(html, { mode: 'keynote' });
      const report = scoreCalculator.generateReport(results);

      expect(report).toContain('PRESENTATION QA REPORT');
      expect(report).toContain('Overall Score');
      expect(report).toContain('Visual Quality');
      expect(report).toContain('Content Quality');
    });
  });
});

// Test fixtures

function createValidPresentation(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Test Presentation</title>
  <link rel="stylesheet" href="reveal.js/dist/reveal.css">
  <style>
    .slides section { font-family: 'Inter', sans-serif; }
    .slides h1 { font-size: 48px; }
    .slides h2 { font-size: 36px; }
    .slides p { font-size: 24px; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h1>Welcome</h1>
        <p>A brief introduction</p>
      </section>
      <section>
        <h2>Key Point</h2>
        <p>This is the main message</p>
      </section>
      <section>
        <h2>Thank You</h2>
      </section>
    </div>
  </div>
  <script src="reveal.js/dist/reveal.js"></script>
  <script>Reveal.initialize({ center: false });</script>
</body>
</html>`;
}

function createOverloadedPresentation(): string {
  return `
<!DOCTYPE html>
<html>
<head><title>Overloaded</title></head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h2>Too Much Content</h2>
        <p>This slide has way too many words and content that exceeds the recommended
        limit for keynote presentations. According to Nancy Duarte and other presentation
        experts, slides should have no more than 25 words for keynote style and should
        pass the 3-second glance test. This paragraph alone violates those principles
        multiple times over and should trigger validation errors.</p>
      </section>
    </div>
  </div>
</body>
</html>`;
}

function createDensePresentation(): string {
  return `
<!DOCTYPE html>
<html>
<head><title>Dense</title></head>
<body>
  <div class="reveal">
    <div class="slides">
      <section style="padding: 0; margin: 0;">
        <h1 style="margin: 0;">Title</h1>
        <h2 style="margin: 0;">Subtitle</h2>
        <p style="margin: 0;">Content 1</p>
        <p style="margin: 0;">Content 2</p>
        <p style="margin: 0;">Content 3</p>
        <p style="margin: 0;">Content 4</p>
        <p style="margin: 0;">Content 5</p>
        <ul style="margin: 0;">
          <li>Bullet 1</li>
          <li>Bullet 2</li>
          <li>Bullet 3</li>
          <li>Bullet 4</li>
          <li>Bullet 5</li>
        </ul>
      </section>
    </div>
  </div>
</body>
</html>`;
}

function createLongTitlePresentation(): string {
  return `
<!DOCTYPE html>
<html>
<head><title>Long Titles</title></head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h1>This is an extremely long title that takes more than three seconds to read and comprehend which violates the glance test principle</h1>
      </section>
    </div>
  </div>
</body>
</html>`;
}

function createMultiFontPresentation(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Multi Font</title>
  <style>
    .slides h1 { font-family: 'Comic Sans MS', cursive; }
    .slides h2 { font-family: 'Times New Roman', serif; }
    .slides p { font-family: 'Arial', sans-serif; }
    .slides li { font-family: 'Courier New', monospace; }
    .slides blockquote { font-family: 'Georgia', serif; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h1>Title</h1>
        <h2>Subtitle</h2>
        <p>Paragraph</p>
        <ul><li>List item</li></ul>
        <blockquote>Quote</blockquote>
      </section>
    </div>
  </div>
</body>
</html>`;
}

function createSmallFontPresentation(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Small Font</title>
  <style>
    .slides p { font-size: 10px; }
    .slides li { font-size: 8px; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h2>Heading</h2>
        <p>This text is too small to read</p>
        <ul>
          <li>Tiny bullet point</li>
        </ul>
      </section>
    </div>
  </div>
</body>
</html>`;
}
