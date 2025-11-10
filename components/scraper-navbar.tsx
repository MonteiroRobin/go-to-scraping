"use client"

import { MapPin, LogOut, Sparkles, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { NumberTicker } from "@/components/ui/number-ticker"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface ScraperNavbarProps {
  credits: number
  className?: string
}

export function ScraperNavbar({ credits, className }: ScraperNavbarProps) {
  const { user, logout } = useAuth()

  return (
    <nav
      className={cn(
        "border-b border-border/50 backdrop-blur-xl bg-white/80 dark:bg-background/80 sticky top-0 z-50",
        "shadow-sm transition-all duration-300",
        className,
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
              <MapPin className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold">
                <ShimmerText>Go To Scraping</ShimmerText>
              </span>
              <p className="text-xs text-muted-foreground">Professional Edition</p>
            </div>
          </div>

          {/* Center - Credits Display */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">Crédits</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    <NumberTicker value={credits} />
                  </span>
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">{user?.name || "User"}</span>
            </div>

            <ThemeToggle />

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Animated Border Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-gradient" />
    </nav>
  )
}
