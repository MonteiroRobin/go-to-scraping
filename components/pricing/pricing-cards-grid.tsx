"use client"

import { useState } from "react"
import { PricingCard } from "./pricing-card"
import { PRICING_PLANS } from "@/lib/pricing-data"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function PricingCardsGrid() {
  const router = useRouter()
  const { user } = useAuth()
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string, priceId: string | null) => {
    if (planId === "free") {
      // Redirect to signup or login
      if (!user) {
        router.push("/login?plan=free")
      } else {
        router.push("/scraper")
      }
      return
    }

    if (planId === "enterprise") {
      // Open mailto for enterprise
      window.location.href = "mailto:contact@gotoscraping.com?subject=Enterprise Plan Inquiry"
      return
    }

    if (!user) {
      // Redirect to login with plan in query
      router.push(`/login?plan=${planId}`)
      return
    }

    if (!priceId) {
      console.error("No priceId for plan:", planId)
      return
    }

    // Create Stripe checkout session
    setLoadingPlanId(planId)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          mode: "subscription",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      }
    } catch (error) {
      console.error("Error creating checkout:", error)
      alert("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoadingPlanId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 lg:gap-6 max-w-7xl mx-auto px-4">
      {PRICING_PLANS.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          onSelectPlan={handleSelectPlan}
          isLoading={loadingPlanId === plan.id}
        />
      ))}
    </div>
  )
}
