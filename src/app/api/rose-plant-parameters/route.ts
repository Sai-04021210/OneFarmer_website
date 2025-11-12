import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface PlantParameters {
  [key: string]: any;
}

// Data directory
const dataDir = path.join(process.cwd(), 'data');
const parametersFile = path.join(dataDir, 'rose-plant-parameters.json');

// Load parameters from file
const loadParameters = async (): Promise<PlantParameters> => {
  try {
    if (existsSync(parametersFile)) {
      const data = await readFile(parametersFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load rose plant parameters:', error);
  }
  return {};
};

// Save parameters to file
const saveParameters = async (parameters: PlantParameters): Promise<void> => {
  try {
    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(parametersFile, JSON.stringify(parameters, null, 2));
  } catch (error) {
    console.error('Failed to save rose plant parameters:', error);
    throw error;
  }
};

// GET - Fetch rose plant parameters
export async function GET(request: NextRequest) {
  try {
    const parameters = await loadParameters();
    return NextResponse.json({ parameters });
  } catch (error) {
    console.error('Rose plant parameters fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rose plant parameters' },
      { status: 500 }
    );
  }
}

// POST - Update rose plant parameters
export async function POST(request: NextRequest) {
  try {
    const parameters: PlantParameters = await request.json();
    await saveParameters(parameters);
    return NextResponse.json({ success: true, parameters });
  } catch (error) {
    console.error('Rose plant parameters save error:', error);
    return NextResponse.json(
      { error: 'Failed to save rose plant parameters' },
      { status: 500 }
    );
  }
}