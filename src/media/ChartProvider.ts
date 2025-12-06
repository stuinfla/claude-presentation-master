/**
 * Chart Provider - Pluggable Chart Generation
 *
 * Provides multiple strategies for creating charts:
 * - ChartJS: Embedded in HTML (no API needed)
 * - QuickChart: Remote rendering (no API key needed)
 * - Mermaid: Diagrams and flowcharts (no API needed)
 */

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polarArea'
  | 'scatter'
  | 'bubble';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartRequest {
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

export interface ChartResult {
  /** HTML for embedding (Chart.js canvas) */
  html?: string;
  /** Image URL for static contexts (PPTX) */
  imageUrl?: string;
  /** Base64 data URI */
  dataUri?: string;
  /** Chart title for accessibility */
  title: string;
}

export interface ChartProvider {
  /** Provider name */
  name: string;
  /** Check if provider is available */
  isAvailable(): Promise<boolean>;
  /** Generate a chart */
  generateChart(request: ChartRequest): Promise<ChartResult>;
}

// Color palettes
const PALETTES = {
  default: [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'
  ],
  professional: [
    'rgba(44, 62, 80, 0.8)',
    'rgba(52, 73, 94, 0.8)',
    'rgba(127, 140, 141, 0.8)',
    'rgba(149, 165, 166, 0.8)',
    'rgba(189, 195, 199, 0.8)',
    'rgba(236, 240, 241, 0.8)'
  ],
  vibrant: [
    'rgba(231, 76, 60, 0.8)',
    'rgba(46, 204, 113, 0.8)',
    'rgba(52, 152, 219, 0.8)',
    'rgba(155, 89, 182, 0.8)',
    'rgba(241, 196, 15, 0.8)',
    'rgba(230, 126, 34, 0.8)'
  ],
  monochrome: [
    'rgba(0, 0, 0, 0.9)',
    'rgba(0, 0, 0, 0.7)',
    'rgba(0, 0, 0, 0.5)',
    'rgba(0, 0, 0, 0.3)',
    'rgba(0, 0, 0, 0.15)',
    'rgba(0, 0, 0, 0.05)'
  ]
};

/**
 * Chart.js Provider - Generates embedded Chart.js HTML
 * No API needed - runs in browser
 */
export class ChartJsProvider implements ChartProvider {
  name = 'chartjs';

  async isAvailable(): Promise<boolean> {
    return true; // Always available for HTML output
  }

  async generateChart(request: ChartRequest): Promise<ChartResult> {
    const chartId = `chart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const width = request.width ?? 600;
    const height = request.height ?? 400;
    const palette = PALETTES[request.palette ?? 'default'];

    // Apply palette to datasets that don't have colors
    const datasets = request.data.datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? palette[i % palette.length],
      borderColor: ds.borderColor ?? palette[i % palette.length]?.replace('0.8', '1'),
      borderWidth: ds.borderWidth ?? 2
    }));

    const config = {
      type: request.type,
      data: {
        labels: request.data.labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: request.animated !== false ? {} : false,
        plugins: {
          title: {
            display: !!request.title,
            text: request.title ?? '',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: request.showLegend !== false,
            position: 'bottom'
          }
        }
      }
    };

    const html = `
      <div class="chart-container" style="width: ${width}px; height: ${height}px;">
        <canvas id="${chartId}"></canvas>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${chartId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(config)});
        })();
      </script>
    `;

    return {
      html,
      title: request.title ?? 'Chart'
    };
  }
}

/**
 * QuickChart Provider - Uses quickchart.io for image generation
 * No API key needed - free service
 */
export class QuickChartProvider implements ChartProvider {
  name = 'quickchart';
  private baseUrl = 'https://quickchart.io/chart';

  async isAvailable(): Promise<boolean> {
    return true; // Free service, always available
  }

  async generateChart(request: ChartRequest): Promise<ChartResult> {
    const width = request.width ?? 600;
    const height = request.height ?? 400;
    const palette = PALETTES[request.palette ?? 'default'];

    // Apply palette to datasets
    const datasets = request.data.datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? palette[i % palette.length],
      borderColor: ds.borderColor ?? palette[i % palette.length]?.replace('0.8', '1')
    }));

    const config = {
      type: request.type,
      data: {
        labels: request.data.labels,
        datasets
      },
      options: {
        plugins: {
          title: {
            display: !!request.title,
            text: request.title
          },
          legend: {
            display: request.showLegend !== false
          }
        }
      }
    };

    const chartConfig = encodeURIComponent(JSON.stringify(config));
    const imageUrl = `${this.baseUrl}?c=${chartConfig}&w=${width}&h=${height}&bkg=white`;

    return {
      imageUrl,
      title: request.title ?? 'Chart'
    };
  }
}

/**
 * Mermaid Provider - Generates diagrams using Mermaid.js
 * No API needed - renders in browser
 */
export class MermaidProvider implements ChartProvider {
  name = 'mermaid';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateChart(request: ChartRequest): Promise<ChartResult> {
    // Mermaid doesn't use the standard chart format
    // This is a placeholder for flowcharts, sequence diagrams, etc.
    throw new Error('Use generateDiagram() for Mermaid diagrams');
  }

  /**
   * Generate a Mermaid diagram
   */
  async generateDiagram(definition: string, title?: string): Promise<ChartResult> {
    const diagramId = `mermaid-${Date.now()}`;

    const html = `
      <div class="mermaid-container">
        <pre class="mermaid" id="${diagramId}">
${definition}
        </pre>
      </div>
      <script>
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
      </script>
    `;

    return {
      html,
      title: title ?? 'Diagram'
    };
  }

  /**
   * Generate flowchart from steps
   */
  generateFlowchart(steps: { id: string; label: string; next?: string[] }[]): string {
    const lines = ['graph TD'];

    for (const step of steps) {
      if (step.next) {
        for (const nextId of step.next) {
          lines.push(`    ${step.id}["${step.label}"] --> ${nextId}`);
        }
      } else {
        lines.push(`    ${step.id}["${step.label}"]`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate timeline from events
   */
  generateTimeline(events: { date: string; title: string }[]): string {
    const lines = ['timeline'];

    for (const event of events) {
      lines.push(`    ${event.date} : ${event.title}`);
    }

    return lines.join('\n');
  }
}

/**
 * Composite Chart Provider
 */
export class CompositeChartProvider implements ChartProvider {
  name = 'composite';
  private htmlProvider: ChartJsProvider;
  private imageProvider: QuickChartProvider;
  private mermaidProvider: MermaidProvider;

  constructor() {
    this.htmlProvider = new ChartJsProvider();
    this.imageProvider = new QuickChartProvider();
    this.mermaidProvider = new MermaidProvider();
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateChart(request: ChartRequest): Promise<ChartResult> {
    // Generate both HTML and image URL
    const [htmlResult, imageResult] = await Promise.all([
      this.htmlProvider.generateChart(request),
      this.imageProvider.generateChart(request)
    ]);

    const result: ChartResult = {
      title: request.title ?? 'Chart'
    };
    if (htmlResult.html) result.html = htmlResult.html;
    if (imageResult.imageUrl) result.imageUrl = imageResult.imageUrl;
    return result;
  }

  async generateDiagram(definition: string, title?: string): Promise<ChartResult> {
    return this.mermaidProvider.generateDiagram(definition, title);
  }

  generateFlowchart(steps: { id: string; label: string; next?: string[] }[]): string {
    return this.mermaidProvider.generateFlowchart(steps);
  }

  generateTimeline(events: { date: string; title: string }[]): string {
    return this.mermaidProvider.generateTimeline(events);
  }
}

/**
 * Create default chart provider
 */
export function createDefaultChartProvider(): CompositeChartProvider {
  return new CompositeChartProvider();
}
