"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Search, Download, Zap, Check, BookOpen, ArrowRight, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { AnimatedText } from "@/components/AnimatedText"
import { FloatingDots } from "@/components/InteractiveGrid"
import { ScrollProgress } from "@/components/ScrollProgress"
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from "@/components/BlogJsonLd"
import { CustomCursor } from "@/components/CustomCursor"
import { MagneticButton } from "@/components/MagneticButton"
import { GradientText, ShimmerText } from "@/components/GradientText"
import { Tilt3D } from "@/components/Tilt3D"
import { ParallaxSection } from "@/components/ParallaxSection"
import { RevealOnScroll } from "@/components/RevealOnScroll"

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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <ScrollProgress />
      <FloatingDots />
      <CustomCursor />

      <nav className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-40">
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

      <main className="max-w-6xl mx-auto px-6">
        <section className="py-20 text-center relative">
          <RevealOnScroll>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">Bêta privée - Accès limité</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] text-balance">
                <span className="block mb-4">
                  <GradientText animated>Transformez Google Maps</GradientText>
                </span>
                <span className="block">
                  <ShimmerText className="text-foreground">en machine à leads</ShimmerText>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                <span className="font-semibold text-foreground">Des milliers de contacts qualifiés</span> en quelques clics.
                Sélectionnez une zone, scrapez, exportez. Simple. Puissant. Automatique.
              </p>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-4">
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

              {!isSubmitted ? (
                <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto pt-8">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="flex-1 h-14 text-lg border-2 focus:border-primary"
                    />
                    <MagneticButton
                      type="submit"
                      disabled={isLoading}
                      size="lg"
                      className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
                    >
                      {isLoading ? "..." : "Démarrer →"}
                    </MagneticButton>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Rejoignez +500 utilisateurs en liste d'attente</span>
                  </p>
                </form>
              ) : (
                <div className="max-w-md mx-auto pt-8 space-y-4">
                  <div className="flex items-center justify-center gap-3 p-6 rounded-xl bg-primary/10 text-primary border-2 border-primary/20">
                    <Check className="w-6 h-6" />
                    <span className="font-semibold text-lg">Vous êtes inscrit !</span>
                  </div>
                  <p className="text-muted-foreground">
                    Nous vous contacterons dès que l'accès sera ouvert au public.
                  </p>
                </div>
              )}
            </div>
          </RevealOnScroll>
          </div>
        </section>

        <ParallaxSection speed={0.2} className="py-16 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8">
            <RevealOnScroll delay={0}>
              <Tilt3D className="space-y-4 text-center p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Recherche intelligente</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tapez "café Paris" et récupérez automatiquement tous les établissements de la ville
                </p>
              </Tilt3D>
            </RevealOnScroll>

            <RevealOnScroll delay={100}>
              <Tilt3D className="space-y-4 text-center p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <MapPin className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Sélection par zone</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dessinez un rectangle sur la carte pour cibler précisément une zone géographique
                </p>
              </Tilt3D>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <Tilt3D className="space-y-4 text-center p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Download className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Export facile</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Exportez vos données en CSV ou copiez-les directement dans Google Sheets
                </p>
              </Tilt3D>
            </RevealOnScroll>
          </div>
        </ParallaxSection>

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
