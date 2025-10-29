"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { SearchBar, type SearchFilters } from "@/components/search-bar"
import { Download, Loader2, LogOut, MapPin, History, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { Progress } from "@/components/ui/progress"
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from "@/lib/toast-utils"
import { getCachedSearch, setCachedSearch, getCacheAge } from "@/lib/search-cache"
import { canSearch } from "@/lib/throttle"

const MapComponent = dynamic(() => import("@/components/map-component").then(mod => ({ default: mod.MapComponent })), {
  loading: () => <div className="w-full h-full bg-muted flex items-center justify-center">Chargement de la carte...</div>,
  ssr: false
})

const ResultsList = dynamic(() => import("@/components/results-list").then(mod => ({ default: mod.ResultsList })), {
  loading: () => <div className="p-4 text-muted-foreground">Chargement des résultats...</div>,
  ssr: false
})

export interface Business {
  id: string
  name: string
  address: string
  phone: string
  website: string
  lat: number
  lon: number
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
]

export function ScraperInterface() {
  const { user, logout } = useAuth()
  const [results, setResults] = useState<Business[]>([])
  const [totalFound, setTotalFound] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [selectedZone, setSelectedZone] = useState<{
    north: number
    south: number
    east: number
    west: number
  } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<number[]>([])

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

  const scrapeMultipleChunks = async (
    chunks: Array<{ north: number; south: number; east: number; west: number }>,
    businessType: string,
    filters: SearchFilters,
  ) => {
    const allBusinesses: Business[] = []
    const seenIds = new Set<string>()

    setProgress({ current: 0, total: chunks.length })

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      try {
        const lowerType = businessType.toLowerCase()
        let query = ""

        if (lowerType.includes("cafe") || lowerType.includes("café")) {
          query = `[out:json][timeout:60];node["amenity"="cafe"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("restaurant")) {
          query = `[out:json][timeout:60];node["amenity"="restaurant"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("bar")) {
          query = `[out:json][timeout:60];node["amenity"="bar"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("boulang")) {
          query = `[out:json][timeout:60];node["shop"="bakery"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("pharmac")) {
          query = `[out:json][timeout:60];node["amenity"="pharmacy"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("banque")) {
          query = `[out:json][timeout:60];node["amenity"="bank"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("coiff")) {
          query = `[out:json][timeout:60];node["shop"="hairdresser"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("supermarche") || lowerType.includes("supermarché")) {
          query = `[out:json][timeout:60];node["shop"="supermarket"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("hotel") || lowerType.includes("hôtel")) {
          query = `[out:json][timeout:60];node["tourism"="hotel"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else if (lowerType.includes("magasin")) {
          query = `[out:json][timeout:60];node["shop"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        } else {
          query = `[out:json][timeout:60];node["shop"](${chunk.south},${chunk.west},${chunk.north},${chunk.east});out;`
        }

        const data = await fetchFromOverpass(query)

        const businesses: Business[] = data.elements
          .filter((element: any) => element.tags && element.tags.name)
          .map((element: any) => {
            // Extract phone with multiple possible tag names
            const phone =
              element.tags.phone ||
              element.tags["contact:phone"] ||
              element.tags.telephone ||
              element.tags["contact:telephone"] ||
              "Non disponible"

            // Extract website with multiple possible tag names
            const website =
              element.tags.website ||
              element.tags["contact:website"] ||
              element.tags.url ||
              element.tags["contact:url"] ||
              "Non disponible"

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
              lat: element.lat,
              lon: element.lon,
            }
          })

        // Remove duplicates
        businesses.forEach((business) => {
          if (!seenIds.has(business.id)) {
            seenIds.add(business.id)
            allBusinesses.push(business)
          }
        })

        setProgress({ current: i + 1, total: chunks.length })
        setResults([...allBusinesses])

        // Small delay between requests to avoid overloading the API
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.error(`[v0] Error fetching chunk ${i + 1}:`, error)
        // Continue with next chunk even if one fails
      }
    }

    let filteredBusinesses = allBusinesses
    if (filters.keywords) {
      const keywordLower = filters.keywords.toLowerCase()
      filteredBusinesses = filteredBusinesses.filter((b) => b.name.toLowerCase().includes(keywordLower))
    }

    return filteredBusinesses.slice(0, 10) // Limit to 10 results
  }

  const handleSearch = async (
    city: string,
    businessType: string,
    filters: SearchFilters,
    location?: { lat: number; lon: number },
  ) => {
    console.log("[v0] handleSearch called with:", { city, businessType, filters, location })

    // Prevent double-click
    if (isSearching) {
      showWarningToast("Recherche en cours", "Veuillez patienter...")
      return
    }

    // Rate limiting
    const { allowed, remaining } = canSearch()
    if (!allowed) {
      showWarningToast("Trop rapide!", `Veuillez attendre ${remaining}s avant de relancer une recherche`)
      return
    }

    // Check cache
    const cacheKey = `${city}-${businessType}-${JSON.stringify(filters)}`
    const cached = getCachedSearch(cacheKey)
    if (cached) {
      const age = getCacheAge(cacheKey)
      const minutes = Math.floor((age || 0) / 60000)
      showInfoToast("Résultats du cache", `Recherche effectuée il y a ${minutes} minute(s)`)
      setResults(cached)
      setTotalFound(cached.length)
      return
    }

    setIsSearching(true)
    setIsLoading(true)
    setResults([])
    setProgress({ current: 0, total: 0 })

    try {
      let cityLocation = location
      if (!cityLocation) {
        console.log("[v0] Geocoding city:", city)
        cityLocation = await geocodeCity(city)
      }

      if (!cityLocation) {
        console.error("[v0] City not found:", city)
        showErrorToast("Ville non trouvée", "Veuillez vérifier l'orthographe ou sélectionner une ville dans l'autocomplétion")
        setIsLoading(false)
        setIsSearching(false)
        return
      }

      console.log("[v0] City location:", cityLocation)
      setMapCenter(cityLocation)

      const latOffset = 0.045 // ~5km
      const lonOffset = 0.045
      const zone = {
        north: cityLocation.lat + latOffset,
        south: cityLocation.lat - latOffset,
        east: cityLocation.lon + lonOffset,
        west: cityLocation.lon - lonOffset,
      }

      console.log("[v0] Search zone:", zone)
      const chunks = splitIntoChunks(zone)
      console.log("[v0] Split into", chunks.length, "chunks")

      const businesses = await scrapeMultipleChunks(chunks, businessType, filters)

      console.log("[v0] Search complete, found", businesses.length, "businesses")
      setResults(businesses)
      setTotalFound(businesses.length)
      setSelectedZone(zone)

      // Save to cache
      setCachedSearch(cacheKey, businesses)

      // Show limit warning if needed
      if (businesses.length === 10) {
        showWarningToast("Limite atteinte", "10 résultats affichés. Version bêta limitée pour préserver les quotas API")
      }

      // Save search history
      const saved = localStorage.getItem("searchHistory")
      const history = saved ? JSON.parse(saved) : []
      const newEntry = {
        id: history.length + 1,
        timestamp: Date.now(),
        city,
        businessType,
        filters,
      }
      history.push(newEntry)
      localStorage.setItem("searchHistory", JSON.stringify(history))
    } catch (error: any) {
      console.error("[v0] Error searching businesses:", error)
      showErrorToast("Erreur lors de la recherche", error.message || "Veuillez réessayer dans quelques instants")
      setResults([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const handleZoneConfirm = async (zone: { north: number; south: number; east: number; west: number }) => {
    console.log("[v0] handleZoneConfirm called with zone:", zone)

    const validationError = validateZone(zone)
    if (validationError) {
      if (validationError.includes("trop petite")) {
        showWarningToast("Zone trop petite", "Veuillez dessiner une zone plus grande (minimum 100m x 100m)")
        return
      }
      // For warnings, show toast and continue
      showWarningToast("Zone importante", validationError.split('\n')[0])
    }

    setSelectedZone(zone)
    setIsLoading(true)
    setResults([])
    setProgress({ current: 0, total: 0 })

    try {
      const chunks = splitIntoChunks(zone)
      const area = calculateZoneArea(zone)
      console.log(`[v0] Zone area: ${area.toFixed(2)} km², split into ${chunks.length} chunks`)

      const businesses = await scrapeMultipleChunks(chunks, "", {})

      console.log("[v0] Zone scraping complete, found", businesses.length, "businesses")
      setResults(businesses)

      if (businesses.length === 0) {
        showInfoToast("Aucun commerce trouvé", "Essayez une zone plus grande ou une autre zone")
      }
    } catch (error: any) {
      console.error("[v0] Error fetching businesses:", error)
      showErrorToast("Erreur de récupération", error.message || "Veuillez réessayer dans quelques instants")
      setResults([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const handleExportCSV = () => {
    if (results.length === 0) return

    const headers = ["Nom", "Adresse", "Téléphone", "Site Web", "Latitude", "Longitude"]
    const csvRows = [
      headers.join(";"),
      ...results.map((business) =>
        [
          `"${business.name.replace(/"/g, '""')}"`,
          `"${business.address.replace(/"/g, '""')}"`,
          `"${business.phone.replace(/"/g, '""')}"`,
          `"${business.website.replace(/"/g, '""')}"`,
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
  }

  const handleExportToSheets = async () => {
    if (results.length === 0) return

    try {
      const headers = ["Nom", "Adresse", "Téléphone", "Site Web", "Latitude", "Longitude"]
      const rows = results.map((business) => [
        business.name,
        business.address,
        business.phone,
        business.website,
        business.lat,
        business.lon,
      ])

      const sheetsData = [headers, ...rows].map((row) => row.join("\t")).join("\n")

      await navigator.clipboard.writeText(sheetsData)

      showSuccessToast("Données copiées!", "Vous pouvez maintenant coller dans Google Sheets (Ctrl+V)")
    } catch (error) {
      console.error("[v0] Error exporting to Sheets:", error)
      showErrorToast("Erreur de copie", "Impossible de copier les données. Veuillez réessayer.")
    }
  }

  const handleCitySelect = (city: string, location: { lat: number; lon: number }) => {
    setMapCenter(location)
  }

  const handleExportHistory = () => {
    if (selectedHistoryIds.length === 0) {
      showWarningToast("Aucune sélection", "Veuillez sélectionner au moins un élément de l'historique")
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
      showSuccessToast("Historique exporté!", `${selectedItems.length} recherche(s) exportée(s) en CSV`)
    } catch (error) {
      console.error("[v0] Error exporting history:", error)
      showErrorToast("Erreur d'export", "Impossible d'exporter l'historique")
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                Business Scraper
              </h1>
              {user && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/40 rounded-full border border-blue-200 dark:border-blue-700">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-200">{user.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 border-b border-amber-600 dark:border-amber-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3 text-white">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
              <span className="text-xs font-bold uppercase tracking-wider">Beta</span>
            </div>
            <p className="text-sm font-medium">
              Version bêta - Limité à 10 résultats pour préserver les crédits API gratuits
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-border/40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <SearchBar onSearch={handleSearch} onCitySelect={handleCitySelect} isLoading={isLoading} />

          <div className="mt-6">
            <Button
              id="history-button"
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full justify-between border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 bg-white dark:bg-gray-800"
              aria-label="Afficher ou masquer l'historique des recherches"
            >
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-foreground">Historique des recherches</span>
              </span>
              <span className="text-xs text-muted-foreground">{showHistory ? "Masquer" : "Afficher"}</span>
            </Button>

            {showHistory && (
              <div className="mt-4 p-6 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-md">
                {(() => {
                  const saved = localStorage.getItem("searchHistory")
                  if (!saved) return <p className="text-sm text-muted-foreground text-center py-4">Aucun historique</p>

                  try {
                    const history = JSON.parse(saved)
                    if (history.length === 0) {
                      return <p className="text-sm text-muted-foreground text-center py-4">Aucun historique</p>
                    }

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {selectedHistoryIds.length > 0
                                ? `${selectedHistoryIds.length} sélectionné${selectedHistoryIds.length > 1 ? "s" : ""}`
                                : `${history.length} recherche${history.length > 1 ? "s" : ""}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedHistoryIds.length > 0 ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={deselectAllHistory}
                                  className="text-xs h-8 bg-transparent"
                                >
                                  Désélectionner tout
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleExportHistory}
                                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs h-8 gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Exporter la sélection
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={selectAllHistory}
                                className="text-xs h-8 bg-transparent"
                              >
                                Tout sélectionner
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                          {history.map((entry: any) => (
                            <div
                              key={entry.id}
                              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                selectedHistoryIds.includes(entry.id)
                                  ? "bg-blue-50 dark:bg-blue-900/40 border-blue-300 dark:border-blue-600 shadow-sm"
                                  : "bg-white dark:bg-gray-800 border-border hover:border-blue-200 dark:hover:border-blue-700"
                              }`}
                              onClick={() => toggleHistorySelection(entry.id)}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedHistoryIds.includes(entry.id)}
                                  onChange={() => toggleHistorySelection(entry.id)}
                                  className="mt-1 w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-700"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-foreground">
                                      {entry.businessType || "Tous les commerces"}
                                    </span>
                                    <span className="text-muted-foreground">à</span>
                                    <span className="font-medium text-blue-600 dark:text-blue-400">{entry.city}</span>
                                  </div>
                                  {entry.filters.keywords && (
                                    <div className="text-sm text-muted-foreground mb-1">
                                      Mots-clés: {entry.filters.keywords}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  } catch (e) {
                    console.error("[v0] Error loading history:", e)
                    return <p className="text-sm text-red-500 text-center py-4">Erreur de chargement de l'historique</p>
                  }
                })()}
              </div>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-6 flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700 shadow-md">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                    {results.length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {results.length === 1 ? "commerce trouvé" : "commerces trouvés"}
                  </div>
                </div>

                {isLoading && progress.total > 0 && (
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        Zone {progress.current}/{progress.total}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {Math.round((progress.current / progress.total) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(progress.current / progress.total) * 100}
                      className="h-2.5 bg-blue-100 dark:bg-blue-950"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {progress.total > 0
                  ? `Scraping en cours... Zone ${progress.current}/${progress.total}`
                  : "Initialisation de la recherche..."}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="rounded-2xl overflow-hidden border border-border/40 shadow-2xl" style={{ height: "700px" }}>
          <MapComponent
            onZoneConfirm={handleZoneConfirm}
            markers={results.map((r) => ({ lat: r.lat, lon: r.lon, name: r.name }))}
            selectedZone={selectedZone}
            centerLocation={mapCenter}
          />
        </div>

        {results.length === 0 && !isLoading && (
          <div className="mt-8 text-center p-12 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/30 dark:to-gray-800 rounded-2xl border border-dashed border-blue-300 dark:border-blue-700 shadow-sm">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-blue-900 dark:text-blue-200 font-medium">Commencez votre recherche</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Sélectionnez une ville et cliquez sur "Rechercher" ou dessinez une zone sur la carte
              </p>
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <div className="rounded-2xl overflow-hidden border border-border/40 shadow-xl bg-white dark:bg-gray-800">
            <ResultsList results={results} onExportCSV={handleExportCSV} onExportSheets={handleExportToSheets} />
          </div>
        </div>
      )}
    </div>
  )
}
