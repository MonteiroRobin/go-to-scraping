import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

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

    const { jobId } = await req.json()

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 })
    }

    console.log("[process-job] Starting job:", jobId)

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from("scraping_jobs")
      .select("*")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Update job status to processing
    await supabase
      .from("scraping_jobs")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("id", jobId)

    const params = job.search_params
    const { city, businessType, keywords, location, radius = 5000 } = params

    try {
      // Call the existing scrape-places API
      // IMPORTANT: We pass skipCreditDeduction to avoid double charging
      // Credits were already deducted in start-job/route.ts
      const scrapeResponse = await fetch(`${req.nextUrl.origin}/api/scrape-places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: { lat: location.lat, lng: location.lon },
          radius,
          type: businessType,
          keyword: keywords,
          userId: job.user_id,
          skipCreditDeduction: true, // ✅ Prevents double charging
        }),
      })

      if (!scrapeResponse.ok) {
        throw new Error(`Scraping failed: ${scrapeResponse.statusText}`)
      }

      const scrapeData = await scrapeResponse.json()
      console.log("[process-job] Scraping completed:", scrapeData.businesses?.length, "businesses")

      // Store businesses in global_businesses and get their IDs
      const businessIds: string[] = []
      let newBusinessesCount = 0
      let cachedBusinessesCount = 0

      if (scrapeData.businesses && scrapeData.businesses.length > 0) {
        for (const business of scrapeData.businesses) {
          // Use upsert function to insert or update
          const { data: upsertedBusiness, error: upsertError } = await supabase.rpc("upsert_business", {
            p_place_id: business.place_id || business.id,
            p_name: business.name,
            p_address: business.address,
            p_phone: business.phone,
            p_website: business.website,
            p_email: business.email,
            p_lat: business.lat,
            p_lon: business.lon,
            p_rating: business.rating,
            p_user_ratings_total: business.user_ratings_total,
            p_price_level: business.price_level,
            p_business_status: business.business_status,
            p_types: business.types || [],
            p_opening_hours: business.opening_hours || null,
            p_photos: business.photos || [],
          })

          if (upsertError) {
            console.error("[process-job] Error upserting business:", upsertError)
            continue
          }

          businessIds.push(upsertedBusiness)

          // Track if new or cached
          if (scrapeData.duplicateCount && scrapeData.duplicateCount > 0) {
            cachedBusinessesCount++
          } else {
            newBusinessesCount++
          }
        }
      }

      // Create user search record
      const { data: search, error: searchError } = await supabase
        .from("user_searches")
        .insert({
          user_id: job.user_id,
          city,
          business_type: businessType,
          keywords,
          lat: location.lat,
          lon: location.lon,
          radius,
          business_ids: businessIds,
          result_count: businessIds.length,
          was_cached: false,
          cache_freshness: "new",
          credits_used: 10,
        })
        .select()
        .single()

      if (searchError) {
        console.error("[process-job] Error creating search record:", searchError)
      }

      // Update job as completed
      await supabase
        .from("scraping_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          search_id: search?.id,
          new_businesses_count: newBusinessesCount,
          cached_businesses_count: cachedBusinessesCount,
          progress_current: 100,
          progress_total: 100,
        })
        .eq("id", jobId)

      console.log("[process-job] Job completed successfully:", jobId)

      return NextResponse.json({
        success: true,
        jobId,
        businessCount: businessIds.length,
        newBusinessesCount,
        cachedBusinessesCount,
      })
    } catch (error: any) {
      console.error("[process-job] Error processing job:", error)

      // Update job as failed
      await supabase
        .from("scraping_jobs")
        .update({
          status: "failed",
          error_message: error.message || "Unknown error",
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId)

      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (error) {
    console.error("[process-job] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
