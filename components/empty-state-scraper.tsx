"use client"

import { Search, Map, Sparkles, TrendingUp } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { ShimmerText } from "@/components/ui/shimmer-text"

interface EmptyStateScraperProps {
  title?: string
  description?: string
}

export function EmptyStateScraper({
  title = "Prêt à pêcher vos leads ?",
  description = "Sélectionnez une zone sur la carte ou utilisez la recherche pour commencer",
}: EmptyStateScraperProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <BlurFade delay={0.1} inView>
        <div className="text-center space-y-6 max-w-md mx-auto">
          {/* Animated Icon Group */}
          <div className="relative w-32 h-32 mx-auto">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-2xl animate-pulse" />

            {/* Icons */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-bounce">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute bottom-0 left-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-bounce [animation-delay:0.2s]">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center animate-bounce [animation-delay:0.4s]">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              <ShimmerText>{title}</ShimmerText>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </div>

          {/* Quick Tips */}
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm hover:bg-card/70 transition-colors duration-300">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Recherche par ville</p>
                <p className="text-xs text-muted-foreground">Ex: "Cafés Paris" ou "Restaurants Lyon"</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm hover:bg-card/70 transition-colors duration-300">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Sélection par zone</p>
                <p className="text-xs text-muted-foreground">Dessinez un rectangle sur la carte</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left p-3 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm hover:bg-card/70 transition-colors duration-300">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Export instantané</p>
                <p className="text-xs text-muted-foreground">CSV ou Google Sheets en un clic</p>
              </div>
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  )
}
