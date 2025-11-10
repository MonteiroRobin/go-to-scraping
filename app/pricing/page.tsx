import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Zap, Shield, TrendingUp, Users, Sparkles, Clock, DollarSign } from "lucide-react"
import { PricingCardsGrid } from "@/components/pricing/pricing-cards-grid"
import { PricingFAQ } from "@/components/pricing/pricing-faq"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { USE_CASES, TRUST_STATS } from "@/lib/pricing-data"
import { BlurFade } from "@/components/ui/blur-fade"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { NumberTicker } from "@/components/ui/number-ticker"

export const metadata: Metadata = {
  title: "Tarifs - GoToScraping | Plans et Prix Transparents",
  description:
    "Choisissez le plan GoToScraping adapté à vos besoins. De gratuit à illimité, avec cache intelligent pour réduire vos coûts de 98%.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar simple comme landing */}
      <nav className="border-b border-border/50 backdrop-blur-md bg-background/80 dark:bg-background/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-base sm:text-xl font-bold">
              <ShimmerText>Go To Scraping</ShimmerText>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                Accueil
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="default" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero Section - Style landing page */}
        <section className="py-12 sm:py-16 md:py-20 text-center">
          <BlurFade delay={0.1} inView>
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/50 text-foreground text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold">Pricing Transparent</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground px-4 sm:px-0">
                Un plan pour chaque besoin
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Commencez gratuitement, upgradez quand vous voulez. <br className="hidden sm:block" />
                <span className="text-foreground font-semibold">Le cache vous fait économiser jusqu'à 98% !</span>
              </p>

              {/* Trust indicators - noir et blanc */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground pt-4 sm:pt-6 px-4 sm:px-0">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                  <span>Aucune carte bancaire pour Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                  <span>Annulation à tout moment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
                  <span>Garantie 14 jours</span>
                </div>
              </div>
            </div>
          </BlurFade>
        </section>

        {/* Pricing Cards */}
        <section className="py-12">
          <PricingCardsGrid />
        </section>

        {/* Value Props - Style landing page */}
        <section className="py-12 sm:py-16 md:py-20 border-t border-border">
          <BlurFade delay={0.2} inView>
            <div className="text-center mb-10 sm:mb-16 px-4 sm:px-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Pourquoi choisir GoToScraping ?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">La plateforme de scraping la plus rentable du marché</p>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <BlurFade delay={0.3} inView>
              <div className="group space-y-3 sm:space-y-4 text-center p-6 sm:p-8 rounded-2xl border border-border/50 dark:border-border/30 bg-card/40 dark:bg-card/20 backdrop-blur-md hover:bg-card/70 dark:hover:bg-card/40 hover:border-foreground/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Cache intelligent</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  70% de vos recherches utilisent le cache partagé. Résultats instantanés pour seulement 1 crédit.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground text-left">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Données fraîches (&lt;7 jours)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Base de 2M+ établissements
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Économie de 98% vs scraping à chaque fois
                  </li>
                </ul>
              </div>
            </BlurFade>

            <BlurFade delay={0.4} inView>
              <div className="group space-y-3 sm:space-y-4 text-center p-6 sm:p-8 rounded-2xl border border-border/50 dark:border-border/30 bg-card/40 dark:bg-card/20 backdrop-blur-md hover:bg-card/70 dark:hover:bg-card/40 hover:border-foreground/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Pricing honnête</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Pas de frais cachés. Seulement ce que vous consommez. Annulez ou changez de plan à tout moment.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground text-left">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Sans engagement
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Rollover des crédits inutilisés
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Remboursement sous 14 jours
                  </li>
                </ul>
              </div>
            </BlurFade>

            <BlurFade delay={0.5} inView>
              <div className="group space-y-3 sm:space-y-4 text-center p-6 sm:p-8 rounded-2xl border border-border/50 dark:border-border/30 bg-card/40 dark:bg-card/20 backdrop-blur-md hover:bg-card/70 dark:hover:bg-card/40 hover:border-foreground/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-foreground/5 dark:bg-foreground/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-foreground" strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Support premium</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Équipe dédiée pour vous aider. Email, chat ou appel. Réponse en moins de 2h.
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground text-left">
                  <li className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Support par email 24/7
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Chat en direct (Pro+)
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-foreground mt-0.5 flex-shrink-0" />
                    Onboarding personnalisé (Enterprise)
                  </li>
                </ul>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="py-20 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_STATS.map((stat, i) => (
              <BlurFade key={i} delay={0.1 * (i + 1)} inView>
                <div className="text-center space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-foreground">
                    <NumberTicker value={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>

        {/* Use Cases - Style landing */}
        <section className="py-20 border-t border-border">
          <BlurFade delay={0.2} inView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ils utilisent GoToScraping</h2>
              <p className="text-lg text-muted-foreground">Témoignages de nos utilisateurs</p>
            </div>
          </BlurFade>

          <div className="grid md:grid-cols-3 gap-8">
            {USE_CASES.slice(0, 3).map((useCase, i) => (
              <BlurFade key={i} delay={0.3 + 0.1 * i} inView>
                <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-xl font-bold">
                      {useCase.company?.[0] || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{useCase.company}</h3>
                      <p className="text-sm text-muted-foreground">{useCase.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">&ldquo;{useCase.quote}&rdquo;</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-border">
          <BlurFade delay={0.2} inView>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Questions fréquentes</h2>
              <p className="text-lg text-muted-foreground">Tout ce que vous devez savoir</p>
            </div>
          </BlurFade>
          <PricingFAQ />
        </section>

        {/* Final CTA - Style landing */}
        <section className="py-20 border-t border-border">
          <BlurFade delay={0.2} inView>
            <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-foreground/5 via-foreground/3 to-transparent border border-border/50 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Prêt à commencer ?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Rejoignez les centaines d'entreprises qui font confiance à GoToScraping
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="gap-2">
                    Commencer gratuitement
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" size="lg">
                    Voir la FAQ complète
                  </Button>
                </Link>
              </div>
            </div>
          </BlurFade>
        </section>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          © 2025 Go To Scraping - Go To Agency. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
