/**
 * Claude Presentation Master - Type Definitions
 * @module types
 */

// =============================================================================
// PRESENTATION CONFIGURATION
// =============================================================================

export type PresentationMode = 'keynote' | 'business';
export type OutputFormat = 'html' | 'pptx';
export type ThemeName = 'default' | 'light-corporate' | 'modern-tech' | 'minimal' | 'warm' | 'creative';

export interface PresentationConfig {
  /** Input content (Markdown, JSON, YAML, or plain text) */
  content: string;
  /** Content format */
  contentType: 'markdown' | 'json' | 'yaml' | 'text';
  /** Presentation mode: keynote (6-25 words/slide) or business (40-80 words/slide) */
  mode: PresentationMode;
  /** Output formats to generate */
  format: OutputFormat[];
  /** Visual theme */
  theme?: ThemeName;
  /** Minimum QA score required (0-100, default: 95) */
  qaThreshold?: number;
  /** Skip QA validation (NOT RECOMMENDED) */
  skipQA?: boolean;
  /** Presentation title */
  title: string;
  /** Author name */
  author?: string;
  /** Subject/description */
  subject?: string;
  /** Output directory */
  output?: string;
  /** Minify HTML output */
  minify?: boolean;
  /** Custom CSS to inject */
  customCSS?: string;
  /** Custom Handlebars templates */
  customTemplates?: Record<string, string>;
}

// =============================================================================
// SLIDE TYPES
// =============================================================================

export type SlideType =
  // Common slides
  | 'title'
  | 'agenda'
  | 'section-divider'
  | 'thank-you'
  // Keynote-specific
  | 'big-idea'
  | 'single-statement'
  | 'big-number'
  | 'full-image'
  | 'quote'
  // Business-specific
  | 'two-column'
  | 'three-column'
  | 'bullet-points'
  | 'screenshot'
  | 'screenshot-left'
  | 'screenshot-right'
  | 'comparison'
  | 'timeline'
  | 'process'
  | 'metrics-grid'
  | 'pricing'
  | 'team'
  | 'features'
  | 'chart'
  | 'table'
  | 'social-proof'
  | 'case-study'
  | 'cta';

export interface Slide {
  /** Slide index (0-based) */
  index: number;
  /** Slide type */
  type: SlideType;
  /** Slide data for template rendering */
  data: SlideData;
  /** CSS classes to apply */
  classes?: string[];
  /** Custom styles */
  styles?: Record<string, string>;
  /** Speaker notes */
  notes?: string;
}

export interface SlideData {
  /** Main title */
  title?: string;
  /** Subtitle */
  subtitle?: string;
  /** Body content */
  body?: string;
  /** Bullet points */
  bullets?: string[];
  /** Key message */
  keyMessage?: string;
  /** Images */
  images?: ImageData[];
  /** Metrics/KPIs */
  metrics?: MetricData[];
  /** Quote text */
  quote?: string;
  /** Quote attribution */
  attribution?: string;
  /** Source citation */
  source?: string;
  /** Additional custom data */
  [key: string]: unknown;
}

export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
}

export interface MetricData {
  value: string | number;
  label: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

// =============================================================================
// QA SYSTEM TYPES
// =============================================================================

export interface QAResults {
  /** Visual quality results */
  visual: VisualQAResults;
  /** Content quality results */
  content: ContentQAResults;
  /** Expert methodology compliance */
  expert: ExpertQAResults;
  /** Accessibility compliance */
  accessibility: AccessibilityResults;
  /** Overall pass/fail */
  passed: boolean;
  /** List of issues found */
  issues: QAIssue[];
}

export interface VisualQAResults {
  /** Whitespace percentage (target: 35%+ keynote, 25%+ business) */
  whitespacePercentage: number;
  /** Layout balance score (0-1) */
  layoutBalance: number;
  /** Contrast ratio (target: 4.5+) */
  contrastRatio: number;
  /** Number of font families used (target: ≤2) */
  fontFamilies: number;
  /** Number of colors used */
  colorCount: number;
  /** Screenshots of each slide */
  screenshots: Buffer[];
  /** Per-slide visual scores */
  perSlide: SlideVisualScore[];
}

export interface SlideVisualScore {
  slideIndex: number;
  whitespace: number;
  balance: number;
  contrast: number;
  passed: boolean;
  issues: string[];
}

export interface ContentQAResults {
  /** Per-slide content analysis */
  perSlide: SlideContentScore[];
  /** Glance test results */
  glanceTest: GlanceTestResult[];
  /** Signal-to-noise ratio results */
  signalNoise: SignalNoiseResult[];
  /** One idea per slide validation */
  oneIdea: OneIdeaResult[];
}

export interface SlideContentScore {
  slideIndex: number;
  wordCount: number;
  withinLimit: boolean;
  hasActionTitle: boolean;
  issues: string[];
}

export interface GlanceTestResult {
  slideIndex: number;
  keyMessage: string;
  wordCount: number;
  readingTime: number;
  passed: boolean;
  recommendation?: string;
}

export interface SignalNoiseResult {
  slideIndex: number;
  signalCount: number;
  noiseCount: number;
  signalRatio: number;
  passed: boolean;
  noiseElements: string[];
}

export interface OneIdeaResult {
  slideIndex: number;
  ideaCount: number;
  mainIdea: string;
  passed: boolean;
  conflictingIdeas?: string[];
}

export interface ExpertQAResults {
  /** Nancy Duarte validation */
  duarte: ExpertValidation;
  /** Garr Reynolds validation */
  reynolds: ExpertValidation;
  /** Carmine Gallo validation */
  gallo: ExpertValidation;
  /** Chris Anderson validation */
  anderson: ExpertValidation;
}

export interface ExpertValidation {
  expertName: string;
  principlesChecked: string[];
  passed: boolean;
  score: number;
  violations: string[];
}

export interface AccessibilityResults {
  /** WCAG compliance level achieved */
  wcagLevel: 'A' | 'AA' | 'AAA' | 'FAIL';
  /** Contrast issues found */
  contrastIssues: ContrastIssue[];
  /** Font size issues */
  fontSizeIssues: FontSizeIssue[];
  /** Focus state coverage */
  focusCoverage: number;
  /** Color-blind safety */
  colorBlindSafe: boolean;
}

export interface ContrastIssue {
  slideIndex: number;
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
}

export interface FontSizeIssue {
  slideIndex: number;
  element: string;
  actualSize: number;
  minimumSize: number;
}

export interface QAIssue {
  /** Issue severity */
  severity: 'error' | 'warning' | 'info';
  /** Issue category */
  category: 'visual' | 'content' | 'expert' | 'accessibility';
  /** Slide index (if applicable) */
  slideIndex?: number;
  /** Issue description */
  message: string;
  /** Suggested fix */
  suggestion?: string;
}

// =============================================================================
// PRESENTATION RESULT
// =============================================================================

export interface PresentationResult {
  /** Generated outputs */
  outputs: {
    html?: string;
    pptx?: Buffer;
  };
  /** QA validation results */
  qaResults: QAResults;
  /** Overall QA score (0-100) */
  score: number;
  /** Presentation metadata */
  metadata: PresentationMetadata;
}

export interface PresentationMetadata {
  /** Presentation title */
  title: string;
  /** Author */
  author: string;
  /** Generation timestamp */
  generatedAt: string;
  /** Presentation mode */
  mode: PresentationMode;
  /** Total slide count */
  slideCount: number;
  /** Total word count */
  wordCount: number;
  /** Average words per slide */
  avgWordsPerSlide: number;
  /** Estimated presentation duration (minutes) */
  estimatedDuration: number;
  /** Themes/frameworks used */
  frameworks: string[];
}

// =============================================================================
// CONTENT ANALYSIS TYPES
// =============================================================================

export interface ContentAnalysis {
  /** SCQA structure extracted */
  scqa: SCQAStructure;
  /** Sparkline narrative arc */
  sparkline: SparklineStructure;
  /** Key messages identified */
  keyMessages: string[];
  /** Generated action titles */
  titles: string[];
  /** STAR moments identified */
  starMoments: string[];
  /** Estimated slide count */
  estimatedSlideCount: number;
}

export interface SCQAStructure {
  situation: string;
  complication: string;
  question: string;
  answer: string;
}

export interface SparklineStructure {
  whatIs: string[];
  whatCouldBe: string[];
  callToAdventure: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export class ValidationError extends Error {
  constructor(
    public errors: string[],
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class QAFailureError extends Error {
  constructor(
    public score: number,
    public threshold: number,
    public qaResults: QAResults,
    message = `QA score ${score} below threshold ${threshold}`
  ) {
    super(message);
    this.name = 'QAFailureError';
  }

  getIssues(): string[] {
    return this.qaResults.issues.map(issue => issue.message);
  }
}

export class TemplateNotFoundError extends Error {
  constructor(
    public templatePath: string,
    message = `Template not found: ${templatePath}`
  ) {
    super(message);
    this.name = 'TemplateNotFoundError';
  }
}
