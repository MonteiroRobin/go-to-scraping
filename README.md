# Go To Scraping - Business Scraper

Application de scraping d'entreprises locales avec authentification sécurisée et interface de carte interactive.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- pnpm (gestionnaire de paquets)
- Un compte Supabase (gratuit)
- Une clé API Google Maps

### Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/MonteiroRobin/go-to-scraping.git
   cd go-to-scraping
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env.local` à la racine du projet :

   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-supabase
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre-cle-google-maps
   ```

4. **Lancer l'application en développement**
   ```bash
   pnpm dev
   ```

   L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## 🔑 Configuration des variables d'environnement

### 1. Supabase (Authentification)

#### Créer un compte Supabase (gratuit)
👉 [https://supabase.com/dashboard](https://supabase.com/dashboard)

#### Récupérer vos clés Supabase
1. Créez un nouveau projet sur Supabase
2. Allez dans **Settings** ⚙️ > **API**
3. Copiez les valeurs suivantes :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Créer un utilisateur dans Supabase
1. Dans votre projet Supabase, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Remplissez :
   - **Email** : votre-email@example.com
   - **Password** : votre-mot-de-passe-securise
   - ✅ Cochez **Auto Confirm User**
4. Cliquez sur **Create user**

### 2. Google Maps API

#### Créer une clé API Google Maps
👉 [https://console.cloud.google.com/](https://console.cloud.google.com/)

1. Créez un nouveau projet (ou sélectionnez-en un existant)
2. Allez dans **APIs & Services** > **Credentials**
3. Cliquez sur **Create Credentials** > **API Key**
4. Activez les APIs nécessaires :
   - Maps JavaScript API
   - Places API
   - Geocoding API

5. Copiez votre clé API → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

⚠️ **Important** : Configurez les restrictions de clé pour la sécurité (limitez aux domaines autorisés)

---

## 📦 Déploiement sur Vercel

### 1. Connecter le projet à Vercel

👉 [https://vercel.com/new](https://vercel.com/new)

1. Importez votre repository GitHub
2. Vercel détectera automatiquement Next.js

### 2. Configurer les variables d'environnement sur Vercel

Dans votre projet Vercel :
1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez les trois variables suivantes :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Votre URL Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre clé anon Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Votre clé Google Maps | Production, Preview, Development |

3. Cliquez sur **Save**
4. Redéployez l'application

---

## 🛠️ Technologies utilisées

- **Framework** : Next.js 16 (App Router)
- **UI** : React 19, TailwindCSS 4, Radix UI, shadcn/ui
- **Authentification** : Supabase Auth
- **Base de données** : Supabase
- **Cartes** : Google Maps API
- **Déploiement** : Vercel

---

## 📂 Structure du projet

```
go-to-scraping/
├── app/
│   ├── api/
│   │   └── maps-config/      # Configuration Google Maps
│   ├── login/                 # Page de connexion
│   ├── scraper/              # Interface de scraping
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Page d'accueil
├── components/
│   ├── ui/                   # Composants UI (shadcn)
│   ├── map-component.tsx     # Composant carte
│   ├── results-list.tsx      # Liste de résultats
│   └── scraper-interface.tsx # Interface de scraping
├── lib/
│   ├── supabase.ts           # Client Supabase
│   ├── auth-context.tsx      # Context d'authentification
│   └── utils.ts              # Utilitaires
└── .env.local                # Variables d'environnement (à créer)
```

---

## 🔐 Sécurité

- Les mots de passe sont gérés par Supabase (hashés et sécurisés)
- Les clés API ne sont jamais exposées dans le code
- Authentification requise pour accéder au scraper
- Sessions gérées automatiquement par Supabase Auth

---

## 📝 License

Ce projet est sous licence privée. Contactez l'auteur pour toute utilisation commerciale.

---

## 🤝 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez : robinm@go-to-agency.com

---

## ✨ Crédits

Développé par **Go To Agency**
