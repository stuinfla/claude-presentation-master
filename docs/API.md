# API Reference

Complete API documentation for Claude Presentation Master.

## Table of Contents

- [Main Functions](#main-functions)
  - [generate()](#generate)
  - [validate()](#validate)
- [Classes](#classes)
  - [PresentationEngine](#presentationengine)
  - [ContentAnalyzer](#contentanalyzer)
  - [SlideFactory](#slidefactory)
  - [TemplateEngine](#templateengine)
  - [ScoreCalculator](#scorecalculator)
  - [QAEngine](#qaengine)
  - [RevealJsGenerator](#revealjsgenerator)
  - [PowerPointGenerator](#powerpointgenerator)
  - [KnowledgeBase](#knowledgebase)
- [Media Providers](#media-providers)
  - [ImageProvider](#imageprovider)
  - [ChartProvider](#chartprovider)
- [Types](#types)
- [Errors](#errors)
- [Constants](#constants)

---

## Main Functions

### generate()

Generate a presentation from content.

```typescript
async function generate(config: PresentationConfig): Promise<PresentationResult>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `PresentationConfig` | Configuration object |

#### PresentationConfig

```typescript
interface PresentationConfig {
  // Required
  content: string;
  contentType: 'markdown' | 'json' | 'yaml' | 'text';
  mode: 'keynote' | 'business';
  format: ('html' | 'pptx')[];
  title: string;

  // Optional
  theme?: ThemeName;
  author?: string;
  subject?: string;
  qaThreshold?: number;
  skipQA?: boolean;
  minify?: boolean;
  customCSS?: string;
  customTemplates?: Record<string, string>;
  output?: string;
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `content` | `string` | (required) | Raw content to convert |
| `contentType` | `string` | (required) | Format of input content |
| `mode` | `'keynote' \| 'business'` | (required) | Presentation style |
| `format` | `string[]` | (required) | Output formats to generate |
| `title` | `string` | (required) | Presentation title |
| `theme` | `ThemeName` | `'default'` | Visual theme |
| `author` | `string` | `'Unknown'` | Author name |
| `subject` | `string` | `''` | Subject/description |
| `qaThreshold` | `number` | `95` | Minimum score (0-100) |
| `skipQA` | `boolean` | `false` | Skip QA validation |
| `minify` | `boolean` | `false` | Minify HTML output |
| `customCSS` | `string` | `undefined` | Additional CSS |
| `customTemplates` | `Record<string, string>` | `undefined` | Template overrides |
| `output` | `string` | `undefined` | Output directory |

#### Returns: PresentationResult

```typescript
interface PresentationResult {
  outputs: {
    html?: string;
    pptx?: Buffer;
  };
  qaResults: QAResults;
  score: number;
  metadata: PresentationMetadata;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `outputs.html` | `string \| undefined` | Generated HTML |
| `outputs.pptx` | `Buffer \| undefined` | Generated PPTX |
| `qaResults` | `QAResults` | Detailed QA results |
| `score` | `number` | Quality score (0-100) |
| `metadata` | `PresentationMetadata` | Generation metadata |

#### Example

```typescript
import { generate } from '@isovision/claude-presentation-master';

const result = await generate({
  content: '# My Presentation\n\n...',
  contentType: 'markdown',
  mode: 'keynote',
  format: ['html', 'pptx'],
  title: 'My Presentation',
  theme: 'modern-tech',
  author: 'John Doe',
  qaThreshold: 95
});

console.log(`Score: ${result.score}/100`);
console.log(`Slides: ${result.metadata.slideCount}`);
```

#### Throws

- `ValidationError` - Invalid configuration
- `QAFailureError` - Score below threshold

---

### validate()

Validate an existing HTML presentation.

```typescript
async function validate(
  presentation: string | Buffer,
  options?: ValidateOptions
): Promise<QAResults & { score: number }>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `presentation` | `string \| Buffer` | HTML content or file buffer |
| `options` | `ValidateOptions` | Validation options |

#### ValidateOptions

```typescript
interface ValidateOptions {
  mode?: 'keynote' | 'business';
  threshold?: number;
  strictMode?: boolean;
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mode` | `string` | `'keynote'` | Presentation mode for validation rules |
| `threshold` | `number` | `95` | Score threshold |
| `strictMode` | `boolean` | `true` | Enforce strict validation |

#### Returns

```typescript
QAResults & { score: number }
```

#### Example

```typescript
import { validate } from '@isovision/claude-presentation-master';
import { readFileSync } from 'fs';

const html = readFileSync('presentation.html', 'utf-8');
const result = await validate(html, { mode: 'keynote' });

console.log(`Score: ${result.score}/100`);
console.log(`Passed: ${result.passed}`);
result.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.message}`);
});
```

---

## Classes

### PresentationEngine

Main orchestrator for presentation generation.

```typescript
class PresentationEngine {
  constructor()
  async generate(config: PresentationConfig): Promise<PresentationResult>
}
```

#### Methods

##### generate(config)

Generate a complete presentation.

```typescript
async generate(config: PresentationConfig): Promise<PresentationResult>
```

#### Example

```typescript
import { PresentationEngine } from '@isovision/claude-presentation-master';

const engine = new PresentationEngine();
const result = await engine.generate({
  content: myContent,
  contentType: 'markdown',
  mode: 'keynote',
  format: ['html'],
  title: 'My Presentation'
});
```

---

### ContentAnalyzer

Analyzes content and extracts structural elements.

```typescript
class ContentAnalyzer {
  constructor()
  async analyze(content: string, contentType: string): Promise<ContentAnalysis>
}
```

#### Methods

##### analyze(content, contentType)

Analyze content and extract structure.

```typescript
async analyze(
  content: string,
  contentType: 'markdown' | 'json' | 'yaml' | 'text'
): Promise<ContentAnalysis>
```

#### ContentAnalysis

```typescript
interface ContentAnalysis {
  scqa: SCQAStructure;
  sparkline: SparklineStructure;
  keyMessages: string[];
  titles: string[];
  starMoments: string[];
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
```

#### Example

```typescript
import { ContentAnalyzer } from '@isovision/claude-presentation-master';

const analyzer = new ContentAnalyzer();
const analysis = await analyzer.analyze(markdownContent, 'markdown');

console.log('SCQA:', analysis.scqa);
console.log('Key Messages:', analysis.keyMessages);
console.log('STAR Moments:', analysis.starMoments);
```

---

### SlideFactory

Creates slides from analyzed content.

```typescript
class SlideFactory {
  constructor()
  async createSlides(analysis: ContentAnalysis, mode: PresentationMode): Promise<Slide[]>
}
```

#### Methods

##### createSlides(analysis, mode)

Create slide structures from content analysis.

```typescript
async createSlides(
  analysis: ContentAnalysis,
  mode: 'keynote' | 'business'
): Promise<Slide[]>
```

#### Slide

```typescript
interface Slide {
  index: number;
  type: SlideType;
  data: SlideData;
  classes?: string[];
  styles?: Record<string, string>;
  notes?: string;
}

interface SlideData {
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  keyMessage?: string;
  images?: ImageData[];
  metrics?: MetricData[];
  quote?: string;
  attribution?: string;
  source?: string;
  [key: string]: unknown;
}
```

---

### TemplateEngine

Renders slides to HTML using Handlebars.

```typescript
class TemplateEngine {
  constructor()
  render(slide: Slide, config?: TemplateConfig): string
  renderAll(slides: Slide[], config?: TemplateConfig): string[]
}
```

#### Methods

##### render(slide, config?)

Render a single slide to HTML.

```typescript
render(slide: Slide, config?: TemplateConfig): string
```

##### renderAll(slides, config?)

Render multiple slides to HTML.

```typescript
renderAll(slides: Slide[], config?: TemplateConfig): string[]
```

#### TemplateConfig

```typescript
interface TemplateConfig {
  customTemplates?: Record<string, string>;
  theme?: ThemeName;
}
```

---

### ScoreCalculator

Calculates QA scores from results.

```typescript
class ScoreCalculator {
  constructor()
  calculate(results: QAResults): number
  getBreakdown(results: QAResults): ScoreBreakdown
  getGrade(score: number): string
  isPassing(score: number, threshold?: number): boolean
  formatScore(score: number): string
  generateReport(results: QAResults): string
}
```

#### Methods

##### calculate(results)

Calculate the final score (0-100).

```typescript
calculate(results: QAResults): number
```

##### getBreakdown(results)

Get detailed score breakdown by category.

```typescript
getBreakdown(results: QAResults): ScoreBreakdown
```

```typescript
interface ScoreBreakdown {
  visual: number;
  content: number;
  expert: number;
  accessibility: number;
  total: number;
  penalties: number;
  details: ScoreDetail[];
}
```

##### getGrade(score)

Convert score to letter grade.

```typescript
getGrade(score: number): string  // 'A+', 'A', 'B+', etc.
```

##### generateReport(results)

Generate a formatted text report.

```typescript
generateReport(results: QAResults): string
```

---

### QAEngine

Performs visual and content validation.

```typescript
class QAEngine {
  constructor()
  async validate(presentation: string | Buffer, options?: QAOptions): Promise<QAResults>
  calculateScore(results: QAResults): number
  createEmptyResults(): QAResults
}
```

#### Methods

##### validate(presentation, options?)

Run full QA validation.

```typescript
async validate(
  presentation: string | Buffer,
  options?: {
    mode?: 'keynote' | 'business';
    strictMode?: boolean;
  }
): Promise<QAResults>
```

#### QAResults

```typescript
interface QAResults {
  visual: VisualQAResults;
  content: ContentQAResults;
  expert: ExpertQAResults;
  accessibility: AccessibilityResults;
  passed: boolean;
  issues: QAIssue[];
}
```

---

### RevealJsGenerator

Generates HTML presentations with Reveal.js.

```typescript
class RevealJsGenerator {
  constructor()
  async generate(slides: Slide[], config: PresentationConfig): Promise<string>
}
```

---

### PowerPointGenerator

Generates PowerPoint files.

```typescript
class PowerPointGenerator {
  constructor()
  async generate(slides: Slide[], config: PresentationConfig): Promise<Buffer>
}
```

---

### KnowledgeBase

Loads and provides access to expert knowledge.

```typescript
class KnowledgeBase {
  async load(): Promise<void>
  getExpert(name: string): ExpertMethodology | undefined
  getExpertNames(): string[]
  getFrameworkForAudience(audience: string): FrameworkRecommendation | undefined
  getFrameworkForGoal(goal: string): FrameworkRecommendation | undefined
  getScoringRubric(): ScoringRubric | undefined
  getModeConfig(mode: 'keynote' | 'business'): ModeConfig
  getSlideType(type: string): SlideTypeConfig | undefined
  getVersion(): string
}

// Singleton accessor
function getKnowledgeBase(): KnowledgeBase
```

#### Example

```typescript
import { getKnowledgeBase } from '@isovision/claude-presentation-master';

const kb = getKnowledgeBase();
await kb.load();

console.log('Version:', kb.getVersion());
console.log('Experts:', kb.getExpertNames());

const duarte = kb.getExpert('Nancy Duarte');
console.log('Duarte principles:', duarte?.principles);

const framework = kb.getFrameworkForAudience('board_of_directors');
console.log('Recommended framework:', framework?.primaryFramework);
```

---

## Media Providers

### ImageProvider

Interface for image sourcing.

```typescript
interface ImageProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  getImage(request: ImageRequest): Promise<ImageResult>;
  getImages(requests: ImageRequest[]): Promise<ImageResult[]>;
}

interface ImageRequest {
  description: string;
  width?: number;
  height?: number;
  style?: string;
  category?: string;
}

interface ImageResult {
  src: string;
  alt: string;
  attribution?: string;
  isPlaceholder?: boolean;
}
```

#### Built-in Providers

```typescript
class LocalImageProvider implements ImageProvider
class PlaceholderImageProvider implements ImageProvider
class UnsplashImageProvider implements ImageProvider
class CompositeImageProvider implements ImageProvider
```

#### Factory Function

```typescript
function createDefaultImageProvider(options?: {
  localImages?: Record<string, string>;
  unsplashKey?: string;
}): ImageProvider
```

#### Example

```typescript
import { createDefaultImageProvider } from '@isovision/claude-presentation-master';

const provider = createDefaultImageProvider({
  localImages: {
    'logo': './images/logo.png',
    'team': './images/team.jpg'
  }
});

const image = await provider.getImage({
  description: 'team collaboration',
  width: 800,
  height: 600
});

console.log('Image URL:', image.src);
```

---

### ChartProvider

Interface for chart generation.

```typescript
interface ChartProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  generateChart(request: ChartRequest): Promise<ChartResult>;
}

interface ChartRequest {
  type: ChartType;
  data: ChartData;
  title?: string;
  width?: number;
  height?: number;
  showLegend?: boolean;
  animated?: boolean;
  palette?: 'default' | 'professional' | 'vibrant' | 'monochrome';
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

interface ChartResult {
  html?: string;
  imageUrl?: string;
  dataUri?: string;
  title: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
```

#### Built-in Providers

```typescript
class ChartJsProvider implements ChartProvider      // HTML output
class QuickChartProvider implements ChartProvider   // Image URL output
class MermaidProvider implements ChartProvider      // Diagrams
class CompositeChartProvider implements ChartProvider
```

#### Factory Function

```typescript
function createDefaultChartProvider(): CompositeChartProvider
```

#### Example

```typescript
import { createDefaultChartProvider } from '@isovision/claude-presentation-master';

const provider = createDefaultChartProvider();

// Bar chart
const chart = await provider.generateChart({
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{
      label: 'Sales',
      data: [100, 150, 120, 180]
    }]
  },
  title: 'Monthly Sales',
  palette: 'professional'
});

// Flowchart (Mermaid)
const flowchartDef = provider.generateFlowchart([
  { id: 'A', label: 'Start', next: ['B'] },
  { id: 'B', label: 'Process', next: ['C'] },
  { id: 'C', label: 'End' }
]);

const diagram = await provider.generateDiagram(flowchartDef, 'Process Flow');
```

---

## Types

### ThemeName

```typescript
type ThemeName =
  | 'default'
  | 'light-corporate'
  | 'modern-tech'
  | 'minimal'
  | 'warm'
  | 'creative';
```

### PresentationMode

```typescript
type PresentationMode = 'keynote' | 'business';
```

### OutputFormat

```typescript
type OutputFormat = 'html' | 'pptx';
```

### SlideType

```typescript
type SlideType =
  // Universal
  | 'title'
  | 'agenda'
  | 'section-divider'
  | 'thank-you'
  // Keynote
  | 'big-idea'
  | 'single-statement'
  | 'big-number'
  | 'full-image'
  | 'quote'
  // Business
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
```

### QAIssue

```typescript
interface QAIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'visual' | 'content' | 'expert' | 'accessibility';
  slideIndex?: number;
  message: string;
  suggestion?: string;
}
```

### PresentationMetadata

```typescript
interface PresentationMetadata {
  title: string;
  author: string;
  generatedAt: string;
  mode: PresentationMode;
  slideCount: number;
  wordCount: number;
  avgWordsPerSlide: number;
  estimatedDuration: number;
  frameworks: string[];
}
```

---

## Errors

### ValidationError

Thrown when configuration is invalid.

```typescript
class ValidationError extends Error {
  errors: string[];

  constructor(errors: string[], message?: string)
}
```

#### Example

```typescript
try {
  await generate({ content: '' }); // Missing required fields
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:');
    error.errors.forEach(e => console.log(`  - ${e}`));
  }
}
```

### QAFailureError

Thrown when QA score is below threshold.

```typescript
class QAFailureError extends Error {
  score: number;
  threshold: number;
  qaResults: QAResults;

  constructor(score: number, threshold: number, qaResults: QAResults, message?: string)

  getIssues(): string[]
}
```

#### Example

```typescript
try {
  await generate({ ...config, qaThreshold: 95 });
} catch (error) {
  if (error instanceof QAFailureError) {
    console.log(`Score: ${error.score}/${error.threshold}`);
    console.log('Issues:');
    error.getIssues().forEach(issue => console.log(`  - ${issue}`));
  }
}
```

### TemplateNotFoundError

Thrown when a template file is not found.

```typescript
class TemplateNotFoundError extends Error {
  templatePath: string;

  constructor(templatePath: string, message?: string)
}
```

---

## Constants

### VERSION

```typescript
const VERSION: string = '1.0.0'
```

### Default Export

```typescript
export default {
  generate,
  validate,
  PresentationEngine,
  QAEngine,
  VERSION
}
```
