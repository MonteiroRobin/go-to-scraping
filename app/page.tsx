"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Search, Download, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"

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
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <span className="text-xl font-semibold text-foreground">Go To Scraping</span>
          </div>

          <div className="flex items-center gap-4">
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
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Bêta privée - Accès limité
            </div>

            <h1 className="text-5xl font-bold text-foreground leading-tight text-balance">
              Scrapez les commerces locaux en quelques clics
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
              Sélectionnez une zone sur la carte, récupérez instantanément les données de tous les commerces locaux, et
              exportez-les en CSV ou Google Sheets.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto pt-4">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="flex-1 h-12"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? "..." : "Rejoindre la liste"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Inscrivez-vous pour être notifié lors de l'ouverture publique
                </p>
              </form>
            ) : (
              <div className="max-w-md mx-auto pt-4 space-y-4">
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 text-primary">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Vous êtes sur la liste d'attente !</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nous vous contacterons dès que l'accès sera ouvert au public.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Recherche intelligente</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tapez "café Paris" et récupérez automatiquement tous les établissements de la ville
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Sélection par zone</h3>
              <p className="text-muted-foreground leading-relaxed">
                Dessinez un rectangle sur la carte pour cibler précisément une zone géographique
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Download className="w-7 h-7 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Export facile</h3>
              <p className="text-muted-foreground leading-relaxed">
                Exportez vos données en CSV ou copiez-les directement dans Google Sheets
              </p>
            </div>
          </div>
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
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          © 2025 Go To Scraping - Go To Agency. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
