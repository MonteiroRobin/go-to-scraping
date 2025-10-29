"use client"
import { Phone, Globe, Copy, Check, Download, FileSpreadsheet } from "lucide-react"
import type { Business } from "@/components/scraper-interface"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ResultsListProps {
  results: Business[]
  onExportCSV?: () => void
  onExportSheets?: () => void
}

export function ResultsList({ results, onExportCSV, onExportSheets }: ResultsListProps) {
  const [copiedCell, setCopiedCell] = useState<string | null>(null)

  const displayResults = results.slice(0, 10)
  const hasMoreResults = results.length > 10

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

  const copyToClipboard = (text: string, cellId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCell(cellId)
    setTimeout(() => setCopiedCell(null), 2000)
  }

  return (
    <div className="max-w-full mx-auto overflow-x-auto">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 px-6 py-4 border-b border-blue-700 dark:border-blue-800 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                {displayResults.length} {displayResults.length === 1 ? "résultat affiché" : "résultats affichés"}
                {hasMoreResults && ` sur ${results.length} trouvés`}
              </h3>
              <p className="text-xs text-blue-100">
                {hasMoreResults ? "Version bêta : 10 premiers résultats uniquement" : "Exportez vos données en un clic"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onExportSheets}
              size="lg"
              className="bg-white hover:bg-blue-50 text-blue-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all border-2 border-blue-200"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Copier pour Google Sheets</span>
            </Button>
            <Button
              onClick={onExportCSV}
              size="lg"
              className="bg-white hover:bg-blue-50 text-blue-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all border-2 border-blue-200"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger CSV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {hasMoreResults && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
              ℹ️ Version bêta : Seuls les 10 premiers résultats sont affichés pour économiser les crédits API gratuits.
              {results.length - 10} résultats supplémentaires ont été trouvés mais ne sont pas affichés.
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          💡 Astuce : Survolez une cellule et cliquez sur l'icône de copie pour copier individuellement
        </p>

        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 dark:bg-gray-800/80 border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700 w-12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700 min-w-[200px]">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700 min-w-[250px]">
                  Adresse
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700 min-w-[150px]">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border dark:border-gray-700 min-w-[200px]">
                  Site Web
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground min-w-[180px]">
                  Coordonnées GPS
                </th>
              </tr>
            </thead>
            <tbody>
              {displayResults.map((business, index) => (
                <tr
                  key={business.id}
                  className="border-b border-border dark:border-gray-700 hover:bg-muted/30 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Index */}
                  <td className="px-4 py-3 text-sm text-muted-foreground border-r border-border dark:border-gray-700 font-mono">
                    {index + 1}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 text-sm text-foreground border-r border-border dark:border-gray-700 group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{business.name}</span>
                      <button
                        onClick={() => copyToClipboard(business.name, `name-${business.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent dark:hover:bg-gray-600 rounded"
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
                  <td className="px-4 py-3 text-sm text-foreground border-r border-border dark:border-gray-700 group">
                    <div className="flex items-center justify-between gap-2">
                      <span>{business.address}</span>
                      <button
                        onClick={() => copyToClipboard(business.address, `address-${business.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent dark:hover:bg-gray-600 rounded"
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
                  <td className="px-4 py-3 text-sm border-r border-border dark:border-gray-700 group">
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
                          onClick={() => copyToClipboard(business.phone, `phone-${business.id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent dark:hover:bg-gray-600 rounded"
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

                  {/* Website */}
                  <td className="px-4 py-3 text-sm border-r border-border dark:border-gray-700 group">
                    {business.website !== "Non disponible" ? (
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover:underline flex items-center gap-2 truncate"
                        >
                          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{business.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                        <button
                          onClick={() => copyToClipboard(business.website, `website-${business.id}`)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent dark:hover:bg-gray-600 rounded flex-shrink-0"
                          title="Copier"
                        >
                          {copiedCell === `website-${business.id}` ? (
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

                  {/* Coordinates */}
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs">
                        {business.lat.toFixed(6)}, {business.lon.toFixed(6)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${business.lat.toFixed(6)}, ${business.lon.toFixed(6)}`,
                            `coords-${business.id}`,
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent dark:hover:bg-gray-600 rounded"
                        title="Copier"
                      >
                        {copiedCell === `coords-${business.id}` ? (
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
