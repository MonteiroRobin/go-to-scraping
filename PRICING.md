# 💰 Système de Crédits - Go To Scraping

## Logique de Pricing

### Correspondance Crédits ↔ Coûts Réels

**1 crédit = 0.01€**

Notre système est calibré sur les coûts réels de Google Places API v2 :

| Action | Coût Google | Crédits | Équivalent € |
|--------|-------------|---------|--------------|
| Recherche basique (20 places) | $0.017 | 2 | 0.02€ |
| Avec contact data | $0.020 | 2 | 0.02€ |
| Rayon > 10km | +$0.017/requête | +2/10km | +0.02€ |
| Enrichissement Grok (par lead) | $0.01 estimé | 2 | 0.02€ |
| Cache frais (< 7 jours) | $0 | 1 | 0.01€ |

### Détails des Coûts

#### 🔍 Scraping Google Places

- **Requête standard** : 2 crédits
  - Retourne jusqu'à 20 résultats
  - Inclut : nom, adresse, coordonnées, types
  - Contact data inclus (téléphone, site web)

- **Rayon étendu (> 10km)** : +2 crédits par tranche de 10km
  - Exemple : rayon 25km = 2 (base) + 4 (15km extra) = **6 crédits**

#### 🤖 Enrichissement Grok AI

- **2 crédits par lead enrichi**
- Ajoute :
  - Description professionnelle
  - Email probable
  - Catégorie précise
  - Tags intelligents
  - Spécialités
  - Estimation de prix (€-€€€€)
  - Infos pratiques (parking, accessibilité, paiements)

#### 💾 Cache

- **Cache frais (< 7 jours)** : 1 crédit
  - Économie de 1 crédit vs nouveau scraping
  - Données récentes et fiables

- **Cache obsolète (> 7 jours)** : Nouveau scraping recommandé

### Plans Tarifaires

#### 🆓 Free Plan
- **100 crédits offerts** = ~50 recherches
- Pas de carte bancaire requise
- Idéal pour tester

#### 💼 Starter Plan - 10€/mois
- **1000 crédits** (~500 recherches)
- Support email
- Export CSV illimité

#### 🚀 Pro Plan - 50€/mois
- **6000 crédits** (~3000 recherches)
- Support prioritaire
- Jobs asynchrones
- Analytics avancées

#### 🏢 Enterprise Plan - Sur mesure
- Crédits illimités
- API access
- Support dédié
- SLA garanti

### Exemples Concrets

| Cas d'usage | Crédits | Coût € |
|-------------|---------|--------|
| 1 recherche "restaurant Paris" | 2 | 0.02€ |
| 1 recherche + enrichissement 10 leads | 22 | 0.22€ |
| 10 recherches (200 leads) | 20 | 0.20€ |
| 10 recherches + enrichir 50 leads | 120 | 1.20€ |
| Utiliser cache (10 fois) | 10 | 0.10€ |

### Optimisations pour Économiser

1. **Utiliser le cache** : Économisez 50% en réutilisant les données récentes
2. **Cibler vos recherches** : Rayon précis = moins de crédits
3. **Enrichir sélectivement** : Enrichissez uniquement les leads les plus prometteurs
4. **Filtrer avant export** : Ne payez que pour ce dont vous avez besoin

### Transparence

- ✅ Pas de frais cachés
- ✅ Compteur en temps réel
- ✅ Alerte si crédits faibles (< 10)
- ✅ Confirmation avant actions coûteuses
- ✅ Historique de consommation dans Analytics

### Recharge

- Rechargez quand vous voulez
- Crédits sans expiration
- Paiement sécurisé via Stripe

---

**Questions ?** Contactez-nous à support@gotoscraping.com
