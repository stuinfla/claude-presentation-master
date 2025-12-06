/**
 * Knowledge Base - RuVector Expert Principles Loader
 *
 * Loads and provides access to the 6,300+ line expert knowledge base
 * containing methodologies from 40+ presentation experts.
 *
 * This runs WITHOUT any API - it's static data bundled with the package.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'yaml';

// Types for knowledge base structure
export interface ExpertPrinciple {
  name: string;
  description: string;
  validation?: string[];
  examples?: string[];
}

export interface ExpertMethodology {
  name: string;
  principles: ExpertPrinciple[];
  slideTypes?: string[];
  wordLimits?: {
    min?: number;
    max?: number;
  };
}

export interface FrameworkSelector {
  byAudience: Record<string, {
    primaryFramework: string;
    secondaryFramework?: string;
    slideTypes: string[];
  }>;
  byGoal: Record<string, {
    primaryFramework: string;
    secondaryFramework?: string;
    slideTypes: string[];
  }>;
}

export interface AutomatedQA {
  scoringRubric: {
    totalPoints: number;
    passingThreshold: number;
    categories: Record<string, {
      weight: number;
      checks: Record<string, unknown>;
    }>;
  };
}

export interface KnowledgeBaseData {
  version: string;
  lastUpdated: string;
  experts: Record<string, ExpertMethodology>;
  frameworkSelector: FrameworkSelector;
  automatedQA: AutomatedQA;
  slideTypes: Record<string, unknown>;
  modes: {
    keynote: unknown;
    business: unknown;
  };
}

export class KnowledgeBase {
  private data: KnowledgeBaseData | null = null;
  private loaded = false;

  /**
   * Load the knowledge base from the bundled YAML file.
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      // Get path to bundled assets - try multiple possible locations
      const possiblePaths = [
        join(__dirname, '../../assets/presentation-knowledge.yaml'),
        join(__dirname, '../assets/presentation-knowledge.yaml'),
        join(process.cwd(), 'assets/presentation-knowledge.yaml'),
        join(process.cwd(), 'node_modules/claude-presentation-master/assets/presentation-knowledge.yaml')
      ];

      let assetPath = '';
      for (const p of possiblePaths) {
        try {
          readFileSync(p);
          assetPath = p;
          break;
        } catch {
          continue;
        }
      }

      if (!assetPath) {
        throw new Error('Could not locate knowledge base file');
      }

      const content = readFileSync(assetPath, 'utf-8');
      this.data = yaml.parse(content) as KnowledgeBaseData;
      this.loaded = true;

      console.log(`📚 Knowledge base loaded: v${this.data.version}`);
    } catch (error) {
      console.warn('⚠️  Could not load knowledge base, using defaults');
      this.data = this.getDefaultData();
      this.loaded = true;
    }
  }

  /**
   * Get expert methodology by name.
   */
  getExpert(name: string): ExpertMethodology | undefined {
    this.ensureLoaded();
    return this.data?.experts?.[name];
  }

  /**
   * Get all expert names.
   */
  getExpertNames(): string[] {
    this.ensureLoaded();
    return Object.keys(this.data?.experts ?? {});
  }

  /**
   * Get framework recommendation for audience.
   */
  getFrameworkForAudience(audience: string): {
    primaryFramework: string;
    secondaryFramework?: string;
    slideTypes: string[];
  } | undefined {
    this.ensureLoaded();
    return this.data?.frameworkSelector?.byAudience?.[audience];
  }

  /**
   * Get framework recommendation for goal.
   */
  getFrameworkForGoal(goal: string): {
    primaryFramework: string;
    secondaryFramework?: string;
    slideTypes: string[];
  } | undefined {
    this.ensureLoaded();
    return this.data?.frameworkSelector?.byGoal?.[goal];
  }

  /**
   * Get QA scoring rubric.
   */
  getScoringRubric(): AutomatedQA['scoringRubric'] | undefined {
    this.ensureLoaded();
    return this.data?.automatedQA?.scoringRubric;
  }

  /**
   * Get mode configuration (keynote or business).
   */
  getModeConfig(mode: 'keynote' | 'business'): unknown {
    this.ensureLoaded();
    return this.data?.modes?.[mode];
  }

  /**
   * Get slide type configuration.
   */
  getSlideType(type: string): unknown {
    this.ensureLoaded();
    return this.data?.slideTypes?.[type];
  }

  /**
   * Get the knowledge base version.
   */
  getVersion(): string {
    this.ensureLoaded();
    return this.data?.version ?? 'unknown';
  }

  /**
   * Validate a slide against expert principles.
   */
  validateAgainstExpert(
    expertName: string,
    slideData: { wordCount: number; hasActionTitle: boolean; bulletCount: number }
  ): { passed: boolean; violations: string[] } {
    const expert = this.getExpert(expertName);
    if (!expert) {
      return { passed: true, violations: [] };
    }

    const violations: string[] = [];

    // Check word limits
    if (expert.wordLimits) {
      if (expert.wordLimits.max && slideData.wordCount > expert.wordLimits.max) {
        violations.push(`Exceeds ${expertName} word limit of ${expert.wordLimits.max}`);
      }
      if (expert.wordLimits.min && slideData.wordCount < expert.wordLimits.min) {
        violations.push(`Below ${expertName} minimum of ${expert.wordLimits.min} words`);
      }
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  /**
   * Ensure knowledge base is loaded.
   */
  private ensureLoaded(): void {
    if (!this.loaded) {
      // Synchronous fallback for non-async contexts
      this.data = this.getDefaultData();
      this.loaded = true;
    }
  }

  /**
   * Get default data if YAML can't be loaded.
   */
  private getDefaultData(): KnowledgeBaseData {
    return {
      version: '1.0.0-fallback',
      lastUpdated: new Date().toISOString(),
      experts: {
        'Nancy Duarte': {
          name: 'Nancy Duarte',
          principles: [
            { name: 'Glance Test', description: 'Message clear in 3 seconds' },
            { name: 'STAR Moment', description: 'Something They\'ll Always Remember' },
            { name: 'Sparkline', description: 'Contrast What Is vs What Could Be' }
          ]
        },
        'Garr Reynolds': {
          name: 'Garr Reynolds',
          principles: [
            { name: 'Signal-to-Noise', description: 'Maximize signal, minimize noise' },
            { name: 'Simplicity', description: 'Amplify through simplification' }
          ]
        },
        'Carmine Gallo': {
          name: 'Carmine Gallo',
          principles: [
            { name: 'Rule of Three', description: 'Maximum 3 key messages' },
            { name: 'Emotional Connection', description: 'Connect emotionally first' }
          ]
        },
        'Chris Anderson': {
          name: 'Chris Anderson',
          principles: [
            { name: 'One Idea', description: 'One powerful idea per talk' },
            { name: 'Dead Laptop Test', description: 'Present without slides' }
          ]
        }
      },
      frameworkSelector: {
        byAudience: {
          'board': {
            primaryFramework: 'Barbara Minto',
            slideTypes: ['executive_summary', 'data_insight']
          },
          'sales': {
            primaryFramework: 'Nancy Duarte',
            slideTypes: ['big_idea', 'social_proof']
          }
        },
        byGoal: {
          'persuade': {
            primaryFramework: 'Nancy Duarte',
            slideTypes: ['big_idea', 'star_moment']
          },
          'inform': {
            primaryFramework: 'Barbara Minto',
            slideTypes: ['bullet_points', 'data_insight']
          }
        }
      },
      automatedQA: {
        scoringRubric: {
          totalPoints: 100,
          passingThreshold: 95,
          categories: {
            visual: { weight: 35, checks: {} },
            content: { weight: 30, checks: {} },
            expert: { weight: 25, checks: {} },
            accessibility: { weight: 10, checks: {} }
          }
        }
      },
      slideTypes: {},
      modes: {
        keynote: { maxWords: 25, minWhitespace: 35 },
        business: { maxWords: 80, minWhitespace: 25 }
      }
    };
  }
}

// Singleton instance
let knowledgeBaseInstance: KnowledgeBase | null = null;

/**
 * Get the knowledge base singleton.
 */
export function getKnowledgeBase(): KnowledgeBase {
  if (!knowledgeBaseInstance) {
    knowledgeBaseInstance = new KnowledgeBase();
  }
  return knowledgeBaseInstance;
}
