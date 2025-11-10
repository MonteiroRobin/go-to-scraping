import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function GET(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get("jobId")

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 })
    }

    // Fetch job from database
    const { data: job, error } = await supabase
      .from("scraping_jobs")
      .select("*")
      .eq("id", jobId)
      .single()

    if (error || !job) {
      console.error("[job-status] Job not found:", jobId, error)
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Fetch results if job is completed
    let results = null
    if (job.status === "completed" && job.search_id) {
      const { data: search } = await supabase
        .from("user_searches")
        .select("business_ids")
        .eq("id", job.search_id)
        .single()

      if (search?.business_ids && search.business_ids.length > 0) {
        // Fetch businesses by IDs
        const { data: businesses } = await supabase
          .from("global_businesses")
          .select("*")
          .in("id", search.business_ids)

        results = businesses?.map((b) => ({
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
      }
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      searchParams: job.search_params,
      progress: {
        current: job.progress_current || 0,
        total: job.progress_total || 100,
      },
      newBusinessesCount: job.new_businesses_count,
      cachedBusinessesCount: job.cached_businesses_count,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      completedAt: job.completed_at,
      results,
    })
  } catch (error) {
    console.error("[job-status] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
