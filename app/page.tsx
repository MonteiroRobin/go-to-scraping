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
      router.push('/scraper')
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
            <span className="text-xl font-semibold text-foreground">LocalScraper</span>
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
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Extraction de données locales 🇫🇷
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Trouvez des entreprises locales en quelques secondes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Extrayez des données précises sur les commerces et services près de chez vous.
            Rapide, gratuit et open source.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-12">
              <Input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 px-4"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "En cours..." : "Rejoindre la liste d'attente"}
              </Button>
            </form>
          ) : (
            <div className="max-w-md mx-auto mb-12 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
              <Check className="w-5 h-5 inline-block mr-2" />
              Merci ! Vous êtes sur la liste d'attente.
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Extraction rapide</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              <span>Export CSV/JSON</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              <span>Recherche par zone</span>
            </div>
          </div>
        </section>

        <section className="py-16 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Recherche intuitive
            </h3>
            <p className="text-muted-foreground">
              Recherchez par ville ou dessinez une zone personnalisée sur la carte pour cibler précisément vos besoins.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Résultats instantanés
            </h3>
            <p className="text-muted-foreground">
              Obtenez des listes complètes avec noms, adresses, téléphones et sites web en quelques secondes.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Export flexible
            </h3>
            <p className="text-muted-foreground">
              Exportez vos données au format CSV ou JSON pour les utiliser dans vos outils préférés.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
