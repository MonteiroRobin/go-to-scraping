"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Anchor, Target, ChevronDown, Waves, Loader2, Download, LayoutGrid, List, Filter, X, MapPin, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { NumberTicker } from "@/components/ui/number-ticker"
import { MapComponent } from "@/components/map-component"
import { ResultsGrid } from "@/components/results-grid"
import { ResultsList } from "@/components/results-list"
import { EmptyStateScraper } from "@/components/empty-state-scraper"
import { FiltersPanel, type FilterOptions } from "@/components/filters-panel"
import { ScrapingStats } from "@/components/scraping-stats"
import { HistoryView } from "@/components/history-view"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

const FloatingDots = dynamic(() => import("@/components/InteractiveGrid").then((mod) => ({ default: mod.FloatingDots })), {
  ssr: false,
})

export interface Business {
  id: string
  place_id?: string
  name: string
  address: string
  phone: string
  website: string
  email: string
  lat: number
  lon: number
  rating?: number
  user_ratings_total?: number
  category?: string
  enriched?: boolean
  price_level?: number
}

type ViewMode = "search" | "map" | "history"
type ResultsViewMode = "grid" | "list"

export default function ScraperPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [credits, setCredits] = useState(100)
  const [searches, setSearches] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>("search")
  const [results, setResults] = useState<Business[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>(null)
  const [selectedZone, setSelectedZone] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)

  // Results display options
  const [resultsViewMode, setResultsViewMode] = useState<ResultsViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  // Stats
  const [newCount, setNewCount] = useState(0)
  const [duplicateCount, setDuplicateCount] = useState(0)

  // Enrichment
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichmentProgress, setEnrichmentProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Charger les crédits de l'utilisateur
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/credits/balance?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setCredits(data.credits_remaining || 100)
        })
        .catch((error) => {
          console.error("Error loading credits:", error)
        })
    }
  }, [user])

  // Filtered results
  const filteredResults = useMemo(() => {
    let filtered = [...results]

    if (filters.minRating) {
      filtered = filtered.filter((b) => (b.rating || 0) >= filters.minRating!)
    }

    if (filters.hasWebsite) {
      filtered = filtered.filter((b) => b.website && b.website !== "Non disponible")
    }

    if (filters.hasPhone) {
      filtered = filtered.filter((b) => b.phone && b.phone !== "Non disponible")
    }

    if (filters.hasEmail) {
      filtered = filtered.filter((b) => b.email && b.email !== "Non disponible")
    }

    if (filters.priceLevel && filters.priceLevel.length > 0) {
      filtered = filtered.filter((b) => b.price_level && filters.priceLevel!.includes(b.price_level))
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0
        if (filters.sortBy === "name") {
          comparison = a.name.localeCompare(b.name)
        } else if (filters.sortBy === "rating") {
          comparison = (b.rating || 0) - (a.rating || 0)
        }
        return filters.sortOrder === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [results, filters])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setViewMode("search")

    try {
      const lowerQuery = searchQuery.toLowerCase()
      const parts = lowerQuery.split(/\s+(?:à|a)\s+/)

      let businessType = ""
      let city = ""

      if (parts.length >= 2) {
        businessType = parts[0].trim()
        city = parts[1].trim()
      } else {
        const words = searchQuery.trim().split(/\s+/)
        if (words.length >= 2) {
          const lastWord = words[words.length - 1]
          const cities = ["paris", "lyon", "marseille", "toulouse", "nice", "nantes", "bordeaux", "lille", "dijon"]

          if (cities.includes(lastWord.toLowerCase())) {
            city = lastWord
            businessType = words.slice(0, -1).join(" ")
          } else {
            businessType = words[0]
            city = words.slice(1).join(" ")
          }
        } else {
          businessType = searchQuery
          city = "Paris"
        }
      }

      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", France")}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "GoToScraping/1.0",
          },
        }
      )

      const geocodeData = await geocodeResponse.json()

      if (!geocodeData || geocodeData.length === 0) {
        console.error("City not found:", city)
        setIsSearching(false)
        return
      }

      const location = {
        lat: parseFloat(geocodeData[0].lat),
        lng: parseFloat(geocodeData[0].lon),
      }

      setMapCenter({
        lat: location.lat,
        lon: location.lng,
      })

      // Vérifier d'abord le cache
      const cacheResponse = await fetch("/api/scraping/check-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          businessType,
          location,
          radius: 10000,
          keywords: businessType,
        }),
      })

      const cacheData = await cacheResponse.json()

      // Si cache frais, proposer d'utiliser les données en cache
      if (cacheData.cacheStatus === "fresh" && cacheData.businesses?.length > 0) {
        const confirmUseCache = confirm(
          `💰 ${cacheData.businesses.length} résultats en cache (${Math.round(cacheData.avgFreshnessHours)}h)\n\nCoût: 1 crédit (économie de ${cacheData.creditsNeeded - 1} crédits)\n\nUtiliser le cache?`
        )

        if (confirmUseCache) {
          setResults(cacheData.businesses)
          setSearches(searches + 1)
          setNewCount(0)
          setDuplicateCount(cacheData.businesses.length)

          // Recharger les crédits
          if (user?.id) {
            fetch(`/api/credits/balance?userId=${user.id}`)
              .then((res) => res.json())
              .then((creditsData) => {
                setCredits(creditsData.credits_remaining || 0)
              })
          }

          setIsSearching(false)
          return
        }
      }

      // Sinon, lancer le scraping normal
      const response = await fetch("/api/scrape-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          radius: 10000,
          type: businessType === "restaurant" ? "restaurant" : "establishment",
          keyword: businessType,
          userId: user?.id,
          includeContactData: true,
        }),
      })

      const data = await response.json()

      // Vérifier si pas assez de crédits
      if (response.status === 402) {
        alert(`⚠️ Crédits insuffisants!\n\nCette recherche coûte ${data.requiredCredits} crédits.\n\nVeuillez recharger vos crédits.`)
        setIsSearching(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du scraping")
      }

      if (data.businesses && data.businesses.length > 0) {
        setResults(data.businesses)
        setSearches(searches + 1)
        setNewCount(data.newCount || 0)
        setDuplicateCount(data.duplicateCount || 0)

        // Recharger les crédits après la recherche
        if (user?.id) {
          fetch(`/api/credits/balance?userId=${user.id}`)
            .then((res) => res.json())
            .then((creditsData) => {
              setCredits(creditsData.credits_remaining || 0)
            })
        }
      } else {
        setResults([])
        setNewCount(0)
        setDuplicateCount(0)
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, user, searches])

  const handleZoneSelected = (zone: { north: number; south: number; east: number; west: number }) => {
    setSelectedZone(zone)
  }

  const handleExport = useCallback(() => {
    if (filteredResults.length === 0) return

    const csv = [
      ["Nom", "Adresse", "Téléphone", "Site web", "Email", "Note", "Latitude", "Longitude"].join(","),
      ...filteredResults.map((b) =>
        [
          `"${b.name}"`,
          `"${b.address}"`,
          b.phone,
          b.website,
          b.email,
          b.rating || "",
          b.lat,
          b.lon,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }, [filteredResults])

  const handleEnrichAll = useCallback(async () => {
    if (filteredResults.length === 0) return

    const confirmEnrich = confirm(
      `🤖 Enrichir ${filteredResults.length} résultats avec Grok AI?\n\nCoût: ${filteredResults.length * 2} crédits (2 crédits par lead)\n\nCela ajoutera: descriptions, emails, catégories, tags, etc.`
    )

    if (!confirmEnrich) return

    setIsEnriching(true)
    setEnrichmentProgress({ current: 0, total: filteredResults.length })

    try {
      for (let i = 0; i < filteredResults.length; i++) {
        const business = filteredResults[i]
        setEnrichmentProgress({ current: i + 1, total: filteredResults.length })

        const response = await fetch("/api/enrich-with-grok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business }),
        })

        if (response.ok) {
          const enrichedData = await response.json()

          // Mettre à jour le business avec les données enrichies
          setResults((prev) =>
            prev.map((b) =>
              b.id === business.id
                ? {
                    ...b,
                    ...enrichedData,
                    enriched: true,
                  }
                : b
            )
          )
        }

        // Petit délai pour éviter de surcharger l'API
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Recharger les crédits
      if (user?.id) {
        const creditsRes = await fetch(`/api/credits/balance?userId=${user.id}`)
        const creditsData = await creditsRes.json()
        setCredits(creditsData.credits_remaining || 0)
      }

      alert(`✅ ${filteredResults.length} leads enrichis avec succès!`)
    } catch (error) {
      console.error("Enrichment error:", error)
      alert("❌ Erreur lors de l'enrichissement")
    } finally {
      setIsEnriching(false)
      setEnrichmentProgress({ current: 0, total: 0 })
    }
  }, [filteredResults, user])

  const handleEnrichSingle = useCallback(
    async (businessId: string) => {
      const business = results.find((b) => b.id === businessId)
      if (!business) return

      const confirmEnrich = confirm(
        `🤖 Enrichir "${business.name}" avec Grok AI?\n\nCoût: 2 crédits\n\nCela ajoutera: description, email, catégorie, tags, etc.`
      )

      if (!confirmEnrich) return

      setIsEnriching(true)

      try {
        const response = await fetch("/api/enrich-with-grok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business }),
        })

        if (!response.ok) {
          throw new Error("Enrichment failed")
        }

        const enrichedData = await response.json()

        // Mettre à jour le business
        setResults((prev) =>
          prev.map((b) =>
            b.id === businessId
              ? {
                  ...b,
                  ...enrichedData,
                  enriched: true,
                }
              : b
          )
        )

        // Recharger les crédits
        if (user?.id) {
          const creditsRes = await fetch(`/api/credits/balance?userId=${user.id}`)
          const creditsData = await creditsRes.json()
          setCredits(creditsData.credits_remaining || 0)
        }

        alert(`✅ "${business.name}" enrichi avec succès!`)
      } catch (error) {
        console.error("Enrichment error:", error)
        alert("❌ Erreur lors de l'enrichissement")
      } finally {
        setIsEnriching(false)
      }
    },
    [results, user]
  )

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

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-border/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-foreground/5 flex items-center justify-center p-1">
              <Image src="/hamecon-edited.svg" alt="Logo" width={32} height={32} className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold">Go To Scraping</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pro Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Badge
              variant={credits < 10 ? "destructive" : "outline"}
              className={`hidden sm:flex ${credits < 10 ? "animate-pulse" : ""}`}
            >
              {credits} crédit{credits > 1 ? "s" : ""}
              {credits < 10 && " ⚠️"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={logout} className="text-xs sm:text-sm">
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar gauche */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="rounded border border-border/50 bg-card/40 p-4">
              <div className="space-y-1">
                <Button
                  variant={viewMode === "search" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setViewMode("search")}
                >
                  <Target className="w-4 h-4" />
                  Recherche
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setViewMode("map")}
                >
                  <Waves className="w-4 h-4" />
                  Carte & Zones
                </Button>
                <Button
                  variant={viewMode === "history" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setViewMode("history")}
                >
                  <Anchor className="w-4 h-4" />
                  Historique
                </Button>
              </div>
            </div>

            <div className="rounded border border-border/50 bg-card/40 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Recherches rapides</h3>
              <div className="space-y-1">
                {[
                  "Restaurant Paris",
                  "Coiffeur Lyon",
                  "Boulangerie Marseille",
                  "Garage Toulouse",
                ].map((text, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(text)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-secondary/50 transition-colors text-xs"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded border border-border/50 bg-card/40 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Statistiques rapides</h3>
              <div className="space-y-3">
                <div className="p-3 rounded bg-foreground/5">
                  <div className="text-2xl font-bold mb-1">{credits}</div>
                  <div className="text-xs text-muted-foreground">Max résultats</div>
                </div>
                <div className="p-3 rounded bg-secondary/50">
                  <div className="text-2xl font-bold mb-1">{searches}</div>
                  <div className="text-xs text-muted-foreground">Recherches</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Zone principale centre */}
          <main className="lg:col-span-6 space-y-4 sm:space-y-6">
            {/* Search Bar */}
            <div className="rounded border border-border/50 bg-card/40 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Nouvelle recherche</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Recherchez des commerces par ville et type d'établissement
              </p>

              <div className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <Target className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Ex: café à Paris, restaurant Lyon..."
                    className="h-10 sm:h-12 pl-10 sm:pl-12 rounded border-2 text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Format : "type d'établissement à ville" (ex: café à Paris, restaurant Lyon)
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full h-10 sm:h-12 rounded"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Recherche en cours...
                    </>
                  ) : (
                    <>
                      <Image src="/hamecon-edited.svg" alt="Hook" width={20} height={20} className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Pêcher les leads
                    </>
                  )}
                </Button>
              </div>

              <details className="mt-4 group">
                <summary className="cursor-pointer flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 group-open:rotate-180 transition-transform" />
                  Comment fonctionne le scraping ?
                </summary>
                <div className="mt-3 p-3 sm:p-4 rounded bg-secondary/30 text-xs sm:text-sm text-muted-foreground space-y-2">
                  <p>1. Entrez votre recherche en langage naturel</p>
                  <p>2. Notre IA analyse et lance le scraping sur Google Maps</p>
                  <p>3. Les résultats apparaissent instantanément</p>
                  <p className="pt-2 text-[10px] sm:text-xs italic">
                    💡 Après le scraping, vous pourrez enrichir les données avec Grok AI
                  </p>
                </div>
              </details>
            </div>

            {/* Stats Display */}
            {results.length > 0 && (
              <ScrapingStats
                total={results.length}
                newCount={newCount}
                duplicateCount={duplicateCount}
                isLoading={isSearching}
                isEnriching={isEnriching}
                progress={{ current: 0, total: 0 }}
                enrichmentProgress={enrichmentProgress}
              />
            )}

            {/* View Mode Content */}
            {viewMode === "search" && results.length === 0 && !isSearching && (
              <EmptyStateScraper />
            )}

            {viewMode === "search" && results.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {filteredResults.length} résultat{filteredResults.length > 1 ? "s" : ""}
                    {filteredResults.length !== results.length && ` sur ${results.length}`}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-xs sm:text-sm"
                    >
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Filtres
                      {showFilters && <X className="w-3 h-3 ml-2" />}
                    </Button>
                    <div className="flex items-center gap-1 border border-border rounded p-1">
                      <Button
                        variant={resultsViewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setResultsViewMode("grid")}
                        className="h-7 w-7 p-0"
                      >
                        <LayoutGrid className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={resultsViewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setResultsViewMode("list")}
                        className="h-7 w-7 p-0"
                      >
                        <List className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>

                {showFilters && (
                  <FiltersPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    totalResults={results.length}
                    filteredResults={filteredResults.length}
                  />
                )}

                {resultsViewMode === "grid" ? (
                  <ResultsGrid
                    results={filteredResults}
                    onEnrichAll={handleEnrichAll}
                    onEnrichSingle={handleEnrichSingle}
                    isEnriching={isEnriching}
                  />
                ) : (
                  <ResultsList
                    results={filteredResults}
                    onEnrichAll={handleEnrichAll}
                    onEnrichSingle={handleEnrichSingle}
                    isEnriching={isEnriching}
                  />
                )}
              </div>
            )}

            {viewMode === "map" && (
              <div className="rounded border border-border/50 bg-card/40 p-4 overflow-hidden">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Carte interactive</h3>
                <div className="h-[400px] sm:h-[600px] rounded overflow-hidden">
                  <MapComponent
                    businesses={results}
                    center={mapCenter}
                    onZoneSelected={handleZoneSelected}
                  />
                </div>
              </div>
            )}

            {viewMode === "history" && (
              <div className="rounded border border-border/50 bg-card/40 p-4">
                <HistoryView
                  onSearch={(city, businessType, keywords) => {
                    setSearchQuery(`${businessType} à ${city}`)
                    handleSearch()
                  }}
                />
              </div>
            )}
          </main>

          {/* Panel droit avec carte et tips */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Carte preview - Zone de recherche */}
            <div className="rounded border border-border/50 bg-card/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Zone de recherche</h3>
                <Waves className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="aspect-square rounded overflow-hidden bg-secondary/20 relative">
                {mapCenter ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    <MapPin className="w-8 h-8 text-primary mb-3" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{searchQuery}</p>
                      <p className="text-xs text-muted-foreground">Lat: {mapCenter.lat.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">Lon: {mapCenter.lon.toFixed(4)}</p>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">Rayon: 10 km</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
                    La zone s'affichera après votre recherche
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded border border-border/50 bg-card/40 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Conseils</h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 mt-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <p>Utilisez des termes précis comme "restaurant italien" plutôt que "restaurant"</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 mt-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <p>Enrichissez les résultats avec Grok AI pour obtenir emails et détails</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 mt-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <p>Utilisez les filtres pour affiner selon vos critères</p>
                </div>
              </div>
            </div>

            {/* Stats de la recherche en cours */}
            {results.length > 0 && (
              <div className="rounded border border-border/50 bg-card/40 p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Cette recherche</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{results.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Nouveaux</span>
                    <span className="font-semibold">{newCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Doublons</span>
                    <span className="font-semibold">{duplicateCount}</span>
                  </div>
                  {filteredResults.length !== results.length && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Filtrés</span>
                      <span className="font-semibold">{filteredResults.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
