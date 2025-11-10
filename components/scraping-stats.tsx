"use client"

import { TrendingUp, Package, AlertCircle, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { NumberTicker } from "@/components/ui/number-ticker"
import { BlurFade } from "@/components/ui/blur-fade"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ScrapingStatsProps {
  total: number
  newCount: number
  duplicateCount: number
  isLoading: boolean
  isEnriching: boolean
  progress: { current: number; total: number }
  enrichmentProgress: { current: number; total: number }
  className?: string
}

export function ScrapingStats({
  total,
  newCount,
  duplicateCount,
  isLoading,
  isEnriching,
  progress,
  enrichmentProgress,
  className,
}: ScrapingStatsProps) {
  if (total === 0 && !isLoading && !isEnriching) return null

  return (
    <BlurFade delay={0.2} inView>
      <div className={cn("space-y-4", className)}>
        {/* Main Stats Card */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

          <div className="relative p-6 bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-wrap items-center gap-6">
              {/* Total Results */}
              {total > 0 && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground tabular-nums">
                      <NumberTicker value={total} />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {total === 1 ? "commerce trouvé" : "commerces trouvés"}
                    </div>
                  </div>
                </div>
              )}

              {/* New & Duplicate Counts */}
              {(newCount > 0 || duplicateCount > 0) && (
                <div className="flex gap-4 flex-wrap">
                  {newCount > 0 && (
                    <div className="px-4 py-3 bg-primary/5 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">Nouveaux</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground tabular-nums">
                        <NumberTicker value={newCount} />
                      </div>
                    </div>
                  )}
                  {duplicateCount > 0 && (
                    <div className="px-4 py-3 bg-secondary rounded-xl border border-border hover:bg-secondary/80 transition-colors duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium uppercase">Doublons</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground tabular-nums">
                        <NumberTicker value={duplicateCount} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enrichment Progress */}
              {isEnriching && enrichmentProgress.total > 0 && (
                <div className="flex-1 min-w-[250px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        Enrichissement Grok
                      </span>
                      <span className="text-muted-foreground font-semibold tabular-nums">
                        {enrichmentProgress.current}/{enrichmentProgress.total}
                      </span>
                    </div>
                    <Progress
                      value={(enrichmentProgress.current / enrichmentProgress.total) * 100}
                      className="h-2.5 bg-secondary"
                    />
                    <div className="text-xs text-right text-muted-foreground tabular-nums">
                      {Math.round((enrichmentProgress.current / enrichmentProgress.total) * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Scraping Progress */}
              {isLoading && progress.total > 0 && !isEnriching && (
                <div className="flex-1 min-w-[250px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Scraping en cours
                      </span>
                      <span className="text-muted-foreground font-semibold tabular-nums">
                        {progress.current}/{progress.total}
                      </span>
                    </div>
                    <Progress
                      value={(progress.current / progress.total) * 100}
                      className="h-2.5 bg-secondary"
                    />
                    <div className="text-xs text-right text-muted-foreground tabular-nums">
                      {Math.round((progress.current / progress.total) * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Duplicate Alert */}
        {duplicateCount > 0 && (
          <BlurFade delay={0.3} inView>
            <Alert className="border-border/50 bg-secondary/50 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-sm text-foreground">
                {duplicateCount} {duplicateCount === 1 ? "établissement a" : "établissements ont"} déjà été scrapé
                {duplicateCount > 1 ? "s" : ""} précédemment. Les données ont été mises à jour.
              </AlertDescription>
            </Alert>
          </BlurFade>
        )}
      </div>
    </BlurFade>
  )
}
