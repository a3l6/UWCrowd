"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Search, MapPin } from "lucide-react"

interface Location {
  id: string
  name: string
  busyLevel: number // 0-100 scale for busy level
  status: "busy" | "not-busy"
  lastUpdated: string
  metrics: {
    predictedBusiness: string
    peopleCount: number
    avgWaitTime: string
    peakHours: string
  }
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "PAC",
    busyLevel: 85,
    status: "busy",
    lastUpdated: "2024-01-15",
    metrics: {
      predictedBusiness: "High",
      peopleCount: 247,
      avgWaitTime: "3-5 min",
      peakHours: "2:00-4:00 PM",
    },
  },
  {
    id: "2",
    name: "CMH",
    busyLevel: 92,
    status: "busy",
    lastUpdated: "2024-01-12",
    metrics: {
      predictedBusiness: "Very High",
      peopleCount: 312,
      avgWaitTime: "5-8 min",
      peakHours: "1:30-3:30 PM",
    },
  },
  {
    id: "3",
    name: "Dana Porter",
    busyLevel: 67,
    status: "busy",
    lastUpdated: "2024-01-10",
    metrics: {
      predictedBusiness: "Moderate",
      peopleCount: 156,
      avgWaitTime: "2-3 min",
      peakHours: "11:00 AM-1:00 PM",
    },
  },
  {
    id: "4",
    name: "E7",
    busyLevel: 45,
    status: "not-busy",
    lastUpdated: "2024-01-08",
    metrics: {
      predictedBusiness: "Low",
      peopleCount: 10,
      avgWaitTime: "1-2 min",
      peakHours: "10:00 AM-12:00 PM",
    },
  },
  {
    id: "5",
    name: "DC",
    busyLevel: 10,
    status: "busy",
    lastUpdated: "2024-01-14",
    metrics: {
      predictedBusiness: "High",
      peopleCount: 203,
      avgWaitTime: "3-4 min",
      peakHours: "2:30-4:30 PM",
    },
  },
]

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const filteredAndSortedLocations = useMemo(() => {
    const filtered = mockLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase())
      const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase())

      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1

      return b.busyLevel - a.busyLevel
    })
  }, [searchTerm])

  const toggleExpanded = (locationId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId)
    } else {
      newExpanded.add(locationId)
    }
    setExpandedCards(newExpanded)
  }

  const getAutoStatus = (busyLevel: number): "busy" | "not-busy" => {
    return busyLevel > 50 ? "busy" : "not-busy"
  }

  const getBusyLevelColor = (busyLevel: number) => {
    const red = Math.round(255 * (busyLevel / 100))
    const green = Math.round(255 * (1 - busyLevel / 100))
    return `rgb(${red}, ${green}, 0)`
  }

  const getBusyLevelBgColor = (busyLevel: number) => {
    const red = Math.round(255 * (busyLevel / 100))
    const green = Math.round(255 * (1 - busyLevel / 100))
    return `rgba(${red}, ${green}, 0, 0.1)`
  }

  const getBusyLevelTextColor = (busyLevel: number) => {
    return busyLevel > 70 ? "text-white" : "text-gray-900"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">UW Crowd</h1>
          <p className="text-muted-foreground text-pretty">Know before you go</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search locations by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base bg-card border-border focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Results Count */}
        {searchTerm && (
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredAndSortedLocations.length} location
            {filteredAndSortedLocations.length !== 1 ? "s" : ""} found
          </div>
        )}

{/* Location Cards */}
<div className="space-y-1">
  {filteredAndSortedLocations.map((location) => {
    const isExpanded = expandedCards.has(location.id)

    const autoStatus = getAutoStatus(location.busyLevel)


    return (
      <Card
  key={location.id}
  className="w-full transition-all duration-200 hover:shadow-md border cursor-pointer hover:scale-[1.01]"
        style={{
          backgroundColor: getBusyLevelBgColor(location.busyLevel),
          borderColor: getBusyLevelColor(location.busyLevel),
        }}
          onClick={() => toggleExpanded(location.id)} // ← HERE

      >
        {/* Minimal vertical padding, small horizontal padding */}
        <CardContent className="px-3 py-1">
          <div className="flex items-center justify-between gap-2">
            {/* Left side - Location name and icon */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-base font-semibold truncate text-foreground">{location.name}</h3>
            </div>

            {/* Center - Busy meter */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground">Busy:</span>
              <div className="w-20 bg-secondary rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${location.busyLevel}%`,
                    backgroundColor: getBusyLevelColor(location.busyLevel),
                  }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-8">{location.busyLevel}%</span>
            </div>

            {/* Right side - Status and expand button */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span
                className="px-1 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getBusyLevelColor(location.busyLevel) }}
              >
                {autoStatus === "busy" ? "Busy" : "Not Busy"}
              </span>

              <div className="h-8 w-8 flex items-center justify-center">
  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
</div>
            </div>
          </div>

          {isExpanded && (
            <div className="border-t border-border pt-1 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <h4 className="text-xs font-semibold mb-0.5 text-foreground">Predicted Business</h4>
                  <p className="text-xs text-muted-foreground">{location.metrics.predictedBusiness}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-0.5 text-foreground">People Count</h4>
                  <p className="text-xs text-muted-foreground">{location.metrics.peopleCount} people</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-0.5 text-foreground">Avg. Wait Time</h4>
                  <p className="text-xs text-muted-foreground">{location.metrics.avgWaitTime}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-0.5 text-foreground">Peak Hours</h4>
                  <p className="text-xs text-muted-foreground">{location.metrics.peakHours}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold mb-0.5 text-foreground">Address</h4>
                <p className="text-xs text-muted-foreground">{location.address}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold mb-0.5 text-foreground">Last Updated</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(location.lastUpdated).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  })}
</div>


        {/* No Results */}
        {filteredAndSortedLocations.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No locations found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or browse all locations</p>
          </div>
        )}
      </div>
    </div>
  )
}

