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
  category?: 'manual' | 'specification' | 'maintenance' | 'troubleshooting' | 'other';
  description?: string;
  tags?: string[];
  location?: string;
}

// Ensure upload directory exists (separate from main dashboard)
const uploadDir = path.join(process.cwd(), 'public/uploads/rose-plant-documents');

// File-based metadata storage (separate from main dashboard)
const metadataFile = path.join(uploadDir, 'metadata.json');

// Load metadata from file
const loadMetadata = async (): Promise<DocumentMetadata[]> => {
  try {
    if (existsSync(metadataFile)) {
      const data = await readFile(metadataFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load rose plant document metadata:', error);
  }
  return [];
};

// Save metadata to file
const saveMetadata = async (metadata: DocumentMetadata[]): Promise<void> => {
  try {
    await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Failed to save rose plant document metadata:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('document') as File;
    const stemId = formData.get('stemId') as string;
    const category = (formData.get('category') as string) || 'other';
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const location = formData.get('location') as string;

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
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, Word, Excel, and text documents are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for documents)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Document file size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Use ROSE_PLANT as stemId for rose plant document uploads
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
    };

    // Store metadata
    const existingMetadata = await loadMetadata();
    existingMetadata.push(documentMetadata);
    await saveMetadata(existingMetadata);

    return NextResponse.json({
      success: true,
      document: {
        ...documentMetadata,
        url: `/uploads/rose-plant-documents/${filename}`,
      },
    });

  } catch (error) {
    console.error('Rose plant document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stemId = searchParams.get('stemId');
    const category = searchParams.get('category');

    let documents = await loadMetadata();

    // Filter by category first
    if (category) {
      documents = documents.filter(doc => doc.category === category);
    }

    // Filter by stemId if provided
    if (stemId) {
      documents = documents.filter(doc => doc.stemId === stemId);
    }

    // Add URLs to documents
    const documentsWithUrls = documents.map(doc => ({
      ...doc,
      url: `/uploads/rose-plant-documents/${doc.filename}`,
    }));

    return NextResponse.json({ documents: documentsWithUrls });

  } catch (error) {
    console.error('Rose plant document fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Load and find document metadata
    const metadata = await loadMetadata();
    const documentIndex = metadata.findIndex(
      doc => doc.id === documentId
    );

    if (documentIndex === -1) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = metadata[documentIndex];
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
    await saveMetadata(metadata);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Rose plant document delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}