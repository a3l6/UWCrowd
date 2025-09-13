// Utility functions for the building fluctuator

export interface FluctuatorData {
  people: number;
  percent_full: number;
}

export interface FluctuatorState {
  [buildingName: string]: FluctuatorData;
}

// Convert fluctuator data to the format expected by the Python JSON output
export function formatFluctuatorData(data: FluctuatorState): string {
  return JSON.stringify(data, null, 2);
}

// Save fluctuator data to localStorage (browser equivalent of writing to JSON file)
export function saveFluctuatorData(data: FluctuatorState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ui_fluctuator_data', formatFluctuatorData(data));
  }
}

// Load fluctuator data from localStorage
export function loadFluctuatorData(): FluctuatorState | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ui_fluctuator_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored fluctuator data:', error);
      }
    }
  }
  return null;
}

// Create a download link for the fluctuator data (equivalent to the Python file write)
export function downloadFluctuatorData(data: FluctuatorState, filename: string = 'ui_fluctuator.json'): void {
  const jsonString = formatFluctuatorData(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}