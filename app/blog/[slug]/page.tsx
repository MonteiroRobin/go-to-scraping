"use client"

import type React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Calendar, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface BlogPostContent {
  title: string
  date: string
  readTime: string
  category: string
  author: string
  content: {
    introduction: string
    sections: {
      heading: string
      content: string
    }[]
    conclusion: string
  }
}

const blogContent: Record<string, BlogPostContent> = {
  "introduction-web-scraping-2025": {
    title: "Introduction au Web Scraping en 2025 : Guide Complet",
    date: "8 janvier 2025",
    readTime: "8 min",
    category: "Guide",
    author: "Équipe Go To Scraping",
    content: {
      introduction: "Le web scraping est devenu un outil incontournable pour les entreprises qui souhaitent exploiter la richesse des données disponibles en ligne. En 2025, les technologies et les pratiques ont considérablement évolué pour répondre aux besoins croissants en data intelligence.",
      sections: [
        {
          heading: "Qu'est-ce que le Web Scraping ?",
          content: "Le web scraping, ou extraction de données web, est une technique qui permet de collecter automatiquement des informations depuis des sites internet. Contrairement à la saisie manuelle, le scraping automatise ce processus et permet de traiter des volumes massifs de données en quelques minutes. Les applications sont nombreuses : veille concurrentielle, génération de leads, études de marché, analyse de prix, etc."
        },
        {
          heading: "Les Cas d'Usage Business",
          content: "Les entreprises utilisent le scraping pour plusieurs objectifs stratégiques. La prospection commerciale permet d'identifier des clients potentiels en collectant des informations de contact de commerces locaux. L'analyse concurrentielle aide à surveiller les prix et les offres de la compétition. Les études de marché utilisent les données géolocalisées pour identifier les zones à fort potentiel. Enfin, l'enrichissement de bases de données CRM permet de compléter les informations clients existantes."
        },
        {
          heading: "Technologies et Outils en 2025",
          content: "Les outils modernes de scraping combinent plusieurs technologies : les APIs officielles comme Google Places pour des données structurées, les bibliothèques Python (BeautifulSoup, Scrapy, Selenium) pour du scraping personnalisé, et les solutions no-code comme Go To Scraping pour les utilisateurs non-techniques. Le choix dépend de vos besoins spécifiques et de votre niveau technique."
        },
        {
          heading: "Bonnes Pratiques et Éthique",
          content: "Le scraping doit être pratiqué de manière responsable. Respectez toujours le fichier robots.txt des sites, limitez la fréquence de vos requêtes pour ne pas surcharger les serveurs, et ne collectez que des données publiques. En France, le RGPD impose des règles strictes sur l'utilisation de données personnelles. Assurez-vous de votre conformité légale avant tout projet."
        },
        {
          heading: "Démarrer avec Go To Scraping",
          content: "Notre plateforme simplifie l'extraction de données de commerces locaux. Aucune compétence technique n'est requise : sélectionnez simplement une zone sur la carte ou effectuez une recherche par ville, et récupérez instantanément des milliers de contacts qualifiés. Les données sont exportables en CSV ou directement vers Google Sheets pour une intégration facile avec vos outils existants."
        }
      ],
      conclusion: "Le web scraping est une compétence essentielle pour toute entreprise data-driven en 2025. Que vous soyez marketeur, commercial ou entrepreneur, maîtriser cette technique vous donnera un avantage compétitif considérable."
    }
  },
  "google-places-api-vs-scraping": {
    title: "Google Places API vs Web Scraping : Quelle Solution Choisir ?",
    date: "5 janvier 2025",
    readTime: "6 min",
    category: "Comparaison",
    author: "Équipe Go To Scraping",
    content: {
      introduction: "Lorsqu'il s'agit de collecter des données sur des commerces locaux, deux approches principales s'offrent à vous : utiliser l'API officielle de Google Places ou recourir au web scraping. Chacune présente des avantages et des limites qu'il est important de comprendre.",
      sections: [
        {
          heading: "L'API Google Places : Avantages",
          content: "L'API officielle garantit des données structurées, fiables et régulièrement mises à jour. Vous bénéficiez du support de Google et d'une documentation complète. Les données incluent des informations détaillées : nom, adresse, téléphone, horaires d'ouverture, photos, avis clients avec notes, et bien plus. L'intégration est simple et rapide via des requêtes HTTP standardisées."
        },
        {
          heading: "Les Limites de l'API",
          content: "Le principal inconvénient reste le coût. Après 5000 requêtes gratuites par mois, le tarif est d'environ 17€ pour 1000 requêtes supplémentaires. Pour des projets à grande échelle, la facture peut rapidement grimper. De plus, certaines données avancées nécessitent des requêtes supplémentaires payantes. Les quotas peuvent également limiter vos volumes de collecte."
        },
        {
          heading: "Le Web Scraping : Flexibilité Maximale",
          content: "Le scraping vous offre un contrôle total sur les données collectées. Vous n'êtes pas limité par des quotas ou des restrictions d'API. Vous pouvez personnaliser exactement quelles informations extraire et comment les formater. Le coût est généralement fixe, basé sur l'infrastructure de scraping plutôt que sur le volume de données."
        },
        {
          heading: "Considérations Légales",
          content: "Le scraping de données publiques est généralement légal en France, mais vous devez respecter certaines règles. Ne collectez que des informations publiquement accessibles, respectez le robots.txt, évitez la surcharge des serveurs, et assurez-vous de la conformité RGPD si vous traitez des données personnelles. L'utilisation de l'API officielle évite ces questions juridiques."
        },
        {
          heading: "Notre Recommandation",
          content: "Pour des besoins ponctuels ou de petite échelle (moins de 5000 commerces/mois), l'API Google Places est idéale. Pour des projets récurrents à grande échelle, une solution de scraping comme Go To Scraping offre un meilleur rapport qualité-prix. Notre plateforme combine le meilleur des deux mondes : simplicité d'utilisation et données riches sans limite de volume."
        }
      ],
      conclusion: "Le choix entre API et scraping dépend de votre budget, de vos volumes de données et de vos contraintes techniques. Go To Scraping vous permet de profiter des avantages du scraping sans complexité technique."
    }
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = blogContent[slug]

  // Si l'article n'existe pas, afficher un message par défaut
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Article non trouvé</h1>
          <Link href="/blog">
            <Button>Retour au blog</Button>
          </Link>
        </div>
      </div>
    )
  }

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

      {/* Back to Blog */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            {post.category}
          </div>

          <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
            <span>Par {post.author}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pb-8 border-b border-border">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Sauvegarder
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            {post.content.introduction}
          </p>

          {post.content.sections.map((section, index) => (
            <div key={index} className="mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {section.heading}
              </h2>
              <p className="text-lg text-foreground/90 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}

          <div className="mt-12 p-8 bg-muted/30 rounded-lg border border-border">
            <p className="text-lg text-foreground/90 leading-relaxed font-medium">
              {post.content.conclusion}
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 p-8 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Prêt à démarrer avec Go To Scraping ?
          </h3>
          <p className="text-muted-foreground mb-6">
            Rejoignez la liste d'attente et soyez parmi les premiers à accéder à notre plateforme de scraping simplifié.
          </p>
          <Link href="/">
            <Button size="lg">
              Rejoindre la liste d'attente
            </Button>
          </Link>
        </div>
      </article>

      {/* Related Articles */}
      <section className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Articles connexes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(blogContent)
              .filter(([key]) => key !== slug)
              .slice(0, 3)
              .map(([key, relatedPost]) => (
                <Link
                  key={key}
                  href={`/blog/${key}`}
                  className="group border border-border rounded-lg p-6 hover:shadow-lg transition-all bg-card"
                >
                  <div className="text-sm text-primary font-medium mb-2">{relatedPost.category}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                  <div className="text-sm text-muted-foreground">{relatedPost.readTime}</div>
                </Link>
              ))}
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
