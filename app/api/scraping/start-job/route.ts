import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { CREDIT_COSTS } from "@/lib/credits-config"

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
    const { city, businessType, keywords, location, radius = 5000, userId, useCache = true } = body

    if (!city || !location?.lat || !location?.lon || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters: city, location, userId" },
        { status: 400 }
      )
    }

    console.log("[start-job] Creating scraping job for:", { city, businessType, userId })

    // Check cache first if useCache is true
    if (useCache) {
      const cacheCheckResponse = await fetch(`${req.nextUrl.origin}/api/scraping/check-cache`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, businessType, keywords, location, radius }),
      })

      const cacheData = await cacheCheckResponse.json()

      // If cache is fresh, return immediately without creating a job
      if (cacheData.cacheStatus === "fresh" && cacheData.businesses?.length > 0) {
        console.log("[start-job] Cache hit! Returning cached results")

        // Deduct credits BEFORE returning results
        const creditsAmount = CREDIT_COSTS.CACHE_FRESH
        const { data: deductionResult } = await supabase.rpc("deduct_credits", {
          p_user_id: userId,
          p_amount: creditsAmount,
          p_type: "scraping_cache_fresh",
          p_details: {
            city,
            business_type: businessType,
            keywords,
            result_count: cacheData.businesses.length,
            cache_status: "fresh",
          },
          p_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
          p_user_agent: req.headers.get("user-agent"),
        })

        // Check if deduction was successful
        if (!deductionResult || !deductionResult.success) {
          return NextResponse.json(
            {
              error: deductionResult?.error || "Failed to deduct credits",
              error_code: deductionResult?.error_code,
              required: creditsAmount,
              available: deductionResult?.credits_before,
              plan: deductionResult?.plan,
            },
            { status: 402 } // Payment Required
          )
        }

        console.log("[start-job] Credits deducted:", deductionResult)

        // Create a search record
        const { data: search, error: searchError } = await supabase
          .from("user_searches")
          .insert({
            user_id: userId,
            city,
            business_type: businessType,
            keywords,
            lat: location.lat,
            lon: location.lon,
            radius,
            result_count: cacheData.businesses.length,
            was_cached: true,
            cache_freshness: "fresh",
            credits_used: creditsAmount,
          })
          .select()
          .single()

        if (searchError) {
          console.error("[start-job] Error creating search record:", searchError)
        }

        return NextResponse.json({
          jobId: null,
          status: "completed",
          wasCached: true,
          cacheStatus: "fresh",
          results: cacheData.businesses,
          searchId: search?.id,
          creditsUsed: creditsAmount,
          creditsRemaining: deductionResult.credits_after,
        })
      }
    }

    // Check duplicate search before creating job
    const crypto = require("crypto")
    const searchHash = crypto
      .createHash("sha256")
      .update(`${city}:${businessType}:${radius}:${keywords || ""}`)
      .digest("hex")

    const { data: duplicateCheck } = await supabase.rpc("check_duplicate_search", {
      p_user_id: userId,
      p_search_hash: searchHash,
      p_search_params: { city, businessType, keywords, radius },
    })

    if (duplicateCheck?.should_block) {
      return NextResponse.json(
        {
          error: "Duplicate search detected",
          message: duplicateCheck.reason,
          last_search: duplicateCheck.last_search,
          wait_minutes: Math.ceil(duplicateCheck.wait_minutes || 0),
        },
        { status: 429 } // Too Many Requests
      )
    }

    // Deduct credits BEFORE creating job (prevents abuse)
    // Use BASIC scraping by default (30 crédits = 0.03€ vs 0.017€ API cost)
    const creditsAmount = CREDIT_COSTS.SCRAPING_BASIC
    const { data: deductionResult } = await supabase.rpc("deduct_credits", {
      p_user_id: userId,
      p_amount: creditsAmount,
      p_type: "scraping_new",
      p_details: {
        city,
        business_type: businessType,
        keywords,
        cache_status: "none",
      },
      p_ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      p_user_agent: req.headers.get("user-agent"),
    })

    // Check if deduction was successful
    if (!deductionResult || !deductionResult.success) {
      return NextResponse.json(
        {
          error: deductionResult?.error || "Failed to deduct credits",
          error_code: deductionResult?.error_code,
          required: creditsAmount,
          available: deductionResult?.credits_before,
          plan: deductionResult?.plan,
          daily_usage: deductionResult?.daily_usage,
          daily_limit: deductionResult?.daily_limit,
        },
        { status: 402 } // Payment Required
      )
    }

    console.log("[start-job] Credits reserved for new scraping:", deductionResult)

    // Create a scraping job
    const { data: job, error: jobError } = await supabase
      .from("scraping_jobs")
      .insert({
        user_id: userId,
        status: "pending",
        search_params: {
          city,
          businessType,
          keywords,
          location,
          radius,
        },
        progress_current: 0,
        progress_total: 100,
        credits_reserved: creditsAmount,
      })
      .select()
      .single()

    if (jobError) {
      console.error("[start-job] Error creating job:", jobError)
      // TODO: Refund credits if job creation failed
      return NextResponse.json({ error: "Failed to create scraping job" }, { status: 500 })
    }

    console.log("[start-job] Job created:", job.id)

    // TODO: Trigger actual scraping process (could be a queue, webhook, or edge function)
    // For now, we'll simulate by immediately processing the job
    // In production, this would be handled by a background worker

    // Simulate async processing by calling the scrape endpoint
    fetch(`${req.nextUrl.origin}/api/scraping/process-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id }),
    }).catch((err) => console.error("[start-job] Error triggering job processing:", err))

    return NextResponse.json({
      jobId: job.id,
      status: "pending",
      estimatedCredits: 10,
      message: "Scraping job créé. Vérifiez le statut avec /api/scraping/job-status",
    })
  } catch (error) {
    console.error("[start-job] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
