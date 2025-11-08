"use client"

import type React from "react"
import Link from "next/link"
import { MapPin, Calendar, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  image?: string
}

const blogPosts: BlogPost[] = [
  {
    slug: "introduction-web-scraping-2025",
    title: "Introduction au Web Scraping en 2025 : Guide Complet",
    excerpt: "Découvrez les fondamentaux du web scraping, ses applications business et comment démarrer avec les bonnes pratiques. Un guide pour comprendre cette technologie essentielle.",
    date: "8 janvier 2025",
    readTime: "8 min",
    category: "Guide"
  },
  {
    slug: "google-places-api-vs-scraping",
    title: "Google Places API vs Web Scraping : Quelle Solution Choisir ?",
    excerpt: "Comparaison détaillée entre l'utilisation de l'API officielle et les techniques de scraping pour collecter des données de commerces locaux. Avantages, limites et coûts.",
    date: "5 janvier 2025",
    readTime: "6 min",
    category: "Comparaison"
  },
  {
    slug: "automatiser-prospection-commerciale",
    title: "Comment Automatiser votre Prospection Commerciale avec le Scraping",
    excerpt: "Transformez votre stratégie de prospection en automatisant la collecte de données prospects. Techniques, outils et cas pratiques pour générer des leads qualifiés.",
    date: "2 janvier 2025",
    readTime: "10 min",
    category: "Business"
  },
  {
    slug: "rgpd-scraping-legal",
    title: "Scraping et RGPD : Ce que Vous Devez Absolument Savoir",
    excerpt: "Le cadre légal du web scraping en France et en Europe. Comment rester conforme au RGPD tout en collectant des données publiques de manière éthique.",
    date: "28 décembre 2024",
    readTime: "7 min",
    category: "Légal"
  },
  {
    slug: "scraping-pour-etudes-marche",
    title: "Utiliser le Scraping pour vos Études de Marché Locales",
    excerpt: "Comment analyser la concurrence locale, identifier les opportunités de marché et prendre des décisions data-driven grâce au scraping de données géolocalisées.",
    date: "24 décembre 2024",
    readTime: "9 min",
    category: "Analyse"
  },
  {
    slug: "optimiser-exports-csv-google-sheets",
    title: "5 Astuces pour Optimiser vos Exports de Données",
    excerpt: "Maximisez l'efficacité de vos exports CSV et Google Sheets. Formatage, nettoyage de données et intégration avec vos outils CRM pour un workflow optimal.",
    date: "20 décembre 2024",
    readTime: "5 min",
    category: "Tutoriel"
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <span className="text-xl font-semibold text-foreground">Go To Scraping</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-foreground mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Guides, tutoriels et insights sur le web scraping, l'automatisation et la collecte de données business.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
            >
              <div className="p-8">
                {/* Category Badge */}
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  {post.category}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <Link href={`/blog/${post.slug}`}>
                  <Button variant="ghost" className="group/btn p-0 h-auto font-semibold">
                    Lire l'article
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="px-8">
            Charger plus d'articles
          </Button>
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Restez informé des dernières actualités
            </h2>
            <p className="text-lg text-muted-foreground">
              Recevez nos meilleurs articles et guides directement dans votre boîte mail
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 h-12 px-4 rounded-lg border border-input bg-background text-foreground"
              />
              <Button size="lg" className="h-12 px-8">
                S'abonner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          © 2025 Go To Scraping - Go To Agency. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
