// Clear All Website Data Script
// Run this in the browser console to flush all entries and data

console.log('🧹 Starting data cleanup...');

// List of all localStorage keys used by the application
const keysToRemove = [
  // Main dashboard entries (ENVIRONMENTAL DATA)
  'hydroponicHistoricalData',           // Environmental data (temperature, humidity, light)
  'hydroponicHydroHistoricalData',      // Hydroponic parameters data

  // Rose plant data
  'rosePlantParameters',
  'rosePlantHistoricalData',
  'rosePlantAutoMode',
  'rosePlantHistoricData',
  'rosePlantHeaderPhotos',
  'rosePlantStemPhotos',
  'rosePlantStemAHistory',
  'rosePlantStemBHistory',
  'rosePlantStemCHistory',
  'rosePlantStemDHistory',
  'roseHydroponicManualMode',
  'roseHydroponicManualValues',
  'roseHydroponicHistoricalData',

  // Hibiscus plant data
  'hibiscusPlantParameters',
  'hibiscusPlantHistoricalData',
  'hibiscusPlantAutoMode',
  'hibiscusPlantHistoricData',
  'hibiscusPlantHeaderPhotos',
  'hibiscusPlantStemPhotos',
  'hibiscusPlantStemAHistory',
  'hibiscusPlantStemBHistory',
  'hibiscusPlantStemCHistory',
  'hibiscusPlantStemDHistory',
  'hibiscusPlantStemEHistory',
  'hibiscusHydroponicManualMode',
  'hibiscusHydroponicManualValues',
  'hibiscusHydroponicHistoricalData',

  // Nutrient and parameter trackers
  'nutrient-entries',
  'environmental-parameters',
  'hydroponic-parameters',

  // Additional tracker keys that might exist
  'ph-parameters',
  'ec-parameters',
  'temperature-parameters',
  'humidity-parameters',
  'light-parameters',
  'water-temp-parameters'
];

let clearedCount = 0;
let foundKeys = [];

// Check what keys actually exist before clearing
keysToRemove.forEach(key => {
  if (localStorage.getItem(key) !== null) {
    foundKeys.push(key);
  }
});

console.log(`📋 Found ${foundKeys.length} keys with data:`);
foundKeys.forEach(key => {
  console.log(`  - ${key}`);
});

// Clear all found keys
foundKeys.forEach(key => {
  localStorage.removeItem(key);
  clearedCount++;
  console.log(`🗑️  Cleared: ${key}`);
});

// Also clear any keys that start with common prefixes
const allKeys = Object.keys(localStorage);
const additionalKeys = allKeys.filter(key =>
  key.startsWith('nutrient-') ||
  key.startsWith('hydroponic-') ||
  key.startsWith('environmental-') ||
  key.startsWith('rosePlant') ||
  key.startsWith('hibiscusPlant') ||
  key.includes('History') ||
  key.includes('Parameters') ||
  key.includes('entries')
);

additionalKeys.forEach(key => {
  if (!foundKeys.includes(key)) {
    localStorage.removeItem(key);
    clearedCount++;
    console.log(`🗑️  Cleared additional: ${key}`);
  }
});

console.log(`✅ Data cleanup complete!`);
console.log(`📊 Total keys cleared: ${clearedCount}`);
console.log(`🔄 Please refresh the page to see the reset data.`);

// Optional: Also clear session storage if any data is stored there
const sessionKeys = Object.keys(sessionStorage);
const relevantSessionKeys = sessionKeys.filter(key =>
  key.includes('plant') || key.includes('hydro') || key.includes('nutrient')
);

if (relevantSessionKeys.length > 0) {
  console.log(`🧹 Also clearing ${relevantSessionKeys.length} session storage keys...`);
  relevantSessionKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️  Cleared session: ${key}`);
  });
}

console.log(`🎉 All data has been flushed! The website will start fresh.`);