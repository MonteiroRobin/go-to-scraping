"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { MapPin, Search, Download, Zap, Check, BookOpen, ArrowRight, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { ScrollProgress } from "@/components/ScrollProgress"
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from "@/components/BlogJsonLd"
import { ShimmerText as MagicShimmer } from "@/components/ui/shimmer-text"
import { WordRotate } from "@/components/ui/word-rotate"
import { BlurFade } from "@/components/ui/blur-fade"
import { NumberTicker } from "@/components/ui/number-ticker"
import { Marquee } from "@/components/ui/marquee"

// Lazy load heavy components
const FloatingDots = dynamic(() => import("@/components/InteractiveGrid").then(mod => ({ default: mod.FloatingDots })), { ssr: false })
const CustomCursor = dynamic(() => import("@/components/CustomCursor").then(mod => ({ default: mod.CustomCursor })), { ssr: false })
const MagneticButton = dynamic(() => import("@/components/MagneticButton").then(mod => ({ default: mod.MagneticButton })), { ssr: false })
const GradientText = dynamic(() => import("@/components/GradientText").then(mod => ({ default: mod.GradientText })), { ssr: false })
const ParallaxSection = dynamic(() => import("@/components/ParallaxSection").then(mod => ({ default: mod.ParallaxSection })), { ssr: false })
const RevealOnScroll = dynamic(() => import("@/components/RevealOnScroll").then(mod => ({ default: mod.RevealOnScroll })), { ssr: false })
const MapBackground = dynamic(() => import("@/components/MapBackground").then(mod => ({ default: mod.MapBackground })), { ssr: false })
const SpreadsheetPreview = dynamic(() => import("@/components/SpreadsheetPreview").then(mod => ({ default: mod.SpreadsheetPreview })), { ssr: false })
const Spotlight = dynamic(() => import("@/components/ui/spotlight").then(mod => ({ default: mod.Spotlight })), { ssr: false })

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/scraper")
    }
  }, [user, authLoading, router])

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const waitlist = JSON.parse(localStorage.getItem("waitlist") || "[]")
    if (!waitlist.includes(email)) {
      waitlist.push(email)
      localStorage.setItem("waitlist", JSON.stringify(waitlist))
    }

    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <Spotlight className="hidden md:block" />
      <MapBackground />
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <ScrollProgress />
      <FloatingDots />
      <CustomCursor />

      <nav className="border-b border-border/50 backdrop-blur-md bg-background/80 dark:bg-background/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
            </div>
            <span className="text-base sm:text-xl font-semibold text-foreground">
              <MagicShimmer>Go To Scraping</MagicShimmer>
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-4">
            <Link href="/pricing" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Tarifs
              </Button>
            </Link>
            <Link href="/blog" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Blog
              </Button>
            </Link>
            <Link href="/faq" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                FAQ
              </Button>
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm px-2 sm:px-3">
                Équipe
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <section className="py-12 sm:py-20 text-center relative">
          <RevealOnScroll>
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-xs sm:text-sm font-medium animate-pulse">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-semibold">Bêta privée - Accès limité</span>
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleWaitlistSubmit} className="flex gap-2 w-full sm:w-auto px-4 sm:px-0">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="h-9 text-xs sm:text-sm border focus:border-primary bg-background dark:bg-background/80 flex-1 sm:w-48"
                    />
                    <MagneticButton
                      type="submit"
                      disabled={isLoading}
                      size="sm"
                      className="h-9 px-3 sm:px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold whitespace-nowrap"
                    >
                      {isLoading ? "..." : "Démarrer →"}
                    </MagneticButton>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-xs sm:text-sm">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-semibold">Inscrit !</span>
                  </div>
                )}
              </div>

              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl sm:rounded-3xl blur-xl animate-gradient"></div>
                  <div className="relative flex items-center gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-background/90 dark:bg-background/60 backdrop-blur-sm border-2 border-border/50 dark:border-border/30 rounded-2xl sm:rounded-3xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(22,163,74,0.15)] dark:hover:shadow-[0_20px_50px_rgba(22,163,74,0.25)]">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-left flex-1">
                      <MagicShimmer className="text-foreground/90">
                        Pêchez vos leads
                      </MagicShimmer>
                    </h1>
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary flex-shrink-0 transition-transform duration-300 hover:scale-110" strokeWidth={2} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-normal italic text-foreground text-right px-4 sm:px-0">
                  <WordRotate
                    words={["Directement sur la carte", "En temps réel", "Sans limite", "Simplement"]}
                    className="underline decoration-primary decoration-2 underline-offset-4 sm:underline-offset-8"
                  />
                </div>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto pt-8 sm:pt-12 px-4 sm:px-0">
                Tracez une zone sur Google Maps, <span className="font-semibold text-foreground">capturez tous les commerces</span> instantanément.
                Du scraping intelligent qui transforme une carte en base de données.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-4 sm:pt-6 px-4 sm:px-0">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>Sans code</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>Données en temps réel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>Export instantané</span>
                </div>
              </div>

              <BlurFade delay={0.3} inView>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2 px-4 sm:px-0">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Rejoignez +<NumberTicker value={500} />+ utilisateurs en liste d'attente</span>
                </p>
              </BlurFade>
            </div>
          </RevealOnScroll>
        </section>

        {/* Marquee Section */}
        <section className="py-12 border-t border-border/50 bg-secondary/30 dark:bg-secondary/10 relative overflow-hidden">
          <BlurFade delay={0.1} inView>
            <div className="mb-8 text-center">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Fonctionnalités clés
              </p>
            </div>
          </BlurFade>
          <Marquee pauseOnHover className="[--duration:30s]">
            {[
              "🎯 Ciblage géographique précis",
              "⚡ Scraping temps réel",
              "📊 Export CSV & Google Sheets",
              "🔍 Recherche intelligente",
              "🗺️ Sélection par zone",
              "💾 Sauvegarde automatique",
              "🌐 Données Google Maps",
              "🚀 Interface intuitive",
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-6 py-3 mx-3 bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-full border border-border/50 dark:border-border/30 text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow"
              >
                {feature}
              </div>
            ))}
          </Marquee>
        </section>

        <ParallaxSection speed={0.2} className="py-16 sm:py-24 md:py-32 border-t border-border relative z-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <BlurFade delay={0.2} inView>
              <div className="group space-y-3 sm:space-y-4 text-center p-6 sm:p-8 rounded-2xl border border-border/50 dark:border-border/30 bg-card/40 dark:bg-card/20 backdrop-blur-md hover:bg-card/70 dark:hover:bg-card/40 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(22,163,74,0.1)] dark:hover:shadow-[0_10px_30px_rgba(22,163,74,0.2)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center mx-auto border border-primary/10 dark:border-primary/20 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 dark:group-hover:from-primary/30 dark:group-hover:to-primary/20 transition-all duration-300">
                  <Search className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Recherche intelligente
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Tapez "café Paris" et récupérez automatiquement tous les établissements de la ville
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.3} inView>
              <div className="group space-y-3 sm:space-y-4 text-center p-6 sm:p-8 rounded-2xl border border-border/50 dark:border-border/30 bg-card/40 dark:bg-card/20 backdrop-blur-md hover:bg-card/70 dark:hover:bg-card/40 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(22,163,74,0.1)] dark:hover:shadow-[0_10px_30px_rgba(22,163,74,0.2)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center mx-auto border border-primary/10 dark:border-primary/20 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 dark:group-hover:from-primary/30 dark:group-hover:to-primary/20 transition-all duration-300">
                  <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Sélection par zone
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Dessinez un rectangle sur la carte pour cibler précisément une zone géographique
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.4} inView>
              <div className="group space-y-3 sm:space-y-4 text-center p-6 sm:p-8 rounded-2xl border border-border/50 dark:border-border/30 bg-card/40 dark:bg-card/20 backdrop-blur-md hover:bg-card/70 dark:hover:bg-card/40 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(22,163,74,0.1)] dark:hover:shadow-[0_10px_30px_rgba(22,163,74,0.2)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center mx-auto border border-primary/10 dark:border-primary/20 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 dark:group-hover:from-primary/30 dark:group-hover:to-primary/20 transition-all duration-300">
                  <Download className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Export facile
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Exportez vos données en CSV ou copiez-les directement dans Google Sheets
                </p>
              </div>
            </BlurFade>
          </div>
        </ParallaxSection>

        {/* Spreadsheet Preview Section */}
        <section className="py-12 sm:py-16 md:py-20 border-t border-border">
          <SpreadsheetPreview />
        </section>

        <section className="py-12 sm:py-16 md:py-20 text-center border-t border-border">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-primary" strokeWidth={2} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Accès anticipé disponible</h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
              Rejoignez la liste d'attente pour être parmi les premiers à utiliser Go To Scraping
            </p>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-12 sm:py-16 md:py-20 border-t border-border">
          <RevealOnScroll>
            <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
              <div className="inline-flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold">
                  <GradientText>Derniers articles du blog</GradientText>
                </h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Guides, tutoriels et insights sur le web scraping et l'automatisation
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Link href="/blog/introduction-web-scraping-2025" className="group">
              <article className="border border-border dark:border-border/30 rounded-lg p-5 sm:p-6 hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all bg-card dark:bg-card/40 h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  Guide
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3 group-hover:text-foreground transition-colors">
                  Introduction au Web Scraping en 2025
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                  Découvrez les fondamentaux du web scraping et ses applications business
                </p>
                <div className="flex items-center text-xs sm:text-sm text-foreground font-medium group-hover:gap-2 transition-all">
                  Lire l'article
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>

            <Link href="/blog/google-places-api-vs-scraping" className="group">
              <article className="border border-border dark:border-border/30 rounded-lg p-5 sm:p-6 hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all bg-card dark:bg-card/40 h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  Comparaison
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3 group-hover:text-foreground transition-colors">
                  Google Places API vs Web Scraping
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                  Quelle solution choisir pour collecter des données de commerces locaux ?
                </p>
                <div className="flex items-center text-xs sm:text-sm text-foreground font-medium group-hover:gap-2 transition-all">
                  Lire l'article
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>

            <Link href="/blog/automatiser-prospection-commerciale" className="group">
              <article className="border border-border dark:border-border/30 rounded-lg p-5 sm:p-6 hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all bg-card dark:bg-card/40 h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 dark:border-primary/30 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  Business
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3 group-hover:text-foreground transition-colors">
                  Automatiser votre Prospection Commerciale
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                  Techniques et outils pour générer des leads qualifiés automatiquement
                </p>
                <div className="flex items-center text-xs sm:text-sm text-foreground font-medium group-hover:gap-2 transition-all">
                  Lire l'article
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>
          </div>

          <div className="text-center mt-8 sm:mt-12 px-4 sm:px-0">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="px-6 sm:px-8 text-sm sm:text-base">
                Voir tous les articles
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-8 sm:mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
          © 2025 Go To Scraping - Go To Agency. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
