"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Copy, Check, Github, Database, Key, Cloud } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SetupGuide() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const envTemplate = `# Voir le fichier README.md pour la liste complète des variables d'environnement

# Google Maps & Places API (3 clés nécessaires)
# - Une clé publique pour l'affichage de la carte
# - Une clé serveur pour les opérations backend
# - Une clé pour l'API Places

# Supabase (2 clés nécessaires)
# - URL du projet Supabase
# - Clé anonyme (anon key)

# Grok AI (optionnel)
# - Clé API xAI pour l'enrichissement des données`

  return (
    <div className="border-t border-border/40 dark:border-border/20 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950/10 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="w-full justify-between text-lg font-semibold py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
        >
          <span className="flex items-center gap-3">
            <Github className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Guide complet d'installation et de déploiement
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Introduction */}
            <Alert className="border-blue-300 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20">
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong>Bienvenue !</strong> Ce guide vous explique comment dupliquer et déployer cette application sur
                votre propre infrastructure. Consultez le fichier README.md pour les détails complets.
              </AlertDescription>
            </Alert>

            {/* Step 1: Clone from GitHub */}
            <Card className="p-6 bg-white dark:bg-gray-800/50 border-border/40 dark:border-border/20 shadow-lg dark:shadow-gray-950/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">1. Cloner le projet depuis GitHub</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez par cloner le repository sur votre machine locale :
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                      <code className="text-gray-800 dark:text-gray-200">
                        git clone https://github.com/votre-username/local-business-scraper.git{"\n"}
                        cd local-business-scraper{"\n"}
                        npm install
                      </code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyToClipboard(
                          "git clone https://github.com/votre-username/local-business-scraper.git\ncd local-business-scraper\nnpm install",
                          "clone",
                        )
                      }
                    >
                      {copiedSection === "clone" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 2: Environment Variables */}
            <Card className="p-6 bg-white dark:bg-gray-800/50 border-border/40 dark:border-border/20 shadow-lg dark:shadow-gray-950/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">2. Variables d'environnement</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez un fichier{" "}
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-900/50 rounded">.env.local</code> à la racine du
                    projet. Consultez le README.md pour la liste complète des variables nécessaires.
                  </p>

                  <div className="space-y-4">
                    <div className="relative">
                      <pre className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                        <code className="text-gray-800 dark:text-gray-200">{envTemplate}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(envTemplate, "env")}
                      >
                        {copiedSection === "env" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                        <strong className="text-blue-900 dark:text-blue-100">Google Maps & Places API :</strong>
                        <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200 ml-4">
                          <li>
                            • Créez un projet sur{" "}
                            <a
                              href="https://console.cloud.google.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-600"
                            >
                              Google Cloud Console
                            </a>
                          </li>
                          <li>• Activez "Places API (New)", "Maps JavaScript API", et "Geocoding API"</li>
                          <li>• Créez 3 clés API (publique, serveur, places)</li>
                          <li>• Activez la facturation (nécessaire pour Places API)</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
                        <strong className="text-green-900 dark:text-green-100">Supabase :</strong>
                        <ul className="mt-2 space-y-1 text-green-800 dark:text-green-200 ml-4">
                          <li>
                            • Créez un projet sur{" "}
                            <a
                              href="https://supabase.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-green-600"
                            >
                              Supabase
                            </a>
                          </li>
                          <li>• Copiez l'URL du projet et la clé anonyme</li>
                          <li>• Exécutez le script SQL (voir étape 3)</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                        <strong className="text-purple-900 dark:text-purple-100">Grok AI (optionnel) :</strong>
                        <ul className="mt-2 space-y-1 text-purple-800 dark:text-purple-200 ml-4">
                          <li>
                            • Créez un compte sur{" "}
                            <a
                              href="https://x.ai/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-purple-600"
                            >
                              xAI
                            </a>
                          </li>
                          <li>• Générez une clé API</li>
                          <li>• Permet l'enrichissement des données avec IA</li>
                        </ul>
                      </div>

                      <Alert className="border-yellow-300 dark:border-yellow-700/50 bg-yellow-50 dark:bg-yellow-900/20">
                        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                          <strong>📝 Note :</strong> Les noms exacts des variables d'environnement sont documentés dans
                          le fichier README.md à la racine du projet.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 3: Supabase Database */}
            <Card className="p-6 bg-white dark:bg-gray-800/50 border-border/40 dark:border-border/20 shadow-lg dark:shadow-gray-950/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    3. Configuration de la base de données Supabase
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exécutez le script SQL complet dans l'éditeur SQL de Supabase pour créer toutes les tables
                    nécessaires :
                  </p>

                  <div className="space-y-4">
                    <Alert className="border-orange-300 dark:border-orange-700/50 bg-orange-50 dark:bg-orange-900/20">
                      <AlertDescription className="text-orange-900 dark:text-orange-100">
                        <strong>Important :</strong> Le script SQL complet se trouve dans{" "}
                        <code className="px-2 py-1 bg-orange-100 dark:bg-orange-950/50 rounded">
                          scripts/setup_complete_database.sql
                        </code>
                      </AlertDescription>
                    </Alert>

                    <div className="text-sm space-y-2">
                      <p className="font-medium text-foreground">Le script crée :</p>
                      <ul className="space-y-1 text-muted-foreground ml-4">
                        <li>
                          • <strong>search_history</strong> : Historique des recherches utilisateur
                        </li>
                        <li>
                          • <strong>search_results</strong> : Résultats détaillés des recherches
                        </li>
                        <li>
                          • <strong>scraped_businesses</strong> : Commerces scrapés avec détection des doublons
                        </li>
                        <li>• Index pour optimiser les performances</li>
                        <li>• Politiques RLS (Row Level Security) pour la sécurité</li>
                        <li>• Triggers pour la mise à jour automatique des timestamps</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 4: Deploy */}
            <Card className="p-6 bg-white dark:bg-gray-800/50 border-border/40 dark:border-border/20 shadow-lg dark:shadow-gray-950/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">4. Déploiement sur Vercel</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Déployez votre application en quelques clics sur Vercel :
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Push sur GitHub</p>
                          <pre className="mt-2 bg-gray-100 dark:bg-gray-900/50 p-3 rounded text-xs border border-gray-200 dark:border-gray-700">
                            <code className="text-gray-800 dark:text-gray-200">
                              git add .{"\n"}
                              git commit -m "Initial commit"{"\n"}
                              git push origin main
                            </code>
                          </pre>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Importer sur Vercel</p>
                          <p className="text-muted-foreground mt-1">
                            Allez sur{" "}
                            <a
                              href="https://vercel.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700"
                            >
                              Vercel
                            </a>
                            , cliquez sur "New Project" et importez votre repository GitHub
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Configurer les variables d'environnement</p>
                          <p className="text-muted-foreground mt-1">
                            Dans les paramètres du projet Vercel, ajoutez toutes les variables d'environnement
                            documentées dans le README.md
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-950/50 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                          4
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Déployer</p>
                          <p className="text-muted-foreground mt-1">
                            Cliquez sur "Deploy" et attendez que le déploiement se termine (environ 2-3 minutes)
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert className="border-purple-300 dark:border-purple-700/50 bg-purple-50 dark:bg-purple-900/20">
                      <AlertDescription className="text-purple-900 dark:text-purple-100">
                        <strong>Astuce :</strong> N'oubliez pas de mettre à jour les restrictions de vos clés API Google
                        pour inclure votre domaine Vercel
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Resources */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50 shadow-lg dark:shadow-blue-950/20">
              <h3 className="text-lg font-bold text-foreground mb-4">📚 Ressources supplémentaires</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-2">Documentation officielle :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      •{" "}
                      <a
                        href="https://nextjs.org/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
                      >
                        Next.js Documentation
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="https://supabase.com/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
                      >
                        Supabase Documentation
                      </a>
                    </li>
                    <li>
                      •{" "}
                      <a
                        href="https://developers.google.com/maps/documentation/places/web-service/overview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700"
                      >
                        Google Places API
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-2">Support :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• README.md complet dans le projet</li>
                    <li>• Composant DatabaseTest pour diagnostiquer les problèmes</li>
                    <li>• Logs détaillés dans la console du navigateur</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
