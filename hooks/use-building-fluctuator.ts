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
    "CMH": 0.0769,
    "PAC": 2,
    "DC": 0.08,
    "E7": 1,
    "Dana_Porter": 2
  },
  buildingCapacity: {
    "CMH": 650,
    "PAC": 200,
    "DC": 1500,
    "E7": 2000,
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

    console.log('[Fluctuator] Available API buildings:', realData.map(b => ({ id: b.id, shortName: b.shortName, people: b.currentOccupancy })));

    realData.forEach(building => {
      // Map API building IDs to fluctuator keys - only include the 5 buildings we want
      let key = null;
      if (building.id === 'cmh') key = 'CMH';
      else if (building.id === 'pac') key = 'PAC';
      else if (building.id === 'dc') key = 'DC';
      else if (building.id === 'e7') key = 'E7';
      else if (building.id === 'slc') key = 'Dana_Porter'; // Map SLC to Dana_Porter

      if (key) {
        // Apply multiplication factors
        let people = building.currentOccupancy;
        let capacity = building.maxCapacity;
        let multiplierNote = '';
        
        if (key === 'CMH') {
          people = Math.round(building.currentOccupancy * 3.5);
          multiplierNote = ' (x3.5 multiplier)';
        } else if (key === 'E7') {
          people = Math.round(building.currentOccupancy * 4);
          capacity = 2000; // Override E7 capacity
          multiplierNote = ' (x4 multiplier, 2000 capacity)';
        }
        
        baseData[key] = {
          people: people,
          capacity: capacity
        };

        console.log(`[Fluctuator] Mapped ${building.id} (${building.shortName}) -> ${key}: ${people} people${multiplierNote}`);
      }
    });

    console.log('[Fluctuator] Final base data:', baseData);
    return baseData;
  };

  // Calculate base data (real data + fallback)
  const calculateBaseData = () => {
    const apiBaseData = getBaseDataFromAPI();
    const baseData: Record<string, { people: number; capacity: number }> = {};

    console.log('[Fluctuator] API base data available:', Object.keys(apiBaseData));
    console.log('[Fluctuator] Fallback config keys:', Object.keys(fallbackConfig.rawCount));

    // Use real data where available, fallback data otherwise
    Object.keys(fallbackConfig.rawCount).forEach(buildingKey => {
      if (apiBaseData[buildingKey]) {
        // Use real API data
        baseData[buildingKey] = apiBaseData[buildingKey];
        console.log(`[Fluctuator] Using API data for ${buildingKey}: ${apiBaseData[buildingKey].people} people`);
      } else {
        // Use fallback data with adjustment factor
        const raw = fallbackConfig.rawCount[buildingKey];
        const fac = fallbackConfig.adjustmentFac[buildingKey] || 1;
        const fallbackPeople = raw / fac;
        baseData[buildingKey] = {
          people: fallbackPeople,
          capacity: fallbackConfig.buildingCapacity[buildingKey]
        };
        console.log(`[Fluctuator] Using fallback data for ${buildingKey}: ${fallbackPeople} people (${raw}/${fac})`);
      }
    });

    console.log('[Fluctuator] Final calculated base data:', baseData);
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
    baseData: Record<string, { people: number; capacity: number }>
  ): BuildingData => {
    const buildingBase = baseData[buildingName];
    if (!buildingBase) return { people: 0, percent_full: 0 };

    const basePeople = buildingBase.people;
    
    let noisyPeople;
    if (buildingName === 'CMH') {
      // For CMH, use absolute fluctuation of ±1-2 people instead of percentage
      const absoluteVariation = Math.floor(Math.random() * 4) - 2; // -2 to +2 people
      noisyPeople = Math.max(0, Math.min(buildingBase.capacity, basePeople + absoluteVariation));
    } else if (buildingName === 'E7') {
      // For E7, use absolute fluctuation of ±2-3 people instead of percentage
      const absoluteVariation = Math.floor(Math.random() * 6) - 3; // -3 to +3 people
      noisyPeople = Math.max(0, Math.min(buildingBase.capacity, basePeople + absoluteVariation));
    } else {
      // For other buildings, use percentage-based fluctuation
      const randomPercent = (Math.random() - 0.5) * 0.01; // -0.005 to +0.005
      noisyPeople = Math.max(
        0,
        Math.min(
          buildingBase.capacity,
          Math.round(basePeople * (1 + randomPercent))
        )
      );
    }
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
      // Random interval between 8-15 seconds for subtle updates
      const minInterval = 8000;
      const maxInterval = 15000;

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

        // Start with a shorter random initial delay to stagger the buildings
        const initialDelay = Math.random() * 2000; // 0-2 seconds
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