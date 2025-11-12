// Flush Environmental Data Only
// Run this in browser console to specifically clear environmental entries

console.log('🌡️ Flushing Environmental Data...');

// Specifically target environmental data
const environmentalKeys = [
  'hydroponicHistoricalData',  // Main environmental data storage
  'hydroponicManualValues',    // Manual override values
  'hydroponicManualMode'       // Manual mode settings
];

let clearedCount = 0;

environmentalKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data !== null) {
    console.log(`🗑️ Clearing ${key}:`, JSON.parse(data).length || 'N/A', 'entries');
    localStorage.removeItem(key);
    clearedCount++;
  } else {
    console.log(`ℹ️ ${key}: No data found`);
  }
});

// Also check for any environment-related keys
const allKeys = Object.keys(localStorage);
const additionalEnvKeys = allKeys.filter(key =>
  key.includes('environmental') ||
  key.includes('temperature') ||
  key.includes('humidity') ||
  key.includes('light') ||
  key.startsWith('env') ||
  key.includes('Historical')
);

if (additionalEnvKeys.length > 0) {
  console.log('🔍 Found additional environmental keys:', additionalEnvKeys);
  additionalEnvKeys.forEach(key => {
    if (!environmentalKeys.includes(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Cleared additional: ${key}`);
      clearedCount++;
    }
  });
}

console.log(`✅ Environmental data flush complete!`);
console.log(`📊 Total environmental keys cleared: ${clearedCount}`);
console.log(`🔄 Refresh the page to see empty environmental data.`);
console.log(`🕐 Auto-save will start adding entries every 5 minutes.`);

// Force page reload to clear any cached state
setTimeout(() => {
  console.log('🔄 Auto-refreshing page...');
  location.reload();
}, 1000);