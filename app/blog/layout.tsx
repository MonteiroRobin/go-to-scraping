import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog Web Scraping & Automatisation",
  description: "Guides complets, tutoriels et insights sur le web scraping, l'extraction de données, la prospection commerciale automatisée et les meilleures pratiques SEO. Articles experts pour maîtriser le scraping de commerces locaux.",
  keywords: ["blog web scraping", "tutoriel scraping", "guide extraction données", "prospection automatique", "RGPD scraping", "Google Places API", "leads B2B", "automatisation marketing"],
  openGraph: {
    title: "Blog Web Scraping & Automatisation | Go To Scraping",
    description: "Guides complets et tutoriels sur le web scraping et l'automatisation de la prospection commerciale.",
    type: "website",
  },
  alternates: {
    canonical: 'https://gotoscraping.com/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
