# Local Business Scraper

Une application Next.js puissante pour scraper et enrichir les données de commerces locaux via Google Places API et Grok AI.

## 🚀 Fonctionnalités

- **Scraping Google Places API** : Extraction de données complètes (nom, adresse, téléphone, site web, email, notes, avis)
- **Détection des doublons** : Système intelligent pour éviter les doublons via Supabase
- **Enrichissement Grok AI** : Ajout d'informations détaillées (descriptions, spécialités, horaires recommandés, etc.)
- **Recherche intelligente** : Barre de recherche unique avec parsing en langage naturel
- **Sélection par zone** : Dessin de zones personnalisées sur Google Maps
- **Historique** : Sauvegarde automatique de toutes les recherches
- **Export** : CSV et Google Sheets
- **Mode sombre** : Interface adaptative avec thème clair/sombre

## 📋 Prérequis

- Node.js 18+ et npm/pnpm
- Compte Google Cloud Platform (pour Google Maps et Places API)
- Compte Supabase (base de données)
- Compte xAI (pour Grok AI - optionnel)

## 🛠️ Installation

### 1. Cloner le projet depuis GitHub

\`\`\`bash
git clone https://github.com/votre-username/local-business-scraper.git
cd local-business-scraper
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
npm install
# ou
pnpm install
\`\`\`

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

**Variables Google Maps (requises) :**
\`\`\`bash
# Pour l'affichage de la carte (variable publique)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_api_google_maps

# Pour les opérations serveur
GOOGLE_MAPS_API_KEY=votre_cle_api_google_maps
\`\`\`

**Variable Google Places API (requise) :**
\`\`\`bash
PLACE_API_KEY=votre_cle_api_google_places
\`\`\`

**Variables Supabase (requises) :**
\`\`\`bash
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
\`\`\`

**Variable Grok AI (optionnelle) :**
\`\`\`bash
GROK_XAI_API_KEY=votre_cle_api_grok
\`\`\`

> **Note importante :** Utilisez exactement ces noms de variables. Les valeurs ci-dessus sont des exemples à remplacer par vos propres clés API.

### 4. Configuration Google Cloud Platform

#### a. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet
3. Activez la facturation (nécessaire pour les API)

#### b. Activer les API nécessaires

Dans votre projet Google Cloud, activez :
- **Places API (New)** - Pour le scraping des commerces
- **Maps JavaScript API** - Pour l'affichage de la carte
- **Geocoding API** - Pour la conversion adresse ↔ coordonnées

#### c. Créer une clé API

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "API Key"
3. Copiez la clé générée
4. **Important** : Configurez les restrictions :
   - Restrictions d'application : HTTP referrers (pour la clé publique)
   - Ajoutez votre domaine : `http://localhost:3000/*` et `https://votre-domaine.com/*`
   - Restrictions d'API : Sélectionnez uniquement les API nécessaires

#### d. Quotas et tarification

- **Places API (New)** : Gratuit jusqu'à 5 000 requêtes/mois, puis ~$17/1000 requêtes
- **Maps JavaScript API** : Gratuit jusqu'à 28 000 chargements/mois
- **Geocoding API** : Gratuit jusqu'à 40 000 requêtes/mois

### 5. Configuration Supabase

#### a. Créer un projet Supabase

1. Allez sur [Supabase](https://supabase.com/)
2. Créez un nouveau projet
3. Notez l'URL du projet et la clé anonyme (anon key)

#### b. Créer les tables

Exécutez le script SQL disponible dans `scripts/setup_complete_database.sql` dans l'éditeur SQL de Supabase.

Le script crée :
- Table `search_history` : Historique des recherches
- Table `search_results` : Résultats détaillés (optionnel)
- Table `scraped_businesses` : Commerces scrapés avec détection des doublons
- Index pour améliorer les performances
- Politiques RLS (Row Level Security)
- Triggers automatiques

### 6. Configuration Grok AI (optionnel)

1. Créez un compte sur [xAI](https://x.ai/)
2. Générez une clé API
3. Ajoutez-la dans `.env.local`

## 🚀 Lancement

### Développement local

\`\`\`bash
npm run dev
# ou
pnpm dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📦 Déploiement sur Vercel

### 1. Push sur GitHub

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### 2. Déployer sur Vercel

1. Allez sur [Vercel](https://vercel.com/)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Ajoutez les variables d'environnement dans les paramètres du projet
5. Cliquez sur "Deploy"

### 3. Configurer les variables d'environnement sur Vercel

Dans les paramètres du projet Vercel, ajoutez toutes les variables d'environnement listées dans la section 3 ci-dessus.

## 📖 Utilisation

### Recherche par ville

1. Entrez une requête en langage naturel : "café à Paris" ou "restaurant Lyon"
2. Cliquez sur "Rechercher"
3. Les résultats s'affichent avec détection automatique des doublons

### Recherche par zone

1. Allez dans l'onglet "Carte"
2. Utilisez les outils de dessin pour sélectionner une zone
3. Cliquez sur "Confirmer la zone"

### Enrichissement Grok AI

Après chaque scraping, un prompt apparaît pour enrichir les données avec Grok AI :
- Descriptions détaillées
- Informations de contact manquantes
- Meilleurs moments pour visiter
- Informations pratiques (parking, accessibilité, etc.)

### Export des données

- **CSV** : Téléchargement direct au format CSV
- **Google Sheets** : Copie formatée pour coller directement dans Sheets
- **Copie de ligne** : Bouton pour copier chaque ligne individuellement

## 🔧 Technologies utilisées

- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Composants UI
- **Supabase** - Base de données PostgreSQL
- **Google Maps API** - Affichage de carte et géolocalisation
- **Google Places API (New)** - Scraping de commerces
- **Grok AI (xAI)** - Enrichissement des données
- **SWR** - Gestion du cache et des requêtes

## 📝 Structure du projet

\`\`\`
local-business-scraper/
├── app/
│   ├── api/
│   │   ├── enrich-with-grok/    # Enrichissement Grok AI
│   │   ├── maps-config/         # Configuration Google Maps
│   │   └── scrape-places/       # Scraping Google Places
│   ├── scraper/                 # Page principale
│   └── login/                   # Authentification
├── components/
│   ├── scraper-interface.tsx    # Interface principale
│   ├── search-bar.tsx           # Barre de recherche
│   ├── results-list.tsx         # Affichage des résultats
│   ├── history-view.tsx         # Historique des recherches
│   ├── map-component.tsx        # Carte Google Maps
│   └── database-test.tsx        # Test de connexion Supabase
├── lib/
│   ├── supabase.ts              # Client Supabase
│   └── auth-context.tsx         # Contexte d'authentification
└── scripts/
    └── setup_complete_database.sql  # Script SQL complet
\`\`\`

## 🐛 Dépannage

### Erreur "REQUEST_DENIED" Google Places API

- Vérifiez que "Places API (New)" est activée dans Google Cloud Console
- Vérifiez que votre clé API a les bonnes restrictions
- Vérifiez que la facturation est activée sur votre projet Google Cloud

### Erreur de connexion Supabase

- Vérifiez que les variables d'environnement Supabase sont correctes
- Vérifiez que les tables ont été créées avec le script SQL
- Utilisez le composant DatabaseTest pour diagnostiquer les problèmes

### Pas de résultats de scraping

- Vérifiez que la limite de 100 résultats n'est pas atteinte
- Essayez une zone plus grande ou une recherche différente
- Vérifiez les logs de la console pour les erreurs

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.
