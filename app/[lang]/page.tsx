"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Search, Download, Zap, Check, Clock, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import type { Locale } from "@/lib/i18n"

interface PageProps {
  params: {
    lang: Locale
  }
}

export default function HomePage({ params }: PageProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dict, setDict] = useState<any>(null)

  useEffect(() => {
    import(`@/locales/${params.lang}.json`)
      .then((module) => setDict(module.default))
      .catch(() => import(`@/locales/en.json`).then((module) => setDict(module.default)))
  }, [params.lang])

  useEffect(() => {
    if (!authLoading && user) {
      router.push(`/${params.lang}/scraper`)
    }
  }, [user, authLoading, router, params.lang])

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

  if (!dict) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
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
            <Link href={`/${params.lang}/login`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {dict.nav.team}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {dict.hero.badge}
            </div>

            <h1 className="text-5xl font-bold text-foreground leading-tight text-balance">
              {dict.hero.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
              {dict.hero.subtitle}
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto pt-4">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={dict.hero.emailPlaceholder}
                    required
                    className="flex-1 h-12"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? dict.hero.loading : dict.hero.cta}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {dict.hero.emailHint}
                </p>
              </form>
            ) : (
              <div className="max-w-md mx-auto pt-4 space-y-4">
                <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 text-primary">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">{dict.hero.successTitle}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dict.hero.successMessage}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{dict.features.search.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict.features.search.description}
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{dict.features.zone.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict.features.zone.description}
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Download className="w-7 h-7 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{dict.features.export.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict.features.export.description}
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section - SEO Rich */}
        <section className="py-20 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{dict.seo.howItWorks.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground text-center">{dict.seo.howItWorks.step1.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                {dict.seo.howItWorks.step1.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground text-center">{dict.seo.howItWorks.step2.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                {dict.seo.howItWorks.step2.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground text-center">{dict.seo.howItWorks.step3.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                {dict.seo.howItWorks.step3.description}
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section - SEO Rich */}
        <section className="py-20 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{dict.seo.useCases.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <TrendingUp className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">{dict.seo.useCases.leadGeneration.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict.seo.useCases.leadGeneration.description}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <Search className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">{dict.seo.useCases.marketResearch.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict.seo.useCases.marketResearch.description}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <MapPin className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">{dict.seo.useCases.deliveryServices.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {dict.seo.useCases.deliveryServices.description}
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section - SEO Rich */}
        <section className="py-20 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{dict.seo.benefits.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex gap-4 p-6 rounded-lg border border-border bg-card">
              <Clock className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.benefits.speed.title}</h3>
                <p className="text-muted-foreground">{dict.seo.benefits.speed.description}</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border border-border bg-card">
              <Check className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.benefits.accuracy.title}</h3>
                <p className="text-muted-foreground">{dict.seo.benefits.accuracy.description}</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border border-border bg-card">
              <Shield className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.benefits.privacy.title}</h3>
                <p className="text-muted-foreground">{dict.seo.benefits.privacy.description}</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border border-border bg-card">
              <Zap className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.benefits.easy.title}</h3>
                <p className="text-muted-foreground">{dict.seo.benefits.easy.description}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - SEO Rich */}
        <section className="py-20 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{dict.seo.faq.title}</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.faq.q1.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{dict.seo.faq.q1.answer}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.faq.q2.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{dict.seo.faq.q2.answer}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.faq.q3.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{dict.seo.faq.q3.answer}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">{dict.seo.faq.q4.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{dict.seo.faq.q4.answer}</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center border-t border-border">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-primary" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{dict.cta.title}</h2>
            <p className="text-lg text-muted-foreground">
              {dict.cta.description}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          {dict.footer.copyright}
        </div>
      </footer>
    </div>
  )
}
