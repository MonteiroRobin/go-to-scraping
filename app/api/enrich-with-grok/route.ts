import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const XAI_API_KEY = process.env.GROK_XAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { business } = await request.json()

    if (!XAI_API_KEY) {
      return NextResponse.json({ error: "GROK_XAI_API_KEY not configured" }, { status: 500 })
    }

    if (!business) {
      return NextResponse.json({ error: "Business data is required" }, { status: 400 })
    }

    const prompt = `Tu es un expert en analyse de commerces locaux. Ton rôle est d'enrichir les données avec des informations VRAIMENT utiles pour les utilisateurs.

Établissement à analyser :
- Nom: ${business.name}
- Adresse: ${business.address}
- Téléphone: ${business.phone}
- Site web: ${business.website}
- Note: ${business.rating || "Non disponible"}
- Avis: ${business.user_ratings_total || "Non disponible"}

Ta mission : Analyser cet établissement et fournir des informations PRATIQUES et ACTIONNABLES au format JSON strict :

{
  "description": "Description professionnelle de 2-3 phrases mettant en avant les points forts et ce qui rend cet établissement unique",
  "category": "Catégorie précise et descriptive (ex: Restaurant gastronomique français, Café-coworking moderne, Boulangerie artisanale bio)",
  "tags": ["tag1", "tag2", "tag3"],
  "estimated_price_range": "€, €€, €€€ ou €€€€",
  "specialties": ["spécialité1", "spécialité2", "spécialité3"],
  "best_time_to_visit": "Meilleur moment pour visiter (ex: Matin calme, Déjeuner animé, Soirée conviviale)",
  "unique_features": ["caractéristique unique 1", "caractéristique unique 2"],
  "target_audience": "Public cible principal (ex: Familles, Professionnels, Étudiants, Touristes)",
  "missing_contact_info": {
    "phone": "Numéro de téléphone si manquant (ou null)",
    "email": "Email professionnel probable si manquant (ou null)",
    "website": "Site web probable si manquant (ou null)"
  },
  "practical_info": {
    "parking": "Information sur le parking (Disponible, Payant, Difficile, ou null)",
    "accessibility": "Accessibilité PMR (Oui, Non, Partielle, ou null)",
    "payment_methods": ["CB", "Espèces", "Tickets restaurant", etc."]
  }
}

IMPORTANT: 
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après
- Sois précis et factuel
- Si une information n'est pas disponible ou incertaine, utilise null
- Les tags doivent être des mots-clés pertinents et recherchables
- Les spécialités doivent être concrètes et spécifiques`

    const { text } = await generateText({
      model: "xai/grok-2",
      prompt,
      maxTokens: 800,
      temperature: 0.7,
    })

    // Parse the JSON response
    let enrichedData
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        enrichedData = JSON.parse(jsonMatch[0])
      } else {
        enrichedData = JSON.parse(text)
      }
    } catch (parseError) {
      console.error("[v0] Error parsing Grok response:", parseError)
      // Return original business if parsing fails
      return NextResponse.json({ enrichedBusiness: business })
    }

    // Merge enriched data with original business
    const enrichedBusiness = {
      ...business,
      description: enrichedData.description || null,
      category: enrichedData.category || null,
      tags: enrichedData.tags || [],
      estimated_price_range: enrichedData.estimated_price_range || null,
      specialties: enrichedData.specialties || [],
      best_time_to_visit: enrichedData.best_time_to_visit || null,
      unique_features: enrichedData.unique_features || [],
      target_audience: enrichedData.target_audience || null,
      practical_info: enrichedData.practical_info || null,
      phone:
        business.phone === "Non disponible" && enrichedData.missing_contact_info?.phone
          ? enrichedData.missing_contact_info.phone
          : business.phone,
      email:
        business.email === "Non disponible" && enrichedData.missing_contact_info?.email
          ? enrichedData.missing_contact_info.email
          : business.email,
      website:
        business.website === "Non disponible" && enrichedData.missing_contact_info?.website
          ? enrichedData.missing_contact_info.website
          : business.website,
      enriched: true,
    }

    return NextResponse.json({ enrichedBusiness })
  } catch (error: any) {
    console.error("[v0] Error in enrich-with-grok API:", error)
    // Return original business on error to not break the flow
    const { business } = await request.json()
    return NextResponse.json({ enrichedBusiness: business })
  }
}
