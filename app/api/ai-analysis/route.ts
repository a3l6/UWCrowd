import { NextResponse } from "next/server"
import { getCachedAnalyses, analyzeAllBuildings } from "@/lib/cohereAI"

export async function GET() {
  try {
    const analyses = await getCachedAnalyses()
    
    return NextResponse.json({
      success: true,
      data: analyses,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error getting AI analyses:", error)
    return NextResponse.json({ error: "Failed to get AI analyses" }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log("[v0] Forcing refresh of AI analyses...")
    const analyses = await analyzeAllBuildings()
    
    return NextResponse.json({
      success: true,
      message: "AI analyses refreshed",
      data: analyses,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error refreshing AI analyses:", error)
    return NextResponse.json({ error: "Failed to refresh AI analyses" }, { status: 500 })
  }
}