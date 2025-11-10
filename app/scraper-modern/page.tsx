"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ScraperLayoutModern, CardWithDepth, SectionHeader } from "@/components/scraper-layout-modern"
import { ScraperNavbar } from "@/components/scraper-navbar"
import { ScrapingStats } from "@/components/scraping-stats"
import { EmptyStateScraper } from "@/components/empty-state-scraper"
import { BusinessCardPremium } from "@/components/business-card-premium"
import { MapPin, Search, History, Filter, Download, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import type { Business } from "@/components/scraper-interface"

const FloatingDots = dynamic(() => import("@/components/InteractiveGrid").then((mod) => ({ default: mod.FloatingDots })), {
  ssr: false,
})

export default function ScraperModernPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [results, setResults] = useState<Business[]>([])
  const [credits, setCredits] = useState(1000)
  const [isScrapingActive, setIsScrapingActive] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState("")

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

  // Sidebar gauche - Navigation et raccourcis
  const sidebar = (
    <>
      <CardWithDepth level={2} className="p-6">
        <SectionHeader title="Navigation" className="mb-4" />
        <div className="space-y-2">
          <Button variant="default" className="w-full justify-start gap-3 h-12">
            <Search className="w-5 h-5" />
            Recherche
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12">
            <MapPin className="w-5 h-5" />
            Carte & Zones
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12">
            <History className="w-5 h-5" />
            Historique
          </Button>
        </div>
      </CardWithDepth>

      <CardWithDepth level={1} className="p-6">
        <SectionHeader title="Recherches rapides" className="mb-4" />
        <div className="space-y-2">
          {[
            { city: "Paris", type: "Restaurants", icon: "🍽️" },
            { city: "Lyon", type: "Coiffeurs", icon: "✂️" },
            { city: "Marseille", type: "Boulangeries", icon: "🥖" },
            { city: "Toulouse", type: "Garages", icon: "🔧" },
          ].map((template, i) => (
            <button
              key={i}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-secondary/50 transition-all duration-300 group border border-transparent hover:border-border/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {template.type}
                  </div>
                  <div className="text-xs text-muted-foreground">{template.city}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardWithDepth>
    </>
  )

  // Zone principale - Recherche et Map
  const mainContent = (
    <>
      {/* Barre de recherche premium */}
      <CardWithDepth level={3} className="p-6 group">
        <div className="space-y-4">
          <SectionHeader
            title="Recherche de commerces"
            subtitle="Trouvez des leads qualifiés en quelques secondes"
          />

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Restaurants Paris, Coiffeurs Lyon..."
                className="h-14 pl-12 pr-4 text-base rounded-xl border-2 focus:border-primary transition-all"
              />
            </div>
            <Button size="lg" className="h-14 px-8 rounded-xl gap-2 shadow-lg hover:shadow-xl transition-all">
              <Sparkles className="w-5 h-5" />
              Lancer le scraping
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Suggestions:</span>
            {["Restaurants Paris", "Cafés Lyon", "Boulangeries Marseille"].map((suggestion, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setSearchQuery(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      </CardWithDepth>

      {/* Zone de carte (placeholder pour l'instant) */}
      <CardWithDepth level={2} className="p-6 min-h-[400px]">
        <SectionHeader
          title="Carte interactive"
          subtitle="Sélectionnez une zone pour scraper"
          action={
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          }
        />
        <div className="relative bg-secondary/20 rounded-xl h-[350px] flex items-center justify-center border-2 border-dashed border-border/50">
          <div className="text-center space-y-3">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">La carte interactive s'affichera ici</p>
            <p className="text-xs text-muted-foreground">Dessinez un rectangle pour sélectionner une zone</p>
          </div>
        </div>
      </CardWithDepth>

      {/* Statistiques */}
      <ScrapingStats
        total={results.length}
        newCount={0}
        duplicateCount={0}
        isLoading={isScrapingActive}
        isEnriching={false}
        progress={progress}
        enrichmentProgress={{ current: 0, total: 0 }}
      />

      {/* Résultats ou Empty State */}
      {results.length === 0 ? (
        <CardWithDepth level={1} className="p-8">
          <EmptyStateScraper />
        </CardWithDepth>
      ) : (
        <CardWithDepth level={2} className="p-6">
          <SectionHeader
            title={`${results.length} commerces trouvés`}
            action={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Sheets
                </Button>
              </div>
            }
          />
          <div className="grid grid-cols-1 gap-4 mt-6">
            {results.map((business, i) => (
              <BusinessCardPremium key={business.id} business={business} index={i} />
            ))}
          </div>
        </CardWithDepth>
      )}
    </>
  )

  // Panel droite - Stats et actions rapides
  const resultsPanel = (
    <>
      <CardWithDepth level={2} className="p-6">
        <SectionHeader title="Statistiques" className="mb-4" />
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Crédits restants</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{credits}</div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/30">
            <div className="text-sm text-muted-foreground mb-2">Scraping aujourd'hui</div>
            <div className="text-2xl font-bold text-foreground">0</div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/30">
            <div className="text-sm text-muted-foreground mb-2">Total collectés</div>
            <div className="text-2xl font-bold text-foreground">{results.length}</div>
          </div>
        </div>
      </CardWithDepth>

      <CardWithDepth level={1} className="p-6">
        <SectionHeader title="Actions rapides" className="mb-4" />
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start gap-3 h-11">
            <Download className="w-4 h-4" />
            Exporter en CSV
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 h-11">
            <Sparkles className="w-4 h-4" />
            Enrichir avec AI
          </Button>
          <Button variant="outline" className="w-full justify-start gap-3 h-11">
            <History className="w-4 h-4" />
            Voir l'historique
          </Button>
        </div>
      </CardWithDepth>
    </>
  )

  return (
    <>
      <FloatingDots />
      <ScraperLayoutModern
        navbar={<ScraperNavbar credits={credits} />}
        sidebar={sidebar}
        mainContent={mainContent}
        resultsPanel={resultsPanel}
      />
    </>
  )
}
