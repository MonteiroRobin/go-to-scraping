import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "../globals.css"

import { ThemeProvider, ThemeScriptTag } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { getDictionary } from "@/lib/dictionaries"
import type { Locale } from "@/lib/i18n"
import { Toaster } from "@/components/ui/sonner"

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
})

interface LayoutProps {
  children: React.ReactNode
  params: {
    lang: Locale
  }
}

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
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
      canonical: `https://localscraper.com/${params.lang}`,
      languages: {
        'en': 'https://localscraper.com/en',
        'fr': 'https://localscraper.com/fr',
      },
    },
    openGraph: {
      type: 'website',
      locale: params.lang === 'fr' ? 'fr_FR' : 'en_US',
      url: `https://localscraper.com/${params.lang}`,
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: 'LocalScraper',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
    },
  }
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }]
}

export default function RootLayout({
  children,
  params,
}: LayoutProps) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
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
