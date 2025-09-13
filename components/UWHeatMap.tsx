"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Users, Clock, MapPin } from "lucide-react"
import { DatabaseStatus } from "./DatabaseStatus"

interface BuildingData {
  id: string
  name: string
  shortName: string
  currentOccupancy: number
  maxCapacity: number
  occupancyPercentage: number
  coordinates: [number, number] // [lat, lng]
}

const sampleBuildingData: BuildingData[] = [
  {
    id: "mc",
    name: "Mathematics & Computer Building",
    shortName: "MC",
    currentOccupancy: 450,
    maxCapacity: 600,
    occupancyPercentage: 75,
    coordinates: [43.4723, -80.5449],
  },
  {
    id: "dc",
    name: "William G. Davis Computer Research Centre",
    shortName: "DC",
    currentOccupancy: 320,
    maxCapacity: 400,
    occupancyPercentage: 80,
    coordinates: [43.4728, -80.542],
  },
  {
    id: "e2",
    name: "Engineering 2",
    shortName: "E2",
    currentOccupancy: 280,
    maxCapacity: 500,
    occupancyPercentage: 56,
    coordinates: [43.4715, -80.5397],
  },
  {
    id: "e3",
    name: "Engineering 3",
    shortName: "E3",
    currentOccupancy: 180,
    maxCapacity: 350,
    occupancyPercentage: 51,
    coordinates: [43.4708, -80.5392],
  },
  {
    id: "e5",
    name: "Engineering 5",
    shortName: "E5",
    currentOccupancy: 420,
    maxCapacity: 450,
    occupancyPercentage: 93,
    coordinates: [43.4701, -80.5376],
  },
  {
    id: "e7",
    name: "Engineering 7",
    shortName: "E7",
    currentOccupancy: 380,
    maxCapacity: 400,
    occupancyPercentage: 95,
    coordinates: [43.4695, -80.5359],
  },
  {
    id: "slc",
    name: "Student Life Centre",
    shortName: "SLC",
    currentOccupancy: 850,
    maxCapacity: 1200,
    occupancyPercentage: 71,
    coordinates: [43.4706, -80.537],
  },
  {
    id: "pac",
    name: "Physical Activities Complex",
    shortName: "PAC",
    currentOccupancy: 320,
    maxCapacity: 800,
    occupancyPercentage: 40,
    coordinates: [43.4742, -80.546],
  },
  {
    id: "al",
    name: "Arts Lecture Hall",
    shortName: "AL",
    currentOccupancy: 150,
    maxCapacity: 300,
    occupancyPercentage: 50,
    coordinates: [43.4688, -80.5423],
  },
  {
    id: "ml",
    name: "Modern Languages",
    shortName: "ML",
    currentOccupancy: 90,
    maxCapacity: 200,
    occupancyPercentage: 45,
    coordinates: [43.4685, -80.5435],
  },
  {
    id: "qnc",
    name: "Quantum Nano Centre",
    shortName: "QNC",
    currentOccupancy: 120,
    maxCapacity: 150,
    occupancyPercentage: 80,
    coordinates: [43.471, -80.5355],
  },
  {
    id: "sch",
    name: "South Campus Hall",
    shortName: "SCH",
    currentOccupancy: 200,
    maxCapacity: 400,
    occupancyPercentage: 50,
    coordinates: [43.4665, -80.538],
  },
  {
    id: "m3",
    name: "Mathematics 3",
    shortName: "M3",
    currentOccupancy: 180,
    maxCapacity: 250,
    occupancyPercentage: 72,
    coordinates: [43.4734, -80.5458],
  },
  {
    id: "c2",
    name: "Chemistry 2",
    shortName: "C2",
    currentOccupancy: 160,
    maxCapacity: 300,
    occupancyPercentage: 53,
    coordinates: [43.472, -80.5425],
  },
  {
    id: "b1",
    name: "Biology 1",
    shortName: "B1",
    currentOccupancy: 140,
    maxCapacity: 280,
    occupancyPercentage: 50,
    coordinates: [43.4718, -80.5415],
  },
  {
    id: "b2",
    name: "Biology 2",
    shortName: "B2",
    currentOccupancy: 110,
    maxCapacity: 220,
    occupancyPercentage: 50,
    coordinates: [43.4716, -80.541],
  },
  {
    id: "ph",
    name: "Physics",
    shortName: "PH",
    currentOccupancy: 95,
    maxCapacity: 180,
    occupancyPercentage: 53,
    coordinates: [43.4714, -80.5405],
  },
  {
    id: "rch",
    name: "J.R. Coutts Engineering Lecture Hall",
    shortName: "RCH",
    currentOccupancy: 200,
    maxCapacity: 400,
    occupancyPercentage: 50,
    coordinates: [43.4698, -80.5385],
  },
  {
    id: "dwe",
    name: "Douglas Wright Engineering Building",
    shortName: "DWE",
    currentOccupancy: 180,
    maxCapacity: 320,
    occupancyPercentage: 56,
    coordinates: [43.4693, -80.538],
  },
  {
    id: "cph",
    name: "Carl A. Pollock Hall",
    shortName: "CPH",
    currentOccupancy: 220,
    maxCapacity: 350,
    occupancyPercentage: 63,
    coordinates: [43.469, -80.5375],
  },
]

export function WaterlooHeatMap() {
  const [buildingData, setBuildingData] = useState<BuildingData[]>(sampleBuildingData)
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Load initial data from API
  useEffect(() => {
    loadBuildingData()
  }, [])

  // Listen for real-time updates
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      setBuildingData(event.detail.buildings)
      setLastUpdated(new Date(event.detail.lastUpdated))
    }

    window.addEventListener('buildingDataUpdated', handleDataUpdate as EventListener)
    
    return () => {
      window.removeEventListener('buildingDataUpdated', handleDataUpdate as EventListener)
    }
  }, [])

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

  // Load building data from API
  const loadBuildingData = async () => {
    try {
      const response = await fetch('/api/information')
      const data = await response.json()
      
      if (data.buildings && data.buildings.length > 0) {
        setBuildingData(data.buildings)
        setLastUpdated(new Date(data.lastUpdated))
      }
    } catch (error) {
      console.error('Error loading building data:', error)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await loadBuildingData()
    setIsRefreshing(false)
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
                className="w-full h-[500px] bg-muted rounded-lg border overflow-hidden"
                style={{ zIndex: 1 }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <DatabaseStatus />
          
          {selectedBuilding ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedBuilding.shortName}</span>
                  <Badge variant={getOccupancyLevel(selectedBuilding.occupancyPercentage).color as any}>
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
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Current</h4>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-lg font-semibold">{selectedBuilding.currentOccupancy}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Capacity</h4>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-lg font-semibold">{selectedBuilding.maxCapacity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Occupancy Rate</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{selectedBuilding.occupancyPercentage}%</span>
                      <span>
                        {selectedBuilding.currentOccupancy} / {selectedBuilding.maxCapacity}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedBuilding.occupancyPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Click on a building to view details</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campus Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Buildings</span>
                <span className="font-semibold">{buildingData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Occupancy</span>
                <span className="font-semibold">
                  {buildingData.reduce((sum, b) => sum + b.currentOccupancy, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Capacity</span>
                <span className="font-semibold">
                  {buildingData.reduce((sum, b) => sum + b.maxCapacity, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Occupancy</span>
                <span className="font-semibold">
                  {Math.round(buildingData.reduce((sum, b) => sum + b.occupancyPercentage, 0) / buildingData.length)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
