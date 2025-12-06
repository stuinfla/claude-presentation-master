/**
 * Template Engine - Handlebars Template Rendering
 *
 * Renders slide data into HTML using Handlebars templates.
 * Supports custom templates and helper functions.
 */

import Handlebars from 'handlebars';
import type { Slide, SlideType, ThemeName } from '../types/index.js';

interface TemplateConfig {
  customTemplates?: Record<string, string>;
  theme?: ThemeName;
}

export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private templates: Map<SlideType, Handlebars.TemplateDelegate>;
  private partials: Map<string, Handlebars.TemplateDelegate>;

  constructor() {
    this.handlebars = Handlebars.create();
    this.templates = new Map();
    this.partials = new Map();
    this.registerHelpers();
    this.registerPartials();
    this.compileTemplates();
  }

  /**
   * Render a slide to HTML.
   */
  render(slide: Slide, config?: TemplateConfig): string {
    // Check for custom template override
    if (config?.customTemplates?.[slide.type]) {
      const customTemplate = this.handlebars.compile(config.customTemplates[slide.type]);
      return customTemplate(this.prepareContext(slide, config));
    }

    // Use built-in template
    const template = this.templates.get(slide.type);
    if (!template) {
      console.warn(`No template for slide type: ${slide.type}, using fallback`);
      return this.renderFallback(slide);
    }

    return template(this.prepareContext(slide, config));
  }

  /**
   * Render multiple slides.
   */
  renderAll(slides: Slide[], config?: TemplateConfig): string[] {
    return slides.map(slide => this.render(slide, config));
  }

  /**
   * Prepare template context with computed properties.
   */
  private prepareContext(slide: Slide, config?: TemplateConfig): Record<string, unknown> {
    return {
      ...slide.data,
      slideIndex: slide.index,
      slideType: slide.type,
      classes: this.buildClassList(slide, config?.theme),
      styles: this.buildStyleString(slide),
      hasImage: slide.data.images && slide.data.images.length > 0,
      hasMetrics: slide.data.metrics && slide.data.metrics.length > 0,
      hasBullets: slide.data.bullets && slide.data.bullets.length > 0,
      bulletCount: slide.data.bullets?.length ?? 0,
      theme: config?.theme ?? 'default'
    };
  }

  /**
   * Build CSS class list for slide.
   */
  private buildClassList(slide: Slide, theme?: ThemeName): string {
    const classes = [
      'slide',
      `slide-${slide.type}`,
      ...(slide.classes ?? [])
    ];

    if (theme && theme !== 'default') {
      classes.push(`theme-${theme}`);
    }

    return classes.join(' ');
  }

  /**
   * Build inline style string.
   */
  private buildStyleString(slide: Slide): string {
    if (!slide.styles) return '';

    return Object.entries(slide.styles)
      .map(([prop, value]) => `${this.kebabCase(prop)}: ${value}`)
      .join('; ');
  }

  /**
   * Register Handlebars helpers.
   */
  private registerHelpers(): void {
    // Conditional helper
    this.handlebars.registerHelper('ifEquals', function(this: unknown, arg1: unknown, arg2: unknown, options: Handlebars.HelperOptions) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });

    // Loop with index
    this.handlebars.registerHelper('eachWithIndex', function(this: unknown, context: Record<string, unknown>[], options: Handlebars.HelperOptions) {
      let result = '';
      for (let i = 0; i < context.length; i++) {
        const item = context[i] || {};
        result += options.fn({ ...item, index: i, first: i === 0, last: i === context.length - 1 });
      }
      return result;
    });

    // Truncate text
    this.handlebars.registerHelper('truncate', function(text: string, length: number) {
      if (!text || text.length <= length) return text;
      return text.slice(0, length) + '...';
    });

    // Format number with commas
    this.handlebars.registerHelper('formatNumber', function(num: number | string) {
      const n = typeof num === 'string' ? parseFloat(num) : num;
      return n.toLocaleString();
    });

    // Trend icon
    this.handlebars.registerHelper('trendIcon', function(trend: 'up' | 'down' | 'neutral') {
      switch (trend) {
        case 'up': return '↑';
        case 'down': return '↓';
        default: return '→';
      }
    });

    // Animation delay calculator
    this.handlebars.registerHelper('animDelay', function(index: number, baseMs = 100) {
      return `animation-delay: ${index * baseMs}ms`;
    });

    // Safe HTML output
    this.handlebars.registerHelper('safeHTML', function(text: string) {
      return new Handlebars.SafeString(text);
    });

    // Markdown-light processing (basic formatting)
    this.handlebars.registerHelper('markdown', function(text: string) {
      if (!text) return '';
      let html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
      return new Handlebars.SafeString(html);
    });
  }

  /**
   * Register reusable partials.
   */
  private registerPartials(): void {
    // Bullet list partial
    this.handlebars.registerPartial('bulletList', `
      <ul class="bullets{{#if staggered}} stagger-children{{/if}}">
        {{#each bullets}}
        <li class="bullet animate-fadeIn" style="{{animDelay @index 150}}">
          {{markdown this}}
        </li>
        {{/each}}
      </ul>
    `);

    // Metrics grid partial
    this.handlebars.registerPartial('metricsGrid', `
      <div class="metrics-grid">
        {{#each metrics}}
        <div class="metric animate-fadeIn" style="{{animDelay @index 200}}">
          <div class="metric-value">{{value}}</div>
          <div class="metric-label">{{label}}</div>
          {{#if change}}
          <div class="metric-change {{trend}}">
            {{trendIcon trend}} {{change}}
          </div>
          {{/if}}
        </div>
        {{/each}}
      </div>
    `);

    // Image with caption partial
    this.handlebars.registerPartial('imageWithCaption', `
      <figure class="image-container">
        <img src="{{src}}" alt="{{alt}}" class="slide-image" loading="lazy">
        {{#if caption}}
        <figcaption class="caption">{{caption}}</figcaption>
        {{/if}}
      </figure>
    `);

    // Source citation partial
    this.handlebars.registerPartial('source', `
      {{#if source}}
      <div class="source">Source: {{source}}</div>
      {{/if}}
    `);

    // Speaker notes partial
    this.handlebars.registerPartial('speakerNotes', `
      {{#if notes}}
      <aside class="notes">
        {{notes}}
      </aside>
      {{/if}}
    `);
  }

  /**
   * Compile built-in templates.
   */
  private compileTemplates(): void {
    // Title slide
    this.templates.set('title', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content title-content">
          <h1 class="title animate-fadeIn">{{title}}</h1>
          {{#if subtitle}}
          <p class="subtitle animate-fadeIn delay-200">{{subtitle}}</p>
          {{/if}}
          {{#if author}}
          <p class="author animate-fadeIn delay-400">{{author}}</p>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Agenda slide
    this.templates.set('agenda', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{> bulletList staggered=true}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Section divider
    this.templates.set('section-divider', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content section-divider-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if subtitle}}
          <p class="subtitle animate-fadeIn delay-200">{{subtitle}}</p>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Big idea (keynote)
    this.templates.set('big-idea', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content big-idea-content">
          <h2 class="big-idea-text animate-fadeIn">{{title}}</h2>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Single statement (keynote)
    this.templates.set('single-statement', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content statement-content">
          <p class="statement animate-fadeIn">{{title}}</p>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Big number
    this.templates.set('big-number', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content big-number-content">
          <div class="number animate-zoomIn">{{title}}</div>
          {{#if subtitle}}
          <p class="number-context animate-fadeIn delay-300">{{subtitle}}</p>
          {{/if}}
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Quote
    this.templates.set('quote', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content quote-content">
          <blockquote class="quote animate-fadeIn">
            <p>"{{quote}}"</p>
            {{#if attribution}}
            <cite class="attribution animate-fadeIn delay-300">— {{attribution}}</cite>
            {{/if}}
          </blockquote>
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Full image
    this.templates.set('full-image', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}" data-background-image="{{images.[0].src}}">
        <div class="slide-content image-overlay-content">
          {{#if title}}
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{/if}}
          {{#if caption}}
          <p class="caption animate-fadeIn delay-200">{{caption}}</p>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Bullet points
    this.templates.set('bullet-points', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if body}}
          <p class="body animate-fadeIn delay-100">{{body}}</p>
          {{/if}}
          {{> bulletList staggered=true}}
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Two column
    this.templates.set('two-column', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns two-columns">
            <div class="column column-left animate-slideRight">
              {{#if body}}
              <p class="body">{{markdown body}}</p>
              {{/if}}
              {{#if hasBullets}}
              {{> bulletList}}
              {{/if}}
            </div>
            <div class="column column-right animate-slideLeft delay-200">
              {{#if hasImage}}
              {{> imageWithCaption images.[0]}}
              {{else if metrics}}
              {{> metricsGrid}}
              {{/if}}
            </div>
          </div>
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Three column
    this.templates.set('three-column', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns three-columns stagger-children">
            {{#each columns}}
            <div class="column animate-fadeIn" style="{{animDelay @index 200}}">
              {{#if title}}<h3 class="column-title">{{title}}</h3>{{/if}}
              {{#if body}}<p class="column-body">{{markdown body}}</p>{{/if}}
              {{#if icon}}<div class="column-icon">{{icon}}</div>{{/if}}
            </div>
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Comparison
    this.templates.set('comparison', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="comparison-container">
            <div class="comparison-left animate-slideRight">
              <h3>{{leftTitle}}</h3>
              <ul>
                {{#each leftItems}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            <div class="comparison-divider"></div>
            <div class="comparison-right animate-slideLeft delay-200">
              <h3>{{rightTitle}}</h3>
              <ul>
                {{#each rightItems}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Metrics grid
    this.templates.set('metrics-grid', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{> metricsGrid}}
          {{> source}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Screenshot
    this.templates.set('screenshot', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content screenshot-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="screenshot-container animate-fadeIn delay-200">
            {{> imageWithCaption images.[0]}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Screenshot left
    this.templates.set('screenshot-left', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns two-columns">
            <div class="column column-left animate-slideRight">
              {{> imageWithCaption images.[0]}}
            </div>
            <div class="column column-right animate-slideLeft delay-200">
              {{#if body}}<p class="body">{{markdown body}}</p>{{/if}}
              {{#if hasBullets}}{{> bulletList}}{{/if}}
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Screenshot right
    this.templates.set('screenshot-right', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="columns two-columns">
            <div class="column column-left animate-slideRight">
              {{#if body}}<p class="body">{{markdown body}}</p>{{/if}}
              {{#if hasBullets}}{{> bulletList}}{{/if}}
            </div>
            <div class="column column-right animate-slideLeft delay-200">
              {{> imageWithCaption images.[0]}}
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Timeline
    this.templates.set('timeline', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="timeline stagger-children">
            {{#each events}}
            <div class="timeline-item animate-fadeIn" style="{{animDelay @index 200}}">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{date}}</div>
                <div class="timeline-title">{{title}}</div>
                {{#if description}}<div class="timeline-desc">{{description}}</div>{{/if}}
              </div>
            </div>
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Process/Steps
    this.templates.set('process', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="process-steps stagger-children">
            {{#each steps}}
            <div class="process-step animate-fadeIn" style="{{animDelay @index 200}}">
              <div class="step-number">{{add @index 1}}</div>
              <div class="step-title">{{title}}</div>
              {{#if description}}<div class="step-desc">{{description}}</div>{{/if}}
            </div>
            {{#unless last}}
            <div class="step-arrow">→</div>
            {{/unless}}
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Social proof / Testimonial
    this.templates.set('social-proof', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="testimonials stagger-children">
            {{#each testimonials}}
            <div class="testimonial animate-fadeIn" style="{{animDelay @index 300}}">
              <blockquote>"{{quote}}"</blockquote>
              <div class="testimonial-author">
                {{#if avatar}}<img src="{{avatar}}" alt="{{name}}" class="author-avatar">{{/if}}
                <div class="author-info">
                  <div class="author-name">{{name}}</div>
                  {{#if role}}<div class="author-role">{{role}}</div>{{/if}}
                </div>
              </div>
            </div>
            {{/each}}
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Case study
    this.templates.set('case-study', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          <div class="case-study-content">
            {{#if logo}}<img src="{{logo}}" alt="{{company}}" class="case-logo animate-fadeIn">{{/if}}
            <div class="case-details animate-fadeIn delay-200">
              <div class="case-challenge">
                <h3>Challenge</h3>
                <p>{{challenge}}</p>
              </div>
              <div class="case-solution">
                <h3>Solution</h3>
                <p>{{solution}}</p>
              </div>
              <div class="case-results">
                <h3>Results</h3>
                {{> metricsGrid metrics=results}}
              </div>
            </div>
          </div>
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // CTA
    this.templates.set('cta', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content cta-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if body}}
          <p class="cta-message animate-fadeIn delay-200">{{body}}</p>
          {{/if}}
          {{#if actionText}}
          <div class="cta-button animate-bounceIn delay-400">{{actionText}}</div>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));

    // Thank you
    this.templates.set('thank-you', this.handlebars.compile(`
      <section class="{{classes}}" data-slide-index="{{slideIndex}}" style="{{styles}}">
        <div class="slide-content thank-you-content">
          <h2 class="title animate-fadeIn">{{title}}</h2>
          {{#if subtitle}}
          <p class="subtitle animate-fadeIn delay-300">{{subtitle}}</p>
          {{/if}}
          {{#if contact}}
          <div class="contact-info animate-fadeIn delay-500">
            {{contact}}
          </div>
          {{/if}}
        </div>
        {{> speakerNotes}}
      </section>
    `));
  }

  /**
   * Render fallback for unknown slide types.
   */
  private renderFallback(slide: Slide): string {
    return `
      <section class="slide slide-${slide.type}" data-slide-index="${slide.index}">
        <div class="slide-content">
          ${slide.data.title ? `<h2 class="title">${slide.data.title}</h2>` : ''}
          ${slide.data.body ? `<p class="body">${slide.data.body}</p>` : ''}
          ${slide.data.bullets ? `<ul>${slide.data.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
        </div>
      </section>
    `;
  }

  /**
   * Convert camelCase to kebab-case.
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
