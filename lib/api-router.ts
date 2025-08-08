/**
 * API Router - Handles routing between real and mock endpoints
 * Automatically redirects to mock endpoints when ENABLE_GEMINI_MOCKING=true
 */

export interface ApiRouteConfig {
  realEndpoint: string;
  mockEndpoint: string;
  requiresAuth?: boolean;
  requiresApiKey?: boolean;
}

// Define API route mappings
export const API_ROUTES: Record<string, ApiRouteConfig> = {
  chat: {
    realEndpoint: '/api/chat',
    mockEndpoint: '/api/mock/chat',
    requiresApiKey: true
  },
  leadResearch: {
    realEndpoint: '/api/lead-research',
    mockEndpoint: '/api/mock/lead-research',
    requiresApiKey: true
  },
  analyzeDocument: {
    realEndpoint: '/api/analyze-document',
    mockEndpoint: '/api/mock/analyze-document',
    requiresApiKey: true
  },
  analyzeImage: {
    realEndpoint: '/api/analyze-image',
    mockEndpoint: '/api/mock/analyze-image',
    requiresApiKey: true
  },
  translate: {
    realEndpoint: '/api/translate',
    mockEndpoint: '/api/mock/translate',
    requiresApiKey: true
  }
};

/**
 * Determines if mocking is enabled based on environment variables
 */
export function isMockingEnabled(): boolean {
  return process.env.ENABLE_GEMINI_MOCKING === 'true' || 
         (process.env.NODE_ENV === 'development' && !process.env.GEMINI_API_KEY);
}

/**
 * Gets the appropriate endpoint URL based on mocking configuration
 */
export function getApiEndpoint(routeName: keyof typeof API_ROUTES): string {
  const route = API_ROUTES[routeName];
  if (!route) {
    throw new Error(`Unknown API route: ${routeName}`);
  }

  const shouldUseMock = isMockingEnabled();
  
  if (shouldUseMock) {
    console.log(`🔧 Using mock endpoint for ${routeName}: ${route.mockEndpoint}`);
    return route.mockEndpoint;
  }

  // Check if required environment variables are available
  if (route.requiresApiKey && !process.env.GEMINI_API_KEY) {
    console.warn(`⚠️ Missing GEMINI_API_KEY, falling back to mock endpoint for ${routeName}`);
    return route.mockEndpoint;
  }

  return route.realEndpoint;
}

/**
 * Client-side API caller that automatically routes to correct endpoint
 */
export async function callApi(
  routeName: keyof typeof API_ROUTES,
  options: RequestInit = {}
): Promise<Response> {
  const endpoint = getApiEndpoint(routeName);
  const baseUrl = typeof window !== 'undefined' ? '' : process.env.BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${endpoint}`;

  console.log(`📡 API call: ${routeName} -> ${endpoint}`);

  return fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Server-side helper to check if current request should use mocking
 */
export function shouldUseMockForRequest(request: Request): boolean {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if this is an API route that has mocking available
  const routeEntry = Object.entries(API_ROUTES).find(([_, config]) => 
    pathname === config.realEndpoint
  );

  if (!routeEntry) {
    return false; // Not a mockable route
  }

  const [routeName, config] = routeEntry;
  
  // Use mock if mocking is explicitly enabled
  if (isMockingEnabled()) {
    return true;
  }

  // Use mock if required API key is missing
  if (config.requiresApiKey && !process.env.GEMINI_API_KEY) {
    console.warn(`⚠️ Missing GEMINI_API_KEY for ${routeName}, should use mock`);
    return true;
  }

  return false;
}

/**
 * Middleware helper to redirect to mock endpoints
 */
export function createMockRedirectResponse(request: Request): Response | null {
  if (!shouldUseMockForRequest(request)) {
    return null;
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Find the corresponding mock endpoint
  const routeEntry = Object.entries(API_ROUTES).find(([_, config]) => 
    pathname === config.realEndpoint
  );

  if (!routeEntry) {
    return null;
  }

  const [routeName, config] = routeEntry;
  const mockUrl = new URL(config.mockEndpoint, url.origin);
  
  console.log(`🔄 Redirecting ${pathname} to ${config.mockEndpoint}`);

  // Create a new request to the mock endpoint
  return Response.redirect(mockUrl.toString(), 307); // Temporary redirect
}

/**
 * Development helper to log API routing decisions
 */
export function logApiRouting() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 API Routing Configuration:');
    console.log(`   ENABLE_GEMINI_MOCKING: ${process.env.ENABLE_GEMINI_MOCKING}`);
    console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Set' : 'Missing'}`);
    console.log(`   Mocking enabled: ${isMockingEnabled()}`);
    
    Object.entries(API_ROUTES).forEach(([routeName, config]) => {
      const endpoint = isMockingEnabled() ? config.mockEndpoint : config.realEndpoint;
      console.log(`   ${routeName}: ${endpoint}`);
    });
  }
}
