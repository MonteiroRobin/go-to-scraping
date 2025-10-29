let lastSearchTime = 0
const THROTTLE_DELAY = 2000 // 2 secondes

export const canSearch = (): { allowed: boolean; remaining: number } => {
  const now = Date.now()
  const timeSinceLastSearch = now - lastSearchTime

  if (timeSinceLastSearch < THROTTLE_DELAY) {
    const remaining = Math.ceil((THROTTLE_DELAY - timeSinceLastSearch) / 1000)
    return { allowed: false, remaining }
  }

  lastSearchTime = now
  return { allowed: true, remaining: 0 }
}

export const resetThrottle = (): void => {
  lastSearchTime = 0
}
