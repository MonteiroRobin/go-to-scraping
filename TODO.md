# 📋 TODO - Go To Scraping

> Audit réalisé le 2025-11-17

---

## 🔴 URGENT - À faire AUJOURD'HUI

### 1. ✅ Installer les dépendances
```bash
npm install
```
**Impact**: CRITIQUE - Le projet ne démarre pas sans les dépendances
**Temps estimé**: 2 minutes

---

### 2. ✅ Corriger la double facturation
**Fichier**: `app/api/scraping/process-job/route.ts:46`
**Problème**: Les crédits sont déduits 2 fois (dans start-job ET dans scrape-places)
**Solution**: Ajouter un flag `skipCreditDeduction` dans l'appel à scrape-places
**Impact**: Les utilisateurs paient 2x (60 crédits au lieu de 30)
**Temps estimé**: 5 minutes

---

### 3. ✅ Ajouter la facturation Grok AI
**Fichier**: `app/api/enrich-with-grok/route.ts`
**Problème**: Aucun crédit n'est déduit pour l'enrichissement Grok
**Solution**: Ajouter `consumeCredits()` avant l'appel Grok
**Impact**: Perte de revenus + risque d'abus
**Temps estimé**: 10 minutes

```typescript
// Ajouter après la validation des paramètres
import { CREDIT_COSTS } from "@/lib/credits-config"

const cost = CREDIT_COSTS.ENRICHMENT_GROK_PER_BUSINESS
const success = await consumeCredits(userId, cost)
if (!success) {
  return NextResponse.json(
    { error: "Crédits insuffisants", requiredCredits: cost },
    { status: 402 }
  )
}
```

---

### 4. ✅ Implémenter le refund de crédits
**Fichier**: `app/api/scraping/start-job/route.ts:196`
**Problème**: Si le job échoue, les crédits ne sont pas remboursés
**Solution**: Implémenter la fonction de refund
**Impact**: Utilisateurs perdent des crédits injustement
**Temps estimé**: 30 minutes

```typescript
// Remplacer le TODO par :
if (jobError) {
  console.error("[start-job] Error creating job:", jobError)

  // Refund credits
  await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: creditsAmount,
    p_type: "refund_job_failed",
    p_details: { error: jobError.message }
  })

  return NextResponse.json({ error: "Failed to create scraping job" }, { status: 500 })
}
```

---

### 5. ✅ Supprimer lib/credits.ts
**Fichier**: `lib/credits.ts`
**Problème**: Code legacy, doublon avec `lib/credits-config.ts`, variables d'env exposées
**Solution**: Supprimer le fichier et migrer les imports vers `credits-config.ts`
**Impact**: Confusion, bugs potentiels, faille de sécurité
**Temps estimé**: 15 minutes

**Étapes**:
1. Rechercher tous les imports de `lib/credits.ts`
2. Les remplacer par `lib/credits-config.ts`
3. Supprimer le fichier
4. Tester que tout fonctionne

---

### 6. ✅ Désactiver ignoreBuildErrors
**Fichier**: `next.config.mjs:4`
**Problème**: Masque les erreurs TypeScript, risque de crash en production
**Solution**: Désactiver et corriger les erreurs TS
**Impact**: ÉLEVÉ - Code peut crasher en production
**Temps estimé**: 30 minutes

```javascript
// next.config.mjs
typescript: {
  ignoreBuildErrors: false, // ✅ Corriger les erreurs TS
}
```

---

### 7. ✅ Optimiser les boucles SQL
**Fichier**: `app/api/scrape-places/route.ts:174-179`
**Problème**: 100 requêtes séquentielles au lieu d'1 batch update
**Solution**: Utiliser `.in()` pour batch update
**Impact**: Performance (100x plus lent que nécessaire)
**Temps estimé**: 5 minutes

```typescript
// Remplacer :
for (const duplicate of duplicates) {
  await supabase.from("scraped_businesses")
    .update({ last_scraped_at: new Date().toISOString() })
    .eq("place_id", duplicate.place_id)
}

// Par :
if (duplicates.length > 0) {
  await supabase
    .from("scraped_businesses")
    .update({ last_scraped_at: new Date().toISOString() })
    .in("place_id", duplicates.map(d => d.place_id))
}
```

---

### 8. ✅ Corriger les variables d'environnement
**Fichiers**: `lib/supabase.ts`, `lib/credits.ts`
**Problème**: Variables serveur utilisées côté client (faille de sécurité)
**Solution**: Déplacer toute la logique côté serveur
**Impact**: CRITIQUE - Exposition de clés sensibles
**Temps estimé**: 1 heure

**Plan**:
1. Créer des API routes pour toutes les opérations de crédits
2. Supprimer l'accès direct à Supabase depuis le client
3. Utiliser uniquement `NEXT_PUBLIC_*` pour les variables client

---

## 🟠 IMPORTANT - Cette semaine

### 9. Implémenter rate limiting
**Impact**: Prévenir les abus et l'explosion des coûts API
**Temps estimé**: 2 heures

```typescript
// Installer
npm install @upstash/ratelimit @upstash/redis

// Implémenter dans chaque API route
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min
})

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // ... rest of the code
}
```

---

### 10. Ajouter tests unitaires
**Fichiers à tester**:
- `lib/credits-config.ts` (calculs de crédits)
- `lib/geocoding.ts` (parsing de villes)
- `lib/pricing-data.ts` (validation des plans)

**Framework**: Vitest ou Jest
**Temps estimé**: 4 heures

```typescript
// tests/credits-config.test.ts
import { describe, it, expect } from 'vitest'
import { calculateScrapingCost, CREDIT_COSTS } from '@/lib/credits-config'

describe('calculateScrapingCost', () => {
  it('should return 1 credit for fresh cache', () => {
    const cost = calculateScrapingCost({ cacheStatus: 'fresh' })
    expect(cost).toBe(CREDIT_COSTS.CACHE_FRESH)
  })

  it('should return 30 credits for new scraping without contact data', () => {
    const cost = calculateScrapingCost({
      cacheStatus: 'none',
      includeContactData: false
    })
    expect(cost).toBe(CREDIT_COSTS.SCRAPING_BASIC)
  })
})
```

---

### 11. Ajouter index spatial sur Supabase
**Problème**: Recherche géographique lente
**Solution**: Migrer vers PostGIS
**Temps estimé**: 3 heures

```sql
-- Migration Supabase
-- 1. Activer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Ajouter colonne geography
ALTER TABLE global_businesses
ADD COLUMN location geography(POINT, 4326);

-- 3. Mettre à jour les données existantes
UPDATE global_businesses
SET location = ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography;

-- 4. Créer l'index spatial
CREATE INDEX idx_businesses_location
ON global_businesses
USING GIST (location);

-- 5. Requête optimisée
SELECT * FROM global_businesses
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
  :radius_meters
)
LIMIT 100;
```

---

### 12. Implémenter une vraie queue de jobs
**Problème**: Fire-and-forget n'est pas fiable
**Solution**: Utiliser Inngest ou BullMQ
**Temps estimé**: 5 heures

**Option 1: Inngest (recommandé pour Vercel)**
```typescript
// inngest/functions.ts
import { inngest } from "./client"

export const processScrapingJob = inngest.createFunction(
  { id: "process-scraping-job" },
  { event: "scraping/job.created" },
  async ({ event, step }) => {
    const { jobId } = event.data

    const job = await step.run("fetch-job", async () => {
      return await fetchJob(jobId)
    })

    const results = await step.run("scrape-data", async () => {
      return await scrapeGooglePlaces(job.params)
    })

    await step.run("save-results", async () => {
      return await saveResults(jobId, results)
    })
  }
)
```

---

### 13. Améliorer le parsing des villes
**Fichier**: `lib/geocoding.ts:23`
**Problème**: Regex fragile, ne gère que "café à Paris"
**Solution**: Parser plus robuste
**Temps estimé**: 1 heure

```typescript
export function extractCityFromQuery(query: string): string {
  // Patterns communs
  const patterns = [
    /(?:à|a)\s+([A-Za-zÀ-ÿ\s-]+)/i,      // "café à Paris"
    /(?:dans|sur)\s+([A-Za-zÀ-ÿ\s-]+)/i, // "restaurant dans Lyon"
    /^([A-Za-zÀ-ÿ\s-]+)$/,                 // "Paris" seul
  ]

  for (const pattern of patterns) {
    const match = query.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return query.trim()
}
```

---

### 14. Valider les configs avec Zod
**Fichiers**: `lib/credits-config.ts`, `lib/pricing-data.ts`
**Temps estimé**: 2 heures

```typescript
// lib/credits-config.ts
import { z } from 'zod'

export const CreditCostsSchema = z.object({
  CACHE_FRESH: z.number().int().positive(),
  CACHE_STALE: z.number().int().positive(),
  SCRAPING_BASIC: z.number().int().positive(),
  SCRAPING_COMPLETE: z.number().int().positive(),
  ENRICHMENT_GROK_PER_BUSINESS: z.number().int().positive(),
})

// Valider au démarrage
CreditCostsSchema.parse(CREDIT_COSTS)
```

---

## 🟡 AMÉLIORATION - Ce mois

### 15. Ajouter monitoring (Sentry)
```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

---

### 16. Implémenter retry logic avec exponential backoff
**Fichiers**: Tous les fetch vers APIs externes
**Package**: `p-retry`

```typescript
import pRetry from 'p-retry'

const data = await pRetry(
  async () => {
    const response = await fetch(googlePlacesUrl)
    if (!response.ok) throw new Error('API error')
    return response.json()
  },
  {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    onFailedAttempt: error => {
      console.log(`Attempt ${error.attemptNumber} failed. Retrying...`)
    }
  }
)
```

---

### 17. Dashboard admin pour surveiller les crédits
**Features**:
- Vue globale des crédits utilisés par jour
- Alertes si utilisation anormale
- Stats par utilisateur
- Export des transactions

**Technologies**: Recharts + Supabase RPC

---

### 18. Documenter l'API (OpenAPI/Swagger)
**Package**: `next-swagger-doc`

```typescript
// app/api/doc/route.ts
import { createSwaggerSpec } from 'next-swagger-doc'

export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Go To Scraping API',
        version: '1.0.0',
      },
    },
  })

  return Response.json(spec)
}
```

---

### 19. Ajouter tests E2E (Playwright)
```bash
npm install -D @playwright/test

npx playwright install
```

```typescript
// tests/e2e/scraping.spec.ts
import { test, expect } from '@playwright/test'

test('complete scraping flow', async ({ page }) => {
  await page.goto('http://localhost:3000/scraper')

  // Login
  await page.fill('[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')

  // Search
  await page.fill('[name="city"]', 'Paris')
  await page.selectOption('[name="businessType"]', 'restaurant')
  await page.click('button:has-text("Rechercher")')

  // Wait for results
  await page.waitForSelector('.results-list')

  // Verify results
  const results = await page.locator('.business-card').count()
  expect(results).toBeGreaterThan(0)
})
```

---

### 20. Migrer vers une vraie base de données vectorielle
**Pour**: Recherche sémantique des commerces
**Technologies**: Pinecone, Weaviate ou pgvector
**Use case**: "Trouver des restaurants romantiques à Paris"

---

### 21. Ajouter cache Redis pour les résultats
**Problème**: Chaque recherche identique refait un appel DB
**Solution**: Redis avec TTL

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function getCachedSearch(key: string) {
  return await redis.get(key)
}

export async function setCachedSearch(key: string, data: any, ttl = 3600) {
  await redis.setex(key, ttl, JSON.stringify(data))
}
```

---

### 22. Optimiser les images (Next.js Image)
**Vérifier**: Toutes les images utilisent `next/image`

---

### 23. Implémenter webhooks pour les clients
**Feature**: Notifier les clients quand un job est terminé

```typescript
// app/api/scraping/process-job/route.ts
if (job.webhook_url) {
  await fetch(job.webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'job.completed',
      jobId: job.id,
      results: businessIds,
    })
  })
}
```

---

### 24. Ajouter export automatisé vers Google Sheets
**Package**: `googleapis`

```typescript
import { google } from 'googleapis'

const sheets = google.sheets('v4')
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

await sheets.spreadsheets.values.append({
  auth,
  spreadsheetId: 'YOUR_SHEET_ID',
  range: 'Sheet1!A1',
  valueInputOption: 'USER_ENTERED',
  resource: { values: rows },
})
```

---

### 25. Implémenter SSO/SAML (pour Enterprise)
**Package**: `next-auth` avec provider SAML

---

## 📊 MÉTRIQUES À SUIVRE

### KPIs Techniques
- [ ] Temps de réponse API < 500ms (p95)
- [ ] Taux d'erreur < 1%
- [ ] Uptime > 99.9%
- [ ] Cache hit ratio > 70%

### KPIs Business
- [ ] Coût moyen par scraping < 0.03€
- [ ] Taux de conversion free → paid > 5%
- [ ] Churn mensuel < 5%

---

## 🔧 OUTILS RECOMMANDÉS

### Développement
- [ ] **ESLint** + **Prettier** (code quality)
- [ ] **Husky** (git hooks)
- [ ] **commitlint** (conventional commits)
- [ ] **Vitest** (tests unitaires)
- [ ] **Playwright** (tests E2E)

### Monitoring
- [ ] **Sentry** (error tracking)
- [ ] **LogRocket** (session replay)
- [ ] **Vercel Analytics** (web vitals)
- [ ] **Upstash QStash** (queue monitoring)

### Performance
- [ ] **Lighthouse CI** (performance tracking)
- [ ] **Bundle Analyzer** (bundle size)
- [ ] **React DevTools Profiler** (React performance)

---

## 📚 DOCUMENTATION À CRÉER

- [ ] **README.md** complet
- [ ] **CONTRIBUTING.md** (guide de contribution)
- [ ] **ARCHITECTURE.md** (diagrammes système)
- [ ] **API.md** (documentation API)
- [ ] **DEPLOYMENT.md** (guide de déploiement)
- [ ] **CHANGELOG.md** (historique des versions)

---

## 🎯 ROADMAP

### Q1 2025
- ✅ Corriger tous les bugs critiques
- [ ] Implémenter rate limiting
- [ ] Ajouter tests (80% coverage)
- [ ] Migrer vers PostGIS
- [ ] Dashboard admin

### Q2 2025
- [ ] API publique (v1)
- [ ] Webhooks
- [ ] Export automatisé
- [ ] Mobile app (React Native)

### Q3 2025
- [ ] Recherche sémantique (IA)
- [ ] Multi-langue (EN, ES, DE)
- [ ] Intégrations tierces (Zapier, Make)

### Q4 2025
- [ ] White-label solution
- [ ] Enterprise SSO
- [ ] On-premise deployment

---

## 🐛 BUGS CONNUS

- [x] Double facturation dans process-job
- [x] Enrichissement Grok gratuit
- [x] Refund manquant si job échoue
- [x] Boucles SQL séquentielles
- [ ] Nominatim rate limiting non géré
- [ ] Timeout non implémenté sur Google Places API
- [ ] Pas de pagination sur les résultats > 100

---

## 💡 IDÉES FUTURES

- [ ] Scraping de réseaux sociaux (Instagram, Facebook)
- [ ] Détection automatique de leads (emails professionnels)
- [ ] Scoring de qualité des leads (IA)
- [ ] Intégration CRM (Salesforce, HubSpot)
- [ ] Alertes temps réel (nouveaux commerces)
- [ ] Analyse de sentiment des avis clients
- [ ] Comparateur de prix concurrent

---

**Dernière mise à jour**: 2025-11-17
**Prochain audit**: 2025-12-17
