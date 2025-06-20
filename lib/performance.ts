/**
 * Performance optimization utilities for the application
 */

/**
 * Preloads critical resources to improve loading performance
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  const criticalResources: string[] = [
    // Add paths to critical resources (fonts, above-the-fold images, etc.)
    // Add your critical resources here when needed
  ]

  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource
    link.as = resource.endsWith('.woff2') ? 'font' : 'image'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

/**
 * Initializes performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Log performance metrics
  window.addEventListener('load', () => {
    // Use the Performance API to gather metrics
    setTimeout(() => {
      const timing = performance.timing
      const metrics = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        pageLoad: timing.loadEventStart - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventStart - timing.navigationStart,
      }

      console.log('Performance Metrics:', metrics)

      // Here you could send these metrics to your analytics service
      // sendToAnalytics(metrics)
    }, 0)
  })

  // Track largest contentful paint (LCP)
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { element?: Element }

    console.log('LCP:', lastEntry.startTime)
    console.log('LCP Element:', lastEntry.element?.tagName, lastEntry.element?.className)

    // Here you could send LCP to your analytics service
    // sendToAnalytics({ type: 'LCP', value: lastEntry.startTime })
  })

  observer.observe({ type: 'largest-contentful-paint', buffered: true })
}

/**
 * Optimizes images by adding loading="lazy" and other attributes
 * @param element - The parent element containing images
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
 * Checks if an element is in the viewport
 */
function isInViewport(element: HTMLElement) {
  if (typeof window === 'undefined') return false

  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 1.5 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
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

  // Cleanup function
  return () => {
    observer.disconnect()
  }
}

export type { ReportCallback as PerformanceEntry } from 'web-vitals'
