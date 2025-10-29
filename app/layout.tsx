import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { ThemeProvider, ThemeScriptTag } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/sonner"

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: "LocalScraper - Trouvez des entreprises locales en France",
  description: "Extrayez rapidement des données sur les commerces et services près de chez vous. Gratuit, rapide et open source.",
  keywords: "scraper, données locales, entreprises, commerces, France, extraction de données, OpenStreetMap",
  authors: [{ name: "Go To Agency" }],
  creator: "Go To Agency",
  publisher: "Go To Agency",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://go-to-scraping.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://go-to-scraping.vercel.app',
    title: "LocalScraper - Trouvez des entreprises locales en France",
    description: "Extrayez rapidement des données sur les commerces et services près de chez vous.",
    siteName: 'LocalScraper',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LocalScraper - Trouvez des entreprises locales en France",
    description: "Extrayez rapidement des données sur les commerces et services près de chez vous.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScriptTag />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://overpass-api.de" />
        <link rel="dns-prefetch" href="https://overpass.kumi.systems" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
      </body>
    </html>
  )
}
