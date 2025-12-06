/**
 * Presentation Engine - Main Orchestrator
 *
 * Coordinates content analysis, slide generation, and QA validation
 * to produce world-class presentations.
 */

import type {
  PresentationConfig,
  PresentationResult,
  PresentationMetadata,
  Slide,
  ContentAnalysis
} from '../types/index.js';
import { ValidationError, QAFailureError } from '../types/index.js';
import { ContentAnalyzer } from './ContentAnalyzer.js';
import { SlideFactory } from './SlideFactory.js';
import { TemplateEngine } from './TemplateEngine.js';
import { ScoreCalculator } from './ScoreCalculator.js';
import { QAEngine } from '../qa/QAEngine.js';
import { RevealJsGenerator } from '../generators/html/RevealJsGenerator.js';
import { PowerPointGenerator } from '../generators/pptx/PowerPointGenerator.js';

export class PresentationEngine {
  private contentAnalyzer: ContentAnalyzer;
  private slideFactory: SlideFactory;
  private templateEngine: TemplateEngine;
  private scoreCalculator: ScoreCalculator;
  private qaEngine: QAEngine;
  private htmlGenerator: RevealJsGenerator;
  private pptxGenerator: PowerPointGenerator;

  constructor() {
    this.contentAnalyzer = new ContentAnalyzer();
    this.slideFactory = new SlideFactory();
    this.templateEngine = new TemplateEngine();
    this.scoreCalculator = new ScoreCalculator();
    this.qaEngine = new QAEngine();
    this.htmlGenerator = new RevealJsGenerator();
    this.pptxGenerator = new PowerPointGenerator();
  }

  /**
   * Generate a presentation from content.
   *
   * @param config - Presentation configuration
   * @returns Presentation result with outputs, QA results, and score
   */
  async generate(config: PresentationConfig): Promise<PresentationResult> {
    // 1. Validate configuration
    this.validateConfig(config);

    // 2. Analyze content structure
    console.log('📝 Analyzing content...');
    const analysis = await this.contentAnalyzer.analyze(config.content, config.contentType);

    // 3. Generate slide structure
    console.log('🎨 Creating slides...');
    const slides = await this.slideFactory.createSlides(analysis, config.mode);

    // 4. Pre-generation validation
    console.log('✅ Validating structure...');
    const structureErrors = this.validateStructure(slides, config.mode);
    if (structureErrors.length > 0) {
      throw new ValidationError(structureErrors, 'Slide structure validation failed');
    }

    // 5. Generate outputs
    console.log('🔨 Generating outputs...');
    const outputs: { html?: string; pptx?: Buffer } = {};

    if (config.format.includes('html')) {
      outputs.html = await this.htmlGenerator.generate(slides, config);
    }

    if (config.format.includes('pptx')) {
      outputs.pptx = await this.pptxGenerator.generate(slides, config);
    }

    // 6. QA Validation (unless skipped)
    let qaResults;
    let score = 100;

    if (!config.skipQA && outputs.html) {
      console.log('🔍 Running QA validation...');
      qaResults = await this.qaEngine.validate(outputs.html, {
        mode: config.mode,
        strictMode: true
      });

      // 7. Calculate score
      score = this.scoreCalculator.calculate(qaResults);

      console.log(`📊 QA Score: ${score}/100`);

      // 8. Enforce threshold
      const threshold = config.qaThreshold ?? 95;
      if (score < threshold) {
        throw new QAFailureError(score, threshold, qaResults);
      }
    } else {
      // Create empty QA results if skipped
      qaResults = this.qaEngine.createEmptyResults();
      console.log('⚠️  QA validation skipped (NOT RECOMMENDED)');
    }

    // 9. Build metadata
    const metadata = this.buildMetadata(config, analysis, slides);

    return {
      outputs,
      qaResults,
      score,
      metadata
    };
  }

  /**
   * Validate presentation configuration.
   */
  private validateConfig(config: PresentationConfig): void {
    const errors: string[] = [];

    if (!config.content || config.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (!config.mode || !['keynote', 'business'].includes(config.mode)) {
      errors.push('Mode must be "keynote" or "business"');
    }

    if (!config.format || config.format.length === 0) {
      errors.push('At least one output format is required');
    }

    if (!config.title || config.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (config.qaThreshold !== undefined) {
      if (config.qaThreshold < 0 || config.qaThreshold > 100) {
        errors.push('QA threshold must be between 0 and 100');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  /**
   * Validate slide structure before generation.
   */
  private validateStructure(slides: Slide[], mode: 'keynote' | 'business'): string[] {
    const errors: string[] = [];

    if (slides.length === 0) {
      errors.push('No slides generated from content');
      return errors;
    }

    // Check minimum slide count
    if (slides.length < 3) {
      errors.push('Presentation must have at least 3 slides');
    }

    // Mode-specific validation
    slides.forEach((slide, index) => {
      const wordCount = this.countWords(slide);

      if (mode === 'keynote') {
        if (wordCount > 25) {
          errors.push(`Slide ${index + 1}: ${wordCount} words exceeds keynote limit of 25`);
        }
      } else {
        // Business mode
        if (wordCount < 20 && !['title', 'section-divider', 'thank-you'].includes(slide.type)) {
          errors.push(`Slide ${index + 1}: ${wordCount} words may be too sparse for business mode`);
        }
        if (wordCount > 100) {
          errors.push(`Slide ${index + 1}: ${wordCount} words exceeds business limit of 100`);
        }
      }
    });

    return errors;
  }

  /**
   * Count words in a slide.
   */
  private countWords(slide: Slide): number {
    let text = '';

    if (slide.data.title) text += slide.data.title + ' ';
    if (slide.data.subtitle) text += slide.data.subtitle + ' ';
    if (slide.data.body) text += slide.data.body + ' ';
    if (slide.data.bullets) text += slide.data.bullets.join(' ') + ' ';
    if (slide.data.keyMessage) text += slide.data.keyMessage + ' ';

    return text.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Build presentation metadata.
   */
  private buildMetadata(
    config: PresentationConfig,
    analysis: ContentAnalysis,
    slides: Slide[]
  ): PresentationMetadata {
    const wordCounts = slides.map(s => this.countWords(s));
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
    const avgWordsPerSlide = Math.round(totalWords / slides.length);

    // Estimate duration: ~1-2 minutes per slide depending on mode
    const minutesPerSlide = config.mode === 'keynote' ? 1.5 : 2;
    const estimatedDuration = Math.round(slides.length * minutesPerSlide);

    return {
      title: config.title,
      author: config.author ?? 'Unknown',
      generatedAt: new Date().toISOString(),
      mode: config.mode,
      slideCount: slides.length,
      wordCount: totalWords,
      avgWordsPerSlide,
      estimatedDuration,
      frameworks: this.detectFrameworks(analysis)
    };
  }

  /**
   * Detect which expert frameworks were applied.
   */
  private detectFrameworks(analysis: ContentAnalysis): string[] {
    const frameworks: string[] = [];

    if (analysis.scqa.situation && analysis.scqa.answer) {
      frameworks.push('Barbara Minto (Pyramid Principle)');
    }

    if (analysis.sparkline.whatIs.length > 0 && analysis.sparkline.whatCouldBe.length > 0) {
      frameworks.push('Nancy Duarte (Sparkline)');
    }

    if (analysis.starMoments.length > 0) {
      frameworks.push('Nancy Duarte (STAR Moment)');
    }

    if (analysis.keyMessages.length <= 3) {
      frameworks.push('Carmine Gallo (Rule of Three)');
    }

    return frameworks;
  }
}
