import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

import { Inter, Libre_Baskerville as V0_Font_Libre_Baskerville, IBM_Plex_Mono as V0_Font_IBM_Plex_Mono, Lora as V0_Font_Lora, DM_Sans } from 'next/font/google'

// Initialize fonts
const _libreBaskerville = V0_Font_Libre_Baskerville({ subsets: ['latin'], weight: ["400","700"] })
const _ibmPlexMono = V0_Font_IBM_Plex_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })
const _lora = V0_Font_Lora({ subsets: ['latin'], weight: ["400","500","600","700"] })

const inter = Inter({ subsets: ["latin"] })
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://gotoscraping.com'),
  title: {
    default: "Go To Scraping - Scraping de Commerces Locaux Simplifié",
    template: "%s | Go To Scraping"
  },
  description: "Scrapez les données de milliers de commerces locaux en quelques clics. Sélectionnez une zone sur la carte, récupérez instantanément les contacts et exportez en CSV ou Google Sheets. Solution de web scraping professionnelle et sans code.",
  keywords: ["web scraping", "scraping commerces locaux", "données commerces", "Google Places API", "leads B2B", "prospection commerciale", "extraction données", "scraping France", "base de données entreprises", "leads qualifiés"],
  authors: [{ name: "Go To Agency" }],
  creator: "Go To Agency",
  publisher: "Go To Scraping",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://gotoscraping.com',
    siteName: 'Go To Scraping',
    title: 'Go To Scraping - Scraping de Commerces Locaux Simplifié',
    description: 'Scrapez les données de milliers de commerces locaux en quelques clics. Exportez en CSV ou Google Sheets.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Go To Scraping - Web Scraping Simplifié',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Go To Scraping - Scraping de Commerces Locaux Simplifié',
    description: 'Scrapez les données de milliers de commerces locaux en quelques clics.',
    images: ['/og-image.png'],
    creator: '@gotoagency',
  },
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
    canonical: 'https://gotoscraping.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
