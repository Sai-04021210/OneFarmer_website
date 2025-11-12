import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { promises as fs } from 'fs';
import path from 'path';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: string[][];
      theme?: string;
      styles?: { fontSize?: number };
      headStyles?: { fillColor?: number[] };
    }) => jsPDF;
  }
}

interface ExportOptions {
  includePhotos: boolean;
  includeData: boolean;
  dataTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  categories?: string[];
  stemId?: string;
}

interface DataEntry {
  timestamp: string;
  temperature?: number;
  humidity?: number;
  light?: number;
  ph?: number;
  ec?: number;
  waterTemp?: number;
  tds?: number;
  waterQuality?: number;
  stem?: string;
  parameter?: string;
  value?: number;
  unit?: string;
}

interface PhotoMetadata {
  filename: string;
  originalName: string;
  uploadDate: string;
  category?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const options: ExportOptions = await request.json();
    
    // Create PDF document
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Add title and metadata
    doc.setFontSize(20);
    doc.text('OneFarmer System Report', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Date Range: ${options.dateRange.start} to ${options.dateRange.end}`, 20, yPosition);
    yPosition += 20;

    // Add data sections if requested
    if (options.includeData) {
      yPosition = await addDataSections(doc, yPosition, options);
    }

    // Add photos if requested
    if (options.includePhotos) {
      yPosition = await addPhotoSections(doc, yPosition, options);
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="onefarmer-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'PDF export failed' }, { status: 500 });
  }
}

async function addDataSections(doc: jsPDF, startY: number, options: ExportOptions): Promise<number> {
  let yPosition = startY;
  
  // Environmental Data Section
  if (options.dataTypes.includes('environmental')) {
    doc.setFontSize(16);
    doc.text('Environmental Data', 20, yPosition);
    yPosition += 10;
    
    // Get environmental data (you'll need to implement data fetching)
    const envData = await getEnvironmentalData(options.dateRange);
    
    if (envData.length > 0) {
      const tableData = envData.map(entry => [
        new Date(entry.timestamp).toLocaleString(),
        entry.temperature?.toFixed(1) || 'N/A',
        entry.humidity?.toFixed(0) || 'N/A',
        entry.light?.toFixed(0) || 'N/A',
        entry.ph?.toFixed(1) || 'N/A',
        entry.ec?.toFixed(1) || 'N/A'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Timestamp', 'Temp (°C)', 'Humidity (%)', 'Light', 'pH', 'EC (mS/cm)']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [34, 197, 94] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.text('No environmental data available for the selected period.', 20, yPosition);
      yPosition += 15;
    }
  }

  // Hydroponic Data Section
  if (options.dataTypes.includes('hydroponic')) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Hydroponic Parameters', 20, yPosition);
    yPosition += 10;
    
    const hydroData = await getHydroponicData(options.dateRange);
    
    if (hydroData.length > 0) {
      const tableData = hydroData.map(entry => [
        new Date(entry.timestamp).toLocaleString(),
        entry.ph?.toFixed(1) || 'N/A',
        entry.ec?.toFixed(1) || 'N/A',
        entry.waterTemp?.toFixed(1) || 'N/A',
        entry.tds?.toFixed(0) || 'N/A',
        entry.waterQuality?.toFixed(1) || 'N/A'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Timestamp', 'pH', 'EC (mS/cm)', 'Water Temp (°C)', 'TDS (ppm)', 'Quality']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.text('No hydroponic data available for the selected period.', 20, yPosition);
      yPosition += 15;
    }
  }

  // Plant Data Section
  if (options.dataTypes.includes('plant')) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Plant Monitoring Data', 20, yPosition);
    yPosition += 10;
    
    const plantData = await getPlantData(options.dateRange, options.stemId);
    
    if (plantData.length > 0) {
      const tableData = plantData.map(entry => [
        new Date(entry.timestamp).toLocaleString(),
        entry.stem || 'N/A',
        entry.parameter || 'N/A',
        entry.value?.toString() || 'N/A',
        entry.unit || 'N/A'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Timestamp', 'Stem', 'Parameter', 'Value', 'Unit']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [168, 85, 247] }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.text('No plant data available for the selected period.', 20, yPosition);
      yPosition += 15;
    }
  }

  return yPosition;
}

async function addPhotoSections(doc: jsPDF, startY: number, options: ExportOptions): Promise<number> {
  let yPosition = startY;
  
  try {
    // Get photo metadata
    const photos = await getPhotosMetadata(options);
    
    if (photos.length === 0) {
      doc.setFontSize(16);
      doc.text('Photos', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text('No photos available for the selected criteria.', 20, yPosition);
      return yPosition + 15;
    }

    // Group photos by category
    const photosByCategory = photos.reduce((acc, photo) => {
      const category = photo.category || 'uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(photo);
      return acc;
    }, {} as Record<string, any[]>);

    // Add photos by category
    for (const [category, categoryPhotos] of Object.entries(photosByCategory)) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.text(`Photos: ${category.charAt(0).toUpperCase() + category.slice(1)}`, 20, yPosition);
      yPosition += 15;

      // Add up to 4 photos per category (2x2 grid)
      const photosToShow = categoryPhotos.slice(0, 4);
      const photoWidth = 80;
      const photoHeight = 60;
      const spacing = 10;

      for (let i = 0; i < photosToShow.length; i++) {
        const photo = photosToShow[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 20 + col * (photoWidth + spacing);
        const y = yPosition + row * (photoHeight + spacing + 20);

        try {
          // Load and add image
          const imagePath = path.join(process.cwd(), 'public', 'uploads', 'plant-photos', photo.filename);
          const imageBuffer = await fs.readFile(imagePath);
          const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
          
          doc.addImage(imageBase64, 'JPEG', x, y, photoWidth, photoHeight);
          
          // Add photo info
          doc.setFontSize(8);
          doc.text(photo.originalName, x, y + photoHeight + 5);
          doc.text(new Date(photo.uploadDate).toLocaleDateString(), x, y + photoHeight + 10);
          if (photo.description) {
            const description = photo.description.length > 30 
              ? photo.description.substring(0, 30) + '...' 
              : photo.description;
            doc.text(description, x, y + photoHeight + 15);
          }
        } catch (imageError) {
          console.error(`Failed to add image ${photo.filename}:`, imageError);
          // Add placeholder text instead
          doc.setFontSize(10);
          doc.text(`[Image: ${photo.originalName}]`, x, y + 30);
        }
      }

      yPosition += Math.ceil(photosToShow.length / 2) * (photoHeight + spacing + 20) + 10;

      if (categoryPhotos.length > 4) {
        doc.setFontSize(10);
        doc.text(`... and ${categoryPhotos.length - 4} more photos in this category`, 20, yPosition);
        yPosition += 10;
      }
    }
  } catch (error) {
    console.error('Error adding photos to PDF:', error);
    doc.setFontSize(16);
    doc.text('Photos', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text('Error loading photos for this report.', 20, yPosition);
    yPosition += 15;
  }

  return yPosition;
}

// Mock data functions - replace with actual data fetching
async function getEnvironmentalData(_dateRange: { start: string; end: string }): Promise<DataEntry[]> {
  // This should fetch actual environmental data from your storage
  return [];
}

async function getHydroponicData(_dateRange: { start: string; end: string }): Promise<DataEntry[]> {
  // This should fetch actual hydroponic data from your storage
  return [];
}

async function getPlantData(_dateRange: { start: string; end: string }, _stemId?: string): Promise<DataEntry[]> {
  // This should fetch actual plant data from your storage
  return [];
}

async function getPhotosMetadata(options: ExportOptions): Promise<PhotoMetadata[]> {
  try {
    const metadataPath = path.join(process.cwd(), 'public', 'uploads', 'plant-photos', 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    let photos: PhotoMetadata[] = JSON.parse(metadataContent);

    // Filter by categories if specified
    if (options.categories && options.categories.length > 0) {
      photos = photos.filter((photo: PhotoMetadata) =>
        options.categories!.includes(photo.category || '')
      );
    }

    // Filter by stemId if specified
    if (options.stemId) {
      photos = photos.filter((photo: PhotoMetadata) => (photo as any).stemId === options.stemId);
    }

    // Filter by date range
    photos = photos.filter((photo: PhotoMetadata) => {
      const photoDate = new Date(photo.uploadDate);
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      return photoDate >= startDate && photoDate <= endDate;
    });

    return photos;
  } catch (error) {
    console.error('Error loading photos metadata:', error);
    return [];
  }
}
