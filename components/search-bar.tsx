"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Sparkles, X, Clock, Zap, AlertTriangle, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SearchBarProps {
  onSearch: (
    city: string,
    businessType: string,
    filters: SearchFilters,
    location?: { lat: number; lon: number },
  ) => void
  isLoading: boolean
  userId?: string
}

export interface SearchFilters {
  keywords: string
  useGrokEnrichment?: boolean
}

interface CacheStatus {
  cacheStatus: "fresh" | "stale" | "none"
  cachedCount: number
  avgFreshnessHours: number
  creditsNeeded: number
  message: string
}

const KEYWORD_RECOMMENDATIONS: Record<string, string[]> = {
  café: ["ouvert dimanche", "wifi gratuit", "terrasse", "petit déjeuner", "parking"],
  restaurant: ["livraison", "terrasse", "menu midi", "parking", "réservation"],
  bar: ["happy hour", "terrasse", "sport", "billard", "ouvert tard"],
  boulangerie: ["ouvert dimanche", "sans gluten", "livraison", "parking", "sandwicherie"],
  pharmacie: ["ouvert dimanche", "de garde", "livraison", "parking", "orthopédie"],
  banque: ["distributeur 24h", "parking", "conseiller", "ouvert samedi", "accessible PMR"],
  coiffeur: ["sans rendez-vous", "homme", "femme", "enfant", "parking"],
  supermarché: ["ouvert dimanche", "livraison", "drive", "parking gratuit", "bio"],
  hôtel: ["parking gratuit", "wifi gratuit", "petit déjeuner", "animaux acceptés", "piscine"],
  magasin: ["ouvert dimanche", "parking", "livraison", "retrait gratuit", "soldes"],
}

export function SearchBar({ onSearch, isLoading, userId }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [citySuggestions, setCitySuggestions] = useState<any[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [recommendedKeywords, setRecommendedKeywords] = useState<string[]>([])
  const searchInputRef = useRef<HTMLDivElement>(null)

  // Cache status state
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null)
  const [isCheckingCache, setIsCheckingCache] = useState(false)
  const [selectedCity, setSelectedCity] = useState<any>(null)

  const parseSearchQuery = (query: string) => {
    const lowerQuery = query.toLowerCase().trim()

    // Common patterns: "café à Paris", "restaurant Lyon", "Paris café"
    const patterns = [
      /(.+?)\s+à\s+(.+)/, // "café à Paris"
      /(.+?)\s+(.+)/, // "café Paris" or "Paris café"
    ]

    for (const pattern of patterns) {
      const match = lowerQuery.match(pattern)
      if (match) {
        const [, part1, part2] = match

        // Check which part is the business type
        const businessTypes = Object.keys(KEYWORD_RECOMMENDATIONS)
        const isFirstPartBusiness = businessTypes.some((type) => part1.includes(type))
        const isSecondPartBusiness = businessTypes.some((type) => part2.includes(type))

        if (isFirstPartBusiness) {
          return { businessType: part1.trim(), city: part2.trim() }
        } else if (isSecondPartBusiness) {
          return { businessType: part2.trim(), city: part1.trim() }
        }
      }
    }

    // If no pattern matches, assume it's just a city
    return { businessType: "", city: lowerQuery }
  }

  useEffect(() => {
    const { businessType } = parseSearchQuery(searchQuery)

    if (businessType) {
      const matchingType = Object.keys(KEYWORD_RECOMMENDATIONS).find((type) => businessType.includes(type))

      if (matchingType) {
        setRecommendedKeywords(KEYWORD_RECOMMENDATIONS[matchingType])
      } else {
        setRecommendedKeywords([])
      }
    } else {
      setRecommendedKeywords([])
    }
  }, [searchQuery])

  useEffect(() => {
    const searchCities = async () => {
      const { city } = parseSearchQuery(searchQuery)

      if (city.length < 2) {
        setCitySuggestions([])
        return
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=5&countrycodes=fr&addressdetails=1`,
        )
        const data = await response.json()
        setCitySuggestions(data)
      } catch (error) {
        console.error("[v0] City search error:", error)
      }
    }

    const debounce = setTimeout(searchCities, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCitySelect = (city: any) => {
    const { businessType } = parseSearchQuery(searchQuery)
    const cityName = city.display_name.split(",")[0]

    // Reconstruct query with selected city
    if (businessType) {
      setSearchQuery(`${businessType} à ${cityName}`)
    } else {
      setSearchQuery(cityName)
    }

    setSelectedCity(city)
    setShowCitySuggestions(false)

    // Auto-check cache when city is selected
    if (businessType && city) {
      checkCache(city, businessType)
    }
  }

  const checkCache = async (city: any, businessType: string) => {
    if (!city) return

    setIsCheckingCache(true)
    setCacheStatus(null)

    try {
      const location = {
        lat: Number.parseFloat(city.lat),
        lon: Number.parseFloat(city.lon),
      }

      const response = await fetch("/api/scraping/check-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.display_name.split(",")[0],
          businessType,
          location,
          radius: 5000,
          keywords: selectedKeywords.join(" "),
        }),
      })

      const data = await response.json()
      setCacheStatus(data)
    } catch (error) {
      console.error("Error checking cache:", error)
    } finally {
      setIsCheckingCache(false)
    }
  }

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      return
    }

    const { city, businessType } = parseSearchQuery(searchQuery)

    if (!city) {
      alert("Veuillez entrer au moins une ville dans votre recherche.")
      return
    }

    // Find location from suggestions or use selected city
    const cityData = selectedCity || citySuggestions.find((c) =>
      city.toLowerCase().includes(c.display_name.split(",")[0].toLowerCase()),
    )

    const location = cityData
      ? { lat: Number.parseFloat(cityData.lat), lon: Number.parseFloat(cityData.lon) }
      : undefined

    if (!location) {
      alert("Veuillez sélectionner une ville dans les suggestions.")
      return
    }

    const filters: SearchFilters = {
      keywords: selectedKeywords.join(" "),
      useGrokEnrichment: false, // Will be prompted after scraping
    }

    onSearch(city, businessType, filters, location)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div ref={searchInputRef} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary z-10" />
          <Input
            type="text"
            placeholder="Ex: café à Paris, restaurant Lyon, coiffeur Marseille..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowCitySuggestions(true)
            }}
            onFocus={() => setShowCitySuggestions(true)}
            disabled={isLoading}
            className="pl-12 pr-12 h-14 text-lg border border-border focus:border-primary focus:ring-primary bg-white dark:bg-card rounded-xl shadow-sm transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setCitySuggestions([])
                setSelectedKeywords([])
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {showCitySuggestions && citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card border border-border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
              {citySuggestions.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary text-sm border-b border-border last:border-b-0 transition-colors duration-150"
                >
                  <div className="font-medium text-foreground">{city.display_name.split(",")[0]}</div>
                  <div className="text-xs text-muted-foreground">
                    {city.display_name.split(",").slice(1, 3).join(",")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground px-1">
          💡 Tapez votre recherche en langage naturel : "café à Paris", "restaurant Lyon", etc.
        </p>
      </div>

      {recommendedKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Mots-clés suggérés :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedKeywords.map((keyword) => (
              <Badge
                key={keyword}
                variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedKeywords.includes(keyword)
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
                onClick={() => toggleKeyword(keyword)}
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {selectedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-secondary rounded-lg border border-border">
          <span className="text-sm text-muted-foreground">Filtres actifs :</span>
          {selectedKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="secondary"
              className="gap-1 bg-white dark:bg-card text-foreground border border-border"
            >
              {keyword}
              <X className="w-3 h-3 cursor-pointer hover:text-primary" onClick={() => toggleKeyword(keyword)} />
            </Badge>
          ))}
        </div>
      )}

      {/* Cache Status Display */}
      {isCheckingCache && (
        <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <Clock className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            Vérification du cache en cours...
          </AlertDescription>
        </Alert>
      )}

      {cacheStatus && !isCheckingCache && (
        <>
          {cacheStatus.cacheStatus === "fresh" && (
            <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <Zap className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">⚡ {cacheStatus.cachedCount} résultats en cache (frais)</span>
                    <span className="text-xs block mt-1">Données de moins de 7 jours</span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700">
                    <Coins className="h-3 w-3 mr-1" />
                    {cacheStatus.creditsNeeded} crédit
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {cacheStatus.cacheStatus === "stale" && (
            <Alert className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">⚠️ {cacheStatus.cachedCount} résultats en cache (ancien)</span>
                    <span className="text-xs block mt-1">
                      Données de {Math.round(cacheStatus.avgFreshnessHours / 24)} jours - Re-scraping recommandé
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700">
                    <Coins className="h-3 w-3 mr-1" />
                    {cacheStatus.creditsNeeded} crédits
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {cacheStatus.cacheStatus === "none" && (
            <Alert className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
              <Search className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">🔍 Nouveau scraping nécessaire</span>
                    <span className="text-xs block mt-1">Aucune donnée en cache pour cette recherche</span>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700">
                    <Coins className="h-3 w-3 mr-1" />
                    {cacheStatus.creditsNeeded} crédits
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isLoading || !searchQuery.trim()}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
      >
        {isLoading ? (
          <>
            <Search className="w-5 h-5 animate-spin mr-2" />
            Recherche en cours...
          </>
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Rechercher
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground px-4">
        <Sparkles className="w-3 h-3 inline mr-1" />
        Après le scraping, vous pourrez enrichir les données avec Grok AI
      </p>
    </div>
  )
}
