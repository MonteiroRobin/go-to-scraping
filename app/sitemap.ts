import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gotoscraping.com'

  // Blog post slugs
  const blogPosts = [
    'introduction-web-scraping-2025',
    'google-places-api-vs-scraping',
    'automatiser-prospection-commerciale',
    'rgpd-scraping-legal',
    'scraping-pour-etudes-marche',
    'optimiser-exports-csv-google-sheets',
  ]

  // Generate blog post entries
  const blogEntries = blogPosts.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogEntries,
  ]
}
