"use client"

import { useEffect, useState } from "react"
import { getSearchHistory, deleteSearchHistory, isSupabaseConfigured, type SearchHistoryEntry } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Loader2, HistoryIcon, AlertCircle } from "lucide-react"

interface HistoryViewProps {
  onSearch: (city: string, businessType: string, keywords: string | null) => void
}

export function HistoryView({ onSearch }: HistoryViewProps) {
  const { user } = useAuth()
  const [history, setHistory] = useState<SearchHistoryEntry[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured())
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const data = await getSearchHistory(user?.id || "local")
      setHistory(data)
    } catch (error) {
      console.error("[v0] Error loading history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return

    if (!confirm(`Supprimer ${selectedIds.length} recherche${selectedIds.length > 1 ? "s" : ""} ?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteSearchHistory(selectedIds)
      setHistory((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      setSelectedIds([])
    } catch (error) {
      console.error("[v0] Error deleting history:", error)
      alert("❌ Erreur lors de la suppression de l'historique")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = () => {
    if (selectedIds.length === 0) {
      alert("Veuillez sélectionner au moins un élément à exporter.")
      return
    }

    const selectedItems = history.filter((item) => selectedIds.includes(item.id))

    const headers = ["Date", "Ville", "Type de commerce", "Mots-clés", "Résultats"]
    const csvRows = [
      headers.join(";"),
      ...selectedItems.map((item) =>
        [
          new Date(item.created_at).toLocaleString("fr-FR"),
          `"${item.city}"`,
          `"${item.business_type || "Tous"}"`,
          `"${item.keywords || ""}"`,
          item.results_count.toString(),
        ].join(";"),
      ),
    ].join("\n")

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvRows], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `historique_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setSelectedIds([])
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectAll = () => {
    setSelectedIds(history.map((item) => item.id))
  }

  const deselectAll = () => {
    setSelectedIds([])
  }

  const handleRerun = (entry: SearchHistoryEntry) => {
    onSearch(entry.city, entry.business_type, entry.keywords)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!supabaseConfigured && (
        <div className="p-4 bg-secondary border border-border rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Supabase non configuré</p>
            <p className="text-xs text-muted-foreground mt-1">
              L'historique est stocké localement dans votre navigateur. Pour synchroniser entre appareils, configurez
              Supabase dans les variables d'environnement.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-6 bg-white dark:bg-card rounded-xl border border-border shadow-lg transition-all duration-300">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Historique des recherches</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedIds.length > 0
              ? `${selectedIds.length} sélectionné${selectedIds.length > 1 ? "s" : ""}`
              : `${history.length} recherche${history.length > 1 ? "s" : ""} enregistrée${history.length > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            <>
              <Button size="sm" variant="outline" onClick={deselectAll} className="bg-white dark:bg-card">
                Désélectionner
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-2 bg-white dark:bg-card text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={selectAll} className="bg-white dark:bg-card">
              Tout sélectionner
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {history.map((entry) => (
          <div
            key={entry.id}
            className={`p-6 rounded-xl border transition-all duration-200 ${
              selectedIds.includes(entry.id)
                ? "bg-secondary border-primary shadow-md"
                : "bg-white dark:bg-card border-border hover:border-primary hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedIds.includes(entry.id)}
                onChange={() => toggleSelection(entry.id)}
                className="mt-1 w-5 h-5 text-primary rounded border-border focus:ring-primary"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-semibold text-lg text-foreground">
                    {entry.business_type || "Tous les commerces"}
                  </span>
                  <span className="text-muted-foreground">à</span>
                  <span className="font-semibold text-lg text-primary">{entry.city}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  {entry.keywords && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Mots-clés:</span>{" "}
                      <span className="font-medium text-foreground">{entry.keywords}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Résultats:</span>{" "}
                    <span className="font-medium text-foreground">{entry.results_count}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRerun(entry)}
                    className="gap-2 bg-white dark:bg-card hover:bg-secondary"
                  >
                    <HistoryIcon className="w-3 h-3" />
                    Relancer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
