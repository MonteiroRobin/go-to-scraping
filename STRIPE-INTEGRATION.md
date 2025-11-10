# 💳 Guide d'intégration Stripe

## 🎯 Vue d'ensemble

Ce document explique comment configurer Stripe pour monétiser GoToScraping avec un système de crédits.

**Modèle de paiement** :
- Plans récurrents (abonnements mensuels)
- Achat ponctuel de crédits (one-time payment)
- Webhooks pour synchroniser Supabase

---

## 📦 1. Créer les produits Stripe

### Se connecter au Dashboard Stripe

1. Aller sur https://dashboard.stripe.com
2. Passer en mode **Test** (toggle en haut à gauche)
3. Aller dans **Produits** → **Ajouter un produit**

### Créer les 5 plans d'abonnement

#### Plan 1 : Starter (29€/mois)

**Informations produit** :
- Nom : `GoToScraping - Starter`
- Description : `2,500 crédits/mois - Idéal pour freelancers`
- Prix : `29.00 EUR`
- Type de facturation : **Récurrent**
- Période de facturation : **Mensuel**

**Métadonnées** (important pour webhooks) :
```
plan_type: starter
credits_amount: 2500
daily_limit: 200
```

**Copier le Price ID** : `price_xxxxxxxxxxxxx`

---

#### Plan 2 : Pro (99€/mois)

**Informations produit** :
- Nom : `GoToScraping - Pro`
- Description : `10,000 crédits/mois - Pour agences`
- Prix : `99.00 EUR`
- Type de facturation : **Récurrent**
- Période de facturation : **Mensuel**

**Métadonnées** :
```
plan_type: pro
credits_amount: 10000
daily_limit: 1000
```

**Copier le Price ID** : `price_xxxxxxxxxxxxx`

---

#### Plan 3 : Business (399€/mois)

**Informations produit** :
- Nom : `GoToScraping - Business`
- Description : `50,000 crédits/mois - Pour grosses agences`
- Prix : `399.00 EUR`
- Type de facturation : **Récurrent**
- Période de facturation : **Mensuel**

**Métadonnées** :
```
plan_type: business
credits_amount: 50000
daily_limit: 5000
```

**Copier le Price ID** : `price_xxxxxxxxxxxxx`

---

#### Plan 4 : Enterprise (1,499€/mois)

**Informations produit** :
- Nom : `GoToScraping - Enterprise`
- Description : `Crédits illimités - Pour grands comptes`
- Prix : `1499.00 EUR`
- Type de facturation : **Récurrent**
- Période de facturation : **Mensuel**

**Métadonnées** :
```
plan_type: enterprise
credits_amount: 999999
daily_limit: 999999
```

**Copier le Price ID** : `price_xxxxxxxxxxxxx`

---

### Créer les packs de crédits (one-time)

#### Pack 1 : 1,000 crédits (15€)

**Informations produit** :
- Nom : `1,000 crédits GoToScraping`
- Description : `Pack de 1,000 crédits - Achat ponctuel`
- Prix : `15.00 EUR`
- Type de facturation : **Paiement unique**

**Métadonnées** :
```
product_type: credits_pack
credits_amount: 1000
```

**Copier le Price ID** : `price_xxxxxxxxxxxxx`

---

#### Pack 2 : 5,000 crédits (65€)

**Informations produit** :
- Nom : `5,000 crédits GoToScraping`
- Description : `Pack de 5,000 crédits - Achat ponctuel (-13% vs abonnement)`
- Prix : `65.00 EUR`
- Type de facturation : **Paiement unique**

**Métadonnées** :
```
product_type: credits_pack
credits_amount: 5000
```

**Copier le Price ID** : `price_xxxxxxxxxxxxx`

---

#### Pack 3 : 20,000 crédits (220€)

**Informations produit** :
- Nom : `20,000 crédits GoToScraping`
- Description : `Pack de 20,000 crédits - Achat ponctuel (-26% vs abonnement)`
- Prix : `220.00 EUR`
- Type de facturation : **Paiement unique**

**Métadonnées** :
```
product_type: credits_pack
credits_amount: 20000
```

**Copier le Price ID** : `price_xxxxxxxxxxxxx`

---

## 🔧 2. Configuration des variables d'environnement

### Ajouter dans `.env.local` :

```bash
# Stripe Keys (récupérer depuis https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe Webhook Secret (voir section 4 ci-dessous)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (copier depuis chaque produit)
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx

# Stripe Credit Packs
STRIPE_PRICE_PACK_1K=price_xxxxxxxxxxxxx
STRIPE_PRICE_PACK_5K=price_xxxxxxxxxxxxx
STRIPE_PRICE_PACK_20K=price_xxxxxxxxxxxxx
```

---

## 🔌 3. Créer l'API Checkout

### Fichier : `app/api/stripe/create-checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: NextRequest) {
  try {
    const { priceId, mode } = await req.json() // mode: 'subscription' | 'payment'

    // Get authenticated user
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("sb-access-token")
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(sessionCookie.value)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create Stripe customer
    let customerId: string | undefined

    const { data: userCredit } = await supabase
      .from("user_credits")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (userCredit?.stripe_customer_id) {
      customerId = userCredit.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to Supabase
      await supabase
        .from("user_credits")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mode || "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/pricing?payment=cancelled`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
```

---

## 🪝 4. Configurer les Webhooks Stripe

### Créer un endpoint webhook

1. Aller dans **Développeurs** → **Webhooks** dans Stripe Dashboard
2. Cliquer sur **Ajouter un endpoint**
3. URL : `https://your-domain.com/api/stripe/webhook`
4. Sélectionner les événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Copier le Signing Secret** : `whsec_xxxxxxxxxxxxx`
6. L'ajouter dans `.env.local` comme `STRIPE_WEBHOOK_SECRET`

---

### Fichier : `app/api/stripe/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("[Stripe Webhook] Event:", event.type)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id
  if (!userId) return

  // Get line items to determine what was purchased
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  const priceId = lineItems.data[0]?.price?.id

  if (!priceId) return

  // Get product metadata
  const price = await stripe.prices.retrieve(priceId)
  const product = await stripe.products.retrieve(price.product as string)

  if (product.metadata.product_type === "credits_pack") {
    // One-time credit pack purchase
    const creditsAmount = parseInt(product.metadata.credits_amount || "0")

    await supabase.rpc("add_credits", {
      p_user_id: userId,
      p_amount: creditsAmount,
      p_type: "purchase",
      p_details: {
        stripe_session_id: session.id,
        price_id: priceId,
        amount_paid: session.amount_total,
      },
    })

    console.log(`[Webhook] Added ${creditsAmount} credits to user ${userId}`)
  } else if (session.mode === "subscription") {
    // Subscription - will be handled by subscription.created event
    console.log(`[Webhook] Subscription checkout completed for user ${userId}`)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) {
    // Try to get user from customer
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    if (customer.deleted) return
    // Get userId from customer metadata
    const customerId = customer.id
    const { data } = await supabase
      .from("user_credits")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single()
    if (!data) return
  }

  const priceId = subscription.items.data[0]?.price.id
  const price = await stripe.prices.retrieve(priceId)
  const product = await stripe.products.retrieve(price.product as string)

  const planType = product.metadata.plan_type || "free"
  const creditsAmount = parseInt(product.metadata.credits_amount || "500")
  const dailyLimit = parseInt(product.metadata.daily_limit || "50")

  // Update user plan and reset credits
  await supabase
    .from("user_credits")
    .update({
      plan: planType,
      credits_remaining: creditsAmount,
      credits_total: creditsAmount,
      daily_usage: 0,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  console.log(`[Webhook] Updated user ${userId} to plan ${planType}`)
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // Downgrade to free plan
  await supabase
    .from("user_credits")
    .update({
      plan: "free",
      credits_total: 500,
      subscription_status: "cancelled",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)

  console.log(`[Webhook] Subscription cancelled: ${subscription.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Subscription renewal - reset monthly credits
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await handleSubscriptionChange(subscription)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Mark subscription as past_due
  await supabase
    .from("user_credits")
    .update({
      subscription_status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription as string)

  console.log(`[Webhook] Payment failed for subscription: ${invoice.subscription}`)
}
```

---

## 🎨 5. Créer la page Pricing

### Fichier : `app/pricing/page.tsx`

```typescript
import { PricingPlans } from "@/components/pricing-plans"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarifs - GoToScraping",
  description: "Choisissez le plan adapté à vos besoins de scraping",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tarifs simples et transparents</h1>
          <p className="text-xl text-muted-foreground">
            Payez uniquement pour ce que vous utilisez. Cache = quasi gratuit !
          </p>
        </div>

        <PricingPlans />

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Questions fréquentes</h2>
          {/* Add FAQ items */}
        </div>
      </main>
    </div>
  )
}
```

---

## ✅ Checklist d'implémentation

### Phase 1 : Configuration Stripe (Toi)
- [ ] Créer compte Stripe (ou utiliser existant)
- [ ] Créer 4 produits d'abonnement (Starter, Pro, Business, Enterprise)
- [ ] Créer 3 packs de crédits one-time
- [ ] Copier tous les Price IDs
- [ ] Ajouter Price IDs dans `.env.local`
- [ ] Configurer webhook endpoint
- [ ] Copier webhook secret dans `.env.local`

### Phase 2 : Code Backend (Déjà fait par moi)
- [x] API `/api/stripe/create-checkout` créée (ci-dessus)
- [x] API `/api/stripe/webhook` créée (ci-dessus)
- [x] Fonction RPC `add_credits()` dans SQL
- [ ] Tester webhook localement avec Stripe CLI

### Phase 3 : Frontend (À faire)
- [ ] Créer composant `PricingPlans` avec cartes des plans
- [ ] Intégrer bouton "Recharger" dans UserCreditsDisplay
- [ ] Page `/pricing` avec tous les plans
- [ ] Modal "Insufficient credits" avec upgrade CTA
- [ ] Page `/account/transactions` pour l'historique

---

## 🧪 6. Tester l'intégration

### Installer Stripe CLI

```bash
# Mac/Linux
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe
```

### Lancer webhook local

```bash
# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le webhook secret qui s'affiche et l'ajouter dans .env.local
```

### Créer un paiement test

```bash
# Utiliser carte de test : 4242 4242 4242 4242
# Date : n'importe quelle date future
# CVC : n'importe quel 3 chiffres
```

### Vérifier dans logs

1. Console de l'app Next.js (webhook reçu)
2. Supabase (crédits ajoutés)
3. Stripe Dashboard (paiement confirmé)

---

## 🚀 Passage en Production

### 1. Passer en mode Live sur Stripe
- Activer mode **Live** dans Dashboard
- Refaire les produits en mode Live
- Récupérer nouveaux Price IDs

### 2. Update `.env.production`
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (nouveau pour prod)
```

### 3. Configurer webhook production
- URL : `https://gotoscraping.com/api/stripe/webhook`
- Copier nouveau signing secret

### 4. Activer emails Stripe
- Confirmation de paiement
- Reçus automatiques
- Échecs de paiement

---

## 💡 Tips & Best Practices

### Sécurité
✅ **Toujours** vérifier signature webhook
✅ **Jamais** exposer `STRIPE_SECRET_KEY` côté client
✅ Utiliser `STRIPE_WEBHOOK_SECRET` pour valider les events
✅ Mettre webhooks en HTTPS uniquement en prod

### UX
✅ Afficher prix **TTC** (TVA française = 20%)
✅ Indiquer "Annuler à tout moment" pour abonnements
✅ Mettre badge "Économisez X%" sur plans annuels
✅ Montrer ROI : "1 scraping = 0.58€ avec Starter"

### Business
✅ Offrir **7 jours d'essai gratuit** sur Starter (optionnel)
✅ Créer promo codes pour influenceurs : `SCRAPE20` (-20%)
✅ Tracking via Stripe metadata : source de conversion
✅ Set up Stripe Billing Portal pour self-service cancellation

---

## 📧 Emails à configurer

### 1. Confirmation paiement
- "Merci ! Vos X crédits ont été ajoutés"
- Inclure lien vers /scraper

### 2. Crédits épuisés
- "⚠️ Plus que 20% de crédits"
- CTA : "Recharger maintenant"

### 3. Échec paiement abonnement
- "❌ Problème avec votre paiement"
- CTA : "Mettre à jour carte bancaire"

### 4. Annulation abonnement
- "Désolé de vous voir partir"
- Sondage : pourquoi avez-vous annulé ?

---

**Prêt à monétiser ! 💰**
