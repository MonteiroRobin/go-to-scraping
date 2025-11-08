export function BlogPostJsonLd({
  url,
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  images,
}: {
  url: string
  title: string
  description: string
  datePublished: string
  dateModified?: string
  authorName: string
  images?: string[]
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: images || ['https://gotoscraping.com/og-image.png'],
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: 'https://gotoscraping.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Go To Scraping',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gotoscraping.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Go To Scraping',
    alternateName: 'Go To Agency',
    url: 'https://gotoscraping.com',
    logo: 'https://gotoscraping.com/logo.png',
    description: 'Solution professionnelle de web scraping pour extraire les données de commerces locaux en quelques clics.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['French'],
    },
    sameAs: [
      'https://twitter.com/gotoagency',
      'https://linkedin.com/company/gotoagency',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Go To Scraping',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    operatingSystem: 'Web',
    description: 'Plateforme de web scraping sans code pour extraire les données de commerces locaux. Sélectionnez une zone sur la carte et exportez en CSV ou Google Sheets.',
    featureList: [
      'Scraping de commerces locaux',
      'Sélection par zone géographique',
      'Export CSV et Google Sheets',
      'Détection automatique des doublons',
      'Enrichissement IA des données',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
