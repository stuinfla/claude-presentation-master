# Claude Presentation Master

<div align="center">

![NPM Version](https://img.shields.io/npm/v/claude-presentation-master)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

### The presentation engine that makes Claude actually good at slides.

**Give Claude your project. Get back McKinsey-quality presentations.**

[Installation](#installation) •
[Quick Start](#quick-start) •
[Why This Exists](#why-this-exists) •
[The Knowledge Base](#the-knowledge-base) •
[Output Formats](#output-formats)

</div>

---

## The Problem

You ask Claude to make a presentation. You get:
- Generic bullet points
- Walls of text
- No visual structure
- Amateur layouts
- Zero understanding of what makes slides actually work

**Claude is brilliant at many things. Presentations isn't one of them.**

That's not Claude's fault. It wasn't trained on McKinsey decks. It never studied Nancy Duarte's frameworks. It doesn't know that Steve Jobs averaged 10 words per slide, or that TED talks follow a specific narrative arc, or that consulting firms use action titles instead of topic labels.

---

## The Solution

We spent months scouring the internet for everything ever written about making great presentations:

- **600+ real consulting presentations** from McKinsey, BCG, and Bain
- **Bestselling books** from Nancy Duarte, Garr Reynolds, Carmine Gallo, Chris Anderson
- **YouTube channels** with millions of views on presentation design
- **Academic research** on cognitive load, visual perception, and persuasion
- **Corporate style guides** from the world's top firms

Then we encoded all of it — **6,300+ lines of expert knowledge** — into an agentic vector database that Claude can use.

**Now Claude doesn't have to be smart about presentations. The knowledge base is smart for it.**

When you use this library, Claude hands off the hard part. Instead of guessing how to structure slides, it follows:
- McKinsey's Pyramid Principle
- Duarte's Sparkline narrative arc
- Tufte's data-ink ratio
- Minto's SCQA framework
- Gallo's Rule of Three

The result? **Clean, professional presentations** that look like they came from a $500/hour consultant — generated in seconds from your project notes, strategy docs, or rough ideas.

---

## What You Get

```
Your project notes/docs/ideas
         ↓
   Claude Presentation Master
         ↓
Production-ready presentations (HTML or PowerPoint)
```

**HTML Output:** Modern web presentations using Reveal.js. Share via URL, works in any browser, looks like a polished online version of PowerPoint with animations, speaker notes, and keyboard navigation.

**PowerPoint Output:** Traditional PPTX files. Open in PowerPoint, edit further, send to clients. The format everyone expects.

Both outputs follow the same expert principles. Both pass a 95/100 quality bar. Both look like they took hours to make.

---

## Why This Exists

**Claude out of the box makes mediocre presentations.** So does ChatGPT. So does every other AI.

They give you generic bullet points, bland layouts, and zero understanding of what actually makes a presentation effective. They've never studied Nancy Duarte. They don't know McKinsey's slide principles. They can't tell you why a TED talk works.

**This library fixes that.**

We encoded 6,300+ lines of expert knowledge from the world's best presentation minds:

- **The consulting firms** — McKinsey, BCG, Bain slide standards
- **The TED experts** — Chris Anderson, Carmine Gallo, Nancy Duarte
- **The design masters** — Garr Reynolds, Edward Tufte, Barbara Minto
- **The data viz specialists** — Cole Nussbaumer Knaflic, Scott Berinato
- **600+ real consulting presentations** analyzed and distilled

When you use this library, you're not getting generic AI output. You're getting presentations built on the same principles used by:
- McKinsey consultants billing $500/hour
- TED speakers with millions of views
- Investment bankers closing billion-dollar deals
- Steve Jobs launching the iPhone

---

## What Claude Alone Gives You vs. What This Library Gives You

| Aspect | Claude/ChatGPT Alone | Claude Presentation Master |
|--------|---------------------|---------------------------|
| **Slide structure** | Generic bullet points | SCQA framework (Situation, Complication, Question, Answer) — the same structure McKinsey uses |
| **Titles** | Topic labels ("Q3 Revenue") | Action titles that communicate conclusions ("Q3 revenue exceeded targets by 23% driven by enterprise deals") |
| **Word count** | Walls of text | Strict enforcement: 6-25 words for keynotes, 40-80 for business |
| **Data visualization** | Basic charts | Tufte's data-ink ratio, Berinato's chart selection, direct labeling, callouts |
| **Narrative flow** | Random order | Duarte's Sparkline (What Is → What Could Be → Call to Action) |
| **Quality validation** | None | Real visual QA with Playwright screenshots — whitespace %, balance, contrast |
| **Output** | Text only | Production-ready HTML (Reveal.js) or PowerPoint (PPTX) |

---

## The Knowledge Base

This isn't just a template library. It's a **complete expert knowledge system** with 6,300+ lines of encoded wisdom.

### Presentation Modes

**Keynote Mode (TED-Style)**
- 6-15 words per slide (Steve Jobs averaged 10)
- 40%+ whitespace
- One idea per slide
- Emotional storytelling structure
- Used for: Product launches, investor pitches, conference keynotes

**Business Mode (Consulting-Style)**
- 40-80 words per slide
- Action titles required (complete sentences that communicate conclusions)
- Data with callouts (tell the audience what to see)
- MECE structure (Mutually Exclusive, Collectively Exhaustive)
- Used for: Board decks, strategy presentations, consulting deliverables

### Expert Methodologies Encoded

#### From McKinsey, BCG, Bain
- **Pyramid Principle** — Lead with the answer, then support
- **SCQA Framework** — Situation → Complication → Question → Answer
- **Action Titles** — Headlines that communicate conclusions, not topics
- **One Message Per Slide** — Each slide has exactly one job
- **Chart Callouts** — Always tell the audience what to see in the data

#### From Nancy Duarte (Slide:ology, Resonate)
- **Sparkline Structure** — Oscillate between "What Is" and "What Could Be"
- **STAR Moments** — Something They'll Always Remember (dramatic reveals)
- **Glance Test** — Can you understand the slide in 3 seconds?
- **Signal-to-Noise Ratio** — Maximize meaning, minimize clutter

#### From Garr Reynolds (Presentation Zen)
- **Simplicity** — When in doubt, leave it out
- **Visual over Verbal** — Show, don't tell
- **Restraint** — Resist the urge to add more
- **Amplification Through Simplification** — Less is more

#### From Carmine Gallo (Talk Like TED)
- **Rule of Three** — Human memory works in threes
- **18-Minute Rule** — Optimal presentation length
- **Emotional Connection First** — Touch hearts before minds
- **The Twitter Test** — Can you summarize in one sentence?

#### From Edward Tufte (Data Visualization Pioneer)
- **Data-Ink Ratio** — Maximize ink used for data, eliminate everything else
- **Chartjunk Removal** — No 3D effects, no decorative gridlines, no clutter
- **Small Multiples** — Same chart repeated for easy comparison
- **Graphical Integrity** — Never distort data for visual effect

#### From Barbara Minto (The Pyramid Principle)
- **Top-Down Communication** — Lead with the conclusion
- **MECE Grouping** — Mutually Exclusive, Collectively Exhaustive
- **Logical Flow** — Ideas must follow logically from each other
- **Vertical and Horizontal Logic** — Structure that works in both directions

#### From Cole Nussbaumer Knaflic (Storytelling with Data)
- **Context First** — Know your audience before designing
- **Eliminate Clutter** — Remove everything that doesn't add value
- **Focus Attention** — Use preattentive attributes to guide the eye
- **Tell a Story** — Beginning, middle, end — even for data

### Visual Design System

The library includes complete color palettes tested for WCAG accessibility:

- **Executive Professional** — Warm gray, navy, and orange for board presentations
- **Consulting Classic** — Cream background, the McKinsey/BCG look
- **Modern Business** — Light gray and teal for tech companies
- **Strategy & Growth** — Warm neutrals with green accents
- **Dark Executive** — Dark mode for screen presentations

Typography rules:
- **Keynote**: 54-72px titles, 36-48px headlines, 24-32px body
- **Business**: 18-22px action titles, 11-14px body, always 2 fonts maximum
- **Accessibility**: 18pt minimum for body text, 30pt+ for projected

### Consulting Visual Elements

- **Harvey Balls** — Circular icons showing completion (●◐○)
- **Traffic Lights** — Red/Yellow/Green status indicators
- **Icon Systems** — Consistent icon families from Font Awesome, Material
- **Arrow Conventions** — Solid for direct, dotted for optional

---

## Output Formats

### HTML Presentations (Reveal.js)

Modern, web-native presentations that work in any browser.

```
✓ No software required — runs in Chrome, Safari, Firefox
✓ Share via URL — just send a link
✓ Responsive — works on desktop, tablet, mobile
✓ Interactive — animations, videos, live code demos
✓ Keyboard shortcuts — F for fullscreen, S for speaker notes, ESC for overview
✓ Version control — store in Git, track changes
✓ Embed anywhere — put in websites, documentation, wikis
```

**Best for:** Tech audiences, conference talks, product demos, developer presentations, portfolio websites

**Features included:**
- Multiple themes (white, black, minimal, corporate)
- Slide transitions (fade, slide, zoom, none for consulting style)
- Speaker notes view
- PDF export
- Syntax highlighting for code
- Chart.js integration for data visualization
- Mermaid diagrams for flowcharts

### PowerPoint (PPTX)

Traditional downloadable format for corporate environments.

```
✓ Universal standard — everyone has PowerPoint
✓ Offline editing — no internet required
✓ Client expects it — consulting deliverables need PPTX
✓ Rich animations — full PowerPoint animation support
✓ Print to PDF — easy handouts
```

**Best for:** Board decks, consulting deliverables, client presentations, corporate environments

**Features included:**
- Precise element positioning
- Master slide layouts
- Speaker notes
- Chart embedding
- Font embedding

---

## Installation

```bash
npm install claude-presentation-master
```

After installation, Playwright needs browser binaries:

```bash
npx playwright install chromium
```

---

## Quick Start

### CLI Usage

```bash
# Generate a keynote-style HTML presentation
cpm generate my-content.md --mode keynote --format html

# Generate a consulting-style PowerPoint
cpm generate strategy-deck.md --mode business --format pptx

# Generate both formats
cpm generate pitch.md --mode keynote --format html,pptx

# Validate an existing presentation
cpm validate presentation.html --mode keynote
```

### Programmatic API

```typescript
import { generate } from 'claude-presentation-master';
import { writeFileSync } from 'fs';

const result = await generate({
  content: `
# Q4 Strategy Presentation

## Current Situation
Revenue grew 23% YoY but market share declined 2 points.

## The Challenge
Three new competitors entered our core market in Q3.
Customer acquisition costs increased 40%.

## Our Response
1. Launch enterprise tier by Q2
2. Expand into adjacent verticals
3. Reduce CAC through product-led growth

## Expected Outcome
Regain market share leadership within 18 months.
  `,
  contentType: 'markdown',
  mode: 'business',        // or 'keynote'
  format: ['html', 'pptx'],
  title: 'Q4 Strategy Review',
  author: 'Strategy Team',
  theme: 'consulting-classic',
  qaThreshold: 95          // Minimum quality score
});

console.log(`Quality Score: ${result.score}/100`);
console.log(`Slides: ${result.metadata.slideCount}`);
console.log(`Frameworks Applied: ${result.metadata.frameworks.join(', ')}`);

// Save outputs
if (result.outputs.html) {
  writeFileSync('presentation.html', result.outputs.html);
}
if (result.outputs.pptx) {
  writeFileSync('presentation.pptx', result.outputs.pptx);
}
```

---

## Quality Validation

Every presentation is validated against a 100-point rubric using **real visual analysis** with Playwright:

| Category | Weight | What's Measured |
|----------|--------|-----------------|
| **Visual Quality** | 35% | Whitespace percentage, layout balance, contrast ratio, font count, color count |
| **Content Quality** | 30% | Word limits, action titles, glance test, signal-to-noise, one-idea rule |
| **Expert Compliance** | 25% | Duarte, Reynolds, Gallo, Anderson, Minto principles |
| **Accessibility** | 10% | WCAG level, contrast issues, font sizes, color-blind safety |

**The library rejects presentations scoring below 95/100** and tells you exactly what to fix:

```typescript
try {
  const result = await generate(config);
} catch (error) {
  if (error instanceof QAFailureError) {
    console.log(`Score: ${error.score}/100`);
    console.log('Issues to fix:');
    error.getIssues().forEach(issue => {
      console.log(`  - ${issue}`);
    });
  }
}
```

---

## Themes

| Theme | Style | Best For |
|-------|-------|----------|
| `default` | Clean, professional | General use |
| `consulting-classic` | Cream, navy — McKinsey/BCG style | Consulting deliverables |
| `executive-professional` | Warm gray, sophisticated | Board presentations |
| `modern-tech` | Light with teal accents | Tech companies, startups |
| `minimal` | Maximum whitespace, B&W | Design-focused |
| `dark-executive` | Dark mode | Screen presentations |

---

## Slide Types

### Keynote Mode
- **Big Idea** — Single powerful statement, large text
- **Single Statement** — One sentence, centered
- **Full Image** — Full-bleed image with text overlay
- **Big Number** — Dramatic statistic with context
- **Quote** — Blockquote with attribution

### Business Mode
- **Agenda** — Numbered topics with timing
- **Bullet Points** — Title with supporting points (max 5)
- **Two Column** — Split layout for comparison
- **Metrics Grid** — KPI dashboard layout
- **Timeline** — Chronological events
- **Process** — Step-by-step with arrows
- **Comparison** — Side-by-side analysis
- **Case Study** — Challenge/Solution/Results format

---

## How It's Different

| Other AI Tools | Claude Presentation Master |
|----------------|---------------------------|
| Generate generic slides | Apply McKinsey/BCG slide principles |
| No quality control | 95/100 minimum score enforced |
| Text output only | Production-ready HTML or PPTX |
| No visual validation | Playwright screenshots analyze every slide |
| Generic templates | 6,300+ lines of expert methodology |
| Hope it looks good | Measure whitespace, balance, contrast |
| No narrative structure | SCQA, Sparkline, Pyramid Principle |
| Bullet point hell | Strict word limits per mode |

---

## Roadmap

- [ ] PDF export
- [ ] Google Slides export
- [ ] Additional themes
- [ ] Interactive chart editing
- [ ] AI-powered content suggestions (optional)
- [ ] Collaborative editing

---

## License

MIT License — free to use, modify, and distribute.

---

## Author

**Stuart Kerr**
<stuart@isovision.ai>
[Isovision.ai](https://isovision.ai)

---

<div align="center">

**Built on methodologies from the world's best presentation experts.**

McKinsey • BCG • Bain • Nancy Duarte • Garr Reynolds • Carmine Gallo
Chris Anderson • Barbara Minto • Edward Tufte • Cole Nussbaumer Knaflic

</div>
