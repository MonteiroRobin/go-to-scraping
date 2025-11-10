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
    <>
      <ScraperInterface />
      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2025 Go To Scraping</span>
          <div className="flex items-center gap-4">
            <DatabaseTest />
            <span className="hidden sm:inline">Powered by Go To Agency</span>
          </div>
        </div>
      </footer>
    </>
  )
}
