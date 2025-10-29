"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { OnboardingTour } from "@/components/onboarding-tour"

const ScraperInterface = dynamic(() => import("@/components/scraper-interface").then(mod => ({ default: mod.ScraperInterface })), {
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground">Chargement...</div>
    </div>
  ),
  ssr: false
})

export default function ScraperPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
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
