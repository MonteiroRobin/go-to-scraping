import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function GET(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    // Get user from session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("sb-access-token")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user ID from JWT token
    const token = sessionCookie.value
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get credit stats using RPC function
    const { data: stats, error: statsError } = await supabase.rpc("get_user_credit_stats", {
      p_user_id: user.id,
    })

    if (statsError) {
      console.error("[credits/stats] Error fetching stats:", statsError)
      return NextResponse.json({ error: "Failed to fetch credit stats" }, { status: 500 })
    }

    if (!stats || Object.keys(stats).length === 0) {
      // User not found in user_credits table, create default entry
      const { data: newCredits, error: createError } = await supabase
        .from("user_credits")
        .insert({
          user_id: user.id,
          credits_remaining: 500,
          credits_total: 500,
          plan: "free",
          daily_usage: 0,
        })
        .select()
        .single()

      if (createError) {
        console.error("[credits/stats] Error creating user_credits:", createError)
        return NextResponse.json({ error: "Failed to initialize credits" }, { status: 500 })
      }

      return NextResponse.json({
        credits_remaining: 500,
        credits_total: 500,
        plan: "free",
        daily_usage: 0,
        daily_limit: 50,
        last_daily_reset: new Date().toISOString(),
        subscription_status: "active",
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[credits/stats] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
