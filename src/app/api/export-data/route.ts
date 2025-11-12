import { NextResponse } from 'next/server';
import { HistoricalEntry } from '@/types/sensor';

// Access the historical data from the main MQTT API
// In production, you'd use a proper database
declare global {
  var historicalDataMQTT: HistoricalEntry[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const days = parseInt(searchParams.get('days') || '7');
  const includePlantData = searchParams.get('includePlantData') === 'true';
  const nutrientDataParam = searchParams.get('nutrientData');

  let nutrientData: Record<string, { total: number; lastAdded: string }> | null = null;
  if (nutrientDataParam) {
    try {
      nutrientData = JSON.parse(decodeURIComponent(nutrientDataParam));
    } catch (error) {
      console.error('Failed to parse nutrient data:', error);
    }
  }

  try {
    // Get actual historical data from MQTT API
    let actualHistoricalData: HistoricalEntry[] = [];

    // Try to get actual historical data from global variable (shared with mqtt-data API)
    if (global.historicalDataMQTT && global.historicalDataMQTT.length > 0) {
      actualHistoricalData = global.historicalDataMQTT.slice(); // Copy array
    }

    // If we have actual data but need more days, supplement with recent patterns
    let exportData: HistoricalEntry[];
    if (actualHistoricalData.length > 0) {
      exportData = generateHistoricalDataFromActual(actualHistoricalData, days, includePlantData, nutrientData);
    } else {
      // Fallback to mock data if no actual data available
      exportData = generateMockHistoricalData(days, includePlantData, nutrientData);
    }

    if (format === 'csv') {
      const csv = convertToCSV(exportData);

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="onefarmer-data-${days}days.csv"`,
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="onefarmer-data-${days}days.json"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function generateHistoricalDataFromActual(actualData: HistoricalEntry[], days: number, includePlantData = false, nutrientData: Record<string, { total: number; lastAdded: string }> | null = null): HistoricalEntry[] {
  const now = new Date();
  const targetPoints = days * 144; // 144 points per day (every 10 minutes)

  // If we have enough actual data, just filter by date range
  const cutoffTime = now.getTime() - (days * 24 * 60 * 60 * 1000);
  const recentData = actualData.filter(entry =>
    new Date(entry.timestamp).getTime() >= cutoffTime
  );

  // If we have sufficient recent data, return it
  if (recentData.length >= targetPoints * 0.5) {
    return recentData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Otherwise, extend the data using actual patterns
  const result: HistoricalEntry[] = [...recentData];

  // Get the latest actual values for realistic generation
  const latest = actualData[actualData.length - 1] || {
    temperature: null,
    humidity: null,
    light: null,
    ph: null,
    ec: null,
    waterTemp: null
  };

  // Fill in missing time periods with realistic variations
  const intervalMinutes = 10;
  const startTime = cutoffTime;

  for (let i = 0; i < targetPoints; i++) {
    const timestamp = new Date(startTime + (i * intervalMinutes * 60 * 1000));

    // Check if we already have data for this time
    const existingEntry = result.find(entry =>
      Math.abs(new Date(entry.timestamp).getTime() - timestamp.getTime()) < 5 * 60 * 1000 // 5 minute tolerance
    );

    if (!existingEntry) {
      // Generate realistic variations based on actual values
      const entry: HistoricalEntry = {
        timestamp: timestamp.toISOString(),
        temperature: latest.temperature !== null ?
          Number((latest.temperature + (Math.random() - 0.5) * 2).toFixed(1)) : null,
        humidity: latest.humidity !== null ?
          Number((latest.humidity + (Math.random() - 0.5) * 10).toFixed(0)) : null,
        light: latest.light !== null ?
          Math.floor(latest.light + (Math.random() - 0.5) * 5000) : null,
        ph: latest.ph !== null ?
          Number((latest.ph + (Math.random() - 0.5) * 0.3).toFixed(2)) : null,
        ec: latest.ec !== null ?
          Number((latest.ec + (Math.random() - 0.5) * 0.2).toFixed(2)) : null,
        waterTemp: latest.waterTemp !== null ?
          Number((latest.waterTemp + (Math.random() - 0.5) * 1.5).toFixed(1)) : null,
      };

      if (includePlantData) {
        // Add current plant data for today's entries (static for now)
        const isToday = timestamp.toDateString() === new Date().toDateString();
        if (isToday) {
          entry.stemA_height = 19.0;
          entry.stemA_maturedFlowers = 1;
          entry.stemA_openBuds = 1;
          entry.stemA_unopenedBuds = 5;
          entry.stemA_diseases = '';

          entry.stemB_height = 19.0;
          entry.stemB_maturedFlowers = 2;
          entry.stemB_openBuds = 1;
          entry.stemB_unopenedBuds = 3;
          entry.stemB_diseases = '';

          entry.stemC_height = 17.3;
          entry.stemC_maturedFlowers = 2;
          entry.stemC_openBuds = 1;
          entry.stemC_unopenedBuds = 2;
          entry.stemC_diseases = '';

          entry.stemD_height = 18.8;
          entry.stemD_maturedFlowers = 1;
          entry.stemD_openBuds = 1;
          entry.stemD_unopenedBuds = 1;
          entry.stemD_diseases = 'Fungal infection - 2 flowers removed due to high humidity';

          entry.totalMaturedFlowers = 6;
          entry.totalOpenBuds = 4;
          entry.totalUnopenedBuds = 11;
          entry.overallPlantHealth = 'attention';

          // Add nutrient data if provided
          if (nutrientData) {
            entry.masterblend_total = nutrientData.masterblend?.total || 0;
            entry.masterblend_lastAdded = nutrientData.masterblend?.lastAdded || '';
            entry.calciumNitrate_total = nutrientData.calciumNitrate?.total || 0;
            entry.calciumNitrate_lastAdded = nutrientData.calciumNitrate?.lastAdded || '';
            entry.magnesiumSulfate_total = nutrientData.magnesiumSulfate?.total || 0;
            entry.magnesiumSulfate_lastAdded = nutrientData.magnesiumSulfate?.lastAdded || '';
            entry.phUp_total = nutrientData.phUp?.total || 0;
            entry.phUp_lastAdded = nutrientData.phUp?.lastAdded || '';
            entry.phDown_total = nutrientData.phDown?.total || 0;
            entry.phDown_lastAdded = nutrientData.phDown?.lastAdded || '';
            entry.water_total = nutrientData.water?.total || 0;
            entry.water_lastAdded = nutrientData.water?.lastAdded || '';
          }
        }
      }

      result.push(entry);
    }
  }

  return result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function generateMockHistoricalData(days: number, includePlantData = false, nutrientData: Record<string, { total: number; lastAdded: string }> | null = null): HistoricalEntry[] {
  const data: HistoricalEntry[] = [];
  const now = new Date();

  // Generate data points every 10 minutes for the specified days
  const intervalMinutes = 10;
  const pointsPerDay = (24 * 60) / intervalMinutes;
  const totalPoints = days * pointsPerDay;

  for (let i = totalPoints; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));

    // Only generate temperature and humidity (the active sensors)
    // Set others to null to match actual data
    const baseTemp = 22.5;
    const baseHumidity = 58;

    const entry: HistoricalEntry = {
      timestamp: timestamp.toISOString(),
      temperature: Number((baseTemp + (Math.random() - 0.5) * 4).toFixed(1)),
      humidity: Number((baseHumidity + (Math.random() - 0.5) * 20).toFixed(0)),
      light: null, // Not available yet
      ph: null, // Not available yet
      ec: null, // Not available yet
      waterTemp: null, // Not available yet
    };

    if (includePlantData) {
      // Add plant data for today's entries
      const isToday = timestamp.toDateString() === now.toDateString();
      if (isToday) {
        entry.stemA_height = 19.0;
        entry.stemA_maturedFlowers = 1;
        entry.stemA_openBuds = 1;
        entry.stemA_unopenedBuds = 5;
        entry.stemA_diseases = '';

        entry.stemB_height = 19.0;
        entry.stemB_maturedFlowers = 2;
        entry.stemB_openBuds = 1;
        entry.stemB_unopenedBuds = 3;
        entry.stemB_diseases = '';

        entry.stemC_height = 17.3;
        entry.stemC_maturedFlowers = 2;
        entry.stemC_openBuds = 1;
        entry.stemC_unopenedBuds = 2;
        entry.stemC_diseases = '';

        entry.stemD_height = 18.8;
        entry.stemD_maturedFlowers = 1;
        entry.stemD_openBuds = 1;
        entry.stemD_unopenedBuds = 1;
        entry.stemD_diseases = 'Fungal infection - 2 flowers removed due to high humidity';

        entry.totalMaturedFlowers = 6;
        entry.totalOpenBuds = 4;
        entry.totalUnopenedBuds = 11;
        entry.overallPlantHealth = 'attention';

        // Add nutrient data if provided
        if (nutrientData) {
          entry.masterblend_total = nutrientData.masterblend?.total || 0;
          entry.masterblend_lastAdded = nutrientData.masterblend?.lastAdded || '';
          entry.calciumNitrate_total = nutrientData.calciumNitrate?.total || 0;
          entry.calciumNitrate_lastAdded = nutrientData.calciumNitrate?.lastAdded || '';
          entry.magnesiumSulfate_total = nutrientData.magnesiumSulfate?.total || 0;
          entry.magnesiumSulfate_lastAdded = nutrientData.magnesiumSulfate?.lastAdded || '';
          entry.phUp_total = nutrientData.phUp?.total || 0;
          entry.phUp_lastAdded = nutrientData.phUp?.lastAdded || '';
          entry.phDown_total = nutrientData.phDown?.total || 0;
          entry.phDown_lastAdded = nutrientData.phDown?.lastAdded || '';
          entry.water_total = nutrientData.water?.total || 0;
          entry.water_lastAdded = nutrientData.water?.lastAdded || '';
        }
      }
    }

    data.push(entry);
  }

  return data;
}

function convertToCSV(data: HistoricalEntry[]) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row =>
    headers.map(header => {
      const value = (row as unknown as Record<string, unknown>)[header];
      // Handle null values and escape commas
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}