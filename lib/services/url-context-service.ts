import { JSDOM } from 'jsdom';

export interface URLContextResult {
  url: string;
  title?: string;
  description?: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    canonicalUrl?: string;
  };
  extractedText: string;
  wordCount: number;
  readingTime: number;
  error?: string;
}

export class URLContextService {
  private static readonly MAX_CONTENT_LENGTH = 50000; // Limit content size
  private static readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private static readonly USER_AGENT = 'Mozilla/5.0 (compatible; F.B/c AI Bot/1.0; +https://talktoeve.com)';

  /**
   * Analyze a URL and extract comprehensive context information
   */
  static async analyzeURL(url: string): Promise<URLContextResult> {
    try {
      // Validate URL
      const validatedUrl = this.validateAndNormalizeURL(url);
      
      // Fetch the webpage with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      const response = await fetch(validatedUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Content-type validation
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error('Unsupported content type: ' + contentType);
      }

      // Stream-based reading with 5MB limit
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let html = '';
      const maxBytes = 5_000_000; // 5MB limit
      let totalBytes = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          totalBytes += value.length;
          if (totalBytes > maxBytes) {
            reader.releaseLock();
            throw new Error('Content too large (exceeds 5MB limit)');
          }
          
          html += decoder.decode(value, { stream: true });
        }
      } finally {
        reader.releaseLock();
      }
      
      // Parse HTML with JSDOM
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Extract basic information
      const title = this.extractTitle(document);
      const description = this.extractDescription(document);
      const metadata = this.extractMetadata(document);
      const extractedText = this.extractMainContent(document);
      
      // Calculate reading metrics
      const wordCount = this.countWords(extractedText);
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/minute
      
      // Limit content size
      const limitedContent = extractedText.length > this.MAX_CONTENT_LENGTH 
        ? extractedText.substring(0, this.MAX_CONTENT_LENGTH) + '...'
        : extractedText;

      return {
        url: validatedUrl,
        title,
        description,
        content: limitedContent,
        metadata,
        extractedText: limitedContent,
        wordCount,
        readingTime,
      };

    } catch (error: any) {
      console.error('URL Context Analysis Error:', error);
      
      return {
        url,
        content: '',
        metadata: {},
        extractedText: '',
        wordCount: 0,
        readingTime: 0,
        error: error.message || 'Failed to analyze URL',
      };
    }
  }

  /**
   * Validate and normalize URL
   */
  private static validateAndNormalizeURL(url: string): string {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      
      // Security check - only allow HTTPS
      if (urlObj.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are supported for security');
      }
      
      return urlObj.toString();
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  /**
   * Extract page title
   */
  private static extractTitle(document: Document): string {
    // Try multiple selectors in order of preference
    const titleSelectors = [
      'title',
      'h1',
      '[property="og:title"]',
      '[name="twitter:title"]',
      '.title',
      '#title'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const title = element.getAttribute('content') || element.textContent;
        if (title && title.trim()) {
          return title.trim();
        }
      }
    }

    return 'Untitled';
  }

  /**
   * Extract page description
   */
  private static extractDescription(document: Document): string {
    // Try multiple selectors in order of preference
    const descriptionSelectors = [
      '[name="description"]',
      '[property="og:description"]',
      '[name="twitter:description"]',
      '.description',
      '.summary',
      'p'
    ];

    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const description = element.getAttribute('content') || element.textContent;
        if (description && description.trim()) {
          return description.trim().substring(0, 500); // Limit description length
        }
      }
    }

    return '';
  }

  /**
   * Extract comprehensive metadata
   */
  private static extractMetadata(document: Document): URLContextResult['metadata'] {
    const metadata: URLContextResult['metadata'] = {};

    // Helper function to get attribute content
    const getContent = (selector: string): string | undefined => {
      const element = document.querySelector(selector);
      return element?.getAttribute('content') || undefined;
    };

    const getHref = (selector: string): string | undefined => {
      const element = document.querySelector(selector);
      return element?.getAttribute('href') || undefined;
    };

    // Open Graph metadata
    metadata.ogTitle = getContent('[property="og:title"]');
    metadata.ogDescription = getContent('[property="og:description"]');
    metadata.ogImage = getContent('[property="og:image"]');

    // Twitter Card metadata
    metadata.twitterTitle = getContent('[name="twitter:title"]');
    metadata.twitterDescription = getContent('[name="twitter:description"]');

    // Standard metadata
    metadata.author = getContent('[name="author"]') || getContent('[property="article:author"]');
    metadata.publishDate = getContent('[name="date"]') || getContent('[property="article:published_time"]');
    metadata.canonicalUrl = getHref('[rel="canonical"]');

    // Keywords
    const keywordsContent = getContent('[name="keywords"]');
    if (keywordsContent) {
      metadata.keywords = keywordsContent.split(',').map((k: string) => k.trim()).filter((k: string) => k);
    }

    return metadata;
  }

  /**
   * Extract main content from the page
   */
  private static extractMainContent(document: Document): string {
    // Remove unwanted elements
    const unwantedSelectors = ['script', 'style', 'nav', 'header', 'footer', 'aside', '.advertisement', '.ads', '.social-share'];
    unwantedSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Try to find main content areas
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content',
      'body'
    ];

    let bestContent = '';
    let maxLength = 0;

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim() || '';
        if (text.length > maxLength) {
          maxLength = text.length;
          bestContent = text;
        }
      }
    }

    // Clean up the text
    return this.cleanText(bestContent);
  }

  /**
   * Clean and normalize extracted text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Analyze multiple URLs in parallel
   */
  static async analyzeMultipleURLs(urls: string[]): Promise<URLContextResult[]> {
    const promises = urls.map(url => this.analyzeURL(url));
    return Promise.all(promises);
  }

  /**
   * Extract URLs from text
   */
  static extractURLsFromText(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    return text.match(urlRegex) || [];
  }

  /**
   * Check if URL is accessible
   */
  static async isURLAccessible(url: string): Promise<boolean> {
    try {
      const validatedUrl = this.validateAndNormalizeURL(url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(validatedUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default URLContextService;
