"use client"

import { useEffect, useRef, useState } from "react"
import { Square, RotateCcw, Check, Locate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
}

interface MapComponentProps {
  onZoneConfirm: (zone: { north: number; south: number; east: number; west: number }) => void
  markers?: Array<{ lat: number; lon: number; name: string }>
  centerLocation?: { lat: number; lon: number } | null
}

export function MapComponent({ onZoneConfirm, markers = [], centerLocation }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const drawingManagerRef = useRef<any | null>(null)
  const rectangleRef = useRef<any | null>(null)
  const markersRef = useRef<any[]>([])
  const [isMapReady, setIsMapReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [hasRectangle, setHasRectangle] = useState(false)
  const { theme } = useTheme()

  const darkMapStyles: any[] = [
    { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#C4B896" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#C4B896" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#1f1f1f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b6b6b" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1a1a1a" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3c3c3c" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f1f1f" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#C4B896" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f2f2f" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8a8a8a" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0f0f0f" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#0f0f0f" }],
    },
  ]

  const lightMapStyles: any[] = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#424242" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c9c9c9" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
  ]

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        if (typeof window !== "undefined" && window.google?.maps) {
          console.log("[v0] Google Maps already loaded")
          setIsMapReady(true)
          return
        }

        const response = await fetch("/api/maps-config")
        if (!response.ok) {
          throw new Error("Failed to fetch Maps configuration")
        }

        const { apiKey } = await response.json()

        if (!apiKey) {
          console.warn("[v0] No Google Maps API key provided")
          setLoadError("Clé API Google Maps manquante. Ajoutez GOOGLE_MAPS_API_KEY dans les variables d'environnement.")
          return
        }

        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing&v=weekly`
        script.async = true
        script.defer = true

        script.onload = () => {
          console.log("[v0] Google Maps loaded successfully")
          setIsMapReady(true)
        }

        script.onerror = () => {
          console.error("[v0] Failed to load Google Maps")
          setLoadError("Erreur de chargement de Google Maps. Vérifiez votre clé API.")
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error("[v0] Error loading Google Maps:", error)
        setLoadError("Erreur de chargement de la carte")
      }
    }

    loadGoogleMaps()
  }, []) // Removed apiKey dependency

  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return

    try {
      console.log("[v0] Initializing Google Maps...")

      const initialCenter = { lat: 48.8566, lng: 2.3522 } // Default: Paris

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            console.log("[v0] User location detected:", userLocation)
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter(userLocation)
              mapInstanceRef.current.setZoom(13)
            }
          },
          (error) => {
            console.log("[v0] Geolocation not available or denied:", error.message)
          },
        )
      }

      const map = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 13,
        styles: theme === "dark" ? darkMapStyles : lightMapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      })

      mapInstanceRef.current = map
      console.log("[v0] Google Maps initialized successfully")

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        rectangleOptions: {
          fillColor: theme === "dark" ? "#C4B896" : "#4A90E2",
          fillOpacity: 0.1,
          strokeWeight: 2,
          strokeColor: theme === "dark" ? "#C4B896" : "#4A90E2",
          clickable: false,
          editable: false,
          zIndex: 1,
        },
      })

      drawingManager.setMap(map)
      drawingManagerRef.current = drawingManager

      window.google.maps.event.addListener(drawingManager, "rectanglecomplete", (rectangle: any) => {
        if (rectangleRef.current) {
          rectangleRef.current.setMap(null)
        }

        rectangleRef.current = rectangle
        setHasRectangle(true)

        drawingManager.setDrawingMode(null)
        setSelectionMode(false)
      })
    } catch (error) {
      console.error("[v0] Error initializing Google Maps:", error)
      setLoadError("Erreur d'initialisation de la carte")
    }
  }, [isMapReady, theme])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    mapInstanceRef.current.setOptions({
      styles: theme === "dark" ? darkMapStyles : lightMapStyles,
    })

    if (rectangleRef.current) {
      rectangleRef.current.setOptions({
        fillColor: theme === "dark" ? "#C4B896" : "#4A90E2",
        strokeColor: theme === "dark" ? "#C4B896" : "#4A90E2",
      })
    }

    if (drawingManagerRef.current) {
      drawingManagerRef.current.setOptions({
        rectangleOptions: {
          fillColor: theme === "dark" ? "#C4B896" : "#4A90E2",
          fillOpacity: 0.1,
          strokeWeight: 2,
          strokeColor: theme === "dark" ? "#C4B896" : "#4A90E2",
          clickable: false,
          editable: false,
          zIndex: 1,
        },
      })
    }
  }, [theme])

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return

    markersRef.current.forEach((marker: any) => marker.setMap(null))
    markersRef.current = []

    markers.forEach((markerData: any) => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lon },
        map: mapInstanceRef.current,
        title: markerData.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: theme === "dark" ? "#C4B896" : "#4A90E2",
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      })

      markersRef.current.push(marker)
    })

    if (markers.length > 0 && mapInstanceRef.current) {
      const bounds = new window.google.maps.LatLngBounds()
      markers.forEach((marker: any) => {
        bounds.extend({ lat: marker.lat, lng: marker.lon })
      })
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [markers, theme])

  useEffect(() => {
    if (!mapInstanceRef.current || !centerLocation) return

    console.log("[v0] Centering map on:", centerLocation)
    mapInstanceRef.current.setCenter({ lat: centerLocation.lat, lng: centerLocation.lon })
    mapInstanceRef.current.setZoom(13)
  }, [centerLocation])

  const toggleSelectionMode = () => {
    if (!drawingManagerRef.current || !window.google) return

    const newMode = !selectionMode
    setSelectionMode(newMode)

    if (newMode) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.RECTANGLE)
    } else {
      drawingManagerRef.current.setDrawingMode(null)
    }
  }

  const handleReset = () => {
    if (rectangleRef.current) {
      rectangleRef.current.setMap(null)
      rectangleRef.current = null
      setHasRectangle(false)
    }
  }

  const handleConfirm = () => {
    if (!rectangleRef.current) return

    const bounds = rectangleRef.current.getBounds()
    if (!bounds) return

    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()

    const zone = {
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng(),
    }

    onZoneConfirm(zone)
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      alert("La géolocalisation n'est pas disponible sur votre navigateur")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        console.log("[v0] Centering on user location:", userLocation)
        mapInstanceRef.current?.setCenter(userLocation)
        mapInstanceRef.current?.setZoom(14)
      },
      (error) => {
        console.error("[v0] Geolocation error:", error)
        alert("Impossible d'obtenir votre position. Vérifiez les autorisations de localisation.")
      },
    )
  }

  return (
    <div className="relative w-full h-full bg-muted">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" style={{ minHeight: "400px" }} />

      {!isMapReady && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-20">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-primary text-sm font-medium">Chargement de Google Maps...</div>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-20">
          <div className="text-center space-y-2 p-4 max-w-md">
            <div className="text-destructive text-sm font-medium">{loadError}</div>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Réessayer
            </Button>
          </div>
        </div>
      )}

      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        {/* Locate Me Button */}
        <Button
          size="lg"
          onClick={handleLocateMe}
          disabled={!isMapReady}
          className="bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold gap-2 h-14 px-6"
          title="Me localiser"
        >
          <Locate className="w-5 h-5" />
          <span>Me localiser</span>
        </Button>

        {/* Rectangle Selection Tool */}
        <Button
          size="lg"
          onClick={toggleSelectionMode}
          disabled={!isMapReady}
          className={
            selectionMode
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-2 border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold gap-2 h-14 px-6"
              : "bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold gap-2 h-14 px-6"
          }
          title="Outil de sélection rectangle"
        >
          <Square className="w-5 h-5" />
          <span>{selectionMode ? "Sélection active" : "Sélectionner zone"}</span>
        </Button>

        {/* Reset Button */}
        <Button
          size="lg"
          onClick={handleReset}
          disabled={!hasRectangle}
          className="bg-white dark:bg-gray-900 hover:bg-orange-50 dark:hover:bg-gray-800 text-orange-600 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-900 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold gap-2 h-14 px-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Réinitialiser la sélection"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Réinitialiser</span>
        </Button>

        {/* Confirm Button */}
        <Button
          size="lg"
          onClick={handleConfirm}
          disabled={!hasRectangle}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-2 border-green-400 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold gap-2 h-14 px-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Confirmer la zone"
        >
          <Check className="w-5 h-5" />
          <span>Confirmer</span>
        </Button>
      </div>
    </div>
  )
}
