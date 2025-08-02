export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  formattedUrl?: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  cacheId?: string;
  pagemap?: {
    [key: string]: any;
  };
}

export interface GoogleSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
    nextPage?: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  context: {
    title: string;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleSearchResult[];
}

export interface SearchOptions {
  num?: number; // Number of results (1-10)
  start?: number; // Starting index
  lr?: string; // Language restriction
  safe?: 'active' | 'off'; // Safe search
  dateRestrict?: string; // Date restriction (d1, w1, m1, y1, etc.)
  siteSearch?: string; // Restrict to specific site
  exactTerms?: string; // Exact terms to include
  excludeTerms?: string; // Terms to exclude
  fileType?: string; // File type restriction
  rights?: string; // Usage rights
  searchType?: 'image'; // Search type
  imgSize?: 'huge' | 'icon' | 'large' | 'medium' | 'small' | 'xlarge' | 'xxlarge';
  imgType?: 'clipart' | 'face' | 'lineart' | 'stock' | 'photo' | 'animated';
  imgColorType?: 'color' | 'gray' | 'mono' | 'trans';
  imgDominantColor?: 'black' | 'blue' | 'brown' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'white' | 'yellow';
}

export class GoogleSearchService {
  private static readonly BASE_URL = 'https://www.googleapis.com/customsearch/v1';
  private static readonly DEFAULT_NUM_RESULTS = 10;
  private static readonly MAX_RESULTS = 10;
  private static readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  /**
   * Perform a Google search using the Custom Search API
   */
  static async search(query: string, options: SearchOptions = {}): Promise<GoogleSearchResponse> {
    try {
      // Validate environment variables
      const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
      const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

      if (!apiKey) {
        throw new Error('GOOGLE_SEARCH_API_KEY environment variable is not set');
      }

      if (!searchEngineId) {
        throw new Error('GOOGLE_SEARCH_ENGINE_ID environment variable is not set');
      }

      // Validate and sanitize query
      if (!query || query.trim().length === 0) {
        throw new Error('Search query cannot be empty');
      }

      const sanitizedQuery = this.sanitizeQuery(query);

      // Build search parameters
      const searchParams = new URLSearchParams({
        key: apiKey,
        cx: searchEngineId,
        q: sanitizedQuery,
        num: Math.min(options.num || this.DEFAULT_NUM_RESULTS, this.MAX_RESULTS).toString(),
        start: (options.start || 1).toString(),
        safe: options.safe || 'active',
      });

      // Add optional parameters
      if (options.lr) searchParams.append('lr', options.lr);
      if (options.dateRestrict) searchParams.append('dateRestrict', options.dateRestrict);
      if (options.siteSearch) searchParams.append('siteSearch', options.siteSearch);
      if (options.exactTerms) searchParams.append('exactTerms', options.exactTerms);
      if (options.excludeTerms) searchParams.append('excludeTerms', options.excludeTerms);
      if (options.fileType) searchParams.append('fileType', options.fileType);
      if (options.rights) searchParams.append('rights', options.rights);
      if (options.searchType) searchParams.append('searchType', options.searchType);
      if (options.imgSize) searchParams.append('imgSize', options.imgSize);
      if (options.imgType) searchParams.append('imgType', options.imgType);
      if (options.imgColorType) searchParams.append('imgColorType', options.imgColorType);
      if (options.imgDominantColor) searchParams.append('imgDominantColor', options.imgDominantColor);

      // Make the API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(`${this.BASE_URL}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'F.B/c AI Search Bot/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Search API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: GoogleSearchResponse = await response.json();
      
      // Validate response structure
      if (!data.searchInformation) {
        throw new Error('Invalid response from Google Search API');
      }

      return data;

    } catch (error: any) {
      console.error('Google Search Error:', error);
      
      // Return empty response structure on error
      return {
        kind: 'customsearch#search',
        url: {
          type: 'application/json',
          template: '',
        },
        queries: {
          request: [{
            title: 'Google Custom Search - Error',
            totalResults: '0',
            searchTerms: query,
            count: 0,
            startIndex: 1,
            inputEncoding: 'utf8',
            outputEncoding: 'utf8',
            safe: 'active',
            cx: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
          }],
        },
        context: {
          title: 'F.B/c AI Search',
        },
        searchInformation: {
          searchTime: 0,
          formattedSearchTime: '0.00',
          totalResults: '0',
          formattedTotalResults: '0',
        },
        items: [],
      };
    }
  }

  /**
   * Search for specific information about a person or company
   */
  static async searchPerson(name: string, company?: string, additionalTerms?: string[]): Promise<GoogleSearchResponse> {
    let query = `"${name}"`;
    
    if (company) {
      query += ` "${company}"`;
    }
    
    if (additionalTerms && additionalTerms.length > 0) {
      query += ` ${additionalTerms.join(' ')}`;
    }

    // Add common professional terms
    query += ' (LinkedIn OR CEO OR founder OR executive OR manager OR director)';

    return this.search(query, {
      num: 10,
      safe: 'active',
    });
  }

  /**
   * Search for company information
   */
  static async searchCompany(companyName: string, additionalTerms?: string[]): Promise<GoogleSearchResponse> {
    let query = `"${companyName}"`;
    
    if (additionalTerms && additionalTerms.length > 0) {
      query += ` ${additionalTerms.join(' ')}`;
    }

    // Add common business terms
    query += ' (company OR business OR corporation OR startup OR enterprise)';

    return this.search(query, {
      num: 10,
      safe: 'active',
    });
  }

  /**
   * Search for industry trends and insights
   */
  static async searchIndustryTrends(industry: string, year?: number): Promise<GoogleSearchResponse> {
    let query = `"${industry}" trends insights market analysis`;
    
    if (year) {
      query += ` ${year}`;
    } else {
      query += ` 2024 2025`;
    }

    return this.search(query, {
      num: 10,
      safe: 'active',
      dateRestrict: 'y1', // Last year
    });
  }

  /**
   * Search for news about a topic
   */
  static async searchNews(topic: string, dateRestrict?: string): Promise<GoogleSearchResponse> {
    const query = `${topic} news`;

    return this.search(query, {
      num: 10,
      safe: 'active',
      dateRestrict: dateRestrict || 'm1', // Last month by default
      siteSearch: 'news.google.com OR reuters.com OR bloomberg.com OR techcrunch.com OR forbes.com',
    });
  }

  /**
   * Search within a specific website
   */
  static async searchSite(query: string, site: string): Promise<GoogleSearchResponse> {
    return this.search(query, {
      num: 10,
      safe: 'active',
      siteSearch: site,
    });
  }

  /**
   * Extract and format search results for AI consumption
   */
  static formatResultsForAI(response: GoogleSearchResponse): string {
    if (!response.items || response.items.length === 0) {
      return 'No search results found.';
    }

    const totalResults = response.searchInformation.formattedTotalResults;
    const searchTime = response.searchInformation.formattedSearchTime;
    
    let formatted = `Search Results (${totalResults} results in ${searchTime} seconds):\n\n`;

    response.items.forEach((item, index) => {
      formatted += `${index + 1}. **${item.title}**\n`;
      formatted += `   URL: ${item.link}\n`;
      formatted += `   ${item.snippet}\n\n`;
    });

    return formatted;
  }

  /**
   * Get search suggestions based on query
   */
  static generateSearchSuggestions(query: string): string[] {
    const suggestions: string[] = [];
    const baseQuery = query.toLowerCase().trim();

    // Add common modifiers
    suggestions.push(`${baseQuery} 2024`);
    suggestions.push(`${baseQuery} trends`);
    suggestions.push(`${baseQuery} news`);
    suggestions.push(`${baseQuery} analysis`);
    suggestions.push(`${baseQuery} market`);
    suggestions.push(`${baseQuery} industry`);
    suggestions.push(`${baseQuery} company`);
    suggestions.push(`${baseQuery} LinkedIn`);

    return suggestions;
  }

  /**
   * Sanitize search query to prevent injection attacks
   */
  private static sanitizeQuery(query: string): string {
    // Remove potentially harmful characters and limit length
    return query
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/[{}]/g, '') // Remove curly braces
      .replace(/[\[\]]/g, '') // Remove square brackets
      .replace(/[|\\]/g, '') // Remove pipes and backslashes
      .trim()
      .substring(0, 500); // Limit query length
  }

  /**
   * Check if Google Search API is configured
   */
  static isConfigured(): boolean {
    return !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID);
  }

  /**
   * Get API usage information
   */
  static getAPIInfo(): { configured: boolean; hasApiKey: boolean; hasEngineId: boolean } {
    return {
      configured: this.isConfigured(),
      hasApiKey: !!process.env.GOOGLE_SEARCH_API_KEY,
      hasEngineId: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
    };
  }
}

export default GoogleSearchService;
