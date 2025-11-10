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

      <nav className="border-b border-border backdrop-blur-md bg-white/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <span className="text-xl font-semibold text-foreground">
              <ShimmerText>Go To Scraping</ShimmerText>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Blog
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                FAQ
              </Button>
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Équipe
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 relative z-10">
        <section className="py-20 text-center relative">
          <RevealOnScroll>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">Bêta privée - Accès limité</span>
                </div>

                {!isSubmitted ? (
                  <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="h-9 text-sm border focus:border-primary bg-white w-48"
                    />
                    <MagneticButton
                      type="submit"
                      disabled={isLoading}
                      size="sm"
                      className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold"
                    >
                      {isLoading ? "..." : "Démarrer →"}
                    </MagneticButton>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold">Inscrit !</span>
                  </div>
                )}
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-xl animate-gradient"></div>
                  <div className="relative flex items-center gap-4 p-6 md:p-8 bg-white/90 backdrop-blur-sm border-2 border-border/50 rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(22,163,74,0.15)]">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-left flex-1">
                      <MagicShimmer className="text-foreground/90">
                        Pêchez vos leads
                      </MagicShimmer>
                    </h1>
                    <Search className="w-12 h-12 md:w-16 md:h-16 text-primary flex-shrink-0 transition-transform duration-300 hover:scale-110" strokeWidth={2} />
                  </div>
                </div>
                <div className="text-2xl md:text-4xl lg:text-5xl font-normal italic text-foreground text-right">
                  <WordRotate
                    words={["Directement sur la carte", "En temps réel", "Sans limite", "Simplement"]}
                    className="underline decoration-primary decoration-2 underline-offset-8"
                  />
                </div>
              </div>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto pt-12">
                Tracez une zone sur Google Maps, <span className="font-semibold text-foreground">capturez tous les commerces</span> instantanément.
                Du scraping intelligent qui transforme une carte en base de données.
              </p>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Sans code</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Données en temps réel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Export instantané</span>
                </div>
              </div>

              <BlurFade delay={0.3} inView>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Rejoignez +<NumberTicker value={500} />+ utilisateurs en liste d'attente</span>
                </p>
              </BlurFade>
            </div>
          </RevealOnScroll>
        </section>

        {/* Marquee Section */}
        <section className="py-12 border-t border-border/50 bg-secondary/30 relative overflow-hidden">
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
                className="flex items-center gap-2 px-6 py-3 mx-3 bg-card/60 backdrop-blur-sm rounded-full border border-border/50 text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-shadow"
              >
                {feature}
              </div>
            ))}
          </Marquee>
        </section>

        <ParallaxSection speed={0.2} className="py-32 border-t border-border relative z-0">
          <div className="grid md:grid-cols-3 gap-8">
            <BlurFade delay={0.2} inView>
              <div className="group space-y-4 text-center p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/70 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(22,163,74,0.1)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Search className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Recherche intelligente
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tapez "café Paris" et récupérez automatiquement tous les établissements de la ville
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.3} inView>
              <div className="group space-y-4 text-center p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/70 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(22,163,74,0.1)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <MapPin className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Sélection par zone
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dessinez un rectangle sur la carte pour cibler précisément une zone géographique
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.4} inView>
              <div className="group space-y-4 text-center p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/70 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(22,163,74,0.1)]">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  <Download className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Export facile
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Exportez vos données en CSV ou copiez-les directement dans Google Sheets
                </p>
              </div>
            </BlurFade>
          </div>
        </ParallaxSection>

        {/* Spreadsheet Preview Section */}
        <section className="py-20 border-t border-border">
          <SpreadsheetPreview />
        </section>

        <section className="py-20 text-center border-t border-border">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-primary" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Accès anticipé disponible</h2>
            <p className="text-lg text-muted-foreground">
              Rejoignez la liste d'attente pour être parmi les premiers à utiliser Go To Scraping
            </p>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20 border-t border-border">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-3xl font-bold">
                  <GradientText>Derniers articles du blog</GradientText>
                </h2>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Guides, tutoriels et insights sur le web scraping et l'automatisation
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/blog/introduction-web-scraping-2025" className="group">
              <article className="border border-border rounded-lg p-6 hover:shadow-lg transition-all bg-card h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Guide
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Introduction au Web Scraping en 2025
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Découvrez les fondamentaux du web scraping et ses applications business
                </p>
                <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Lire l'article
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>

            <Link href="/blog/google-places-api-vs-scraping" className="group">
              <article className="border border-border rounded-lg p-6 hover:shadow-lg transition-all bg-card h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Comparaison
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Google Places API vs Web Scraping
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Quelle solution choisir pour collecter des données de commerces locaux ?
                </p>
                <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Lire l'article
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>

            <Link href="/blog/automatiser-prospection-commerciale" className="group">
              <article className="border border-border rounded-lg p-6 hover:shadow-lg transition-all bg-card h-full">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Business
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Automatiser votre Prospection Commerciale
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Techniques et outils pour générer des leads qualifiés automatiquement
                </p>
                <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Lire l'article
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="px-8">
                Voir tous les articles
              </Button>
            </Link>
          </div>
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
