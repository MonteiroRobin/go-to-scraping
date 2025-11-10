"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, XCircle, X, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"

export interface ScrapingJob {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  searchParams: {
    city: string
    businessType: string
    keywords?: string
  }
  progress: {
    current: number
    total: number
  }
  newBusinessesCount?: number
  cachedBusinessesCount?: number
  errorMessage?: string
  createdAt: string
}

interface ScrapingJobStatusProps {
  jobId: string
  onComplete?: (results: any) => void
  onError?: (error: string) => void
  onClose?: () => void
}

export function ScrapingJobStatus({ jobId, onComplete, onError, onClose }: ScrapingJobStatusProps) {
  const [job, setJob] = useState<ScrapingJob | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    // Polling job status every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/scraping/job-status?jobId=${jobId}`)
        const data = await response.json()
        setJob(data)

        if (data.status === "completed") {
          clearInterval(interval)
          onComplete?.(data.results)
        } else if (data.status === "failed") {
          clearInterval(interval)
          onError?.(data.errorMessage)
        }
      } catch (error) {
        console.error("Error fetching job status:", error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, onComplete, onError])

  if (!job) return null

  const progressPercent = job.progress.total > 0 ? (job.progress.current / job.progress.total) * 100 : 0

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 bg-card border-2 border-border rounded-xl shadow-2xl transition-all duration-300 z-50 ${
        isExpanded ? "max-h-96" : "max-h-16"
      } overflow-hidden`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {job.status === "pending" && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
          {job.status === "processing" && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
          {job.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {job.status === "failed" && <XCircle className="w-5 h-5 text-red-500" />}

          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {job.status === "pending" && "En attente..."}
              {job.status === "processing" && "Scraping en cours"}
              {job.status === "completed" && "Scraping terminé"}
              {job.status === "failed" && "Erreur de scraping"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {job.searchParams.businessType} à {job.searchParams.city}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className="p-1 hover:bg-secondary rounded transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {/* Progress Bar */}
          {(job.status === "processing" || job.status === "pending") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Progression: {job.progress.current}/{job.progress.total}
                </span>
                <span className="font-semibold text-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          {/* Completed Info */}
          {job.status === "completed" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {(job.newBusinessesCount || 0) + (job.cachedBusinessesCount || 0)} établissements trouvés
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {job.cachedBusinessesCount ? `${job.cachedBusinessesCount} depuis cache` : ""}
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>

              {job.newBusinessesCount && job.newBusinessesCount > 0 && (
                <div className="text-xs text-muted-foreground bg-primary/10 p-2 rounded">
                  ⚡ {job.newBusinessesCount} nouveaux établissements ajoutés à la base globale
                </div>
              )}

              <Button onClick={() => onClose?.()} className="w-full" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir les résultats
              </Button>
            </div>
          )}

          {/* Error Info */}
          {job.status === "failed" && (
            <div className="space-y-2">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-sm font-semibold text-foreground mb-1">Erreur lors du scraping</div>
                <div className="text-xs text-muted-foreground">{job.errorMessage}</div>
              </div>
              <Button onClick={() => onClose?.()} variant="outline" className="w-full" size="sm">
                Fermer
              </Button>
            </div>
          )}

          {/* Pending Info */}
          {job.status === "pending" && (
            <div className="text-xs text-muted-foreground bg-primary/10 p-3 rounded-lg">
              ⏳ Votre recherche est en file d'attente. Vous pouvez continuer à utiliser l'application en attendant.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Multi-Job Manager Component
interface MultiJobManagerProps {
  jobs: ScrapingJob[]
  onJobComplete?: (jobId: string, results: any) => void
  onJobRemove?: (jobId: string) => void
}

export function MultiJobManager({ jobs, onJobComplete, onJobRemove }: MultiJobManagerProps) {
  if (jobs.length === 0) return null

  const activeJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing")
  const completedJobs = jobs.filter((j) => j.status === "completed" || j.status === "failed")

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {/* Active Jobs */}
      {activeJobs.map((job) => (
        <ScrapingJobStatus
          key={job.id}
          jobId={job.id}
          onComplete={(results) => onJobComplete?.(job.id, results)}
          onClose={() => onJobRemove?.(job.id)}
        />
      ))}

      {/* Completed Jobs Summary */}
      {completedJobs.length > 0 && (
        <div className="bg-card border-2 border-border rounded-xl p-3 shadow-xl w-96">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              {completedJobs.length} scraping{completedJobs.length > 1 ? "s" : ""} terminé
              {completedJobs.length > 1 ? "s" : ""}
            </span>
            <button onClick={() => completedJobs.forEach((j) => onJobRemove?.(j.id))} className="text-xs text-primary">
              Tout effacer
            </button>
          </div>
          <div className="space-y-1">
            {completedJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between text-xs p-2 bg-secondary rounded hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {job.status === "completed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className="text-foreground truncate">
                    {job.searchParams.businessType} à {job.searchParams.city}
                  </span>
                </div>
                <button
                  onClick={() => onJobRemove?.(job.id)}
                  className="p-1 hover:bg-card rounded transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
