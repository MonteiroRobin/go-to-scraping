"use client"

import Link from "next/link"
import { MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollProgress } from "@/components/ScrollProgress"
import { useState } from "react"

interface FAQ {
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    category: "Général",
    question: "Qu'est-ce que le web scraping ?",
    answer: "Le web scraping est une technique d'extraction automatique de données depuis des sites web. Go To Scraping utilise cette technologie pour collecter les informations publiques de commerces locaux (nom, adresse, téléphone, site web, avis, etc.) et les présenter dans un format exploitable (CSV, Google Sheets)."
  },
  {
    category: "Général",
    question: "Est-ce que c'est légal ?",
    answer: "Oui, le scraping de données publiquement accessibles est légal en France et en Europe, tant que vous respectez le RGPD et les conditions d'utilisation des sites. Go To Scraping collecte uniquement des informations publiques et respecte les règles de robots.txt. Nous vous recommandons d'utiliser les données collectées uniquement pour des fins de prospection B2B légitimes."
  },
  {
    category: "Général",
    question: "Ai-je besoin de compétences techniques ?",
    answer: "Non ! Go To Scraping est conçu pour être utilisé sans aucune compétence en programmation. L'interface est 100% no-code : vous sélectionnez simplement une zone sur la carte ou effectuez une recherche par ville, et les données sont extraites automatiquement. L'export se fait en un clic vers CSV ou Google Sheets."
  },
  {
    category: "Fonctionnalités",
    question: "Quelles données puis-je extraire ?",
    answer: "Pour chaque commerce, vous obtenez : nom de l'établissement, adresse complète, numéro de téléphone, site web, email (si disponible), note moyenne, nombre d'avis, catégorie d'activité, horaires d'ouverture, et coordonnées GPS. Vous pouvez également enrichir ces données avec notre IA Grok pour obtenir des descriptions détaillées et des insights supplémentaires."
  },
  {
    category: "Fonctionnalités",
    question: "Comment fonctionne la sélection par zone ?",
    answer: "Utilisez notre carte interactive Google Maps pour dessiner un rectangle ou un polygone autour de la zone géographique qui vous intéresse. Notre système va alors scanner tous les commerces présents dans cette zone selon les critères que vous avez définis (restaurants, coiffeurs, boutiques, etc.). C'est idéal pour cibler un quartier ou une ville spécifique."
  },
  {
    category: "Fonctionnalités",
    question: "Y a-t-il une limite au nombre de commerces que je peux scraper ?",
    answer: "La limite dépend de votre plan d'abonnement. Le plan gratuit permet jusqu'à 100 commerces par recherche. Les plans payants offrent jusqu'à 10 000 commerces par recherche, avec des quotas mensuels adaptés à vos besoins de prospection. Contactez-nous pour des volumes personnalisés."
  },
  {
    category: "Technique",
    question: "Comment exportez-vous les données ?",
    answer: "Trois options d'export sont disponibles : 1) Téléchargement direct au format CSV compatible Excel, 2) Copie formatée pour coller directement dans Google Sheets, 3) Export automatique vers votre CRM via notre API (disponible sur les plans Business). Les données sont nettoyées et dédupliquées avant l'export."
  },
  {
    category: "Technique",
    question: "Comment gérez-vous les doublons ?",
    answer: "Notre système utilise un algorithme intelligent de détection de doublons basé sur plusieurs critères : nom de l'établissement, adresse normalisée, et coordonnées GPS. Lorsqu'un doublon potentiel est détecté, seule la fiche la plus complète est conservée. Cela garantit une base de données propre et sans redondance."
  },
  {
    category: "Technique",
    question: "Quelle est la fraîcheur des données ?",
    answer: "Les données sont extraites en temps réel depuis Google Places API au moment de votre recherche. Vous obtenez donc les informations les plus récentes disponibles publiquement. Nous recommandons de mettre à jour vos bases de données tous les 3 à 6 mois pour maintenir une qualité optimale."
  },
  {
    category: "Tarification",
    question: "Quels sont vos plans tarifaires ?",
    answer: "Nous proposons plusieurs plans : Free (100 commerces/recherche, 500/mois), Starter (1000 commerces/recherche, 5000/mois, 29€/mois), Pro (5000 commerces/recherche, 25000/mois, 99€/mois), et Business (10000 commerces/recherche, illimité, 299€/mois avec API). Tous les plans incluent l'export CSV/Sheets et la détection de doublons."
  },
  {
    category: "Tarification",
    question: "Puis-je essayer gratuitement ?",
    answer: "Oui ! Inscrivez-vous sur la liste d'attente pour accéder à notre bêta privée gratuite. Vous pourrez tester toutes les fonctionnalités sans limite de temps avec un quota de 500 commerces par mois. Aucune carte bancaire n'est requise pour démarrer."
  },
  {
    category: "Support",
    question: "Offrez-vous un support client ?",
    answer: "Oui, tous nos plans incluent un support par email avec réponse sous 24h. Les plans Pro et Business bénéficient d'un support prioritaire avec réponse sous 4h et d'un accompagnement personnalisé pour l'intégration. Nous proposons également des tutoriels vidéo et une documentation complète."
  },
  {
    category: "Support",
    question: "Puis-je demander de nouvelles fonctionnalités ?",
    answer: "Absolument ! Nous sommes à l'écoute de nos utilisateurs et développons activement la plateforme. Contactez-nous avec vos suggestions et nous les étudierons pour notre roadmap. Les clients Business peuvent demander des développements sur-mesure adaptés à leurs besoins spécifiques."
  }
]

function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
      >
        <span className="font-semibold text-foreground pr-4">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 pt-2 text-muted-foreground leading-relaxed border-t border-border bg-muted/20">
          {faq.answer}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const categories = Array.from(new Set(faqs.map(f => f.category)))

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />

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
            <Link href="/blog">
              <Button variant="ghost" size="sm">Blog</Button>
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Questions Fréquentes
          </h1>
          <p className="text-xl text-muted-foreground">
            Tout ce que vous devez savoir sur Go To Scraping
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {categories.map((category) => (
          <section key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">
              {category}
            </h2>
            <div className="space-y-4">
              {faqs
                .filter(f => f.category === category)
                .map((faq, index) => (
                  <FAQItem key={index} faq={faq} />
                ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="mt-16 p-8 bg-primary/5 rounded-lg border border-primary/20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Vous avez d'autres questions ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Notre équipe est là pour vous aider. Contactez-nous ou rejoignez la liste d'attente pour découvrir la plateforme.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/">
              <Button size="lg">Rejoindre la liste d'attente</Button>
            </Link>
            <Button variant="outline" size="lg">Nous contacter</Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          © 2025 Go To Scraping - Go To Agency. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
