/**
 * Advanced performance optimization utilities for the application
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

// Define MemoryInfo interface
interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// Performance metrics interface
interface PerformanceMetrics {
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  fcp: number | null // First Contentful Paint
  ttfb: number | null // Time to First Byte
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  memoryUsage?: MemoryInfo
  connectionType?: string
}

// Global performance state
const performanceMetrics: PerformanceMetrics = {
  lcp: null,
  fid: null,
  cls: null,
  fcp: null,
  ttfb: null,
  navigationStart: 0,
  domContentLoaded: 0,
  loadComplete: 0,
}

// Performance observer for monitoring
let performanceObserver: PerformanceObserver | null = null

/**
 * Preloads critical resources to improve loading performance
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  const criticalResources: Array<{url: string, as: string, type?: string}> = [
    // Critical fonts - TODO: Add these font files to /public/fonts/
    // { url: '/fonts/rajdhani-variable.woff2', as: 'font', type: 'font/woff2' },
    // { url: '/fonts/space-mono-regular.woff2', as: 'font', type: 'font/woff2' },
    // { url: '/fonts/montserrat-variable.woff2', as: 'font', type: 'font/woff2' },
    
    // Critical images
    { url: '/farzad-bayat_profile_2AI.JPG', as: 'image' },
    
    // Critical scripts
    // { url: '/scripts/critical.js', as: 'script' },
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.url
    link.as = resource.as
    if (resource.type) link.type = resource.type
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

/**
 * Initialize Core Web Vitals monitoring
 */
export function initCoreWebVitals() {
  if (typeof window === 'undefined') return

  // Core Web Vitals monitoring
  onCLS((metric: Metric) => {
    performanceMetrics.cls = metric.value
    reportMetric('CLS', metric)
  })

  onFID((metric: Metric) => {
    performanceMetrics.fid = metric.value
    reportMetric('FID', metric)
  })

  onFCP((metric: Metric) => {
    performanceMetrics.fcp = metric.value
    reportMetric('FCP', metric)
  })

  onLCP((metric: Metric) => {
    performanceMetrics.lcp = metric.value
    reportMetric('LCP', metric)
  })

  onTTFB((metric: Metric) => {
    performanceMetrics.ttfb = metric.value
    reportMetric('TTFB', metric)
  })
}

/**
 * Report performance metrics
 */
function reportMetric(name: string, metric: Metric) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${name}:`, {
      value: metric.value,
      rating: getMetricRating(name, metric.value),
      entries: metric.entries,
    })
  }

  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    // Example: Google Analytics 4
    // gtag('event', 'web_vitals', {
    //   event_category: 'Web Vitals',
    //   event_label: name,
    //   value: Math.round(name === 'CLS' ? metric.value * 1000 : metric.value),
    //   custom_map: { metric_id: name }
    // })

    // Example: Custom analytics endpoint
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name,
    //     value: metric.value,
    //     rating: getMetricRating(name, metric.value),
    //     url: window.location.pathname,
    //     timestamp: Date.now(),
    //   })
    // }).catch(console.error)
  }
}

/**
 * Get metric rating based on thresholds
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Monitor resource loading performance
 */
export function initResourceMonitoring() {
  if (typeof window === 'undefined') return

  performanceObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // Monitor navigation timing
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming
        performanceMetrics.navigationStart = navEntry.fetchStart
        performanceMetrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart
        performanceMetrics.loadComplete = navEntry.loadEventEnd - navEntry.fetchStart
      }

      // Monitor resource loading
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming
        const duration = resourceEntry.responseEnd - resourceEntry.requestStart

        // Log slow resources in development
        if (process.env.NODE_ENV === 'development' && duration > 1000) {
          console.warn('⚠️ Slow resource detected:', {
            name: resourceEntry.name,
            duration: `${duration.toFixed(2)}ms`,
            size: resourceEntry.transferSize,
            type: resourceEntry.initiatorType,
          })
        }
      }

      // Monitor layout shifts
      if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
        const layoutShiftEntry = entry as any
        if (process.env.NODE_ENV === 'development' && layoutShiftEntry.value > 0.1) {
          console.warn('⚠️ Layout shift detected:', {
            value: layoutShiftEntry.value,
            sources: layoutShiftEntry.sources,
          })
        }
      }
    })
  })

  // Observe all entry types
  try {
    performanceObserver.observe({ 
      entryTypes: ['navigation', 'resource', 'layout-shift', 'largest-contentful-paint'] 
    })
  } catch (e) {
    // Fallback for older browsers
    console.warn('Performance Observer not fully supported')
  }
}

/**
 * Get memory usage information
 */
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof window === 'undefined') return null
  
  const memory = (performance as any).memory
  if (memory) {
    performanceMetrics.memoryUsage = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    }
    return performanceMetrics.memoryUsage
  }
  return null
}

/**
 * Get network connection information
 */
export function getConnectionInfo(): string | null {
  if (typeof window === 'undefined') return null
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  if (connection) {
    const connectionType = connection.effectiveType || connection.type || 'unknown'
    performanceMetrics.connectionType = connectionType
    return connectionType
  }
  return null
}

/**
 * Check if device is low-end based on hardware indicators
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check memory
  const memory = getMemoryUsage()
  if (memory && memory.jsHeapSizeLimit < 1073741824) { // Less than 1GB
    return true
  }

  // Check CPU cores
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true
  }

  // Check connection speed
  const connection = getConnectionInfo()
  if (connection && ['slow-2g', '2g'].includes(connection)) {
    return true
  }

  return false
}

/**
 * Progressive image loading with intersection observer
 */
export function initProgressiveImageLoading() {
  if (typeof window === 'undefined') return

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        
        // Load high-res image
        if (img.dataset.src) {
          const tempImg = new Image()
          tempImg.onload = () => {
            img.src = tempImg.src
            img.classList.remove('blur-sm')
            img.classList.add('animate-fade-in-up')
          }
          tempImg.src = img.dataset.src
          imageObserver.unobserve(img)
        }
      }
    })
  }, {
    rootMargin: '50px',
    threshold: 0.1,
  })

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img)
  })

  return () => imageObserver.disconnect()
}

/**
 * Optimizes images by adding loading="lazy" and other attributes
 */
export function optimizeImages(element: HTMLElement | Document = document) {
  if (typeof window === 'undefined') return

  const images = element.querySelectorAll<HTMLImageElement>('img:not([loading])')

  images.forEach(img => {
    // Skip if already handled
    if (img.hasAttribute('data-optimized')) return

    // Add loading="lazy" for below-the-fold images
    if (!isInViewport(img)) {
      img.loading = 'lazy'
      img.decoding = 'async'
    }

    // Add width and height to prevent layout shifts
    if (!img.width || !img.height) {
      const width = img.naturalWidth || img.offsetWidth
      const height = img.naturalHeight || img.offsetHeight

      if (width && height) {
        img.width = width
        img.height = height
      } else {
        // If we can't get dimensions, use a placeholder aspect ratio
        img.style.aspectRatio = '16/9'
      }
    }

    // Mark as optimized
    img.setAttribute('data-optimized', 'true')

    // Handle loading state
    if (!img.complete) {
      img.style.opacity = '0'
      img.style.transition = 'opacity 0.3s ease-in-out'
      img.onload = () => {
        img.style.opacity = '1'
      }
    }
  })
}

/**
 * Check if element is in viewport
 */
function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Track basic navigation timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navTiming) {
        console.log('📈 Navigation Timing:', {
          domContentLoaded: `${(navTiming.domContentLoadedEventEnd - navTiming.fetchStart).toFixed(2)}ms`,
          loadComplete: `${(navTiming.loadEventEnd - navTiming.fetchStart).toFixed(2)}ms`,
          firstByte: `${(navTiming.responseStart - navTiming.fetchStart).toFixed(2)}ms`,
        })
      }
    }, 0)
  })

  // Initialize Core Web Vitals
  initCoreWebVitals()

  // Initialize resource monitoring
  initResourceMonitoring()

  // Track memory usage periodically
  if ((performance as any).memory) {
    setInterval(() => {
      getMemoryUsage()
    }, 30000) // Every 30 seconds
  }
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...performanceMetrics }
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(): string {
  const metrics = getPerformanceMetrics()
  const memory = getMemoryUsage()
  const connection = getConnectionInfo()

  return `
🚀 Performance Report
━━━━━━━━━━━━━━━━━━━━

Core Web Vitals:
• LCP: ${metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'Not measured'} ${metrics.lcp ? `(${getMetricRating('LCP', metrics.lcp)})` : ''}
• FID: ${metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'Not measured'} ${metrics.fid ? `(${getMetricRating('FID', metrics.fid)})` : ''}
• CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'Not measured'} ${metrics.cls ? `(${getMetricRating('CLS', metrics.cls)})` : ''}

Load Times:
• First Contentful Paint: ${metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'Not measured'}
• Time to First Byte: ${metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'Not measured'}
• DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms
• Load Complete: ${metrics.loadComplete.toFixed(2)}ms

System Info:
• Memory Used: ${memory ? `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'Unknown'}
• Memory Limit: ${memory ? `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB` : 'Unknown'}
• Connection: ${connection || 'Unknown'}
• CPU Cores: ${navigator.hardwareConcurrency || 'Unknown'}
• Low-end Device: ${isLowEndDevice() ? 'Yes' : 'No'}
  `
}

/**
 * Initializes all performance optimizations
 */
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return

  // Preload critical resources
  preloadCriticalResources()

  // Initialize performance monitoring
  initPerformanceMonitoring()

  // Initialize progressive image loading
  const imageCleanup = initProgressiveImageLoading()

  // Optimize images on initial load
  optimizeImages()

  // Optimize images that are lazy loaded later
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          optimizeImages(node as HTMLElement)
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Log performance report in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      console.log(generatePerformanceReport())
    }, 5000) // After 5 seconds
  }

  // Cleanup function
  return () => {
    observer.disconnect()
    imageCleanup?.()
    performanceObserver?.disconnect()
  }
}

export type { ReportCallback as PerformanceEntry } from 'web-vitals'
