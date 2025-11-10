import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function POST(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await req.json()
    const { city, businessType, location, radius = 5000, keywords } = body

    if (!city || !location?.lat || !location?.lon) {
      return NextResponse.json(
        { error: "Missing required parameters: city, location (lat, lon)" },
        { status: 400 }
      )
    }

    console.log("[check-cache] Checking cache for:", { city, businessType, keywords, radius })

    // Calculate bounding box for location search
    // Approximate: 1 degree = 111km
    const radiusInDegrees = radius / 111000
    const minLat = location.lat - radiusInDegrees
    const maxLat = location.lat + radiusInDegrees
    const minLon = location.lon - radiusInDegrees
    const maxLon = location.lon + radiusInDegrees

    // Query global_businesses for cached data
    let query = supabase
      .from("global_businesses")
      .select("*")
      .gte("lat", minLat)
      .lte("lat", maxLat)
      .gte("lon", minLon)
      .lte("lon", maxLon)

    // Filter by business type if provided
    if (businessType) {
      // Map business types to Google Places types
      const typeMapping: Record<string, string[]> = {
        restaurant: ["restaurant", "food"],
        cafe: ["cafe", "coffee"],
        café: ["cafe", "coffee"],
        bar: ["bar", "night_club"],
        boulangerie: ["bakery"],
        pharmacie: ["pharmacy"],
        banque: ["bank"],
        coiffeur: ["hair_care", "beauty_salon"],
        supermarche: ["supermarket", "grocery"],
        supermarché: ["supermarket", "grocery"],
        hotel: ["lodging", "hotel"],
        hôtel: ["lodging", "hotel"],
        magasin: ["store", "shop"],
      }

      const types = typeMapping[businessType.toLowerCase()] || [businessType.toLowerCase()]
      query = query.overlaps("types", types)
    }

    // Filter by keywords if provided
    if (keywords) {
      query = query.or(`name.ilike.%${keywords}%,address.ilike.%${keywords}%`)
    }

    const { data: businesses, error } = await query.limit(100)

    if (error) {
      console.error("[check-cache] Supabase error:", error)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    console.log("[check-cache] Found", businesses?.length || 0, "cached businesses")

    // Calculate cache freshness
    let cacheStatus: "fresh" | "stale" | "none" = "none"
    let avgFreshnessHours = 0

    if (businesses && businesses.length > 0) {
      const now = new Date().getTime()
      const freshnessValues = businesses.map((b) => {
        const updated = new Date(b.last_updated_at).getTime()
        return (now - updated) / (1000 * 60 * 60) // hours
      })

      avgFreshnessHours = freshnessValues.reduce((a, b) => a + b, 0) / freshnessValues.length

      // Determine cache status
      if (avgFreshnessHours < 168) {
        // < 7 days
        cacheStatus = "fresh"
      } else if (avgFreshnessHours < 720) {
        // < 30 days
        cacheStatus = "stale"
      } else {
        cacheStatus = "none"
      }
    }

    // Calculate credits needed
    let creditsNeeded = 10 // Default for new scraping
    if (cacheStatus === "fresh") {
      creditsNeeded = 1
    } else if (cacheStatus === "stale") {
      creditsNeeded = 3
    }

    // Transform businesses to match expected format
    const formattedBusinesses = businesses?.map((b) => ({
      id: b.place_id || b.id,
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
      price_level: b.price_level,
      business_status: b.business_status,
      types: b.types,
      opening_hours: b.opening_hours,
      photos: b.photos,
      category: b.category,
      description: b.description,
      tags: b.tags,
      enriched: b.enriched,
    }))

    return NextResponse.json({
      cacheStatus,
      cachedCount: businesses?.length || 0,
      avgFreshnessHours: Math.round(avgFreshnessHours),
      creditsNeeded,
      businesses: cacheStatus === "fresh" ? formattedBusinesses : [], // Only return businesses if fresh
      message:
        cacheStatus === "fresh"
          ? `${businesses?.length} résultats en cache (frais)`
          : cacheStatus === "stale"
            ? `${businesses?.length} résultats en cache (données de ${Math.round(avgFreshnessHours / 24)} jours)`
            : "Aucune donnée en cache, scraping nécessaire",
    })
  } catch (error) {
    console.error("[check-cache] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
