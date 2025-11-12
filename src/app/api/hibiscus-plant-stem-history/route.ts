import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface StemHistoryEntry {
  timestamp: string;
  height: number;
  maturedFlowers: number;
  openBuds: number;
  unopenedBuds: number;
  leaves: number;
  diseases?: string;
}

// Data directory
const dataDir = path.join(process.cwd(), 'data');

// Load stem history from file
const loadStemHistory = async (stemId: string): Promise<StemHistoryEntry[]> => {
  try {
    const stemFile = path.join(dataDir, `hibiscus-plant-stem-${stemId}-history.json`);
    if (existsSync(stemFile)) {
      const data = await readFile(stemFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Failed to load stem ${stemId} history:`, error);
  }
  return [];
};

// Save stem history to file
const saveStemHistory = async (stemId: string, history: StemHistoryEntry[]): Promise<void> => {
  try {
    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    const stemFile = path.join(dataDir, `hibiscus-plant-stem-${stemId}-history.json`);
    await writeFile(stemFile, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error(`Failed to save stem ${stemId} history:`, error);
    throw error;
  }
};

// GET - Fetch stem history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');

    if (!stemId) {
      return NextResponse.json(
        { error: 'stemId is required' },
        { status: 400 }
      );
    }

    const history = await loadStemHistory(stemId);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Stem history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stem history' },
      { status: 500 }
    );
  }
}

// POST - Add stem history entry
export async function POST(request: NextRequest) {
  try {
    const { stemId, entry } = await request.json();

    if (!stemId || !entry) {
      return NextResponse.json(
        { error: 'stemId and entry are required' },
        { status: 400 }
      );
    }

    const history = await loadStemHistory(stemId);
    history.push(entry);

    // Keep only last 1000 entries per stem
    const trimmedHistory = history.slice(-1000);

    await saveStemHistory(stemId, trimmedHistory);

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Stem history save error:', error);
    return NextResponse.json(
      { error: 'Failed to save stem history' },
      { status: 500 }
    );
  }
}

// DELETE - Clear stem history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');

    if (!stemId) {
      return NextResponse.json(
        { error: 'stemId is required' },
        { status: 400 }
      );
    }

    await saveStemHistory(stemId, []);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stem history delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete stem history' },
      { status: 500 }
    );
  }
}