/**
 * Configuration centrale du système de crédits
 *
 * Basée sur les coûts réels Google Places API :
 * - Basic Data (name, address, location): $0.017/request
 * - Basic + Contact (phone, website): $0.020/request
 * - Complete (+ photos, ratings): $0.025/request
 *
 * Stratégie de pricing : marge x2-x3 sur coûts API + profit sur cache
 */

export const CREDIT_COSTS = {
  // Cache operations (coût API = 0€, profit pur)
  CACHE_FRESH: 1, // <7 jours - Encourage l'usage du cache
  CACHE_STALE: 5, // 7-30 jours - Pénalise légèrement les vieilles données

  // Nouveau scraping (coûts API réels)
  SCRAPING_BASIC: 30, // 0.03€ vs 0.017€ API = marge 76%
  SCRAPING_COMPLETE: 50, // 0.05€ vs 0.025€ API = marge 100%

  // Enrichissement et exports
  ENRICHMENT_GROK_PER_BUSINESS: 10, // 0.01€ (coût Grok ~0.01€)
  EXPORT_CSV: 2, // Feature monétisée, coût 0€
  EXPORT_GOOGLE_SHEETS: 5, // Premium feature, coût 0€
} as const

export const DAILY_LIMITS = {
  free: 50,
  starter: 200,
  pro: 1000,
  business: 5000,
  enterprise: 999999,
} as const

export const PLAN_CREDITS = {
  free: 500,
  starter: 2500,
  pro: 10000,
  business: 50000,
  enterprise: 999999,
} as const

export type PlanType = keyof typeof PLAN_CREDITS

/**
 * Calcule le coût en crédits d'un scraping selon les paramètres
 */
export function calculateScrapingCost(options: {
  cacheStatus: "fresh" | "stale" | "none"
  includeContactData?: boolean
}): number {
  const { cacheStatus, includeContactData = false } = options

  if (cacheStatus === "fresh") {
    return CREDIT_COSTS.CACHE_FRESH
  }

  if (cacheStatus === "stale") {
    return CREDIT_COSTS.CACHE_STALE
  }

  // Nouveau scraping
  if (includeContactData) {
    return CREDIT_COSTS.SCRAPING_COMPLETE
  }

  return CREDIT_COSTS.SCRAPING_BASIC
}

/**
 * Messages d'erreur pour l'utilisateur
 */
export const CREDIT_ERROR_MESSAGES = {
  INSUFFICIENT_CREDITS: {
    title: "😔 Oops ! Crédits insuffisants",
    getMessage: (required: number, available: number) =>
      `Cette opération nécessite ${required} crédits, mais vous n'en avez que ${available}.`,
    suggestion: "💡 Astuce : 70% de nos recherches utilisent le cache (1-5 crédits) !",
    cta: "Recharger mes crédits",
  },
  DAILY_LIMIT_EXCEEDED: {
    title: "⏰ Limite journalière atteinte",
    getMessage: (usage: number, limit: number, resetIn: string) =>
      `Vous avez utilisé ${usage}/${limit} crédits aujourd'hui. Réinitialisation dans ${resetIn}.`,
    suggestion: "💎 Passez à un plan supérieur pour des limites plus élevées.",
    cta: "Voir les plans",
  },
  DUPLICATE_SEARCH: {
    title: "⚠️ Recherche identique détectée",
    getMessage: (minutesAgo: number, waitMinutes: number) =>
      `Vous avez lancé cette recherche il y a ${minutesAgo} minutes. Attendez ${waitMinutes} minutes ou utilisez les résultats précédents.`,
    suggestion: "💡 Astuce : Les résultats sont sauvegardés dans votre historique.",
    cta: "Voir l'historique",
  },
} as const

/**
 * Retourne le nom d'affichage d'un plan
 */
export function getPlanDisplayName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
  }
  return names[plan]
}

/**
 * Calcule le temps jusqu'à reset journalier
 */
export function getTimeUntilDailyReset(lastReset: Date): string {
  const now = new Date()
  const tomorrow = new Date(lastReset)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}
