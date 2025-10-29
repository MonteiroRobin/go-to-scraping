"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ScraperInterface } from "@/components/scraper-interface"
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

  return <ScraperInterface />
}
