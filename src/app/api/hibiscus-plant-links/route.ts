import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Link metadata interface
interface LinkMetadata {
  id: string;
  stemId: string;
  title: string;
  url: string;
  uploadDate: string;
  category?: 'tutorial' | 'research' | 'documentation' | 'tools' | 'suppliers' | 'guides' | 'other';
  description?: string;
  tags?: string[];
  location?: string;
}

// Ensure storage directory exists (separate from main dashboard)
const storageDir = path.join(process.cwd(), 'public/uploads/hibiscus-plant-links');

// File-based metadata storage (separate from main dashboard)
const metadataFile = path.join(storageDir, 'metadata.json');

// Load metadata from file
const loadMetadata = async (): Promise<LinkMetadata[]> => {
  try {
    if (existsSync(metadataFile)) {
      const data = await readFile(metadataFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load hibiscus plant link metadata:', error);
  }
  return [];
};

// Save metadata to file
const saveMetadata = async (metadata: LinkMetadata[]): Promise<void> => {
  try {
    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Failed to save hibiscus plant link metadata:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    // Ensure directory exists
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const stemId = formData.get('stemId') as string;
    const category = (formData.get('category') as string) || 'other';
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const location = formData.get('location') as string;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Use HIBISCUS_PLANT as stemId for hibiscus plant link uploads
    const actualStemId = 'HIBISCUS_PLANT';

    // Generate unique ID
    const timestamp = Date.now();
    const linkId = `${actualStemId}_${timestamp}`;

    // Create metadata
    const linkMetadata: LinkMetadata = {
      id: linkId,
      stemId: actualStemId,
      title: title.trim(),
      url: url.trim(),
      uploadDate: new Date().toISOString(),
      category: category as LinkMetadata['category'],
      description: description?.trim() || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined,
      location: location?.trim() || undefined,
    };

    // Store metadata
    const existingMetadata = await loadMetadata();
    existingMetadata.push(linkMetadata);
    await saveMetadata(existingMetadata);

    return NextResponse.json({
      success: true,
      link: linkMetadata,
    });

  } catch (error) {
    console.error('Hibiscus plant link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');
    const category = searchParams.get('category');

    let links = await loadMetadata();

    // Filter by category first
    if (category) {
      links = links.filter(link => link.category === category);
    }

    // Filter by stemId if provided
    if (stemId) {
      links = links.filter(link => link.stemId === stemId);
    }

    return NextResponse.json({ links });

  } catch (error) {
    console.error('Hibiscus plant link fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Load and find link metadata
    const metadata = await loadMetadata();
    const linkIndex = metadata.findIndex(
      link => link.id === linkId
    );

    if (linkIndex === -1) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Remove from metadata and save
    metadata.splice(linkIndex, 1);
    await saveMetadata(metadata);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Hibiscus plant link delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}