# 🚀 Roadmap d'implémentation - Scraping Asynchrone Global

## 📋 Vue d'ensemble

Transformer l'outil en vrai SaaS avec :
- ✅ Scraping asynchrone (continue à utiliser l'outil pendant le scraping)
- ✅ Base de données globale dédupliquée
- ✅ Système de crédits intelligent
- ✅ Cache partagé entre tous les users (anonyme)

---

## 🎯 Phase 1 : Infrastructure backend (Priorité 1)

### 1.1 Migration Supabase
**Fichier** : `supabase-global-scraping-schema.sql`

**Actions** :
```bash
# 1. Connecter à Supabase
supabase login

# 2. Créer migration
supabase migration new global_scraping_schema

# 3. Copier le contenu du SQL dans migrations/
# 4. Appliquer
supabase db push
```

**Tables créées** :
- `global_businesses` - Pool partagé de tous les établissements
- `user_searches` - Historique privé par user
- `scraping_jobs` - Queue de jobs asynchrones
- `user_credits` - Système de crédits

### 1.2 API Routes à créer

#### `/api/scraping/start-job` (POST)
```typescript
// Démarre un scraping asynchrone
{
  city: "Paris",
  businessType: "restaurant",
  keywords: "italien",
  useCache: true // Check cache first
}

// Retourne immédiatement
{
  jobId: "uuid",
  status: "pending",
  estimatedCredits: 5
}
```

#### `/api/scraping/check-cache` (POST)
```typescript
// Vérifie si données en cache
{
  city: "Paris",
  businessType: "restaurant",
  location: { lat, lon },
  radius: 5000
}

// Retourne
{
  cacheStatus: "fresh" | "stale" | "none",
  cachedCount: 42,
  freshnessHours: 48,
  businesses: [...] // Si fresh
}
```

#### `/api/scraping/job-status` (GET)
```typescript
// Polling ou WebSocket
GET /api/scraping/job-status?jobId=uuid

{
  status: "processing" | "completed" | "failed",
  progress: { current: 45, total: 100 },
  results: [...], // Si completed
  error: "..." // Si failed
}
```

#### `/api/scraping/get-results` (GET)
```typescript
// Récupère résultats d'une recherche
GET /api/scraping/get-results?searchId=uuid

{
  businesses: [...],
  wasCached: true,
  cacheFreshness: "fresh",
  creditsUsed: 1
}
```

---

## 🎯 Phase 2 : Frontend - UX Asynchrone (Priorité 1)

### 2.1 Job Status Component

**Créer** : `components/scraping-job-status.tsx`

```typescript
// Toast notification + progress bar qui suit le job
<ScrapingJobStatus
  jobId={jobId}
  onComplete={(results) => setResults(results)}
  onError={(error) => showError(error)}
/>
```

**Features** :
- Mini-notification en bas à droite
- Progress bar temps réel
- Cliquable pour voir détails
- Continue même si user change de page
- Stocke jobId dans localStorage

### 2.2 Multi-Job Manager

**Créer** : `components/multi-job-manager.tsx`

```typescript
// Affiche tous les jobs actifs
<MultiJobManager>
  <JobCard jobId="1" status="processing" progress={45} />
  <JobCard jobId="2" status="pending" />
  <JobCard jobId="3" status="completed" />
</MultiJobManager>
```

### 2.3 Cache Indicator

**Ajouter dans SearchBar** :
```tsx
{cacheStatus === "fresh" && (
  <div className="bg-green-500/10 p-3 rounded">
    ⚡ 42 résultats en cache (frais) - 1 crédit
  </div>
)}

{cacheStatus === "stale" && (
  <div className="bg-orange-500/10 p-3 rounded">
    ⚠️ 42 résultats en cache (30j) - Re-scraper ? (5 crédits)
    <Button onClick={forceScrape}>Actualiser</Button>
  </div>
)}
```

---

## 🎯 Phase 3 : Système de crédits (Priorité 2)

### 3.1 Credits Display Component

**Créer** : `components/user-credits.tsx`

```tsx
<UserCredits>
  <div>💎 Credits: 87/100</div>
  <ProgressBar value={87} max={100} />
  <Link href="/pricing">Recharger</Link>
</UserCredits>
```

### 3.2 Pricing Tiers

**Fichier** : `app/pricing/page.tsx`

| Plan | Crédits/mois | Prix |
|------|--------------|------|
| Free | 100 | 0€ |
| Starter | 1000 | 19€ |
| Pro | 5000 | 79€ |
| Enterprise | Illimité | 299€ |

**Coût par opération** :
- Cache fresh (<7j) : 1 crédit
- Cache stale (7-30j) : 3 crédits
- Nouveau scraping : 10 crédits
- Enrichissement Grok : 5 crédits

---

## 🎯 Phase 4 : Optimisations avancées (Priorité 3)

### 4.1 WebSocket pour temps réel

**Au lieu de polling** :
```typescript
// lib/websocket.ts
const ws = new WebSocket('wss://api.gotoscraping.com/jobs')
ws.on('job-progress', (data) => updateProgress(data))
ws.on('job-complete', (data) => showResults(data))
```

### 4.2 Background sync

**Service Worker** pour continuer scraping même si tab fermée :
```typescript
// public/sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'scraping-job') {
    event.waitUntil(checkJobStatus())
  }
})
```

### 4.3 Smart caching strategy

**Logique intelligente** :
```typescript
// Jamais re-scraper si < 3 jours
if (cacheFreshness < 3) return cached

// Suggérer re-scraping si > 7 jours
if (cacheFreshness > 7) showRefreshSuggestion()

// Auto re-scraping si > 30 jours ET user a crédits
if (cacheFreshness > 30 && credits > 10) autoRefresh()
```

---

## 🎯 Phase 5 : Analytics & Monitoring (Priorité 3)

### 5.1 Dashboard Analytics

**Page** : `/app/analytics/page.tsx`

**Métriques** :
- Cache hit rate (% de résultats depuis cache)
- Crédits économisés grâce au cache
- Searches les plus populaires
- Freshness moyenne des données
- Top villes/types scrapés

### 5.2 Admin Dashboard

**Pour toi** :
- Total businesses in global pool
- Cache efficiency
- Top users by scraping volume
- Revenue metrics
- API usage stats

---

## 📊 Avantages Business

### Pour les users :
- ⚡ Résultats instantanés (90% du temps)
- 💰 Crédits économisés (cache = 10x moins cher)
- 🔄 Données toujours fraîches (pooling entre users)
- 🎯 Multi-tasking (scraping en background)

### Pour toi :
- 💵 Moins de coûts API Google Places (cache partagé)
- 📈 Scaling facile (pool grandit avec users)
- 🎁 Free tier viable (cache = presque gratuit)
- 🔒 Data advantage (base globale = moat)

---

## 🚀 Quick Start Implementation

### Ordre recommandé :

1. **Semaine 1** : Migration Supabase (Phase 1.1)
2. **Semaine 2** : API cache check (Phase 1.2 - check-cache)
3. **Semaine 2** : Frontend cache indicator (Phase 2.3)
4. **Semaine 3** : API async jobs (Phase 1.2 - start-job, job-status)
5. **Semaine 3** : Frontend job status (Phase 2.1)
6. **Semaine 4** : Credits system (Phase 3)
7. **Semaine 5+** : Optimisations (Phase 4)

### MVP (2 semaines) :
- ✅ Cache check avant scraping
- ✅ Upsert dans global_businesses
- ✅ Affichage cache status
- ✅ Système basique de crédits

---

## 🎨 UX Flow Example

```
User: "Rechercher restaurants Paris"
  ↓
App: Check cache
  ↓
Cache HIT (fresh) → Résultats instantanés (1 crédit)
  ↓
User voit les résultats + badge "⚡ Données fraîches (cache)"

---

Cache MISS → Démarre job async (10 crédits)
  ↓
App: "🔄 Scraping en cours... (0/100)"
  ↓
User: Continue à utiliser l'app (voir historique, filtrer, etc.)
  ↓
Notification: "✅ 45 restaurants trouvés!"
  ↓
Résultats s'affichent automatiquement
```

---

## 💡 Features Bonus

### Smart suggestions
```
"42 users ont scrapé 'restaurants Lyon' cette semaine"
"Données disponibles en cache - Voir maintenant ? (1 crédit)"
```

### Collaborative pool
```
"🌍 142,453 établissements dans la base globale"
"Votre recherche a aidé 12 autres utilisateurs"
```

### Auto-refresh scheduling
```
"📅 Planifier re-scraping automatique tous les 7 jours"
```

---

## ⚠️ Points d'attention

### Sécurité :
- ✅ RLS Supabase activé
- ✅ User ne voit QUE ses searches
- ✅ global_businesses = read-only
- ✅ Rate limiting sur API

### Performance :
- ✅ Index sur place_id, location, updated_at
- ✅ Pagination des résultats
- ✅ Lazy loading des photos

### Legal :
- ⚠️ CGU : Mention du pooling anonymisé
- ⚠️ RGPD : Data anonymisée
- ⚠️ Google ToS : Respect des quotas

---

C'est parti ! 🚀
