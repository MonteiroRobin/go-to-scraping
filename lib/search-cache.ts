const CACHE_DURATION = 3600000 // 1 heure

export interface CachedSearch {
  data: any
  timestamp: number
}

export const getCachedSearch = (key: string): any | null => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(`search_${key}`)
    if (!cached) return null

    const { data, timestamp }: CachedSearch = JSON.parse(cached)

    // Vérifier si le cache est expiré
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`search_${key}`)
      return null
    }

    return data
  } catch (error) {
    console.error('[Cache] Error reading cache:', error)
    return null
  }
}

export const setCachedSearch = (key: string, data: any): void => {
  if (typeof window === 'undefined') return

  try {
    const cacheData: CachedSearch = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(`search_${key}`, JSON.stringify(cacheData))
  } catch (error) {
    console.error('[Cache] Error writing cache:', error)
  }
}

export const clearSearchCache = (): void => {
  if (typeof window === 'undefined') return

  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('search_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error)
  }
}

export const getCacheAge = (key: string): number | null => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(`search_${key}`)
    if (!cached) return null

    const { timestamp }: CachedSearch = JSON.parse(cached)
    return Date.now() - timestamp
  } catch (error) {
    return null
  }
}
