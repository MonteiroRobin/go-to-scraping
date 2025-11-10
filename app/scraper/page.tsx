"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Fish, Anchor, Target, ChevronDown, Sparkles, TrendingUp, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { NumberTicker } from "@/components/ui/number-ticker"
import dynamic from "next/dynamic"

const FloatingDots = dynamic(() => import("@/components/InteractiveGrid").then((mod) => ({ default: mod.FloatingDots })), {
  ssr: false,
})

export default function ScraperPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState(100)
  const [searches, setSearches] = useState(0)

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
    <div className="min-h-screen bg-background relative">
      <FloatingDots />

      {/* Container centré avec max-width */}
      <div className="relative max-w-[1400px] mx-auto px-6 py-6">
        {/* Header compact */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-foreground/5 flex items-center justify-center">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                <ShimmerText>Go To Scraping</ShimmerText>
              </h1>
              <p className="text-xs text-muted-foreground">Pro Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Déconnexion
          </Button>
        </div>

        {/* Layout en 2 colonnes centrées */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar gauche - 3 colonnes */}
          <aside className="col-span-3 space-y-4">
            {/* Navigation */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-4">
              <div className="space-y-1">
                <Button variant="default" size="sm" className="w-full justify-start gap-2">
                  <Target className="w-4 h-4" />
                  Recherche
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Waves className="w-4 h-4" />
                  Carte & Zones
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Anchor className="w-4 h-4" />
                  Historique
                </Button>
              </div>
            </div>

            {/* Recherches populaires */}
            <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Recherches populaires</h3>
              <div className="space-y-1">
                {[
                  { emoji: "🍽️", text: "Restaurant Paris" },
                  { emoji: "✂️", text: "Coiffeur Lyon" },
                  { emoji: "🥖", text: "Boulangerie Marseille" },
                  { emoji: "🔧", text: "Garage Toulouse" },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-xs">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats rapides */}
            <div className="rounded border border-border/50 bg-card/40 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Statistiques rapides</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-foreground/5">
                  <div className="text-2xl font-bold mb-1">
                    <NumberTicker value={credits} />
                  </div>
                  <div className="text-xs text-muted-foreground">Max résultats</div>
                </div>
                <div className="p-3 rounded bg-secondary/50">
                  <div className="text-2xl font-bold mb-1">
                    <NumberTicker value={searches} />
                  </div>
                  <div className="text-xs text-muted-foreground">Recherches</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Zone principale - 6 colonnes */}
          <main className="col-span-6 space-y-6">
            {/* Barre de recherche */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-6">
              <h2 className="text-xl font-bold mb-2">Nouvelle recherche</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Recherchez des commerces par ville et type d'établissement
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Ex: café à Paris, restaurant Lyon, coiffeur Marseille..."
                    className="h-12 pl-12 rounded-lg border-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Tapez votre recherche en langage naturel : "café à Paris", "restaurant Lyon", etc.
                  </p>
                </div>

                <Button size="lg" className="w-full h-12 rounded">
                  <Fish className="w-5 h-5 mr-2" />
                  Pêcher les leads
                </Button>
              </div>

              {/* Collapse explications */}
              <details className="mt-4 group">
                <summary className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  Comment fonctionne le scraping ?
                </summary>
                <div className="mt-3 p-4 rounded-xl bg-secondary/30 text-sm text-muted-foreground space-y-2">
                  <p>1. Entrez votre recherche en langage naturel</p>
                  <p>2. Notre IA analyse et lance le scraping sur Google Maps</p>
                  <p>3. Les résultats apparaissent instantanément</p>
                  <p className="pt-2 text-xs italic">
                    💡 Après le scraping, vous pourrez enrichir les données avec Grok AI
                  </p>
                </div>
              </details>
            </div>

            {/* Zone résultats vide */}
            <div className="rounded border-2 border-dashed border-border/50 bg-card/20 p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-foreground/5 flex items-center justify-center mx-auto">
                  <Fish className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Aucun résultat pour le moment</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilisez le formulaire ci-dessus pour lancer une recherche et découvrir des commerces dans votre
                    zone cible
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Panel droit - 3 colonnes */}
          <aside className="col-span-3 space-y-4">
            {/* Carte preview */}
            <div className="rounded-lg border border-border/50 bg-card/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Carte</h3>
                <Waves className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="aspect-square rounded bg-secondary/20 flex items-center justify-center text-xs text-muted-foreground">
                La carte s'affichera après votre recherche
              </div>
            </div>

            {/* Tips */}
            <div className="rounded border border-border/50 bg-card/40 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Recherche ciblée</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <p>Utilisez des termes précis comme "restaurant italien" plutôt que juste "restaurant"</p>
                </div>
              </div>
            </div>

            {/* Recherches populaires locales */}
            <div className="rounded-xl border border-border/50 bg-card/40 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Recherches populaires</h3>
              <div className="space-y-2">
                {["Restaurant Paris", "Coiffeur Lyon", "Boulangerie Marseille", "Garage Toulouse"].map((search, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-xs"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
