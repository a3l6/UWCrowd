import { useState, useEffect, useRef } from 'react';
import { saveFluctuatorData } from '@/lib/fluctuator-utils';

interface BuildingData {
  people: number;
  percent_full: number;
}

interface BuildingDisplay {
  [buildingName: string]: BuildingData;
}

interface BuildingConfig {
  rawCount: Record<string, number>;
  adjustmentFac: Record<string, number>;
  buildingCapacity: Record<string, number>;
}

const defaultConfig: BuildingConfig = {
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

export function useBuildingFluctuator(config: BuildingConfig = defaultConfig) {
  const [buildingData, setBuildingData] = useState<BuildingDisplay>({});
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Calculate corrected count from raw count and adjustment factors
  const calculateCorrectedCount = (config: BuildingConfig) => {
    const correctedCount: Record<string, number> = {};
    Object.entries(config.rawCount).forEach(([building, raw]) => {
      const fac = config.adjustmentFac[building] || 1;
      correctedCount[building] = raw / fac;
    });
    return correctedCount;
  };

  // Initialize building data
  useEffect(() => {
    const correctedCount = calculateCorrectedCount(config);
    
    const initialDisplay: BuildingDisplay = {};
    Object.entries(correctedCount).forEach(([building, corrected]) => {
      const capacity = config.buildingCapacity[building] || 1;
      const people = Math.max(0, Math.round(corrected));
      const percentFull = Math.round((people / capacity) * 100 * 10) / 10; // Round to 1 decimal
      
      initialDisplay[building] = {
        people,
        percent_full: percentFull
      };
    });
    
    setBuildingData(initialDisplay);
  }, [config]);

  // Fluctuation function for a single building
  const fluctuateBuilding = (
    buildingName: string, 
    correctedCount: Record<string, number>,
    noisePct: number = 0.05
  ): BuildingData => {
    const basePeople = correctedCount[buildingName] || 0;
    const basePeopleInt = Math.max(0, Math.round(basePeople));
    const noise = Math.max(1, Math.round(Math.abs(basePeople) * noisePct));
    
    // Generate random noise between -noise and +noise
    const randomNoise = Math.floor(Math.random() * (2 * noise + 1)) - noise;
    const noisyPeople = Math.max(0, basePeopleInt + randomNoise);
    
    const capacity = config.buildingCapacity[buildingName];
    const percentFull = capacity && capacity > 0 
      ? Math.round((noisyPeople / capacity) * 100 * 10) / 10 
      : 0.0;
    
    return {
      people: noisyPeople,
      percent_full: percentFull
    };
  };

  // Start independent fluctuation for each building
  useEffect(() => {
    const correctedCount = calculateCorrectedCount(config);
    
    // Clear any existing intervals
    Object.values(intervalRefs.current).forEach(interval => clearInterval(interval));
    intervalRefs.current = {};
    
    // Start a separate interval for each building with random timing
    Object.keys(correctedCount).forEach(buildingName => {
      // Random interval between 800ms and 2200ms (like Python's 10-30 seconds but faster)
      const minInterval = 800;
      const maxInterval = 2200;
      
      const startBuildingFluctuation = () => {
        const fluctuateOnce = () => {
          setBuildingData(prevData => {
            const newData = { ...prevData };
            newData[buildingName] = fluctuateBuilding(buildingName, correctedCount);
            
            // Save to localStorage (equivalent to Python's JSON file write)
            saveFluctuatorData(newData);
            
            return newData;
          });
          
          // Schedule next fluctuation with random timing
          const nextInterval = Math.random() * (maxInterval - minInterval) + minInterval;
          intervalRefs.current[buildingName] = setTimeout(fluctuateOnce, nextInterval);
        };
        
        // Start with a random initial delay to stagger the buildings
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
  }, [config]);

  // Get non-fluctuated raw percentages (for AI analysis)
  const getRawPercentages = () => {
    const correctedCount = calculateCorrectedCount(config);
    const percentFullRaw: Record<string, number> = {};
    
    Object.entries(correctedCount).forEach(([building, corrected]) => {
      const capacity = config.buildingCapacity[building] || 1;
      percentFullRaw[building] = Math.round((corrected / capacity) * 100 * 10) / 10;
    });
    
    return percentFullRaw;
  };

  return {
    buildingData,
    rawPercentages: getRawPercentages(),
    correctedCount: calculateCorrectedCount(config)
  };
}