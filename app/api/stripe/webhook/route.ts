import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    console.error("[Stripe Webhook] Missing signature")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("[Stripe Webhook] Received event:", event.type, event.id)

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

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id
  if (!userId) {
    console.error("[Webhook] No user ID in session metadata")
    return
  }

  console.log("[Webhook] Processing checkout for user:", userId)

  // Get line items to determine what was purchased
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  const priceId = lineItems.data[0]?.price?.id

  if (!priceId) {
    console.error("[Webhook] No price ID found in line items")
    return
  }

  // Get product metadata
  const price = await stripe.prices.retrieve(priceId)
  const product = await stripe.products.retrieve(price.product as string)

  console.log("[Webhook] Product metadata:", product.metadata)

  if (product.metadata.product_type === "credits_pack") {
    // One-time credit pack purchase
    const creditsAmount = parseInt(product.metadata.credits_amount || "0")

    const { error } = await supabase!.rpc("add_credits", {
      p_user_id: userId,
      p_amount: creditsAmount,
      p_type: "purchase",
      p_details: {
        stripe_session_id: session.id,
        price_id: priceId,
        amount_paid: session.amount_total,
        currency: session.currency,
      },
    })

    if (error) {
      console.error("[Webhook] Error adding credits:", error)
    } else {
      console.log(`[Webhook] ✅ Added ${creditsAmount} credits to user ${userId}`)
    }
  } else if (session.mode === "subscription") {
    // Subscription - will be handled by subscription.created event
    console.log(`[Webhook] Subscription checkout completed for user ${userId}`)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log("[Webhook] Processing subscription change:", subscription.id)

  // Get user ID from customer
  const customerId = subscription.customer as string
  const { data: userCreditData } = await supabase!
    .from("user_credits")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!userCreditData) {
    console.error("[Webhook] No user found for customer:", customerId)
    return
  }

  const userId = userCreditData.user_id

  const priceId = subscription.items.data[0]?.price.id
  const price = await stripe.prices.retrieve(priceId)
  const product = await stripe.products.retrieve(price.product as string)

  const planType = product.metadata.plan_type || "free"
  const creditsAmount = parseInt(product.metadata.credits_amount || "500")
  const dailyLimit = parseInt(product.metadata.daily_limit || "50")

  console.log(`[Webhook] Updating user ${userId} to plan ${planType} with ${creditsAmount} credits`)

  // Update user plan and reset credits
  const { error } = await supabase!
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

  if (error) {
    console.error("[Webhook] Error updating user credits:", error)
  } else {
    console.log(`[Webhook] ✅ Updated user ${userId} to plan ${planType}`)
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log("[Webhook] Processing subscription cancellation:", subscription.id)

  // Downgrade to free plan
  const { error } = await supabase!
    .from("user_credits")
    .update({
      plan: "free",
      credits_total: 500,
      subscription_status: "cancelled",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)

  if (error) {
    console.error("[Webhook] Error cancelling subscription:", error)
  } else {
    console.log(`[Webhook] ✅ Subscription cancelled: ${subscription.id}`)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("[Webhook] Payment succeeded for invoice:", invoice.id)

  // Subscription renewal - reset monthly credits
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await handleSubscriptionChange(subscription)
    console.log(`[Webhook] ✅ Monthly credits reset for subscription ${subscription.id}`)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Webhook] Payment failed for invoice:", invoice.id)

  // Mark subscription as past_due
  const { error } = await supabase!
    .from("user_credits")
    .update({
      subscription_status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription as string)

  if (error) {
    console.error("[Webhook] Error marking past_due:", error)
  } else {
    console.log(`[Webhook] ⚠️ Payment failed for subscription: ${invoice.subscription}`)
  }
}
