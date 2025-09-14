import { supabase, type BuildingOccupancy } from './supabase'

export interface BuildingData {
  id: string
  name: string
  shortName: string
  currentOccupancy: number
  maxCapacity: number
  occupancyPercentage: number
  coordinates: [number, number]
}

export interface OrganizedData {
  buildings: BuildingData[]
  lastUpdated: Date
}

class InformationHandler {
  private data: OrganizedData = {
    buildings: [],
    lastUpdated: new Date(),
  }

  private updateInterval: NodeJS.Timeout | null = null
  private saveInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeWithSampleData()
    this.startPeriodicUpdate()
    this.startPeriodicSave()
    this.loadFromDatabase()
  }

  // Initialize with sample data for immediate functionality
  private initializeWithSampleData(): void {
    const sampleBuildings: BuildingData[] = [
      {
        id: "cmh",
        name: "Claudette Millar Hall",
        shortName: "CMH",
        currentOccupancy: 180,
        maxCapacity: 650,
        occupancyPercentage: 28,
        coordinates: [43.4720, -80.5440],
      },
      {
        id: "pac",
        name: "Physical Activities Complex",
        shortName: "PAC",
        currentOccupancy: 80,
        maxCapacity: 200,
        occupancyPercentage: 40,
        coordinates: [43.4742, -80.546],
      },
      {
        id: "dc",
        name: "William G. Davis Computer Research Centre",
        shortName: "DC",
        currentOccupancy: 320,
        maxCapacity: 1500,
        occupancyPercentage: 21,
        coordinates: [43.4728, -80.542],
      },
      {
        id: "e7",
        name: "Engineering 7",
        shortName: "E7",
        currentOccupancy: 280,
        maxCapacity: 2000,
        occupancyPercentage: 14,
        coordinates: [43.4695, -80.5359],
      },
      {
        id: "slc",
        name: "Dana Porter Library",
        shortName: "SLC",
        currentOccupancy: 250,
        maxCapacity: 400,
        occupancyPercentage: 63,
        coordinates: [43.4706, -80.537],
      },
    ]

    this.data.buildings = sampleBuildings
    this.data.lastUpdated = new Date()
  }

  // Process incoming data and update building information
  processInformation(buildingDataArray: BuildingData[]): void {
    console.log("[v0] Processing building information:", buildingDataArray)

    buildingDataArray.forEach((newBuilding) => {
      const existingIndex = this.data.buildings.findIndex(b => b.id === newBuilding.id)

      if (existingIndex >= 0) {
        // Update existing building
        this.data.buildings[existingIndex] = {
          ...this.data.buildings[existingIndex],
          currentOccupancy: newBuilding.currentOccupancy,
          occupancyPercentage: newBuilding.occupancyPercentage,
        }
      } else {
        // Add new building
        this.data.buildings.push(newBuilding)
      }
    })

    this.data.lastUpdated = new Date()
    console.log("[v0] Data updated:", this.data)
  }

  // Get current organized data
  getOrganizedData(): OrganizedData {
    return { ...this.data }
  }

  // Get all buildings data
  getAllBuildings(): BuildingData[] {
    return [...this.data.buildings]
  }

  // Get specific building data
  getBuildingData(buildingId: string): BuildingData | null {
    return this.data.buildings.find(b => b.id === buildingId) || null
  }

  // Load data from Supabase database
  async loadFromDatabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('building_occupancy')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
          console.log('[v0] Database table not found - using sample data. Please set up the database tables.')
          return
        }
        console.error('[v0] Error loading from database:', error)
        return
      }

      if (data && data.length > 0) {
        // Get the latest record for each building
        const latestBuildings = new Map<string, BuildingOccupancy>()

        data.forEach((record: BuildingOccupancy) => {
          if (!latestBuildings.has(record.building_id) ||
            new Date(record.updated_at!) > new Date(latestBuildings.get(record.building_id)!.updated_at!)) {
            latestBuildings.set(record.building_id, record)
          }
        })

        this.data.buildings = Array.from(latestBuildings.values()).map(record => ({
          id: record.building_id,
          name: record.building_name,
          shortName: record.short_name,
          currentOccupancy: record.current_occupancy,
          maxCapacity: record.max_capacity,
          occupancyPercentage: record.occupancy_percentage,
          coordinates: record.coordinates,
        }))

        this.data.lastUpdated = new Date()
        console.log('[v0] Loaded data from database:', this.data.buildings.length, 'buildings')
      }
    } catch (error) {
      console.error('[v0] Error loading from database:', error)
    }
  }

  // Save data to Supabase database (called every 20 minutes)
  private async saveToDatabase(): Promise<void> {
    console.log("[v0] Saving data to database at:", new Date().toISOString())

    try {
      const buildingRecords: Omit<BuildingOccupancy, 'id' | 'created_at' | 'updated_at'>[] =
        this.data.buildings.map(building => ({
          building_id: building.id,
          building_name: building.name,
          short_name: building.shortName,
          current_occupancy: building.currentOccupancy,
          max_capacity: building.maxCapacity,
          occupancy_percentage: building.occupancyPercentage,
          coordinates: building.coordinates,
        }))

      const { error } = await supabase
        .from('building_occupancy')
        .insert(buildingRecords)

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
          console.log('[v0] Database table not found - skipping save. Please set up the database tables.')
          return
        }
        console.error('[v0] Error saving to database:', error)
        return
      }

      console.log(`[v0] Successfully saved ${buildingRecords.length} building records to database`)

      // Emit event for UI updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("dataOrganized", {
            detail: this.getOrganizedData(),
          }),
        )
      }
    } catch (error) {
      console.error('[v0] Error saving to database:', error)
    }
  }

  // Start periodic UI updates every 1 second
  private startPeriodicUpdate(): void {
    // Clear existing interval if any
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    // Set up 1-second interval for UI updates
    this.updateInterval = setInterval(() => {
      // Simulate small occupancy changes for real-time feel
      this.simulateOccupancyChanges()
    }, 1000)

    console.log("[v0] Started periodic UI updates every 1 second")
  }

  // Start periodic database saves every 20 minutes
  private startPeriodicSave(): void {
    // Clear existing interval if any
    if (this.saveInterval) {
      clearInterval(this.saveInterval)
    }

    // Set up 20-minute interval (20 * 60 * 1000 ms) for database saves
    this.saveInterval = setInterval(() => {
      this.saveToDatabase()
    }, 20 * 60 * 1000)

    console.log("[v0] Started periodic database saves every 20 minutes")
  }

  // Simulate small occupancy changes for real-time updates
  private simulateOccupancyChanges(): void {
    this.data.buildings.forEach(building => {
      // Small random variation (-5 to +5 people)
      const variation = Math.floor(Math.random() * 11) - 5
      const newOccupancy = Math.max(0, Math.min(building.maxCapacity, building.currentOccupancy + variation))

      building.currentOccupancy = newOccupancy
      building.occupancyPercentage = Math.round((newOccupancy / building.maxCapacity) * 100)
    })

    this.data.lastUpdated = new Date()

    // Emit event for UI updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("buildingDataUpdated", {
          detail: this.getOrganizedData(),
        }),
      )
    }
  }

  // Stop periodic updates
  stopPeriodicUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log("[v0] Stopped periodic UI updates")
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval)
      this.saveInterval = null
      console.log("[v0] Stopped periodic database saves")
    }
  }

  // Manual trigger for database save
  triggerDatabaseSave(): void {
    this.saveToDatabase()
  }
}

// Create singleton instance
export const informationHandler = new InformationHandler()

// Helper function to parse data from various formats
export function parseInformationData(rawData: string | object[]): BuildingData[] {
  console.log("[v0] Parsing information data:", rawData)

  try {
    let dataArray: any[]

    if (typeof rawData === "string") {
      // Try to parse as JSON
      dataArray = JSON.parse(rawData)
    } else if (Array.isArray(rawData)) {
      dataArray = rawData
    } else {
      throw new Error("Invalid data format")
    }

    return dataArray
      .filter(
        (item) =>
          item &&
          typeof item === "object" &&
          "id" in item &&
          "name" in item &&
          "currentOccupancy" in item &&
          "maxCapacity" in item &&
          typeof item.currentOccupancy === "number" &&
          typeof item.maxCapacity === "number",
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
        shortName: item.shortName || item.id.toUpperCase(),
        currentOccupancy: item.currentOccupancy,
        maxCapacity: item.maxCapacity,
        occupancyPercentage: Math.round((item.currentOccupancy / item.maxCapacity) * 100),
        coordinates: item.coordinates || [43.4723, -80.5449], // Default to UW coordinates
      }))
  } catch (error) {
    console.error("[v0] Error parsing information data:", error)
    return []
  }
}
