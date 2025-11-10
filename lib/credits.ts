import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!

export interface UserCredits {
  user_id: string
  credits_remaining: number
  credits_total: number
  credits_used: number
  plan: string
  last_refill_at: string
  created_at: string
}

/**
 * Récupère les crédits d'un utilisateur
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    console.error("[Credits] Error fetching credits:", error)
    return null
  }

  return data
}

/**
 * Consomme des crédits pour un scraping
 * @returns true si succès, false si pas assez de crédits
 */
export async function consumeCredits(userId: string, amount: number): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Vérifier d'abord si l'utilisateur a assez de crédits
  const credits = await getUserCredits(userId)

  if (!credits || credits.credits_remaining < amount) {
    return false
  }

  // Décrémenter les crédits
  const { error } = await supabase
    .from("user_credits")
    .update({
      credits_remaining: credits.credits_remaining - amount,
      credits_used: credits.credits_used + amount,
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[Credits] Error consuming credits:", error)
    return false
  }

  return true
}

/**
 * Calcule le coût d'un scraping en crédits
 *
 * LOGIQUE BASÉE SUR LES VRAIS COÛTS GOOGLE PLACES API:
 * - Basic Data: $0.017 par requête (20 places max)
 * - Contact Data: +$0.003 par requête
 * - 1 crédit = $0.01 (pour équilibrer coûts + marge)
 *
 * Donc:
 * - Requête basique (20 places) = 2 crédits ($0.017 ≈ 2 crédits)
 * - Avec contact data = 2 crédits ($0.020 ≈ 2 crédits)
 */
export function calculateScrapingCost(params: {
  radius: number
  includeContactData: boolean
  useEnrichment: boolean
}): number {
  // Coût de base : 2 crédits pour une requête (20 places)
  // Cela correspond à ~$0.02 de coût Google
  let cost = 2

  // Avec contact data, ça monte à $0.020, on reste à 2 crédits
  // (on absorbe le petit surcoût de $0.003 pour simplifier)

  // Pour les gros rayons (>10km), on pourrait avoir besoin de requêtes supplémentaires
  // Google limite à 20 résultats, donc pour plus de résultats = plus de requêtes
  if (params.radius > 10000) {
    const extraCost = Math.floor((params.radius - 10000) / 10000)
    cost += extraCost * 2 // +2 crédits par tranche de 10km supplémentaires
  }

  // L'enrichissement Grok est facturé séparément (2 crédits par lead enrichi)
  // On ne l'inclut pas ici car c'est une action post-scraping

  return cost
}

/**
 * Calcule le coût en euros d'un nombre de crédits
 * 1 crédit = €0.01
 */
export function creditsToEuros(credits: number): string {
  const euros = credits * 0.01
  return euros.toFixed(2) + "€"
}

/**
 * Calcule combien de crédits pour un montant en euros
 */
export function eurosToCredits(euros: number): number {
  return Math.floor(euros / 0.01)
}

/**
 * Ajoute des crédits à un utilisateur (pour les achats)
 */
export async function addCredits(userId: string, amount: number): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const credits = await getUserCredits(userId)

  if (!credits) {
    return false
  }

  const { error } = await supabase
    .from("user_credits")
    .update({
      credits_remaining: credits.credits_remaining + amount,
      credits_total: credits.credits_total + amount,
    })
    .eq("user_id", userId)

  if (error) {
    console.error("[Credits] Error adding credits:", error)
    return false
  }

  return true
}
