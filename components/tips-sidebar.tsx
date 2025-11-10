"use client"

import { useEffect, useState } from "react"
import { Lightbulb, TrendingUp, Zap, Target, Database, FileSpreadsheet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const tips = [
  {
    icon: Lightbulb,
    title: "Recherche ciblée",
    description: "Utilisez des termes précis comme 'restaurant italien' plutôt que juste 'restaurant' pour des résultats plus pertinents.",
    color: "text-yellow-600 dark:text-yellow-500",
  },
  {
    icon: TrendingUp,
    title: "Meilleur moment",
    description: "Les données sont plus à jour en semaine. Évitez les weekends pour un maximum de fiabilité.",
    color: "text-blue-600 dark:text-blue-500",
  },
  {
    icon: Zap,
    title: "Vitesse optimale",
    description: "Pour scraper une grande zone, divisez-la en plusieurs petites recherches pour de meilleures performances.",
    color: "text-purple-600 dark:text-purple-500",
  },
  {
    icon: Target,
    title: "Précision géographique",
    description: "Préférez les arrondissements (ex: '75001 Paris') aux villes entières pour des résultats plus ciblés.",
    color: "text-red-600 dark:text-red-500",
  },
  {
    icon: Database,
    title: "Données enrichies",
    description: "Utilisez l'enrichissement Grok AI après le scraping pour obtenir des informations supplémentaires sur les commerces.",
    color: "text-green-600 dark:text-green-500",
  },
  {
    icon: FileSpreadsheet,
    title: "Export automatique",
    description: "Les résultats sont automatiquement sauvegardés. Vous pouvez les exporter à tout moment en CSV ou Google Sheets.",
    color: "text-indigo-600 dark:text-indigo-500",
  },
]

export function TipsSidebar() {
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const tip = tips[currentTip]
  const Icon = tip.icon

  return (
    <aside className="hidden xl:block w-80 border-l border-border bg-card/30 backdrop-blur-sm p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Current Tip */}
        <Card className="p-6 border-2 card-elevated transition-all duration-500">
          <div className="flex items-start gap-3 mb-4">
            <div className={cn("p-2 rounded-lg bg-secondary", tip.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
            </div>
          </div>
          <div className="flex gap-1 justify-center">
            {tips.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === currentTip ? "w-8 bg-primary" : "w-1 bg-border"
                )}
              />
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Statistiques rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 text-center border card-elevated">
              <div className="text-2xl font-bold text-foreground">100</div>
              <div className="text-xs text-muted-foreground">Max résultats</div>
            </Card>
            <Card className="p-3 text-center border card-elevated">
              <div className="text-2xl font-bold text-foreground">∞</div>
              <div className="text-xs text-muted-foreground">Recherches</div>
            </Card>
          </div>
        </div>

        {/* Popular Searches */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Recherches populaires</h3>
          <div className="space-y-2">
            {["Restaurant Paris", "Coiffeur Lyon", "Boulangerie Marseille", "Garage Toulouse"].map((search) => (
              <button
                key={search}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Bonnes pratiques</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Vérifiez les doublons avant export</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Utilisez des termes spécifiques</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Exportez régulièrement vos données</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">✓</span>
              <span>Consultez l'historique pour retrouver vos recherches</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
