"use client"
import {
  Phone,
  Globe,
  Mail,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Users,
  Zap,
  CreditCard,
  ParkingCircle,
  Accessibility,
} from "lucide-react"
import type { Business } from "@/components/scraper-interface"
import { useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"

interface ResultsListProps {
  results: Business[]
  onExportCSV?: () => void
  onExportSheets?: () => void
}

const ResultRow = memo(
  ({
    business,
    index,
    copiedCell,
    onCopy,
    onCopyRow,
  }: {
    business: Business
    index: number
    copiedCell: string | null
    onCopy: (text: string, cellId: string) => void
    onCopyRow: (business: Business) => void
  }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const hasEnrichedData = business.enriched && (business.description || business.category || business.tags?.length)

    return (
      <>
        <tr className="border-b border-border dark:border-gray-700/50 hover:bg-muted/30 dark:hover:bg-gray-700/30 transition-colors duration-150 group">
          {/* Index */}
          <td className="px-4 py-3 text-sm text-muted-foreground border-r border-border dark:border-gray-700/50 font-mono">
            <div className="flex items-center gap-2">
              <span>{index + 1}</span>
              <button
                onClick={() => onCopyRow(business)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded"
                title="Copier toute la ligne"
              >
                {copiedCell === `row-${business.id}` ? (
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </td>

          {/* Name */}
          <td className="px-4 py-3 text-sm text-foreground border-r border-border dark:border-gray-700/50 group">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{business.name}</span>
                {hasEnrichedData && (
                  <Sparkles className="w-3.5 h-3.5 text-black dark:text-gray-300" title="Enrichi par Grok AI" />
                )}
              </div>
              <button
                onClick={() => onCopy(business.name, `name-${business.id}`)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded"
                title="Copier"
              >
                {copiedCell === `name-${business.id}` ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </td>

          {/* Address */}
          <td className="px-4 py-3 text-sm text-foreground border-r border-border dark:border-gray-700/50 group">
            <div className="flex items-center justify-between gap-2">
              <span>{business.address}</span>
              <button
                onClick={() => onCopy(business.address, `address-${business.id}`)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded"
                title="Copier"
              >
                {copiedCell === `address-${business.id}` ? (
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </td>

          {/* Phone */}
          <td className="px-4 py-3 text-sm border-r border-border dark:border-gray-700/50 group">
            {business.phone !== "Non disponible" ? (
              <div className="flex items-center justify-between gap-2">
                <a
                  href={`tel:${business.phone}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {business.phone}
                </a>
                <button
                  onClick={() => onCopy(business.phone, `phone-${business.id}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded flex-shrink-0"
                  title="Copier"
                >
                  {copiedCell === `phone-${business.id}` ? (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            ) : (
              <span className="text-muted-foreground/60 italic text-xs">Non disponible</span>
            )}
          </td>

          {/* Email */}
          <td className="px-4 py-3 text-sm border-r border-border dark:border-gray-700/50 group">
            {business.email !== "Non disponible" ? (
              <div className="flex items-center justify-between gap-2">
                <a
                  href={`mailto:${business.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:underline flex items-center gap-2 truncate"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{business.email}</span>
                </a>
                <button
                  onClick={() => onCopy(business.email, `email-${business.id}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded flex-shrink-0"
                  title="Copier"
                >
                  {copiedCell === `email-${business.id}` ? (
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            ) : (
              <span className="text-muted-foreground/60 italic text-xs">Non disponible</span>
            )}
          </td>

          {/* Website */}
          <td className="px-4 py-3 text-sm border-r border-border dark:border-gray-700/50 group">
            {business.website !== "Non disponible" ? (
              <div className="flex items-center justify-between gap-2">
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:underline flex items-center gap-2 truncate"
                >
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{business.website.replace(/^https?:\/\//, "")}</span>
                </a>
                <button
                  onClick={() => onCopy(business.website, `website-${business.id}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded flex-shrink-0"
                  title="Copier"
                >
                  {copiedCell === `website-${business.id}` ? (
                    <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            ) : (
              <span className="text-muted-foreground/60 italic text-xs">Non disponible</span>
            )}
          </td>

          {/* Rating */}
          <td className="px-4 py-3 text-sm border-r border-border dark:border-gray-700/50">
            {business.rating ? (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-foreground">{business.rating.toFixed(1)}</span>
                {business.user_ratings_total && (
                  <span className="text-xs text-muted-foreground">({business.user_ratings_total})</span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground/60 italic text-xs">N/A</span>
            )}
          </td>

          {/* Coordinates */}
          <td className="px-4 py-3 text-sm font-mono text-muted-foreground border-r border-border dark:border-gray-700/50 group">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs">
                {business.lat.toFixed(6)}, {business.lon.toFixed(6)}
              </span>
              <button
                onClick={() =>
                  onCopy(`${business.lat.toFixed(6)}, ${business.lon.toFixed(6)}`, `coords-${business.id}`)
                }
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded"
                title="Copier"
              >
                {copiedCell === `coords-${business.id}` ? (
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </td>

          {/* Expand Button */}
          <td className="px-4 py-3 text-sm">
            {hasEnrichedData && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-accent dark:hover:bg-gray-600/50 rounded transition-colors duration-150"
                title={isExpanded ? "Masquer les détails" : "Voir les détails enrichis"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-black dark:text-gray-300" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-black dark:text-gray-300" />
                )}
              </button>
            )}
          </td>
        </tr>

        {isExpanded && hasEnrichedData && (
          <tr className="border-b border-border dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
            <td colSpan={9} className="px-4 py-4">
              <div className="space-y-4 max-w-5xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-black dark:text-gray-300" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Données enrichies par Grok AI
                  </span>
                </div>

                {business.description && (
                  <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Description</h4>
                    <p className="text-sm text-foreground leading-relaxed">{business.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {business.category && (
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Catégorie</h4>
                      <p className="text-sm text-foreground font-medium">{business.category}</p>
                    </div>
                  )}

                  {business.estimated_price_range && (
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Gamme de prix</h4>
                      <p className="text-sm text-foreground font-medium text-lg">{business.estimated_price_range}</p>
                    </div>
                  )}

                  {business.target_audience && (
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Public cible
                      </h4>
                      <p className="text-sm text-foreground font-medium">{business.target_audience}</p>
                    </div>
                  )}
                </div>

                {business.best_time_to_visit && (
                  <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Meilleur moment pour visiter
                    </h4>
                    <p className="text-sm text-foreground">{business.best_time_to_visit}</p>
                  </div>
                )}

                {business.unique_features && business.unique_features.length > 0 && (
                  <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Caractéristiques uniques
                    </h4>
                    <ul className="space-y-1">
                      {business.unique_features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-black dark:text-gray-300 mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.tags && business.tags.length > 0 && (
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {business.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 text-xs rounded-full border border-gray-300 dark:border-gray-600/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {business.specialties && business.specialties.length > 0 && (
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Spécialités</h4>
                      <ul className="space-y-1">
                        {business.specialties.map((specialty, idx) => (
                          <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-black dark:text-gray-300">•</span>
                            <span>{specialty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {business.practical_info && (
                  <div className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                      Informations pratiques
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {business.practical_info.parking && (
                        <div className="flex items-center gap-2">
                          <ParkingCircle className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Parking</p>
                            <p className="text-sm text-foreground font-medium">{business.practical_info.parking}</p>
                          </div>
                        </div>
                      )}
                      {business.practical_info.accessibility && (
                        <div className="flex items-center gap-2">
                          <Accessibility className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Accessibilité PMR</p>
                            <p className="text-sm text-foreground font-medium">
                              {business.practical_info.accessibility}
                            </p>
                          </div>
                        </div>
                      )}
                      {business.practical_info.payment_methods &&
                        business.practical_info.payment_methods.length > 0 && (
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Paiements</p>
                              <p className="text-sm text-foreground font-medium">
                                {business.practical_info.payment_methods.join(", ")}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </>
    )
  },
)

ResultRow.displayName = "ResultRow"

export function ResultsList({ results, onExportCSV, onExportSheets }: ResultsListProps) {
  const [copiedCell, setCopiedCell] = useState<string | null>(null)

  const copyToClipboard = useCallback((text: string, cellId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCell(cellId)
    setTimeout(() => setCopiedCell(null), 2000)
  }, [])

  const copyRowToClipboard = useCallback((business: Business) => {
    const rowData = [
      business.name,
      business.address,
      business.phone !== "Non disponible" ? business.phone : "",
      business.email !== "Non disponible" ? business.email : "",
      business.website !== "Non disponible" ? business.website : "",
      business.rating ? business.rating.toFixed(1) : "",
      business.user_ratings_total || "",
      `${business.lat.toFixed(6)}, ${business.lon.toFixed(6)}`,
    ].join("\t")

    navigator.clipboard.writeText(rowData)
    setCopiedCell(`row-${business.id}`)
    setTimeout(() => setCopiedCell(null), 2000)
  }, [])

  const copyAllData = useCallback(() => {
    const headers = ["Nom", "Adresse", "Téléphone", "Email", "Site Web", "Note", "Avis", "Coordonnées GPS"].join("\t")
    const rows = results.map((business) => {
      return [
        business.name,
        business.address,
        business.phone !== "Non disponible" ? business.phone : "",
        business.email !== "Non disponible" ? business.email : "",
        business.website !== "Non disponible" ? business.website : "",
        business.rating ? business.rating.toFixed(1) : "",
        business.user_ratings_total || "",
        `${business.lat.toFixed(6)}, ${business.lon.toFixed(6)}`,
      ].join("\t")
    })

    const allData = [headers, ...rows].join("\n")
    navigator.clipboard.writeText(allData)
    setCopiedCell("all-data")
    setTimeout(() => setCopiedCell(null), 2000)
  }, [results])

  const enrichedCount = results.filter((r) => r.enriched).length

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground text-sm">Aucun résultat</div>
          <div className="text-muted-foreground/70 text-xs">
            Sélectionnez une zone sur la carte ou recherchez par type et ville
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto overflow-x-auto">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 px-6 py-4 border-b border-blue-700 dark:border-blue-800/50 shadow-lg dark:shadow-blue-900/30 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {results.length} {results.length === 1 ? "résultat trouvé" : "résultats trouvés"}
              </h3>
              <div className="flex items-center gap-3">
                <p className="text-xs text-blue-100">Exportez vos données en un clic</p>
                {enrichedCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-black/20 dark:bg-gray-700/50 rounded-full border border-gray-300 dark:border-gray-600/50">
                    <Sparkles className="w-3 h-3 text-white dark:text-gray-200" />
                    <span className="text-xs text-white dark:text-gray-200 font-medium">
                      {enrichedCount} enrichi{enrichedCount > 1 ? "s" : ""} par Grok AI
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={copyAllData}
              size="lg"
              className="bg-white hover:bg-blue-50 dark:hover:bg-gray-100 text-blue-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-blue-200 dark:border-blue-300"
            >
              {copiedCell === "all-data" ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copier tout</span>
                </>
              )}
            </Button>
            <Button
              onClick={onExportSheets}
              size="lg"
              className="bg-white hover:bg-blue-50 dark:hover:bg-gray-100 text-blue-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-blue-200 dark:border-blue-300"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Google Sheets</span>
            </Button>
            <Button
              onClick={onExportCSV}
              size="lg"
              className="bg-white hover:bg-blue-50 dark:hover:bg-gray-100 text-blue-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-blue-200 dark:border-blue-300"
            >
              <Download className="w-5 h-5" />
              <span>CSV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <p className="text-sm text-muted-foreground mb-4">
          💡 <strong>Astuce :</strong> Survolez une ligne et cliquez sur <Copy className="w-3 h-3 inline" /> à gauche
          pour copier toute la ligne • Cliquez sur les icônes individuelles pour copier une cellule
          {enrichedCount > 0 && (
            <span className="ml-2 text-gray-900 dark:text-gray-200">
              • Cliquez sur <ChevronDown className="w-3 h-3 inline" /> pour voir les détails enrichis par Grok AI
            </span>
          )}
        </p>

        <div className="border border-border dark:border-gray-700/50 rounded-lg overflow-hidden bg-card dark:bg-gray-800/30 transition-colors duration-300">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 dark:bg-gray-800/80 border-b border-border dark:border-gray-700/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 w-20">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 min-w-[200px]">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 min-w-[250px]">
                  Adresse
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 min-w-[150px]">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 min-w-[180px]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 min-w-[200px]">
                  Site Web
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 min-w-[100px]">
                  Note
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700/50 min-w-[180px]">
                  Coordonnées GPS
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground w-12"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((business, index) => (
                <ResultRow
                  key={business.id}
                  business={business}
                  index={index}
                  copiedCell={copiedCell}
                  onCopy={copyToClipboard}
                  onCopyRow={copyRowToClipboard}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
