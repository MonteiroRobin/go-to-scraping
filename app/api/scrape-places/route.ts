import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { consumeCredits, calculateScrapingCost } from "@/lib/credits"

const PLACE_API_KEY = process.env.PLACE_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { location, radius, type, keyword, userId, includeContactData = false } = await request.json()

    if (!PLACE_API_KEY) {
      return NextResponse.json({ error: "PLACE_API_KEY not configured" }, { status: 500 })
    }

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 })
    }

    // Calculer le coût en crédits
    const cost = calculateScrapingCost({
      radius: radius || 5000,
      includeContactData,
      useEnrichment: false,
    })

    // Vérifier et consommer les crédits
    if (userId) {
      const success = await consumeCredits(userId, cost)
      if (!success) {
        return NextResponse.json(
          { error: "Crédits insuffisants", requiredCredits: cost },
          { status: 402 } // Payment Required
        )
      }
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const newApiUrl = "https://places.googleapis.com/v1/places:searchNearby"

    // Build request body for new API
    const requestBody: any = {
      locationRestriction: {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: radius || 5000,
        },
      },
      maxResultCount: 20, // Max 20 per request in new API
    }

    if (type && type !== "establishment") {
      requestBody.includedTypes = [type]
    }

    // Field mask - OPTIMIZED for cost reduction
    // Basic Data SKU: $0.017 per request (47% cheaper!)
    const basicFields = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.location",
      "places.types",
    ]

    // Contact Data SKU: +$0.003 per request (only if needed)
    const contactFields = [
      "places.internationalPhoneNumber",
      "places.websiteUri",
      "places.currentOpeningHours",
    ]

    // Atmosphere Data SKU: +$0.005 per request (only if needed)
    const atmosphereFields = ["places.rating", "places.userRatingCount", "places.photos"]

    // Build field mask based on request type
    let fieldMask: string
    if (includeContactData) {
      // Complete scraping: Basic + Contact + Atmosphere (0.025€)
      fieldMask = [...basicFields, ...contactFields, ...atmosphereFields].join(",")
    } else {
      // Basic scraping: Only essential fields (0.017€)
      // Include rating for sorting but skip expensive contact data
      fieldMask = [...basicFields, "places.rating", "places.userRatingCount"].join(",")
    }

    console.log("[v0] Fetching from Google Places API (New):", newApiUrl)
    console.log("[v0] Request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(newApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": PLACE_API_KEY,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] Google Places API error:", data)
      return NextResponse.json(
        { error: `Google Places API error: ${data.error?.message || response.statusText}` },
        { status: response.status },
      )
    }

    if (!data.places || data.places.length === 0) {
      return NextResponse.json({ businesses: [], duplicates: [], newCount: 0, duplicateCount: 0 })
    }

    // Process results from new API format
    const businesses = data.places.map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || "Sans nom",
      address: place.formattedAddress || "Adresse non disponible",
      phone: place.internationalPhoneNumber || "Non disponible",
      website: place.websiteUri || "Non disponible",
      email: "Non disponible", // Google Places doesn't provide email
      lat: place.location?.latitude || 0,
      lon: place.location?.longitude || 0,
      rating: place.rating || null,
      user_ratings_total: place.userRatingCount || 0,
    }))

    // Limit to 100 results
    const validBusinesses = businesses.slice(0, 100)

    // Check for duplicates in database
    const placeIds = validBusinesses.map((b: any) => b.place_id)
    const { data: existingBusinesses } = await supabase
      .from("scraped_businesses")
      .select("place_id, name, scrape_count")
      .in("place_id", placeIds)

    const existingPlaceIds = new Set(existingBusinesses?.map((b) => b.place_id) || [])
    const duplicates = validBusinesses.filter((b: any) => existingPlaceIds.has(b.place_id))
    const newBusinesses = validBusinesses.filter((b: any) => !existingPlaceIds.has(b.place_id))

    // Insert new businesses into database
    if (newBusinesses.length > 0) {
      const businessesToInsert = newBusinesses.map((b: any) => ({
        place_id: b.place_id,
        name: b.name,
        address: b.address,
        phone: b.phone,
        website: b.website,
        email: b.email,
        lat: b.lat,
        lon: b.lon,
        business_type: type || "general",
        rating: b.rating,
        user_ratings_total: b.user_ratings_total,
        user_id: userId,
      }))

      const { error: insertError } = await supabase.from("scraped_businesses").insert(businessesToInsert)

      if (insertError) {
        console.error("[v0] Error inserting businesses:", insertError)
      }
    }

    // Update scrape count for duplicates
    if (duplicates.length > 0) {
      for (const duplicate of duplicates) {
        await supabase
          .from("scraped_businesses")
          .update({ last_scraped_at: new Date().toISOString() })
          .eq("place_id", duplicate.place_id)
      }
    }

    console.log(
      `[v0] Scraping complete: ${newBusinesses.length} new, ${duplicates.length} duplicates, ${validBusinesses.length} total`,
    )

    return NextResponse.json({
      businesses: validBusinesses,
      duplicates: duplicates.map((d: any) => d.place_id),
      newCount: newBusinesses.length,
      duplicateCount: duplicates.length,
      totalCount: validBusinesses.length,
    })
  } catch (error: any) {
    console.error("[v0] Error in scrape-places API:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
