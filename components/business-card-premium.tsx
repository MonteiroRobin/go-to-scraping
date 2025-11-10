"use client"

import { useState } from "react"
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Star,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"
import type { Business } from "@/components/scraper-interface"

interface BusinessCardPremiumProps {
  business: Business
  index: number
  onSelect?: (business: Business) => void
  isSelected?: boolean
}

export function BusinessCardPremium({ business, index, onSelect, isSelected }: BusinessCardPremiumProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <BlurFade delay={0.05 * index} inView>
      <div
        className={cn(
          "group relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer",
          "bg-card/40 backdrop-blur-sm hover:bg-card/80",
          "border-border/50 hover:border-primary/50",
          "hover:shadow-xl hover:-translate-y-1",
          "shadow-md",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        onClick={() => onSelect?.(business)}
      >
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Content */}
        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                {business.name}
              </h3>

              {/* Rating & Category */}
              <div className="flex items-center gap-2 flex-wrap">
                {business.rating && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                    <span className="text-sm font-bold text-foreground">{business.rating.toFixed(1)}</span>
                    {business.user_ratings_total && (
                      <span className="text-xs text-muted-foreground">({business.user_ratings_total})</span>
                    )}
                  </div>
                )}

                {business.category && (
                  <Badge variant="secondary" className="text-xs">
                    {business.category}
                  </Badge>
                )}

                {business.enriched && (
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/30 bg-primary/5 text-primary flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Enrichi
                  </Badge>
                )}
              </div>
            </div>

            {/* Index Badge */}
            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
              #{index + 1}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
            <span className="line-clamp-2">{business.address}</span>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            {business.phone && business.phone !== "Non disponible" && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">{business.phone}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(business.phone, "phone")
                  }}
                >
                  {copied === "phone" ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            )}

            {business.email && business.email !== "Non disponible" && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">{business.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(business.email, "email")
                  }}
                >
                  {copied === "email" ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            )}

            {business.website && business.website !== "Non disponible" && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">{business.website}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(business.website, "_blank")
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
              <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>
            </div>
          )}

          {/* Price & Status */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-2">
              {business.estimated_price_range && (
                <Badge variant="outline" className="text-xs">
                  {business.estimated_price_range}
                </Badge>
              )}
              {business.business_status === "OPERATIONAL" && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Ouvert</span>
                </div>
              )}
            </div>

            {/* Action Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect?.(business)
                }}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Détails
              </Button>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  )
}
