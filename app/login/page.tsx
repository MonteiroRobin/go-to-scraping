"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Lock, Mail, Sparkles, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { BlurFade } from "@/components/ui/blur-fade"
import dynamic from "next/dynamic"

const FloatingDots = dynamic(() => import("@/components/InteractiveGrid").then((mod) => ({ default: mod.FloatingDots })), {
  ssr: false,
})

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(email, password)

    if (success) {
      router.push("/scraper")
    } else {
      setError("Email ou mot de passe incorrect")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingDots />

      {/* Header avec retour */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-md bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="relative z-10 flex items-center justify-center px-4 py-20">
        <BlurFade delay={0.1} inView>
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-6 text-center">
              {/* Logo avec animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg p-3">
                  <Image src="/hamecon-edited.svg" alt="Logo" width={40} height={40} className="w-full h-full" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  <ShimmerText>Go To Scraping</ShimmerText>
                </h1>
                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-secondary/50">
                  <Lock className="w-3 h-3" />
                  <p className="text-sm text-muted-foreground">Accès réservé équipe</p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-12 pl-11 rounded-lg border-2 focus:border-foreground"
                        placeholder="contact@go-to-agency.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-12 pl-11 rounded-lg border-2 focus:border-foreground"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive text-center">{error}</p>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <Image src="/hamecon-edited.svg" alt="Hook" width={16} height={16} className="w-4 h-4 mr-2" />
                      Accéder au scraper
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Info box */}
            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Accès réservé</p>
                  <p>Cette interface est exclusivement réservée à l'équipe Go To Agency.</p>
                </div>
              </div>
            </div>

            {/* Back to home */}
            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </BlurFade>
      </main>
    </div>
  )
}
