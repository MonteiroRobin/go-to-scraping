import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      userId,
      searchQuery,
      cityDetected,
      businessType,
      resultsCount,
      cachedResults,
      newResults,
      latitude,
      longitude,
      zoneSizeKm2,
      searchDurationMs,
    } = body

    // Validation
    if (!userId || !searchQuery) {
      return NextResponse.json({ error: 'userId and searchQuery are required' }, { status: 400 })
    }

    // Insérer dans search_analytics
    const { data, error } = await supabase
      .from('search_analytics')
      .insert({
        user_id: userId,
        search_query: searchQuery,
        city_detected: cityDetected || null,
        business_type: businessType || null,
        results_count: resultsCount || 0,
        cached_results: cachedResults || 0,
        new_results: newResults || 0,
        latitude: latitude || null,
        longitude: longitude || null,
        zone_size_km2: zoneSizeKm2 || null,
        search_duration_ms: searchDurationMs || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Analytics] Error tracking search:', error)
      return NextResponse.json({ error: 'Failed to track search' }, { status: 500 })
    }

    return NextResponse.json({ success: true, searchId: data.id })
  } catch (error) {
    console.error('[Analytics] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
