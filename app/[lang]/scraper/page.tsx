"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import type { Locale } from "@/lib/i18n"
import { OnboardingTour } from "@/components/onboarding-tour"

const ScraperInterface = dynamic(() => import("@/components/scraper-interface").then(mod => ({ default: mod.ScraperInterface })), {
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Loading interface...</div>
    </div>
  ),
  ssr: false
})

interface PageProps {
  params: {
    lang: Locale
  }
}

export default function ScraperPage({ params }: PageProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${params.lang}/login`)
    }
  }, [user, isLoading, router, params.lang])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <OnboardingTour />
      <ScraperInterface />
    </>
  )
}
