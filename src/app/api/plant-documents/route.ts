import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Document metadata interface
interface DocumentMetadata {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  category?: 'manual' | 'datasheet' | 'report' | 'documentation' | 'research' | 'reference';
  description?: string;
  tags?: string[];
  location?: string;
  documentType?: string;
}

// Get page-specific upload directory
const getUploadDir = (page: string) => {
  return path.join(process.cwd(), 'public/uploads/plant-documents', page);
};

// Get page-specific metadata file
const getMetadataFile = (page: string) => {
  return path.join(getUploadDir(page), 'metadata.json');
};

// Load metadata from file
const loadMetadata = async (page: string = 'dashboard'): Promise<DocumentMetadata[]> => {
  try {
    const metadataFile = getMetadataFile(page);
    if (existsSync(metadataFile)) {
      const data = await readFile(metadataFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load document metadata:', error);
  }
  return [];
};

// Save metadata to file
const saveMetadata = async (metadata: DocumentMetadata[], page: string = 'dashboard'): Promise<void> => {
  try {
    const metadataFile = getMetadataFile(page);
    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Failed to save document metadata:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const page = (formData.get('page') as string) || 'dashboard';

    // Ensure directory exists
    const uploadDir = getUploadDir(page);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const file = formData.get('document') as File;
    const stemId = formData.get('stemId') as string;
    const category = (formData.get('category') as string) || 'documentation';
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const location = formData.get('location') as string;
    const documentType = formData.get('documentType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Document file is required' },
        { status: 400 }
      );
    }

    // Validate file type (documents only)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only document files (PDF, Word, Excel, Text, CSV, JSON) are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB for documents)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Document file size must be less than 25MB' },
        { status: 400 }
      );
    }

    // Use SYSTEM as stemId for document uploads
    const actualStemId = 'SYSTEM';

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
    const documentMetadata: DocumentMetadata = {
      id: `${actualStemId}_${timestamp}`,
      stemId: actualStemId,
      filename,
      originalName: file.name,
      uploadDate: new Date().toISOString(),
      size: file.size,
      category: category as DocumentMetadata['category'],
      description: description || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : undefined,
      location: location || undefined,
      documentType: documentType || undefined,
    };

    // Store metadata
    const existingMetadata = await loadMetadata(page);
    existingMetadata.push(documentMetadata);
    await saveMetadata(existingMetadata, page);

    return NextResponse.json({
      success: true,
      document: {
        ...documentMetadata,
        url: `/uploads/plant-documents/${page}/${filename}`,
      },
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
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

    let documents = await loadMetadata(page);

    // Filter by category first
    if (category) {
      documents = documents.filter(document => document.category === category);
    }

    // Filter by stemId if provided
    if (stemId) {
      documents = documents.filter(document => document.stemId === stemId);
    }

    // Add URLs to documents
    const documentsWithUrls = documents.map(document => ({
      ...document,
      url: `/uploads/plant-documents/${page}/${document.filename}`,
    }));

    return NextResponse.json({ documents: documentsWithUrls });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'dashboard';
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Load and find document metadata
    const metadata = await loadMetadata(page);
    const documentIndex = metadata.findIndex(
      document => document.id === documentId
    );

    if (documentIndex === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = metadata[documentIndex];
    const uploadDir = getUploadDir(page);
    const filepath = path.join(uploadDir, document.filename);

    // Delete file from filesystem
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Failed to delete document file:', error);
      // Continue even if file deletion fails
    }

    // Remove from metadata and save
    metadata.splice(documentIndex, 1);
    await saveMetadata(metadata, page);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}