import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface RosePlantEntry {
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
const rosePlantEntriesFile = path.join(dataDir, 'rose-plant-entries.json');

// Load entries from file
const loadEntries = async (): Promise<RosePlantEntry[]> => {
  try {
    if (existsSync(rosePlantEntriesFile)) {
      const data = await readFile(rosePlantEntriesFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load rose plant entries:', error);
  }
  return [];
};

// Save entries to file
const saveEntries = async (entries: RosePlantEntry[]): Promise<void> => {
  try {
    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(rosePlantEntriesFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error('Failed to save rose plant entries:', error);
    throw error;
  }
};

// GET - Fetch rose plant entries (optionally filtered by stemId)
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
    console.error('Rose plant entries fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rose plant entries' },
      { status: 500 }
    );
  }
}

// POST - Add rose plant entry
export async function POST(request: NextRequest) {
  try {
    const entry: RosePlantEntry = await request.json();

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
    console.error('Rose plant entry save error:', error);
    return NextResponse.json(
      { error: 'Failed to save rose plant entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete rose plant entries by stemId or all
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
    console.error('Rose plant entries delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete rose plant entries' },
      { status: 500 }
    );
  }
}