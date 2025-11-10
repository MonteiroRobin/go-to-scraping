# 💰 Pricing Optimisé - GoToScraping

## 🎯 Coûts Google Places API (2025)

### Pricing par SKU

| SKU | Champs inclus | Coût / 1000 req (0-100K) | Coût unitaire |
|-----|---------------|--------------------------|---------------|
| **Basic Data** | id, name, address, location, types | $17.00 | **$0.017** |
| **Contact Data** | phone, website, opening_hours | +$3.00 | **+$0.003** |
| **Atmosphere Data** | rating, reviews, photos | +$5.00 | **+$0.005** |
| **Nearby Search (Pro)** | Toutes les données | $32.00 | **$0.032** |

### Notre stratégie à 2 niveaux

```typescript
// SCRAPING BASIC (par défaut)
fields: "id,name,address,location,rating"
Coût: $0.017 (Basic Data seulement)
Crédits: 30 (0.03€)
Marge: 76%

// SCRAPING COMPLET (optionnel)
fields: "id,name,address,location,rating,phone,website,photos"
Coût: $0.025 (Basic + Contact + Atmosphere)
Crédits: 50 (0.05€)
Marge: 100%
```

---

## 💎 Nouveau Pricing Crédits

| Opération | Coût API | Crédits | Prix facturé | Marge |
|-----------|----------|---------|--------------|-------|
| **Cache fresh (<7j)** | 0€ | **1** | 0.001€ | ∞ (profit pur) |
| **Cache stale (7-30j)** | 0€ | **5** | 0.005€ | ∞ (profit pur) |
| **Scraping basique** | 0.017€ | **30** | 0.030€ | **76%** 🔥 |
| **Scraping complet** | 0.025€ | **50** | 0.050€ | **100%** 🔥 |
| **Grok enrichment** | 0.01€ | **10** | 0.010€ | 0% (cost price) |
| **Export CSV** | 0€ | **2** | 0.002€ | ∞ |
| **Export Sheets** | 0€ | **5** | 0.005€ | ∞ |

**Prix du crédit** : 1 crédit = 0.001€

---

## 📊 Rentabilité par Plan

### Avec scraping BASIQUE (30 crédits)

| Plan | Prix | Crédits | Scrapings | Coût API* | Profit | Marge |
|------|------|---------|-----------|-----------|--------|-------|
| **Free** | 0€ | 500 | 16 | 0.27€ | -0.27€ | Loss leader |
| **Starter** | 29€ | 2,500 | 83 | 1.41€ | **27.59€** | **95%** ✅ |
| **Pro** | 99€ | 10,000 | 333 | 5.66€ | **93.34€** | **94%** ✅ |
| **Business** | 399€ | 50,000 | 1,666 | 28.32€ | **370.68€** | **93%** ✅ |

*_Avec cache 70%, coût API réel = 30% de ces montants_

### Avec cache 70% hit rate

| Plan | Scrapings | Nouveaux (30%) | Coût API | Profit | Marge |
|------|-----------|----------------|----------|--------|-------|
| **Starter** | 83 | 25 | **0.43€** | **28.57€** | **98%** 🚀 |
| **Pro** | 333 | 100 | **1.70€** | **97.30€** | **98%** 🚀 |
| **Business** | 1,666 | 500 | **8.50€** | **390.50€** | **98%** 🚀 |

---

## 🎯 Comparaison Basic vs Complete

### Scénario utilisateur type

**Agence immobilière** (Plan Pro - 10,000 crédits/mois)

#### Option 1 : Scraping BASIQUE uniquement
```
10,000 crédits ÷ 30 = 333 scrapings/mois
Coût API (30% nouveaux) : 100 × 0.017€ = 1.70€
Profit : 99€ - 1.70€ = 97.30€
Marge : 98%
```

#### Option 2 : Mix Basic + Complete
```
8,000 crédits en basic (266 scrapings)
2,000 crédits en complete (40 scrapings enrichis)

Coût API :
- Basic : 80 nouveaux × 0.017€ = 1.36€
- Complete : 12 nouveaux × 0.025€ = 0.30€
- Total : 1.66€

Profit : 99€ - 1.66€ = 97.34€
Marge : 98%
```

**Conclusion** : Les deux options sont rentables, mais Complete offre plus de valeur au user !

---

## 💡 UX : Quand proposer Complete ?

### Frontend flow recommandé

```typescript
// 1. User lance recherche → BASIC par défaut (30 crédits)
handleSearch() {
  startJob({ includeContactData: false })  // Scraping basic
}

// 2. Résultats affichés → CTA "Enrichir avec contacts"
<Button onClick={enrichResults}>
  📞 Ajouter téléphones & sites web
  <Badge>+20 crédits</Badge>
</Button>

// 3. Si user clique → Re-fetch avec Contact Data
enrichResults() {
  // Pas besoin de re-scraper tout, juste ajouter les champs manquants
  // Place Details API avec uniquement Contact fields
  fetchContactData(placeIds)  // +0.003€ par place
}
```

### Messages utilisateur

**Après scraping basique** :
```
✅ 42 établissements trouvés (30 crédits)

🎯 Vous avez les informations de base (nom, adresse, note).

💎 Voulez-vous enrichir avec :
   📞 Numéros de téléphone
   🌐 Sites web
   📸 Photos
   ⏰ Horaires d'ouverture

Coût : +20 crédits (0.02€)

[Enrichir maintenant] [Plus tard]
```

---

## 🔢 Calculs de Break-Even

### Projection 100 users payants

**Distribution typique** :
- 50 Starter (29€) = 1,450€
- 30 Pro (99€) = 2,970€
- 15 Business (399€) = 5,985€
- 5 Enterprise (1,499€) = 7,495€
- **MRR : 17,900€**

**Coûts mensuels** :
- Infra (Supabase, Vercel, Redis) : 55€
- API Google avec cache 70% :
  - Starter : 50 × 25 scrapings × 0.017€ = 21.25€
  - Pro : 30 × 100 scrapings × 0.017€ = 51€
  - Business : 15 × 500 scrapings × 0.017€ = 127.50€
  - Enterprise : 5 × 1000 scrapings × 0.017€ = 85€
  - **Total API : ~285€**
- **Coûts totaux : 340€**

**Profit net : 17,560€/mois (98% marge)** 🚀💰

---

## 🎨 Implémentation Code

### Fichier créé : `lib/credits-config.ts`

```typescript
export const CREDIT_COSTS = {
  CACHE_FRESH: 1,
  CACHE_STALE: 5,
  SCRAPING_BASIC: 30,      // NEW: Optimized cost
  SCRAPING_COMPLETE: 50,   // NEW: Full data with contact
  ENRICHMENT_GROK_PER_BUSINESS: 10,
  EXPORT_CSV: 2,
  EXPORT_GOOGLE_SHEETS: 5,
}
```

### API Routes modifiées

**`/api/scrape-places`** :
```typescript
// Nouveau paramètre
const { includeContactData = false } = await req.json()

// Fields conditionnels
if (includeContactData) {
  fieldMask = [...basicFields, ...contactFields, ...atmosphereFields]
} else {
  fieldMask = [...basicFields, "places.rating", "places.userRatingCount"]
}
```

**`/api/scraping/start-job`** :
```typescript
import { CREDIT_COSTS } from '@/lib/credits-config'

// Utilise le nouveau coût
const creditsAmount = CREDIT_COSTS.SCRAPING_BASIC  // 30 au lieu de 50
```

---

## 📈 Avantages de cette optimisation

### 1. Réduction des coûts API (-47%)
- Avant : $0.032 par scraping
- Après : $0.017 par scraping (Basic)
- **Économie : $0.015 par scraping**

### 2. Meilleure marge
- Avant : 56% (50 crédits vs 0.032€)
- Après : **76%** (30 crédits vs 0.017€)
- **Amélioration : +20 points de marge**

### 3. Plus de scrapings pour les users
- Avant : 10,000 crédits = 200 scrapings
- Après : 10,000 crédits = **333 scrapings** (+66%)
- **Users sont plus satisfaits !**

### 4. Flexibilité d'upgrade
- User peut choisir d'enrichir uniquement certains résultats
- Pay-as-you-go pour les données premium
- Perception de contrôle sur les coûts

---

## 🚀 Prochaines étapes

### Phase 1 : Backend (Fait ✅)
- [x] Créer `lib/credits-config.ts`
- [x] Modifier `/api/scrape-places` avec `includeContactData`
- [x] Modifier `/api/scraping/start-job` avec nouveaux coûts
- [x] Optimiser field masks pour Basic Data

### Phase 2 : Frontend (À faire)
- [ ] Bouton "Enrichir" après résultats basic
- [ ] Modal de confirmation avec coût (+20 crédits)
- [ ] Badge "Basic" vs "Complete" sur résultats
- [ ] Tooltip expliquant les différences

### Phase 3 : UX (À faire)
- [ ] Copy marketing : "30 crédits = scraping rapide"
- [ ] Messages d'upgrade intelligents
- [ ] A/B test : Basic par défaut vs Complete par défaut
- [ ] Analytics : taux d'enrichissement

---

## 💬 Copy UX Suggéré

### Dans pricing page

**Plan Free** :
> 500 crédits = ~16 scrapings basiques ou ~50 depuis cache

**Plan Starter** :
> 2,500 crédits = ~83 scrapings ou mix optimisé basic + enrichissement

### Toast après scraping

**Scraping basic réussi** :
```
✅ 42 établissements trouvés
📊 Informations de base récupérées (30 crédits)

💡 Ajoutez téléphones & sites web pour 20 crédits de plus
[Enrichir] [Non merci]
```

**Cache hit** :
```
⚡ 42 résultats depuis cache (1 crédit)
Données de 3 jours - 100% fraîches !

💰 Vous avez économisé 29 crédits vs nouveau scraping
```

---

**Optimisation implémentée ! ✅**
**Marges : 76-100% sur scrapings**
**Profit : 98% avec cache**
**Users satisfaits : Plus de scrapings pour moins cher**
