"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ScraperLayoutModernProps {
  navbar: ReactNode
  sidebar?: ReactNode
  mainContent: ReactNode
  resultsPanel?: ReactNode
  className?: string
}

export function ScraperLayoutModern({
  navbar,
  sidebar,
  mainContent,
  resultsPanel,
  className,
}: ScraperLayoutModernProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-secondary/20", className)}>
      {/* Navbar fixe en haut */}
      <div className="sticky top-0 z-50">{navbar}</div>

      {/* Container principal centré avec max-width */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar gauche - 3 colonnes sur desktop */}
          {sidebar && (
            <aside className="lg:col-span-3 space-y-6">
              <div className="sticky top-24 space-y-6">{sidebar}</div>
            </aside>
          )}

          {/* Zone principale - 6 colonnes sur desktop */}
          <main className={cn("space-y-6", sidebar && resultsPanel ? "lg:col-span-6" : "lg:col-span-9")}>
            {mainContent}
          </main>

          {/* Panel résultats droite - 3 colonnes sur desktop */}
          {resultsPanel && (
            <aside className="lg:col-span-3 space-y-6">
              <div className="sticky top-24 space-y-6">{resultsPanel}</div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

interface CardWithDepthProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  level?: 1 | 2 | 3 // Niveau de profondeur
}

export function CardWithDepth({ children, className, hoverable = false, level = 1 }: CardWithDepthProps) {
  const depthClasses = {
    1: "shadow-md hover:shadow-lg",
    2: "shadow-lg hover:shadow-xl",
    3: "shadow-xl hover:shadow-2xl",
  }

  return (
    <div
      className={cn(
        "relative bg-card rounded-2xl border border-border/50 transition-all duration-500",
        depthClasses[level],
        hoverable && "hover:-translate-y-1 cursor-pointer",
        className,
      )}
    >
      {/* Glow effect subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Contenu */}
      <div className="relative">{children}</div>
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
