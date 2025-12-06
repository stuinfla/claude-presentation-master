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

import type { Slide, PresentationConfig, ThemeName, PresentationMode } from '../../types/index.js';
import { TemplateEngine } from '../../core/TemplateEngine.js';

interface RevealConfig {
  /** Reveal.js version */
  revealVersion?: string;
  /** Enable hash-based navigation */
  hash?: boolean;
  /** Enable slide numbers */
  slideNumber?: boolean | string;
  /** Transition style */
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
  /** Transition speed */
  transitionSpeed?: 'default' | 'fast' | 'slow';
  /** Enable controls */
  controls?: boolean;
  /** Enable progress bar */
  progress?: boolean;
  /** Center slides vertically */
  center?: boolean;
  /** Enable touch navigation */
  touch?: boolean;
  /** Enable keyboard navigation */
  keyboard?: boolean;
  /** Enable overview mode */
  overview?: boolean;
  /** Auto-slide interval (ms, 0 = disabled) */
  autoSlide?: number;
}

export class RevealJsGenerator {
  private templateEngine: TemplateEngine;
  private defaultRevealConfig: RevealConfig = {
    revealVersion: '5.0.4',
    hash: true,
    slideNumber: 'c/t',
    transition: 'fade',
    transitionSpeed: 'default',
    controls: true,
    progress: true,
    center: false, // CRITICAL: false for multi-column layouts
    touch: true,
    keyboard: true,
    overview: true,
    autoSlide: 0
  };

  constructor() {
    this.templateEngine = new TemplateEngine();
  }

  /**
   * Generate complete Reveal.js HTML presentation.
   */
  async generate(slides: Slide[], config: PresentationConfig): Promise<string> {
    // Render all slides
    const templateConfig: { theme?: ThemeName; customTemplates?: Record<string, string> } = {};
    if (config.theme) templateConfig.theme = config.theme;
    if (config.customTemplates) templateConfig.customTemplates = config.customTemplates;

    const slideHtml = this.templateEngine.renderAll(slides, templateConfig);

    // Build complete HTML document
    const docConfig: {
      title: string;
      author?: string;
      subject?: string;
      slides: string;
      theme: ThemeName;
      customCSS?: string;
      revealConfig: RevealConfig;
      mode: PresentationMode;
    } = {
      title: config.title,
      slides: slideHtml.join('\n'),
      theme: config.theme ?? 'default',
      revealConfig: this.defaultRevealConfig,
      mode: config.mode
    };
    if (config.author) docConfig.author = config.author;
    if (config.subject) docConfig.subject = config.subject;
    if (config.customCSS) docConfig.customCSS = config.customCSS;

    const html = this.buildDocument(docConfig);

    // Minify if requested
    if (config.minify) {
      return this.minifyHtml(html);
    }

    return html;
  }

  /**
   * Build the complete HTML document.
   */
  private buildDocument(options: {
    title: string;
    author?: string;
    subject?: string;
    slides: string;
    theme: ThemeName;
    customCSS?: string;
    revealConfig: RevealConfig;
    mode: 'keynote' | 'business';
  }): string {
    const { title, author, subject, slides, theme, customCSS, revealConfig, mode } = options;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="author" content="${this.escapeHtml(author ?? 'Claude Presentation Master')}">
  <meta name="description" content="${this.escapeHtml(subject ?? '')}">
  <meta name="generator" content="Claude Presentation Master v1.0.0">
  <title>${this.escapeHtml(title)}</title>

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/reset.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/theme/white.css">

  <!-- Chart.js for charts -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <!-- Mermaid for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>

  <!-- Presentation Engine CSS -->
  <style>
${this.getBaseStyles(mode)}
${this.getThemeStyles(theme)}
${this.getAnimationStyles()}
${customCSS ?? ''}
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slides}
    </div>
  </div>

  <!-- Reveal.js -->
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/dist/reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@${revealConfig.revealVersion}/plugin/notes/notes.js"></script>
  <script>
    // Initialize Reveal.js
    Reveal.initialize({
      hash: ${revealConfig.hash},
      slideNumber: ${typeof revealConfig.slideNumber === 'string' ? `'${revealConfig.slideNumber}'` : revealConfig.slideNumber},
      transition: '${revealConfig.transition}',
      transitionSpeed: '${revealConfig.transitionSpeed}',
      controls: ${revealConfig.controls},
      progress: ${revealConfig.progress},
      center: ${revealConfig.center},
      touch: ${revealConfig.touch},
      keyboard: ${revealConfig.keyboard},
      overview: ${revealConfig.overview},
      autoSlide: ${revealConfig.autoSlide},
      plugins: [RevealNotes]
    });

    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });

    // Trigger animations on slide change
    Reveal.on('slidechanged', function(event) {
      const slide = event.currentSlide;
      const animatedElements = slide.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach(function(el) {
        el.style.animationPlayState = 'running';
      });
    });
  </script>
</body>
</html>`;
  }

  /**
   * Get base styles for slides.
   */
  private getBaseStyles(mode: 'keynote' | 'business'): string {
    const fontSize = mode === 'keynote' ? '2.5em' : '1.8em';
    const lineHeight = mode === 'keynote' ? '1.4' : '1.5';

    return `
    /* Base Styles */
    :root {
      --font-heading: 'Source Sans Pro', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-body: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;

      --color-primary: #1a1a2e;
      --color-secondary: #16213e;
      --color-accent: #0f3460;
      --color-highlight: #e94560;
      --color-text: #1a1a2e;
      --color-text-light: #4a4a68;
      --color-background: #ffffff;

      --slide-padding: 60px;
      --content-max-width: 1200px;
    }

    .reveal {
      font-family: var(--font-body);
      font-size: ${fontSize};
      line-height: ${lineHeight};
      color: var(--color-text);
    }

    .reveal .slides {
      text-align: left;
    }

    .reveal .slides section {
      padding: var(--slide-padding);
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .reveal .slides section .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: var(--content-max-width);
      width: 100%;
      margin: 0 auto;
    }

    /* Typography */
    .reveal h1, .reveal h2, .reveal h3 {
      font-family: var(--font-heading);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--color-primary);
      margin-bottom: 0.5em;
    }

    .reveal h1 { font-size: 2.5em; }
    .reveal h2 { font-size: 1.8em; }
    .reveal h3 { font-size: 1.3em; }

    .reveal p {
      margin: 0 0 1em 0;
    }

    .reveal .subtitle {
      font-size: 0.7em;
      color: var(--color-text-light);
    }

    /* Lists */
    .reveal ul, .reveal ol {
      margin: 0 0 1em 1.2em;
      padding: 0;
    }

    .reveal li {
      margin-bottom: 0.5em;
    }

    /* Columns */
    .reveal .columns {
      display: flex;
      gap: 40px;
      flex: 1;
      align-items: flex-start;
    }

    .reveal .two-columns .column {
      flex: 1;
    }

    .reveal .three-columns .column {
      flex: 1;
    }

    /* Big elements */
    .reveal .big-idea-text,
    .reveal .statement {
      font-size: 2em;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
    }

    .reveal .number {
      font-size: 4em;
      font-weight: 800;
      color: var(--color-highlight);
      text-align: center;
    }

    .reveal .number-context {
      text-align: center;
      color: var(--color-text-light);
    }

    /* Quotes */
    .reveal blockquote {
      border-left: 4px solid var(--color-accent);
      padding-left: 1em;
      font-style: italic;
      margin: 1em 0;
    }

    .reveal .attribution {
      text-align: right;
      color: var(--color-text-light);
      font-size: 0.8em;
    }

    /* Images */
    .reveal img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    .reveal .image-container {
      text-align: center;
    }

    .reveal .caption {
      font-size: 0.7em;
      color: var(--color-text-light);
      margin-top: 0.5em;
    }

    /* Metrics */
    .reveal .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 30px;
      text-align: center;
    }

    .reveal .metric-value {
      font-size: 2em;
      font-weight: 700;
      color: var(--color-highlight);
    }

    .reveal .metric-label {
      font-size: 0.8em;
      color: var(--color-text-light);
    }

    .reveal .metric-change {
      font-size: 0.7em;
    }

    .reveal .metric-change.up { color: #27ae60; }
    .reveal .metric-change.down { color: #e74c3c; }

    /* Charts */
    .reveal .chart-container {
      margin: 1em 0;
    }

    /* Source */
    .reveal .source {
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 0.5em;
      color: var(--color-text-light);
    }

    /* Speaker notes */
    .reveal aside.notes {
      display: none;
    }

    /* Slide types */
    .reveal .slide-title .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-thank-you .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-section-divider .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-big-idea .slide-content,
    .reveal .slide-single-statement .slide-content {
      justify-content: center;
      align-items: center;
    }

    .reveal .slide-big-number .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .slide-cta .slide-content {
      justify-content: center;
      text-align: center;
    }

    .reveal .cta-button {
      display: inline-block;
      padding: 0.5em 1.5em;
      background: var(--color-highlight);
      color: white;
      border-radius: 4px;
      font-weight: 600;
      margin-top: 1em;
    }
    `;
  }

  /**
   * Get theme-specific styles.
   */
  private getThemeStyles(theme: ThemeName): string {
    const themes: Record<ThemeName, string> = {
      'default': '',

      'light-corporate': `
        :root {
          --color-primary: #2c3e50;
          --color-secondary: #34495e;
          --color-accent: #3498db;
          --color-highlight: #2980b9;
          --color-background: #ffffff;
        }
      `,

      'modern-tech': `
        :root {
          --color-primary: #1a1a2e;
          --color-secondary: #16213e;
          --color-accent: #0f3460;
          --color-highlight: #e94560;
          --color-background: #f8f9fa;
        }
      `,

      'minimal': `
        :root {
          --color-primary: #000000;
          --color-secondary: #333333;
          --color-accent: #666666;
          --color-highlight: #000000;
          --color-text-light: #888888;
          --color-background: #ffffff;
        }
        .reveal h1, .reveal h2 {
          font-weight: 400;
        }
      `,

      'warm': `
        :root {
          --color-primary: #5d4037;
          --color-secondary: #795548;
          --color-accent: #d7ccc8;
          --color-highlight: #ff5722;
          --color-background: #fafafa;
        }
      `,

      'creative': `
        :root {
          --color-primary: #6200ea;
          --color-secondary: #7c4dff;
          --color-accent: #b388ff;
          --color-highlight: #ff4081;
          --color-background: #fafafa;
        }
      `
    };

    return themes[theme] ?? '';
  }

  /**
   * Get animation styles.
   */
  private getAnimationStyles(): string {
    return `
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideUp {
      animation: slideUp 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideDown {
      animation: slideDown 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideLeft {
      animation: slideLeft 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-slideRight {
      animation: slideRight 0.6s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-zoomIn {
      animation: zoomIn 0.5s ease-out forwards;
      animation-play-state: paused;
    }

    .animate-bounceIn {
      animation: bounceIn 0.8s ease-out forwards;
      animation-play-state: paused;
    }

    /* Animation delays */
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
    .delay-400 { animation-delay: 400ms; }
    .delay-500 { animation-delay: 500ms; }

    /* Staggered animations */
    .stagger-children > *:nth-child(1) { animation-delay: 0ms; }
    .stagger-children > *:nth-child(2) { animation-delay: 100ms; }
    .stagger-children > *:nth-child(3) { animation-delay: 200ms; }
    .stagger-children > *:nth-child(4) { animation-delay: 300ms; }
    .stagger-children > *:nth-child(5) { animation-delay: 400ms; }
    .stagger-children > *:nth-child(6) { animation-delay: 500ms; }

    /* Auto-play animations on current slide */
    .reveal .present [class*="animate-"] {
      animation-play-state: running;
    }
    `;
  }

  /**
   * Escape HTML entities.
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char] ?? char);
  }

  /**
   * Basic HTML minification.
   */
  private minifyHtml(html: string): string {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  }
}
