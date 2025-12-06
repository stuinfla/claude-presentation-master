# Architecture

This document describes the internal architecture of Claude Presentation Master.

## Overview

Claude Presentation Master is designed as a modular, pipeline-based system that transforms raw content into validated, professional presentations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLAUDE PRESENTATION MASTER                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   Content    │───▶│    Slide     │───▶│   Template   │───▶│ Generator │ │
│  │   Analyzer   │    │   Factory    │    │    Engine    │    │  (HTML/   │ │
│  │              │    │              │    │              │    │   PPTX)   │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘ │
│         │                   │                   │                  │        │
│         │                   │                   │                  │        │
│         ▼                   ▼                   ▼                  ▼        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         KNOWLEDGE BASE                               │   │
│  │              (presentation-knowledge.yaml - 6,300+ lines)           │   │
│  │                                                                      │   │
│  │  • Expert Methodologies  • Slide Type Definitions  • QA Rubric      │   │
│  │  • Framework Selector    • Mode Configurations     • Constraints    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           QA ENGINE                                  │   │
│  │                                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │  Visual    │  │  Content   │  │   Expert   │  │Accessibility│    │   │
│  │  │   Tests    │  │   Tests    │  │   Tests    │  │   Tests    │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │   │
│  │         │              │              │              │              │   │
│  │         └──────────────┴──────────────┴──────────────┘              │   │
│  │                                │                                     │   │
│  │                                ▼                                     │   │
│  │                    ┌────────────────────┐                           │   │
│  │                    │  Score Calculator  │                           │   │
│  │                    │    (0-100 score)   │                           │   │
│  │                    └────────────────────┘                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. PresentationEngine (`src/core/PresentationEngine.ts`)

The main orchestrator that coordinates the entire pipeline.

**Responsibilities:**
- Validate input configuration
- Coordinate the pipeline stages
- Enforce QA thresholds
- Build final result

**Key Methods:**
```typescript
class PresentationEngine {
  async generate(config: PresentationConfig): Promise<PresentationResult>
  private validateConfig(config: PresentationConfig): void
  private validateStructure(slides: Slide[], mode: string): string[]
  private countWords(slide: Slide): number
  private buildMetadata(...): PresentationMetadata
}
```

### 2. ContentAnalyzer (`src/core/ContentAnalyzer.ts`)

Extracts structure and meaning from raw content using expert methodologies.

**Responsibilities:**
- Parse content (Markdown, JSON, YAML, text)
- Extract SCQA structure (Barbara Minto)
- Identify Sparkline narrative arc (Nancy Duarte)
- Find STAR moments
- Extract key messages (Rule of Three)
- Generate action titles (McKinsey)

**Key Methods:**
```typescript
class ContentAnalyzer {
  async analyze(content: string, contentType: string): Promise<ContentAnalysis>
  private parseContent(content: string, contentType: string): string
  private extractSCQA(paragraphs: string[], sentences: string[]): SCQAStructure
  private extractSparkline(paragraphs: string[]): SparklineStructure
  private extractKeyMessages(text: string, sentences: string[]): string[]
  private identifyStarMoments(paragraphs: string[]): string[]
}
```

**Content Analysis Output:**
```typescript
interface ContentAnalysis {
  scqa: {
    situation: string;     // Current state
    complication: string;  // The problem
    question: string;      // What to do?
    answer: string;        // The solution
  };
  sparkline: {
    whatIs: string[];      // Current reality points
    whatCouldBe: string[]; // Vision points
    callToAdventure: string;
  };
  keyMessages: string[];   // Max 3 (Rule of Three)
  titles: string[];        // Action titles
  starMoments: string[];   // Memorable moments
  estimatedSlideCount: number;
}
```

### 3. SlideFactory (`src/core/SlideFactory.ts`)

Creates slide structures from analyzed content.

**Responsibilities:**
- Select appropriate slide types
- Apply mode constraints (keynote vs business)
- Structure narrative flow
- Generate slide data

**Slide Creation Logic:**
```
1. Title slide (always first)
2. Agenda slide (business mode, if 3+ key messages)
3. Situation slide (from SCQA)
4. Problem slide (from SCQA complication)
5. Key message slides (from extracted messages)
6. STAR moment slides (if any)
7. Solution slide (from SCQA answer)
8. CTA slide (from Sparkline call to adventure)
9. Thank you slide (always last)
```

### 4. TemplateEngine (`src/core/TemplateEngine.ts`)

Renders slides to HTML using Handlebars templates.

**Responsibilities:**
- Compile Handlebars templates
- Register helpers and partials
- Render slide data to HTML
- Support custom template overrides

**Built-in Templates:**
- 20+ slide type templates
- Reusable partials (bulletList, metricsGrid, imageWithCaption)
- Animation classes
- Theme support

**Handlebars Helpers:**
```handlebars
{{ifEquals var1 var2}}     - Conditional comparison
{{eachWithIndex items}}    - Loop with index
{{truncate text 100}}      - Truncate text
{{formatNumber 1000000}}   - Format with commas
{{trendIcon "up"}}         - Trend arrow
{{animDelay 2 100}}        - Animation delay style
{{markdown text}}          - Basic markdown to HTML
```

### 5. ScoreCalculator (`src/core/ScoreCalculator.ts`)

Calculates the final QA score from test results.

**Scoring Weights:**
| Category | Weight |
|----------|--------|
| Visual Quality | 35% |
| Content Quality | 30% |
| Expert Compliance | 25% |
| Accessibility | 10% |

**Score Breakdown:**
```typescript
interface ScoreBreakdown {
  visual: number;       // 0-100
  content: number;      // 0-100
  expert: number;       // 0-100
  accessibility: number; // 0-100
  total: number;        // Weighted average
  penalties: number;    // Deductions for issues
  details: ScoreDetail[];
}
```

### 6. QAEngine (`src/qa/QAEngine.ts`)

Performs real visual validation using Playwright.

**Test Categories:**

#### Visual Tests
- **Whitespace Percentage**: Screenshot analysis, pixel counting
- **Layout Balance**: Center of mass calculation
- **Contrast Ratio**: Color extraction, WCAG formula
- **Font Families**: CSS inspection
- **Color Count**: Unique color detection

#### Content Tests
- **Word Count**: Per-slide validation against mode limits
- **Action Titles**: Starts with verb check
- **Glance Test**: < 3 second reading time
- **Signal-to-Noise**: Content vs decoration ratio
- **One Idea Rule**: Semantic analysis

#### Expert Tests
- **Duarte**: Sparkline structure, STAR moments
- **Reynolds**: Signal-to-noise, simplicity
- **Gallo**: Rule of Three, emotional connection
- **Anderson**: One idea per presentation

#### Accessibility Tests
- **WCAG Level**: A, AA, or AAA compliance
- **Contrast Issues**: Per-element checking
- **Font Size**: Minimum readable size
- **Color Blind Safety**: Deuteranopia/Protanopia simulation

## Generators

### RevealJsGenerator (`src/generators/html/RevealJsGenerator.ts`)

Generates HTML presentations using Reveal.js.

**Output Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Reveal.js CSS -->
  <!-- Chart.js -->
  <!-- Mermaid.js -->
  <!-- Theme CSS -->
  <!-- Animation CSS -->
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section class="slide slide-title">...</section>
      <section class="slide slide-big-idea">...</section>
      <!-- More slides -->
    </div>
  </div>
  <script>
    Reveal.initialize({...});
  </script>
</body>
</html>
```

### PowerPointGenerator (`src/generators/pptx/PowerPointGenerator.ts`)

Generates PowerPoint files using PptxGenJS.

**Features:**
- Precise positioning (based on knowledge base coordinates)
- Embedded charts
- Speaker notes
- Consistent styling
- Master slide support

## Media Providers

### ImageProvider (`src/media/ImageProvider.ts`)

Pluggable image sourcing system.

**Provider Chain:**
1. `LocalImageProvider` - User-provided images
2. `UnsplashImageProvider` - API or Source URLs
3. `PlaceholderImageProvider` - Picsum.photos fallback

### ChartProvider (`src/media/ChartProvider.ts`)

Chart generation for both HTML and PPTX.

**Providers:**
- `ChartJsProvider` - Embedded Canvas charts (HTML)
- `QuickChartProvider` - URL-based chart images (PPTX)
- `MermaidProvider` - Diagrams and flowcharts

## Knowledge Base

### Structure (`assets/presentation-knowledge.yaml`)

```yaml
version: "8.6.0"
last_updated: "2024-12-05"

# Expert methodologies
experts:
  nancy_duarte:
    principles:
      - name: "Glance Test"
        description: "Message clear in 3 seconds"
        validation: ["word_count < 25", "whitespace > 35%"]
      - name: "STAR Moment"
        description: "Something They'll Always Remember"
      # ...

  garr_reynolds:
    principles:
      - name: "Signal-to-Noise"
        description: "Maximize signal, minimize noise"
      # ...

# Framework selector
framework_selector:
  by_audience:
    board_of_directors:
      primary_framework: "Barbara Minto"
      secondary_framework: "McKinsey"
      slide_types: ["executive_summary", "data_insight"]
    # ...

  by_goal:
    persuade:
      primary_framework: "Nancy Duarte"
      # ...

# Automated QA specifications
automated_qa:
  scoring_rubric:
    total_points: 100
    passing_threshold: 95
    categories:
      visual_quality:
        weight: 35
        checks:
          whitespace_percentage:
            keynote_min: 40
            business_min: 25
          # ...

# Slide type definitions
slide_types:
  title:
    suitable_for: ["keynote", "business"]
    max_words: 15
    required_fields: ["title"]
    optional_fields: ["subtitle", "author"]
  # ...

# Mode configurations
modes:
  keynote:
    max_words_per_slide: 25
    min_whitespace: 35
    bullet_limit: 3
    ideas_per_slide: 1
  business:
    max_words_per_slide: 80
    min_whitespace: 25
    bullet_limit: 5
    ideas_per_slide: 2
```

## Data Flow

### Generation Flow

```
Input Content (Markdown/JSON/YAML)
        │
        ▼
┌───────────────────┐
│  ContentAnalyzer  │
│  - Parse content  │
│  - Extract SCQA   │
│  - Find messages  │
└───────────────────┘
        │
        ▼
   ContentAnalysis
        │
        ▼
┌───────────────────┐
│   SlideFactory    │
│  - Select types   │
│  - Create slides  │
│  - Apply limits   │
└───────────────────┘
        │
        ▼
    Slide[]
        │
        ▼
┌───────────────────┐
│  TemplateEngine   │
│  - Render HTML    │
│  - Apply theme    │
│  - Add animations │
└───────────────────┘
        │
        ▼
    HTML String
        │
        ├────────────────────┐
        ▼                    ▼
┌───────────────┐    ┌───────────────┐
│RevealJsGen    │    │PowerPointGen  │
│- Full HTML doc│    │- PPTX buffer  │
└───────────────┘    └───────────────┘
        │                    │
        └────────────────────┘
                  │
                  ▼
┌───────────────────────────────┐
│           QAEngine            │
│  - Visual tests (Playwright)  │
│  - Content tests             │
│  - Expert tests              │
│  - Accessibility tests       │
└───────────────────────────────┘
                  │
                  ▼
            QAResults
                  │
                  ▼
┌───────────────────────────────┐
│        ScoreCalculator        │
│  - Weight categories         │
│  - Apply penalties           │
│  - Generate 0-100 score      │
└───────────────────────────────┘
                  │
                  ▼
              Score
                  │
         ┌───────┴───────┐
         │               │
    Score >= 95     Score < 95
         │               │
         ▼               ▼
    Return Result    Throw Error
```

## Extension Points

### Custom Templates

Override any slide template:

```typescript
generate({
  ...config,
  customTemplates: {
    'title': '<section>Custom title template</section>',
    'bullet-points': '<section>Custom bullet template</section>'
  }
});
```

### Custom CSS

Inject additional styles:

```typescript
generate({
  ...config,
  customCSS: `
    .reveal .slides section {
      background: #f0f0f0;
    }
  `
});
```

### Custom Image Provider

Implement the `ImageProvider` interface:

```typescript
class MyImageProvider implements ImageProvider {
  name = 'my-provider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getImage(request: ImageRequest): Promise<ImageResult> {
    // Your implementation
  }

  async getImages(requests: ImageRequest[]): Promise<ImageResult[]> {
    return Promise.all(requests.map(r => this.getImage(r)));
  }
}
```

### Custom Chart Provider

Implement the `ChartProvider` interface:

```typescript
class MyChartProvider implements ChartProvider {
  name = 'my-charts';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateChart(request: ChartRequest): Promise<ChartResult> {
    // Your implementation
  }
}
```

## Performance Considerations

### Playwright Overhead

Visual QA with Playwright adds ~2-5 seconds per presentation. For bulk generation, consider:

```typescript
generate({
  ...config,
  skipQA: true  // Skip QA for drafts (not recommended for final output)
});
```

### Knowledge Base Loading

The knowledge base is loaded once and cached:

```typescript
const kb = getKnowledgeBase();  // Singleton
await kb.load();                 // Loads from YAML
// Subsequent calls return cached data
```

### Template Compilation

Templates are compiled once on engine instantiation and reused.

## Error Handling

### ValidationError

Thrown when input configuration is invalid:

```typescript
class ValidationError extends Error {
  errors: string[];  // List of validation failures
}
```

### QAFailureError

Thrown when presentation quality is below threshold:

```typescript
class QAFailureError extends Error {
  score: number;
  threshold: number;
  qaResults: QAResults;

  getIssues(): string[] {
    return this.qaResults.issues.map(i => i.message);
  }
}
```

### TemplateNotFoundError

Thrown when a custom template path is invalid:

```typescript
class TemplateNotFoundError extends Error {
  templatePath: string;
}
```

## Testing Strategy

### Unit Tests
- ContentAnalyzer: SCQA extraction, message identification
- SlideFactory: Slide type selection, constraint enforcement
- TemplateEngine: Template rendering, helper functions
- ScoreCalculator: Score computation, grade assignment

### Integration Tests
- Full pipeline: Content → Slides → HTML → QA
- Error conditions: Invalid input, QA failures

### Visual Regression Tests
- Slide screenshots comparison
- Layout consistency across browsers

### E2E Tests
- CLI command execution
- File output verification
