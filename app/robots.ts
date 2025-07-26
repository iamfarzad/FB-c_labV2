import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/test/', '/test-dashboard/', '/test-env/'],
    },
    sitemap: 'https://farzadbayat.com/sitemap.xml',
  }
}