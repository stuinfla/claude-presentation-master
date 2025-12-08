/**
 * Claude Presentation Master
 *
 * Generate world-class presentations using expert methodologies from
 * Duarte, Reynolds, Gallo, and Anderson. Enforces rigorous quality
 * standards through real visual validation.
 *
 * @packageDocumentation
 * @module claude-presentation-master
 * @author Stuart Kerr <stuart@isovision.ai>
 * @license MIT
 */

// =============================================================================
// EXPORTS: Types
// =============================================================================

export * from './types/index.js';

// =============================================================================
// EXPORTS: Core Classes
// =============================================================================

export { PresentationEngine } from './core/PresentationEngine.js';
export { ContentAnalyzer } from './core/ContentAnalyzer.js';
export { SlideFactory } from './core/SlideFactory.js';
export { TemplateEngine } from './core/TemplateEngine.js';
export { ScoreCalculator } from './core/ScoreCalculator.js';

// =============================================================================
// EXPORTS: QA System
// =============================================================================

export { QAEngine } from './qa/QAEngine.js';
export { PPTXValidator } from './qa/PPTXValidator.js';
export { AccessibilityValidator } from './qa/AccessibilityValidator.js';
export { AutoRemediation } from './qa/AutoRemediation.js';
export { HTMLLayoutValidator } from './qa/HTMLLayoutValidator.js';
export { HallucinationDetector } from './qa/HallucinationDetector.js';

// =============================================================================
// EXPORTS: Type Detection (Granular Presentation Types)
// =============================================================================

export { TypeDetector, PRESENTATION_TYPE_RULES } from './core/TypeDetector.js';

// =============================================================================
// EXPORTS: Strategy System
// =============================================================================

export { StrategyFactory } from './strategies/StrategyFactory.js';
export type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './strategies/types.js';

// =============================================================================
// EXPORTS: Generators
// =============================================================================

export { RevealJsGenerator } from './generators/html/RevealJsGenerator.js';
export { PowerPointGenerator } from './generators/pptx/PowerPointGenerator.js';

// =============================================================================
// EXPORTS: Media Providers
// =============================================================================

export * from './media/index.js';

// =============================================================================
// EXPORTS: Knowledge Base
// =============================================================================

export { KnowledgeBase, getKnowledgeBase } from './knowledge/KnowledgeBase.js';

// =============================================================================
// MAIN API FUNCTIONS
// =============================================================================

import { PresentationEngine } from './core/PresentationEngine.js';
import { QAEngine } from './qa/QAEngine.js';
import { PPTXValidator } from './qa/PPTXValidator.js';
import { AccessibilityValidator } from './qa/AccessibilityValidator.js';
import type { PresentationConfig, PresentationResult, QAResults } from './types/index.js';

/**
 * Generate a presentation from content.
 *
 * @example
 * ```typescript
 * import { generate } from '@isovision/claude-presentation-master';
 *
 * const result = await generate({
 *   content: '# My Presentation\n\n...',
 *   contentType: 'markdown',
 *   mode: 'keynote',
 *   format: ['html', 'pptx'],
 *   qaThreshold: 95,
 *   title: 'My Amazing Presentation'
 * });
 *
 * console.log(`Score: ${result.score}/100`);
 * ```
 *
 * @param config - Presentation configuration
 * @returns Presentation result with outputs, QA results, and score
 * @throws {ValidationError} If input validation fails
 * @throws {QAFailureError} If QA score is below threshold
 */
export async function generate(config: PresentationConfig): Promise<PresentationResult> {
  const engine = new PresentationEngine();
  return engine.generate(config);
}

/**
 * Validate an existing presentation.
 *
 * @example
 * ```typescript
 * import { validate } from '@isovision/claude-presentation-master';
 * import fs from 'fs';
 *
 * const html = fs.readFileSync('presentation.html', 'utf-8');
 * const result = await validate(html, { mode: 'keynote' });
 *
 * console.log(`Score: ${result.score}/100`);
 * console.log(`Passed: ${result.passed}`);
 * ```
 *
 * @param presentation - HTML string or file buffer
 * @param options - Validation options
 * @returns QA validation results
 */
export async function validate(
  presentation: string | Buffer,
  options?: {
    mode?: 'keynote' | 'business';
    threshold?: number;
    strictMode?: boolean;
  }
): Promise<QAResults & { score: number }> {
  const qaEngine = new QAEngine();
  const results = await qaEngine.validate(presentation, options);
  const score = qaEngine.calculateScore(results);

  return {
    ...results,
    score
  };
}

/**
 * Get the version of the package.
 */
export const VERSION = '2.0.0';

/**
 * Default export for convenience.
 */
export default {
  generate,
  validate,
  PresentationEngine,
  QAEngine,
  PPTXValidator,
  AccessibilityValidator,
  VERSION
};
