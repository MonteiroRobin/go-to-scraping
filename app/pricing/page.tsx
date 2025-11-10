import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Zap, Shield, TrendingUp, Users, Sparkles } from "lucide-react"
import { PricingCardsGrid } from "@/components/pricing/pricing-cards-grid"
import { PricingFAQ } from "@/components/pricing/pricing-faq"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { USE_CASES, TRUST_STATS } from "@/lib/pricing-data"

export const metadata: Metadata = {
  title: "Tarifs - GoToScraping | Plans et Prix Transparents",
  description:
    "Choisissez le plan GoToScraping adapté à vos besoins. De gratuit à illimité, avec cache intelligent pour réduire vos coûts de 98%.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            Pricing Transparent
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Un plan pour chaque besoin
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Commencez gratuitement, upgradez quand vous voulez. <br />
            <span className="text-primary font-semibold">Le cache vous fait économiser jusqu'à 98% !</span>
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Aucune carte bancaire pour Free
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Annulation à tout moment
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Garantie satisfait ou remboursé 14j
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <PricingCardsGrid />
      </section>

      {/* Value Props */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pourquoi choisir GoToScraping ?
            </h2>
            <p className="text-lg text-muted-foreground">
              La plateforme de scraping la plus rentable du marché
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Cache intelligent</h3>
              <p className="text-muted-foreground mb-4">
                70% de vos recherches utilisent le cache partagé. Résultats instantanés pour seulement 1 crédit.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Données fraîches (&lt;7 jours)
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Base commune de 2M+ établissements
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Économie de 98% vs scraping à chaque fois
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Pricing flexible</h3>
              <p className="text-muted-foreground mb-4">
                Payez uniquement ce que vous utilisez. Scraping basique à 30 crédits ou complet à 50 crédits.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Changez de plan à tout moment
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Pas d'engagement minimum
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Crédits inutilisés reportés
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Support premium</h3>
              <p className="text-muted-foreground mb-4">
                Une équipe dédiée pour vous accompagner. De l'email au support 24/7 selon votre plan.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Documentation complète
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Réponse sous 24-48h
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  Intégrations personnalisées
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases / Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ils nous font confiance</h2>
            <p className="text-lg text-muted-foreground">Découvrez comment nos clients utilisent GoToScraping</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {USE_CASES.map((useCase, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-xl transition-all"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {useCase.credits}
                  </Badge>
                </div>

                <blockquote className="border-l-4 border-primary pl-4 mb-4">
                  <p className="text-sm text-foreground italic mb-2">"{useCase.testimonial}"</p>
                  <footer className="text-xs text-muted-foreground">— {useCase.author}</footer>
                </blockquote>

                <div className="text-sm font-semibold text-primary">{useCase.savings}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <PricingFAQ />

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Prêt à scraper intelligemment ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'entreprises qui utilisent GoToScraping pour enrichir leurs données. Commencez
              gratuitement, aucune carte bancaire requise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login?plan=free">
                <Button size="lg" className="gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/scraper">
                <Button size="lg" variant="outline" className="gap-2">
                  Voir une démo
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              500 crédits offerts • Pas de carte bancaire • Annulation à tout moment
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
