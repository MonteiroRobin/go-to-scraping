import { type NextRequest, NextResponse } from "next/server"
import { getUserCredits } from "@/lib/credits"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const credits = await getUserCredits(userId)

    if (!credits) {
      // Retourner des crédits par défaut si l'utilisateur n'existe pas encore
      return NextResponse.json({
        credits_remaining: 100,
        credits_total: 100,
        credits_used: 0,
        plan: "free",
      })
    }

    return NextResponse.json(credits)
  } catch (error) {
    console.error("[API] Error fetching credits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
