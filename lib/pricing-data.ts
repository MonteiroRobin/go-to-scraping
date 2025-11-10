/**
 * Configuration complète des plans de pricing
 * Utilisé pour générer dynamiquement la page pricing
 */

export interface PricingFeature {
  text: string
  included: boolean
  tooltip?: string
}

export interface PricingPlan {
  id: string
  name: string
  tagline: string
  price: number
  priceId: string | null
  credits: number
  dailyLimit: number
  badge?: string
  features: PricingFeature[]
  cta: string
  highlighted: boolean
  isCustom?: boolean
  popular?: boolean
  bestValue?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Pour découvrir",
    price: 0,
    priceId: null,
    credits: 500,
    dailyLimit: 50,
    features: [
      { text: "500 crédits/mois", included: true },
      { text: "~16 scrapings basiques", included: true, tooltip: "Avec scraping basique à 30 crédits" },
      { text: "Cache illimité (1 crédit)", included: true },
      { text: "Limite 50 crédits/jour", included: true },
      { text: "Export CSV", included: true },
      { text: "Historique 7 jours", included: true },
      { text: "Support communauté", included: true },
      { text: "Export Google Sheets", included: false },
      { text: "Grok AI enrichment", included: false },
      { text: "API Access", included: false },
      { text: "Support prioritaire", included: false },
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour freelancers",
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "price_starter",
    credits: 2500,
    dailyLimit: 200,
    features: [
      { text: "2,500 crédits/mois", included: true },
      { text: "~83 scrapings basiques", included: true, tooltip: "Ou 50 scrapings complets" },
      { text: "Cache illimité", included: true },
      { text: "Limite 200 crédits/jour", included: true },
      { text: "Export CSV + Google Sheets", included: true },
      { text: "Grok AI enrichment", included: true },
      { text: "Historique 30 jours", included: true },
      { text: "Support email (48h)", included: true },
      { text: "Analytics basiques", included: true },
      { text: "API Access", included: false },
      { text: "Multi-utilisateurs", included: false },
    ],
    cta: "Essayer Starter",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour agences",
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_pro",
    credits: 10000,
    dailyLimit: 1000,
    badge: "POPULAIRE",
    features: [
      { text: "10,000 crédits/mois", included: true },
      { text: "~333 scrapings basiques", included: true, tooltip: "Ou 200 scrapings complets" },
      { text: "Tout de Starter", included: true },
      { text: "Limite 1,000 crédits/jour", included: true },
      { text: "API Access + Webhooks", included: true },
      { text: "Multi-utilisateurs (3 sièges)", included: true },
      { text: "Analytics avancés", included: true },
      { text: "Historique illimité", included: true },
      { text: "Support email prioritaire (24h)", included: true },
      { text: "Intégrations Zapier", included: true },
      { text: "Export automatisé", included: true },
    ],
    cta: "Passer à Pro",
    highlighted: true,
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    tagline: "Pour grandes agences",
    price: 399,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS || "price_business",
    credits: 50000,
    dailyLimit: 5000,
    badge: "MEILLEUR RAPPORT",
    features: [
      { text: "50,000 crédits/mois", included: true },
      { text: "~1,666 scrapings basiques", included: true, tooltip: "Ou 1,000 scrapings complets" },
      { text: "Tout de Pro", included: true },
      { text: "Limite 5,000 crédits/jour", included: true },
      { text: "Multi-utilisateurs illimité", included: true },
      { text: "White-label (sur demande)", included: true },
      { text: "Support téléphone", included: true },
      { text: "SLA 99.9%", included: true },
      { text: "Account manager dédié", included: true },
      { text: "Formations équipe", included: true },
      { text: "Intégrations custom", included: true },
    ],
    cta: "Passer à Business",
    highlighted: false,
    bestValue: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Solutions sur-mesure",
    price: 1499,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "price_enterprise",
    credits: 999999,
    dailyLimit: 999999,
    badge: "SUR-MESURE",
    features: [
      { text: "Crédits illimités", included: true },
      { text: "Scraping illimité", included: true },
      { text: "Tout de Business", included: true },
      { text: "Infrastructure dédiée", included: true },
      { text: "Déploiement on-premise", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Audit de sécurité", included: true },
      { text: "SLA 99.99% garanti", included: true },
      { text: "Support 24/7 (1h response)", included: true },
      { text: "Contrat annuel personnalisé", included: true },
      { text: "Formations on-site", included: true },
    ],
    cta: "Nous contacter",
    highlighted: false,
    isCustom: true,
  },
]

export const FAQ_ITEMS = [
  {
    question: "Comment fonctionnent les crédits ?",
    answer:
      "Chaque opération consomme des crédits : cache fresh (1 crédit), cache stale (5 crédits), nouveau scraping basique (30 crédits), scraping complet (50 crédits). Les crédits se rechargent automatiquement chaque mois.",
  },
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui ! Vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et nous calculons au prorata pour être équitable.",
  },
  {
    question: "Que se passe-t-il si je dépasse ma limite de crédits ?",
    answer:
      "Vous recevrez une notification à 80% de votre quota. Si vous atteignez 100%, vous pourrez acheter des packs de crédits supplémentaires ou upgrader votre plan. Pas de mauvaise surprise !",
  },
  {
    question: "Le cache est-il vraiment illimité ?",
    answer:
      "Oui ! Utiliser le cache ne coûte que 1-5 crédits selon la fraîcheur des données. C'est notre façon d'encourager l'utilisation efficace et de réduire les coûts pour tout le monde.",
  },
  {
    question: "Proposez-vous des réductions pour les associations ou étudiants ?",
    answer:
      "Absolument ! Nous offrons 50% de réduction pour les associations à but non-lucratif et les étudiants avec justificatif. Contactez-nous à contact@gotoscraping.com.",
  },
  {
    question: "Comment fonctionne la garantie satisfait ou remboursé ?",
    answer:
      "Vous avez 14 jours pour tester notre service. Si vous n'êtes pas satisfait, nous vous remboursons intégralement, sans poser de questions. C'est aussi simple que ça.",
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer:
      "Oui, nous prenons la sécurité très au sérieux. Toutes les données sont chiffrées en transit (SSL/TLS) et au repos. Nous sommes conformes RGPD et ne partageons jamais vos données avec des tiers.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer:
      "Oui, vous pouvez annuler à tout moment depuis votre tableau de bord. L'abonnement reste actif jusqu'à la fin de la période payée, puis vous passez automatiquement au plan Free.",
  },
  {
    question: "Offrez-vous une API ?",
    answer:
      "Oui ! À partir du plan Pro, vous avez accès à notre API REST complète avec webhooks. La documentation est disponible sur docs.gotoscraping.com.",
  },
  {
    question: "Quelle est la différence entre scraping basique et complet ?",
    answer:
      "Le scraping basique (30 crédits) récupère nom, adresse, localisation et notes. Le scraping complet (50 crédits) ajoute téléphone, site web, horaires et photos. Vous choisissez selon vos besoins !",
  },
]

export const USE_CASES = [
  {
    title: "Agence Immobilière",
    description:
      "Récupérez tous les restaurants, commerces et services autour de vos biens pour enrichir vos annonces.",
    credits: "Plan Pro recommandé",
    testimonial: "Nous enrichissons 50+ annonces par mois avec les commerces de proximité. Nos clients adorent !",
    author: "Marie L., Directrice d'agence",
    savings: "2h économisées par annonce",
  },
  {
    title: "Consultant Marketing",
    description: "Analysez la concurrence locale et identifiez les opportunités pour vos clients.",
    credits: "Plan Starter recommandé",
    testimonial: "J'ai mappé toute la concurrence de mes 5 clients en 2 heures. Le ROI est incroyable.",
    author: "Thomas B., Consultant indépendant",
    savings: "8h de recherche manuelle économisées",
  },
  {
    title: "Start-up Tech",
    description: "Construisez votre base de données B2B avec des milliers de contacts qualifiés.",
    credits: "Plan Business recommandé",
    testimonial:
      "Nous avons scraped 10,000+ entreprises en un mois. Le cache nous fait économiser 98% des coûts.",
    author: "David K., CTO",
    savings: "15,000€ vs achat de base de données",
  },
]

export const TRUST_STATS = [
  { value: "10,000+", label: "Scrapings par jour" },
  { value: "98%", label: "Uptime garanti" },
  { value: "2M+", label: "Établissements en cache" },
  { value: "24/7", label: "Support disponible" },
]
