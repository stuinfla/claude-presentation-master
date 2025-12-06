/**
 * Claude Presentation Master - Type Definitions
 * @module types
 */
type PresentationMode = 'keynote' | 'business';
type OutputFormat = 'html' | 'pptx';
type ThemeName = 'default' | 'light-corporate' | 'modern-tech' | 'minimal' | 'warm' | 'creative';
interface PresentationConfig {
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
type SlideType = 'title' | 'agenda' | 'section-divider' | 'thank-you' | 'big-idea' | 'single-statement' | 'big-number' | 'full-image' | 'quote' | 'two-column' | 'three-column' | 'bullet-points' | 'screenshot' | 'screenshot-left' | 'screenshot-right' | 'comparison' | 'timeline' | 'process' | 'metrics-grid' | 'pricing' | 'team' | 'features' | 'chart' | 'table' | 'social-proof' | 'case-study' | 'cta';
interface Slide {
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
interface SlideData {
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
interface ImageData {
    src: string;
    alt: string;
    caption?: string;
}
interface MetricData {
    value: string | number;
    label: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}
interface QAResults {
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
interface VisualQAResults {
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
interface SlideVisualScore {
    slideIndex: number;
    whitespace: number;
    balance: number;
    contrast: number;
    passed: boolean;
    issues: string[];
}
interface ContentQAResults {
    /** Per-slide content analysis */
    perSlide: SlideContentScore[];
    /** Glance test results */
    glanceTest: GlanceTestResult[];
    /** Signal-to-noise ratio results */
    signalNoise: SignalNoiseResult[];
    /** One idea per slide validation */
    oneIdea: OneIdeaResult[];
}
interface SlideContentScore {
    slideIndex: number;
    wordCount: number;
    withinLimit: boolean;
    hasActionTitle: boolean;
    issues: string[];
}
interface GlanceTestResult {
    slideIndex: number;
    keyMessage: string;
    wordCount: number;
    readingTime: number;
    passed: boolean;
    recommendation?: string;
}
interface SignalNoiseResult {
    slideIndex: number;
    signalCount: number;
    noiseCount: number;
    signalRatio: number;
    passed: boolean;
    noiseElements: string[];
}
interface OneIdeaResult {
    slideIndex: number;
    ideaCount: number;
    mainIdea: string;
    passed: boolean;
    conflictingIdeas?: string[];
}
interface ExpertQAResults {
    /** Nancy Duarte validation */
    duarte: ExpertValidation;
    /** Garr Reynolds validation */
    reynolds: ExpertValidation;
    /** Carmine Gallo validation */
    gallo: ExpertValidation;
    /** Chris Anderson validation */
    anderson: ExpertValidation;
}
interface ExpertValidation {
    expertName: string;
    principlesChecked: string[];
    passed: boolean;
    score: number;
    violations: string[];
}
interface AccessibilityResults {
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
interface ContrastIssue {
    slideIndex: number;
    element: string;
    foreground: string;
    background: string;
    ratio: number;
    required: number;
}
interface FontSizeIssue {
    slideIndex: number;
    element: string;
    actualSize: number;
    minimumSize: number;
}
interface QAIssue {
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
interface PresentationResult {
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
interface PresentationMetadata {
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
interface ContentAnalysis {
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
interface SCQAStructure {
    situation: string;
    complication: string;
    question: string;
    answer: string;
}
interface SparklineStructure {
    whatIs: string[];
    whatCouldBe: string[];
    callToAdventure: string;
}
declare class ValidationError extends Error {
    errors: string[];
    constructor(errors: string[], message?: string);
}
declare class QAFailureError extends Error {
    score: number;
    threshold: number;
    qaResults: QAResults;
    constructor(score: number, threshold: number, qaResults: QAResults, message?: string);
    getIssues(): string[];
}
declare class TemplateNotFoundError extends Error {
    templatePath: string;
    constructor(templatePath: string, message?: string);
}

/**
 * Presentation Engine - Main Orchestrator
 *
 * Coordinates content analysis, slide generation, and QA validation
 * to produce world-class presentations.
 */

declare class PresentationEngine {
    private contentAnalyzer;
    private slideFactory;
    private templateEngine;
    private scoreCalculator;
    private qaEngine;
    private htmlGenerator;
    private pptxGenerator;
    constructor();
    /**
     * Generate a presentation from content.
     *
     * @param config - Presentation configuration
     * @returns Presentation result with outputs, QA results, and score
     */
    generate(config: PresentationConfig): Promise<PresentationResult>;
    /**
     * Validate presentation configuration.
     */
    private validateConfig;
    /**
     * Validate slide structure before generation.
     */
    private validateStructure;
    /**
     * Count words in a slide.
     */
    private countWords;
    /**
     * Build presentation metadata.
     */
    private buildMetadata;
    /**
     * Detect which expert frameworks were applied.
     */
    private detectFrameworks;
}

/**
 * Content Analyzer - Extracts Structure from Raw Content
 *
 * Uses expert methodologies to analyze content and extract:
 * - SCQA structure (Barbara Minto)
 * - Sparkline narrative arc (Nancy Duarte)
 * - Key messages (Rule of Three)
 * - STAR moments
 * - Action titles
 */

declare class ContentAnalyzer {
    private readonly situationSignals;
    private readonly complicationSignals;
    private readonly questionSignals;
    private readonly answerSignals;
    private readonly whatIsSignals;
    private readonly whatCouldBeSignals;
    /**
     * Analyze content and extract structural elements.
     */
    analyze(content: string, contentType: string): Promise<ContentAnalysis>;
    /**
     * Parse content based on its type.
     */
    private parseContent;
    /**
     * Parse markdown content to plain text (preserving structure hints).
     */
    private parseMarkdown;
    /**
     * Parse JSON content.
     */
    private parseJSON;
    /**
     * Parse YAML content.
     */
    private parseYAML;
    /**
     * Flatten object to text.
     */
    private flattenObject;
    /**
     * Split text into paragraphs.
     */
    private splitIntoParagraphs;
    /**
     * Split text into sentences.
     */
    private splitIntoSentences;
    /**
     * Extract SCQA structure (Barbara Minto's Pyramid Principle).
     */
    private extractSCQA;
    /**
     * Extract Sparkline structure (Nancy Duarte).
     */
    private extractSparkline;
    /**
     * Extract key messages (max 3 - Rule of Three).
     */
    private extractKeyMessages;
    /**
     * Generate action titles (McKinsey-style).
     */
    private generateActionTitles;
    /**
     * Transform a statement into an action title.
     */
    private transformToActionTitle;
    /**
     * Identify STAR moments (Something They'll Always Remember).
     */
    private identifyStarMoments;
    /**
     * Estimate slide count based on content.
     */
    private estimateSlideCount;
    private containsSignals;
    private extractRelevantSentence;
    private truncateToSentence;
    private truncateToWords;
    private capitalizeFirst;
}

/**
 * Slide Factory - Creates Slides from Content Analysis
 *
 * Generates slide structures based on:
 * - Presentation mode (keynote vs business)
 * - Content analysis results
 * - Expert methodology recommendations
 */

declare class SlideFactory {
    private readonly templates;
    constructor();
    /**
     * Create slides from analyzed content.
     */
    createSlides(analysis: ContentAnalysis, mode: PresentationMode): Promise<Slide[]>;
    /**
     * Create a title slide.
     */
    private createTitleSlide;
    /**
     * Create an agenda slide.
     */
    private createAgendaSlide;
    /**
     * Create a context/situation slide.
     */
    private createContextSlide;
    /**
     * Create a problem/complication slide.
     */
    private createProblemSlide;
    /**
     * Create a key message slide.
     */
    private createMessageSlide;
    /**
     * Create a STAR moment slide.
     */
    private createStarMomentSlide;
    /**
     * Create a solution/answer slide.
     */
    private createSolutionSlide;
    /**
     * Create a call-to-action slide.
     */
    private createCTASlide;
    /**
     * Create a thank you slide.
     */
    private createThankYouSlide;
    /**
     * Initialize slide templates with constraints.
     */
    private initializeTemplates;
    /**
     * Truncate text to max length at word boundary.
     */
    private truncate;
    /**
     * Extract an action title from a message.
     */
    private extractActionTitle;
    /**
     * Extract bullet points from text.
     */
    private extractBullets;
    /**
     * Remove a statistic from text.
     */
    private removeStatistic;
}

/**
 * Template Engine - Handlebars Template Rendering
 *
 * Renders slide data into HTML using Handlebars templates.
 * Supports custom templates and helper functions.
 */

interface TemplateConfig {
    customTemplates?: Record<string, string>;
    theme?: ThemeName;
}
declare class TemplateEngine {
    private handlebars;
    private templates;
    private partials;
    constructor();
    /**
     * Render a slide to HTML.
     */
    render(slide: Slide, config?: TemplateConfig): string;
    /**
     * Render multiple slides.
     */
    renderAll(slides: Slide[], config?: TemplateConfig): string[];
    /**
     * Prepare template context with computed properties.
     */
    private prepareContext;
    /**
     * Build CSS class list for slide.
     */
    private buildClassList;
    /**
     * Build inline style string.
     */
    private buildStyleString;
    /**
     * Register Handlebars helpers.
     */
    private registerHelpers;
    /**
     * Register reusable partials.
     */
    private registerPartials;
    /**
     * Compile built-in templates.
     */
    private compileTemplates;
    /**
     * Render fallback for unknown slide types.
     */
    private renderFallback;
    /**
     * Convert camelCase to kebab-case.
     */
    private kebabCase;
}

/**
 * Score Calculator - QA Score Computation
 *
 * Calculates presentation quality scores based on:
 * - Visual quality (35%)
 * - Content quality (30%)
 * - Expert methodology compliance (25%)
 * - Accessibility (10%)
 */

interface ScoreBreakdown {
    visual: number;
    content: number;
    expert: number;
    accessibility: number;
    total: number;
    penalties: number;
    details: ScoreDetail[];
}
interface ScoreDetail {
    category: string;
    check: string;
    score: number;
    maxScore: number;
    notes?: string;
}
declare class ScoreCalculator {
    private readonly weights;
    /**
     * Calculate overall QA score from results.
     */
    calculate(results: QAResults): number;
    /**
     * Get detailed score breakdown.
     */
    getBreakdown(results: QAResults): ScoreBreakdown;
    /**
     * Calculate visual quality score.
     */
    private calculateVisualScore;
    /**
     * Calculate content quality score.
     */
    private calculateContentScore;
    /**
     * Calculate expert methodology compliance score.
     */
    private calculateExpertScore;
    /**
     * Calculate accessibility compliance score.
     */
    private calculateAccessibilityScore;
    /**
     * Calculate penalties from issues.
     */
    private calculatePenalties;
    /**
     * Get human-readable grade from score.
     */
    getGrade(score: number): string;
    /**
     * Get pass/fail status.
     */
    isPassing(score: number, threshold?: number): boolean;
    /**
     * Format score for display.
     */
    formatScore(score: number): string;
    /**
     * Generate summary report.
     */
    generateReport(results: QAResults): string;
}

/**
 * QA Engine - Real Visual Quality Validation
 *
 * Unlike fake validation systems, this engine ACTUALLY tests:
 * - Visual quality using Playwright screenshots + Canvas API
 * - Layout balance and whitespace distribution
 * - WCAG contrast compliance
 * - Expert methodology adherence
 */

declare class QAEngine {
    private browser;
    /**
     * Validate a presentation.
     */
    validate(presentation: string | Buffer, options?: {
        mode?: 'keynote' | 'business';
        strictMode?: boolean;
        threshold?: number;
    }): Promise<QAResults>;
    /**
     * Calculate overall QA score.
     */
    calculateScore(results: QAResults): number;
    /**
     * Create empty QA results (for when QA is skipped).
     */
    createEmptyResults(): QAResults;
    private runVisualTests;
    private runContentTests;
    private runExpertTests;
    private createExpertResult;
    private runAccessibilityTests;
    private calculateVisualScore;
    private calculateContentScore;
    private calculateExpertScore;
    private calculateA11yScore;
    private collectIssues;
    private initBrowser;
    private closeBrowser;
}

/**
 * Reveal.js Generator - HTML Presentation Output
 *
 * Generates complete Reveal.js presentations with:
 * - Responsive layouts
 * - Animations
 * - Speaker notes
 * - Custom themes
 * - Chart.js integration
 * - Mermaid diagrams
 */

declare class RevealJsGenerator {
    private templateEngine;
    private defaultRevealConfig;
    constructor();
    /**
     * Generate complete Reveal.js HTML presentation.
     */
    generate(slides: Slide[], config: PresentationConfig): Promise<string>;
    /**
     * Build the complete HTML document.
     */
    private buildDocument;
    /**
     * Get base styles for slides.
     */
    private getBaseStyles;
    /**
     * Get theme-specific styles.
     */
    private getThemeStyles;
    /**
     * Get animation styles.
     */
    private getAnimationStyles;
    /**
     * Escape HTML entities.
     */
    private escapeHtml;
    /**
     * Basic HTML minification.
     */
    private minifyHtml;
}

/**
 * PowerPoint Generator - PPTX Presentation Output
 *
 * Generates PowerPoint presentations using PptxGenJS with:
 * - Professional layouts
 * - Embedded charts
 * - Images
 * - Consistent styling
 */

declare class PowerPointGenerator {
    private chartProvider;
    /**
     * Generate a PowerPoint presentation.
     */
    generate(slides: Slide[], config: PresentationConfig): Promise<Buffer>;
    /**
     * Add a slide to the presentation.
     */
    private addSlide;
    /**
     * Add title slide.
     */
    private addTitleSlide;
    /**
     * Add big idea / single statement slide.
     */
    private addBigIdeaSlide;
    /**
     * Add big number slide.
     */
    private addBigNumberSlide;
    /**
     * Add quote slide.
     */
    private addQuoteSlide;
    /**
     * Add bullet points slide.
     */
    private addBulletSlide;
    /**
     * Add two-column slide.
     */
    private addTwoColumnSlide;
    /**
     * Add metrics grid slide.
     */
    private addMetricsSlide;
    /**
     * Add metrics to a slide at specified position.
     */
    private addMetricsToSlide;
    /**
     * Add thank you slide.
     */
    private addThankYouSlide;
    /**
     * Add agenda slide.
     */
    private addAgendaSlide;
    /**
     * Add section divider slide.
     */
    private addSectionDividerSlide;
    /**
     * Add default slide (fallback).
     */
    private addDefaultSlide;
    /**
     * Add image placeholder.
     */
    private addImagePlaceholder;
    /**
     * Convert layout position to PptxGenJS text props.
     */
    private positionToProps;
}

/**
 * Image Provider - Pluggable Image Generation
 *
 * Provides multiple strategies for obtaining images:
 * - Local: User-provided paths/URLs
 * - Placeholder: Uses picsum.photos (no API key)
 * - Unsplash: Free API (50 req/hour, optional key)
 * - AI: Claude Code integration (when available)
 */
interface ImageRequest {
    /** Description of desired image */
    description: string;
    /** Desired width */
    width?: number;
    /** Desired height */
    height?: number;
    /** Style hints (e.g., 'professional', 'minimal', 'vibrant') */
    style?: string;
    /** Category for filtering (e.g., 'business', 'technology', 'nature') */
    category?: string;
}
interface ImageResult {
    /** URL or data URI of the image */
    src: string;
    /** Alt text for accessibility */
    alt: string;
    /** Attribution if required */
    attribution?: string;
    /** Whether this is a placeholder */
    isPlaceholder?: boolean;
}
interface ImageProvider {
    /** Provider name */
    name: string;
    /** Check if provider is available */
    isAvailable(): Promise<boolean>;
    /** Get an image matching the request */
    getImage(request: ImageRequest): Promise<ImageResult>;
    /** Get multiple images */
    getImages(requests: ImageRequest[]): Promise<ImageResult[]>;
}
/**
 * Local Image Provider - Uses user-provided images
 */
declare class LocalImageProvider implements ImageProvider {
    name: string;
    private images;
    constructor(imageMap?: Record<string, string>);
    isAvailable(): Promise<boolean>;
    getImage(request: ImageRequest): Promise<ImageResult>;
    getImages(requests: ImageRequest[]): Promise<ImageResult[]>;
    private getPlaceholderUrl;
    /** Register an image for later use */
    registerImage(name: string, src: string): void;
}
/**
 * Placeholder Image Provider - Uses picsum.photos (no API key needed)
 */
declare class PlaceholderImageProvider implements ImageProvider {
    name: string;
    isAvailable(): Promise<boolean>;
    getImage(request: ImageRequest): Promise<ImageResult>;
    getImages(requests: ImageRequest[]): Promise<ImageResult[]>;
    private hashString;
}
/**
 * Unsplash Image Provider - Uses Unsplash API (free tier: 50 req/hour)
 */
declare class UnsplashImageProvider implements ImageProvider {
    name: string;
    private accessKey?;
    private baseUrl;
    constructor(accessKey?: string);
    isAvailable(): Promise<boolean>;
    getImage(request: ImageRequest): Promise<ImageResult>;
    getImages(requests: ImageRequest[]): Promise<ImageResult[]>;
    private getSourceImage;
    private delay;
}
/**
 * Composite Image Provider - Tries providers in order
 */
declare class CompositeImageProvider implements ImageProvider {
    name: string;
    private providers;
    constructor(providers: ImageProvider[]);
    isAvailable(): Promise<boolean>;
    getImage(request: ImageRequest): Promise<ImageResult>;
    getImages(requests: ImageRequest[]): Promise<ImageResult[]>;
}
/**
 * Create default image provider chain
 */
declare function createDefaultImageProvider(options?: {
    localImages?: Record<string, string>;
    unsplashKey?: string;
}): ImageProvider;

/**
 * Chart Provider - Pluggable Chart Generation
 *
 * Provides multiple strategies for creating charts:
 * - ChartJS: Embedded in HTML (no API needed)
 * - QuickChart: Remote rendering (no API key needed)
 * - Mermaid: Diagrams and flowcharts (no API needed)
 */
type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
}
interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}
interface ChartRequest {
    /** Chart type */
    type: ChartType;
    /** Chart data */
    data: ChartData;
    /** Chart title */
    title?: string;
    /** Width in pixels */
    width?: number;
    /** Height in pixels */
    height?: number;
    /** Show legend */
    showLegend?: boolean;
    /** Animation enabled (HTML only) */
    animated?: boolean;
    /** Color palette to use */
    palette?: 'default' | 'professional' | 'vibrant' | 'monochrome';
}
interface ChartResult {
    /** HTML for embedding (Chart.js canvas) */
    html?: string;
    /** Image URL for static contexts (PPTX) */
    imageUrl?: string;
    /** Base64 data URI */
    dataUri?: string;
    /** Chart title for accessibility */
    title: string;
}
interface ChartProvider {
    /** Provider name */
    name: string;
    /** Check if provider is available */
    isAvailable(): Promise<boolean>;
    /** Generate a chart */
    generateChart(request: ChartRequest): Promise<ChartResult>;
}
/**
 * Chart.js Provider - Generates embedded Chart.js HTML
 * No API needed - runs in browser
 */
declare class ChartJsProvider implements ChartProvider {
    name: string;
    isAvailable(): Promise<boolean>;
    generateChart(request: ChartRequest): Promise<ChartResult>;
}
/**
 * QuickChart Provider - Uses quickchart.io for image generation
 * No API key needed - free service
 */
declare class QuickChartProvider implements ChartProvider {
    name: string;
    private baseUrl;
    isAvailable(): Promise<boolean>;
    generateChart(request: ChartRequest): Promise<ChartResult>;
}
/**
 * Mermaid Provider - Generates diagrams using Mermaid.js
 * No API needed - renders in browser
 */
declare class MermaidProvider implements ChartProvider {
    name: string;
    isAvailable(): Promise<boolean>;
    generateChart(request: ChartRequest): Promise<ChartResult>;
    /**
     * Generate a Mermaid diagram
     */
    generateDiagram(definition: string, title?: string): Promise<ChartResult>;
    /**
     * Generate flowchart from steps
     */
    generateFlowchart(steps: {
        id: string;
        label: string;
        next?: string[];
    }[]): string;
    /**
     * Generate timeline from events
     */
    generateTimeline(events: {
        date: string;
        title: string;
    }[]): string;
}
/**
 * Composite Chart Provider
 */
declare class CompositeChartProvider implements ChartProvider {
    name: string;
    private htmlProvider;
    private imageProvider;
    private mermaidProvider;
    constructor();
    isAvailable(): Promise<boolean>;
    generateChart(request: ChartRequest): Promise<ChartResult>;
    generateDiagram(definition: string, title?: string): Promise<ChartResult>;
    generateFlowchart(steps: {
        id: string;
        label: string;
        next?: string[];
    }[]): string;
    generateTimeline(events: {
        date: string;
        title: string;
    }[]): string;
}
/**
 * Create default chart provider
 */
declare function createDefaultChartProvider(): CompositeChartProvider;

/**
 * Knowledge Base - RuVector Expert Principles Loader
 *
 * Loads and provides access to the 6,300+ line expert knowledge base
 * containing methodologies from 40+ presentation experts.
 *
 * This runs WITHOUT any API - it's static data bundled with the package.
 */
interface ExpertPrinciple {
    name: string;
    description: string;
    validation?: string[];
    examples?: string[];
}
interface ExpertMethodology {
    name: string;
    principles: ExpertPrinciple[];
    slideTypes?: string[];
    wordLimits?: {
        min?: number;
        max?: number;
    };
}
interface AutomatedQA {
    scoringRubric: {
        totalPoints: number;
        passingThreshold: number;
        categories: Record<string, {
            weight: number;
            checks: Record<string, unknown>;
        }>;
    };
}
declare class KnowledgeBase {
    private data;
    private loaded;
    /**
     * Load the knowledge base from the bundled YAML file.
     */
    load(): Promise<void>;
    /**
     * Get expert methodology by name.
     */
    getExpert(name: string): ExpertMethodology | undefined;
    /**
     * Get all expert names.
     */
    getExpertNames(): string[];
    /**
     * Get framework recommendation for audience.
     */
    getFrameworkForAudience(audience: string): {
        primaryFramework: string;
        secondaryFramework?: string;
        slideTypes: string[];
    } | undefined;
    /**
     * Get framework recommendation for goal.
     */
    getFrameworkForGoal(goal: string): {
        primaryFramework: string;
        secondaryFramework?: string;
        slideTypes: string[];
    } | undefined;
    /**
     * Get QA scoring rubric.
     */
    getScoringRubric(): AutomatedQA['scoringRubric'] | undefined;
    /**
     * Get mode configuration (keynote or business).
     */
    getModeConfig(mode: 'keynote' | 'business'): unknown;
    /**
     * Get slide type configuration.
     */
    getSlideType(type: string): unknown;
    /**
     * Get the knowledge base version.
     */
    getVersion(): string;
    /**
     * Validate a slide against expert principles.
     */
    validateAgainstExpert(expertName: string, slideData: {
        wordCount: number;
        hasActionTitle: boolean;
        bulletCount: number;
    }): {
        passed: boolean;
        violations: string[];
    };
    /**
     * Ensure knowledge base is loaded.
     */
    private ensureLoaded;
    /**
     * Get default data if YAML can't be loaded.
     */
    private getDefaultData;
}
/**
 * Get the knowledge base singleton.
 */
declare function getKnowledgeBase(): KnowledgeBase;

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
declare function generate(config: PresentationConfig): Promise<PresentationResult>;
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
declare function validate(presentation: string | Buffer, options?: {
    mode?: 'keynote' | 'business';
    threshold?: number;
    strictMode?: boolean;
}): Promise<QAResults & {
    score: number;
}>;
/**
 * Get the version of the package.
 */
declare const VERSION = "1.0.0";
/**
 * Default export for convenience.
 */
declare const _default: {
    generate: typeof generate;
    validate: typeof validate;
    PresentationEngine: typeof PresentationEngine;
    QAEngine: typeof QAEngine;
    VERSION: string;
};

export { type AccessibilityResults, type ChartData, type ChartDataset, ChartJsProvider, type ChartProvider, type ChartRequest, type ChartResult, type ChartType, CompositeChartProvider, CompositeImageProvider, type ContentAnalysis, ContentAnalyzer, type ContentQAResults, type ContrastIssue, type ExpertQAResults, type ExpertValidation, type FontSizeIssue, type GlanceTestResult, type ImageData, type ImageProvider, type ImageRequest, type ImageResult, KnowledgeBase, LocalImageProvider, MermaidProvider, type MetricData, type OneIdeaResult, type OutputFormat, PlaceholderImageProvider, PowerPointGenerator, type PresentationConfig, PresentationEngine, type PresentationMetadata, type PresentationMode, type PresentationResult, QAEngine, QAFailureError, type QAIssue, type QAResults, QuickChartProvider, RevealJsGenerator, type SCQAStructure, ScoreCalculator, type SignalNoiseResult, type Slide, type SlideContentScore, type SlideData, SlideFactory, type SlideType, type SlideVisualScore, type SparklineStructure, TemplateEngine, TemplateNotFoundError, type ThemeName, UnsplashImageProvider, VERSION, ValidationError, type VisualQAResults, createDefaultChartProvider, createDefaultImageProvider, _default as default, generate, getKnowledgeBase, validate };
