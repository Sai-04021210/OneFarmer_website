import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface NutrientEntry {
  date: string;
  time: string;
  timestamp: string;
  masterblend: number;
  calciumNitrate: number;
  magnesiumSulfate: number;
  phDown: number;
  phUp: number;
  totalVolume: number;
  calculatedElements: {
    [key: string]: number;
  };
  notes?: string;
}

// Data directory
const dataDir = path.join(process.cwd(), 'data');
const nutrientEntriesFile = path.join(dataDir, 'rose-plant-nutrient-entries.json');

// Load entries from file
const loadEntries = async (): Promise<NutrientEntry[]> => {
  try {
    if (existsSync(nutrientEntriesFile)) {
      const data = await readFile(nutrientEntriesFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load rose plant nutrient entries:', error);
  }
  return [];
};

// Save entries to file
const saveEntries = async (entries: NutrientEntry[]): Promise<void> => {
  try {
    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(nutrientEntriesFile, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error('Failed to save rose plant nutrient entries:', error);
    throw error;
  }
};

// GET - Fetch all nutrient entries
export async function GET(request: NextRequest) {
  try {
    const entries = await loadEntries();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Rose plant nutrient entries fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rose plant nutrient entries' },
      { status: 500 }
    );
  }
}

// POST - Add or update nutrient entry
export async function POST(request: NextRequest) {
  try {
    const entry: NutrientEntry = await request.json();

    if (!entry.date || !entry.time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }

    const entries = await loadEntries();

    // Remove existing entry with same date and time
    const filteredEntries = entries.filter(
      e => !(e.date === entry.date && e.time === entry.time)
    );

    // Add new entry and sort by timestamp
    filteredEntries.push(entry);
    filteredEntries.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    await saveEntries(filteredEntries);

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Rose plant nutrient entry save error:', error);
    return NextResponse.json(
      { error: 'Failed to save rose plant nutrient entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete nutrient entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }

    const entries = await loadEntries();
    const filteredEntries = entries.filter(
      e => !(e.date === date && e.time === time)
    );

    await saveEntries(filteredEntries);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rose plant nutrient entry delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete rose plant nutrient entry' },
      { status: 500 }
    );
  }
}