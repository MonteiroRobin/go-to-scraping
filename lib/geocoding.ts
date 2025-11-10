// Geocoding utilities pour centrer la carte sur une ville

export interface GeocodingResult {
  lat: number
  lon: number
  displayName: string
  boundingBox?: {
    north: number
    south: number
    east: number
    west: number
  }
}

/**
 * Geocode une ville avec Nominatim (OpenStreetMap)
 * Extrait automatiquement le nom de ville depuis une recherche
 */
export async function geocodeCity(searchQuery: string): Promise<GeocodingResult | null> {
  try {
    // Nettoyer la requête pour extraire la ville
    // Ex: "café à Paris" -> "Paris"
    const cityMatch = searchQuery.match(/(?:à|a)\s+([A-Za-zÀ-ÿ\s-]+)/i)
    const cityName = cityMatch ? cityMatch[1].trim() : searchQuery.trim()

    console.log('[Geocoding] Recherche ville:', cityName)

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: cityName,
          format: 'json',
          limit: '1',
          addressdetails: '1',
          'accept-language': 'fr',
        }),
      {
        headers: {
          'User-Agent': 'GoToScraping/1.0',
        },
      }
    )

    if (!response.ok) {
      console.error('[Geocoding] Erreur HTTP:', response.status)
      return null
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      console.log('[Geocoding] Aucun résultat trouvé')
      return null
    }

    const result = data[0]
    const boundingBox = result.boundingbox
      ? {
          south: parseFloat(result.boundingbox[0]),
          north: parseFloat(result.boundingbox[1]),
          west: parseFloat(result.boundingbox[2]),
          east: parseFloat(result.boundingbox[3]),
        }
      : undefined

    const geocodingResult: GeocodingResult = {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      boundingBox,
    }

    console.log('[Geocoding] Résultat:', geocodingResult)
    return geocodingResult
  } catch (error) {
    console.error('[Geocoding] Erreur:', error)
    return null
  }
}

/**
 * Villes populaires françaises avec coordonnées pré-définies
 */
export const POPULAR_CITIES: Record<
  string,
  { lat: number; lon: number; displayName: string }
> = {
  paris: { lat: 48.8566, lon: 2.3522, displayName: 'Paris, France' },
  lyon: { lat: 45.764, lon: 4.8357, displayName: 'Lyon, France' },
  marseille: { lat: 43.2965, lon: 5.3698, displayName: 'Marseille, France' },
  toulouse: { lat: 43.6047, lon: 1.4442, displayName: 'Toulouse, France' },
  nice: { lat: 43.7102, lon: 7.262, displayName: 'Nice, France' },
  nantes: { lat: 47.2184, lon: -1.5536, displayName: 'Nantes, France' },
  bordeaux: { lat: 44.8378, lon: -0.5792, displayName: 'Bordeaux, France' },
  lille: { lat: 50.6292, lon: 3.0573, displayName: 'Lille, France' },
  strasbourg: { lat: 48.5734, lon: 7.7521, displayName: 'Strasbourg, France' },
  montpellier: { lat: 43.6108, lon: 3.8767, displayName: 'Montpellier, France' },
}

/**
 * Récupère les coordonnées d'une ville populaire
 */
export function getPopularCity(cityName: string): GeocodingResult | null {
  const normalized = cityName.toLowerCase().trim()
  const city = POPULAR_CITIES[normalized]
  return city || null
}
