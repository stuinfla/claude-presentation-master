# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-05

### Added

#### Core Features
- **Presentation Engine**: Main orchestrator for generating presentations
- **Content Analyzer**: Extract SCQA, Sparkline, STAR moments, and key messages from content
- **Slide Factory**: Generate slide structures based on content analysis and presentation mode
- **Template Engine**: Handlebars-based template rendering with 20+ slide types
- **Score Calculator**: Calculate QA scores with detailed breakdown

#### QA System
- **Visual Validation**: Playwright-based screenshot analysis
  - Whitespace percentage calculation
  - Layout balance measurement
  - Contrast ratio checking
- **Content Validation**: Word count, action titles, glance test, signal-to-noise
- **Expert Validation**: Duarte, Reynolds, Gallo, Anderson principle compliance
- **Accessibility Validation**: WCAG compliance, contrast issues, font sizes
- **95/100 threshold enforcement** with QAFailureError for failures

#### Output Formats
- **HTML Generator**: Reveal.js presentations with animations
  - 6 built-in themes
  - Chart.js integration
  - Mermaid.js diagram support
  - Custom CSS support
- **PowerPoint Generator**: PptxGenJS-based PPTX output
  - Precise positioning
  - Embedded charts
  - Speaker notes
  - Master slide support

#### Presentation Modes
- **Keynote Mode**: 6-25 words per slide, high-impact visuals
- **Business Mode**: 40-80 words per slide, detailed information

#### Slide Types
Universal:
- `title`, `section-divider`, `quote`, `big-number`, `cta`, `thank-you`

Keynote-specific:
- `big-idea`, `single-statement`, `full-image`

Business-specific:
- `agenda`, `bullet-points`, `two-column`, `three-column`, `comparison`
- `timeline`, `process`, `metrics-grid`, `screenshot`, `screenshot-left`
- `screenshot-right`, `social-proof`, `case-study`, `pricing`, `team`, `features`

#### Media Providers (API-free)
- **Image Providers**:
  - LocalImageProvider: Use local files
  - PlaceholderImageProvider: Picsum.photos fallback
  - UnsplashImageProvider: Unsplash Source (no API key required)
  - CompositeImageProvider: Chain providers with fallback
- **Chart Providers**:
  - ChartJsProvider: Embedded HTML charts
  - QuickChartProvider: URL-based chart images
  - MermaidProvider: Flowcharts and diagrams

#### Knowledge Base
- 6,300+ lines of expert principles
- Framework selector by audience and goal
- Automated QA specifications
- PPTX positioning coordinates
- Mode configurations

#### CLI
- `cpm generate` - Generate presentations
- `cpm validate` - Validate existing presentations
- `cpm info` - Show package information
- Multiple format support
- Theme selection
- QA threshold configuration

#### Documentation
- Comprehensive README with examples
- Architecture documentation
- Full API reference
- Real-world examples
- Contributing guidelines

### Technical Details
- TypeScript with strict mode
- ESM and CJS builds
- Node.js 18+ required
- MIT License

---

## [Unreleased]

### Planned Features
- [ ] Additional themes
- [ ] PDF export
- [ ] Google Slides export
- [ ] Interactive chart editing
- [ ] Template marketplace
- [ ] AI-powered content suggestions (optional)
- [ ] Collaborative editing support
- [ ] Version control for presentations
