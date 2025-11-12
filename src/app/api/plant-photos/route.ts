import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// MQTT notification function
const publishPhotoNotification = async (photo: PhotoMetadata) => {
  try {
    const { exec } = await import('child_process');
    const message = JSON.stringify({
      type: 'photo_upload',
      timestamp: photo.uploadDate,
      category: photo.category,
      filename: photo.filename,
      originalName: photo.originalName,
      description: photo.description,
      size: photo.size
    });

    // Publish to MQTT broker
    exec(`mosquitto_pub -h 192.168.0.8 -t "onefarmer/photos/system" -m '${message}'`,
      (error: Error | null) => {
        if (error) {
          console.error('MQTT publish error:', error);
        } else {
          console.log('Photo notification published to MQTT');
        }
      });
  } catch (error) {
    console.error('Error in MQTT notification:', error);
  }
};

// Photo metadata interface
interface PhotoMetadata {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  category?: 'stem' | 'system' | 'setup' | 'maintenance' | 'electronics' | 'hydro' | 'environment' |
           'fertilizers' | 'chemicals' | 'nutrients' | 'equipment' | 'sensors' | 'problems' |
           'harvest' | 'growth_stages' | 'diseases' | 'pests' | 'solutions' | 'experiments' |
           'before_after' | 'documentation' | 'calibration' | 'installation';
  description?: string;
  tags?: string[];
  location?: string;
  plantStage?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Get page-specific upload directory
const getUploadDir = (page: string = 'dashboard') => {
  const baseDir = path.join(process.cwd(), 'public/uploads/plant-photos');
  return path.join(baseDir, page);
};

// Get page-specific metadata file
const getMetadataFile = (page: string = 'dashboard') => {
  return path.join(getUploadDir(page), 'metadata.json');
};

// Load metadata from file
const loadMetadata = async (page: string = 'dashboard'): Promise<PhotoMetadata[]> => {
  try {
    const metadataFile = getMetadataFile(page);
    if (existsSync(metadataFile)) {
      const data = await readFile(metadataFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load metadata:', error);
  }
  return [];
};

// Save metadata to file
const saveMetadata = async (metadata: PhotoMetadata[], page: string = 'dashboard'): Promise<void> => {
  try {
    const metadataFile = getMetadataFile(page);
    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Failed to save metadata:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const stemId = formData.get('stemId') as string;
    const category = (formData.get('category') as string) || 'stem';
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const location = formData.get('location') as string;
    const plantStage = formData.get('plantStage') as string;
    const severity = formData.get('severity') as string;
    const page = (formData.get('page') as string) || 'dashboard'; // Get page context

    // Ensure page-specific directory exists
    const uploadDir = getUploadDir(page);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    if (!file) {
      return NextResponse.json(
        { error: 'Photo is required' },
        { status: 400 }
      );
    }

    // System-level categories that don't require stemId
    const systemCategories = [
      'system', 'setup', 'maintenance', 'electronics', 'hydro', 'environment',
      'fertilizers', 'chemicals', 'nutrients', 'equipment', 'sensors',
      'solutions', 'experiments', 'documentation', 'calibration', 'installation'
    ];

    // For system photos, use 'SYSTEM' as stemId
    const actualStemId = systemCategories.includes(category) ? 'SYSTEM' : stemId;

    if (!actualStemId && category === 'stem') {
      return NextResponse.json(
        { error: 'stemId is required for stem photos' },
        { status: 400 }
      );
    }

    // Validate file type (images and videos)
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Only image and video files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for images, max 50MB for videos)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeLimit = file.type.startsWith('video/') ? '50MB' : '5MB';
      return NextResponse.json(
        { error: `File size must be less than ${sizeLimit}` },
        { status: 400 }
      );
    }

    // For videos, validate duration (max 30 seconds)
    if (file.type.startsWith('video/')) {
      // Note: Duration validation would typically be done on the frontend
      // since server-side video duration checking requires additional libraries
      // Frontend should enforce this limit before upload
    }

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
    const photoMetadata: PhotoMetadata = {
      id: `${actualStemId}_${timestamp}`,
      stemId: actualStemId,
      filename,
      originalName: file.name,
      uploadDate: new Date().toISOString(),
      size: file.size,
      category: category as PhotoMetadata['category'],
      description: description || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined,
      location: location || undefined,
      plantStage: plantStage || undefined,
      severity: severity as 'low' | 'medium' | 'high' | 'critical' || undefined,
    };

    // Store metadata
    const existingMetadata = await loadMetadata(page);
    existingMetadata.push(photoMetadata);
    await saveMetadata(existingMetadata, page);

    // Publish MQTT notification for system photos
    if (category !== 'stem') {
      try {
        await publishPhotoNotification(photoMetadata);
      } catch (error) {
        console.error('Failed to publish MQTT notification:', error);
        // Don't fail the upload if MQTT fails
      }
    }

    return NextResponse.json({
      success: true,
      photo: {
        ...photoMetadata,
        url: `/uploads/plant-photos/${page}/${filename}`,
      },
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');
    const category = searchParams.get('category');
    const page = searchParams.get('page') || 'dashboard'; // Get page context

    let photos = await loadMetadata(page);

    // Filter by category first
    if (category) {
      photos = photos.filter(photo => photo.category === category);
    }

    // Filter by stemId if provided
    if (stemId) {
      photos = photos.filter(photo => photo.stemId === stemId);
    }

    // Add URLs to photos
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/uploads/plant-photos/${page}/${photo.filename}`,
    }));

    return NextResponse.json({ photos: photosWithUrls });

  } catch (error) {
    console.error('Photo fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');
    const page = searchParams.get('page') || 'dashboard'; // Get page context

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Load and find photo metadata
    const metadata = await loadMetadata(page);
    const photoIndex = metadata.findIndex(
      photo => photo.id === photoId
    );

    if (photoIndex === -1) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const photo = metadata[photoIndex];
    const uploadDir = getUploadDir(page);
    const filepath = path.join(uploadDir, photo.filename);

    // Delete file from filesystem
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // Continue even if file deletion fails
    }

    // Remove from metadata and save
    metadata.splice(photoIndex, 1);
    await saveMetadata(metadata, page);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}