# Contributing to Claude Presentation Master

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

---

## Code of Conduct

This project follows a standard code of conduct. Please be respectful and constructive in all interactions.

### Our Standards

- Be welcoming and inclusive
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- A code editor (VS Code recommended)

### First-time Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/claude-presentation-master.git
   cd claude-presentation-master
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/isovision/claude-presentation-master.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Install Playwright browsers**

   ```bash
   npx playwright install chromium
   ```

6. **Build the project**

   ```bash
   npm run build
   ```

7. **Run tests**

   ```bash
   npm test
   ```

---

## Development Setup

### Available Scripts

```bash
# Build the project
npm run build

# Watch mode for development
npm run dev

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run visual regression tests
npm run test:visual

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck
```

### VS Code Extensions

Recommended extensions for development:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Environment Variables

Create a `.env.local` file for development:

```bash
# Optional: Unsplash API key for image tests
UNSPLASH_ACCESS_KEY=your_key_here

# Optional: Enable debug logging
DEBUG=claude-presentation:*
```

---

## Project Structure

```
claude-presentation-master/
├── bin/
│   └── cli.js              # CLI entry point
├── src/
│   ├── index.ts            # Main exports
│   ├── types/
│   │   └── index.ts        # Type definitions
│   ├── core/
│   │   ├── PresentationEngine.ts
│   │   ├── ContentAnalyzer.ts
│   │   ├── SlideFactory.ts
│   │   ├── TemplateEngine.ts
│   │   └── ScoreCalculator.ts
│   ├── qa/
│   │   └── QAEngine.ts
│   ├── generators/
│   │   ├── html/
│   │   │   └── RevealJsGenerator.ts
│   │   └── pptx/
│   │       └── PowerPointGenerator.ts
│   ├── media/
│   │   ├── ImageProvider.ts
│   │   ├── ChartProvider.ts
│   │   └── index.ts
│   └── knowledge/
│       └── KnowledgeBase.ts
├── assets/
│   ├── presentation-engine.css
│   └── presentation-knowledge.yaml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── visual/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── EXAMPLES.md
│   └── CONTRIBUTING.md
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Public API exports |
| `src/types/index.ts` | All TypeScript type definitions |
| `src/core/PresentationEngine.ts` | Main orchestrator |
| `src/qa/QAEngine.ts` | Visual and content validation |
| `assets/presentation-knowledge.yaml` | Expert knowledge base |
| `assets/presentation-engine.css` | CSS component library |

---

## Coding Standards

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer `interface` over `type` for object shapes
- Use explicit return types on public methods
- Avoid `any` - use `unknown` if type is truly unknown

```typescript
// Good
interface SlideConfig {
  title: string;
  type: SlideType;
}

async function createSlide(config: SlideConfig): Promise<Slide> {
  // ...
}

// Bad
type SlideConfig = {
  title: any;
  type: string;
}

async function createSlide(config) {
  // ...
}
```

### Naming Conventions

- **Files**: PascalCase for classes (`ContentAnalyzer.ts`), camelCase for utilities (`utils.ts`)
- **Classes**: PascalCase (`PresentationEngine`)
- **Interfaces**: PascalCase (`SlideData`)
- **Functions**: camelCase (`generateSlides`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_WORDS_KEYNOTE`)
- **Private members**: underscore prefix (`_privateMethod`)

### Code Style

ESLint and Prettier handle most formatting. Key rules:

- 2 space indentation
- Single quotes for strings
- No semicolons (Prettier adds them)
- Max line length: 100 characters

```typescript
// Good
export class ContentAnalyzer {
  private readonly signals: string[]

  constructor() {
    this.signals = ['however', 'but', 'although']
  }

  async analyze(content: string): Promise<ContentAnalysis> {
    const paragraphs = this.splitIntoParagraphs(content)
    return this.extractStructure(paragraphs)
  }

  private splitIntoParagraphs(text: string): string[] {
    return text.split(/\n\n+/).filter(p => p.trim())
  }
}
```

### Comments

- Use JSDoc for public APIs
- Keep comments concise and meaningful
- Explain "why", not "what"

```typescript
/**
 * Extract SCQA structure from content.
 *
 * Uses Barbara Minto's Pyramid Principle to identify:
 * - Situation: Current state
 * - Complication: The problem
 * - Question: What to do?
 * - Answer: The solution
 *
 * @param paragraphs - Content split into paragraphs
 * @returns Extracted SCQA structure
 */
private extractSCQA(paragraphs: string[]): SCQAStructure {
  // Look for complication signals before answer signals
  // to ensure we capture the problem before the solution
  // ...
}
```

---

## Testing

### Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── ContentAnalyzer.test.ts
│   ├── SlideFactory.test.ts
│   └── ScoreCalculator.test.ts
├── integration/             # Integration tests
│   ├── generate.test.ts
│   └── validate.test.ts
└── visual/                  # Visual regression tests
    └── slides.test.ts
```

### Writing Tests

Use Jest for all tests:

```typescript
import { ContentAnalyzer } from '../src/core/ContentAnalyzer'

describe('ContentAnalyzer', () => {
  let analyzer: ContentAnalyzer

  beforeEach(() => {
    analyzer = new ContentAnalyzer()
  })

  describe('analyze', () => {
    it('should extract SCQA structure from markdown', async () => {
      const content = `
# Problem
Currently, companies struggle with X.

However, this leads to Y problem.

The solution is to implement Z.
      `

      const result = await analyzer.analyze(content, 'markdown')

      expect(result.scqa.situation).toContain('companies struggle')
      expect(result.scqa.complication).toContain('problem')
      expect(result.scqa.answer).toContain('solution')
    })

    it('should extract max 3 key messages', async () => {
      const content = `
# Title

## Message 1
First key point.

## Message 2
Second key point.

## Message 3
Third key point.

## Message 4
Fourth key point (should be excluded).
      `

      const result = await analyzer.analyze(content, 'markdown')

      expect(result.keyMessages).toHaveLength(3)
    })
  })
})
```

### Visual Tests

Visual regression tests use Playwright and jest-image-snapshot:

```typescript
import { chromium } from 'playwright'
import { toMatchImageSnapshot } from 'jest-image-snapshot'

expect.extend({ toMatchImageSnapshot })

describe('Slide Visual Tests', () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await chromium.launch()
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    page = await browser.newPage()
  })

  it('should render title slide correctly', async () => {
    await page.setContent(titleSlideHtml)
    const screenshot = await page.screenshot()
    expect(screenshot).toMatchImageSnapshot({
      failureThreshold: 0.01,
      failureThresholdType: 'percent'
    })
  })
})
```

### Test Coverage

Aim for >80% coverage on core modules:

```bash
npm run test:coverage
```

Coverage report is generated in `coverage/lcov-report/index.html`.

---

## Submitting Changes

### Before Submitting

1. **Sync with upstream**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**

   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

3. **Update documentation**

   If you added/changed functionality, update relevant docs.

4. **Write meaningful commit messages**

   ```
   feat: add timeline slide type

   - Add TimelineSlide component
   - Add timeline template to TemplateEngine
   - Add tests for timeline extraction
   - Update documentation
   ```

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**

   Follow the coding standards above.

3. **Push to your fork**

   ```bash
   git push origin feature/my-feature
   ```

4. **Open a Pull Request**

   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes you made and why
   - Include screenshots for visual changes

5. **Respond to feedback**

   Be responsive to code review comments.

### PR Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No type errors (`npm run typecheck`)
- [ ] New code has test coverage
- [ ] Documentation is updated
- [ ] Commit messages are clear

---

## Release Process

Releases are managed by maintainers following semantic versioning.

### Version Numbers

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Release Checklist

1. Update `CHANGELOG.md`
2. Update version in `package.json`
3. Run full test suite
4. Build production bundle
5. Create GitHub release with notes
6. Publish to npm

---

## Questions?

- **Bug reports**: Open a GitHub issue
- **Feature requests**: Open a GitHub issue with `[Feature]` prefix
- **General questions**: Open a GitHub discussion
- **Security issues**: Email security@isovision.ai

Thank you for contributing!
