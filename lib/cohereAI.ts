// Real Cohere AI integration - use this when you want to enable actual AI analysis
// To use this, replace the import in your API route from './cohereAI' to './cohereAI-real'

import { supabase } from './supabase'


// You'll need to install and configure cohere-ai properly
// npm install cohere-ai@latest

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

// Real Cohere implementation
async function callCohereAPI(prompt: string): Promise<any> {
  try {
    // Using fetch to call Cohere API directly
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.3,
        stop_sequences: [],
      }),
    })

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`)
    }

    const data = await response.json()
    return data.generations[0].text
  } catch (error) {
    console.error('Cohere API error:', error)
    throw error
  }
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

    if (error || !data || data.length === 0) {
      // Return simulated data if database query fails or no data
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
        const average = intervalData.reduce((sum, record) => sum + record.current_occupancy, 0) / intervalData.length
        intervals.push(Math.round(average))
      } else {
        const lastValue = intervals[intervals.length - 1] || 100
        intervals.push(lastValue + Math.floor(Math.random() * 21) - 10)
      }
    }

    return intervals
  } catch (error) {
    console.error('Error in getHistoricalData:', error)
    return Array.from({ length: 288 }, () => Math.floor(Math.random() * 150) + 50)
  }
}

// Analyze building data using real Cohere AI
async function analyzeBuilding(buildingId: string, buildingName: string, shortName: string): Promise<AIAnalysis> {
  try {
    const historicalData = await getHistoricalData(buildingId)
    const dataString = historicalData.join(', ')

    const prompt = `
Here is the historical occupancy data for ${buildingName} (${shortName}) today in 5-minute intervals: [${dataString}].
The data represents the number of people in the building over the last 24 hours.

Analyze the data and provide a JSON response with the following structure:
{
  "comparedToYesterday": "More busy" or "Less busy",
  "nextHourPrediction": "Expected to get more busy" or "Expected to get less busy",
  "bestTimeToGo": "Best time to go in X minutes/hours",
  "worstTimeToGo": "Worst time to go in X minutes/hours",
  "predictedBusiness": "Very High", "High", "Moderate", "Low", or "Very Low",
  "avgWaitTime": "X-Y min",
  "peakHours": "X:XX AM/PM - Y:XX AM/PM"
}

Base your analysis on the trends in the data. Consider the current time and provide realistic recommendations.
Respond only with valid JSON, no additional text.
`

    const aiResponseText = await callCohereAPI(prompt)
    
    let aiResponse
    try {
      aiResponse = JSON.parse(aiResponseText)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      // Fallback response
      aiResponse = {
        comparedToYesterday: "Similar to yesterday",
        nextHourPrediction: "Expected to remain stable",
        bestTimeToGo: "Best time to go in 2 hours",
        worstTimeToGo: "Worst time to go in 30 minutes",
        predictedBusiness: "Moderate",
        avgWaitTime: "2-4 min",
        peakHours: "12:00 PM - 2:00 PM"
      }
    }

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

