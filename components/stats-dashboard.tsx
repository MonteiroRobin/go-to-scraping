"use client"

import { useMemo } from "react"
import { Business } from "./scraper-interface"
import { TrendingUp, Star, Globe, Phone, Mail, MapPin } from "lucide-react"

interface StatsDashboardProps {
  results: Business[]
}

export function StatsDashboard({ results }: StatsDashboardProps) {
  const stats = useMemo(() => {
    if (results.length === 0) return null

    // Calculate statistics
    const withWebsite = results.filter((b) => b.website && b.website !== "Non disponible").length
    const withPhone = results.filter((b) => b.phone && b.phone !== "Non disponible").length
    const withEmail = results.filter((b) => b.email && b.email !== "Non disponible").length
    const withRating = results.filter((b) => b.rating).length

    const avgRating = withRating > 0
      ? results.reduce((sum, b) => sum + (b.rating || 0), 0) / withRating
      : 0

    // Group by category
    const categories = results.reduce((acc, b) => {
      const cat = b.category || b.types?.[0] || "Autre"
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    return {
      total: results.length,
      withWebsite,
      withPhone,
      withEmail,
      withRating,
      avgRating,
      websitePercent: Math.round((withWebsite / results.length) * 100),
      phonePercent: Math.round((withPhone / results.length) * 100),
      emailPercent: Math.round((withEmail / results.length) * 100),
      topCategories,
    }
  }, [results])

  if (!stats) return null

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Statistiques en temps réel</h3>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Average Rating */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Note moyenne</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.avgRating.toFixed(1)}
            <span className="text-sm text-muted-foreground">/5</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.withRating} avis
          </div>
        </div>

        {/* Total Results */}
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.total}
          </div>
          <div className="text-xs text-muted-foreground">
            établissements
          </div>
        </div>
      </div>

      {/* Data completion bars */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Taux de complétion
        </h4>

        <div className="space-y-2">
          {/* Website */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">Site web</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{stats.websitePercent}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${stats.websitePercent}%` }}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">Téléphone</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{stats.phonePercent}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${stats.phonePercent}%` }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-foreground">Email</span>
              </div>
              <span className="text-xs font-semibold text-foreground">{stats.emailPercent}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${stats.emailPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top categories */}
      {stats.topCategories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Top catégories
          </h4>
          <div className="space-y-1.5">
            {stats.topCategories.map(([category, count], index) => {
              const percent = Math.round((count / stats.total) * 100)
              const colors = ["bg-primary", "bg-blue-500", "bg-green-500"]
              return (
                <div key={category} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors[index]}`} />
                  <span className="text-xs text-foreground flex-1 truncate" title={category}>
                    {category}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {count} ({percent}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <div className="text-xs text-foreground space-y-1">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full" />
            Insights
          </div>
          {stats.websitePercent >= 70 && (
            <p className="text-muted-foreground">
              ✓ Excellent taux de sites web ({stats.websitePercent}%)
            </p>
          )}
          {stats.avgRating >= 4 && (
            <p className="text-muted-foreground">
              ✓ Très bonne note moyenne ({stats.avgRating.toFixed(1)}/5)
            </p>
          )}
          {stats.topCategories[0] && (
            <p className="text-muted-foreground">
              ✓ Catégorie dominante : {stats.topCategories[0][0]}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
