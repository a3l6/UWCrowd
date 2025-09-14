import { useState, useEffect, useRef } from 'react';
import { saveFluctuatorData } from '@/lib/fluctuator-utils';

interface BuildingData {
  people: number;
  percent_full: number;
}

interface BuildingDisplay {
  [buildingName: string]: BuildingData;
}

interface APIBuildingData {
  id: string;
  name: string;
  shortName: string;
  currentOccupancy: number;
  maxCapacity: number;
  occupancyPercentage: number;
  coordinates: [number, number];
}

interface BuildingConfig {
  rawCount: Record<string, number>;
  adjustmentFac: Record<string, number>;
  buildingCapacity: Record<string, number>;
}

// Fallback config if API data is not available
const fallbackConfig: BuildingConfig = {
  rawCount: {
    "CMH": 150,
    "PAC": 120,
    "DC": 85,
    "E7": 40,
    "Dana_Porter": 200
  },
  adjustmentFac: {
    "CMH": 3,
    "PAC": 2,
    "DC": 3,
    "E7": 4,
    "Dana_Porter": 3
  },
  buildingCapacity: {
    "CMH": 600,
    "PAC": 200,
    "DC": 1500,
    "E7": 1550,
    "Dana_Porter": 400
  }
};

export function useBuildingFluctuator() {
  const [buildingData, setBuildingData] = useState<BuildingDisplay>({});
  const [realData, setRealData] = useState<APIBuildingData[]>([]);
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch real data from API
  const fetchRealData = async () => {
    try {
      const response = await fetch('/api/information');
      const data = await response.json();
      
      if (data.buildings && Array.isArray(data.buildings)) {
        setRealData(data.buildings);
        console.log('[Fluctuator] Updated real data:', data.buildings.length, 'buildings');
      }
    } catch (error) {
      console.error('[Fluctuator] Error fetching real data:', error);
    }
  };

  // Convert API data to base fluctuation data
  const getBaseDataFromAPI = (): Record<string, { people: number; capacity: number }> => {
    const baseData: Record<string, { people: number; capacity: number }> = {};
    
    realData.forEach(building => {
      // Map API building IDs to fluctuator keys
      let key = building.shortName;
      if (building.id === 'mc') key = 'CMH';
      else if (building.id === 'dc') key = 'DC';
      else if (building.id === 'pac') key = 'PAC';
      else if (building.id === 'e7') key = 'E7';
      else if (building.shortName === 'SLC') key = 'Dana_Porter'; // Map SLC to Dana_Porter for now
      
      baseData[key] = {
        people: building.currentOccupancy,
        capacity: building.maxCapacity
      };
    });
    
    return baseData;
  };

  // Calculate base data (real data + fallback)
  const calculateBaseData = () => {
    const apiBaseData = getBaseDataFromAPI();
    const baseData: Record<string, { people: number; capacity: number }> = {};
    
    // Use real data where available, fallback data otherwise
    Object.keys(fallbackConfig.rawCount).forEach(buildingKey => {
      if (apiBaseData[buildingKey]) {
        // Use real API data
        baseData[buildingKey] = apiBaseData[buildingKey];
      } else {
        // Use fallback data with adjustment factor
        const raw = fallbackConfig.rawCount[buildingKey];
        const fac = fallbackConfig.adjustmentFac[buildingKey] || 1;
        baseData[buildingKey] = {
          people: raw / fac,
          capacity: fallbackConfig.buildingCapacity[buildingKey]
        };
      }
    });
    
    return baseData;
  };

  // Fetch real data on mount and set up periodic fetching
  useEffect(() => {
    // Initial fetch
    fetchRealData();
    
    // Set up periodic fetching every 30 seconds to get updated real data
    fetchIntervalRef.current = setInterval(fetchRealData, 240000);
    
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, []);

  // Initialize building data when real data changes
  useEffect(() => {
    const baseData = calculateBaseData();
    
    const initialDisplay: BuildingDisplay = {};
    Object.entries(baseData).forEach(([building, data]) => {
      const people = Math.max(0, Math.round(data.people));
      const percentFull = Math.round((people / data.capacity) * 100 * 10) / 10; // Round to 1 decimal
      
      initialDisplay[building] = {
        people,
        percent_full: percentFull
      };
    });
    
    setBuildingData(initialDisplay);
  }, [realData]);

  // Fluctuation function for a single building using real data as base
  const fluctuateBuilding = (
    buildingName: string, 
    baseData: Record<string, { people: number; capacity: number }>,
    noisePct: number = 0.002
  ): BuildingData => {
    const buildingBase = baseData[buildingName];
    if (!buildingBase) return { people: 0, percent_full: 0 };
    
    const basePeople = buildingBase.people;
      // Random percent between -0.5% and +0.5%
    const randomPercent = (Math.random() - 0.5) * 0.0001; // -0.005 to +0.005

    // Apply it to the base number
    const noisyPeople = Math.max(
      0,
      Math.min(
        buildingBase.capacity,
        Math.round(basePeople * (1 + randomPercent))
      )
    );
    const percentFull = buildingBase.capacity > 0 
      ? Math.round((noisyPeople / buildingBase.capacity) * 100 * 10) / 10 
      : 0.0;
    
    return {
      people: noisyPeople,
      percent_full: percentFull
    };
  };

  // Start independent fluctuation for each building using real data as base
  useEffect(() => {
    const baseData = calculateBaseData();
    
    // Clear any existing intervals
    Object.values(intervalRefs.current).forEach(interval => clearTimeout(interval));
    intervalRefs.current = {};
    
    // Start a separate interval for each building with random timing
    Object.keys(baseData).forEach(buildingName => {
      // Random interval between 800ms and 2200ms (like Python's 10-30 seconds but faster)
      const minInterval = 60000;
      const maxInterval = 120000;
      
      const startBuildingFluctuation = () => {
        const fluctuateOnce = () => {
        setBuildingData(prevData => {
          const currentBaseData = calculateBaseData(); // full fresh data
          const newData = { ...prevData };

          // Pass the full base data object, not just the single building
          newData[buildingName] = fluctuateBuilding(buildingName, currentBaseData);

          saveFluctuatorData(newData); // persist
          return newData;
        });

          
          // Schedule next fluctuation with random timing
          const nextInterval = Math.random() * (maxInterval - minInterval) + minInterval;
          intervalRefs.current[buildingName] = setTimeout(fluctuateOnce, nextInterval);
        };
        
        // Start with a random initial delay to stagger the buildings
        const initialDelay = Math.random() * 60000; // 0-2 seconds
        intervalRefs.current[buildingName] = setTimeout(fluctuateOnce, initialDelay);
      };
      
      startBuildingFluctuation();
    });

    return () => {
      // Cleanup all intervals
      Object.values(intervalRefs.current).forEach(interval => clearTimeout(interval));
      intervalRefs.current = {};
    };
  }, [realData]); // Restart fluctuations when real data changes

  // Get non-fluctuated raw percentages (for AI analysis)
  const getRawPercentages = () => {
    const baseData = calculateBaseData();
    const percentFullRaw: Record<string, number> = {};
    
    Object.entries(baseData).forEach(([building, data]) => {
      percentFullRaw[building] = Math.round((data.people / data.capacity) * 100 * 10) / 10;
    });
    
    return percentFullRaw;
  };

  return {
    buildingData,
    rawPercentages: getRawPercentages(),
    correctedCount: Object.fromEntries(
      Object.entries(calculateBaseData()).map(([key, data]) => [key, data.people])
    ),
    realData // Expose real data for debugging
  };
}