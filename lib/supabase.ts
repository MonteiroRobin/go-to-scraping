/**
 * Supabase Browser Client for Client-Side Operations
 *
 * ✅ SECURITY: This file correctly uses NEXT_PUBLIC_ env vars (safe for client)
 * ⚠️ IMPORTANT: Only use this for READ operations and public data
 *
 * For sensitive operations (credits, payments, etc.):
 * - Use API routes (app/api/*) with server-side Supabase client
 * - Enable Row Level Security (RLS) on all Supabase tables
 * - Use SUPABASE_SERVICE_ROLE_KEY only in API routes
 *
 * Fallback Strategy:
 * - If Supabase not configured, falls back to localStorage
 * - Useful for development/testing without full setup
 */

import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key"
  )
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    console.warn("[v0] Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return null
  }

  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClient
}

export interface SearchHistoryEntry {
  id: string
  user_id: string
  city: string
  business_type: string
  keywords: string | null
  result_count: number
  created_at: string
}

export async function saveSearchHistory(
  userId: string,
  city: string,
  businessType: string,
  keywords: string | null,
  resultsCount: number,
) {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    const entry: SearchHistoryEntry = {
      id: Date.now().toString(),
      user_id: userId,
      city,
      business_type: businessType,
      keywords,
      result_count: resultsCount,
      created_at: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem("search_history") || "[]")
    localStorage.setItem("search_history", JSON.stringify([entry, ...existing]))
    return entry
  }

  const { data, error } = await supabase
    .from("user_searches")
    .insert({
      user_id: userId,
      city,
      business_type: businessType,
      keywords,
      result_count: resultsCount,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error saving search history:", error)
    throw error
  }

  return data
}

export async function getSearchHistory(userId: string): Promise<SearchHistoryEntry[]> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    const history = JSON.parse(localStorage.getItem("search_history") || "[]")
    return history
  }

  const { data, error } = await supabase
    .from("user_searches")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching search history:", error)
    throw error
  }

  return data || []
}

export async function deleteSearchHistory(historyIds: string[]) {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    const history = JSON.parse(localStorage.getItem("search_history") || "[]")
    const filtered = history.filter((item: SearchHistoryEntry) => !historyIds.includes(item.id))
    localStorage.setItem("search_history", JSON.stringify(filtered))
    return
  }

  const { error } = await supabase.from("user_searches").delete().in("id", historyIds)

  if (error) {
    console.error("[v0] Error deleting search history:", error)
    throw error
  }
}
