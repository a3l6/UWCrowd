import { supabase } from './supabase'

// For now, we'll use a mock AI service to avoid API issues
// You can replace this with actual Cohere API calls later

export interface AIAnalysis {
  buildingId: string
  buildingName: string
  shortName: string
  busyLevel: number
  status: "busy" | "not-busy"
  lastUpdated: string
  metrics: {
    predictedBusiness: string
    peopleCount: number
    avgWaitTime: string
    peakHours: string
    comparedToYesterday: string
    nextHourPrediction: string
    bestTimeToGo: string
    worstTimeToGo: string
  }
}

export interface HistoricalData {
  building_id: string
  current_occupancy: number
  created_at: string
}

// Get historical data from the last 24 hours for a building
async function getHistoricalData(buildingId: string): Promise<number[]> {
  try {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data, error } = await supabase
      .from('building_occupancy')
      .select('current_occupancy, created_at')
      .eq('building_id', buildingId)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching historical data:', error)
      // Return simulated data if database query fails
      return Array.from({ length: 288 }, () => Math.floor(Math.random() * 150) + 50)
    }

    if (!data || data.length === 0) {
      // Return simulated data if no historical data exists
      return Array.from({ length: 288 }, () => Math.floor(Math.random() * 150) + 50)
    }

    // Convert to 5-minute intervals (288 intervals for 24 hours)
    const intervals: number[] = []
    const intervalDuration = 5 * 60 * 1000 // 5 minutes in milliseconds

    for (let i = 0; i < 288; i++) {
      const intervalStart = new Date(twentyFourHoursAgo.getTime() + i * intervalDuration)
      const intervalEnd = new Date(intervalStart.getTime() + intervalDuration)

      // Find data points within this interval
      const intervalData = data.filter(record => {
        const recordTime = new Date(record.created_at)
        return recordTime >= intervalStart && recordTime < intervalEnd
      })

      if (intervalData.length > 0) {
        // Use average if multiple data points in interval
        const average = intervalData.reduce((sum, record) => sum + record.current_occupancy, 0) / intervalData.length
        intervals.push(Math.round(average))
      } else {
        // Use previous value or interpolate
        const lastValue = intervals[intervals.length - 1] || 100
        intervals.push(lastValue + Math.floor(Math.random() * 21) - 10) // Small variation
      }
    }

    return intervals
  } catch (error) {
    console.error('Error in getHistoricalData:', error)
    // Return simulated data as fallback
    return Array.from({ length: 288 }, () => Math.floor(Math.random() * 150) + 50)
  }
}

// Mock AI analysis function (replace with real Cohere API later)
function mockAIAnalysis(historicalData: number[], buildingName: string): any {
  const currentHour = new Date().getHours()
  const avgOccupancy = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length
  const currentOccupancy = historicalData[historicalData.length - 1] || avgOccupancy
  
  // Simple trend analysis
  const recentData = historicalData.slice(-12) // Last hour (12 * 5min intervals)
  const earlierData = historicalData.slice(-24, -12) // Previous hour
  
  const recentAvg = recentData.reduce((sum, val) => sum + val, 0) / recentData.length
  const earlierAvg = earlierData.reduce((sum, val) => sum + val, 0) / earlierData.length
  
  const trend = recentAvg > earlierAvg ? "increasing" : "decreasing"
  const comparedToYesterday = Math.random() > 0.5 ? "More busy" : "Less busy"
  
  // Predict next hour based on current time and trend
  let nextHourPrediction = "Expected to remain stable"
  if (currentHour >= 11 && currentHour <= 14) {
    nextHourPrediction = "Expected to get more busy"
  } else if (currentHour >= 17 || currentHour <= 8) {
    nextHourPrediction = "Expected to get less busy"
  }
  
  // Determine business level
  let predictedBusiness = "Moderate"
  if (currentOccupancy > avgOccupancy * 1.3) predictedBusiness = "Very High"
  else if (currentOccupancy > avgOccupancy * 1.1) predictedBusiness = "High"
  else if (currentOccupancy < avgOccupancy * 0.7) predictedBusiness = "Low"
  else if (currentOccupancy < avgOccupancy * 0.5) predictedBusiness = "Very Low"
  
  // Generate recommendations
  const bestTimeHour = currentHour < 10 ? currentHour + 2 : (currentHour > 16 ? 20 : 15)
  const worstTimeHour = currentHour >= 11 && currentHour <= 14 ? 13 : 12
  
  return {
    comparedToYesterday,
    nextHourPrediction,
    bestTimeToGo: `Best time to go at ${bestTimeHour}:00`,
    worstTimeToGo: `Worst time to go at ${worstTimeHour}:00`,
    predictedBusiness,
    avgWaitTime: predictedBusiness === "Very High" ? "5-8 min" : predictedBusiness === "High" ? "3-5 min" : "1-3 min",
    peakHours: "12:00 PM - 2:00 PM"
  }
}

// Analyze building data using mock AI (replace with Cohere later)
async function analyzeBuilding(buildingId: string, buildingName: string, shortName: string): Promise<AIAnalysis> {
  try {
    const historicalData = await getHistoricalData(buildingId)
    
    // Use mock AI analysis for now
    const aiResponse = mockAIAnalysis(historicalData, buildingName)

    // Calculate current metrics
    const currentOccupancy = historicalData[historicalData.length - 1] || 100
    const maxCapacity = getMaxCapacity(buildingId)
    const busyLevel = Math.round((currentOccupancy / maxCapacity) * 100)

    return {
      buildingId,
      buildingName,
      shortName,
      busyLevel,
      status: busyLevel > 50 ? "busy" : "not-busy",
      lastUpdated: new Date().toISOString(),
      metrics: {
        predictedBusiness: aiResponse.predictedBusiness || "Moderate",
        peopleCount: currentOccupancy,
        avgWaitTime: aiResponse.avgWaitTime || "2-4 min",
        peakHours: aiResponse.peakHours || "12:00 PM - 2:00 PM",
        comparedToYesterday: aiResponse.comparedToYesterday || "Similar to yesterday",
        nextHourPrediction: aiResponse.nextHourPrediction || "Expected to remain stable",
        bestTimeToGo: aiResponse.bestTimeToGo || "Best time to go in 2 hours",
        worstTimeToGo: aiResponse.worstTimeToGo || "Worst time to go in 30 minutes",
      }
    }
  } catch (error) {
    console.error('Error analyzing building:', error)
    
    // Return fallback data
    return {
      buildingId,
      buildingName,
      shortName,
      busyLevel: 50,
      status: "not-busy",
      lastUpdated: new Date().toISOString(),
      metrics: {
        predictedBusiness: "Moderate",
        peopleCount: 100,
        avgWaitTime: "2-4 min",
        peakHours: "12:00 PM - 2:00 PM",
        comparedToYesterday: "Similar to yesterday",
        nextHourPrediction: "Expected to remain stable",
        bestTimeToGo: "Best time to go in 2 hours",
        worstTimeToGo: "Worst time to go in 30 minutes",
      }
    }
  }
}

// Get max capacity for a building (you can expand this based on your building data)
function getMaxCapacity(buildingId: string): number {
  const capacities: Record<string, number> = {
    'pac': 800,
    'cmh': 400,
    'dc': 400,
    'e7': 400,
    'mc': 600,
    'slc': 1200,
    'e2': 500,
    'e3': 350,
    'e5': 450,
  }
  return capacities[buildingId] || 300
}

// Analyze all buildings
export async function analyzeAllBuildings(): Promise<AIAnalysis[]> {
  const buildings = [
    { id: 'pac', name: 'Physical Activities Complex', shortName: 'PAC' },
    { id: 'cmh', name: 'Claudette Millar Hall', shortName: 'CMH' },
    { id: 'dc', name: 'Davis Center', shortName: 'DC' },
    { id: 'e7', name: 'Engineering 7', shortName: 'E7' },
    { id: 'mc', name: 'Mathematics & Computer Building', shortName: 'MC' },
  ]

  const analyses = await Promise.all(
    buildings.map(building => 
      analyzeBuilding(building.id, building.name, building.shortName)
    )
  )

  return analyses
}

// Cache for AI analyses
let cachedAnalyses: AIAnalysis[] = []
let lastAnalysisTime = 0
const CACHE_DURATION = 20 * 60 * 1000 // 20 minutes

export async function getCachedAnalyses(): Promise<AIAnalysis[]> {
  const now = Date.now()
  
  if (now - lastAnalysisTime > CACHE_DURATION || cachedAnalyses.length === 0) {
    console.log('Refreshing AI analyses...')
    cachedAnalyses = await analyzeAllBuildings()
    lastAnalysisTime = now
  }
  
  return cachedAnalyses
}