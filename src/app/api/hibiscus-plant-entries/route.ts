import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface HibiscusPlantEntry {
  timestamp: string;
  stemId?: string;
  // Plant parameters
  stemHeight?: number;
  stemDiameter?: number;
  leafCount?: number;
  budCount?: number;
  flowerCount?: number;
  nodeCount?: number;
  // Environmental parameters
  airTemperature?: number;
  airHumidity?: number;
  lightIntensity?: number;
  co2Level?: number;
  // Hydroponic parameters
  pH?: number;
  ec?: number;
  waterTemperature?: number;
  tds?: number;
  // System parameters
  pumpCycles?: number;
  flowRate?: number;
  notes?: string;
}

// Data directory
const dataDir = path.join(process.cwd(), 'data');
const hibiscusPlantEntriesFile = path.join(dataDir, 'hibiscus-plant-entries.json');

// Load entries from file
const loadEntries = async (): Promise<HibiscusPlantEntry[]> => {
  try {
    if (existsSync(hibiscusPlantEntriesFile)) {
      const data = await readFile(hibiscusPlantEntriesFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load hibiscus plant entries:', error);
  }
  return [];
};

// Save entries to file
const saveEntries = async (entries: HibiscusPlantEntry[]): Promise<void> => {
  try {
    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(hibiscusPlantEntriesFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error('Failed to save hibiscus plant entries:', error);
    throw error;
  }
};

// GET - Fetch hibiscus plant entries (optionally filtered by stemId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');

    let entries = await loadEntries();

    // Filter by stemId if provided
    if (stemId) {
      entries = entries.filter(entry => entry.stemId === stemId);
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Hibiscus plant entries fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hibiscus plant entries' },
      { status: 500 }
    );
  }
}

// POST - Add hibiscus plant entry
export async function POST(request: NextRequest) {
  try {
    const entry: HibiscusPlantEntry = await request.json();

    if (!entry.timestamp) {
      return NextResponse.json(
        { error: 'Timestamp is required' },
        { status: 400 }
      );
    }

    const entries = await loadEntries();

    // Add new entry and sort by timestamp
    entries.push(entry);
    entries.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Keep only last 5000 entries to prevent file from growing too large
    const trimmedEntries = entries.slice(-5000);

    await saveEntries(trimmedEntries);

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Hibiscus plant entry save error:', error);
    return NextResponse.json(
      { error: 'Failed to save hibiscus plant entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete hibiscus plant entries by stemId or all
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');

    if (stemId) {
      // Delete entries for specific stem
      const entries = await loadEntries();
      const filteredEntries = entries.filter(entry => entry.stemId !== stemId);
      await saveEntries(filteredEntries);
    } else {
      // Clear all entries
      await saveEntries([]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hibiscus plant entries delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete hibiscus plant entries' },
      { status: 500 }
    );
  }
}