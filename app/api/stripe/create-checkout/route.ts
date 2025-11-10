import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function POST(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { priceId, mode } = await req.json() // mode: 'subscription' | 'payment'

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 })
    }

    // Get authenticated user
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("sb-access-token")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(sessionCookie.value)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Invalid session" }, { status: 401 })
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
      console.log("[Stripe Checkout] Using existing customer:", customerId)
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      console.log("[Stripe Checkout] Created new customer:", customerId)

      // Save customer ID to Supabase
      await supabase.from("user_credits").update({ stripe_customer_id: customerId }).eq("user_id", user.id)
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
      allow_promotion_codes: true, // Allow promo codes
      billing_address_collection: "auto",
    })

    console.log("[Stripe Checkout] Session created:", session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error("[Stripe Checkout] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
