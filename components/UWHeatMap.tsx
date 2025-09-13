"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Users, Clock, MapPin } from "lucide-react"
import { DatabaseStatus } from "./DatabaseStatus"
import { useBuildingFluctuator } from "@/hooks/use-building-fluctuator"

interface BuildingData {
  id: string
  name: string
  shortName: string
  currentOccupancy: number
  maxCapacity: number
  occupancyPercentage: number
  coordinates: [number, number] // [lat, lng]
}

// Building coordinates mapping for the fluctuator buildings
const buildingCoordinates: Record<string, [number, number]> = {
  "CMH": [43.4723, -80.5449], // Mathematics & Computer Building area
  "PAC": [43.4742, -80.546],  // Physical Activities Complex
  "DC": [43.4728, -80.542],   // William G. Davis Computer Research Centre
  "E7": [43.4695, -80.5359],  // Engineering 7
  "Dana_Porter": [43.4688, -80.5423], // Dana Porter Library area
}

// Building full names mapping
const buildingNames: Record<string, string> = {
  "CMH": "Mathematics & Computer Building",
  "PAC": "Physical Activities Complex",
  "DC": "William G. Davis Computer Research Centre",
  "E7": "Engineering 7",
  "Dana_Porter": "Dana Porter Library",
}

export function WaterlooHeatMap() {
  const { buildingData: fluctuatorData, rawPercentages } = useBuildingFluctuator()
  const [buildingData, setBuildingData] = useState<BuildingData[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Convert fluctuator data to BuildingData format
  useEffect(() => {
    const convertedData: BuildingData[] = Object.entries(fluctuatorData).map(([buildingKey, data]) => ({
      id: buildingKey.toLowerCase(),
      name: buildingNames[buildingKey] || buildingKey,
      shortName: buildingKey,
      currentOccupancy: data.people,
      maxCapacity: buildingKey === "CMH" ? 600 :
        buildingKey === "PAC" ? 200 :
          buildingKey === "DC" ? 1500 :
            buildingKey === "E7" ? 1550 :
              buildingKey === "Dana_Porter" ? 400 : 500,
      occupancyPercentage: data.percent_full,
      coordinates: buildingCoordinates[buildingKey] || [43.4723, -80.5449]
    }))

    setBuildingData(convertedData)
    setLastUpdated(new Date())

    // Update selected building if it exists to keep it in sync with fluctuating data
    if (selectedBuilding) {
      const updatedSelectedBuilding = convertedData.find(b => b.id === selectedBuilding.id)
      if (updatedSelectedBuilding) {
        setSelectedBuilding(updatedSelectedBuilding)
      }
    }
  }, [fluctuatorData, selectedBuilding?.id])

  // Initialize map
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !leafletMapRef.current) {
      // Dynamically import Leaflet to avoid SSR issues
      import("leaflet").then((L) => {
        // Initialize map centered on University of Waterloo
        const map = L.map(mapRef.current!).setView([43.4723, -80.5449], 16)

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map)

        leafletMapRef.current = map

        // Add building markers
        updateMarkers(L, map, buildingData)
      })
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (leafletMapRef.current && typeof window !== "undefined") {
      import("leaflet").then((L) => {
        updateMarkers(L, leafletMapRef.current, buildingData)
      })
    }
  }, [buildingData])

  const updateMarkers = (L: any, map: any, data: BuildingData[]) => {
    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker))
    markersRef.current = []

    // Add new markers for each building
    data.forEach((building) => {
      const backgroundColor = getHeatColor(building.occupancyPercentage)
      const textColor = getTextColor(backgroundColor)

      console.log(
        `[v0] Building ${building.shortName}: ${building.occupancyPercentage}% -> bg: ${backgroundColor}, text: ${textColor}`,
      )

      // Create custom icon with building color
      const customIcon = L.divIcon({
        className: "custom-building-marker",
        html: `
          <div style="
            background-color: ${backgroundColor};
            border: 2px solid #374151;
            border-radius: 8px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${textColor};
            font-weight: bold;
            font-size: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          ">
            ${building.shortName}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      const marker = L.marker(building.coordinates, { icon: customIcon })
        .addTo(map)
        .on("click", () => {
          setSelectedBuilding(building)
        })

      // Add popup with building info
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${building.shortName}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${building.name}</p>
          <p style="margin: 0; font-size: 12px;">
            <strong>Occupancy:</strong> ${building.currentOccupancy}/${building.maxCapacity} (${building.occupancyPercentage}%)
          </p>
        </div>
      `)

      markersRef.current.push(marker)
    })
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    // The data refreshes automatically via the fluctuator hook
    // This is just for UI feedback
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(new Date())
    }, 500)
  }

  // Trigger manual database save
  const triggerDatabaseSave = async () => {
    try {
      await fetch('/api/information', { method: 'PUT' })
      console.log('Manual database save triggered')
    } catch (error) {
      console.error('Error triggering database save:', error)
    }
  }

  const getHeatColor = (percentage: number): string => {
    // Normalize percentage to 0-1 range
    const normalized = Math.max(0, Math.min(100, percentage)) / 100

    // Define color points: green (low) to dark red (high)
    const green = { r: 34, g: 197, b: 94 } // #22c55e
    const yellow = { r: 234, g: 179, b: 8 } // #eab308
    const orange = { r: 249, g: 115, b: 22 } // #f97316
    const red = { r: 220, g: 38, b: 38 } // #dc2626
    const darkRed = { r: 124, g: 45, b: 18 } // #7c2d12

    let r, g, b

    if (normalized <= 0.25) {
      // Green to Yellow (0-25%)
      const t = normalized / 0.25
      r = Math.round(green.r + (yellow.r - green.r) * t)
      g = Math.round(green.g + (yellow.g - green.g) * t)
      b = Math.round(green.b + (yellow.b - green.b) * t)
    } else if (normalized <= 0.5) {
      // Yellow to Orange (25-50%)
      const t = (normalized - 0.25) / 0.25
      r = Math.round(yellow.r + (orange.r - yellow.r) * t)
      g = Math.round(yellow.g + (orange.g - yellow.g) * t)
      b = Math.round(yellow.b + (orange.b - yellow.b) * t)
    } else if (normalized <= 0.75) {
      // Orange to Red (50-75%)
      const t = (normalized - 0.5) / 0.25
      r = Math.round(orange.r + (red.r - orange.r) * t)
      g = Math.round(orange.g + (red.g - orange.g) * t)
      b = Math.round(orange.b + (red.b - orange.b) * t)
    } else {
      // Red to Dark Red (75-100%)
      const t = (normalized - 0.75) / 0.25
      r = Math.round(red.r + (darkRed.r - red.r) * t)
      g = Math.round(red.g + (darkRed.g - red.g) * t)
      b = Math.round(red.b + (darkRed.b - red.b) * t)
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  const getTextColor = (backgroundColor: string): string => {
    const rgbMatch = backgroundColor.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
    if (!rgbMatch) {
      console.log(`[v0] Failed to parse background color: ${backgroundColor}`)
      return "#000000" // Default to black if parsing fails
    }

    const r = Number.parseInt(rgbMatch[1])
    const g = Number.parseInt(rgbMatch[2])
    const b = Number.parseInt(rgbMatch[3])

    // Calculate luminance using the relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    console.log(`[v0] RGB(${r}, ${g}, ${b}) -> luminance: ${luminance}`)

    return luminance > 0.4 ? "#000000" : "#ffffff"
  }

  const getOccupancyLevel = (percentage: number): { label: string; color: string } => {
    if (percentage >= 90) return { label: "Very High", color: "destructive" }
    if (percentage >= 70) return { label: "High", color: "secondary" }
    if (percentage >= 50) return { label: "Medium", color: "default" }
    if (percentage >= 30) return { label: "Low", color: "outline" }
    return { label: "Very Low", color: "outline" }
  }

  return (
    <div className="space-y-6">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={refreshData} disabled={isRefreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <Button onClick={triggerDatabaseSave} variant="outline" size="sm">
            Save to DB
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Occupancy:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-border rounded-sm" style={{ backgroundColor: getHeatColor(0) }}></div>
            <span className="text-xs">0%</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 border border-border rounded-sm"
              style={{ backgroundColor: getHeatColor(50) }}
            ></div>
            <span className="text-xs">50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 border border-border rounded-sm"
              style={{ backgroundColor: getHeatColor(100) }}
            ></div>
            <span className="text-xs">100%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                University of Waterloo Campus Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="w-full h-[500px] bg-muted rounded-lg border overflow-hidden shadow"
                style={{ zIndex: 1 }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col h-[600px] space-y-4 overflow-hidden">
          {/* Fixed DatabaseStatus at top */}
          <div className="flex-shrink-0">
            <DatabaseStatus />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 min-h-0 overflow-y-auto border rounded-lg p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 shadow-lg bg-card">
            {selectedBuilding ? (
              <Card className="flex-shrink-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedBuilding.shortName}</span>
                    <Badge
                      variant={getOccupancyLevel(selectedBuilding.occupancyPercentage).color as any}
                      style={{
                        backgroundColor: getHeatColor(selectedBuilding.occupancyPercentage),
                        color: getTextColor(getHeatColor(selectedBuilding.occupancyPercentage))
                      }}
                    >
                      {getOccupancyLevel(selectedBuilding.occupancyPercentage).label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Building Name</h4>
                    <p className="text-sm">{selectedBuilding.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border" style={{
                      backgroundColor: `${getHeatColor(selectedBuilding.occupancyPercentage)}15`,
                      borderColor: getHeatColor(selectedBuilding.occupancyPercentage)
                    }}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Current</h4>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" style={{ color: getHeatColor(selectedBuilding.occupancyPercentage) }} />
                        <span
                          className="text-lg font-semibold transition-all duration-500"
                          style={{ color: getHeatColor(selectedBuilding.occupancyPercentage) }}
                        >
                          {selectedBuilding.currentOccupancy}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-muted">
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Capacity</h4>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-semibold">{selectedBuilding.maxCapacity}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Occupancy Rate</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span
                          className="font-semibold transition-all duration-500"
                          style={{ color: getHeatColor(selectedBuilding.occupancyPercentage) }}
                        >
                          {selectedBuilding.occupancyPercentage}%
                        </span>
                        <span>
                          {selectedBuilding.currentOccupancy} / {selectedBuilding.maxCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full transition-all duration-1000 ease-in-out"
                          style={{
                            width: `${selectedBuilding.occupancyPercentage}%`,
                            backgroundColor: getHeatColor(selectedBuilding.occupancyPercentage)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-md">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: getHeatColor(selectedBuilding.occupancyPercentage) }}
                    ></div>
                    <span className="text-xs text-muted-foreground">Live Data</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-shrink-0">
                <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click on a building to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="flex-shrink-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  Campus Summary
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Buildings</span>
                  <span className="font-semibold">{buildingData.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Occupancy</span>
                  <span className="font-semibold text-lg transition-all duration-500">
                    {buildingData.reduce((sum, b) => sum + b.currentOccupancy, 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Capacity</span>
                  <span className="font-semibold">
                    {buildingData.reduce((sum, b) => sum + b.maxCapacity, 0).toLocaleString()}
                  </span>
                </div>

                {(() => {
                  const avgOccupancy = buildingData.length > 0
                    ? Math.round(buildingData.reduce((sum, b) => sum + b.occupancyPercentage, 0) / buildingData.length)
                    : 0;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Occupancy</span>
                        <span
                          className="font-semibold text-lg transition-all duration-500"
                          style={{ color: getHeatColor(avgOccupancy) }}
                        >
                          {avgOccupancy}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-1000 ease-in-out"
                          style={{
                            width: `${avgOccupancy}%`,
                            backgroundColor: getHeatColor(avgOccupancy)
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Individual building status indicators */}
                <div className="space-y-2 pt-2 border-t">
                  <h5 className="text-xs font-semibold text-muted-foreground mb-2 text-center">Building Status</h5>
                  <div className="space-y-1">
                    {buildingData.map((building) => (
                      <div key={building.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full transition-all duration-500"
                            style={{ backgroundColor: getHeatColor(building.occupancyPercentage) }}
                          ></div>
                          <span className="font-medium">{building.shortName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold transition-all duration-500"
                            style={{ color: getHeatColor(building.occupancyPercentage) }}
                          >
                            {building.currentOccupancy}
                          </span>
                          <span className="text-muted-foreground">
                            ({building.occupancyPercentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus status indicator */}
                {(() => {
                  const totalOccupancy = buildingData.reduce((sum, b) => sum + b.currentOccupancy, 0);
                  const totalCapacity = buildingData.reduce((sum, b) => sum + b.maxCapacity, 0);
                  const overallPercentage = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

                  return (
                    <div className="p-3 rounded-lg border transition-all duration-500" style={{
                      backgroundColor: `${getHeatColor(overallPercentage)}15`,
                      borderColor: getHeatColor(overallPercentage)
                    }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Campus Status</span>
                        <span
                          className="text-sm font-bold"
                          style={{ color: getHeatColor(overallPercentage) }}
                        >
                          {overallPercentage >= 80 ? "Very Busy" :
                            overallPercentage >= 60 ? "Busy" :
                              overallPercentage >= 40 ? "Moderate" :
                                overallPercentage >= 20 ? "Light" : "Very Light"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {totalOccupancy.toLocaleString()} / {totalCapacity.toLocaleString()} people ({overallPercentage}%)
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
