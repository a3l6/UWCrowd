"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, ChevronUp, ChevronDown, RefreshCw, Brain } from "lucide-react"
import { useBuildingFluctuator } from "@/hooks/use-building-fluctuator"

interface Location {
  id: string
  name: string
  busyLevel: number
  status: "busy" | "not-busy"
  lastUpdated: string
  metrics: {
    predictedBusiness: string
    peopleCount: number
    peakHours: string
    comparedToYesterday?: string
    nextHourPrediction?: string
    bestTimeToGo?: string
    worstTimeToGo?: string
  }
}

// Building names mapping for display
const buildingDisplayNames: Record<string, string> = {
  "CMH": "Claudette Millar Hall (CMH)",
  "PAC": "Physical Activities Complex (PAC)", 
  "DC": "William G. Davis Computer Research Centre (DC)",
  "E7": "Engineering 7 (E7)",
  "Dana_Porter": "Dana Porter Library (Dana_Porter)",
}

export default function LocationsPage() {
  const { buildingData: fluctuatorData } = useBuildingFluctuator()
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [locations, setLocations] = useState<Location[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Load AI analysis data
  const loadAIAnalysis = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-analysis')
      const data = await response.json()
      
      if (data.success && data.data) {
        setAiAnalysis(data.data)
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
        setAiAnalysis(data.data)
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

  // Combine fluctuating data with AI analysis
  useEffect(() => {
    const combinedLocations: Location[] = Object.entries(fluctuatorData).map(([buildingKey, data]) => {
      // Find matching AI analysis for this building
      const aiData = aiAnalysis.find(analysis => 
        analysis.shortName === buildingKey || 
        analysis.buildingId === buildingKey.toLowerCase()
      )

      return {
        id: buildingKey.toLowerCase(),
        name: buildingDisplayNames[buildingKey] || buildingKey,
        busyLevel: data.percent_full,
        status: data.percent_full > 50 ? "busy" : "not-busy",
        lastUpdated: new Date().toISOString(),
        metrics: {
          predictedBusiness: aiData?.metrics?.predictedBusiness || getPredictedBusiness(data.percent_full),
          peopleCount: data.people,
          peakHours: aiData?.metrics?.peakHours || getEstimatedPeakHours(buildingKey),
          comparedToYesterday: aiData?.metrics?.comparedToYesterday,
          nextHourPrediction: aiData?.metrics?.nextHourPrediction,
          bestTimeToGo: aiData?.metrics?.bestTimeToGo,
          worstTimeToGo: aiData?.metrics?.worstTimeToGo,
        }
      }
    })

    setLocations(combinedLocations)
  }, [fluctuatorData, aiAnalysis])

  // Helper functions for fallback data
  const getPredictedBusiness = (percentage: number): string => {
    if (percentage >= 90) return "Very High"
    if (percentage >= 70) return "High"
    if (percentage >= 50) return "Medium"
    if (percentage >= 30) return "Low"
    return "Very Low"
  }

  const getEstimatedPeakHours = (buildingKey: string): string => {
    const peakHours: Record<string, string> = {
      "CMH": "1:00-3:00 PM",
      "PAC": "5:00-7:00 PM",
      "DC": "2:00-4:00 PM",
      "E7": "10:00 AM-12:00 PM",
      "Dana_Porter": "3:00-5:00 PM",
    }
    return peakHours[buildingKey] || "12:00-2:00 PM"
  }

  const filteredLocations = useMemo(() => {
  return locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
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
    <div className="mt-8 mb-10">
      <div className="flex items-center justify-between">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-2">
          <span style={{ color: '#FCA311' }}>UW</span>
          <span style={{ color: '#14213D' }}>Crowd</span>
        </h1>

        {/* Button with updated timestamp underneath */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <Button
              onClick={refreshAIAnalysis}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh AI
            </Button>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 dark:text-green-300">Live</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            AI Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Slogan stays below the row if needed */}
      <p className="mt-4 text-muted-foreground text-base md:text-lg">
        Live building occupancy with AI-powered insights • Updates every second
      </p>
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
          {filteredLocations.map((location) => {
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
                        <div className=" dark:bg-blue-950/20 p-2 rounded-md">
                          <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1">
                          
                            AI Insights
                          </h4>
                          <div className="space-y-1">
                            {location.metrics.comparedToYesterday && (
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                {location.metrics.comparedToYesterday}
                              </p>
                            )}
                            {location.metrics.nextHourPrediction && (
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                {location.metrics.nextHourPrediction}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {(location.metrics.bestTimeToGo || location.metrics.worstTimeToGo) && (
                        <div className=" dark:bg-green-950/20 p-2 rounded-md">
                          <h4 className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">
                            Recommendations
                          </h4>
                          <div className="space-y-1">
                            {location.metrics.bestTimeToGo && (
                              <p className="text-xs text-green-700 dark:text-green-300">
                                {location.metrics.bestTimeToGo}
                              </p>
                            )}
                            {location.metrics.worstTimeToGo && (
                              <p className="text-xs text-green-700 dark:text-green-300">
                                {location.metrics.worstTimeToGo}
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




