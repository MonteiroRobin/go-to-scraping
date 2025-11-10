"use client"

import { useState } from "react"
import { Filter, X, Star, Globe, Phone, Mail, Euro } from "lucide-react"
import { Button } from "./ui/button"

export interface FilterOptions {
  minRating?: number
  hasWebsite?: boolean
  hasPhone?: boolean
  hasEmail?: boolean
  priceLevel?: number[]
  sortBy?: "name" | "rating" | "distance"
  sortOrder?: "asc" | "desc"
}

interface FiltersPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClose: () => void
}

export function FiltersPanel({ filters, onFiltersChange, onClose }: FiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: FilterOptions = {}
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const togglePriceLevel = (level: number) => {
    const current = localFilters.priceLevel || []
    const newLevels = current.includes(level) ? current.filter((l) => l !== level) : [...current, level]
    setLocalFilters({ ...localFilters, priceLevel: newLevels.length > 0 ? newLevels : undefined })
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b-2 border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Filtres avancés</h2>
              <p className="text-xs text-muted-foreground">Affinez vos résultats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Note minimum
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      minRating: localFilters.minRating === rating ? undefined : rating,
                    })
                  }
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    localFilters.minRating === rating
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Star
                      className={`w-4 h-4 ${
                        localFilters.minRating === rating ? "fill-current" : "text-yellow-500 fill-yellow-500"
                      }`}
                    />
                    <span className="text-xs font-semibold">{rating}+</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Price Level Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Euro className="w-4 h-4 text-primary" />
              Niveau de prix
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => togglePriceLevel(level)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    localFilters.priceLevel?.includes(level)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-sm font-semibold">{"€".repeat(level)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Data Presence Filters */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Présence de données</label>
            <div className="space-y-2">
              <button
                onClick={() =>
                  setLocalFilters({ ...localFilters, hasWebsite: !localFilters.hasWebsite })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  localFilters.hasWebsite
                    ? "bg-primary/10 border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    localFilters.hasWebsite ? "bg-primary border-primary" : "border-border"
                  }`}
                >
                  {localFilters.hasWebsite && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                </div>
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Possède un site web</span>
              </button>

              <button
                onClick={() =>
                  setLocalFilters({ ...localFilters, hasPhone: !localFilters.hasPhone })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  localFilters.hasPhone
                    ? "bg-primary/10 border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    localFilters.hasPhone ? "bg-primary border-primary" : "border-border"
                  }`}
                >
                  {localFilters.hasPhone && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                </div>
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Possède un téléphone</span>
              </button>

              <button
                onClick={() =>
                  setLocalFilters({ ...localFilters, hasEmail: !localFilters.hasEmail })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  localFilters.hasEmail
                    ? "bg-primary/10 border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    localFilters.hasEmail ? "bg-primary border-primary" : "border-border"
                  }`}
                >
                  {localFilters.hasEmail && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                </div>
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Possède un email</span>
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">Trier par</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "name", label: "Nom" },
                { value: "rating", label: "Note" },
              ].map((sort) => (
                <button
                  key={sort.value}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      sortBy: sort.value as "name" | "rating",
                    })
                  }
                  className={`py-2 rounded-lg border-2 transition-all ${
                    localFilters.sortBy === sort.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-sm font-semibold">{sort.label}</span>
                </button>
              ))}
            </div>
            {localFilters.sortBy && (
              <div className="flex gap-2">
                {[
                  { value: "asc", label: "Croissant" },
                  { value: "desc", label: "Décroissant" },
                ].map((order) => (
                  <button
                    key={order.value}
                    onClick={() =>
                      setLocalFilters({
                        ...localFilters,
                        sortOrder: order.value as "asc" | "desc",
                      })
                    }
                    className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                      localFilters.sortOrder === order.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs font-semibold">{order.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-border flex gap-3 sticky bottom-0 bg-card">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Réinitialiser
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  )
}
