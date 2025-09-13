import { type NextRequest, NextResponse } from "next/server"
import { informationHandler, parseInformationData } from "@/lib/handle-information"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received building information:", body)

    // Parse the incoming data
    const parsedData = parseInformationData(body.data || body)

    if (parsedData.length === 0) {
      return NextResponse.json({ error: "No valid building data found" }, { status: 400 })
    }

    // Process the information
    informationHandler.processInformation(parsedData)

    // Get current organized data
    const organizedData = informationHandler.getOrganizedData()

    return NextResponse.json({
      success: true,
      message: `Processed ${parsedData.length} building data points`,
      organizedData,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error handling information:", error)
    return NextResponse.json({ error: "Failed to process building information" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buildingId = searchParams.get("building")

    if (buildingId) {
      // Get data for specific building
      const buildingData = informationHandler.getBuildingData(buildingId)

      if (!buildingData) {
        return NextResponse.json({ error: "Building not found" }, { status: 404 })
      }

      return NextResponse.json({
        building: buildingData,
      })
    } else {
      // Get all organized data
      const organizedData = informationHandler.getOrganizedData()

      return NextResponse.json({
        buildings: organizedData.buildings,
        lastUpdated: organizedData.lastUpdated,
        summary: {
          totalBuildings: organizedData.buildings.length,
          totalOccupancy: organizedData.buildings.reduce((sum, b) => sum + b.currentOccupancy, 0),
          totalCapacity: organizedData.buildings.reduce((sum, b) => sum + b.maxCapacity, 0),
          averageOccupancy: Math.round(
            organizedData.buildings.reduce((sum, b) => sum + b.occupancyPercentage, 0) / 
            organizedData.buildings.length
          ),
        },
      })
    }
  } catch (error) {
    console.error("[v0] Error retrieving information:", error)
    return NextResponse.json({ error: "Failed to retrieve building information" }, { status: 500 })
  }
}

// Trigger manual database save
export async function PUT() {
  try {
    informationHandler.triggerDatabaseSave()

    return NextResponse.json({
      success: true,
      message: "Database save triggered manually",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error triggering database save:", error)
    return NextResponse.json({ error: "Failed to trigger database save" }, { status: 500 })
  }
}
