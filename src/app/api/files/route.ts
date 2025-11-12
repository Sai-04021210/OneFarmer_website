import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  const uploadsDir = join(process.cwd(), 'public/uploads');
  try {
    const files = await readdir(uploadsDir);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return NextResponse.json({ files: [] });
  }
}
