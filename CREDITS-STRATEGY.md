# 💰 Stratégie de Crédits & Anti-Triche

## 🎯 Objectif : Faire x10-x15 sur les coûts

### Analyse des coûts réels

| Opération | Coût API réel | Marge cible | Crédits facturés | Prix/crédit |
|-----------|---------------|-------------|------------------|-------------|
| Google Places search | ~0.032€ | x15 | **50 crédits** | 0.001€ |
| Grok enrichment/étab | ~0.01€ | x10 | **10 crédits** | 0.001€ |
| Cache fresh (<7j) | 0€ | ∞ | **1 crédit** | Symbolique |
| Cache stale (7-30j) | 0€ | ∞ | **5 crédits** | Encourage refresh |
| Export CSV | 0€ | ∞ | **2 crédits** | Monétiser feature |
| Export Google Sheets | 0€ | ∞ | **5 crédits** | Premium |

**Prix par crédit : 0.001€** (soit 1€ = 1000 crédits)

---

## 💎 Plans Tarifaires

### Comparaison complète

| Plan | Prix/mois | Crédits | Limite jour | Scrapings* | Prix/scraping | Cible |
|------|-----------|---------|-------------|------------|---------------|-------|
| **Free** | 0€ | 500 | 50 | ~10 | - | Discovery, tests |
| **Starter** | 29€ | 2,500 | 200 | ~50 | 0.58€ | Freelancers |
| **Pro** | 99€ | 10,000 | 1,000 | ~200 | 0.49€ | Petites agences |
| **Business** | 399€ | 50,000 | 5,000 | ~1000 | 0.40€ | Grosses agences |
| **Enterprise** | 1,499€ | ∞ | ∞ | ∞ | - | Grands comptes |

*_Scraping = nouveau scraping complet (50 crédits). Cache = quasi gratuit._

### Détail Free Tier (500 crédits)

**Scénarios d'usage** :
- 10 nouveaux scrapings (10 × 50 = 500)
- 50 scrapings avec cache fresh (50 × 1 = 50) + 9 nouveaux (9 × 50 = 450) = 500
- 500 recherches 100% cache = usage illimité pratique

**But du Free** :
- ✅ Hook l'utilisateur avec cache ultra rapide
- ✅ Montrer la valeur avant payment
- ✅ Limiter l'abus (50 crédits/jour max)
- ✅ Conversion vers Starter quand besoin de plus

---

## 🛡️ Mesures Anti-Triche (Niveaux de sécurité)

### Niveau 1 : Détection multi-comptes

**Problème** : User crée 10 comptes free pour avoir 5000 crédits gratuits

**Solution** :
```typescript
// Backend checks
1. Email verification obligatoire (pas de temp emails)
   - Liste noire : guerrillamail, 10minutemail, etc.
   - Vérifier MX records du domaine

2. Device fingerprinting (FingerprintJS Pro)
   - Fingerprint unique basé sur canvas, WebGL, fonts, etc.
   - Max 3 comptes par fingerprint
   - Coût : ~0.001€/vérification

3. IP rate limiting
   - Max 3 créations de compte par IP/jour
   - Max 1 création par IP/heure
   - Utiliser CF Access pour geo-blocking si besoin

4. Phone verification (optionnel pour upgrade)
   - Twilio Verify : ~0.05€/SMS
   - Obligatoire pour passer de Free à Starter

5. Détection comportementale
   - Si nouveau compte fait 10 scrapings en 1h → suspect
   - Pattern matching : même city/type que compte précédent
   - Score de risque (0-100), bloquer si > 80
```

**Implémentation** :
```sql
-- Table de détection
CREATE TABLE account_abuse_detection (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  fingerprint TEXT,
  ip_address INET,
  email_domain TEXT,
  risk_score INTEGER DEFAULT 0,
  flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flags possibles :
-- - temp_email
-- - duplicate_fingerprint
-- - rapid_signup
-- - suspicious_pattern
-- - multiple_accounts_same_ip
```

---

### Niveau 2 : Protection du cache

**Problème** : User force le re-scraping au lieu d'utiliser le cache

**Solution** :
```typescript
// Forcer l'utilisation du cache côté SERVEUR
export async function POST(req: NextRequest) {
  const { useCache } = await req.json()

  // ❌ JAMAIS faire confiance au client
  // const shouldUseCache = useCache // NON !

  // ✅ Décision serveur UNIQUEMENT
  const cacheData = await checkCache(params)

  if (cacheData.status === 'fresh') {
    // FORCER le cache, pas de choix
    return cacheData.businesses
  }

  if (cacheData.status === 'stale') {
    // Suggérer mais autoriser bypass (coûte 50 crédits)
    if (user.credits < 50) {
      return { error: 'Use stale cache (5 credits) or upgrade' }
    }
  }
}
```

**Règles strictes** :
1. Cache < 3 jours → **FORCÉ**, pas de bypass possible
2. Cache 3-7 jours → Bypass autorisé mais coûte 50 crédits
3. Cache > 7 jours → Recommandé de bypass (5 crédits cache vs 50 nouveau)
4. Admins uniquement peuvent forcer bypass pour debug

---

### Niveau 3 : Détection recherches dupliquées

**Problème** : User lance 10× la même recherche pour "tester"

**Solution** :
```typescript
// Hash unique de la recherche
const searchHash = crypto
  .createHash('sha256')
  .update(`${city}:${businessType}:${radius}:${keywords}`)
  .digest('hex')

// Check duplication
const duplicate = await checkDuplicateSearch(userId, searchHash)

if (duplicate.should_block) {
  return {
    error: `Same search launched ${duplicate.minutes_since} min ago.`,
    message: `Please wait ${duplicate.wait_minutes} more minutes.`,
    retry_after: duplicate.wait_minutes * 60 // seconds
  }
}
```

**Règles de cooldown** :
- Même recherche < **10 minutes** → BLOQUÉ (erreur 429)
- Même recherche < **1 heure** → Warning + suggestion cache
- Même recherche < **24h** avec cache fresh → FORCÉ cache (1 crédit)

---

### Niveau 4 : Transactions atomiques

**Problème** : Race condition = user lance 5 recherches simultanées, bypass la limite de crédits

**Solution** :
```sql
-- Fonction PostgreSQL avec verrou pessimiste
CREATE FUNCTION deduct_credits(...) RETURNS JSONB AS $$
BEGIN
  -- LOCK la row user_credits (bloque autres transactions)
  SELECT credits_remaining
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE; -- ← CRUCIAL : verrou pessimiste

  -- Vérifier crédits
  IF credits_remaining < amount THEN
    RETURN jsonb_build_object('success', false, ...);
  END IF;

  -- Déduire
  UPDATE user_credits SET credits_remaining = credits_remaining - amount ...;

  -- Log (audit trail immuable)
  INSERT INTO credit_transactions (...);

  RETURN jsonb_build_object('success', true, ...);
END;
$$ LANGUAGE plpgsql;
```

**Avantages** :
- ✅ Impossible de dépasser les crédits (atomique)
- ✅ Audit trail complet (qui, quoi, quand, combien)
- ✅ Rollback automatique si erreur
- ✅ Performance (index sur user_id)

---

### Niveau 5 : Limites journalières

**Problème** : User avec plan Pro fait 10,000 crédits en 1 jour puis chargeback Stripe

**Solution** :
```typescript
// Limites par plan
const DAILY_LIMITS = {
  free: 50,      // Max 1 scraping/jour
  starter: 200,  // Max 4 scrapings/jour
  pro: 1000,     // Max 20 scrapings/jour
  business: 5000 // Max 100 scrapings/jour
}

// Reset à minuit (timezone user ou UTC)
if (user.last_daily_reset < today) {
  user.daily_usage = 0
}

// Vérifier limite AVANT de déduire
if (user.daily_usage + amount > DAILY_LIMITS[user.plan]) {
  return {
    error: 'Daily limit reached',
    daily_usage: user.daily_usage,
    daily_limit: DAILY_LIMITS[user.plan],
    reset_at: tomorrow_midnight,
    suggestion: 'Upgrade your plan for higher limits'
  }
}
```

**Protection chargeback** :
- Période de grâce 7 jours avant remboursement Stripe
- Si chargeback pendant période de grâce → crédits gelés
- Ban définitif si chargeback confirmé

---

### Niveau 6 : Rate limiting API

**Problème** : User script automatisé qui spam l'API

**Solution avec Upstash Redis** :
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
  analytics: true,
})

export async function POST(req: NextRequest) {
  const identifier = req.headers.get('x-user-id') || req.ip
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        limit,
        remaining,
        reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  // Continue...
}
```

**Limites par endpoint** :
- `/api/scraping/check-cache` : 30 req/min (léger)
- `/api/scraping/start-job` : 10 req/min (coûteux)
- `/api/scraping/job-status` : 60 req/min (polling)

---

## 📊 Modèle économique détaillé

### Calcul de rentabilité

**Coûts fixes mensuels** :
- Supabase Pro : ~25€/mois (jusqu'à 8GB database)
- Upstash Redis : ~10€/mois (rate limiting)
- Vercel Pro : ~20€/mois (si besoin)
- **Total : ~55€/mois**

**Coûts variables par user** :
- Google Places API : 0.032€/scraping nouveau
- Grok enrichment : 0.01€/établissement
- Stockage : ~0.001€/mois/user (négligeable)

**Break-even analysis** :

| Plan | Prix | Crédits | Scrapings max | Coût API max | Profit min |
|------|------|---------|---------------|--------------|------------|
| Free | 0€ | 500 | 10 | 0.32€ | -0.32€ |
| Starter | 29€ | 2,500 | 50 | 1.60€ | **+27.40€** |
| Pro | 99€ | 10,000 | 200 | 6.40€ | **+92.60€** |
| Business | 399€ | 50,000 | 1,000 | 32€ | **+367€** |

**Hypothèses** :
- 80% des Free users utilisent < 200 crédits (coût réel < 0.10€)
- 20% des Free users convertissent en Starter
- Cache hit rate : 70% (après quelques mois)
- Avec 70% cache, coût API divisé par 3

**Projection 100 users payants** :
- 50 Starter (50 × 29€ = 1,450€)
- 30 Pro (30 × 99€ = 2,970€)
- 15 Business (15 × 399€ = 5,985€)
- 5 Enterprise (5 × 1,499€ = 7,495€)
- **Total MRR : 17,900€/mois**

**Coûts pour 100 users** :
- Infra fixe : 55€
- API costs (avec 70% cache) : ~1,500€
- **Profit : ~16,345€/mois (91% marge)**

---

## 🚀 Implémentation prochaines étapes

### Checklist Backend

- [x] SQL schema avec credit_transactions
- [x] Fonction deduct_credits() atomique
- [x] Fonction check_duplicate_search()
- [x] RLS sur toutes les tables
- [ ] **Intégrer deduct_credits() dans toutes les API routes**
- [ ] Rate limiting avec Upstash
- [ ] Device fingerprinting avec FingerprintJS
- [ ] Email verification (pas de temp emails)
- [ ] Webhook Stripe pour achats de crédits

### Checklist Frontend

- [ ] Composant UserCredits (affichage navbar)
- [ ] Page /pricing avec plans
- [ ] Modal "Insufficient credits" avec upgrade CTA
- [ ] Affichage coût AVANT action (ex: "50 crédits seront déduits")
- [ ] Historique des transactions (/account/transactions)
- [ ] Badge "Free tier" sur interface

### Checklist Monitoring

- [ ] Dashboard admin analytics (credit_transactions)
- [ ] Alertes si abuse détecté (email admin)
- [ ] Métriques Vercel : cache hit rate, API costs
- [ ] Supabase logs : failed transactions, blocked searches

---

## 🎨 Messaging utilisateur

### Copy pour pricing page

**Free - 500 crédits/mois**
> Parfait pour tester l'outil et découvrir la puissance du cache partagé.
> - ⚡ Résultats instantanés avec cache
> - 🎯 ~10 nouveaux scrapings/mois
> - 📊 Accès à toutes les features
> - 💳 Pas de carte bancaire requise

**Starter - 29€/mois (2,500 crédits)**
> Pour freelancers et consultants.
> - 🚀 ~50 nouveaux scrapings/mois
> - 💎 10× moins cher avec cache
> - 📈 Export CSV & Google Sheets
> - 🤖 Enrichissement Grok AI
> - 💬 Support email

**Pro - 99€/mois (10,000 crédits)**
> Pour agences et équipes.
> - 🔥 ~200 nouveaux scrapings/mois
> - 👥 Multi-utilisateurs (bientôt)
> - 📊 Analytics avancés
> - 🎯 Priorité sur les jobs
> - 💬 Support prioritaire

**Business - 399€/mois (50,000 crédits)**
> Pour agences établies.
> - 💪 ~1000 scrapings/mois
> - 🏢 Facturation entreprise
> - 📞 Support téléphone
> - 🔧 Features custom
> - 📝 SLA 99.9%

**Enterprise - 1,499€/mois**
> Pour grands comptes.
> - ♾️ Crédits illimités
> - 🔐 Infrastructure dédiée
> - 👨‍💼 Account manager
> - 🎓 Formation équipe
> - 📜 Contrat sur-mesure

### Messages d'erreur (copy important !)

**Insufficient credits** :
```
😔 Oops ! Crédits insuffisants

Cette recherche nécessite 50 crédits, mais vous n'en avez que 12.

💡 Astuce : 70% de nos recherches utilisent le cache (1 crédit) !

[Voir les plans] [Recharger]
```

**Daily limit reached** :
```
⏰ Limite journalière atteinte

Vous avez utilisé 50/50 crédits aujourd'hui (plan Free).
Réinitialisation dans 8h 23min.

💎 Passez au plan Starter (200 crédits/jour) pour continuer.

[Voir les plans]
```

**Duplicate search blocked** :
```
⚠️ Recherche identique détectée

Vous avez lancé cette recherche il y a 3 minutes.
Utilisez les résultats précédents ou attendez 7 minutes.

💡 Astuce : Les résultats sont sauvegardés dans votre historique.

[Voir l'historique]
```

---

## 🔮 Évolutions futures

### Phase 2 : Features premium

**Multi-utilisateurs (Business+)** :
- Équipes avec rôles (admin, member, viewer)
- Crédits partagés entre membres
- Dashboard collaboratif

**API access (Enterprise)** :
- API REST avec rate limiting
- Webhooks pour scraping terminé
- Documentation Swagger

**White-label (Enterprise)** :
- Custom domain
- Custom branding
- Pas de "Powered by GoToScraping"

### Phase 3 : Optimisations

**Smart credit recommendations** :
- ML model prédisant si cache sera fresh
- Suggérer meilleur moment pour scraper (moins cher)
- Auto-schedule de scrapings pendant heures creuses

**Credit marketplace** :
- Users peuvent revendre crédits non utilisés
- Système d'offres/demandes
- Commission 20% sur transactions

**Referral program** :
- Parrainer = 500 crédits bonus
- Parrainé upgrade = 1000 crédits bonus parrain
- Affiliation 20% récurrent

---

## ✅ Validation finale

### Checklist anti-triche

- [x] ✅ Transactions atomiques (FOR UPDATE)
- [x] ✅ Audit trail immuable (credit_transactions)
- [x] ✅ Limites journalières (daily_usage)
- [x] ✅ Détection duplication (search_fingerprints)
- [x] ✅ RLS sur toutes tables sensibles
- [ ] ⏳ Rate limiting API (Upstash)
- [ ] ⏳ Device fingerprinting (FingerprintJS)
- [ ] ⏳ Email verification (MX records)
- [ ] ⏳ Phone verification (Twilio)
- [ ] ⏳ Behavioral analysis (risk score)

### Checklist pricing

- [x] ✅ Marges calculées (x10-x15)
- [x] ✅ Plans définis (Free → Enterprise)
- [x] ✅ Coûts par opération fixés
- [x] ✅ Break-even analysis validé
- [ ] ⏳ Page pricing créée
- [ ] ⏳ Stripe intégration
- [ ] ⏳ Webhooks Stripe

**Prêt pour implémentation ! 🚀**
