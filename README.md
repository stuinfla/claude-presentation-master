# Claude Presentation Master

<div align="center">

![NPM Version](https://img.shields.io/npm/v/claude-presentation-master)
![Downloads](https://img.shields.io/npm/dm/claude-presentation-master)
![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)

### Turn your Claude projects into polished presentations — instantly.

You've been working in Claude on a business project. Strategy docs, research, analysis, plans.
Now someone asks for a presentation. **This is usually where things get painful.**

Not anymore.

[Install Now](#installation) •
[See It Work](#quick-start) •
[What's Inside](#the-knowledge-base)

</div>

---

## The Scenario

You're deep in a Claude Code session. You've built something real:
- A product strategy
- A quarterly business review
- An investor pitch
- A project plan
- A competitive analysis

Now you need slides.

**What usually happens:**

You ask Claude to make a presentation. You get walls of text, generic bullet points, and amateur formatting. You spend the next two hours manually fixing everything in PowerPoint. Or you give up and just build it from scratch.

**What happens with this library:**

```
Your Claude project context
         ↓
   One command
         ↓
Professional presentation (HTML or PowerPoint)
Ready to present. Ready to send to clients.
```

---

## Why This Works

Claude is brilliant at research, analysis, and strategy. But presentations? Not so much.

That's because Claude wasn't trained on what actually makes presentations work:
- McKinsey consultants don't use bullet points — they use action titles
- TED speakers don't dump information — they follow the Sparkline narrative arc
- Steve Jobs averaged 10 words per slide — not 100
- Investment bankers structure decks with the Pyramid Principle — answer first, support second

**We spent months building a knowledge base that knows all of this.**

We scoured the internet for everything ever written about making great presentations:

| Source | What We Extracted |
|--------|-------------------|
| **600+ consulting decks** | McKinsey, BCG, Bain slide structures and standards |
| **Nancy Duarte** | Sparkline narrative, STAR moments, Glance Test |
| **Garr Reynolds** | Presentation Zen, signal-to-noise ratio |
| **Carmine Gallo** | TED talk patterns, Rule of Three, 18-minute rule |
| **Barbara Minto** | Pyramid Principle, SCQA framework, MECE logic |
| **Edward Tufte** | Data-ink ratio, chartjunk elimination |
| **Cole Nussbaumer Knaflic** | Storytelling with Data principles |
| **10M+ views of YouTube content** | Analyst Academy, PowerPoint School, and more |

All of it — **6,300+ lines of expert knowledge** — encoded into an agentic vector database.

**Now Claude doesn't have to figure out presentations. The knowledge base already knows.**

---

## What You Actually Get

### Two Output Formats

**HTML Presentations (Reveal.js)**

Modern, web-native slides that run in any browser:

- Share via URL — just send a link
- Works on any device — desktop, tablet, phone
- Animations and transitions built-in
- Speaker notes with `S` key
- Fullscreen with `F` key
- Looks like a polished online version of PowerPoint

*Best for: Tech audiences, conferences, product demos, anything you want to share online*

**PowerPoint (PPTX)**

Traditional format that opens in Microsoft PowerPoint:

- Edit further if needed
- Send to clients who expect PPTX
- Print to PDF for handouts
- Works offline

*Best for: Board decks, client deliverables, corporate environments*

### Two Presentation Modes

**Keynote Mode** — For inspiring and persuading

- 6-15 words per slide (like Steve Jobs)
- 40%+ whitespace
- One idea per slide
- Emotional narrative structure
- Big visuals, minimal text

*Use for: Product launches, investor pitches, conference talks, TED-style presentations*

**Business Mode** — For informing and documenting

- 40-80 words per slide
- Action titles (full sentences that state conclusions)
- Data with callouts
- Structured with Pyramid Principle
- Charts, tables, metrics grids

*Use for: Board meetings, strategy reviews, consulting deliverables, quarterly reports*

---

## Installation

```bash
npm install claude-presentation-master
npx playwright install chromium
```

That's it. You're ready.

---

## Quick Start

### From the Command Line

```bash
# Turn your markdown notes into a keynote-style HTML presentation
cpm generate project-notes.md --mode keynote --format html

# Create a consulting-style PowerPoint deck
cpm generate strategy.md --mode business --format pptx

# Generate both formats at once
cpm generate quarterly-review.md --mode business --format html,pptx
```

### From Your Code

```typescript
import { generate } from 'claude-presentation-master';

const result = await generate({
  content: `
# Q4 Strategy Update

## Where We Are
Revenue up 23% YoY. Market share down 2 points.

## The Challenge
Three new competitors launched in Q3.
Customer acquisition costs up 40%.

## What We're Doing
1. Launch enterprise tier in Q2
2. Expand into adjacent markets
3. Shift to product-led growth

## Expected Result
Market share leadership within 18 months.
  `,
  contentType: 'markdown',
  mode: 'business',
  format: ['html', 'pptx'],
  title: 'Q4 Strategy Update'
});

// result.outputs.html — Complete HTML presentation
// result.outputs.pptx — PowerPoint file buffer
// result.score — Quality score (must be 95+ to pass)
```

---

## The Knowledge Base

This isn't a template library. It's a **complete expert system** for presentations.

### What's Encoded

**From McKinsey, BCG, Bain:**
- Pyramid Principle — Lead with the answer
- SCQA Framework — Situation → Complication → Question → Answer
- Action Titles — "Revenue grew 23%" not "Revenue Analysis"
- One Message Per Slide — Every slide has exactly one job
- Chart Callouts — Always tell the audience what to see

**From Nancy Duarte (Slide:ology, Resonate):**
- Sparkline Structure — Alternate between "what is" and "what could be"
- STAR Moments — Something They'll Always Remember
- Glance Test — Understand it in 3 seconds or less
- Signal-to-Noise — Maximize meaning, eliminate clutter

**From Garr Reynolds (Presentation Zen):**
- Simplicity — When in doubt, leave it out
- Restraint — Resist the urge to add
- Visual over Verbal — Show, don't tell

**From Carmine Gallo (Talk Like TED):**
- Rule of Three — Human memory works in threes
- 18-Minute Rule — Optimal presentation length
- Emotional Connection — Touch hearts before minds

**From Edward Tufte:**
- Data-Ink Ratio — Every drop of ink should represent data
- Chartjunk Elimination — No 3D effects, no decorative gridlines
- Graphical Integrity — Never distort data for visual effect

**From Barbara Minto (The Pyramid Principle):**
- Top-Down Communication — Conclusion first, support second
- MECE Grouping — Mutually Exclusive, Collectively Exhaustive
- Vertical Logic — Each level supports the one above

### Design System

Complete color palettes tested for accessibility:
- **Consulting Classic** — Cream background, navy text (McKinsey/BCG look)
- **Executive Professional** — Warm gray, sophisticated
- **Modern Tech** — Light with teal accents
- **Dark Executive** — Dark mode for screens

Typography rules:
- Keynote: 54-72px titles, max 2 fonts
- Business: 18-22px action titles, 11-14px body
- Accessibility: 18pt minimum, 30pt+ for projection

---

## Quality Validation

Every presentation passes through real visual QA using Playwright:

| Check | What's Measured |
|-------|-----------------|
| **Whitespace** | Percentage of empty space (40%+ for keynote, 25%+ for business) |
| **Balance** | Center of mass — is the layout visually balanced? |
| **Contrast** | WCAG 4.5:1 minimum for text readability |
| **Word Count** | Enforced limits per slide type |
| **Font Count** | Maximum 2 font families |
| **Color Count** | Maximum 5 colors |

**Presentations must score 95/100 or higher.** If they don't, you get a specific list of what to fix.

---

## The Difference

| Without This Library | With This Library |
|---------------------|-------------------|
| Ask Claude for slides, get bullet point soup | Structured presentation following expert frameworks |
| Manually fix formatting for hours | Production-ready output in seconds |
| Hope it looks professional | 95/100 quality bar enforced |
| Generic templates | 6,300+ lines of encoded expertise |
| Text only | HTML or PowerPoint output |
| No validation | Real visual QA with screenshots |

---

## Use Cases

**You're building a product strategy in Claude**
→ Generate an investor pitch deck in keynote mode

**You've analyzed Q4 performance**
→ Create a board presentation in business mode

**You're planning a product launch**
→ Build a TED-style keynote for the all-hands

**You've done competitive research**
→ Turn it into a consulting-style strategy deck

**You have meeting notes that need to become a presentation**
→ One command, done

---

## Themes

| Theme | Look | Best For |
|-------|------|----------|
| `default` | Clean, professional | General use |
| `consulting-classic` | Cream, navy | McKinsey/BCG style |
| `modern-tech` | Light, teal accents | Startups, tech |
| `minimal` | Maximum whitespace | Design-focused |
| `dark-executive` | Dark mode | Screen presentations |

---

## Slide Types

**Keynote Mode:**
Big Idea • Single Statement • Full Image • Big Number • Quote

**Business Mode:**
Agenda • Bullet Points • Two Column • Three Column • Metrics Grid • Timeline • Process Flow • Comparison • Case Study • Pricing Table

---

## FAQ

**Does this require an API key?**
No. The knowledge base is bundled with the package. Works 100% offline.

**Can I edit the output?**
Yes. HTML is just HTML. PPTX opens in PowerPoint for further editing.

**What if I don't like the result?**
Adjust your input content or lower the quality threshold (not recommended).

**Does it work with Claude Code?**
Yes — that's exactly what it's designed for. Generate presentations from your project context.

---

## License

MIT — free to use, modify, and distribute.

---

## Author

**Stuart Kerr** — [Isovision.ai](https://isovision.ai)

---

<div align="center">

**Stop fighting with slides. Start presenting.**

```bash
npm install claude-presentation-master
```

Built on methodologies from McKinsey • BCG • Bain • Nancy Duarte • Garr Reynolds
Carmine Gallo • Chris Anderson • Barbara Minto • Edward Tufte

</div>
