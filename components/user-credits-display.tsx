"use client"

import { useEffect, useState } from "react"
import { Coins, TrendingUp, AlertCircle, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CreditStats {
  credits_remaining: number
  credits_total: number
  plan: "free" | "starter" | "pro" | "business" | "enterprise"
  daily_usage: number
  daily_limit: number
  last_daily_reset: string
  subscription_status: string
}

export function UserCreditsDisplay() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<CreditStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    fetchCredits()

    // Refresh every 30 seconds
    const interval = setInterval(fetchCredits, 30000)
    return () => clearInterval(interval)
  }, [user])

  const fetchCredits = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/credits/stats")
      if (response.ok) {
        const data = await response.json()
        setCredits(data)
      }
    } catch (error) {
      console.error("Error fetching credits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || isLoading) {
    return null
  }

  if (!credits) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
        <Coins className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const percentageRemaining = (credits.credits_remaining / credits.credits_total) * 100
  const percentageDailyUsed = (credits.daily_usage / credits.daily_limit) * 100

  // Color based on credits remaining
  const getCreditsColor = () => {
    if (percentageRemaining > 50) return "text-green-600 dark:text-green-400"
    if (percentageRemaining > 20) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getPlanBadge = () => {
    const colors = {
      free: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      starter: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      pro: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      business: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      enterprise: "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 dark:from-yellow-900 dark:to-orange-900 dark:text-yellow-200",
    }

    return (
      <Badge variant="outline" className={`text-xs font-semibold ${colors[credits.plan] || colors.free}`}>
        {credits.plan === "enterprise" && <Sparkles className="w-3 h-3 mr-1" />}
        {credits.plan.toUpperCase()}
      </Badge>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors border border-border"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Coins className={`w-4 h-4 ${getCreditsColor()}`} />
          <span className={`text-sm font-semibold ${getCreditsColor()}`}>
            {credits.credits_remaining.toLocaleString()}
          </span>
          {percentageRemaining < 20 && (
            <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Vos crédits</h3>
            </div>
            {getPlanBadge()}
          </div>

          {/* Credits remaining */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Crédits restants</span>
              <span className={`font-bold text-lg ${getCreditsColor()}`}>
                {credits.credits_remaining.toLocaleString()} / {credits.credits_total.toLocaleString()}
              </span>
            </div>
            <Progress value={percentageRemaining} className="h-2" />
            {percentageRemaining < 20 && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Vos crédits sont presque épuisés !
              </p>
            )}
          </div>

          {/* Daily usage */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Usage aujourd'hui</span>
              <span className="font-semibold text-foreground">
                {credits.daily_usage.toLocaleString()} / {credits.daily_limit.toLocaleString()}
              </span>
            </div>
            <Progress value={percentageDailyUsed} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              Limite journalière : {credits.daily_limit.toLocaleString()} crédits
            </p>
          </div>

          {/* Quick info */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cache frais</span>
              <span className="font-medium text-green-600 dark:text-green-400">1 crédit</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cache périmé</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">5 crédits</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Nouveau scraping</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">50 crédits</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-2 pt-2">
            <Link href="/pricing" className="flex-1">
              <Button variant="default" className="w-full" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Recharger
              </Button>
            </Link>
            <Link href="/account/transactions" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                Historique
              </Button>
            </Link>
          </div>

          {/* Upgrade message for free users */}
          {credits.plan === "free" && percentageRemaining < 50 && (
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <p className="text-xs text-foreground font-medium mb-2">
                💡 Passez au plan Starter !
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                2,500 crédits/mois pour seulement 29€
              </p>
              <Link href="/pricing">
                <Button variant="default" size="sm" className="w-full">
                  Voir les plans
                </Button>
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
