"use client"

import { useState, useCallback } from "react"
import { Business } from "./scraper-interface"
import { Star, Phone, Globe, Mail, MapPin, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"

interface ResultsGridProps {
  results: Business[]
  onEnrichAll?: () => void
  onEnrichSingle?: (businessId: string) => void
  isEnriching?: boolean
}

export function ResultsGrid({ results, onEnrichAll, onEnrichSingle, isEnriching }: ResultsGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {results.map((business) => (
        <div
          key={business.id}
          className="group bg-card rounded border-2 border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl flex flex-col"
        >
          {/* Image Header */}
          <div className="relative h-40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
            {business.photos && business.photos[0] ? (
              <img
                src={business.photos[0]}
                alt={business.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-primary/30" />
              </div>
            )}
            {business.rating && (
              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
                <span className="text-sm font-semibold text-foreground">{business.rating.toFixed(1)}/5</span>
                {business.user_ratings_total && (
                  <span className="text-xs text-muted-foreground">({business.user_ratings_total})</span>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            {/* Title */}
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {business.name}
            </h3>

            {/* Address */}
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{business.address}</span>
            </p>

            {/* Category/Type */}
            {(business.category || business.types?.[0]) && (
              <div className="mb-3">
                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                  {business.category || business.types?.[0]}
                </span>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-2 mt-auto">
              {/* Phone */}
              {business.phone && business.phone !== "Non disponible" && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${business.phone}`}
                    className="text-xs text-foreground hover:text-primary transition-colors flex-1 truncate"
                  >
                    {business.phone}
                  </a>
                  <button
                    onClick={() => copyToClipboard(business.phone, `phone-${business.id}`)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    {copiedId === `phone-${business.id}` ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}

              {/* Website */}
              {business.website && business.website !== "Non disponible" && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-foreground hover:text-primary transition-colors flex-1 truncate"
                  >
                    {business.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
              )}

              {/* Email */}
              {business.email && business.email !== "Non disponible" && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <a
                    href={`mailto:${business.email}`}
                    className="text-xs text-foreground hover:text-primary transition-colors flex-1 truncate"
                  >
                    {business.email}
                  </a>
                  <button
                    onClick={() => copyToClipboard(business.email, `email-${business.id}`)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    {copiedId === `email-${business.id}` ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Price Level */}
            {business.price_level && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Prix: {"€".repeat(business.price_level)}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
