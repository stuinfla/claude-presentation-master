# Claude Presentation Master

<div align="center">

![NPM Version](https://img.shields.io/npm/v/claude-presentation-master)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

**Stop making mediocre presentations. Start making presentations that actually work.**

[Installation](#installation) •
[Quick Start](#quick-start) •
[Why This Exists](#why-this-exists) •
[Examples](#examples) •
[API Reference](#api-reference)

</div>

---

## Why This Exists

**Most presentations are terrible.** Death by bullet points. Walls of text. Zero visual impact.

The irony? We know how to make great presentations. Nancy Duarte, Garr Reynolds, Carmine Gallo, Chris Anderson—these experts have written bestselling books with clear, proven methodologies. TED talks follow specific patterns. Steve Jobs' keynotes weren't accidents.

**The problem:** Nobody has time to read 10 books and manually apply 40+ expert principles to every slide.

**The solution:** This library encodes all of those expert methodologies into code. It analyzes your content, structures it using proven frameworks (Sparkline, SCQA, Rule of Three), generates slides that follow strict design rules, and then **actually validates the visual output** using Playwright screenshots.

No AI hallucination. No generic templates. Just 6,300+ lines of encoded expert knowledge that ensures every presentation meets a 95/100 quality bar—or it tells you exactly what to fix.

---

## What is Claude Presentation Master?

A TypeScript/Node.js library that transforms your content into professionally designed presentations. It applies proven methodologies from world-renowned presentation experts:

- **Nancy Duarte** (Slide:ology, Resonate) - Sparkline narrative structure, STAR moments
- **Garr Reynolds** (Presentation Zen) - Signal-to-noise ratio, visual simplicity
- **Carmine Gallo** (Talk Like TED) - Rule of Three, emotional connection
- **Chris Anderson** (TED Talks) - One powerful idea per presentation
- **Barbara Minto** (McKinsey) - Pyramid Principle, SCQA structure

The library enforces quality through **real visual validation** using Playwright, ensuring your presentations meet a 95/100 minimum quality score before they're considered complete.

### Key Differentiators

| Feature | Other Tools | Claude Presentation Master |
|---------|-------------|---------------------------|
| Quality Control | None or basic linting | Real visual QA with Playwright screenshots |
| Expert Methods | Generic templates | 40+ expert methodologies encoded |
| Word Limits | User must count | Automatically enforced per mode |
| Layout Validation | None | Whitespace %, balance, contrast measured |
| Accessibility | Often ignored | WCAG AA compliance built-in |
| API Dependency | Usually required | **Works 100% offline** |

---

## Installation

```bash
# npm
npm install claude-presentation-master

# yarn
yarn add claude-presentation-master

# pnpm
pnpm add claude-presentation-master
```

### Post-Installation

The first time you run visual QA, Playwright will download browser binaries:

```bash
npx playwright install chromium
```

---

## Quick Start

### Option 1: CLI (Command Line)

```bash
# Generate a keynote-style presentation
cpm generate my-content.md --mode keynote --format html,pptx

# Validate an existing presentation
cpm validate presentation.html --mode keynote

# See all options
cpm --help
```

### Option 2: Programmatic API

```typescript
import { generate } from 'claude-presentation-master';
import { writeFileSync } from 'fs';

const result = await generate({
  content: `
# Revolutionizing Customer Experience

## The Problem
Today's customers expect instant, personalized service.
Yet 73% report frustration with current support systems.

## Our Solution
AI-powered support that understands context and delivers
human-quality responses in seconds, not hours.

## The Results
- 90% faster resolution times
- 4.8/5 customer satisfaction
- 60% cost reduction

## Next Steps
Join our pilot program and transform your customer experience.
  `,
  contentType: 'markdown',
  mode: 'keynote',
  format: ['html', 'pptx'],
  title: 'Customer Experience Revolution',
  author: 'Your Name',
  qaThreshold: 95
});

// Check the quality score
console.log(`Quality Score: ${result.score}/100`);
console.log(`Slide Count: ${result.metadata.slideCount}`);
console.log(`Frameworks Applied: ${result.metadata.frameworks.join(', ')}`);

// Save the outputs
if (result.outputs.html) {
  writeFileSync('presentation.html', result.outputs.html);
}
if (result.outputs.pptx) {
  writeFileSync('presentation.pptx', result.outputs.pptx);
}
```

---

## How It Works

### The Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR CONTENT (Markdown/JSON/YAML)            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      1. CONTENT ANALYSIS                        │
│  • Extract SCQA structure (Situation, Complication, Question,   │
│    Answer) using Barbara Minto's Pyramid Principle              │
│  • Identify Sparkline narrative arc (What Is vs What Could Be)  │
│  • Find STAR moments (Something They'll Always Remember)        │
│  • Extract key messages (max 3 - Rule of Three)                 │
│  • Generate action titles (McKinsey style)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      2. SLIDE GENERATION                        │
│  • Select appropriate slide types based on content              │
│  • Apply mode constraints (keynote: 6-25 words, business: 40-80)│
│  • Structure narrative flow with proper pacing                  │
│  • Add section dividers, transitions, and closing               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      3. OUTPUT GENERATION                       │
│  • HTML: Reveal.js with animations, Chart.js, Mermaid           │
│  • PPTX: PptxGenJS with proper positioning and styling          │
│  • Apply theme colors, typography, and visual hierarchy         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      4. QA VALIDATION                           │
│  • Screenshot each slide with Playwright                        │
│  • Calculate whitespace percentage (target: 35%+ keynote)       │
│  • Measure layout balance (center of mass analysis)             │
│  • Check contrast ratios (WCAG 4.5:1 minimum)                   │
│  • Validate expert principle compliance                         │
│  • Generate 0-100 score with detailed breakdown                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. THRESHOLD ENFORCEMENT                     │
│  • Score >= 95: ✅ Return presentation                          │
│  • Score < 95: ❌ Throw QAFailureError with improvement list    │
└─────────────────────────────────────────────────────────────────┘
```

### The Knowledge Base

The package includes a 6,300+ line knowledge base (`presentation-knowledge.yaml`) containing:

- **40+ Expert Methodologies**: Encoded principles from presentation masters
- **Framework Selector**: Automatically chooses the best framework for your audience
- **Slide Type Definitions**: 20+ slide types with constraints and templates
- **QA Scoring Rubric**: Detailed validation rules with point values
- **Mode Configurations**: Keynote vs Business rules and limits

This knowledge base powers every decision the engine makes, ensuring expert-level quality without requiring AI API calls.

---

## Presentation Modes

### Keynote Mode

Optimized for **high-impact presentations** like TED talks, product launches, and keynotes.

| Constraint | Value |
|------------|-------|
| Words per slide | 6-25 maximum |
| Whitespace | 35%+ of slide area |
| Ideas per slide | Exactly 1 |
| Bullet points | Avoided (use single statements) |
| Reading time | < 3 seconds per slide |

**Best for**: Conferences, product launches, investor pitches, inspirational talks

### Business Mode

Optimized for **information-rich presentations** like board meetings, strategy reviews, and training.

| Constraint | Value |
|------------|-------|
| Words per slide | 40-80 |
| Whitespace | 25%+ of slide area |
| Ideas per slide | 1-2 maximum |
| Bullet points | Up to 5 per slide |
| Data density | Medium to high |

**Best for**: Board meetings, quarterly reviews, training sessions, documentation

---

## Slide Types

### Universal Slides (Both Modes)

| Type | Description | Use Case |
|------|-------------|----------|
| `title` | Opening slide with title and subtitle | Always first |
| `section-divider` | Section break with dark background | Between major sections |
| `quote` | Blockquote with attribution | Expert quotes, testimonials |
| `big-number` | Large statistic with context | Dramatic data points |
| `cta` | Call to action | Near the end |
| `thank-you` | Closing slide | Always last |

### Keynote-Specific Slides

| Type | Description | Use Case |
|------|-------------|----------|
| `big-idea` | Single powerful statement, large text | Core message delivery |
| `single-statement` | One sentence, centered | Key points |
| `full-image` | Full-bleed image with text overlay | Emotional impact |

### Business-Specific Slides

| Type | Description | Use Case |
|------|-------------|----------|
| `agenda` | Numbered list of topics | After title slide |
| `bullet-points` | Title with bullet list | Detailed information |
| `two-column` | Split layout (text + image/data) | Comparison, illustration |
| `three-column` | Three equal columns | Feature comparison |
| `comparison` | Side-by-side with divider | Before/after, pros/cons |
| `timeline` | Chronological events | History, roadmap |
| `process` | Step-by-step flow with arrows | Workflows, procedures |
| `metrics-grid` | KPI dashboard layout | Performance data |
| `screenshot` | Product screenshot with caption | Demo, walkthrough |
| `screenshot-left` | Screenshot on left, text on right | Feature explanation |
| `screenshot-right` | Text on left, screenshot on right | Feature explanation |
| `social-proof` | Customer testimonials | Trust building |
| `case-study` | Challenge/Solution/Results | Customer success |
| `pricing` | Pricing table | Sales presentations |
| `team` | Team member grid | About us |
| `features` | Feature list with icons | Product overview |

---

## Themes

```typescript
type ThemeName =
  | 'default'         // Clean, professional
  | 'light-corporate' // Traditional business
  | 'modern-tech'     // Contemporary tech look
  | 'minimal'         // Maximum whitespace, B&W
  | 'warm'            // Earthy, approachable
  | 'creative';       // Bold, artistic
```

### Theme Preview

| Theme | Primary | Accent | Best For |
|-------|---------|--------|----------|
| `default` | Dark navy | Coral red | General use |
| `light-corporate` | Slate blue | Ocean blue | Enterprise, finance |
| `modern-tech` | Deep navy | Electric pink | Startups, tech |
| `minimal` | Pure black | Black | Design, luxury |
| `warm` | Brown | Orange | Food, hospitality |
| `creative` | Purple | Pink | Marketing, design |

---

## QA Scoring System

Every presentation is validated against a 100-point rubric:

### Score Breakdown

| Category | Weight | What's Checked |
|----------|--------|----------------|
| **Visual Quality** | 35% | Whitespace %, layout balance, contrast ratio, font count, color count |
| **Content Quality** | 30% | Word limits, action titles, glance test, signal-to-noise, one idea rule |
| **Expert Compliance** | 25% | Duarte, Reynolds, Gallo, Anderson principles |
| **Accessibility** | 10% | WCAG level, contrast issues, font sizes, color-blind safety |

### Grading Scale

| Score | Grade | Status |
|-------|-------|--------|
| 95-100 | A+ | ✅ Excellent - Ready to present |
| 90-94 | A | ⚠️ Good - Minor improvements suggested |
| 85-89 | A- | ⚠️ Acceptable - Several issues to address |
| 80-84 | B+ | ❌ Below standard - Significant issues |
| < 80 | B or lower | ❌ Fails - Major redesign needed |

### Threshold Enforcement

By default, the library **rejects presentations scoring below 95**:

```typescript
try {
  const result = await generate(config);
} catch (error) {
  if (error instanceof QAFailureError) {
    console.log(`Score: ${error.score}/100`);
    console.log(`Threshold: ${error.threshold}`);
    console.log('Issues to fix:');
    error.getIssues().forEach(issue => console.log(`  - ${issue}`));
  }
}
```

You can lower the threshold (not recommended):

```typescript
const result = await generate({
  ...config,
  qaThreshold: 80  // Accept lower quality (NOT RECOMMENDED)
});
```

---

## Media Providers

All media features work **without API keys**.

### Images

```typescript
import { createDefaultImageProvider } from 'claude-presentation-master';

// Default: Uses placeholder images (picsum.photos)
const provider = createDefaultImageProvider();

// With local images
const provider = createDefaultImageProvider({
  localImages: {
    'team-photo': './images/team.jpg',
    'product-screenshot': './images/product.png',
    'logo': './images/logo.svg'
  }
});

// With Unsplash (optional API key for better rate limits)
const provider = createDefaultImageProvider({
  unsplashKey: process.env.UNSPLASH_ACCESS_KEY  // Optional
});
```

**Image Provider Priority:**
1. Local images (exact match)
2. Unsplash API (if key provided)
3. Unsplash Source (no key needed)
4. Placeholder (always works)

### Charts

```typescript
import { createDefaultChartProvider } from 'claude-presentation-master';

const chartProvider = createDefaultChartProvider();

// Generate a chart
const chart = await chartProvider.generateChart({
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue ($M)',
      data: [10, 15, 22, 31]
    }]
  },
  title: 'Quarterly Revenue Growth',
  palette: 'professional'  // 'default' | 'professional' | 'vibrant' | 'monochrome'
});

// chart.html - For HTML output (Chart.js canvas)
// chart.imageUrl - For PPTX output (QuickChart.io URL)
```

**Supported Chart Types:**
- `bar` - Bar chart
- `line` - Line chart
- `pie` - Pie chart
- `doughnut` - Doughnut chart
- `radar` - Radar chart
- `polarArea` - Polar area chart
- `scatter` - Scatter plot
- `bubble` - Bubble chart

### Diagrams (Mermaid)

```typescript
const chartProvider = createDefaultChartProvider();

// Generate flowchart
const flowchart = chartProvider.generateFlowchart([
  { id: 'A', label: 'Start', next: ['B'] },
  { id: 'B', label: 'Process', next: ['C', 'D'] },
  { id: 'C', label: 'Option 1', next: ['E'] },
  { id: 'D', label: 'Option 2', next: ['E'] },
  { id: 'E', label: 'End' }
]);

// Generate timeline
const timeline = chartProvider.generateTimeline([
  { date: '2020', title: 'Company Founded' },
  { date: '2021', title: 'Series A' },
  { date: '2022', title: 'Product Launch' },
  { date: '2023', title: '1M Users' }
]);
```

---

## API Reference

### `generate(config)`

Generate a presentation from content.

```typescript
async function generate(config: PresentationConfig): Promise<PresentationResult>
```

**Parameters:**

```typescript
interface PresentationConfig {
  // Required
  content: string;                    // Your content
  contentType: 'markdown' | 'json' | 'yaml' | 'text';
  mode: 'keynote' | 'business';
  format: ('html' | 'pptx')[];
  title: string;

  // Optional
  theme?: ThemeName;                  // Default: 'default'
  author?: string;
  subject?: string;
  qaThreshold?: number;               // Default: 95
  skipQA?: boolean;                   // Default: false (NOT RECOMMENDED)
  minify?: boolean;                   // Minify HTML output
  customCSS?: string;                 // Additional CSS
  customTemplates?: Record<string, string>;  // Handlebars overrides
}
```

**Returns:**

```typescript
interface PresentationResult {
  outputs: {
    html?: string;      // Reveal.js HTML
    pptx?: Buffer;      // PowerPoint file
  };
  qaResults: QAResults; // Detailed QA breakdown
  score: number;        // 0-100 quality score
  metadata: {
    title: string;
    author: string;
    generatedAt: string;
    mode: 'keynote' | 'business';
    slideCount: number;
    wordCount: number;
    avgWordsPerSlide: number;
    estimatedDuration: number;  // Minutes
    frameworks: string[];       // Applied expert frameworks
  };
}
```

### `validate(presentation, options)`

Validate an existing HTML presentation.

```typescript
async function validate(
  presentation: string | Buffer,
  options?: {
    mode?: 'keynote' | 'business';
    threshold?: number;
    strictMode?: boolean;
  }
): Promise<QAResults & { score: number }>
```

### Error Classes

```typescript
// Thrown when configuration is invalid
class ValidationError extends Error {
  errors: string[];
}

// Thrown when QA score is below threshold
class QAFailureError extends Error {
  score: number;
  threshold: number;
  qaResults: QAResults;

  getIssues(): string[];  // List of issues to fix
}
```

---

## CLI Reference

```
Claude Presentation Master v1.0.0

USAGE:
  cpm <command> [options]

COMMANDS:
  generate <input>    Generate presentation from input file
  validate <file>     Validate an existing HTML presentation
  info                Show package information

OPTIONS:
  -o, --output <dir>  Output directory (default: ./output)
  -m, --mode <mode>   keynote or business (default: keynote)
  -f, --format <fmt>  html, pptx, or html,pptx (default: html)
  -t, --theme <name>  Theme name
  --title <title>     Presentation title
  --author <name>     Author name
  --threshold <num>   QA threshold 0-100 (default: 95)
  --skip-qa           Skip QA (NOT recommended)
  -h, --help          Show help
  -v, --version       Show version

EXAMPLES:
  cpm generate deck.md -m keynote -f html,pptx
  cpm generate report.yaml -m business -o ./slides
  cpm validate presentation.html --threshold 90
```

---

## Examples

### Example 1: Investor Pitch (Keynote Mode)

```typescript
const result = await generate({
  content: `
# Acme AI - Revolutionizing Customer Support

## The $400B Problem
Companies spend $400 billion annually on customer support.
Yet 67% of customers prefer self-service over speaking to a representative.

## Our Solution
Acme AI delivers human-quality support responses in under 3 seconds,
handling 80% of inquiries without human intervention.

## Traction
- 50+ enterprise customers
- $5M ARR (300% YoY growth)
- 95% customer retention

## The Team
Former leaders from Google, Amazon, and Salesforce
with 50+ years combined experience in AI and customer success.

## The Ask
$20M Series B to expand into European markets
and launch our enterprise platform.
  `,
  contentType: 'markdown',
  mode: 'keynote',
  format: ['html', 'pptx'],
  title: 'Acme AI - Series B',
  theme: 'modern-tech'
});
```

### Example 2: Quarterly Business Review (Business Mode)

```typescript
const result = await generate({
  content: `
# Q4 2024 Business Review

## Executive Summary
Q4 exceeded targets across all key metrics.
Revenue grew 25% QoQ while maintaining profitability.

## Financial Performance
- Revenue: $12.5M (+25% QoQ)
- Gross Margin: 72% (+3pp)
- Operating Expenses: $8.2M (-5%)
- Net Income: $1.8M (first profitable quarter)

## Customer Metrics
- New Customers: 127 (+40%)
- Churn Rate: 2.1% (-0.5pp)
- NPS Score: 72 (+8 points)
- Average Contract Value: $45,000 (+15%)

## Product Updates
1. Launched AI Assistant v2.0
2. Released mobile app for iOS and Android
3. Added 15 new integrations
4. Improved API response time by 40%

## Challenges
- Hiring senior engineers remains difficult
- Supply chain issues delayed hardware launch
- Competitor launched similar feature

## Q1 2025 Priorities
1. Launch enterprise tier
2. Expand sales team by 5 reps
3. Open European data center
4. Achieve SOC 2 Type II certification
  `,
  contentType: 'markdown',
  mode: 'business',
  format: ['html', 'pptx'],
  title: 'Q4 2024 Business Review',
  theme: 'light-corporate'
});
```

### Example 3: With Custom Templates

```typescript
const result = await generate({
  content: myContent,
  contentType: 'markdown',
  mode: 'keynote',
  format: ['html'],
  title: 'Custom Presentation',
  customTemplates: {
    'title': `
      <section class="slide slide-title custom-title">
        <div class="slide-content">
          <div class="logo">YOUR LOGO</div>
          <h1>{{title}}</h1>
          <p class="subtitle">{{subtitle}}</p>
          <p class="date">{{date}}</p>
        </div>
      </section>
    `
  },
  customCSS: `
    .custom-title {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .custom-title h1 {
      color: white;
    }
  `
});
```

---

## Troubleshooting

### "QA score below threshold"

Your presentation didn't meet the 95/100 quality bar. Check the error for specific issues:

```typescript
catch (error) {
  if (error instanceof QAFailureError) {
    console.log('Issues to fix:');
    error.getIssues().forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }
}
```

Common fixes:
- Reduce word count per slide (keynote: max 25, business: max 80)
- Increase whitespace (remove clutter)
- Ensure proper contrast (4.5:1 minimum)
- Use only 1-2 font families
- Limit colors to 5 or fewer

### "Playwright browsers not found"

Run the Playwright installation:

```bash
npx playwright install chromium
```

### "Module not found"

Ensure you've built the package:

```bash
npm run build
```

---

## Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development setup and guidelines.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Author

**Stuart Kerr**
<stuart@isovision.ai>
[Isovision.ai](https://isovision.ai)

---

<div align="center">

**Built with expert methodologies from the world's best presentation coaches.**

Nancy Duarte • Garr Reynolds • Carmine Gallo • Chris Anderson • Barbara Minto

</div>
