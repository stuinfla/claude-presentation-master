/**
 * Image Provider - Pluggable Image Generation
 *
 * Provides multiple strategies for obtaining images:
 * - Local: User-provided paths/URLs
 * - Placeholder: Uses picsum.photos (no API key)
 * - Unsplash: Free API (50 req/hour, optional key)
 * - AI: Claude Code integration (when available)
 */

export interface ImageRequest {
  /** Description of desired image */
  description: string;
  /** Desired width */
  width?: number;
  /** Desired height */
  height?: number;
  /** Style hints (e.g., 'professional', 'minimal', 'vibrant') */
  style?: string;
  /** Category for filtering (e.g., 'business', 'technology', 'nature') */
  category?: string;
}

export interface ImageResult {
  /** URL or data URI of the image */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Attribution if required */
  attribution?: string;
  /** Whether this is a placeholder */
  isPlaceholder?: boolean;
}

export interface ImageProvider {
  /** Provider name */
  name: string;
  /** Check if provider is available */
  isAvailable(): Promise<boolean>;
  /** Get an image matching the request */
  getImage(request: ImageRequest): Promise<ImageResult>;
  /** Get multiple images */
  getImages(requests: ImageRequest[]): Promise<ImageResult[]>;
}

/**
 * Local Image Provider - Uses user-provided images
 */
export class LocalImageProvider implements ImageProvider {
  name = 'local';
  private images: Map<string, string>;

  constructor(imageMap?: Record<string, string>) {
    this.images = new Map(Object.entries(imageMap ?? {}));
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getImage(request: ImageRequest): Promise<ImageResult> {
    // Check if we have a matching image by description
    const key = request.description.toLowerCase();

    for (const [name, src] of this.images) {
      if (key.includes(name.toLowerCase()) || name.toLowerCase().includes(key)) {
        return {
          src,
          alt: request.description
        };
      }
    }

    // Return placeholder if no match
    return {
      src: this.getPlaceholderUrl(request),
      alt: request.description,
      isPlaceholder: true
    };
  }

  async getImages(requests: ImageRequest[]): Promise<ImageResult[]> {
    return Promise.all(requests.map(r => this.getImage(r)));
  }

  private getPlaceholderUrl(request: ImageRequest): string {
    const width = request.width ?? 800;
    const height = request.height ?? 600;
    return `https://picsum.photos/${width}/${height}`;
  }

  /** Register an image for later use */
  registerImage(name: string, src: string): void {
    this.images.set(name, src);
  }
}

/**
 * Placeholder Image Provider - Uses picsum.photos (no API key needed)
 */
export class PlaceholderImageProvider implements ImageProvider {
  name = 'placeholder';

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async getImage(request: ImageRequest): Promise<ImageResult> {
    const width = request.width ?? 800;
    const height = request.height ?? 600;

    // Use grayscale for professional look
    const grayscale = request.style === 'professional' ? '/grayscale' : '';

    // Generate a seed from description for consistency
    const seed = this.hashString(request.description);

    return {
      src: `https://picsum.photos/seed/${seed}/${width}/${height}${grayscale}`,
      alt: request.description,
      attribution: 'Photo from Picsum.photos',
      isPlaceholder: true
    };
  }

  async getImages(requests: ImageRequest[]): Promise<ImageResult[]> {
    return Promise.all(requests.map(r => this.getImage(r)));
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

/**
 * Unsplash Image Provider - Uses Unsplash API (free tier: 50 req/hour)
 */
export class UnsplashImageProvider implements ImageProvider {
  name = 'unsplash';
  private accessKey?: string;
  private baseUrl = 'https://api.unsplash.com';

  constructor(accessKey?: string) {
    const key = accessKey ?? process.env['UNSPLASH_ACCESS_KEY'];
    if (key) {
      this.accessKey = key;
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!this.accessKey;
  }

  async getImage(request: ImageRequest): Promise<ImageResult> {
    if (!this.accessKey) {
      // Fall back to Unsplash Source (simpler, no auth needed but less control)
      return this.getSourceImage(request);
    }

    try {
      const query = encodeURIComponent(request.description);
      const response = await fetch(
        `${this.baseUrl}/photos/random?query=${query}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json() as {
        urls: { regular: string };
        alt_description?: string;
        user: { name: string; links: { html: string } };
      };

      return {
        src: data.urls.regular,
        alt: data.alt_description ?? request.description,
        attribution: `Photo by ${data.user.name} on Unsplash`
      };
    } catch {
      return this.getSourceImage(request);
    }
  }

  async getImages(requests: ImageRequest[]): Promise<ImageResult[]> {
    // Rate limit: process sequentially with delay
    const results: ImageResult[] = [];
    for (const request of requests) {
      results.push(await this.getImage(request));
      await this.delay(100); // Small delay to respect rate limits
    }
    return results;
  }

  private async getSourceImage(request: ImageRequest): Promise<ImageResult> {
    // Unsplash Source - simpler, no API key needed
    const width = request.width ?? 800;
    const height = request.height ?? 600;
    const query = encodeURIComponent(request.description);

    return {
      src: `https://source.unsplash.com/${width}x${height}/?${query}`,
      alt: request.description,
      attribution: 'Photo from Unsplash'
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Composite Image Provider - Tries providers in order
 */
export class CompositeImageProvider implements ImageProvider {
  name = 'composite';
  private providers: ImageProvider[];

  constructor(providers: ImageProvider[]) {
    this.providers = providers;
  }

  async isAvailable(): Promise<boolean> {
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        return true;
      }
    }
    return false;
  }

  async getImage(request: ImageRequest): Promise<ImageResult> {
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        try {
          return await provider.getImage(request);
        } catch {
          continue; // Try next provider
        }
      }
    }

    // Fallback to placeholder
    const placeholder = new PlaceholderImageProvider();
    return placeholder.getImage(request);
  }

  async getImages(requests: ImageRequest[]): Promise<ImageResult[]> {
    return Promise.all(requests.map(r => this.getImage(r)));
  }
}

/**
 * Create default image provider chain
 */
export function createDefaultImageProvider(options?: {
  localImages?: Record<string, string>;
  unsplashKey?: string;
}): ImageProvider {
  const providers: ImageProvider[] = [];

  // Local images first (if any provided)
  if (options?.localImages) {
    providers.push(new LocalImageProvider(options.localImages));
  }

  // Unsplash (if key available)
  if (options?.unsplashKey || process.env['UNSPLASH_ACCESS_KEY']) {
    providers.push(new UnsplashImageProvider(options?.unsplashKey));
  }

  // Placeholder as fallback
  providers.push(new PlaceholderImageProvider());

  return new CompositeImageProvider(providers);
}
