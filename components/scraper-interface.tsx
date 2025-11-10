"use client"

import { useState, useCallback, useMemo } from "react"
import { MapComponent } from "@/components/map-component"
import { ResultsList } from "@/components/results-list"
import { SearchBar, type SearchFilters } from "@/components/search-bar"
import { HistoryView } from "@/components/history-view"
import {
  Loader2,
  LogOut,
  History,
  Search,
  Map,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { Progress } from "@/components/ui/progress"
import { saveSearchHistory } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  description?: string
  category?: string
  tags?: string[]
  estimated_price_range?: string
  specialties?: string[]
  enriched?: boolean
  opening_hours?: string
  price_level?: number
  business_status?: string
  types?: string[]
  photos?: string[]
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
]

type ViewMode = "search" | "map" | "history"

export function ScraperInterface() {
  const { user, logout } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("search")
  const [results, setResults] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [selectedZone, setSelectedZone] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [duplicateCount, setDuplicateCount] = useState(0)
  const [newCount, setNewCount] = useState(0)

  // Add Grok enrichment state variables
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichmentProgress, setEnrichmentProgress] = useState({ current: 0, total: 0 })
  const [showGrokPrompt, setShowGrokPrompt] = useState(false)
  const [canEnrich, setCanEnrich] = useState(false)

  const statsDisplay = useMemo(() => {
    if (results.length === 0) return null

    return (
      <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6 bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-card/90">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full">
            <div className="flex-shrink-0">
              <div className="text-2xl sm:text-4xl font-bold text-foreground">
                {results.length}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                {results.length === 1 ? "commerce trouvé" : "commerces trouvés"}
              </div>
            </div>

            {(newCount > 0 || duplicateCount > 0) && (
              <div className="flex gap-2 sm:gap-4 flex-wrap">
                {newCount > 0 && (
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary rounded-lg border border-border">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{newCount}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">nouveaux</div>
                  </div>
                )}
                {duplicateCount > 0 && (
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary rounded-lg border border-border">
                    <div className="text-lg sm:text-2xl font-bold text-foreground">{duplicateCount}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">déjà scrapés</div>
                  </div>
                )}
              </div>
            )}

            {isEnriching && enrichmentProgress.total > 0 && (
              <div className="flex-1 min-w-[150px] sm:min-w-[200px] w-full sm:w-auto">
                <div className="flex items-center justify-between text-[10px] sm:text-xs mb-2">
                  <span className="text-foreground font-medium">
                    Enrichissement Grok {enrichmentProgress.current}/{enrichmentProgress.total}
                  </span>
                  <span className="text-muted-foreground font-semibold">
                    {Math.round((enrichmentProgress.current / enrichmentProgress.total) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(enrichmentProgress.current / enrichmentProgress.total) * 100}
                  className="h-2 sm:h-2.5 bg-secondary"
                />
              </div>
            )}

            {isLoading && progress.total > 0 && !isEnriching && (
              <div className="flex-1 min-w-[150px] sm:min-w-[200px] w-full sm:w-auto">
                <div className="flex items-center justify-between text-[10px] sm:text-xs mb-2">
                  <span className="text-foreground font-medium">
                    Scraping {progress.current}/{progress.total}
                  </span>
                  <span className="text-muted-foreground font-semibold">
                    {Math.round((progress.current / progress.total) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(progress.current / progress.total) * 100}
                  className="h-2 sm:h-2.5 bg-secondary"
                />
              </div>
            )}
          </div>
        </div>

        {duplicateCount > 0 && (
          <Alert className="border-border bg-secondary">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <AlertDescription className="text-xs sm:text-sm text-foreground">
              {duplicateCount} {duplicateCount === 1 ? "établissement a" : "établissements ont"} déjà été scrapé
              {duplicateCount > 1 ? "s" : ""} précédemment. Les données ont été mises à jour.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }, [results.length, isLoading, isEnriching, progress, enrichmentProgress, newCount, duplicateCount])

  const splitIntoChunks = (zone: { north: number; south: number; east: number; west: number }) => {
    const chunks: Array<{ north: number; south: number; east: number; west: number }> = []
    const chunkSize = 0.018 // ~2km per chunk

    const latSteps = Math.ceil((zone.north - zone.south) / chunkSize)
    const lonSteps = Math.ceil((zone.east - zone.west) / chunkSize)

    for (let i = 0; i < latSteps; i++) {
      for (let j = 0; j < lonSteps; j++) {
        const south = zone.south + i * chunkSize
        const north = Math.min(south + chunkSize, zone.north)
        const west = zone.west + j * chunkSize
        const east = Math.min(west + chunkSize, zone.east)

        chunks.push({ north, south, east, west })
      }
    }

    return chunks
  }

  const fetchFromOverpass = async (query: string, retries = 3): Promise<any> => {
    let lastError: any = null

    for (let i = 0; i < retries; i++) {
      const endpoint = OVERPASS_ENDPOINTS[i % OVERPASS_ENDPOINTS.length]
      console.log(`[v0] Attempt ${i + 1}/${retries} using endpoint: ${endpoint}`)

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // Increased to 60s

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("[v0] Non-JSON response:", text.substring(0, 200))
          throw new Error("L'API a retourné une réponse invalide")
        }

        const data = await response.json()
        console.log(`[v0] Successfully fetched ${data.elements?.length || 0} elements`)
        return data
      } catch (error: any) {
        lastError = error
        console.error(`[v0] Error on attempt ${i + 1}:`, error.message)

        // Don't retry on abort (timeout)
        if (error.name === "AbortError") {
          throw new Error("⏱️ Timeout: La requête a pris trop de temps. Essayez une zone plus petite.")
        }

        // Don't retry on network errors
        if (error.message === "Failed to fetch") {
          console.error("[v0] Network error - possible CORS or connectivity issue")
          if (i < retries - 1) {
            console.log(`[v0] Retrying with different endpoint...`)
            await new Promise((resolve) => setTimeout(resolve, 2000))
            continue
          }
          throw new Error(
            "❌ Erreur de connexion à l'API Overpass.\n\nPossibles causes:\n- Problème de réseau\n- API temporairement indisponible\n- Zone trop grande\n\nVeuillez réessayer dans quelques instants.",
          )
        }

        if (i === retries - 1) {
          throw new Error(`❌ Échec après ${retries} tentatives: ${lastError.message}`)
        }

        // Wait before retry with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)))
      }
    }

    throw lastError
  }

  const calculateZoneArea = (zone: { north: number; south: number; east: number; west: number }) => {
    const latDiff = zone.north - zone.south
    const lonDiff = zone.east - zone.west
    // Approximate area in km² (1 degree ≈ 111km at equator)
    const areaKm2 = latDiff * lonDiff * 111 * 111
    return areaKm2
  }

  const validateZone = (zone: { north: number; south: number; east: number; west: number }): string | null => {
    const area = calculateZoneArea(zone)
    const latDiff = zone.north - zone.south
    const lonDiff = zone.east - zone.west

    // Zone too small (less than 100m x 100m)
    if (latDiff < 0.001 || lonDiff < 0.001) {
      return "⚠️ La zone sélectionnée est trop petite. Veuillez dessiner une zone plus grande (minimum 100m x 100m)."
    }

    // Zone too large (more than 50km²)
    if (area > 50) {
      return `⚠️ La zone sélectionnée est très grande (${area.toFixed(1)} km²).\n\nCela peut prendre plusieurs minutes et risque d'échouer.\n\nRecommandation: Limitez la zone à environ 25 km² maximum.\n\nVoulez-vous continuer quand même?`
    }

    // Zone moderately large (10-50km²) - warning but allow
    if (area > 10) {
      return `⚠️ Zone de ${area.toFixed(1)} km² détectée.\n\nLe scraping peut prendre 1-3 minutes.\n\nContinuer?`
    }

    return null
  }

  const geocodeCity = async (cityName: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
      )
      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lon: Number.parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.error("[v0] Geocoding error:", error)
      return null
    }
  }

  const enrichWithGrok = async (businesses: Business[]): Promise<Business[]> => {
    if (businesses.length === 0) return businesses

    setIsEnriching(true)
    setEnrichmentProgress({ current: 0, total: businesses.length })

    const enrichedBusinesses: Business[] = []

    // Process in batches of 5 to avoid rate limits
    const BATCH_SIZE = 5
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      const batch = businesses.slice(i, i + BATCH_SIZE)

      const batchPromises = batch.map(async (business, batchIndex) => {
        try {
          const response = await fetch("/api/enrich-with-grok", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ business }),
          })

          if (!response.ok) {
            console.error("[v0] Error enriching business:", business.name)
            return business
          }

          const data = await response.json()
          setEnrichmentProgress({ current: i + batchIndex + 1, total: businesses.length })
          return data.enrichedBusiness
        } catch (error) {
          console.error("[v0] Error enriching business:", error)
          return business
        }
      })

      const batchResults = await Promise.all(batchPromises)
      enrichedBusinesses.push(...batchResults)

      // Update results in real-time
      setResults([...enrichedBusinesses])
    }

    setIsEnriching(false)
    setEnrichmentProgress({ current: 0, total: 0 })

    return enrichedBusinesses
  }

  const scrapeWithGooglePlaces = async (
    location: { lat: number; lng: number },
    businessType: string,
    filters: SearchFilters,
  ) => {
    try {
      // Map business types to Google Places types
      const typeMapping: Record<string, string> = {
        cafe: "cafe",
        café: "cafe",
        restaurant: "restaurant",
        bar: "bar",
        boulangerie: "bakery",
        pharmacie: "pharmacy",
        banque: "bank",
        coiffeur: "hair_care",
        supermarche: "supermarket",
        supermarché: "supermarket",
        hotel: "lodging",
        hôtel: "lodging",
        magasin: "store",
      }

      const lowerType = businessType.toLowerCase()
      const googleType = typeMapping[lowerType] || ""

      console.log("[v0] Scraping with Google Places API:", { location, type: googleType, keyword: filters.keywords })

      const response = await fetch("/api/scrape-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          radius: 5000, // 5km radius
          type: googleType,
          keyword: filters.keywords,
          userId: user?.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors du scraping")
      }

      const data = await response.json()
      console.log("[v0] Google Places API response:", data)

      // Update duplicate and new counts
      setDuplicateCount(data.duplicateCount || 0)
      setNewCount(data.newCount || 0)

      // Convert to Business format
      let businesses: Business[] = data.businesses.map((b: any) => ({
        id: b.place_id,
        place_id: b.place_id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        website: b.website,
        email: b.email,
        lat: b.lat,
        lon: b.lon,
        rating: b.rating,
        user_ratings_total: b.user_ratings_total,
      }))

      if (filters.useGrokEnrichment && businesses.length > 0) {
        console.log("[v0] Enriching businesses with Grok AI...")
        businesses = await enrichWithGrok(businesses)
        console.log("[v0] Grok enrichment complete")
      }

      return businesses
    } catch (error: any) {
      console.error("[v0] Error scraping with Google Places:", error)
      throw error
    }
  }

  const scrapeMultipleChunks = async (
    chunks: Array<{ north: number; south: number; east: number; west: number }>,
    businessType: string,
    filters: SearchFilters,
  ) => {
    const allBusinesses: Business[] = []
    const seenIds = new Set<string>()

    setProgress({ current: 0, total: chunks.length })

    const BATCH_SIZE = 3

    for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
      const batch = chunks.slice(batchStart, batchStart + BATCH_SIZE)

      // Process batch in parallel
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = batchStart + batchIndex

        try {
          const lowerType = businessType.toLowerCase()
          let query = ""

          if (lowerType.includes("cafe") || lowerType.includes("café")) {
            query = `[out:json][timeout:60];(node["amenity"="cafe"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["amenity"="cafe"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("restaurant")) {
            query = `[out:json][timeout:60];(node["amenity"="restaurant"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["amenity"="restaurant"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("bar")) {
            query = `[out:json][timeout:60];(node["amenity"="bar"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["amenity"="bar"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("boulang")) {
            query = `[out:json][timeout:60];(node["shop"="bakery"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["shop"="bakery"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("pharmac")) {
            query = `[out:json][timeout:60];(node["amenity"="pharmacy"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["amenity"="pharmacy"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("banque")) {
            query = `[out:json][timeout:60];(node["amenity"="bank"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["amenity"="bank"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("coiff")) {
            query = `[out:json][timeout:60];(node["shop"="hairdresser"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["shop"="hairdresser"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("supermarche") || lowerType.includes("supermarché")) {
            query = `[out:json][timeout:60];(node["shop"="supermarket"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["shop"="supermarket"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("hotel") || lowerType.includes("hôtel")) {
            query = `[out:json][timeout:60];(node["tourism"="hotel"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["tourism"="hotel"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else if (lowerType.includes("magasin")) {
            query = `[out:json][timeout:60];(node["shop"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["shop"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          } else {
            query = `[out:json][timeout:60];(node["shop"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});way["shop"](${chunk.south},${chunk.west},${chunk.north},${chunk.east}););out center;`
          }

          const data = await fetchFromOverpass(query)

          const businesses: Business[] = data.elements
            .filter((element: any) => element.tags && element.tags.name)
            .map((element: any) => {
              // Extract phone with multiple possible tag names and clean formatting
              let phone =
                element.tags.phone ||
                element.tags["contact:phone"] ||
                element.tags.telephone ||
                element.tags["contact:telephone"] ||
                element.tags["phone:mobile"] ||
                element.tags["contact:mobile"] ||
                ""

              // Clean phone number (remove spaces, dots, dashes for consistency)
              if (phone && phone !== "Non disponible") {
                phone = phone.trim()
              } else {
                phone = "Non disponible"
              }

              // Extract website with multiple possible tag names and ensure proper URL format
              let website =
                element.tags.website ||
                element.tags["contact:website"] ||
                element.tags.url ||
                element.tags["contact:url"] ||
                element.tags["website:official"] ||
                ""

              if (website && website !== "Non disponible") {
                website = website.trim()
                // Ensure website has protocol
                if (website && !website.startsWith("http")) {
                  website = "https://" + website
                }
              } else {
                website = "Non disponible"
              }

              // Extract email with multiple possible tag names
              const email =
                element.tags.email ||
                element.tags["contact:email"] ||
                element.tags["contact:e-mail"] ||
                "Non disponible"

              // Get coordinates (handle both nodes and ways with center)
              const lat = element.lat || element.center?.lat || 0
              const lon = element.lon || element.center?.lon || 0

              return {
                id: element.id.toString(),
                name: element.tags.name || "Sans nom",
                address:
                  [
                    element.tags["addr:housenumber"],
                    element.tags["addr:street"],
                    element.tags["addr:postcode"],
                    element.tags["addr:city"],
                  ]
                    .filter(Boolean)
                    .join(" ") || "Adresse non disponible",
                phone,
                website,
                email,
                lat,
                lon,
              }
            })

          return { chunkIndex, businesses }
        } catch (error) {
          console.error(`[v0] Error fetching chunk ${chunkIndex + 1}:`, error)
          return { chunkIndex, businesses: [] }
        }
      })

      // Wait for all chunks in the batch to complete
      const batchResults = await Promise.all(batchPromises)

      // Process results and update progress
      for (const { chunkIndex, businesses } of batchResults) {
        // Remove duplicates
        businesses.forEach((business) => {
          if (!seenIds.has(business.id)) {
            seenIds.add(business.id)
            allBusinesses.push(business)
          }
        })

        setProgress({ current: chunkIndex + 1, total: chunks.length })
        setResults([...allBusinesses])
      }
    }

    let filteredBusinesses = allBusinesses
    if (filters.keywords) {
      const keywordLower = filters.keywords.toLowerCase()
      filteredBusinesses = filteredBusinesses.filter((b) => b.name.toLowerCase().includes(keywordLower))
    }

    if (filters.useGrokEnrichment) {
      console.log("[v0] Grok enrichment enabled - this feature will enhance data quality when implemented")
    }

    return filteredBusinesses
  }

  const handleSearch = useCallback(
    async (city: string, businessType: string, filters: SearchFilters, location?: { lat: number; lon: number }) => {
      console.log("[v0] handleSearch called with:", { city, businessType, filters, location })
      setIsLoading(true)
      setResults([])
      setDuplicateCount(0)
      setNewCount(0)
      setProgress({ current: 0, total: 1 })
      setShowGrokPrompt(false)
      setCanEnrich(false)

      try {
        let cityLocation = location
        if (!cityLocation) {
          console.log("[v0] Geocoding city:", city)
          cityLocation = await geocodeCity(city)
        }

        if (!cityLocation) {
          console.error("[v0] City not found:", city)
          alert("Ville non trouvée. Veuillez vérifier l'orthographe.")
          setIsLoading(false)
          return
        }

        console.log("[v0] City location:", cityLocation)
        setMapCenter(cityLocation)

        const businesses = await scrapeWithGooglePlaces(
          { lat: cityLocation.lat, lng: cityLocation.lon },
          businessType,
          { ...filters, useGrokEnrichment: false },
        )

        console.log("[v0] Search complete, found", businesses.length, "businesses")
        setResults(businesses)
        setProgress({ current: 1, total: 1 })

        if (businesses.length > 0) {
          setCanEnrich(true)
          setShowGrokPrompt(true)
        }

        // Save to history
        if (user) {
          try {
            await saveSearchHistory(user.id, city, businessType || "Tous", filters.keywords || null, businesses.length)
            console.log("[v0] Search history saved to database")
          } catch (error) {
            console.error("[v0] Error saving search history:", error)
          }
        }
      } catch (error: any) {
        console.error("[v0] Error searching businesses:", error)
        alert(`❌ Erreur lors de la recherche: ${error.message}`)
        setResults([])
      } finally {
        setIsLoading(false)
        setProgress({ current: 0, total: 0 })
      }
    },
    [user],
  )

  const handleEnrichWithGrok = async () => {
    if (results.length === 0) return

    setShowGrokPrompt(false)
    const enrichedBusinesses = await enrichWithGrok(results)
    setResults(enrichedBusinesses)
  }

  const handleZoneConfirm = useCallback(
    async (zone: { north: number; south: number; east: number; west: number }) => {
      console.log("[v0] handleZoneConfirm called with zone:", zone)
      setIsLoading(true)
      setResults([])
      setDuplicateCount(0)
      setNewCount(0)
      setProgress({ current: 0, total: 1 })

      try {
        // Calculate center of zone
        const centerLat = (zone.north + zone.south) / 2
        const centerLng = (zone.east + zone.west) / 2

        // Calculate radius (approximate)
        const latDiff = zone.north - zone.south
        const lngDiff = zone.east - zone.west
        const radius = (Math.max(latDiff, lngDiff) * 111000) / 2 // Convert to meters

        console.log("[v0] Zone center:", { lat: centerLat, lng: centerLng }, "radius:", radius)

        const businesses = await scrapeWithGooglePlaces({ lat: centerLat, lng: centerLng }, "", {})

        console.log("[v0] Zone scraping complete, found", businesses.length, "businesses")
        setResults(businesses)
        setProgress({ current: 1, total: 1 })

        if (businesses.length === 0) {
          alert("ℹ️ Aucun commerce trouvé dans cette zone. Essayez une zone plus grande ou différente.")
        }
      } catch (error: any) {
        console.error("[v0] Error fetching businesses:", error)
        alert(error.message || "❌ Erreur lors de la récupération des données. Veuillez réessayer.")
        setResults([])
      } finally {
        setIsLoading(false)
        setProgress({ current: 0, total: 0 })
      }
    },
    [user],
  )

  const handleExportCSV = useCallback(() => {
    if (results.length === 0) return

    const headers = [
      "Nom",
      "Adresse",
      "Téléphone",
      "Site Web",
      "Email",
      "Note",
      "Nombre d'avis",
      "Niveau de prix",
      "Catégorie",
      "Statut",
      "Horaires",
      "Latitude",
      "Longitude"
    ]
    const csvRows = [
      headers.join(";"),
      ...results.map((business) =>
        [
          `"${business.name.replace(/"/g, '""')}"`,
          `"${business.address.replace(/"/g, '""')}"`,
          `"${business.phone.replace(/"/g, '""')}"`,
          `"${business.website.replace(/"/g, '""')}"`,
          `"${business.email.replace(/"/g, '""')}"`,
          business.rating?.toString().replace(".", ",") || "",
          business.user_ratings_total?.toString() || "",
          business.price_level?.toString() || "",
          `"${business.category || business.types?.[0] || ""}"`,
          `"${business.business_status || ""}"`,
          `"${business.opening_hours || ""}"`,
          business.lat.toString().replace(".", ","),
          business.lon.toString().replace(".", ","),
        ].join(";"),
      ),
    ].join("\n")

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvRows], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `commerces_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [results])

  const handleExportToSheets = useCallback(async () => {
    if (results.length === 0) return

    try {
      const headers = [
        "Nom",
        "Adresse",
        "Téléphone",
        "Site Web",
        "Email",
        "Note",
        "Nombre d'avis",
        "Niveau de prix",
        "Catégorie",
        "Statut",
        "Horaires",
        "Latitude",
        "Longitude"
      ]
      const rows = results.map((business) => [
        business.name,
        business.address,
        business.phone,
        business.website,
        business.email,
        business.rating || "",
        business.user_ratings_total || "",
        business.price_level || "",
        business.category || business.types?.[0] || "",
        business.business_status || "",
        business.opening_hours || "",
        business.lat,
        business.lon,
      ])

      const sheetsData = [headers, ...rows].map((row) => row.join("\t")).join("\n")

      await navigator.clipboard.writeText(sheetsData)

      alert(
        "✅ Données copiées dans le presse-papier!\n\nVous pouvez maintenant:\n1. Ouvrir Google Sheets\n2. Créer une nouvelle feuille\n3. Coller les données (Ctrl+V ou Cmd+V)\n\nLes colonnes seront automatiquement séparées.",
      )
    } catch (error) {
      console.error("[v0] Error exporting to Sheets:", error)
      alert("❌ Erreur lors de la copie des données. Veuillez réessayer.")
    }
  }, [results])

  const handleCitySelect = (city: string, location: { lat: number; lon: number }) => {
    setMapCenter(location)
  }

  const handleExportHistory = () => {
    if (selectedHistoryIds.length === 0) {
      alert("Veuillez sélectionner au moins un élément de l'historique à exporter.")
      return
    }

    const saved = localStorage.getItem("searchHistory")
    if (!saved) return

    try {
      const history = JSON.parse(saved)
      const selectedItems = history.filter((item: any) => selectedHistoryIds.includes(item.id))

      const headers = ["Date", "Ville", "Type de commerce", "Mots-clés"]
      const csvRows = [
        headers.join(";"),
        ...selectedItems.map((item: any) =>
          [
            new Date(item.timestamp).toLocaleString("fr-FR"),
            `"${item.city}"`,
            `"${item.businessType || "Tous"}"`,
            `"${item.filters.keywords || ""}"`,
          ].join(";"),
        ),
      ].join("\n")

      const BOM = "\uFEFF"
      const blob = new Blob([BOM + csvRows], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `historique_recherches_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setSelectedHistoryIds([])
    } catch (error) {
      console.error("[v0] Error exporting history:", error)
      alert("❌ Erreur lors de l'export de l'historique.")
    }
  }

  const toggleHistorySelection = (id: number) => {
    setSelectedHistoryIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectAllHistory = () => {
    const saved = localStorage.getItem("searchHistory")
    if (!saved) return
    try {
      const history = JSON.parse(saved)
      setSelectedHistoryIds(history.map((item: any) => item.id))
    } catch (e) {
      console.error("[v0] Error selecting all history:", e)
    }
  }

  const deselectAllHistory = () => {
    setSelectedHistoryIds([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80 shadow-sm transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                Go To Scraping
              </h1>
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/5 rounded-full border border-primary/20 transition-all duration-300 hover:bg-primary/10">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/30" />
                  <span className="text-xs sm:text-sm font-medium text-primary truncate max-w-[150px]">{user.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <ThemeToggle />
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="gap-2 text-foreground transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setViewMode("search")}
              variant={viewMode === "search" ? "default" : "ghost"}
              className="gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Recherche</span>
            </Button>
            <Button
              onClick={() => setViewMode("map")}
              variant={viewMode === "map" ? "default" : "ghost"}
              className="gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm"
            >
              <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Carte</span>
            </Button>
            <Button
              onClick={() => setViewMode("history")}
              variant={viewMode === "history" ? "default" : "ghost"}
              className="gap-1.5 sm:gap-2 transition-all duration-200 text-xs sm:text-sm"
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Historique</span>
            </Button>
          </div>
        </div>
      </header>

      {viewMode === "history" ? (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1600px] mx-auto">
          <HistoryView
            onSearch={(city, businessType, keywords) => {
              setViewMode("search")
              handleSearch(city, businessType, { keywords })
            }}
          />
        </div>
      ) : viewMode === "search" ? (
        <>
          <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl shadow-sm transition-all duration-300">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1600px] mx-auto">
              <SearchBar onSearch={handleSearch} onCitySelect={handleCitySelect} isLoading={isLoading} />

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full justify-between transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Comment fonctionne le scraping ?</span>
                  </span>
                  {showExplanation ? (
                    <ChevronUp className="w-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>

                {showExplanation && (
                  <div className="mt-4 p-6 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg space-y-4 transition-all duration-300">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        Source des données : Google Places API
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Notre outil utilise l'<span className="font-medium text-foreground">API Google Places</span>{" "}
                        pour extraire les données de commerces depuis la base de données Google Maps. Les informations
                        récupérées incluent le nom, l'adresse, le téléphone, le site web, les notes et avis des
                        établissements.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        Détection des doublons
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Chaque établissement scrappé est enregistré dans la base de données avec son identifiant unique
                        Google (place_id). Si vous scrappez à nouveau un établissement déjà enregistré, le système le
                        détecte automatiquement et vous en informe, évitant ainsi les doublons.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        Limite de 100 résultats
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Pour optimiser les performances et respecter les quotas API, chaque recherche est limitée à{" "}
                        <span className="font-medium text-foreground">100 établissements maximum</span>. Si vous avez
                        besoin de plus de résultats, effectuez plusieurs recherches avec des critères différents.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        💡 <span className="font-medium">Astuce</span> : Les données Google Places sont généralement
                        plus complètes et à jour que celles d'OpenStreetMap, avec des informations de contact fiables et
                        des avis clients.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {statsDisplay}

              {showGrokPrompt && canEnrich && !isEnriching && (
                <div className="mt-6 p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/20 backdrop-blur-sm rounded-xl border border-primary/30 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Enrichir avec Grok AI ?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Grok AI peut analyser et enrichir vos {results.length} résultats avec :
                      </p>
                      <ul className="text-sm text-muted-foreground mb-4 space-y-1 ml-4">
                        <li>• Descriptions détaillées et points forts uniques</li>
                        <li>• Informations de contact manquantes (téléphone, email, site web)</li>
                        <li>• Meilleurs moments pour visiter et public cible</li>
                        <li>• Informations pratiques (parking, accessibilité, paiements)</li>
                        <li>• Spécialités et caractéristiques uniques</li>
                      </ul>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleEnrichWithGrok}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Enrichir maintenant
                        </Button>
                        <Button
                          onClick={() => setShowGrokPrompt(false)}
                          variant="outline"
                        >
                          Plus tard
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {(isLoading || isEnriching) && (
            <div className="bg-secondary/50 backdrop-blur-sm border-b border-border/50 transition-all duration-300">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {isEnriching
                      ? "Enrichissement des données avec Grok AI..."
                      : "Scraping avec Google Places API en cours..."}
                  </span>
                </div>
                {isEnriching && enrichmentProgress.total > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-foreground font-medium">
                        Enrichissement Grok {enrichmentProgress.current}/{enrichmentProgress.total}
                      </span>
                      <span className="text-muted-foreground font-semibold">
                        {Math.round((enrichmentProgress.current / enrichmentProgress.total) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(enrichmentProgress.current / enrichmentProgress.total) * 100}
                      className="h-2.5 bg-secondary"
                    />
                  </div>
                )}
                {isLoading && progress.total > 0 && !isEnriching && (
                  <Progress
                    value={(progress.current / progress.total) * 100}
                    className="mt-4 h-2.5 bg-secondary"
                  />
                )}
              </div>
            </div>
          )}

          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1600px] mx-auto">
            {results.length === 0 && !isLoading && (
              <div className="text-center p-8 sm:p-12 bg-card/40 backdrop-blur-sm rounded-2xl border border-dashed border-border/60 shadow-sm transition-all duration-300 hover:border-primary/30">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-300">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground font-medium">Commencez votre recherche</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Entrez une ville et un type de commerce, puis cliquez sur "Rechercher"
                  </p>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <ResultsList results={results} onExportCSV={handleExportCSV} onExportSheets={handleExportToSheets} />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Map View */}
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1600px] mx-auto">
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg transition-all duration-300 hover:shadow-xl">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">Sélection par zone</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Utilisez les outils de dessin pour sélectionner une zone sur la carte, puis cliquez sur "Confirmer" pour
                scraper les commerces dans cette zone.
              </p>
            </div>

            <div
              className="rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(22,163,74,0.15)]"
              style={{ height: "500px", minHeight: "400px" }}
            >
              <MapComponent
                onZoneConfirm={handleZoneConfirm}
                markers={results.map((r) => ({ lat: r.lat, lon: r.lon, name: r.name }))}
                selectedZone={selectedZone}
                centerLocation={mapCenter}
              />
            </div>

            {isLoading && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-secondary rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    Scraping avec Google Places API en cours...
                  </span>
                </div>
                {progress.total > 0 && (
                  <Progress
                    value={(progress.current / progress.total) * 100}
                    className="h-2.5 bg-secondary"
                  />
                )}
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <ResultsList results={results} onExportCSV={handleExportCSV} onExportSheets={handleExportToSheets} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
