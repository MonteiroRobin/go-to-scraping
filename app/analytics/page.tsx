"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Fish, TrendingUp, Target, MapPin, Sparkles, Users, Package, Anchor } from "lucide-react"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { NumberTicker } from "@/components/ui/number-ticker"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import dynamic from "next/dynamic"

const FloatingDots = dynamic(() => import("@/components/InteractiveGrid").then((mod) => ({ default: mod.FloatingDots })), {
  ssr: false,
})

interface AnalyticsStats {
  global: {
    total_users: number
    total_searches: number
    total_results: number
    total_cached: number
    avg_search_duration: number
    cities_searched: number
  }
  topCities: Array<{
    city_detected: string
    search_count: number
    total_results: number
  }>
  topBusinessTypes: Array<{
    business_type: string
    search_count: number
    total_results: number
  }>
  user: {
    totalSearches: number
    totalResults: number
    recentSearches: any[]
  } | null
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const params = new URLSearchParams()
        if (user?.id) params.append('userId', user.id)

        const response = await fetch(`/api/analytics/stats?${params}`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />

      <div className="relative max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-foreground/5 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                <ShimmerText>Analytics & Statistiques</ShimmerText>
              </h1>
              <p className="text-xs text-muted-foreground">Données en temps réel</p>
            </div>
          </div>
          <Link href="/scraper">
            <Button variant="ghost" size="sm">
              <Fish className="w-4 h-4 mr-2" />
              Retour au scraper
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Sparkles className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-4">Chargement des statistiques...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Globales */}
            <div>
              <BlurFade delay={0.1} inView>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Statistiques Globales (30 jours)
                </h2>
              </BlurFade>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BlurFade delay={0.2} inView>
                  <div className="rounded-xl border border-border/50 bg-card/40 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Utilisateurs</span>
                    </div>
                    <div className="text-3xl font-bold">
                      <NumberTicker value={stats?.global?.total_users || 0} />
                    </div>
                  </div>
                </BlurFade>

                <BlurFade delay={0.3} inView>
                  <div className="rounded-lg border border-border/50 bg-card/40 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Recherches</span>
                    </div>
                    <div className="text-3xl font-bold">
                      <NumberTicker value={stats?.global?.total_searches || 0} />
                    </div>
                  </div>
                </BlurFade>

                <BlurFade delay={0.4} inView>
                  <div className="rounded border border-border/50 bg-card/40 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Fish className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Leads pêchés</span>
                    </div>
                    <div className="text-3xl font-bold">
                      <NumberTicker value={stats?.global?.total_results || 0} />
                    </div>
                  </div>
                </BlurFade>

                <BlurFade delay={0.5} inView>
                  <div className="rounded-xl border border-border/50 bg-card/40 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Villes</span>
                    </div>
                    <div className="text-3xl font-bold">
                      <NumberTicker value={stats?.global?.cities_searched || 0} />
                    </div>
                  </div>
                </BlurFade>
              </div>
            </div>

            {/* Top Villes & Top Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Villes */}
              <BlurFade delay={0.6} inView>
                <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Top 10 Villes
                  </h3>
                  <div className="space-y-2">
                    {stats?.topCities?.slice(0, 10).map((city, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium">{city.city_detected}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{city.search_count} recherches</span>
                          <span className="font-bold text-foreground">{city.total_results} leads</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BlurFade>

              {/* Top Types */}
              <BlurFade delay={0.7} inView>
                <div className="rounded-lg border border-border/50 bg-card/40 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Anchor className="w-5 h-5" />
                    Top 10 Types de Commerces
                  </h3>
                  <div className="space-y-2">
                    {stats?.topBusinessTypes?.slice(0, 10).map((type, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-foreground/10 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium capitalize">{type.business_type}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{type.search_count} recherches</span>
                          <span className="font-bold text-foreground">{type.total_results} leads</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BlurFade>
            </div>

            {/* Stats Utilisateur */}
            {stats?.user && (
              <BlurFade delay={0.8} inView>
                <div className="rounded border border-border/50 bg-card/40 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Vos Statistiques
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-foreground/5">
                      <div className="text-sm text-muted-foreground mb-1">Vos recherches</div>
                      <div className="text-2xl font-bold">
                        <NumberTicker value={stats.user.totalSearches} />
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-foreground/5">
                      <div className="text-sm text-muted-foreground mb-1">Leads collectés</div>
                      <div className="text-2xl font-bold">
                        <NumberTicker value={stats.user.totalResults} />
                      </div>
                    </div>
                  </div>
                </div>
              </BlurFade>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
