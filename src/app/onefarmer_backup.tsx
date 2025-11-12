'use client';

import { useState, useEffect, useCallback } from 'react';

// Type definitions
type ManualModeState = {
  temperature: boolean;
  humidity: boolean;
  light: boolean;
};

// Photo interface for uploaded photos
interface UploadedPhoto {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  category?: 'stem' | 'system' | 'setup' | 'maintenance' | 'electronics' | 'hydro' | 'environment';
  description?: string;
  url: string;
}

// Video interface for uploaded videos
interface UploadedVideo {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  category?: 'timelapse' | 'process' | 'system_operation' | 'problems' | 'tutorial';
  description?: string;
  duration?: string;
  url: string;
}

// Document interface for uploaded documents
interface UploadedDocument {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  category?: 'manual' | 'datasheet' | 'report' | 'documentation' | 'research' | 'reference';
  description?: string;
  documentType?: string;
  url: string;
}
import Link from 'next/link';
import { ArrowRight, Sprout, Droplets, Sun, BarChart, Wifi, Database, Bell, Target, Leaf, FlowerIcon, Zap, ThermometerSun, Eye, Activity, Copy, ExternalLink, Download, Camera, Upload, Plus, Calendar, Save, TrendingUp, FileText, FileSpreadsheet, File, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NutrientTracker from '@/components/NutrientTracker';
import ParameterTracker from '@/components/ParameterTracker';
import EnhancedPhotoUpload from '@/components/EnhancedPhotoUpload';
import EnhancedVideoUpload from '@/components/EnhancedVideoUpload';
import EnhancedDocumentUpload from '@/components/EnhancedDocumentUpload';
import EnhancedLinkUpload from '@/components/EnhancedLinkUpload';
import PDFExportModal from '@/components/PDFExportModal';

export default function OneFarmerPage() {
  // Client-side mounted state to prevent hydration errors
  const [mounted, setMounted] = useState(false);

  // Dark mode state - Initialize from system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check if user has a saved preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Otherwise, use system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // PDF export modal state
  const [isPDFExportOpen, setIsPDFExportOpen] = useState(false);

  // Environmental data state
  const [envData, setEnvData] = useState({
    temperature: null as number | null,
    humidity: null as number | null,
    light: null as number | null,
  });

  // Manual mode state (with localStorage persistence)
  const [manualMode, setManualMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hydroponicManualMode');
      return saved ? JSON.parse(saved) : {
        temperature: false,
        humidity: false,
        light: false,
      };
    }
    return {
      temperature: false,
      humidity: false,
      light: false,
    };
  });

  // Manual entry values (with localStorage persistence)
  const [manualValues, setManualValues] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hydroponicManualValues');
      return saved ? JSON.parse(saved) : {
        temperature: 0,
        humidity: 0,
        light: 0,
      };
    }
    return {
      temperature: 0,
      humidity: 0,
      light: 0,
    };
  });

  // Historical data (clean, non-random)
  const [historicalData, setHistoricalData] = useState<Array<{
    timestamp: string;
    temperature?: number | null;
    humidity?: number | null;
    light?: number | null;
  }>>([]);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if user hasn't manually set a preference
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
          setIsDarkMode(e.matches);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Load historical data from API on mount
  useEffect(() => {
    const loadEnvironmentalData = async () => {
      try {
        const response = await fetch('/api/environmental-entries');
        if (response.ok) {
          const data = await response.json();
          setHistoricalData(data.entries || []);
        }
      } catch (error) {
        console.error('Failed to load environmental data:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadEnvironmentalData();
    }
  }, []);

  // Graph state for environmental parameters
  const [graphTimeRange, setGraphTimeRange] = useState('1hour');
  const [visibleLines, setVisibleLines] = useState({
    temperature: true,
    humidity: true,
    light: true
  });

  // Environmental entry form state
  const [envEntryForm, setEnvEntryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5), // HH:MM format
    temperature: '',
    humidity: '',
    light: '',
    notes: ''
  });

  // Photo-related state
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<UploadedPhoto | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideo | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [photoRefresh, setPhotoRefresh] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Link state
  const [uploadedLinks, setUploadedLinks] = useState<any[]>([]);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkRefresh, setLinkRefresh] = useState(0);

  // Set mounted to true after component mounts to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch MQTT sensor data
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        console.log('Fetching MQTT data...');
        const response = await fetch('/api/mqtt-data');
        if (response.ok) {
          const data = await response.json();
          console.log('MQTT data received:', data);
          setEnvData({
            temperature: data.temperature,
            humidity: data.humidity,
            light: data.light,
          });

          // Auto-save MQTT data to historical entries if values exist
          if (data.temperature !== null || data.humidity !== null || data.light !== null) {
            const newEntry = {
              timestamp: new Date().toISOString(),
              temperature: data.temperature,
              humidity: data.humidity,
              light: data.light,
              notes: 'Auto-recorded from MQTT',
            };

            setHistoricalData(prev => {
              // Check if we already have a recent entry (within last minute) to avoid duplicates
              const lastEntry = prev[prev.length - 1];
              const now = new Date();
              const lastEntryTime = lastEntry ? new Date(lastEntry.timestamp) : null;

              if (lastEntryTime && now.getTime() - lastEntryTime.getTime() < 60000) {
                // Don't add if last entry was less than 1 minute ago
                return prev;
              }

              // Add new entry and keep last 1000 entries for comprehensive CSV export
              return [...prev.slice(-999), newEntry];
            });
          }
        } else {
          console.error('Failed to fetch sensor data - Response not OK:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch sensor data:', error);
      }
    };

    // Initial fetch
    fetchSensorData();

    // Set up polling every 10 seconds
    const interval = setInterval(fetchSensorData, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  // 10-second auto-entry mechanism with mixed manual/auto values
  useEffect(() => {
    const saveAutoEntry = () => {
      // Get current values (manual if set, otherwise auto from MQTT)
      const currentTemperature = getCurrentValue('temperature');
      const currentHumidity = getCurrentValue('humidity');
      const currentLight = getCurrentValue('light');

      // Only save if we have at least one value
      if (currentTemperature !== null || currentHumidity !== null || currentLight !== null) {
        const autoEntry = {
          timestamp: new Date().toISOString(),
          temperature: currentTemperature,
          humidity: currentHumidity,
          light: currentLight,
          notes: 'Auto-entry (5-min interval)',
        };

        setHistoricalData(prev => {
          // Check if we already have a recent auto-entry (within last 8 seconds) to avoid duplicates
          const lastEntry = prev[prev.length - 1];
          if (lastEntry) {
            const lastEntryTime = new Date(lastEntry.timestamp);
            const now = new Date();
            const timeDiff = now.getTime() - lastEntryTime.getTime();

            // If last entry was less than 8 seconds ago and was also an auto-entry, skip
            if (timeDiff < 8000 && 'notes' in lastEntry && typeof lastEntry.notes === 'string' && lastEntry.notes.includes('Auto-entry')) {
              return prev;
            }
          }

          // Add new entry and keep only last 7 entries
          return [...prev.slice(-999), autoEntry];
        });

        console.log('10-second auto-entry saved:', {
          temperature: currentTemperature,
          humidity: currentHumidity,
          light: currentLight,
          manualModes: manualMode
        });
      }
    };

    // Set up 5-minute interval for auto-entries
    const autoEntryInterval = setInterval(saveAutoEntry, 300000); // 5 minutes (300000ms)

    // Cleanup on unmount
    return () => clearInterval(autoEntryInterval);
  }, [manualMode, manualValues, envData]); // Dependencies to react to manual value changes

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydroponicManualMode', JSON.stringify(manualMode));
    }
  }, [manualMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydroponicManualValues', JSON.stringify(manualValues));
    }
  }, [manualValues]);

  useEffect(() => {
    if (typeof window !== 'undefined' && historicalData.length > 0) {
      // Save the latest entry to the API
      const latestEntry = historicalData[historicalData.length - 1];
      saveEnvironmentalEntry(latestEntry);
    }
  }, [historicalData]);

  const saveEnvironmentalEntry = async (entry: any) => {
    try {
      await fetch('/api/environmental-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to save environmental entry:', error);
    }
  };

  // Automated lighting schedule (8 AM to 8 PM = 32k lux, rest = 0 lux)
  const getScheduledLightValue = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // 8 AM (8) to 8 PM (20) = 32000 lux, otherwise 0 lux
    if (currentHour >= 8 && currentHour < 20) {
      return 32000; // Day time - lights on
    } else {
      return 0; // Night time - lights off
    }
  };

  // Auto-save environmental data every 5 minutes with automated lighting
  useEffect(() => {
    const interval = setInterval(() => {
      const scheduledLightValue = getScheduledLightValue();

      const newEntry = {
        timestamp: new Date().toISOString(),
        temperature: manualMode.temperature ? manualValues.temperature : envData.temperature,
        humidity: manualMode.humidity ? manualValues.humidity : envData.humidity,
        light: manualMode.light ? manualValues.light : scheduledLightValue, // Use scheduled light if not in manual mode
      };

      setHistoricalData(prev => [...prev.slice(-999), newEntry]); // Keep last 1000 entries

      // Update current light value if not in manual mode
      if (!manualMode.light) {
        setEnvData(prev => ({ ...prev, light: scheduledLightValue }));
      }

      const isLightTime = scheduledLightValue > 0;
      console.log(`🌱 Auto-saved environmental entry: ${new Date().toLocaleTimeString()} (Light: ${isLightTime ? 'ON' : 'OFF'} - ${scheduledLightValue} lux)`);
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    console.log('🕐 Auto-save enabled: Environmental data will be saved every 5 minutes');
    console.log('💡 Light automation: 8 AM-8 PM = 32k lux, Night = 0 lux');

    return () => {
      clearInterval(interval);
      console.log('🛑 Auto-save disabled');
    };
  }, [envData, manualValues, manualMode]);


  // Fetch uploaded photos
  const fetchUploadedPhotos = useCallback(async () => {
    try {
      const response = await fetch('/api/plant-photos?page=dashboard');
      if (response.ok) {
        const data = await response.json();
        setUploadedPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  }, []);

  // Fetch uploaded videos
  const fetchUploadedVideos = useCallback(async () => {
    try {
      const response = await fetch('/api/plant-videos?page=dashboard');
      if (response.ok) {
        const data = await response.json();
        setUploadedVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  }, []);

  // Fetch uploaded documents
  const fetchUploadedDocuments = useCallback(async () => {
    try {
      const response = await fetch('/api/plant-documents?page=dashboard');
      if (response.ok) {
        const data = await response.json();
        setUploadedDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  }, []);

  // Fetch uploaded links
  const fetchUploadedLinks = useCallback(async () => {
    try {
      const response = await fetch('/api/plant-links?page=dashboard');
      if (response.ok) {
        const data = await response.json();
        setUploadedLinks(data.links || []);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    }
  }, []);

  // Load photos, videos, documents, and links on component mount and when refreshed
  useEffect(() => {
    fetchUploadedPhotos();
    fetchUploadedVideos();
    fetchUploadedDocuments();
    fetchUploadedLinks();
  }, [fetchUploadedPhotos, fetchUploadedVideos, fetchUploadedDocuments, fetchUploadedLinks, photoRefresh, linkRefresh]);

  // Debug: Log uploaded photos
  useEffect(() => {
    console.log('Uploaded photos:', uploadedPhotos);
    uploadedPhotos.forEach(photo => {
      console.log(`Photo: ${photo.originalName}, URL: ${photo.url}, Category: ${photo.category}`);
    });
  }, [uploadedPhotos]);

  // Graph helper functions
  const getFilteredGraphData = () => {
    const now = new Date();
    let cutoffTime = new Date();

    switch (graphTimeRange) {
      case '10min':
        cutoffTime = new Date(now.getTime() - 10 * 60 * 1000);
        break;
      case '1hour':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6hours':
        cutoffTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '1day':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1week':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return historicalData.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  };

  const toggleGraphLine = (parameter: 'temperature' | 'humidity' | 'light') => {
    setVisibleLines(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };


  const toggleManualMode = (parameter: 'temperature' | 'humidity' | 'light') => {
    setManualMode((prev: ManualModeState) => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };

  const handleEnvEntryChange = (field: keyof typeof envEntryForm, value: string) => {
    setEnvEntryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSaveEnvironmentalEntry = () => {
    // Update manual values with the entered values
    const newManualValues = {
      ...manualValues,
      temperature: parseFloat(envEntryForm.temperature) || 0,
      humidity: parseFloat(envEntryForm.humidity) || 0,
      light: parseFloat(envEntryForm.light) || 0,
    };

    setManualValues(newManualValues);

    // Switch to manual mode for the parameters that have values
    const newManualMode = { ...manualMode };
    if (envEntryForm.temperature) newManualMode.temperature = true;
    if (envEntryForm.humidity) newManualMode.humidity = true;
    if (envEntryForm.light) newManualMode.light = true;

    setManualMode(newManualMode);

    // Save to historical data with combined date and time
    const combinedDateTime = new Date(`${envEntryForm.date}T${envEntryForm.time}:00`).toISOString();
    const newEntry = {
      timestamp: combinedDateTime,
      temperature: parseFloat(envEntryForm.temperature) || null,
      humidity: parseFloat(envEntryForm.humidity) || null,
      light: parseFloat(envEntryForm.light) || null,
      notes: envEntryForm.notes || 'Manual entry',
    };

    setHistoricalData(prev => [...prev.slice(-999), newEntry]);

    // Reset form
    setEnvEntryForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      temperature: '',
      humidity: '',
      light: '',
      notes: ''
    });

    // Show success feedback (optional)
    alert('Environmental parameters saved successfully!');
  };



  // Complete system export functions that combine all data sources
  const exportCompleteSystemDataAsCSV = async () => {
    try {
      console.log('Starting complete system CSV export...');

      // Get all data sources
      const envData = historicalData;

      // Get nutrient data from localStorage
      const nutrientData = (() => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('nutrient-entries');
          return saved ? JSON.parse(saved) : [];
        }
        return [];
      })();

      // Get rose plant data from localStorage
      const rosePlantData = (() => {
        try {
          if (typeof window !== 'undefined') {
            const plantParams = localStorage.getItem('plantParams');
            const historicalData = localStorage.getItem('historicalData');
            const plantHistoricData = localStorage.getItem('rosePlantHistoricData');

            // Get individual stem data
            const stemDataMap: {[key: string]: Record<string, unknown>[]} = {};
            ['A', 'B', 'C', 'D'].forEach(stem => {
              const stemHistoryKey = `rosePlantStem${stem}History`;
              const stemHistory = localStorage.getItem(stemHistoryKey);
              if (stemHistory) {
                stemDataMap[stem] = JSON.parse(stemHistory);
              } else {
                stemDataMap[stem] = [];
              }
            });

            return {
              plantParams: plantParams ? JSON.parse(plantParams) : {},
              historicalData: historicalData ? JSON.parse(historicalData) : [],
              plantHistoricData: plantHistoricData ? JSON.parse(plantHistoricData) : [],
              stemData: stemDataMap
            };
          }
        } catch (error) {
          console.error('Error loading rose plant data:', error);
        }
        return { plantParams: {}, historicalData: [], plantHistoricData: [], stemData: {} };
      })();

      let csvContent = '';
      let totalRecords = 0;

      // Add metadata
      csvContent += '=== COMPLETE SYSTEM EXPORT ===\n';
      csvContent += `Export Date: ${new Date().toISOString()}\n`;
      csvContent += `Export Type: Complete System Data\n`;
      csvContent += '\n';

      // Environmental data section
      if (envData.length > 0) {
        csvContent += '=== ENVIRONMENTAL DATA ===\n';
        csvContent += 'Timestamp (ISO),Date,Time,Temperature (°C),Humidity (%),Light Intensity (lux),Notes\n';

        envData.forEach(entry => {
          const date = new Date(entry.timestamp);
          const formattedDate = date.toLocaleDateString();
          const formattedTime = date.toLocaleTimeString();
          const notes = ('notes' in entry && typeof entry.notes === 'string') ? entry.notes : '';

          const row = [
            `"${entry.timestamp}"`,
            `"${formattedDate}"`,
            `"${formattedTime}"`,
            entry.temperature?.toFixed(1) ?? '',
            entry.humidity?.toFixed(1) ?? '',
            entry.light?.toFixed(0) ?? '',
            `"${notes}"`
          ].join(',');
          csvContent += row + '\n';
          totalRecords++;
        });
        csvContent += '\n';
      }


      // Nutrient data section
      if (nutrientData.length > 0) {
        csvContent += '=== NUTRIENT FORMULATIONS ===\n';
        csvContent += 'Date,Time,Masterblend (g),Calcium Nitrate (g),Magnesium Sulfate (g),Total Volume (L),Notes\n';

        nutrientData.forEach((entry: any) => {
          const row = [
            entry.date || '',
            entry.time || '',
            entry.masterblend || '',
            entry.calciumNitrate || '',
            entry.magnesiumSulfate || '',
            entry.totalVolume || '',
            entry.notes || ''
          ].map(field => `"${field}"`).join(',');
          csvContent += row + '\n';
          totalRecords++;
        });
        csvContent += '\n';
      }

      // Rose plant data section
      const hasRosePlantData = rosePlantData.historicalData.length > 0 ||
                              rosePlantData.plantHistoricData.length > 0 ||
                              Object.values(rosePlantData.stemData).some(data => data.length > 0);

      if (hasRosePlantData) {
        csvContent += '=== ROSE PLANT DATA ===\n';
        csvContent += 'Date,Time,Number of Stems,Total Matured Flowers,Total Open Buds,Total Unopened Buds,Notes (Diseases/Issues)\n';

        // Create aggregated data like the rose plant page export
        const allRosePlantData: Array<{
          date: string;
          time: string;
          numberOfStems: number;
          totalMaturedFlowers: number;
          totalOpenBuds: number;
          totalUnopenedBuds: number;
          notes: string;
          timestamp: number;
        }> = [];

        // Add individual stem data (this is the main stem data from rose plant page)
        ['A', 'B', 'C', 'D'].forEach(stem => {
          const stemData = rosePlantData.stemData[stem];
          stemData.forEach((entry: Record<string, unknown>) => {
            const entryDate = String(entry[`stem${stem}_date`] || new Date(String(entry.timestamp)).toISOString().split('T')[0]);
            const entryTime = String(entry[`stem${stem}_time`] || new Date(String(entry.timestamp)).toTimeString().slice(0, 5));
            const maturedFlowers = Number(entry[`stem${stem}_maturedFlowers`]) || 0;
            const openBuds = Number(entry[`stem${stem}_openBuds`]) || 0;
            const unopenedBuds = Number(entry[`stem${stem}_unopenedBuds`]) || 0;
            const diseases = String(entry[`stem${stem}_diseases`] || '').trim();

            allRosePlantData.push({
              date: entryDate,
              time: entryTime,
              numberOfStems: 1, // Each row represents one stem measurement
              totalMaturedFlowers: maturedFlowers,
              totalOpenBuds: openBuds,
              totalUnopenedBuds: unopenedBuds,
              notes: diseases ? `Stem ${stem}: ${diseases}` : '',
              timestamp: Number(entry.timestamp) || 0
            });
          });
        });

        // Sort by timestamp like the rose plant page
        allRosePlantData.sort((a, b) => a.timestamp - b.timestamp);

        // Add the data in the exact format of the rose plant export
        allRosePlantData.forEach(entry => {
          const row = [
            entry.date,
            entry.time,
            entry.numberOfStems,
            entry.totalMaturedFlowers,
            entry.totalOpenBuds,
            entry.totalUnopenedBuds,
            entry.notes.replace(/"/g, '""') // Escape quotes in notes
          ].join(',');
          csvContent += row + '\n';
          totalRecords++;
        });

        csvContent += '\n';
      }

      // Rose plant media data section
      try {
        // Fetch rose plant videos
        const rosePlantVideos = await fetch('/api/rose-plant-videos').then(res => res.json()).then(data => data.videos || []).catch(() => []);

        if (rosePlantVideos.length > 0) {
          csvContent += '=== ROSE PLANT VIDEOS ===\n';
          csvContent += 'Upload Date,Original Name,Category,File Size (MB),Duration,Description\n';

          rosePlantVideos.forEach((video: any) => {
            const row = [
              video.uploadDate || '',
              video.originalName || '',
              video.category || '',
              video.size ? (video.size / (1024 * 1024)).toFixed(2) : '',
              video.duration || '',
              video.description || ''
            ].map(field => `"${field}"`).join(',');
            csvContent += row + '\n';
            totalRecords++;
          });
          csvContent += '\n';
        }

        // Fetch rose plant documents
        const rosePlantDocuments = await fetch('/api/rose-plant-documents').then(res => res.json()).then(data => data.documents || []).catch(() => []);

        if (rosePlantDocuments.length > 0) {
          csvContent += '=== ROSE PLANT DOCUMENTS ===\n';
          csvContent += 'Upload Date,Original Name,File Type,File Size (MB),Description\n';

          rosePlantDocuments.forEach((doc: any) => {
            const fileExtension = doc.originalName ? doc.originalName.split('.').pop()?.toUpperCase() : '';
            const row = [
              doc.uploadDate || '',
              doc.originalName || '',
              fileExtension || '',
              doc.size ? (doc.size / (1024 * 1024)).toFixed(2) : '',
              doc.description || ''
            ].map(field => `"${field}"`).join(',');
            csvContent += row + '\n';
            totalRecords++;
          });
          csvContent += '\n';
        }

        // Fetch rose plant links
        const rosePlantLinks = await fetch('/api/rose-plant-links').then(res => res.json()).then(data => data.links || []).catch(() => []);

        if (rosePlantLinks.length > 0) {
          csvContent += '=== ROSE PLANT LINKS/RESOURCES ===\n';
          csvContent += 'Upload Date,Title,URL,Category\n';

          rosePlantLinks.forEach((link: any) => {
            const row = [
              link.uploadDate || '',
              link.title || '',
              link.url || '',
              link.category || ''
            ].map(field => `"${field}"`).join(',');
            csvContent += row + '\n';
            totalRecords++;
          });
          csvContent += '\n';
        }
      } catch (error) {
        console.error('Error fetching rose plant media data:', error);
      }

      if (totalRecords === 0) {
        alert('No data available to export. Please ensure you have collected some data first.');
        return;
      }

      // Create and download file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `complete_system_data_${timestamp}.csv`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Successfully exported ${totalRecords} total records to CSV`);
      alert(`Successfully exported ${totalRecords} records to CSV!`);
    } catch (error) {
      console.error('Error exporting complete system CSV data:', error);
      alert('Error exporting data. Please check the console for details.');
    }
  };

  const exportCompleteSystemDataAsJSON = async () => {
    try {
      console.log('Starting complete system JSON export...');

      // Get all data sources
      const envData = historicalData;

      // Get nutrient data from localStorage
      const nutrientData = (() => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('nutrient-entries');
          return saved ? JSON.parse(saved) : [];
        }
        return [];
      })();

      // Get rose plant data from localStorage
      const rosePlantData = (() => {
        try {
          if (typeof window !== 'undefined') {
            const plantParams = localStorage.getItem('plantParams');
            const historicalData = localStorage.getItem('historicalData');
            const plantHistoricData = localStorage.getItem('rosePlantHistoricData');

            // Get individual stem data
            const stemDataMap: {[key: string]: Record<string, unknown>[]} = {};
            ['A', 'B', 'C', 'D'].forEach(stem => {
              const stemHistoryKey = `rosePlantStem${stem}History`;
              const stemHistory = localStorage.getItem(stemHistoryKey);
              if (stemHistory) {
                stemDataMap[stem] = JSON.parse(stemHistory);
              } else {
                stemDataMap[stem] = [];
              }
            });

            return {
              plantParams: plantParams ? JSON.parse(plantParams) : {},
              historicalData: historicalData ? JSON.parse(historicalData) : [],
              plantHistoricData: plantHistoricData ? JSON.parse(plantHistoricData) : [],
              stemData: stemDataMap
            };
          }
        } catch (error) {
          console.error('Error loading rose plant data:', error);
        }
        return { plantParams: {}, historicalData: [], plantHistoricData: [], stemData: {} };
      })();

      // Fetch rose plant media data
      const rosePlantVideos = await fetch('/api/rose-plant-videos').then(res => res.json()).then(data => data.videos || []).catch(() => []);
      const rosePlantDocuments = await fetch('/api/rose-plant-documents').then(res => res.json()).then(data => data.documents || []).catch(() => []);
      const rosePlantLinks = await fetch('/api/rose-plant-links').then(res => res.json()).then(data => data.links || []).catch(() => []);

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          exportType: 'Complete System Data',
          description: 'Comprehensive export of all available system data including environmental, nutrient, rose plant data, and rose plant media (videos, documents, links)',
          totalRecords: envData.length + nutrientData.length + rosePlantData.historicalData.length + rosePlantData.plantHistoricData.length + Object.values(rosePlantData.stemData).reduce((sum, data) => sum + data.length, 0) + rosePlantVideos.length + rosePlantDocuments.length + rosePlantLinks.length
        },
        environmentalData: {
          description: 'Environmental monitoring data (temperature, humidity, light)',
          totalEntries: envData.length,
          data: envData.map(entry => ({
            timestamp: entry.timestamp,
            temperature: entry.temperature,
            humidity: entry.humidity,
            lightIntensity: entry.light,
            notes: (entry as any).notes || null
          }))
        },
        nutrientData: {
          description: 'Nutrient formulation data',
          totalEntries: nutrientData.length,
          data: nutrientData.map((entry: any) => ({
            date: entry.date,
            time: entry.time,
            masterblend: entry.masterblend,
            calciumNitrate: entry.calciumNitrate,
            magnesiumSulfate: entry.magnesiumSulfate,
            totalVolume: entry.totalVolume,
            calculatedElements: entry.calculatedElements || null,
            notes: entry.notes || null
          }))
        },
        rosePlantData: {
          description: 'Rose plant monitoring and parameter data',
          plantParameters: rosePlantData.plantParams,
          historicalData: {
            totalEntries: rosePlantData.historicalData.length,
            data: rosePlantData.historicalData
          },
          plantHistoricData: {
            totalEntries: rosePlantData.plantHistoricData.length,
            data: rosePlantData.plantHistoricData
          },
          individualStemData: {
            description: 'Individual stem measurements (A, B, C, D)',
            totalEntries: Object.values(rosePlantData.stemData).reduce((sum, data) => sum + data.length, 0),
            stemA: {
              totalEntries: rosePlantData.stemData.A.length,
              data: rosePlantData.stemData.A.map((entry: Record<string, unknown>) => ({
                date: String(entry[`stemA_date`] || new Date(String(entry.timestamp)).toISOString().split('T')[0]),
                time: String(entry[`stemA_time`] || new Date(String(entry.timestamp)).toTimeString().slice(0, 5)),
                numberOfStems: Number(entry[`stemA_numberOfStems`] || 0),
                totalMaturedFlowers: Number(entry[`stemA_totalMaturedFlowers`] || 0),
                totalOpenBuds: Number(entry[`stemA_totalOpenBuds`] || 0),
                totalUnopenedBuds: Number(entry[`stemA_totalUnopenedBuds`] || 0),
                notes: String(entry[`stemA_notes`] || ''),
                timestamp: entry.timestamp
              }))
            },
            stemB: {
              totalEntries: rosePlantData.stemData.B.length,
              data: rosePlantData.stemData.B.map((entry: Record<string, unknown>) => ({
                date: String(entry[`stemB_date`] || new Date(String(entry.timestamp)).toISOString().split('T')[0]),
                time: String(entry[`stemB_time`] || new Date(String(entry.timestamp)).toTimeString().slice(0, 5)),
                numberOfStems: Number(entry[`stemB_numberOfStems`] || 0),
                totalMaturedFlowers: Number(entry[`stemB_totalMaturedFlowers`] || 0),
                totalOpenBuds: Number(entry[`stemB_totalOpenBuds`] || 0),
                totalUnopenedBuds: Number(entry[`stemB_totalUnopenedBuds`] || 0),
                notes: String(entry[`stemB_notes`] || ''),
                timestamp: entry.timestamp
              }))
            },
            stemC: {
              totalEntries: rosePlantData.stemData.C.length,
              data: rosePlantData.stemData.C.map((entry: Record<string, unknown>) => ({
                date: String(entry[`stemC_date`] || new Date(String(entry.timestamp)).toISOString().split('T')[0]),
                time: String(entry[`stemC_time`] || new Date(String(entry.timestamp)).toTimeString().slice(0, 5)),
                numberOfStems: Number(entry[`stemC_numberOfStems`] || 0),
                totalMaturedFlowers: Number(entry[`stemC_totalMaturedFlowers`] || 0),
                totalOpenBuds: Number(entry[`stemC_totalOpenBuds`] || 0),
                totalUnopenedBuds: Number(entry[`stemC_totalUnopenedBuds`] || 0),
                notes: String(entry[`stemC_notes`] || ''),
                timestamp: entry.timestamp
              }))
            },
            stemD: {
              totalEntries: rosePlantData.stemData.D.length,
              data: rosePlantData.stemData.D.map((entry: Record<string, unknown>) => ({
                date: String(entry[`stemD_date`] || new Date(String(entry.timestamp)).toISOString().split('T')[0]),
                time: String(entry[`stemD_time`] || new Date(String(entry.timestamp)).toTimeString().slice(0, 5)),
                numberOfStems: Number(entry[`stemD_numberOfStems`] || 0),
                totalMaturedFlowers: Number(entry[`stemD_totalMaturedFlowers`] || 0),
                totalOpenBuds: Number(entry[`stemD_totalOpenBuds`] || 0),
                totalUnopenedBuds: Number(entry[`stemD_totalUnopenedBuds`] || 0),
                notes: String(entry[`stemD_notes`] || ''),
                timestamp: entry.timestamp
              }))
            }
          }
        },
        rosePlantMedia: {
          description: 'Rose plant media files and resources',
          videos: {
            totalEntries: rosePlantVideos.length,
            data: rosePlantVideos.map((video: any) => ({
              id: video.id,
              originalName: video.originalName,
              uploadDate: video.uploadDate,
              category: video.category,
              size: video.size,
              duration: video.duration,
              description: video.description,
              url: video.url
            }))
          },
          documents: {
            totalEntries: rosePlantDocuments.length,
            data: rosePlantDocuments.map((doc: any) => ({
              id: doc.id,
              originalName: doc.originalName,
              uploadDate: doc.uploadDate,
              size: doc.size,
              description: doc.description,
              url: doc.url
            }))
          },
          links: {
            totalEntries: rosePlantLinks.length,
            data: rosePlantLinks.map((link: any) => ({
              id: link.id,
              title: link.title,
              url: link.url,
              uploadDate: link.uploadDate,
              category: link.category
            }))
          }
        }
      };

      const totalRecords = exportData.metadata.totalRecords;

      if (totalRecords === 0) {
        alert('No data available to export. Please ensure you have collected some data first.');
        return;
      }

      // Create and download file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `complete_system_data_${timestamp}.json`;

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Successfully exported ${totalRecords} total records to JSON`);
      alert(`Successfully exported ${totalRecords} records to JSON!`);
    } catch (error) {
      console.error('Error exporting complete system JSON data:', error);
      alert('Error exporting data. Please check the console for details.');
    }
  };

  // Enhanced photo upload handler
  const handleEnhancedPhotoUpload = async (files: FileList, metadata: {
    category: string;
    description?: string;
    tags?: string;
    location?: string;
    plantStage?: string;
    severity?: string;
    stemId?: string;
  }) => {
    const fileArray = Array.from(files);
    let successCount = 0;
    let failCount = 0;

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('stemId', metadata.stemId || 'SYSTEM');
        formData.append('category', metadata.category);
        formData.append('page', 'dashboard'); // Page context
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.tags) formData.append('tags', metadata.tags);
        if (metadata.location) formData.append('location', metadata.location);
        if (metadata.plantStage) formData.append('plantStage', metadata.plantStage);
        if (metadata.severity) formData.append('severity', metadata.severity);

        const response = await fetch('/api/plant-photos', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        failCount++;
      }
    }

    if (successCount > 0) {
      alert(`Successfully uploaded ${successCount} photo${successCount !== 1 ? 's' : ''}!${failCount > 0 ? ` ${failCount} failed.` : ''}`);
      // Refresh the photo galleries
      setPhotoRefresh(prev => prev + 1);
    } else {
      alert('Failed to upload photos. Please try again.');
    }
  };

  // Enhanced video upload handler
  const handleEnhancedVideoUpload = async (files: FileList, metadata: {
    category: string;
    description?: string;
    tags?: string;
    location?: string;
    duration?: string;
    stemId?: string;
  }) => {
    const fileArray = Array.from(files);
    let successCount = 0;
    let failCount = 0;

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('stemId', metadata.stemId || 'SYSTEM');
        formData.append('category', metadata.category);
        formData.append('page', 'dashboard'); // Page context
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.tags) formData.append('tags', metadata.tags);
        if (metadata.location) formData.append('location', metadata.location);
        if (metadata.duration) formData.append('duration', metadata.duration);

        const response = await fetch('/api/plant-videos', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Video upload error:', error);
        failCount++;
      }
    }

    if (successCount > 0) {
      alert(`Successfully uploaded ${successCount} video${successCount !== 1 ? 's' : ''}!${failCount > 0 ? ` ${failCount} failed.` : ''}`);
      // Refresh the video galleries
      setPhotoRefresh(prev => prev + 1);
    } else {
      alert('Failed to upload videos. Please try again.');
    }
  };

  // Enhanced document upload handler
  const handleEnhancedDocumentUpload = async (files: FileList, metadata: {
    category: string;
    description?: string;
    tags?: string;
    location?: string;
    documentType?: string;
    stemId?: string;
  }) => {
    const fileArray = Array.from(files);
    let successCount = 0;
    let failCount = 0;

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('stemId', metadata.stemId || 'SYSTEM');
        formData.append('category', metadata.category);
        formData.append('page', 'dashboard'); // Page context
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.tags) formData.append('tags', metadata.tags);
        if (metadata.location) formData.append('location', metadata.location);
        if (metadata.documentType) formData.append('documentType', metadata.documentType);

        const response = await fetch('/api/plant-documents', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Document upload error:', error);
        failCount++;
      }
    }

    if (successCount > 0) {
      alert(`Successfully uploaded ${successCount} document${successCount !== 1 ? 's' : ''}!${failCount > 0 ? ` ${failCount} failed.` : ''}`);
      // Refresh the document galleries
      setPhotoRefresh(prev => prev + 1);
    } else {
      alert('Failed to upload documents. Please try again.');
    }
  };

  // Enhanced link upload handler
  const handleEnhancedLinkUpload = async (metadata: {
    title: string;
    url: string;
    category: string;
    description?: string;
    tags?: string;
    location?: string;
    stemId?: string;
  }) => {
    try {
      const formData = new FormData();
      formData.append('title', metadata.title);
      formData.append('url', metadata.url);
      formData.append('stemId', metadata.stemId || 'SYSTEM');
      formData.append('category', metadata.category);
      formData.append('page', 'dashboard'); // Page context
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', metadata.tags);
      if (metadata.location) formData.append('location', metadata.location);

      const response = await fetch('/api/plant-links', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Link added successfully!');
        setLinkRefresh(prev => prev + 1);
      } else {
        alert('Failed to add link. Please try again.');
      }
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Error adding link. Please try again.');
    }
  };

  // Modal handlers for photos, videos, and documents
  const openPhotoModal = (photo: UploadedPhoto) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setIsPhotoModalOpen(false);
  };

  const openVideoModal = (video: UploadedVideo) => {
    console.log('Opening video modal with video:', video);
    console.log('Video URL:', video.url);

    // Ensure the video URL is properly formatted for production
    const videoWithFullUrl = {
      ...video,
      url: video.url.startsWith('/') ? video.url : `/${video.url}`
    };

    setSelectedVideo(videoWithFullUrl);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsVideoModalOpen(false);
  };

  const openDocumentModal = (document: UploadedDocument) => {
    setSelectedDocument(document);
    setIsDocumentModalOpen(true);
  };

  const closeDocumentModal = () => {
    setSelectedDocument(null);
    setIsDocumentModalOpen(false);
  };

  // Link modal handlers
  const openLinkModal = (link: any) => {
    setSelectedLink(link);
    setIsLinkModalOpen(true);
  };

  const closeLinkModal = () => {
    setSelectedLink(null);
    setIsLinkModalOpen(false);
  };

  // Additional modal handlers for legacy compatibility
  const closeUploadedPhotoModal = () => {
    closePhotoModal();
  };

  const downloadUploadedPhoto = (photo: UploadedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.originalName;
    link.click();
  };

  // Delete functionality disabled - photos are now non-deletable
  // const deleteUploadedPhoto = async (photo: UploadedPhoto) => {
  //   if (!confirm('Are you sure you want to delete this photo?')) return;

  //   try {
  //     const response = await fetch(`/api/plant-photos?photoId=${photo.id}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       alert('Photo deleted successfully!');
  //       setPhotoRefresh(prev => prev + 1);
  //       closePhotoModal();
  //     } else {
  //       alert('Failed to delete photo.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting photo:', error);
  //     alert('Failed to delete photo.');
  //   }
  // };

  const downloadVideo = (video: UploadedVideo) => {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = video.originalName;
    link.click();
  };

  // Delete functionality disabled - videos are now non-deletable
  // const deleteVideo = async (video: UploadedVideo) => {
  //   if (!confirm('Are you sure you want to delete this video?')) return;

  //   try {
  //     const response = await fetch(`/api/plant-videos?videoId=${video.id}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       alert('Video deleted successfully!');
  //       setPhotoRefresh(prev => prev + 1);
  //       closeVideoModal();
  //     } else {
  //       alert('Failed to delete video.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting video:', error);
  //     alert('Failed to delete video.');
  //   }
  // };

  const downloadDocument = (doc: UploadedDocument) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.originalName;
    link.click();
  };

  // Delete functionality disabled - documents are now non-deletable
  // const deleteDocument = async (document: UploadedDocument) => {
  //   if (!confirm('Are you sure you want to delete this document?')) return;

  //   try {
  //     const response = await fetch(`/api/plant-documents?documentId=${document.id}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       alert('Document deleted successfully!');
  //       setPhotoRefresh(prev => prev + 1);
  //       closeDocumentModal();
  //     } else {
  //       alert('Failed to delete document.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting document:', error);
  //     alert('Failed to delete document.');
  //   }
  // };

  // Delete link function
  const deleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/plant-links?linkId=${linkId}&page=dashboard`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Link deleted successfully!');
        setLinkRefresh(prev => prev + 1);
        closeLinkModal();
      } else {
        alert('Failed to delete link. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Error deleting link. Please try again.');
    }
  };

  const updateManualValue = (parameter: 'temperature' | 'humidity' | 'light' | 'ph' | 'ec' | 'waterTemp' | 'waterQuality', value: number) => {
    setManualValues((prev: Record<string, number>) => ({
      ...prev,
      [parameter]: value
    }));
  };

  const getCurrentValue = (parameter: 'temperature' | 'humidity' | 'light'): number | null => {
    // Return null during SSR to prevent hydration errors
    if (!mounted) return null;

    const isManual = manualMode[parameter];
    const manualVal = manualValues[parameter];
    const envVal = envData[parameter];

    // For light parameter, use scheduled value when not in manual mode
    if (parameter === 'light' && !isManual) {
      return getScheduledLightValue();
    }

    console.log(`getCurrentValue(${parameter}):`, {
      isManual,
      manualVal,
      envVal,
      returning: isManual ? manualVal : envVal
    });

    if (isManual) {
      return manualVal;
    }
    return envVal;
  };

  // Export functions for environmental data
  const exportEnvironmentalDataAsCSV = () => {
    if (historicalData.length === 0) {
      alert('No environmental data to export.');
      return;
    }

    const headers = ['Timestamp (ISO)', 'Date', 'Time', 'Temperature (°C)', 'Humidity (%)', 'Light Intensity (lux)', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...historicalData.map(entry => {
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        const notes = ('notes' in entry && typeof entry.notes === 'string') ? entry.notes : '';

        return [
          `"${entry.timestamp}"`,
          `"${formattedDate}"`,
          `"${formattedTime}"`,
          entry.temperature?.toFixed(1) ?? '',
          entry.humidity?.toFixed(1) ?? '',
          entry.light?.toFixed(0) ?? '',
          `"${notes}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `environmental_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportEnvironmentalDataAsJSON = () => {
    if (historicalData.length === 0) {
      alert('No environmental data to export.');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      dataType: 'Environmental Parameters',
      description: 'Hydroponic system environmental monitoring data',
      totalEntries: historicalData.length,
      data: historicalData.map(entry => ({
        timestamp: entry.timestamp,
        date: new Date(entry.timestamp).toLocaleDateString(),
        time: new Date(entry.timestamp).toLocaleTimeString(),
        temperature: entry.temperature,
        humidity: entry.humidity,
        lightIntensity: entry.light,
        notes: ('notes' in entry && typeof entry.notes === 'string') ? entry.notes : null
      }))
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `environmental_data_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const saveEnvironmentalEntryManual = () => {
    const newEntry = {
      timestamp: new Date().toISOString(),
      temperature: manualMode.temperature ? manualValues.temperature : envData.temperature,
      humidity: manualMode.humidity ? manualValues.humidity : envData.humidity,
      light: manualMode.light ? manualValues.light : getScheduledLightValue(),
    };

    setHistoricalData(prev => [...prev.slice(-999), newEntry]); // Keep last 1000 entries for comprehensive CSV export

    // Update current values if in manual mode
    if (manualMode.temperature) setEnvData(prev => ({ ...prev, temperature: manualValues.temperature }));
    if (manualMode.humidity) setEnvData(prev => ({ ...prev, humidity: manualValues.humidity }));
    if (manualMode.light) setEnvData(prev => ({ ...prev, light: manualValues.light }));
  };

  // Delete functionality disabled - entries are now non-deletable
  // const deleteEnvironmentalEntry = (timestamp: string) => {
  //   const updatedData = historicalData.filter(entry => entry.timestamp !== timestamp);
  //   setHistoricalData(updatedData);
  //   localStorage.setItem('hydroponicHistoricalData', JSON.stringify(updatedData));
  // };

  // const deleteHydroponicEntry = (timestamp: string) => {
  //   const updatedData = hydroHistoricalData.filter(entry => entry.timestamp !== timestamp);
  //   setHydroHistoricalData(updatedData);
  //   localStorage.setItem('hydroponicHydroHistoricalData', JSON.stringify(updatedData));
  // };

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Hero Section */}
      <section className={`relative py-20 lg:py-32 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800'
          : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dark Mode Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-full transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } shadow-lg`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-800"></div>
              )}
            </button>
          </div>

          <div className="text-center space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
              <Activity className="w-4 h-4 mr-2" />
              Personal Research Journey • Live in Germany
            </div>

            <div className="flex justify-center items-center space-x-4 mb-6">
              <Sprout className="w-12 h-12 text-green-600" />
              <Droplets className="w-10 h-10 text-blue-500" />
              <Sun className="w-12 h-12 text-yellow-500" />
            </div>

            <h1 className={`text-4xl lg:text-6xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">#OneFarmer</span>{' '}
              Journey
            </h1>

            <p className={`text-xl leading-relaxed max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              My personal hydroponics research journey in Germany - replacing traditional soil systems
              with modern hydroponic solutions. Tracking real-time data, sharing knowledge, and
              documenting the complete growing process for the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="#milestone"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                View Current Progress
                <Target className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="#data-dashboard"
                className="inline-flex items-center px-8 py-4 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors duration-200"
              >
                Live Sensor Data
                <BarChart className="ml-2 w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Milestone One Section */}
      <section id="milestone" className={`py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Milestone One - Foundation Phase
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Three Growing Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Replacing entire soil systems with hydroponics across three specialized categories,
              each optimized with specific hydroponic systems and nutrient solutions from Netherlands.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Greens Category */}
            <div className={`rounded-xl p-4 sm:p-6 lg:p-8 border hover:shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-400/30'
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
            }`}>
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1. Greens</h3>
              <div className={`rounded-lg p-4 mb-6 ${
                isDarkMode ? 'bg-green-500/10' : 'bg-green-100'
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-green-300' : 'text-green-800'
                  }`}>System: NFT (Nutrient Film Technique)</div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>Optimal for leafy vegetables</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-green-400/30'
                    : 'bg-white border-green-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Coriander</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-green-400/30'
                    : 'bg-white border-green-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Mint</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-green-400/30'
                    : 'bg-white border-green-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Spinach</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-green-400/30'
                    : 'bg-white border-green-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Amaranth</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
              </div>
            </div>

            {/* Vegetables Category */}
            <div className={`rounded-xl p-4 sm:p-6 lg:p-8 border hover:shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-400/30'
                : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-100'
            }`}>
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto ${
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <Sprout className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. Vegetables</h3>
              <div className={`rounded-lg p-4 mb-6 ${
                isDarkMode ? 'bg-orange-500/10' : 'bg-orange-100'
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-orange-300' : 'text-orange-800'
                  }`}>System: Dutch Bucket</div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  }`}>Perfect for fruiting plants</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-orange-400/30'
                    : 'bg-white border-orange-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Tomato</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-orange-400/30'
                    : 'bg-white border-orange-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Okra (Bhendi)</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-orange-400/30'
                    : 'bg-white border-orange-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Chilli</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
              </div>
            </div>

            {/* Flowers Category */}
            <div className={`rounded-xl p-4 sm:p-6 lg:p-8 border hover:shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-400/30'
                : 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-100'
            }`}>
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto ${
                isDarkMode ? 'bg-pink-500/20' : 'bg-pink-100'
              }`}>
                <FlowerIcon className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3. Flowers</h3>
              <div className={`rounded-lg p-4 mb-6 ${
                isDarkMode ? 'bg-pink-500/10' : 'bg-pink-100'
              }`}>
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-pink-300' : 'text-pink-800'
                  }`}>System: Dutch Bucket</div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>Ideal for flowering plants</div>
                </div>
              </div>
              <div className="space-y-3">
                <Link
                  href="/onefarmer/rose-plant"
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer group ${
                    isDarkMode
                      ? 'bg-gray-700 border-pink-400/30 hover:bg-gray-600'
                      : 'bg-white border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  <div className="flex items-center">
                    <FlowerIcon className="w-4 h-4 text-pink-600 mr-2" />
                    <span className={`font-medium group-hover:text-pink-700 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>Rose</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                  }`}>Growing</span>
                </Link>
                <Link
                  href="/onefarmer/hibiscus-plant"
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer group ${
                    isDarkMode
                      ? 'bg-gray-700 border-pink-400/30 hover:bg-gray-600'
                      : 'bg-white border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  <div className="flex items-center">
                    <FlowerIcon className="w-4 h-4 text-pink-600 mr-2" />
                    <span className={`font-medium group-hover:text-pink-700 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>Hibiscus</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                  }`}>Growing</span>
                </Link>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-pink-400/30'
                    : 'bg-white border-pink-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Jasmine</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-pink-400/30'
                    : 'bg-white border-pink-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Kanakambaram</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-pink-400/30'
                    : 'bg-white border-pink-200'
                }`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Marigold</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>Planning</span>
                </div>
              </div>
            </div>
          </div>


          {/* Environmental Parameters */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">System Parameters Monitoring</h3>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Real-time monitoring of environmental conditions
                with interactive tracking and data visualization.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-4xl mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Current Status:</strong> Active monitoring for <strong>Flowers Category</strong> (Rose plant).
                  Greens and Vegetables categories will show live data when plants are actively growing.
                </p>
              </div>
            </div>

            {/* Environmental Parameters */}
            <div className="mb-12">
              <div className={`rounded-xl p-4 sm:p-6 lg:p-8 border transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-400/30'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
              }`}>
                <div className="flex items-center mb-6">
                  <Sun className="w-8 h-8 text-green-600 mr-3" />
                  <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Environmental Parameters</h4>
                </div>

                {/* Environmental Parameters */}
                <div className="mb-8">
                  <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-800 border-green-400/30 text-white'
                      : 'bg-white border-green-200'
                  }`}>
                    <h5 className={`font-semibold mb-4 flex items-center ${
                      isDarkMode ? 'text-green-400' : 'text-green-800'
                    }`}>
                      <Activity className="w-5 h-5 text-green-600 mr-2" />
                      Environmental Parameters
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className={`rounded-lg p-4 transition-colors duration-300 ${
                        isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Air Temperature</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold">{getCurrentValue('temperature')?.toFixed(0) ?? '--'}°C</span>
                            <button
                              onClick={() => toggleManualMode('temperature')}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                manualMode.temperature ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                  manualMode.temperature ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-green-600">Target: 18-24°C</div>
                      </div>
                      <div className={`rounded-lg p-4 transition-colors duration-300 ${
                        isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Air Humidity</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold">{getCurrentValue('humidity')?.toFixed(0) ?? '--'}%</span>
                            <button
                              onClick={() => toggleManualMode('humidity')}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                manualMode.humidity ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                  manualMode.humidity ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-green-600">Target: 50-70%</div>
                      </div>
                      <div className={`rounded-lg p-4 transition-colors duration-300 ${
                        isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Light Intensity</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold">{getCurrentValue('light')?.toFixed(0) ?? '--'} lux</span>
                            <button
                              onClick={() => toggleManualMode('light')}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                manualMode.light ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                  manualMode.light ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-green-600">Target: 20000-40000 lux</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automated Lighting Schedule - Compact */}
                <div className="mb-4">
                  <div className={`rounded-lg p-4 border shadow-sm transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-800 border-yellow-500/50 text-white'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                      <h3 className={`text-lg font-semibold flex items-center mb-2 sm:mb-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Sun className="w-5 h-5 text-yellow-500 mr-2" />
                        Auto Lighting
                        <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full font-normal">
                          ON
                        </span>
                      </h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        8AM-8PM: 32k lux | Night: 0 lux
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        {getScheduledLightValue() > 0 ? (
                          <Sun className="w-4 h-4 text-yellow-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
                        )}
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {getScheduledLightValue() > 0 ? 'LIGHTS ON' : 'LIGHTS OFF'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-600">
                          {getScheduledLightValue().toLocaleString()} lux
                        </div>
                        <div className="text-xs text-gray-500">
                          Next: {getScheduledLightValue() > 0 ? '8PM' : '8AM'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Environmental Parameters Entry */}
                <div className="mb-8">
                  <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-800 border-green-400/30 text-white'
                      : 'bg-white border-green-200'
                  }`}>
                    <h3 className={`text-xl font-bold mb-6 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Plus className="w-6 h-6 text-green-600 mr-2" />
                      Add Environmental Parameters Entry
                    </h3>


                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            value={envEntryForm.date}
                            onChange={(e) => handleEnvEntryChange('date', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={(() => {
                              const hour24 = parseInt(envEntryForm.time.split(':')[0]) || 0;
                              if (hour24 === 0) return 12;
                              if (hour24 > 12) return hour24 - 12;
                              return hour24;
                            })()}
                            onChange={(e) => {
                              const hour = parseInt(e.target.value) || 1;
                              const minute = envEntryForm.time.split(':')[1] || '00';
                              const currentHour24 = parseInt(envEntryForm.time.split(':')[0]) || 0;
                              const isAM = currentHour24 < 12;
                              const hour24 = isAM ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
                              handleEnvEntryChange('time', `${hour24.toString().padStart(2, '0')}:${minute}`);
                            }}
                            className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center"
                            placeholder="12"
                          />
                          <span className="flex items-center text-gray-500">:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={envEntryForm.time.split(':')[1] || '00'}
                            onChange={(e) => {
                              const hour = envEntryForm.time.split(':')[0] || '00';
                              const minute = parseInt(e.target.value).toString().padStart(2, '0');
                              handleEnvEntryChange('time', `${hour}:${minute}`);
                            }}
                            className="w-16 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center"
                            placeholder="00"
                          />
                          <select
                            value={parseInt(envEntryForm.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                            onChange={(e) => {
                              const currentHour = parseInt(envEntryForm.time.split(':')[0]);
                              const minute = envEntryForm.time.split(':')[1] || '00';
                              let newHour = currentHour;

                              if (e.target.value === 'AM' && currentHour >= 12) {
                                newHour = currentHour === 12 ? 0 : currentHour - 12;
                              } else if (e.target.value === 'PM' && currentHour < 12) {
                                newHour = currentHour === 0 ? 12 : currentHour + 12;
                              }

                              handleEnvEntryChange('time', `${newHour.toString().padStart(2, '0')}:${minute}`);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Air Temperature (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={envEntryForm.temperature}
                          onChange={(e) => handleEnvEntryChange('temperature', e.target.value)}
                          placeholder="e.g., 22.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Air Humidity (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={envEntryForm.humidity}
                          onChange={(e) => handleEnvEntryChange('humidity', e.target.value)}
                          placeholder="e.g., 65.0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Light Intensity (lux)</label>
                        <input
                          type="number"
                          step="100"
                          value={envEntryForm.light}
                          onChange={(e) => handleEnvEntryChange('light', e.target.value)}
                          placeholder="e.g., 30000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label>
                        <textarea
                          value={envEntryForm.notes}
                          onChange={(e) => handleEnvEntryChange('notes', e.target.value)}
                          placeholder="Optional notes about conditions or observations..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={handleSaveEnvironmentalEntry}
                          className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Entry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Environmental Entries */}
                <div className="mb-8">
                  <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-800 border-green-400/30 text-white'
                      : 'bg-white border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <BarChart className="w-6 h-6 text-green-600 mr-2" />
                        Recent Environmental Entries
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                        <button
                          onClick={exportEnvironmentalDataAsCSV}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={historicalData.length === 0}
                          title={historicalData.length === 0 ? "No data to export" : "Export as CSV"}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          CSV
                        </button>
                        <button
                          onClick={exportEnvironmentalDataAsJSON}
                          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={historicalData.length === 0}
                          title={historicalData.length === 0 ? "No data to export" : "Export as JSON"}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          JSON
                        </button>
                      </div>
                    </div>

                    {historicalData.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Date & Time</th>
                              <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Air Temperature (°C)</th>
                              <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Air Humidity (%)</th>
                              <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Light Intensity (lux)</th>
                              <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Notes</th>
                              <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historicalData.slice(-10).reverse().map((entry, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`font-medium ${
                                    entry.temperature && entry.temperature >= 18 && entry.temperature <= 24
                                      ? 'text-green-600' : 'text-orange-500'
                                  }`}>
                                    {entry.temperature?.toFixed(1) ?? '--'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`font-medium ${
                                    entry.humidity && entry.humidity >= 50 && entry.humidity <= 70
                                      ? 'text-green-600' : 'text-orange-500'
                                  }`}>
                                    {entry.humidity?.toFixed(1) ?? '--'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`font-medium ${
                                    entry.light && entry.light >= 20000 && entry.light <= 40000
                                      ? 'text-green-600' : 'text-orange-500'
                                  }`}>
                                    {entry.light?.toFixed(0) ?? '--'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">{('notes' in entry && typeof entry.notes === 'string') ? entry.notes : '--'}</td>
                                <td className="py-3 px-4">
                                  {/* Delete functionality disabled */}
                                  <span className="text-gray-400 text-sm">Protected</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <BarChart className="w-12 h-12 mx-auto" />
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No environmental entries recorded yet.</p>
                        <p className="text-sm text-gray-400">Add your first entry using the form above.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Environmental Data Graph */}
                <div className="mb-8">
                  <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
                    isDarkMode
                      ? 'bg-gray-800 border-green-400/30 text-white'
                      : 'bg-white border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                        Environmental Data Trends
                      </h3>

                      {/* Time Range Selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Time Range:</span>
                        <select
                          value={graphTimeRange}
                          onChange={(e) => setGraphTimeRange(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="10min">Last 10 Minutes</option>
                          <option value="1hour">Last Hour</option>
                          <option value="6hours">Last 6 Hours</option>
                          <option value="1day">Last Day</option>
                          <option value="1week">Last Week</option>
                        </select>
                      </div>
                    </div>

                    {/* Parameter Toggle Buttons */}
                    <div className="flex items-center space-x-4 mb-6">
                      <span className="text-sm text-gray-600">Show:</span>
                      <button
                        onClick={() => toggleGraphLine('temperature')}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          visibleLines.temperature
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        Temperature
                      </button>
                      <button
                        onClick={() => toggleGraphLine('humidity')}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          visibleLines.humidity
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        Humidity
                      </button>
                      <button
                        onClick={() => toggleGraphLine('light')}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          visibleLines.light
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        Light Intensity
                      </button>
                    </div>

                    {/* Advanced Chart Container */}
                    <div className={`rounded-lg p-6 border shadow-inner transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                        : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
                    }`}>
                      {(() => {
                        const filteredData = getFilteredGraphData();

                        if (filteredData.length < 2) {
                          return (
                            <div className="text-center py-20">
                              <div className="relative">
                                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl"></div>
                              </div>
                              <h3 className="text-xl font-semibold text-gray-600 mb-2">Insufficient Data</h3>
                              <p className="text-gray-500 mb-1">Not enough data points for the selected time range.</p>
                              <p className="text-sm text-gray-400">Need at least 2 data points to display trends.</p>
                            </div>
                          );
                        }

                        // Prepare chart data with proper time formatting
                        const chartData = filteredData.map(entry => ({
                          time: new Date(entry.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          }),
                          fullTime: new Date(entry.timestamp).toLocaleString(),
                          temperature: entry.temperature,
                          humidity: entry.humidity,
                          light: entry.light ? Math.round(entry.light / 1000) : null, // Convert lux to thousands for better readability
                        }));

                        // Custom tooltip component
                        const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; dataKey?: string; payload?: Record<string, unknown> }> }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className={`p-4 border rounded-lg shadow-lg transition-colors duration-300 ${
                                isDarkMode
                                  ? 'bg-gray-800 border-gray-600'
                                  : 'bg-white border-gray-200'
                              }`}>
                                <p className={`font-semibold mb-2 ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}>{String(data?.fullTime || '')}</p>
                                {payload.map((entry: { value: number; name: string; color: string; dataKey?: string }, index: number) => {
                                  if (entry.value !== null && entry.value !== undefined) {
                                    let unit = '';
                                    let value: string | number = entry.value;

                                    if (entry.dataKey === 'temperature') {
                                      unit = '°C';
                                      value = value.toFixed(1);
                                    } else if (entry.dataKey === 'humidity') {
                                      unit = '%';
                                      value = value.toFixed(1);
                                    } else if (entry.dataKey === 'light') {
                                      unit = 'K lux';
                                      value = value.toFixed(1);
                                    }

                                    return (
                                      <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                                        {entry.name}: {value}{unit}
                                      </p>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            );
                          }
                          return null;
                        };

                        return (
                          <div className="w-full">
                            <div style={{ width: '100%', height: '400px' }}>
                              <ResponsiveContainer>
                                <LineChart
                                  data={chartData}
                                  margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 60,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={isDarkMode ? '#374151' : '#e0e7ff'}
                                    opacity={0.6}
                                  />
                                  <XAxis
                                    dataKey="time"
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    fontSize={12}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                  />
                                  <YAxis
                                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    fontSize={12}
                                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                  />

                                  {visibleLines.temperature && (
                                    <Line
                                      type="monotone"
                                      dataKey="temperature"
                                      stroke="#ef4444"
                                      strokeWidth={3}
                                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                      activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                                      name="Temperature"
                                      connectNulls={false}
                                    />
                                  )}

                                  {visibleLines.humidity && (
                                    <Line
                                      type="monotone"
                                      dataKey="humidity"
                                      stroke="#3b82f6"
                                      strokeWidth={3}
                                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                                      name="Humidity"
                                      connectNulls={false}
                                    />
                                  )}

                                  {visibleLines.light && (
                                    <Line
                                      type="monotone"
                                      dataKey="light"
                                      stroke="#f59e0b"
                                      strokeWidth={3}
                                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                                      activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                                      name="Light (K lux)"
                                      connectNulls={false}
                                    />
                                  )}
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Enhanced Statistics Cards */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                              {visibleLines.temperature && (() => {
                                const tempData = filteredData.filter(d => d.temperature !== null && d.temperature !== undefined);
                                if (tempData.length === 0) return null;
                                const temps = tempData.map(d => d.temperature!);
                                const min = Math.min(...temps);
                                const max = Math.max(...temps);
                                const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                                return (
                                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                                      <span className="font-semibold text-red-800">Temperature Analytics</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-red-600">Current:</span>
                                        <span className="font-medium text-red-800">{temps[temps.length - 1].toFixed(1)}°C</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-red-600">Average:</span>
                                        <span className="font-medium text-red-800">{avg.toFixed(1)}°C</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-red-600">Range:</span>
                                        <span className="font-medium text-red-800">{min.toFixed(1)}°C - {max.toFixed(1)}°C</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {visibleLines.humidity && (() => {
                                const humidityData = filteredData.filter(d => d.humidity !== null && d.humidity !== undefined);
                                if (humidityData.length === 0) return null;
                                const humidities = humidityData.map(d => d.humidity!);
                                const min = Math.min(...humidities);
                                const max = Math.max(...humidities);
                                const avg = humidities.reduce((a, b) => a + b, 0) / humidities.length;
                                return (
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                                      <span className="font-semibold text-blue-800">Humidity Analytics</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-blue-600">Current:</span>
                                        <span className="font-medium text-blue-800">{humidities[humidities.length - 1].toFixed(1)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-blue-600">Average:</span>
                                        <span className="font-medium text-blue-800">{avg.toFixed(1)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-blue-600">Range:</span>
                                        <span className="font-medium text-blue-800">{min.toFixed(1)}% - {max.toFixed(1)}%</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {visibleLines.light && (() => {
                                const lightData = filteredData.filter(d => d.light !== null && d.light !== undefined);
                                if (lightData.length === 0) return null;
                                const lights = lightData.map(d => d.light!);
                                const min = Math.min(...lights);
                                const max = Math.max(...lights);
                                const avg = lights.reduce((a, b) => a + b, 0) / lights.length;
                                return (
                                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-center mb-3">
                                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                                      <span className="font-semibold text-yellow-800">Light Analytics</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-yellow-600">Current:</span>
                                        <span className="font-medium text-yellow-800">{lights[lights.length - 1].toFixed(0)} lux</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-yellow-600">Average:</span>
                                        <span className="font-medium text-yellow-800">{avg.toFixed(0)} lux</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-yellow-600">Range:</span>
                                        <span className="font-medium text-yellow-800">{min.toFixed(0)} - {max.toFixed(0)} lux</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Data Export Section */}
      <section className={`py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              isDarkMode
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Download className="w-4 h-4 mr-2" />
              Data Export & Analysis
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Export System Data
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Download comprehensive data in organized categories for analysis, research, and backup purposes.
              All data is structured and ready for Excel, data analysis tools, or integration with other systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1: Environmental Data */}
            <div className={`rounded-xl p-6 border shadow-lg transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-800 border-green-400/30 text-white'
                : 'bg-white border-green-200'
            }`}>
              <div className="flex items-center mb-4">
                <Sun className="w-8 h-8 text-green-600 mr-3" />
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Environmental Data</h3>
              </div>
              <div className="space-y-3 mb-6">
                <div className={`rounded p-3 transition-colors duration-300 ${
                  isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                }`}>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Temperature</div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>Hourly readings, min/max, trends</div>
                </div>
                <div className={`rounded p-3 transition-colors duration-300 ${
                  isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                }`}>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Humidity</div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>RH%, dew point calculations</div>
                </div>
                <div className={`rounded p-3 transition-colors duration-300 ${
                  isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                }`}>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Light Intensity</div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>Lux measurements, photoperiod</div>
                </div>
                <div className={`rounded p-3 transition-colors duration-300 ${
                  isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                }`}>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Air Quality</div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>CO2, air circulation metrics</div>
                </div>
              </div>
              <button
                onClick={exportEnvironmentalDataAsCSV}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Environmental CSV
              </button>
            </div>
          </div>

          {/* Complete Data Export */}
          <div className={`rounded-xl p-4 sm:p-6 lg:p-8 border shadow-lg mt-12 transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-center mb-6">
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Complete System Export</h3>
              <p className={`${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Download all system data in a single comprehensive package with organized sheets and categories.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={exportCompleteSystemDataAsCSV}
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Complete Dataset (CSV)
              </button>
              <button
                onClick={exportCompleteSystemDataAsJSON}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Database className="w-5 h-5 mr-2" />
                Download Complete Dataset (JSON)
              </button>
              <button
                onClick={() => setIsPDFExportOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                Generate PDF Report
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* System Photos & Documentation Section */}
      <section className={`py-16 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              System Photos & Documentation
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Visual documentation of the hydroponic system setup, electronics, and growing environment. Track system evolution and document all components for reference and troubleshooting.
            </p>
          </div>
            {/* Photo Galleries by Category */}
            <div className="space-y-8">
              {/* System Overview Gallery */}
              {uploadedPhotos.filter(photo => ['system', 'setup', 'maintenance'].includes(photo.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-blue-200 bg-blue-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    System Overview Photos ({uploadedPhotos.filter(photo => ['system', 'setup', 'maintenance'].includes(photo.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedPhotos
                      .filter(photo => ['system', 'setup', 'maintenance'].includes(photo.category || ''))
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group cursor-pointer aspect-square w-16 h-16"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <div className="w-full h-full relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {/* Placeholder - shown by default, hidden when image loads */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-10" id={`placeholder-${photo.id}`}>
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">{photo.category}</div>
                              </div>
                            </div>
                            {/* Image - loads on top of placeholder */}
                            <img
                              src={photo.url}
                              alt={photo.description || photo.originalName}
                              className="w-full h-full object-cover relative z-20"
                              loading="lazy"
                              onLoad={(e) => {
                                // Hide placeholder when image loads successfully
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'none';
                                e.currentTarget.style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', photo.url);
                                e.currentTarget.style.display = 'none';
                                // Show placeholder when image fails
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                              style={{ opacity: 0 }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-xs text-center p-2">
                              {photo.description && <div className="font-medium truncate">{photo.description}</div>}
                              <div className="text-xs opacity-75">{new Date(photo.uploadDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Electronics Gallery */}
              {uploadedPhotos.filter(photo => photo.category === 'electronics').length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Electronics Photos ({uploadedPhotos.filter(photo => photo.category === 'electronics').length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedPhotos
                      .filter(photo => photo.category === 'electronics')
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group cursor-pointer aspect-square w-16 h-16"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <div className="w-full h-full relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {/* Placeholder - shown by default, hidden when image loads */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-10" id={`placeholder-${photo.id}`}>
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">{photo.category}</div>
                              </div>
                            </div>
                            {/* Image - loads on top of placeholder */}
                            <img
                              src={photo.url}
                              alt={photo.description || photo.originalName}
                              className="w-full h-full object-cover relative z-20"
                              loading="lazy"
                              onLoad={(e) => {
                                // Hide placeholder when image loads successfully
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'none';
                                e.currentTarget.style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', photo.url);
                                e.currentTarget.style.display = 'none';
                                // Show placeholder when image fails
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                              style={{ opacity: 0 }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-xs text-center p-2">
                              {photo.description && <div className="font-medium truncate">{photo.description}</div>}
                              <div className="text-xs opacity-75">{new Date(photo.uploadDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Hydro System Gallery */}
              {uploadedPhotos.filter(photo => photo.category === 'hydro').length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-green-200 bg-green-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Hydro System Photos ({uploadedPhotos.filter(photo => photo.category === 'hydro').length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedPhotos
                      .filter(photo => photo.category === 'hydro')
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group cursor-pointer aspect-square w-16 h-16"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <div className="w-full h-full relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {/* Placeholder - shown by default, hidden when image loads */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-10" id={`placeholder-${photo.id}`}>
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">{photo.category}</div>
                              </div>
                            </div>
                            {/* Image - loads on top of placeholder */}
                            <img
                              src={photo.url}
                              alt={photo.description || photo.originalName}
                              className="w-full h-full object-cover relative z-20"
                              loading="lazy"
                              onLoad={(e) => {
                                // Hide placeholder when image loads successfully
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'none';
                                e.currentTarget.style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', photo.url);
                                e.currentTarget.style.display = 'none';
                                // Show placeholder when image fails
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                              style={{ opacity: 0 }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-xs text-center p-2">
                              {photo.description && <div className="font-medium truncate">{photo.description}</div>}
                              <div className="text-xs opacity-75">{new Date(photo.uploadDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Environment Gallery */}
              {uploadedPhotos.filter(photo => photo.category === 'environment').length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-blue-200 bg-blue-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Environment Photos ({uploadedPhotos.filter(photo => photo.category === 'environment').length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedPhotos
                      .filter(photo => photo.category === 'environment')
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group cursor-pointer aspect-square w-16 h-16"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <div className="w-full h-full relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {/* Placeholder - shown by default, hidden when image loads */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-10" id={`placeholder-${photo.id}`}>
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">{photo.category}</div>
                              </div>
                            </div>
                            {/* Image - loads on top of placeholder */}
                            <img
                              src={photo.url}
                              alt={photo.description || photo.originalName}
                              className="w-full h-full object-cover relative z-20"
                              loading="lazy"
                              onLoad={(e) => {
                                // Hide placeholder when image loads successfully
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'none';
                                e.currentTarget.style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', photo.url);
                                e.currentTarget.style.display = 'none';
                                // Show placeholder when image fails
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                              style={{ opacity: 0 }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-xs text-center p-2">
                              {photo.description && <div className="font-medium truncate">{photo.description}</div>}
                              <div className="text-xs opacity-75">{new Date(photo.uploadDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Plant & Problem Documentation Gallery */}
              {uploadedPhotos.filter(photo => ['problems', 'diseases', 'pests', 'growth_stages', 'harvest', 'stem', 'before_after', 'experiments', 'solutions'].includes(photo.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-red-200 bg-red-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Plant & Problem Documentation ({uploadedPhotos.filter(photo => ['problems', 'diseases', 'pests', 'growth_stages', 'harvest', 'stem', 'before_after', 'experiments', 'solutions'].includes(photo.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedPhotos
                      .filter(photo => ['problems', 'diseases', 'pests', 'growth_stages', 'harvest', 'stem', 'before_after', 'experiments', 'solutions'].includes(photo.category || ''))
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group cursor-pointer aspect-square w-16 h-16"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <div className="w-full h-full relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {/* Placeholder - shown by default, hidden when image loads */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-10" id={`placeholder-${photo.id}`}>
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">{photo.category}</div>
                              </div>
                            </div>
                            {/* Image - loads on top of placeholder */}
                            <img
                              src={photo.url}
                              alt={photo.description || photo.originalName}
                              className="w-full h-full object-cover relative z-20"
                              loading="lazy"
                              onLoad={(e) => {
                                // Hide placeholder when image loads successfully
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'none';
                                e.currentTarget.style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', photo.url);
                                e.currentTarget.style.display = 'none';
                                // Show placeholder when image fails
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                              style={{ opacity: 0 }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-xs text-center p-2">
                              {photo.description && <div className="font-medium truncate">{photo.description}</div>}
                              <div className="text-xs opacity-75">{new Date(photo.uploadDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Other Documentation Gallery (for any uncategorized photos) */}
              {uploadedPhotos.filter(photo => !['system', 'setup', 'maintenance', 'electronics', 'hydro', 'environment', 'problems', 'diseases', 'pests', 'growth_stages', 'harvest', 'stem', 'before_after', 'experiments', 'solutions'].includes(photo.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Other Documentation ({uploadedPhotos.filter(photo => !['system', 'setup', 'maintenance', 'electronics', 'hydro', 'environment', 'problems', 'diseases', 'pests', 'growth_stages', 'harvest', 'stem', 'before_after', 'experiments', 'solutions'].includes(photo.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedPhotos
                      .filter(photo => !['system', 'setup', 'maintenance', 'electronics', 'hydro', 'environment', 'problems', 'diseases', 'pests', 'growth_stages', 'harvest', 'stem', 'before_after', 'experiments', 'solutions'].includes(photo.category || ''))
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group cursor-pointer aspect-square w-16 h-16"
                          onClick={() => openPhotoModal(photo)}
                        >
                          <div className="w-full h-full relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {/* Placeholder - shown by default, hidden when image loads */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-10" id={`placeholder-${photo.id}`}>
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">{photo.category}</div>
                              </div>
                            </div>
                            {/* Image - loads on top of placeholder */}
                            <img
                              src={photo.url}
                              alt={photo.description || photo.originalName}
                              className="w-full h-full object-cover relative z-20"
                              loading="lazy"
                              onLoad={(e) => {
                                // Hide placeholder when image loads successfully
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'none';
                                e.currentTarget.style.opacity = '1';
                              }}
                              onError={(e) => {
                                console.error('Image failed to load:', photo.url);
                                e.currentTarget.style.display = 'none';
                                // Show placeholder when image fails
                                const placeholder = document.getElementById(`placeholder-${photo.id}`);
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                              style={{ opacity: 0 }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-xs text-center p-2">
                              {photo.description && <div className="font-medium truncate">{photo.description}</div>}
                              <div className="text-xs opacity-75">{new Date(photo.uploadDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

          {/* Video Galleries */}
          {uploadedVideos.length > 0 && (
            <div className="space-y-8 mt-12">
              <h3 className={`text-xl sm:text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Video Documentation
              </h3>

              {/* System Videos */}
              {uploadedVideos.filter(video => ['system_operation', 'process'].includes(video.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-blue-200 bg-blue-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    System Videos ({uploadedVideos.filter(video => ['system_operation', 'process'].includes(video.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedVideos
                      .filter(video => ['system_operation', 'process'].includes(video.category || ''))
                      .slice(0, 8)
                      .map((video) => (
                        <div
                          key={video.id}
                          className="relative group cursor-pointer aspect-video rounded-lg overflow-hidden border border-gray-300 hover:border-blue-400 transition-all duration-200 hover:shadow-lg bg-white"
                          onClick={() => openVideoModal(video)}
                          title={video.originalName || 'Video File'}
                        >
                          {/* Video Card Content */}
                          <div className="w-full h-full flex flex-col">
                            {/* Video header */}
                            <div className="bg-blue-50 p-2 border-b border-blue-100 flex items-center">
                              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center mr-2">
                                <Play className="w-2.5 h-2.5 text-white" />
                              </div>
                              <div className="text-xs font-medium text-blue-700 uppercase tracking-wide truncate">
                                {video.category || 'video'}
                              </div>
                            </div>

                            {/* Video name and details */}
                            <div className="flex-1 p-2 flex flex-col justify-center">
                              {/* Video name - more prominent */}
                              <div className="text-sm font-bold text-gray-900 mb-1 leading-tight line-clamp-2" title={video.originalName}>
                                {video.originalName ?
                                  video.originalName.replace(/\.(mp4|webm|avi|mov)$/i, '') :
                                  'Video File'
                                }
                              </div>

                              {/* File details */}
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-1">💾</span>
                                  {(video.size / 1024 / 1024).toFixed(1)} MB
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-1">📅</span>
                                  {new Date(video.uploadDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100">
                                <div className="bg-white rounded-full p-2 shadow-lg">
                                  <Play className="w-4 h-4 text-blue-600" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Video info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                            <div className="text-white text-xs">
                              <div className="font-medium truncate">{video.originalName}</div>
                              <div className="text-xs opacity-75">{video.category}</div>
                              {video.duration && <div className="text-xs opacity-75">{video.duration}</div>}
                            </div>
                          </div>

                          {/* Hover overlay */}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Timelapse & Tutorial Videos */}
              {uploadedVideos.filter(video => ['timelapse', 'tutorial'].includes(video.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-green-200 bg-green-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Timelapse & Tutorial Videos ({uploadedVideos.filter(video => ['timelapse', 'tutorial'].includes(video.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                    {uploadedVideos
                      .filter(video => ['timelapse', 'tutorial'].includes(video.category || ''))
                      .slice(0, 8)
                      .map((video) => (
                        <div
                          key={video.id}
                          className="relative group cursor-pointer aspect-video rounded-lg overflow-hidden border border-gray-300 hover:border-blue-400 transition-all duration-200 hover:shadow-lg bg-white"
                          onClick={() => openVideoModal(video)}
                          title={video.originalName || 'Video File'}
                        >
                          {/* Video Card Content */}
                          <div className="w-full h-full flex flex-col">
                            {/* Video header */}
                            <div className="bg-blue-50 p-2 border-b border-blue-100 flex items-center">
                              <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center mr-2">
                                <Play className="w-2.5 h-2.5 text-white" />
                              </div>
                              <div className="text-xs font-medium text-blue-700 uppercase tracking-wide truncate">
                                {video.category || 'video'}
                              </div>
                            </div>

                            {/* Video name and details */}
                            <div className="flex-1 p-2 flex flex-col justify-center">
                              {/* Video name - more prominent */}
                              <div className="text-sm font-bold text-gray-900 mb-1 leading-tight line-clamp-2" title={video.originalName}>
                                {video.originalName ?
                                  video.originalName.replace(/\.(mp4|webm|avi|mov)$/i, '') :
                                  'Video File'
                                }
                              </div>

                              {/* File details */}
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-1">💾</span>
                                  {(video.size / 1024 / 1024).toFixed(1)} MB
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-1">📅</span>
                                  {new Date(video.uploadDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {/* Play button overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100">
                                <div className="bg-white rounded-full p-2 shadow-lg">
                                  <Play className="w-4 h-4 text-blue-600" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Video info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                            <div className="text-white text-xs">
                              <div className="font-medium truncate">{video.originalName}</div>
                              <div className="text-xs opacity-75">{video.category}</div>
                              {video.duration && <div className="text-xs opacity-75">{video.duration}</div>}
                            </div>
                          </div>

                          {/* Hover overlay */}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Document Galleries */}
          {uploadedDocuments.length > 0 && (
            <div className="space-y-8 mt-12">
              <h3 className={`text-xl sm:text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Document Library
              </h3>

              {/* Manuals & References */}
              {uploadedDocuments.filter(doc => ['manual', 'reference', 'datasheet'].includes(doc.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-blue-200 bg-blue-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Manuals & References ({uploadedDocuments.filter(doc => ['manual', 'reference', 'datasheet'].includes(doc.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {uploadedDocuments
                      .filter(doc => ['manual', 'reference', 'datasheet'].includes(doc.category || ''))
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="relative group cursor-pointer p-2 bg-white rounded-md border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                          onClick={() => openDocumentModal(doc)}
                        >
                          <div className="text-center">
                            {/* Document icon based on file type */}
                            <div className="flex justify-center mb-2">
                              {doc.originalName.toLowerCase().endsWith('.pdf') ?
                                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().includes('.doc') ?
                                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().includes('.xls') ?
                                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                  <FileSpreadsheet className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().endsWith('.txt') ?
                                <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().endsWith('.csv') ?
                                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                                  <FileSpreadsheet className="w-3 h-3 text-white" />
                                </div> :
                                <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                                  <File className="w-3 h-3 text-white" />
                                </div>}
                            </div>
                            <div className="text-xs font-medium truncate mb-1" title={doc.originalName}>
                              {doc.originalName.length > 15 ?
                                doc.originalName.substring(0, 15) + '...' :
                                doc.originalName}
                            </div>
                            <div className="text-xs text-blue-600 font-medium">{doc.category}</div>
                            <div className="text-xs text-gray-500 mt-1">{(doc.size / 1024).toFixed(1)} KB</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                Click to view
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Reports & Research */}
              {uploadedDocuments.filter(doc => ['report', 'research', 'documentation'].includes(doc.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-green-200 bg-green-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Reports & Research ({uploadedDocuments.filter(doc => ['report', 'research', 'documentation'].includes(doc.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {uploadedDocuments
                      .filter(doc => ['report', 'research', 'documentation'].includes(doc.category || ''))
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="relative group cursor-pointer p-2 bg-white rounded-md border border-gray-200 hover:border-green-400 hover:shadow-md transition-all duration-200"
                          onClick={() => openDocumentModal(doc)}
                        >
                          <div className="text-center">
                            {/* Document icon based on file type */}
                            <div className="flex justify-center mb-2">
                              {doc.originalName.toLowerCase().endsWith('.pdf') ?
                                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().includes('.doc') ?
                                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().includes('.xls') ?
                                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                  <FileSpreadsheet className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().endsWith('.txt') ?
                                <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                                  <FileText className="w-3 h-3 text-white" />
                                </div> :
                               doc.originalName.toLowerCase().endsWith('.csv') ?
                                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                                  <FileSpreadsheet className="w-3 h-3 text-white" />
                                </div> :
                                <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                                  <File className="w-3 h-3 text-white" />
                                </div>}
                            </div>
                            <div className="text-xs font-medium truncate mb-1" title={doc.originalName}>
                              {doc.originalName.length > 15 ?
                                doc.originalName.substring(0, 15) + '...' :
                                doc.originalName}
                            </div>
                            <div className="text-xs text-gray-400">{(doc.size / 1024).toFixed(1)}KB</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resource Links - Only show if links exist */}
          {uploadedLinks.length > 0 && (
            <div className="space-y-8 mt-12">
              <h3 className={`text-xl sm:text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Resource Links
              </h3>

              {/* Tutorial & Educational Links */}
              {uploadedLinks.filter(link => ['tutorial', 'guides', 'other'].includes(link.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-blue-200 bg-blue-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Tutorials & Guides ({uploadedLinks.filter(link => ['tutorial', 'guides', 'other'].includes(link.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedLinks
                      .filter(link => ['tutorial', 'guides', 'other'].includes(link.category || ''))
                      .map((link) => (
                        <div
                          key={link.id}
                          className="relative group cursor-pointer p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                          onClick={() => openLinkModal(link)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate">{link.title}</h5>
                              <p className="text-sm text-gray-600 truncate">{link.url}</p>
                              {link.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{link.description}</p>
                              )}
                              {link.category && (
                                <span className="inline-block px-2 py-1 mt-2 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {link.category.charAt(0).toUpperCase() + link.category.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Research & Technical Links */}
              {uploadedLinks.filter(link => ['research', 'documentation', 'tools', 'suppliers'].includes(link.category || '')).length > 0 && (
                <div className={`p-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-green-200 bg-green-50'
                }`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Research & Technical ({uploadedLinks.filter(link => ['research', 'documentation', 'tools', 'suppliers'].includes(link.category || '')).length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedLinks
                      .filter(link => ['research', 'documentation', 'tools', 'suppliers'].includes(link.category || ''))
                      .map((link) => (
                        <div
                          key={link.id}
                          className="relative group cursor-pointer p-4 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all duration-200"
                          onClick={() => openLinkModal(link)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 truncate">{link.title}</h5>
                              <p className="text-sm text-gray-600 truncate">{link.url}</p>
                              {link.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{link.description}</p>
                              )}
                              {link.category && (
                                <span className="inline-block px-2 py-1 mt-2 text-xs bg-green-100 text-green-800 rounded-full">
                                  {link.category.charAt(0).toUpperCase() + link.category.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Section */}
          <div className="text-center mt-12">
            <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Upload Documentation
            </h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
              <EnhancedPhotoUpload
                onUpload={handleEnhancedPhotoUpload}
                className="w-full sm:w-auto"
                page="dashboard"
              />
              <EnhancedVideoUpload
                onUpload={handleEnhancedVideoUpload}
                className="w-full sm:w-auto"
                page="dashboard"
              />
              <EnhancedDocumentUpload
                onUpload={handleEnhancedDocumentUpload}
                className="w-full sm:w-auto"
                page="dashboard"
              />
              <EnhancedLinkUpload
                onUpload={handleEnhancedLinkUpload}
                defaultCategory="tutorial"
                className="w-full sm:w-auto"
                page="dashboard"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Follow My #OneFarmer Journey
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join me as I experiment with hydroponics in Germany. Get access to live data,
            research findings, and learn from real growing experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className={`inline-flex items-center px-8 py-4 font-medium rounded-lg transition-colors duration-200 shadow-lg ${
                isDarkMode
                  ? 'bg-gray-700 text-green-400 hover:bg-gray-600'
                  : 'bg-white text-green-600 hover:bg-gray-50'
              }`}
            >
              Connect & Collaborate
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/nerd-projects"
              className="inline-flex items-center px-8 py-4 border border-white text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              View Tech Details
              <Database className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Research Goals */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Research Mission</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-100">
              <div className="text-center">
                <Target className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Test & Validate</div>
                <div className="text-xs">Hydroponic systems in German conditions</div>
              </div>
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Monitor & Share</div>
                <div className="text-xs">Real-time data with the community</div>
              </div>
              <div className="text-center">
                <Sprout className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Scale & Grow</div>
                <div className="text-xs">From one plant to sustainable farming</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Export Modal */}
      <PDFExportModal
        isOpen={isPDFExportOpen}
        onClose={() => setIsPDFExportOpen(false)}
      />

      {/* Video Modal */}
      {isVideoModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`relative max-w-4xl max-h-[90vh] w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg overflow-hidden shadow-xl`}>
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity"
            >
              ✕
            </button>

            {/* Video display */}
            <div className="relative bg-black">
              {selectedVideo.url ? (
                <div className="relative">
                  <video
                    key={selectedVideo.url}
                    controls
                    className="w-full h-auto max-h-[60vh]"
                    preload="metadata"
                    playsInline
                    muted={false}
                    style={{ backgroundColor: '#000' }}
                    disablePictureInPicture={false}
                    controlsList="nodownload noremoteplayback"
                    onError={(e) => {
                      console.error('Video error:', e);
                      console.error('Video URL:', selectedVideo.url);
                      console.error('Full video object:', selectedVideo);
                      const video = e.target as HTMLVideoElement;
                      if (video.error) {
                        console.error('Video error code:', video.error.code);
                        console.error('Video error message:', video.error.message);

                        // Display user-friendly error message
                        const errorDiv = document.createElement('div');
                        errorDiv.innerHTML = `
                          <div style="color: white; padding: 20px; text-align: center;">
                            <p>Unable to load video. Error code: ${video.error.code}</p>
                            <p>URL: ${selectedVideo.url}</p>
                            <p>Try refreshing the page or check if the video file exists.</p>
                          </div>
                        `;
                        video.parentNode?.insertBefore(errorDiv, video.nextSibling);
                      }
                    }}
                    onLoadStart={() => {
                      console.log('Video load started for:', selectedVideo.url);
                    }}
                    onCanPlay={() => {
                      console.log('Video can play:', selectedVideo.url);
                    }}
                    onLoadedData={() => {
                      console.log('Video data loaded:', selectedVideo.url);
                    }}
                    onLoadedMetadata={() => {
                      console.log('Video metadata loaded:', selectedVideo.url);
                    }}
                    onPlay={() => {
                      console.log('Video started playing');
                    }}
                    onPause={() => {
                      console.log('Video paused');
                    }}
                    onSuspend={() => {
                      console.log('Video loading suspended');
                    }}
                    onStalled={() => {
                      console.log('Video stalled');
                    }}
                    onWaiting={() => {
                      console.log('Video waiting for data');
                    }}
                  >
                    <source src={selectedVideo.url} type="video/mp4" />
                    <source src={selectedVideo.url} type="video/webm" />
                    <source src={selectedVideo.url} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="w-full h-60 bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-400">Video not available</div>
                </div>
              )}
            </div>

            {/* Video details */}
            <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Video Details
              </h4>
              <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div><strong>Original Name:</strong> {selectedVideo.originalName}</div>
                <div><strong>Category:</strong> {selectedVideo.category}</div>
                <div><strong>Upload Date:</strong> {new Date(selectedVideo.uploadDate).toLocaleString()}</div>
                <div><strong>File Size:</strong> {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB</div>
                {selectedVideo.duration && (
                  <div><strong>Duration:</strong> {selectedVideo.duration}</div>
                )}
                {selectedVideo.description && (
                  <div><strong>Description:</strong> {selectedVideo.description}</div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className={`flex items-center justify-center space-x-4 p-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => downloadVideo(selectedVideo)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Download Video
              </button>
              {/* Delete functionality disabled */}
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
                Protected Video
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {isDocumentModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`relative max-w-2xl max-h-[90vh] w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg overflow-hidden shadow-xl`}>
            {/* Close button */}
            <button
              onClick={closeDocumentModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity"
            >
              ✕
            </button>

            {/* Document preview */}
            <div className="relative">
              {selectedDocument.originalName.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full">
                  <div className="w-full h-96 bg-gray-100">
                    <iframe
                      src={`${selectedDocument.url}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-full border-0 rounded-lg"
                      title={selectedDocument.originalName}
                      loading="lazy"
                      style={{ overflow: 'auto' }}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <button
                      onClick={() => window.open(selectedDocument.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm underline mr-4"
                    >
                      Open in new tab
                    </button>
                    <a
                      href={selectedDocument.url}
                      download={selectedDocument.originalName}
                      className="text-green-600 hover:text-green-800 text-sm underline"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="relative p-8 text-center">
                  <div className="text-6xl mb-4">
                    {selectedDocument.originalName.toLowerCase().includes('.doc') ? '📝' :
                     selectedDocument.originalName.toLowerCase().includes('.xls') ? '📊' : '📄'}
                  </div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedDocument.originalName}
                  </h3>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedDocument.documentType || 'Document'}
                  </p>
                  <div className="mt-4 space-x-4">
                    <button
                      onClick={() => window.open(selectedDocument.url, '_blank')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Document
                    </button>
                    <a
                      href={selectedDocument.url}
                      download={selectedDocument.originalName}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Document details */}
            <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Document Details
              </h4>
              <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div><strong>Original Name:</strong> {selectedDocument.originalName}</div>
                <div><strong>Category:</strong> {selectedDocument.category}</div>
                <div><strong>Upload Date:</strong> {new Date(selectedDocument.uploadDate).toLocaleString()}</div>
                <div><strong>File Size:</strong> {(selectedDocument.size / 1024).toFixed(1)} KB</div>
                {selectedDocument.documentType && (
                  <div><strong>Type:</strong> {selectedDocument.documentType}</div>
                )}
                {selectedDocument.description && (
                  <div><strong>Description:</strong> {selectedDocument.description}</div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className={`flex items-center justify-center space-x-4 p-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => downloadDocument(selectedDocument)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Download Document
              </button>
              {/* Delete functionality disabled */}
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
                Protected Document
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && selectedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`relative max-w-2xl max-h-[90vh] w-full rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Link Details
              </h3>
              <button
                onClick={closeLinkModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedLink.title}
                  </h4>
                  <div className={`text-sm mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <a
                      href={selectedLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 underline break-all"
                    >
                      {selectedLink.url}
                    </a>
                  </div>
                  {selectedLink.description && (
                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedLink.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedLink.category && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {selectedLink.category.charAt(0).toUpperCase() + selectedLink.category.slice(1)}
                      </span>
                    )}
                    {selectedLink.tags && selectedLink.tags.length > 0 &&
                      selectedLink.tags.map((tag: string, index: number) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {tag}
                        </span>
                      ))
                    }
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Added: {new Date(selectedLink.uploadDate).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex justify-between items-center p-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => window.open(selectedLink.url, '_blank')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </button>
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <button
                  onClick={() => deleteLink(selectedLink.id)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={closeLinkModal}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`relative max-w-4xl max-h-[90vh] w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg overflow-hidden shadow-xl`}>
            {/* Close button */}
            <button
              onClick={closeUploadedPhotoModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity"
            >
              ✕
            </button>

            {/* Photo display */}
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.description || selectedPhoto.originalName}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>

            {/* Photo details */}
            <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Photo Details
              </h4>
              <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <div><strong>Original Name:</strong> {selectedPhoto.originalName}</div>
                <div><strong>Category:</strong> {selectedPhoto.category}</div>
                <div><strong>Upload Date:</strong> {new Date(selectedPhoto.uploadDate).toLocaleString()}</div>
                <div><strong>File Size:</strong> {(selectedPhoto.size / 1024).toFixed(1)} KB</div>
                {selectedPhoto.stemId && (
                  <div><strong>Stem ID:</strong> {selectedPhoto.stemId}</div>
                )}
                {selectedPhoto.description && (
                  <div><strong>Description:</strong> {selectedPhoto.description}</div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className={`flex items-center justify-center space-x-4 p-4 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => downloadUploadedPhoto(selectedPhoto)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Download Photo
              </button>
              {/* Delete functionality disabled */}
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
                Protected Photo
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}