/**
 * Strategy Factory
 *
 * Selects the appropriate execution strategy based on presentation type.
 * Each strategy encapsulates world-class expertise for its domain.
 */

import type { PresentationType } from '../types/index.js';
import type { ExecutionStrategy } from './types.js';
import { TEDKeynoteStrategy } from './TEDKeynoteStrategy.js';
import { SalesPitchStrategy } from './SalesPitchStrategy.js';
import { ConsultingDeckStrategy } from './ConsultingDeckStrategy.js';
import { InvestmentBankingStrategy } from './InvestmentBankingStrategy.js';
import { InvestorPitchStrategy } from './InvestorPitchStrategy.js';
import { TechnicalPresentationStrategy } from './TechnicalPresentationStrategy.js';
import { AllHandsStrategy } from './AllHandsStrategy.js';

/**
 * Factory for creating presentation execution strategies.
 */
export class StrategyFactory {
  private strategies: Map<PresentationType, ExecutionStrategy>;

  constructor() {
    this.strategies = new Map();

    // Initialize all strategies
    this.strategies.set('ted_keynote', new TEDKeynoteStrategy());
    this.strategies.set('sales_pitch', new SalesPitchStrategy());
    this.strategies.set('consulting_deck', new ConsultingDeckStrategy());
    this.strategies.set('investment_banking', new InvestmentBankingStrategy());
    this.strategies.set('investor_pitch', new InvestorPitchStrategy());
    this.strategies.set('technical_presentation', new TechnicalPresentationStrategy());
    this.strategies.set('all_hands', new AllHandsStrategy());
  }

  /**
   * Get the execution strategy for a presentation type.
   */
  getStrategy(type: PresentationType): ExecutionStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      console.warn(`No strategy found for type "${type}", falling back to consulting_deck`);
      return this.strategies.get('consulting_deck')!;
    }

    return strategy;
  }

  /**
   * Get all available strategies.
   */
  getAllStrategies(): ExecutionStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategy descriptions for user guidance.
   */
  getStrategyDescriptions(): Record<PresentationType, string> {
    const descriptions: Partial<Record<PresentationType, string>> = {};

    for (const [type, strategy] of this.strategies) {
      descriptions[type] = `${strategy.name}: ${strategy.description}`;
    }

    return descriptions as Record<PresentationType, string>;
  }

  /**
   * Get the primary expert for a presentation type.
   */
  getPrimaryExpert(type: PresentationType): string {
    const strategy = this.getStrategy(type);
    return strategy.experts.primary;
  }

  /**
   * Get all experts for a presentation type.
   */
  getAllExperts(type: PresentationType): string[] {
    const strategy = this.getStrategy(type);
    return [strategy.experts.primary, ...strategy.experts.secondary];
  }
}
