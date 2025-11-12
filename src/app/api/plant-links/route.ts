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

// Get page-specific data file path
const getDataFile = (page: string = 'dashboard'): string => {
  return path.join(process.cwd(), 'data/plant-links', page, 'links.json');
};

// Load links from file
const loadLinks = async (page: string = 'dashboard'): Promise<LinkMetadata[]> => {
  try {
    const dataFile = getDataFile(page);
    if (existsSync(dataFile)) {
      const data = await readFile(dataFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load plant link metadata:', error);
  }
  return [];
};

// Save links to file
const saveLinks = async (links: LinkMetadata[], page: string = 'dashboard'): Promise<void> => {
  try {
    const dataFile = getDataFile(page);
    const dataDir = path.dirname(dataFile);

    // Ensure directory exists
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    await writeFile(dataFile, JSON.stringify(links, null, 2));
  } catch (error) {
    console.error('Failed to save plant link metadata:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const page = (formData.get('page') as string) || 'dashboard';
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const stemId = formData.get('stemId') as string;
    const category = (formData.get('category') as string) || 'other';
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const location = formData.get('location') as string;

    // Ensure page-specific directory exists
    const dataFile = getDataFile(page);
    const dataDir = path.dirname(dataFile);
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

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

    // Use SYSTEM as stemId for main dashboard link uploads
    const actualStemId = stemId || 'SYSTEM';

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
    const existingLinks = await loadLinks(page);
    existingLinks.push(linkMetadata);
    await saveLinks(existingLinks, page);

    return NextResponse.json({
      success: true,
      link: linkMetadata,
    });

  } catch (error) {
    console.error('Plant link creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'dashboard';
    const stemId = searchParams.get('stemId');
    const category = searchParams.get('category');

    let links = await loadLinks(page);

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
    console.error('Plant link fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'dashboard';
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Load and find link metadata
    const links = await loadLinks(page);
    const linkIndex = links.findIndex(
      link => link.id === linkId
    );

    if (linkIndex === -1) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Remove from metadata and save
    links.splice(linkIndex, 1);
    await saveLinks(links, page);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Plant link delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}