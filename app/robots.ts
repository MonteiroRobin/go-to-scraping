import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/scraper/'],
    },
    sitemap: 'https://go-to-scraping.vercel.app/sitemap.xml',
  }
}
