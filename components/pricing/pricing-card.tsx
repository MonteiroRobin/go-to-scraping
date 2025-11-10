"use client"

import { Check, Sparkles, Crown, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PricingPlan } from "@/lib/pricing-data"

interface PricingCardProps {
  plan: PricingPlan
  onSelectPlan: (planId: string, priceId: string | null) => void
  isLoading?: boolean
}

export function PricingCard({ plan, onSelectPlan, isLoading = false }: PricingCardProps) {
  const getBadgeVariant = () => {
    if (plan.popular) return "default"
    if (plan.bestValue) return "secondary"
    return "outline"
  }

  const getBadgeIcon = () => {
    if (plan.popular) return <Sparkles className="w-3 h-3 mr-1" />
    if (plan.bestValue) return <TrendingUp className="w-3 h-3 mr-1" />
    if (plan.isCustom) return <Crown className="w-3 h-3 mr-1" />
    return null
  }

  return (
    <div
      className={cn(
        "relative flex flex-col h-full rounded-2xl border-2 transition-all duration-300",
        plan.highlighted
          ? "border-foreground/20 shadow-2xl shadow-foreground/10 scale-105 bg-gradient-to-b from-foreground/5 to-background"
          : "border-border hover:border-foreground/20 hover:shadow-xl bg-card",
        "hover:-translate-y-1"
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge variant={getBadgeVariant()} className="px-4 py-1 font-semibold shadow-lg">
            {getBadgeIcon()}
            {plan.badge}
          </Badge>
        </div>
      )}

      <div className="p-8 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.tagline}</p>
        </div>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-baseline gap-1">
            {!plan.isCustom ? (
              <>
                <span className="text-5xl font-bold text-foreground">{plan.price}€</span>
                <span className="text-muted-foreground">/mois</span>
              </>
            ) : (
              <span className="text-4xl font-bold text-foreground">Sur devis</span>
            )}
          </div>
          {!plan.isCustom && (
            <div className="mt-2 text-sm text-muted-foreground">
              {plan.credits.toLocaleString()} crédits • ~
              {Math.floor(plan.credits / 30)} scrapings
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 rounded-full p-0.5",
                  feature.included ? "bg-foreground/10" : "bg-muted"
                )}
              >
                <Check
                  className={cn(
                    "w-4 h-4",
                    feature.included ? "text-foreground" : "text-muted-foreground/30"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-sm flex-1",
                  feature.included ? "text-foreground" : "text-muted-foreground line-through"
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          onClick={() => onSelectPlan(plan.id, plan.priceId)}
          disabled={isLoading}
          className={cn(
            "w-full h-12 font-semibold transition-all duration-300",
            plan.highlighted
              ? "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
              : "bg-secondary hover:bg-secondary/80"
          )}
          size="lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Chargement...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {plan.cta}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        {plan.id === "free" && (
          <p className="text-xs text-center text-muted-foreground mt-3">Aucune carte bancaire requise</p>
        )}
      </div>

      {/* Highlight glow effect */}
      {plan.highlighted && (
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-xl" />
      )}
    </div>
  )
}
