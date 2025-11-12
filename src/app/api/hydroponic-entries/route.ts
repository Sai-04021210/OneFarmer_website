import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface HydroponicEntry {
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  ph: number | null;
  ec: number | null;
  waterTemp: number | null;
  waterQuality: number | null;
}

// Data directory
const dataDir = path.join(process.cwd(), 'data');
const hydroponicEntriesFile = path.join(dataDir, 'hydroponic-entries.json');

// Load entries from file
const loadEntries = async (): Promise<HydroponicEntry[]> => {
  try {
    if (existsSync(hydroponicEntriesFile)) {
      const data = await readFile(hydroponicEntriesFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load hydroponic entries:', error);
  }
  return [];
};

// Save entries to file
const saveEntries = async (entries: HydroponicEntry[]): Promise<void> => {
  try {
    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(hydroponicEntriesFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error('Failed to save hydroponic entries:', error);
    throw error;
  }
};

// GET - Fetch all hydroponic entries
export async function GET(request: NextRequest) {
  try {
    const entries = await loadEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Hydroponic entries fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hydroponic entries' },
      { status: 500 }
    );
  }
}

// POST - Add hydroponic entry
export async function POST(request: NextRequest) {
  try {
    const entry: HydroponicEntry = await request.json();

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

    // Keep only last 1000 entries to prevent file from growing too large
    const trimmedEntries = entries.slice(-1000);

    await saveEntries(trimmedEntries);

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Hydroponic entry save error:', error);
    return NextResponse.json(
      { error: 'Failed to save hydroponic entry' },
      { status: 500 }
    );
  }
}

// DELETE - Clear all hydroponic entries
export async function DELETE(request: NextRequest) {
  try {
    await saveEntries([]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hydroponic entries clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear hydroponic entries' },
      { status: 500 }
    );
  }
}