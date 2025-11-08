"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function DatabaseTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    connection: boolean | null
    tables: { [key: string]: boolean | null }
    error: string | null
  }>({
    connection: null,
    tables: {
      search_history: null,
      search_results: null,
      scraped_businesses: null,
    },
    error: null,
  })

  const testDatabase = async () => {
    setTesting(true)
    const supabase = getSupabaseBrowserClient()
    const newResults = {
      connection: false,
      tables: {
        search_history: false,
        search_results: false,
        scraped_businesses: false,
      },
      error: null as string | null,
    }

    try {
      console.log("[v0] Testing Supabase connection...")

      // Test connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from("search_history")
        .select("count")
        .limit(1)

      if (connectionError) {
        console.log("[v0] Connection error:", connectionError)
        newResults.error = connectionError.message
        newResults.connection = false
      } else {
        console.log("[v0] Connection successful")
        newResults.connection = true
      }

      // Test each table
      const tables = ["search_history", "search_results", "scraped_businesses"]

      for (const table of tables) {
        console.log(`[v0] Testing table: ${table}`)
        const { error } = await supabase.from(table).select("*").limit(1)

        if (error) {
          console.log(`[v0] Table ${table} error:`, error.message)
          newResults.tables[table] = false
          if (!newResults.error) {
            newResults.error = `Table ${table}: ${error.message}`
          }
        } else {
          console.log(`[v0] Table ${table} exists and is accessible`)
          newResults.tables[table] = true
        }
      }
    } catch (error) {
      console.log("[v0] Test error:", error)
      newResults.error = error instanceof Error ? error.message : "Unknown error"
    }

    setResults(newResults)
    setTesting(false)
  }

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return null
    if (status) return <CheckCircle2 className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Test de la base de données Supabase</h3>
        <Button onClick={testDatabase} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Test en cours...
            </>
          ) : (
            "Tester la connexion"
          )}
        </Button>
      </div>

      {results.connection !== null && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StatusIcon status={results.connection} />
            <span className="font-medium">Connexion Supabase</span>
          </div>

          <div className="pl-7 space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon status={results.tables.search_history} />
              <span className="text-sm">Table: search_history</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={results.tables.search_results} />
              <span className="text-sm">Table: search_results</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={results.tables.scraped_businesses} />
              <span className="text-sm">Table: scraped_businesses</span>
            </div>
          </div>

          {results.error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500 font-medium">Erreur détectée:</p>
              <p className="text-sm text-red-400 mt-1">{results.error}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Assurez-vous d'avoir exécuté le script SQL setup_complete_database.sql dans votre Supabase SQL Editor.
              </p>
            </div>
          )}

          {results.connection && Object.values(results.tables).every((status) => status === true) && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-500 font-medium">✓ Toutes les tables sont configurées correctement !</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
