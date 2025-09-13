"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, ChevronUp, ChevronDown, RefreshCw, Brain } from "lucide-react"

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
    comparedToYesterday?: string
    nextHourPrediction?: string
    bestTimeToGo?: string
    worstTimeToGo?: string
  }
}

// Mock data as fallback
const fallbackLocations: Location[] = [
  {
    id: "pac",
    name: "Physical Activities Complex (PAC)",
    busyLevel: 85,
    status: "busy",
    lastUpdated: new Date().toISOString(),
    metrics: {
      predictedBusiness: "High",
      peopleCount: 247,
      avgWaitTime: "3-5 min",
      peakHours: "2:00-4:00 PM",
    },
  },
  {
    id: "cmh",
    name: "Claudette Millar Hall (CMH)",
    busyLevel: 92,
    status: "busy",
    lastUpdated: new Date().toISOString(),
    metrics: {
      predictedBusiness: "Very High",
      peopleCount: 312,
      avgWaitTime: "5-8 min",
      peakHours: "1:30-3:30 PM",
    },
  },
<<<<<<< Updated upstream
=======
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
    busyLevel: 100,
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
>>>>>>> Stashed changes
]

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [locations, setLocations] = useState<Location[]>(fallbackLocations)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Load AI analysis data
  const loadAIAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-analysis')
      const data = await response.json()
      
      if (data.success && data.data) {
        const aiLocations: Location[] = data.data.map((analysis: any) => ({
          id: analysis.buildingId,
          name: `${analysis.buildingName} (${analysis.shortName})`,
          busyLevel: analysis.busyLevel,
          status: analysis.status,
          lastUpdated: analysis.lastUpdated,
          metrics: analysis.metrics,
        }))
        
        setLocations(aiLocations)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error loading AI analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Force refresh AI analysis
  const refreshAIAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-analysis', { method: 'POST' })
      const data = await response.json()
      
      if (data.success && data.data) {
        const aiLocations: Location[] = data.data.map((analysis: any) => ({
          id: analysis.buildingId,
          name: `${analysis.buildingName} (${analysis.shortName})`,
          busyLevel: analysis.busyLevel,
          status: analysis.status,
          lastUpdated: analysis.lastUpdated,
          metrics: analysis.metrics,
        }))
        
        setLocations(aiLocations)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error refreshing AI analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadAIAnalysis()
  }, [])

  // Auto-refresh every 20 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadAIAnalysis()
    }, 20 * 60 * 1000) // 20 minutes

    return () => clearInterval(interval)
  }, [])

  const filteredAndSortedLocations = useMemo(() => {
    const filtered = locations.filter((location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => b.busyLevel - a.busyLevel)
  }, [searchTerm, locations])

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
<<<<<<< Updated upstream
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                UW Crowd
              </h1>
              <p className="text-muted-foreground">AI-powered real-time analysis of UW Campus Building Capacities</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={refreshAIAnalysis} 
                disabled={isLoading} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh AI
              </Button>
              <div className="text-xs text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
=======
<div className="mb-9 text-center">
  <h1 className="text-3xl md:text-4xl font-bold mb-2">UW Crowd</h1>
  <p className="text-muted-foreground mb-4">Real-time building capacity updates</p>
  {/* Divider */}
  <div className="w-55 h-1 bg-primary mx-auto rounded-full"></div>
</div>

>>>>>>> Stashed changes

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
                <CardContent className="px-3 py-0">
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
                    <div className="border-t border-border pt-3 mt-3 space-y-3">
                      {/* AI Insights Section */}
                      {(location.metrics.comparedToYesterday || location.metrics.nextHourPrediction) && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-md">
                          <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            AI Insights
                          </h4>
                          <div className="space-y-1">
                            {location.metrics.comparedToYesterday && (
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                📊 {location.metrics.comparedToYesterday}
                              </p>
                            )}
                            {location.metrics.nextHourPrediction && (
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                🔮 {location.metrics.nextHourPrediction}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {(location.metrics.bestTimeToGo || location.metrics.worstTimeToGo) && (
                        <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
                          <h4 className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">
                            🎯 Recommendations
                          </h4>
                          <div className="space-y-1">
                            {location.metrics.bestTimeToGo && (
                              <p className="text-xs text-green-700 dark:text-green-300">
                                ✅ {location.metrics.bestTimeToGo}
                              </p>
                            )}
                            {location.metrics.worstTimeToGo && (
                              <p className="text-xs text-green-700 dark:text-green-300">
                                ❌ {location.metrics.worstTimeToGo}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Standard Metrics */}
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
                            hour: "2-digit",
                            minute: "2-digit",
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




