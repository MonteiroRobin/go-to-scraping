"use client"

import { useEffect, useState } from "react"
import { RevealOnScroll } from "./RevealOnScroll"

export function SpreadsheetPreview() {
  const [visibleRows, setVisibleRows] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleRows((prev) => (prev < 12 ? prev + 1 : prev))
    }, 150)

    return () => clearInterval(interval)
  }, [])

  const headers = ["Nom", "Adresse", "Téléphone", "Note", "Type", "Website"]

  const rows = [
    ["Café de la Paix", "12 Boulevard des Capucines, Paris", "+33 1 40 07 36 36", "4.5", "Restaurant", "cafepaix.fr"],
    ["Le Bouquet", "45 Rue de Rivoli, Paris", "+33 1 42 60 21 79", "4.2", "Café", "lebouquet.com"],
    ["La Brasserie", "23 Avenue des Champs-Élysées", "+33 1 53 23 75 75", "4.7", "Restaurant", "labrasserie.fr"],
    ["Pizza Roma", "89 Rue Saint-Antoine, Paris", "+33 1 48 87 63 60", "4.3", "Pizzeria", "pizzaroma.fr"],
    ["Sushi Bar", "34 Rue du Temple, Paris", "+33 1 42 77 90 90", "4.6", "Restaurant", "sushibar.fr"],
    ["Le Comptoir", "67 Rue de Turenne, Paris", "+33 1 42 72 25 76", "4.4", "Bar", "lecomptoir.fr"],
    ["Burger House", "91 Boulevard Beaumarchais", "+33 1 43 55 87 00", "4.1", "Fast Food", "burgerhouse.com"],
    ["Thai Garden", "56 Rue de Bretagne, Paris", "+33 1 42 72 13 77", "4.5", "Restaurant", "thaigarden.fr"],
    ["Le Zinc", "28 Rue Vieille du Temple", "+33 1 48 87 50 50", "4.2", "Café", "lezinc.fr"],
    ["Pasta Bella", "73 Rue des Archives, Paris", "+33 1 42 78 91 44", "4.6", "Italien", "pastabella.fr"],
    ["Le Marais Café", "15 Rue des Rosiers, Paris", "+33 1 42 77 05 04", "4.3", "Café", "maraiscafe.fr"],
    ["Chez Michel", "82 Rue Saint-Martin, Paris", "+33 1 42 71 20 38", "4.8", "Restaurant", "chezmichel.fr"],
  ]

  return (
    <RevealOnScroll>
      <div className="w-full max-w-6xl mx-auto py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Export instantané vers Excel ou Google Sheets</h2>
          <p className="text-xl text-muted-foreground">
            Toutes les données structurées et prêtes à l'emploi
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border-2 border-border shadow-2xl bg-white">
          {/* Excel-style toolbar */}
          <div className="bg-[#2b579a] text-white px-4 py-2 flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z"/>
                </svg>
              </div>
              <span>commerces-paris-scraping.xlsx</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs opacity-80">{visibleRows} lignes extraites</span>
            </div>
          </div>

          {/* Spreadsheet grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="w-12 px-4 py-3 text-center font-semibold text-gray-600 border-r border-gray-300">
                    #
                  </th>
                  {headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left font-semibold text-gray-700 border-r border-gray-300 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, visibleRows).map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-200 hover:bg-blue-50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
                    style={{ animationDelay: `${rowIndex * 50}ms` }}
                  >
                    <td className="px-4 py-3 text-center text-gray-500 border-r border-gray-200 font-medium">
                      {rowIndex + 1}
                    </td>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-3 border-r border-gray-200 ${
                          cellIndex === 3 ? "font-semibold text-green-600" : "text-gray-800"
                        } ${cellIndex === 5 ? "text-blue-600 underline" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Google Sheets badge */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="#0F9D58"/>
                <path d="M7 7h10v3H7V7zm0 4h10v3H7v-3zm0 4h7v3H7v-3z" fill="white"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Export Google Sheets</span>
            </div>
            <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="#217346"/>
                <path d="M8 8l8 8m0-8l-8 8" stroke="white" strokeWidth="2"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Export Excel</span>
            </div>
          </div>
        </div>

        {/* Stats below */}
        <div className="grid grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/10">
            <div className="text-3xl font-bold text-primary mb-2">12</div>
            <div className="text-sm text-muted-foreground">Résultats trouvés</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/10">
            <div className="text-3xl font-bold text-primary mb-2">2.3s</div>
            <div className="text-sm text-muted-foreground">Temps d'extraction</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/10">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Données complètes</div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  )
}
