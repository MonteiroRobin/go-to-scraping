import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeRange = searchParams.get('timeRange') || '30' // days

    // Récupérer les stats globales
    const { data: globalStats } = await supabase.from('global_stats').select('*').single()

    // Récupérer les top villes
    const { data: topCities } = await supabase.from('top_cities').select('*').limit(10)

    // Récupérer les top types de commerces
    const { data: topBusinessTypes } = await supabase.from('top_business_types').select('*').limit(10)

    // Stats utilisateur si userId fourni
    let userStats = null
    if (userId) {
      const { data: searches, count } = await supabase
        .from('search_analytics')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())

      const totalResults = searches?.reduce((sum, s) => sum + (s.results_count || 0), 0) || 0

      userStats = {
        totalSearches: count || 0,
        totalResults,
        recentSearches: searches?.slice(0, 10) || [],
      }
    }

    return NextResponse.json({
      global: globalStats || {},
      topCities: topCities || [],
      topBusinessTypes: topBusinessTypes || [],
      user: userStats,
    })
  } catch (error) {
    console.error('[Analytics] Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
