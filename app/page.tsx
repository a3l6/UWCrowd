"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, ChevronUp, ChevronDown } from "lucide-react"

interface Location {
  id: string
  name: string
  busyLevel: number
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
    name: "Physical Activities Complex (PAC)",
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
    name: "Claudette Millar Hall (CMH)",
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
    name: "Dana Porter Library (DP)",
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
    name: "Engineering 7 (E7)",
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
    name: "Davis Center (DC)",
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
    const filtered = mockLocations.filter((location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => b.busyLevel - a.busyLevel)
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

  const getAutoStatus = (busyLevel: number): "busy" | "not-busy" =>
    busyLevel > 50 ? "busy" : "not-busy"

  const getBusyLevelColor = (busyLevel: number) => {
    const red = Math.round(255 * (busyLevel / 100))
    const green = Math.round(255 * (1 - busyLevel / 100))
    return `rgb(${red}, ${green}, 0)`
  }

  const getBusyLevelBgColor = (busyLevel: number) => {
    const red = Math.round(255 * (busyLevel / 100))
    const green = Math.round(255 * (1 - busyLevel / 100))
    return `rgba(${red}, ${green}, 0, 0.08)`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">UW Crowd</h1>
          <p className="text-muted-foreground">Real-time updates of UW Campus Building Capacities</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base bg-card border-border"
          />
        </div>

        {/* Location Cards */}
        <div className="space-y-2">
          {filteredAndSortedLocations.map((location) => {
            const isExpanded = expandedCards.has(location.id)
            const autoStatus = getAutoStatus(location.busyLevel)

            return (
              <Card
                key={location.id}
                className="w-full transition-all duration-200 hover:shadow-lg border cursor-pointer hover:scale-[1.01]"
                style={{
                  backgroundColor: getBusyLevelBgColor(location.busyLevel),
                  borderColor: getBusyLevelColor(location.busyLevel),
                }}
                onClick={() => toggleExpanded(location.id)}
              >
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Left side */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <h3 className="text-base font-semibold truncate text-foreground">
                        <span className="hidden md:inline">{location.name}</span>
                        <span className="inline md:hidden">
                          {location.name.match(/\(([^)]+)\)/)?.[1] || location.name}
                        </span>
                      </h3>
                    </div>

                    {/* Busy Meter */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-20 lg:w-28 bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${location.busyLevel}%`,
                            backgroundColor: getBusyLevelColor(location.busyLevel),
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground w-10">
                        {location.busyLevel}%
                      </span>
                    </div>

                    {/* Status + Expand */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getBusyLevelColor(location.busyLevel) }}
                      >
                        {autoStatus === "busy" ? "Busy" : "Not Busy"}
                      </span>

                      <div className="h-8 w-8 flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border pt-2 mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-xs font-semibold text-foreground">
                            Predicted Business
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {location.metrics.predictedBusiness}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground">People Count</h4>
                          <p className="text-xs text-muted-foreground">
                            {location.metrics.peopleCount} people
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground">Avg. Wait Time</h4>
                          <p className="text-xs text-muted-foreground">
                            {location.metrics.avgWaitTime}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground">Peak Hours</h4>
                          <p className="text-xs text-muted-foreground">
                            {location.metrics.peakHours}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-foreground">Last Updated</h4>
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
      </div>
    </div>
  )
}



