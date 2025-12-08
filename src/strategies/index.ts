/**
 * Presentation Execution Strategies
 *
 * This module contains world-class execution strategies for each presentation type.
 * Each strategy defines:
 * - Exact slide sequence
 * - Required templates
 * - Content transformation rules
 * - Expert methodology application
 * - Quality benchmarks
 *
 * PHILOSOPHY: Excellence in execution, not just validation
 */

export { InvestmentBankingStrategy } from './InvestmentBankingStrategy.js';
export { ConsultingDeckStrategy } from './ConsultingDeckStrategy.js';
export { InvestorPitchStrategy } from './InvestorPitchStrategy.js';
export { TEDKeynoteStrategy } from './TEDKeynoteStrategy.js';
export { SalesPitchStrategy } from './SalesPitchStrategy.js';
export { TechnicalPresentationStrategy } from './TechnicalPresentationStrategy.js';
export { AllHandsStrategy } from './AllHandsStrategy.js';
export { StrategyFactory } from './StrategyFactory.js';

export type { ExecutionStrategy, SlideBlueprint, ContentTransform } from './types.js';
