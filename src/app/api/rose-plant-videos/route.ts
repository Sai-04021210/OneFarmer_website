import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Video metadata interface
interface VideoMetadata {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  category?: 'timelapse' | 'process' | 'system_operation' | 'problems' | 'tutorial';
  description?: string;
  tags?: string[];
  location?: string;
  duration?: string;
}

// Ensure upload directory exists (separate from main dashboard)
const uploadDir = path.join(process.cwd(), 'public/uploads/rose-plant-videos');

// File-based metadata storage (separate from main dashboard)
const metadataFile = path.join(uploadDir, 'metadata.json');

// Load metadata from file
const loadMetadata = async (): Promise<VideoMetadata[]> => {
  try {
    if (existsSync(metadataFile)) {
      const data = await readFile(metadataFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load rose plant video metadata:', error);
  }
  return [];
};

// Save metadata to file
const saveMetadata = async (metadata: VideoMetadata[]): Promise<void> => {
  try {
    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Failed to save rose plant video metadata:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('video') as File;
    const stemId = formData.get('stemId') as string;
    const category = (formData.get('category') as string) || 'timelapse';
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const location = formData.get('location') as string;
    const duration = formData.get('duration') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Validate file type (videos only)
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Only video files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB for videos)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file size must be less than 100MB' },
        { status: 400 }
      );
    }

    // Use ROSE_PLANT as stemId for rose plant video uploads
    const actualStemId = 'ROSE_PLANT';

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const filename = `${actualStemId}_${timestamp}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create metadata
    const videoMetadata: VideoMetadata = {
      id: `${actualStemId}_${timestamp}`,
      stemId: actualStemId,
      filename,
      originalName: file.name,
      uploadDate: new Date().toISOString(),
      size: file.size,
      category: category as VideoMetadata['category'],
      description: description || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined,
      location: location || undefined,
      duration: duration || undefined,
    };

    // Store metadata
    const existingMetadata = await loadMetadata();
    existingMetadata.push(videoMetadata);
    await saveMetadata(existingMetadata);

    return NextResponse.json({
      success: true,
      video: {
        ...videoMetadata,
        url: `/uploads/rose-plant-videos/${filename}`,
      },
    });

  } catch (error) {
    console.error('Rose plant video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');
    const category = searchParams.get('category');

    let videos = await loadMetadata();

    // Filter by category first
    if (category) {
      videos = videos.filter(video => video.category === category);
    }

    // Filter by stemId if provided
    if (stemId) {
      videos = videos.filter(video => video.stemId === stemId);
    }

    // Add URLs to videos
    const videosWithUrls = videos.map(video => ({
      ...video,
      url: `/uploads/rose-plant-videos/${video.filename}`,
    }));

    return NextResponse.json({ videos: videosWithUrls });

  } catch (error) {
    console.error('Rose plant video fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Load and find video metadata
    const metadata = await loadMetadata();
    const videoIndex = metadata.findIndex(
      video => video.id === videoId
    );

    if (videoIndex === -1) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const video = metadata[videoIndex];
    const filepath = path.join(uploadDir, video.filename);

    // Delete file from filesystem
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Failed to delete video file:', error);
      // Continue even if file deletion fails
    }

    // Remove from metadata and save
    metadata.splice(videoIndex, 1);
    await saveMetadata(metadata);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Rose plant video delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}