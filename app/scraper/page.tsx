"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ScraperInterface } from "@/components/scraper-interface"
import { DatabaseTest } from "@/components/database-test"
import { SetupGuide } from "@/components/setup-guide"
import { useAuth } from "@/lib/auth-context"

export default function ScraperPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
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
    <div className="space-y-0">
      <div className="container mx-auto px-4 pt-4">
        <DatabaseTest />
      </div>
      <ScraperInterface />
      <SetupGuide />
    </div>
  )
}
