'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Scissors, TrendingUp, ArrowLeft, Download, FileText, Calendar, Trash2, RotateCcw, FileSpreadsheet, File, Link, ExternalLink, Moon, Sun, Droplets, Database, Plus, Save, BarChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NextLink from 'next/link';
import EnhancedPhotoUpload from '@/components/EnhancedPhotoUpload';
import EnhancedVideoUpload from '@/components/EnhancedVideoUpload';
import EnhancedDocumentUpload from '@/components/EnhancedDocumentUpload';
import EnhancedLinkUpload from '@/components/EnhancedLinkUpload';
import PDFExportModal from '@/components/PDFExportModal';
import NutrientTracker from '@/components/NutrientTracker';
import ParameterTracker from '@/components/ParameterTracker';

// Plant parameter interfaces
interface PlantParameters {
  stemA_height: number;
  stemA_maturedFlowers: number;
  stemA_openBuds: number;
  stemA_unopenedBuds: number;
  stemA_leaves: number;
  stemA_diseases: string;
  stemA_date: string;
  stemA_time: string;
  stemB_height: number;
  stemB_maturedFlowers: number;
  stemB_openBuds: number;
  stemB_unopenedBuds: number;
  stemB_leaves: number;
  stemB_diseases: string;
  stemB_date: string;
  stemB_time: string;
  stemC_height: number;
  stemC_maturedFlowers: number;
  stemC_openBuds: number;
  stemC_unopenedBuds: number;
  stemC_leaves: number;
  stemC_diseases: string;
  stemC_date: string;
  stemC_time: string;
  stemD_height: number;
  stemD_maturedFlowers: number;
  stemD_openBuds: number;
  stemD_unopenedBuds: number;
  stemD_leaves: number;
  stemD_diseases: string;
  stemD_date: string;
  stemD_time: string;
  totalMaturedFlowers: number;
  totalOpenBuds: number;
  totalUnopenedBuds: number;
  overallPlantHealth: 'excellent' | 'good' | 'attention' | 'critical';
}

interface PlantHistoricalEntry {
  timestamp: string;
  stemA_height?: number;
  stemA_maturedFlowers?: number;
  stemA_openBuds?: number;
  stemA_unopenedBuds?: number;
  stemA_leaves?: number;
  stemB_height?: number;
  stemB_maturedFlowers?: number;
  stemB_openBuds?: number;
  stemB_unopenedBuds?: number;
  stemB_leaves?: number;
  stemC_height?: number;
  stemC_maturedFlowers?: number;
  stemC_openBuds?: number;
  stemC_unopenedBuds?: number;
  stemC_leaves?: number;
  stemD_height?: number;
  stemD_maturedFlowers?: number;
  stemD_openBuds?: number;
  stemD_unopenedBuds?: number;
  stemD_leaves?: number;
  totalMaturedFlowers?: number;
  totalOpenBuds?: number;
  totalUnopenedBuds?: number;
  overallPlantHealth?: string;
}

interface PhotoMetadata {
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

export default function HibiscusPlantPage() {
  // Dark mode and mounted state
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // PDF export modal state
  const [isPDFExportOpen, setIsPDFExportOpen] = useState(false);

  // Plant parameters state
  const [plantParams, setPlantParams] = useState<PlantParameters>({
    stemA_height: 19.0,
    stemA_maturedFlowers: 1,
    stemA_openBuds: 1,
    stemA_unopenedBuds: 5,
    stemA_leaves: 12,
    stemA_diseases: '',
    stemA_date: new Date().toISOString().split('T')[0],
    stemA_time: new Date().toTimeString().slice(0, 5),
    stemB_height: 19.0,
    stemB_maturedFlowers: 2,
    stemB_openBuds: 1,
    stemB_unopenedBuds: 3,
    stemB_leaves: 14,
    stemB_diseases: '',
    stemB_date: new Date().toISOString().split('T')[0],
    stemB_time: new Date().toTimeString().slice(0, 5),
    stemC_height: 17.3,
    stemC_maturedFlowers: 2,
    stemC_openBuds: 1,
    stemC_unopenedBuds: 2,
    stemC_leaves: 11,
    stemC_diseases: '',
    stemC_date: new Date().toISOString().split('T')[0],
    stemC_time: new Date().toTimeString().slice(0, 5),
    stemD_height: 18.8,
    stemD_maturedFlowers: 1,
    stemD_openBuds: 1,
    stemD_unopenedBuds: 1,
    stemD_leaves: 13,
    stemD_diseases: 'Fungal infection - 2 flowers removed due to high humidity',
    stemD_date: new Date().toISOString().split('T')[0],
    stemD_time: new Date().toTimeString().slice(0, 5),
    totalMaturedFlowers: 5,
    totalOpenBuds: 4,
    totalUnopenedBuds: 11,
    overallPlantHealth: 'attention'
  });

  // Historical data state with localStorage persistence
  const [historicalData, setHistoricalData] = useState<PlantHistoricalEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hibiscusPlantHistoricalData');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Auto/Manual mode state
  const [autoMode, setAutoMode] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hibiscusPlantAutoMode');
      return saved ? JSON.parse(saved) : {
        stemA_height: true,
        stemA_maturedFlowers: true,
        stemA_openBuds: true,
        stemA_unopenedBuds: true,
        stemA_leaves: true,
        stemB_height: true,
        stemB_maturedFlowers: true,
        stemB_openBuds: true,
        stemB_unopenedBuds: true,
        stemB_leaves: true,
        stemC_height: true,
        stemC_maturedFlowers: true,
        stemC_openBuds: true,
        stemC_unopenedBuds: true,
        stemC_leaves: true,
        stemD_height: true,
        stemD_maturedFlowers: true,
        stemD_openBuds: true,
        stemD_unopenedBuds: true,
        stemD_leaves: true,
        totalMaturedFlowers: true,
        totalOpenBuds: true,
        totalUnopenedBuds: true,
        overallPlantHealth: true
      };
    }
    return {
      stemA_height: true,
      stemA_maturedFlowers: true,
      stemA_openBuds: true,
      stemA_unopenedBuds: true,
      stemA_leaves: true,
      stemB_height: true,
      stemB_maturedFlowers: true,
      stemB_openBuds: true,
      stemB_unopenedBuds: true,
      stemB_leaves: true,
      stemC_height: true,
      stemC_maturedFlowers: true,
      stemC_openBuds: true,
      stemC_unopenedBuds: true,
      stemC_leaves: true,
      stemD_height: true,
      stemD_maturedFlowers: true,
      stemD_openBuds: true,
      stemD_unopenedBuds: true,
      stemD_leaves: true,
      totalMaturedFlowers: true,
      totalOpenBuds: true,
      totalUnopenedBuds: true,
      overallPlantHealth: true
    };
  });

  // Manual mode state for plant parameters
  const [plantManualMode, setPlantManualMode] = useState<Record<string, boolean>>({
    stemA_height: false,
    stemA_maturedFlowers: false,
    stemA_openBuds: false,
    stemA_unopenedBuds: false,
    stemA_leaves: false,
    stemA_diseases: false,
    stemA_date: false,
    stemA_time: false,
    stemB_height: false,
    stemB_maturedFlowers: false,
    stemB_openBuds: false,
    stemB_unopenedBuds: false,
    stemB_leaves: false,
    stemB_diseases: false,
    stemB_date: false,
    stemB_time: false,
    stemC_height: false,
    stemC_maturedFlowers: false,
    stemC_openBuds: false,
    stemC_unopenedBuds: false,
    stemC_leaves: false,
    stemC_diseases: false,
    stemC_date: false,
    stemC_time: false,
    stemD_height: false,
    stemD_maturedFlowers: false,
    stemD_openBuds: false,
    stemD_unopenedBuds: false,
    stemD_leaves: false,
    stemD_diseases: false,
    stemD_date: false,
    stemD_time: false,
    totalMaturedFlowers: false,
    totalOpenBuds: false,
    totalUnopenedBuds: false,
    overallPlantHealth: false
  });

  // Validation error state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Plant historic data - starts empty, will be populated when user saves data
  const [plantHistoricData, setPlantHistoricData] = useState<PlantHistoricalEntry[]>([]);

  // Stem history data for each stem
  const [stemHistoryData, setStemHistoryData] = useState<{[key: string]: any[]}>({
    A: [],
    B: [],
    C: [],
    D: []
  });

  // Photo upload state
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Video state
  const [uploadedVideos, setUploadedVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoRefresh, setVideoRefresh] = useState(0);

  // Document state
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentRefresh, setDocumentRefresh] = useState(0);

  // Link state
  const [uploadedLinks, setUploadedLinks] = useState<any[]>([]);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkRefresh, setLinkRefresh] = useState(0);

  const [videoForCropping, setVideoForCropping] = useState<File | null>(null);
  const [cropStartTime, setCropStartTime] = useState(0);
  const [cropEndTime, setCropEndTime] = useState(30);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Header thumbnail photos state - single photo per stem
  const [headerPhotos, setHeaderPhotos] = useState<{[key: string]: string}>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hibiscusPlantHeaderPhotos');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse headerPhotos from localStorage:', error);
          return {};
        }
      }
    }
    return {};
  });

  // Stem-specific photos state - multiple photos per stem for gallery
  const [stemPhotos, setStemPhotos] = useState<{[key: string]: string[]}>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hibiscusPlantStemPhotos');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          console.log('Loaded stemPhotos from localStorage:', Object.keys(data));

          // Convert old single photo format to array format if needed
          Object.keys(data).forEach(key => {
            if (typeof data[key] === 'string') {
              data[key] = [data[key]];
            }
            // Validate each photo URL
            if (Array.isArray(data[key])) {
              data[key] = data[key].filter(photo =>
                typeof photo === 'string' && photo.startsWith('data:image/')
              );
            }
          });

          return data;
        } catch (error) {
          console.error('Failed to parse stemPhotos from localStorage:', error);
          return {};
        }
      }
    }
    return {};
  });

  // Track which stem's photo upload was clicked
  const [currentPhotoStem, setCurrentPhotoStem] = useState<string>('');

  // Track upload type - header (single) vs section (multiple)
  const [uploadType, setUploadType] = useState<'header' | 'multiple' | ''>('');

  // Force refresh key for photo sections
  const [photoRefreshKey, setPhotoRefreshKey] = useState<number>(0);

  // Add a state to force re-render when localStorage changes
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // State for chart parameter selection
  const [selectedChartParams, setSelectedChartParams] = useState<{[stem: string]: {[param: string]: boolean}}>({
    A: { height: true, maturedFlowers: true, openBuds: false, unopenedBuds: false },
    B: { height: true, maturedFlowers: true, openBuds: false, unopenedBuds: false },
    C: { height: true, maturedFlowers: true, openBuds: false, unopenedBuds: false },
    D: { height: true, maturedFlowers: true, openBuds: false, unopenedBuds: false }
  });

  // Photo modal state
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    stemId: string;
    imageUrl: string;
    stemName: string;
    photoIndex: number;
  }>({
    isOpen: false,
    stemId: '',
    imageUrl: '',
    stemName: '',
    photoIndex: 0
  });

  const [replacePhotoContext, setReplacePhotoContext] = useState<{
    stemId: string;
    photoIndex: number;
  } | null>(null);

  // Hydroponic state variables
  const [hydroData, setHydroData] = useState({
    ph: null as number | null,
    ec: null as number | null,
    waterTemp: null as number | null,
    waterQuality: null as number | null,
  });

  // Manual mode state (with localStorage persistence)
  const [hydroManualMode, setHydroManualMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hibiscusHydroponicManualMode');
      return saved ? JSON.parse(saved) : {
        ph: false,
        ec: false,
        waterTemp: false,
        waterQuality: false,
      };
    }
    return {
      ph: false,
      ec: false,
      waterTemp: false,
      waterQuality: false,
    };
  });

  // Manual entry values (with localStorage persistence)
  const [hydroManualValues, setHydroManualValues] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hibiscusHydroponicManualValues');
      return saved ? JSON.parse(saved) : {
        ph: 0,
        ec: 0,
        waterTemp: 0,
        waterQuality: 0,
      };
    }
    return {
      ph: 0,
      ec: 0,
      waterTemp: 0,
      waterQuality: 0,
    };
  });

  const [hydroHistoricalData, setHydroHistoricalData] = useState<Array<{
    timestamp: string;
    ph?: number | null;
    ec?: number | null;
    waterTemp?: number | null;
    waterQuality?: number | null;
    tds?: number | null;
    dissolvedOxygen?: number | null;
  }>>([]);

  // Hydroponic entry form state
  const [hydroEntryForm, setHydroEntryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5), // HH:MM format
    ph: '',
    ec: '',
    waterTemp: '',
    notes: ''
  });

  // Graph state for hydroponic parameters
  const [hydroGraphTimeRange, setHydroGraphTimeRange] = useState('1hour');
  const [hydroVisibleLines, setHydroVisibleLines] = useState({
    ph: true,
    ec: true,
    waterTemp: true
  });

  // Theme detection and setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
      const theme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setIsDarkMode(theme === 'dark');
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, mounted]);

  // Load plant parameters and stem history from API on mount
  useEffect(() => {
    const loadPlantParameters = async () => {
      try {
        const response = await fetch('/api/hibiscus-plant-parameters');
        if (response.ok) {
          const data = await response.json();
          if (data.parameters && Object.keys(data.parameters).length > 0) {
            setPlantParams(data.parameters);
          }
        }
      } catch (error) {
        console.error('Failed to load plant parameters:', error);
      }
    };

    const loadStemHistory = async () => {
      const stemData: {[key: string]: any[]} = {};

      for (const stem of ['A', 'B', 'C', 'D', 'E']) {
        try {
          const response = await fetch(`/api/hibiscus-plant-stem-history?stemId=${stem}`);
          if (response.ok) {
            const data = await response.json();
            // Sanitize data to ensure diseases is always a string
            const sanitizedHistory = (data.history || []).map((entry: any) => ({
              ...entry,
              diseases: typeof entry.diseases === 'string' ? entry.diseases : String(entry.diseases || '')
            }));
            stemData[stem] = sanitizedHistory;
          } else {
            stemData[stem] = [];
          }
        } catch (error) {
          console.error(`Failed to load stem ${stem} history:`, error);
          stemData[stem] = [];
        }
      }

      setStemHistoryData(stemData);
    };

    if (typeof window !== 'undefined') {
      loadPlantParameters();
      loadStemHistory();
    }
  }, []);

  // Save plant parameters to API
  useEffect(() => {
    const savePlantParameters = async () => {
      try {
        await fetch('/api/hibiscus-plant-parameters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plantParams),
        });
      } catch (error) {
        console.error('Failed to save plant parameters:', error);
      }
    };

    if (typeof window !== 'undefined' && Object.keys(plantParams).length > 0) {
      savePlantParameters();
    }
  }, [plantParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hibiscusPlantHistoricalData', JSON.stringify(historicalData));
    }
  }, [historicalData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hibiscusPlantAutoMode', JSON.stringify(autoMode));
    }
  }, [autoMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hibiscusPlantHistoricData', JSON.stringify(plantHistoricData));
    }
  }, [plantHistoricData]);

  // Load hydroponic data from API on mount
  useEffect(() => {
    const loadHydroponicData = async () => {
      try {
        const response = await fetch('/api/hibiscus-hydroponic-entries');
        if (response.ok) {
          const data = await response.json();
          setHydroHistoricalData(data.entries || []);
        }
      } catch (error) {
        console.error('Failed to load hydroponic data:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadHydroponicData();
    }
  }, []);

  // Save hydroponic manual mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hibiscusHydroponicManualMode', JSON.stringify(hydroManualMode));
    }
  }, [hydroManualMode]);

  // Save hydroponic manual values to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hibiscusHydroponicManualValues', JSON.stringify(hydroManualValues));
    }
  }, [hydroManualValues]);

  // Update hydroData when in manual mode
  useEffect(() => {
    if (typeof window !== 'undefined' && hydroHistoricalData.length > 0) {
      const latestEntry = hydroHistoricalData[hydroHistoricalData.length - 1];
      setHydroData({
        ph: hydroManualMode.ph ? hydroManualValues.ph : (latestEntry.ph ?? null),
        ec: hydroManualMode.ec ? hydroManualValues.ec : (latestEntry.ec ?? null),
        waterTemp: hydroManualMode.waterTemp ? hydroManualValues.waterTemp : (latestEntry.waterTemp ?? null),
        waterQuality: hydroManualMode.waterQuality ? hydroManualValues.waterQuality : (latestEntry.waterQuality ?? null),
      });
    }
  }, [hydroHistoricalData, hydroManualMode, hydroManualValues]);

  // Save stem photos to localStorage with quota management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Limit each stem to maximum 3 photos to prevent quota issues
        const limitedStemPhotos: {[key: string]: string[]} = {};
        Object.keys(stemPhotos).forEach(key => {
          limitedStemPhotos[key] = stemPhotos[key].slice(-3); // Keep only last 3 photos
        });

        localStorage.setItem('hibiscusPlantStemPhotos', JSON.stringify(limitedStemPhotos));
      } catch (error) {
        console.warn('Failed to save stem photos to localStorage:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.log('LocalStorage quota exceeded, limiting photos to 2 per stem...');

          // Further limit to 2 photos per stem
          const veryLimitedStemPhotos: {[key: string]: string[]} = {};
          Object.keys(stemPhotos).forEach(key => {
            veryLimitedStemPhotos[key] = stemPhotos[key].slice(-2); // Keep only last 2 photos
          });

          try {
            localStorage.setItem('hibiscusPlantStemPhotos', JSON.stringify(veryLimitedStemPhotos));

            // Update the state to match what was actually saved
            setStemPhotos(veryLimitedStemPhotos);
          } catch (secondError) {
            console.error('Cannot save photos to localStorage, storage full');
            alert('Storage is full. Please remove some photos or data to continue.');
          }
        }
      }
    }
  }, [stemPhotos]);

  // Save header photos to localStorage with error handling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hibiscusPlantHeaderPhotos', JSON.stringify(headerPhotos));
      } catch (error) {
        console.warn('Failed to save header photos to localStorage:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.log('Clearing localStorage to free up space...');
          localStorage.removeItem('hibiscusPlantHeaderPhotos');
        }
      }
    }
  }, [headerPhotos]);


  // Utility functions
  const updatePlantParameter = (key: keyof PlantParameters, value: string | number) => {
    setPlantParams(prev => {
      const updated = { ...prev, [key]: value };

      // Auto-calculate totals when individual stem values change
      if (key.includes('maturedFlowers')) {
        updated.totalMaturedFlowers = updated.stemA_maturedFlowers + updated.stemB_maturedFlowers +
                                     updated.stemC_maturedFlowers + updated.stemD_maturedFlowers;
      }
      if (key.includes('openBuds')) {
        updated.totalOpenBuds = updated.stemA_openBuds + updated.stemB_openBuds +
                               updated.stemC_openBuds + updated.stemD_openBuds;
      }
      if (key.includes('unopenedBuds')) {
        updated.totalUnopenedBuds = updated.stemA_unopenedBuds + updated.stemB_unopenedBuds +
                                   updated.stemC_unopenedBuds + updated.stemD_unopenedBuds;
      }

      return updated;
    });
  };

  const toggleAutoMode = (parameter: string) => {
    setAutoMode(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };

  const saveCurrentDataToHistory = () => {
    const newEntry: PlantHistoricalEntry = {
      timestamp: new Date().toISOString(),
      ...plantParams
    };

    setPlantHistoricData(prev => [...prev.slice(-99), newEntry]); // Keep last 100 entries
    alert('Current plant data saved to history!');
  };

  const saveStemData = async (stem: string) => {
    const stemKey = `stem${stem}`;
    const entry = {
      timestamp: new Date().toISOString(),
      height: plantParams[`${stemKey}_height` as keyof PlantParameters] as number,
      maturedFlowers: plantParams[`${stemKey}_maturedFlowers` as keyof PlantParameters] as number,
      openBuds: plantParams[`${stemKey}_openBuds` as keyof PlantParameters] as number,
      unopenedBuds: plantParams[`${stemKey}_unopenedBuds` as keyof PlantParameters] as number,
      leaves: plantParams[`${stemKey}_leaves` as keyof PlantParameters] as number,
      diseases: plantParams[`${stemKey}_diseases` as keyof PlantParameters] as string
    };

    try {
      const response = await fetch('/api/hibiscus-plant-stem-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stemId: stem,
          entry
        }),
      });

      if (response.ok) {
        // Reload stem history for this stem
        const historyResponse = await fetch(`/api/hibiscus-plant-stem-history?stemId=${stem}`);
        if (historyResponse.ok) {
          const data = await historyResponse.json();
          console.log(`✅ Fetched Stem ${stem} history:`, data.history);

          // Update the stem history data - this will automatically trigger re-renders
          setStemHistoryData(prev => {
            const newData = {
              ...prev,
              [stem]: data.history || []
            };
            console.log(`✅ Updated stemHistoryData:`, newData);
            return newData;
          });

          // Increment refresh key to force re-render
          setDataRefreshKey(prev => {
            const newKey = prev + 1;
            console.log(`✅ Updated dataRefreshKey:`, newKey);
            return newKey;
          });
        }

        alert(`Stem ${stem} data saved successfully! Check console for details.`);
      } else {
        const errorText = await response.text();
        console.error(`Failed to save Stem ${stem}:`, errorText);
        alert(`Failed to save Stem ${stem} data`);
      }
    } catch (error) {
      console.error('Failed to save stem data:', error);
      alert(`Error saving Stem ${stem} data`);
    }
  };

  // Export functions
  const exportPlantDataAsCSV = () => {
    // Collect individual stem data from state
    const stemDataMap: {[key: string]: any[]} = {};

    ['A', 'B', 'C', 'D', 'E'].forEach(stem => {
      stemDataMap[stem] = stemHistoryData[stem] || [];
    });

    // Check if any data exists
    const hasData = Object.values(stemDataMap).some(data => data.length > 0);
    if (!hasData) {
      alert('No stem data to export. Please save some measurements first.');
      return;
    }

    // Create individual rows for each stem entry
    const allData: Array<{
      date: string;
      time: string;
      numberOfStems: number;
      totalMaturedFlowers: number;
      totalOpenBuds: number;
      totalUnopenedBuds: number;
      notes: string;
      timestamp: number;
    }> = [];

    // Collect data from all stems
    ['A', 'B', 'C', 'D', 'E'].forEach(stem => {
      const stemData = stemDataMap[stem];
      stemData.forEach((entry: any) => {
        const entryDate = new Date(String(entry.timestamp)).toISOString().split('T')[0];
        const entryTime = new Date(String(entry.timestamp)).toTimeString().slice(0, 5);

        const maturedFlowers = Number(entry.maturedFlowers) || 0;
        const openBuds = Number(entry.openBuds) || 0;
        const unopenedBuds = Number(entry.unopenedBuds) || 0;
        const diseases = String(entry.diseases || '').trim();

        allData.push({
          date: entryDate,
          time: entryTime,
          numberOfStems: 1, // Each row represents one stem measurement
          totalMaturedFlowers: maturedFlowers,
          totalOpenBuds: openBuds,
          totalUnopenedBuds: unopenedBuds,
          notes: diseases ? `Stem ${stem}: ${diseases}` : '',
          timestamp: new Date(entry.timestamp).getTime()
        });
      });
    });

    if (allData.length === 0) {
      alert('No data to export. Please save some measurements first.');
      return;
    }

    // Sort by timestamp
    allData.sort((a, b) => a.timestamp - b.timestamp);

    const headers = [
      'Date', 'Time', 'Number of Stems', 'Total Matured Flowers',
      'Total Open Buds', 'Total Unopened Buds', 'Notes (Diseases/Issues)'
    ];

    const rows = allData.map(entry => [
      entry.date,
      entry.time,
      entry.numberOfStems,
      entry.totalMaturedFlowers,
      entry.totalOpenBuds,
      entry.totalUnopenedBuds,
      entry.notes.replace(/"/g, '""') // Escape quotes in notes
    ].join(','));

    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hibiscus_plant_aggregated_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple test functions first
  const testCSVFunction = useCallback(() => {
    alert('Test CSV function called!');
    console.log('testCSVFunction executed');
  }, []);

  const testJSONFunction = useCallback(() => {
    alert('Test JSON function called!');
    console.log('testJSONFunction executed');
  }, []);

  // Complete system export functions
  const exportCompleteDataAsCSV = () => {
    alert('CSV button clicked! Function is working.');
    console.log('exportCompleteDataAsCSV function called');
    try {
      const allData: any[] = [];

      // 1. Collect Hibiscus Plant Data from state variables
      ['A', 'B', 'C', 'D', 'E'].forEach(stem => {
        if (typeof window !== 'undefined') {
          const stemHistoryKey = `hibiscusPlantStem${stem}History`;
          const stemHistory = localStorage.getItem(stemHistoryKey);
          if (stemHistory) {
            const stemData = JSON.parse(stemHistory);
            stemData.forEach((entry: any) => {
              const entryDate = String(entry[`stem${stem}_date`] || new Date(String(entry.timestamp)).toISOString().split('T')[0]);
              const entryTime = String(entry[`stem${stem}_time`] || new Date(String(entry.timestamp)).toTimeString().slice(0, 5));

              allData.push({
                category: 'Plant Growth',
                dataType: 'Hibiscus Plant - Individual Stems',
                date: entryDate,
                time: entryTime,
                stem: `Stem ${stem}`,
                height: entry[`stem${stem}_height`] || '',
                maturedFlowers: entry[`stem${stem}_maturedFlowers`] || '',
                openBuds: entry[`stem${stem}_openBuds`] || '',
                unopenedBuds: entry[`stem${stem}_unopenedBuds`] || '',
                diseases: entry[`stem${stem}_diseases`] || '',
                timestamp: entry.timestamp || 0
              });
            });
          }
        }
      });

      // 2. Add overall plant data from historicalData state
      historicalData.forEach(entry => {
        allData.push({
          category: 'Plant Growth',
          dataType: 'Hibiscus Plant - Overall Health',
          date: new Date(entry.timestamp).toISOString().split('T')[0],
          time: new Date(entry.timestamp).toTimeString().slice(0, 5),
          stem: 'Overall Plant',
          totalMaturedFlowers: entry.totalMaturedFlowers || '',
          totalOpenBuds: entry.totalOpenBuds || '',
          totalUnopenedBuds: entry.totalUnopenedBuds || '',
          overallHealth: entry.overallPlantHealth || '',
          timestamp: new Date(entry.timestamp).getTime()
        });
      });

      // 3. Try to collect hydroponic data if available
      if (typeof window !== 'undefined') {
        try {
          const hydroHistorical = localStorage.getItem('hydroponicHistoricalData');
          if (hydroHistorical) {
            const data = JSON.parse(hydroHistorical);
            data.forEach((entry: any) => {
              allData.push({
                category: 'Environment',
                dataType: 'Hydroponic Environment',
                date: new Date(entry.timestamp).toISOString().split('T')[0],
                time: new Date(entry.timestamp).toTimeString().slice(0, 5),
                temperature: entry.temperature || '',
                humidity: entry.humidity || '',
                lightIntensity: entry.light_intensity || '',
                co2Level: entry.co2_level || '',
                timestamp: entry.timestamp || 0
              });
            });
          }

          const nutrientData = localStorage.getItem('nutrient-entries');
          if (nutrientData) {
            const data = JSON.parse(nutrientData);
            data.forEach((entry: any) => {
              allData.push({
                category: 'Nutrition',
                dataType: 'Nutrient Management',
                date: entry.date || '',
                time: entry.time || '12:00',
                nutrientType: entry.nutrientType || '',
                concentration: entry.concentration || '',
                amount: entry.amount || '',
                notes: entry.notes || '',
                timestamp: entry.timestamp || new Date(`${entry.date}T${entry.time || '12:00'}`).getTime()
              });
            });
          }
        } catch (hydroError) {
          console.warn('Could not load hydroponic/nutrient data:', hydroError);
        }
      }

      // Sort by timestamp
      allData.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));

      if (allData.length === 0) {
        alert('No data available for export. Please save some measurements first.');
        return;
      }

      // Create comprehensive CSV
      const headers = [
        'Category', 'Data Type', 'Date', 'Time', 'Stem',
        'Height (cm)', 'Matured Flowers', 'Open Buds', 'Unopened Buds', 'Diseases/Issues',
        'Total Matured Flowers', 'Total Open Buds', 'Total Unopened Buds', 'Overall Health',
        'Temperature (°C)', 'Humidity (%)', 'Light Intensity', 'CO2 Level',
        'Nutrient Type', 'Concentration', 'Amount', 'Notes', 'Timestamp'
      ];

      const rows = allData.map(entry => [
        entry.category || '',
        entry.dataType || '',
        entry.date || '',
        entry.time || '',
        entry.stem || '',
        entry.height || '',
        entry.maturedFlowers || '',
        entry.openBuds || '',
        entry.unopenedBuds || '',
        entry.diseases || '',
        entry.totalMaturedFlowers || '',
        entry.totalOpenBuds || '',
        entry.totalUnopenedBuds || '',
        entry.overallHealth || '',
        entry.temperature || '',
        entry.humidity || '',
        entry.lightIntensity || '',
        entry.co2Level || '',
        entry.nutrientType || '',
        entry.concentration || '',
        entry.amount || '',
        entry.notes || '',
        entry.timestamp || ''
      ].map(value => typeof value === 'string' && value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value).join(','));

      const csvContent = headers.join(',') + '\n' + rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `complete_system_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Successfully exported ${allData.length} records to CSV`);
      alert(`Successfully exported ${allData.length} records to CSV!`);
    } catch (error) {
      console.error('Error exporting complete CSV data:', error);
      alert('Error exporting data. Please check the console for details.');
    }
  };

  const exportCompleteDataAsJSON = () => {
    alert('JSON button clicked! Function is working.');
    console.log('exportCompleteDataAsJSON function called');
    try {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          exportType: 'Complete System Data',
          description: 'Comprehensive export of all available system data',
          totalRecords: 0
        },
        hibiscusPlantData: {
          stems: {} as Record<string, any[]>,
          parameters: plantParams,
          historicalData: historicalData,
          plantHistoricData: plantHistoricData
        },
        externalData: {
          hydroponicData: [] as any[],
          nutrientData: [] as any[]
        }
      };

      // Collect individual stem data
      ['A', 'B', 'C', 'D', 'E'].forEach(stem => {
        if (typeof window !== 'undefined') {
          const stemHistoryKey = `hibiscusPlantStem${stem}History`;
          const stemHistory = localStorage.getItem(stemHistoryKey);
          if (stemHistory) {
            try {
              exportData.hibiscusPlantData.stems[`stem${stem}`] = JSON.parse(stemHistory);
            } catch (e) {
              console.warn(`Failed to parse stem ${stem} data:`, e);
            }
          }
        }
      });

      // Try to collect external data if available
      if (typeof window !== 'undefined') {
        try {
          const hydroData = localStorage.getItem('hydroponicHistoricalData');
          if (hydroData) {
            exportData.externalData.hydroponicData = JSON.parse(hydroData);
          }

          const nutrientData = localStorage.getItem('nutrient-entries');
          if (nutrientData) {
            exportData.externalData.nutrientData = JSON.parse(nutrientData);
          }
        } catch (externalError) {
          console.warn('Could not load external data:', externalError);
        }
      }

      // Calculate total records
      let totalRecords = 0;
      totalRecords += Object.values(exportData.hibiscusPlantData.stems).reduce((sum, stemData) => sum + stemData.length, 0);
      totalRecords += exportData.hibiscusPlantData.historicalData.length;
      totalRecords += exportData.hibiscusPlantData.plantHistoricData.length;
      totalRecords += exportData.externalData.hydroponicData.length;
      totalRecords += exportData.externalData.nutrientData.length;

      exportData.metadata.totalRecords = totalRecords;

      if (totalRecords === 0) {
        alert('No data available for export. Please save some measurements first.');
        return;
      }

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `complete_system_data_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Successfully exported ${totalRecords} total records to JSON`);
      alert(`Successfully exported ${totalRecords} records to JSON!`);
    } catch (error) {
      console.error('Error exporting complete JSON data:', error);
      alert('Error exporting data. Please check the console for details.');
    }
  };

  // State for uploaded photos
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const [photoRefresh, setPhotoRefresh] = useState(0);

  // State for photo modal
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Fetch uploaded photos
  const fetchUploadedPhotos = useCallback(async () => {
    try {
      const response = await fetch('/api/plant-photos?page=hibiscus-plant');
      if (response.ok) {
        const data = await response.json();
        setUploadedPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  }, []);

  // Load photos on component mount and when refreshed
  useEffect(() => {
    fetchUploadedPhotos();
  }, [fetchUploadedPhotos, photoRefresh]);

  // Photo modal functions
  const openPhotoModal = (photo: any) => {
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const closeUploadedPhotoModal = () => {
    setSelectedPhoto(null);
    setIsPhotoModalOpen(false);
  };

  // Download uploaded photo function
  const downloadUploadedPhoto = (photo: any) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.originalName || `photo_${photo.id}.jpg`;
    link.click();
  };

  // Delete functionality disabled - photos are now non-deletable
  // const deletePhoto = async (photoId: string) => {
  //   if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/plant-photos?photoId=${photoId}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       alert('Photo deleted successfully!');
  //       setPhotoRefresh(prev => prev + 1);
  //       closeUploadedPhotoModal();
  //     } else {
  //       alert('Failed to delete photo. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting photo:', error);
  //     alert('Error deleting photo. Please try again.');
  //   }
  // };

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
        formData.append('page', 'hibiscus-plant');
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
      // Refresh photos to show newly uploaded ones
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
        formData.append('page', 'hibiscus-plant');
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.tags) formData.append('tags', metadata.tags);
        if (metadata.location) formData.append('location', metadata.location);
        if (metadata.duration) formData.append('duration', metadata.duration);

        const response = await fetch('/api/hibiscus-plant-videos', {
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
      // Refresh videos to show newly uploaded ones
      setVideoRefresh(prev => prev + 1);
    } else {
      alert('Failed to upload videos. Please try again.');
    }
  };

  // Fetch videos (following same pattern as photos)
  const fetchUploadedVideos = useCallback(async () => {
    try {
      console.log('Fetching videos from /api/hibiscus-plant-videos...');
      const response = await fetch('/api/hibiscus-plant-videos?page=hibiscus-plant');
      console.log('Video fetch response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched videos data:', data);
        // Ensure videos is always an array, following photos pattern
        setUploadedVideos(data.videos || []);
      } else {
        console.error('Failed to fetch videos, response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  }, []);

  // Video modal handlers
  const openVideoModal = (video: any) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsVideoModalOpen(false);
  };

  // Download video function
  const downloadUploadedVideo = (video: any) => {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = video.originalName || `video_${video.id}.mp4`;
    link.click();
  };

  // Delete functionality disabled - videos are now non-deletable
  // const deleteVideo = async (videoId: string) => {
  //   if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/hibiscus-plant-videos?videoId=${videoId}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       alert('Video deleted successfully!');
  //       setVideoRefresh(prev => prev + 1);
  //       closeVideoModal();
  //     } else {
  //       alert('Failed to delete video. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting video:', error);
  //     alert('Error deleting video. Please try again.');
  //   }
  // };

  // Fetch documents (following same pattern as photos)
  const fetchUploadedDocuments = useCallback(async () => {
    try {
      console.log('Fetching documents from /api/hibiscus-plant-documents...');
      const response = await fetch('/api/hibiscus-plant-documents?page=hibiscus-plant');
      console.log('Document fetch response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched documents data:', data);
        setUploadedDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents, response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, []);

  // Fetch uploaded links
  const fetchUploadedLinks = useCallback(async () => {
    try {
      console.log('Fetching links from /api/hibiscus-plant-links...');
      const response = await fetch('/api/hibiscus-plant-links?page=hibiscus-plant');
      console.log('Link fetch response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched links data:', data);
        setUploadedLinks(data.links || []);
      } else {
        console.error('Failed to fetch links, response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  }, []);

  // Document modal handlers
  const openDocumentModal = (document: any) => {
    setSelectedDocument(document);
    setIsDocumentModalOpen(true);
  };

  const closeDocumentModal = () => {
    setSelectedDocument(null);
    setIsDocumentModalOpen(false);
  };

  // Download document function
  const downloadUploadedDocument = (document: any) => {
    const link = document.createElement('a');
    link.href = `/uploads/hibiscus-plant-documents/${document.filename}`;
    link.download = document.originalName || `document_${document.id}.pdf`;
    link.click();
  };

  // Delete functionality disabled - documents are now non-deletable
  // const deleteDocument = async (documentId: string) => {
  //   if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/hibiscus-plant-documents?documentId=${documentId}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       alert('Document deleted successfully!');
  //       setDocumentRefresh(prev => prev + 1);
  //       closeDocumentModal();
  //     } else {
  //       alert('Failed to delete document. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting document:', error);
  //     alert('Error deleting document. Please try again.');
  //   }
  // };

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
        formData.append('page', 'hibiscus-plant');
        if (metadata.description) formData.append('description', metadata.description);
        if (metadata.tags) formData.append('tags', metadata.tags);
        if (metadata.location) formData.append('location', metadata.location);
        if (metadata.documentType) formData.append('documentType', metadata.documentType);

        const response = await fetch('/api/hibiscus-plant-documents', {
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
      // Refresh documents to show newly uploaded ones
      setDocumentRefresh(prev => prev + 1);
    } else {
      alert('Failed to upload documents. Please try again.');
    }
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

  // Delete link function
  const deleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/hibiscus-plant-links?linkId=${linkId}&page=hibiscus-plant`, {
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
      formData.append('stemId', metadata.stemId || 'HIBISCUS_PLANT');
      formData.append('category', metadata.category);
      formData.append('page', 'hibiscus-plant');
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.tags) formData.append('tags', metadata.tags);
      if (metadata.location) formData.append('location', metadata.location);

      const response = await fetch('/api/hibiscus-plant-links', {
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

  // Load videos on component mount and when refreshed (following photos pattern)
  useEffect(() => {
    fetchUploadedVideos();
  }, [fetchUploadedVideos, videoRefresh]);

  // Load documents on component mount and when refreshed (following photos pattern)
  useEffect(() => {
    fetchUploadedDocuments();
  }, [fetchUploadedDocuments, documentRefresh]);

  // Load links on component mount and when refreshed (following photos pattern)
  useEffect(() => {
    fetchUploadedLinks();
  }, [fetchUploadedLinks, linkRefresh]);

  const exportPlantDataAsJSON = () => {
    // Collect individual stem data
    const stemDataMap: {[key: string]: Record<string, unknown>[]} = {};

    ['A', 'B', 'C', 'D', 'E'].forEach(stem => {
      const stemHistoryKey = `hibiscusPlantStem${stem}History`;
      const stemHistory = localStorage.getItem(stemHistoryKey);
      if (stemHistory) {
        stemDataMap[stem] = JSON.parse(stemHistory);
      } else {
        stemDataMap[stem] = [];
      }
    });

    // Check if any data exists
    const hasData = Object.values(stemDataMap).some(data => data.length > 0);
    if (!hasData) {
      alert('No stem data to export. Please save some measurements first.');
      return;
    }

    // Create a clean, structured JSON export
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dataType: 'Hibiscus Plant Growth Monitoring Data',
        description: 'Individual stem tracking data with measurements over time',
        version: '1.0',
        totalStemsWithData: Object.values(stemDataMap).filter(data => data.length > 0).length
      },
      currentState: {
        stemA: {
          height: plantParams.stemA_height,
          maturedFlowers: plantParams.stemA_maturedFlowers,
          openBuds: plantParams.stemA_openBuds,
          unopenedBuds: plantParams.stemA_unopenedBuds,
          leaves: plantParams.stemA_leaves,
          diseases: plantParams.stemA_diseases,
          lastUpdated: plantParams.stemA_date + ' ' + plantParams.stemA_time
        },
        stemB: {
          height: plantParams.stemB_height,
          maturedFlowers: plantParams.stemB_maturedFlowers,
          openBuds: plantParams.stemB_openBuds,
          unopenedBuds: plantParams.stemB_unopenedBuds,
          leaves: plantParams.stemB_leaves,
          diseases: plantParams.stemB_diseases,
          lastUpdated: plantParams.stemB_date + ' ' + plantParams.stemB_time
        },
        stemC: {
          height: plantParams.stemC_height,
          maturedFlowers: plantParams.stemC_maturedFlowers,
          openBuds: plantParams.stemC_openBuds,
          unopenedBuds: plantParams.stemC_unopenedBuds,
          leaves: plantParams.stemC_leaves,
          diseases: plantParams.stemC_diseases,
          lastUpdated: plantParams.stemC_date + ' ' + plantParams.stemC_time
        },
        stemD: {
          height: plantParams.stemD_height,
          maturedFlowers: plantParams.stemD_maturedFlowers,
          openBuds: plantParams.stemD_openBuds,
          unopenedBuds: plantParams.stemD_unopenedBuds,
          leaves: plantParams.stemD_leaves,
          diseases: plantParams.stemD_diseases,
          lastUpdated: plantParams.stemD_date + ' ' + plantParams.stemD_time
        },
        overallHealth: plantParams.overallPlantHealth,
        totals: {
          maturedFlowers: plantParams.totalMaturedFlowers,
          openBuds: plantParams.totalOpenBuds,
          unopenedBuds: plantParams.totalUnopenedBuds
        }
      },
      historicalData: {
        stemA: stemDataMap.A.map(entry => ({
          date: entry.stemA_date || new Date(String(entry.timestamp)).toISOString().split('T')[0],
          time: entry.stemA_time || new Date(String(entry.timestamp)).toTimeString().slice(0, 5),
          height: entry.stemA_height,
          maturedFlowers: entry.stemA_maturedFlowers,
          openBuds: entry.stemA_openBuds,
          unopenedBuds: entry.stemA_unopenedBuds,
          leaves: entry.stemA_leaves,
          diseases: entry.stemA_diseases,
          timestamp: entry.timestamp
        })),
        stemB: stemDataMap.B.map(entry => ({
          date: entry.stemB_date || new Date(String(entry.timestamp)).toISOString().split('T')[0],
          time: entry.stemB_time || new Date(String(entry.timestamp)).toTimeString().slice(0, 5),
          height: entry.stemB_height,
          maturedFlowers: entry.stemB_maturedFlowers,
          openBuds: entry.stemB_openBuds,
          unopenedBuds: entry.stemB_unopenedBuds,
          leaves: entry.stemB_leaves,
          diseases: entry.stemB_diseases,
          timestamp: entry.timestamp
        })),
        stemC: stemDataMap.C.map(entry => ({
          date: entry.stemC_date || new Date(String(entry.timestamp)).toISOString().split('T')[0],
          time: entry.stemC_time || new Date(String(entry.timestamp)).toTimeString().slice(0, 5),
          height: entry.stemC_height,
          maturedFlowers: entry.stemC_maturedFlowers,
          openBuds: entry.stemC_openBuds,
          unopenedBuds: entry.stemC_unopenedBuds,
          leaves: entry.stemC_leaves,
          diseases: entry.stemC_diseases,
          timestamp: entry.timestamp
        })),
        stemD: stemDataMap.D.map(entry => ({
          date: entry.stemD_date || new Date(String(entry.timestamp)).toISOString().split('T')[0],
          time: entry.stemD_time || new Date(String(entry.timestamp)).toTimeString().slice(0, 5),
          height: entry.stemD_height,
          maturedFlowers: entry.stemD_maturedFlowers,
          openBuds: entry.stemD_openBuds,
          unopenedBuds: entry.stemD_unopenedBuds,
          leaves: entry.stemD_leaves,
          diseases: entry.stemD_diseases,
          timestamp: entry.timestamp
        }))
      },
      statistics: {
        totalEntries: Object.values(stemDataMap).reduce((sum, data) => sum + data.length, 0),
        entriesPerStem: {
          stemA: stemDataMap.A.length,
          stemB: stemDataMap.B.length,
          stemC: stemDataMap.C.length,
          stemD: stemDataMap.D.length
        },
        dateRange: {
          earliest: Math.min(...Object.values(stemDataMap).flat().map((entry: Record<string, unknown>) => new Date(String(entry.timestamp)).getTime())),
          latest: Math.max(...Object.values(stemDataMap).flat().map((entry: Record<string, unknown>) => new Date(String(entry.timestamp)).getTime()))
        }
      }
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hibiscus_plant_complete_data_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hydroponic utility functions
  const toggleHydroManualMode = (parameter: 'ph' | 'ec' | 'waterTemp' | 'waterQuality') => {
    setHydroManualMode((prev: Record<string, boolean>) => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };

  const handleHydroEntryChange = (field: keyof typeof hydroEntryForm, value: string) => {
    setHydroEntryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveHydroponicEntry = async () => {
    // Update manual values with the entered values
    const newManualValues = {
      ...hydroManualValues,
      ph: parseFloat(hydroEntryForm.ph) || 0,
      ec: parseFloat(hydroEntryForm.ec) || 0,
      waterTemp: parseFloat(hydroEntryForm.waterTemp) || 0,
    };

    setHydroManualValues(newManualValues);

    // Switch to manual mode for the parameters that have values
    const newManualMode = { ...hydroManualMode };
    if (hydroEntryForm.ph) newManualMode.ph = true;
    if (hydroEntryForm.ec) newManualMode.ec = true;
    if (hydroEntryForm.waterTemp) newManualMode.waterTemp = true;

    setHydroManualMode(newManualMode);

    // Save to historical data with combined date and time
    const combinedDateTime = new Date(`${hydroEntryForm.date}T${hydroEntryForm.time}:00`).toISOString();
    const newEntry = {
      timestamp: combinedDateTime,
      ph: parseFloat(hydroEntryForm.ph) || null,
      ec: parseFloat(hydroEntryForm.ec) || null,
      waterTemp: parseFloat(hydroEntryForm.waterTemp) || null,
      waterQuality: null,
      notes: hydroEntryForm.notes || 'Manual entry',
    };

    // Save to API
    try {
      const response = await fetch('/api/hibiscus-hydroponic-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        const data = await response.json();
        setHydroHistoricalData(prev => [...prev.slice(-999), newEntry]);
        alert('Hydroponic parameters saved successfully!');
      } else {
        alert('Failed to save hydroponic parameters.');
      }
    } catch (error) {
      console.error('Failed to save hydroponic entry:', error);
      alert('Failed to save hydroponic parameters.');
    }

    // Reset form
    setHydroEntryForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      ph: '',
      ec: '',
      waterTemp: '',
      notes: ''
    });
  };

  const getCurrentHydroValue = (parameter: 'ph' | 'ec' | 'waterTemp' | 'waterQuality'): number | null => {
    if (hydroManualMode[parameter]) {
      return hydroManualValues[parameter];
    }
    return hydroData[parameter];
  };

  const getFilteredHydroGraphData = () => {
    const now = new Date();
    let cutoffTime: Date;

    switch (hydroGraphTimeRange) {
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

    return hydroHistoricalData.filter(entry => new Date(entry.timestamp) >= cutoffTime);
  };

  const toggleHydroGraphLine = (parameter: 'ph' | 'ec' | 'waterTemp') => {
    setHydroVisibleLines(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));
  };

  // Export functions for hydroponic data
  const exportHydroponicDataAsCSV = () => {
    if (hydroHistoricalData.length === 0) {
      alert('No hydroponic data to export.');
      return;
    }

    const headers = ['Date', 'Time', 'pH Level', 'EC (mS/cm)', 'Water Temperature (°C)', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...hydroHistoricalData.map(entry => {
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        const notes = ('notes' in entry && typeof entry.notes === 'string') ? entry.notes : '';

        return [
          `"${formattedDate}"`,
          `"${formattedTime}"`,
          entry.ph?.toFixed(1) ?? '',
          entry.ec?.toFixed(1) ?? '',
          entry.waterTemp?.toFixed(1) ?? '',
          `"${notes}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hibiscus_hydroponic_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHydroponicDataAsJSON = () => {
    if (hydroHistoricalData.length === 0) {
      alert('No hydroponic data to export.');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      plant: 'Hibiscus',
      dataType: 'Hydroponic Parameters',
      description: 'Hydroponic system water parameters monitoring data for Hibiscus plant',
      totalEntries: hydroHistoricalData.length,
      data: hydroHistoricalData.map(entry => ({
        timestamp: entry.timestamp,
        date: new Date(entry.timestamp).toLocaleDateString(),
        time: new Date(entry.timestamp).toLocaleTimeString(),
        ph: entry.ph,
        ec: entry.ec,
        waterTemperature: entry.waterTemp,
        waterQuality: entry.waterQuality,
        notes: ('notes' in entry && typeof entry.notes === 'string') ? entry.notes : null
      }))
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hibiscus_hydroponic_data_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enhanced input validation with error messages
  const validateInput = (key: keyof PlantParameters, value: string): { isValid: boolean; error?: string } => {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }

    switch (key) {
      case 'stemA_height':
      case 'stemB_height':
      case 'stemC_height':
      case 'stemD_height':
        if (numValue < 0) {
          return { isValid: false, error: 'Height cannot be negative' };
        }
        if (numValue > 200) {
          return { isValid: false, error: 'Height cannot exceed 200cm' };
        }
        return { isValid: true };
      case 'stemA_maturedFlowers':
      case 'stemB_maturedFlowers':
      case 'stemC_maturedFlowers':
      case 'stemD_maturedFlowers':
      case 'stemA_openBuds':
      case 'stemB_openBuds':
      case 'stemC_openBuds':
      case 'stemD_openBuds':
      case 'stemA_unopenedBuds':
      case 'stemB_unopenedBuds':
      case 'stemC_unopenedBuds':
      case 'stemD_unopenedBuds':
      case 'stemA_leaves':
      case 'stemB_leaves':
      case 'stemC_leaves':
      case 'stemD_leaves':
      case 'totalMaturedFlowers':
      case 'totalOpenBuds':
      case 'totalUnopenedBuds':
        if (!Number.isInteger(numValue)) {
          return { isValid: false, error: 'Must be a whole number' };
        }
        if (numValue < 0) {
          return { isValid: false, error: 'Count cannot be negative' };
        }
        if (numValue > 999) {
          return { isValid: false, error: 'Count cannot exceed 999' };
        }
        return { isValid: true };
      default:
        return { isValid: true };
    }
  };

  // Missing utility functions
  const getPlantParameterValue = (param: keyof PlantParameters) => {
    return plantParams[param];
  };

  const togglePlantManualMode = (param: string) => {
    setPlantManualMode(prev => ({
      ...prev,
      [param]: !prev[param]
    }));
  };

  const handlePlantParameterChange = (param: keyof PlantParameters, value: string) => {
    // Clear any existing validation error for this parameter
    setValidationErrors(prev => ({
      ...prev,
      [param]: ''
    }));

    if (param === 'stemA_diseases' || param === 'stemB_diseases' || param === 'stemC_diseases' || param === 'stemD_diseases' ||
        param === 'overallPlantHealth' || param === 'stemA_date' || param === 'stemB_date' || param === 'stemC_date' || param === 'stemD_date' ||
        param === 'stemA_time' || param === 'stemB_time' || param === 'stemC_time' || param === 'stemD_time') {
      updatePlantParameter(param, value);
    } else {
      const validation = validateInput(param, value);
      if (validation.isValid) {
        const numValue = parseFloat(value);
        updatePlantParameter(param, numValue);
      } else {
        // Set validation error
        setValidationErrors(prev => ({
          ...prev,
          [param]: validation.error || 'Invalid input'
        }));
      }
    }
  };

  // Image compression function to reduce storage size
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== handleFileSelect called ===');
    console.log('Files:', event.target.files);
    console.log('Current photo stem:', currentPhotoStem);
    console.log('Upload type:', uploadType);

    if (!event.target.files || event.target.files.length === 0) {
      console.log('No files selected');
      return;
    }

    if (!currentPhotoStem) {
      console.log('No currentPhotoStem set');
      return;
    }

    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    console.log(`Processing ${imageFiles.length} image files for ${currentPhotoStem}`);

    if (imageFiles.length === 0) {
      console.log('No valid image files found');
      return;
    }

    // Process each image file with compression
    imageFiles.forEach(async (file, index) => {
      console.log(`Compressing file ${index + 1}/${imageFiles.length}: ${file.name}`);

      try {
        const compressedDataUrl = await compressImage(file);
        console.log(`✅ Successfully compressed file: ${file.name} for ${currentPhotoStem}`);
        console.log(`Original size: ${file.size} bytes, Compressed size: ${compressedDataUrl.length} chars`);

        setStemPhotos(prev => {
          const updated = {
            ...prev,
            [currentPhotoStem]: [...(prev[currentPhotoStem] || []), compressedDataUrl]
          };
          console.log(`📸 Updated ${currentPhotoStem} photos, total: ${updated[currentPhotoStem].length}`);
          return updated;
        });

        // Force refresh
        setPhotoRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error(`❌ Failed to compress file: ${file.name}`, error);

        // Fallback to original FileReader if compression fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result && result.startsWith('data:image/')) {
            console.log(`✅ Fallback: Successfully read file: ${file.name} for ${currentPhotoStem}`);

            setStemPhotos(prev => {
              const updated = {
                ...prev,
                [currentPhotoStem]: [...(prev[currentPhotoStem] || []), result]
              };
              return updated;
            });

            setPhotoRefreshKey(prev => prev + 1);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset states
    setCurrentPhotoStem('');
    setUploadType('');
    if (event.target) {
      event.target.value = '';
    }
  };


  const renderParameterWithToggle = (
    label: string,
    param: keyof PlantParameters,
    type: 'number' | 'text' | 'select' | 'date' | 'time' = 'number',
    step?: string,
    options?: string[]
  ) => {
    const isManual = plantManualMode[param];
    const value = getPlantParameterValue(param);
    const hasError = validationErrors[param];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{label}</label>
          <div className="flex items-center space-x-2">
            <label htmlFor={`toggle-${param}`} className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isManual ? 'Manual' : 'Auto'}
            </label>
            <button
              id={`toggle-${param}`}
              onClick={() => togglePlantManualMode(param)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isManual ? 'bg-blue-600' : (isDarkMode ? 'bg-gray-600' : 'bg-gray-200')
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  isManual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div>
          {type === 'select' && options ? (
            <select
              value={String(value)}
              onChange={(e) => handlePlantParameterChange(param, e.target.value)}
              disabled={!isManual}
              className={`w-full h-8 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                hasError ? 'border-red-500 focus:ring-red-400' : (
                  isDarkMode
                    ? 'border-gray-600 focus:ring-blue-400'
                    : 'border-gray-300 focus:ring-blue-500'
                )
              } ${
                isDarkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-900'
              } ${!isManual ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : type === 'text' ? (
            <textarea
              value={String(value)}
              onChange={(e) => handlePlantParameterChange(param, e.target.value)}
              disabled={!isManual}
              className={`w-full min-h-[60px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                hasError ? 'border-red-500 focus:ring-red-400' : (
                  isDarkMode
                    ? 'border-gray-600 focus:ring-blue-400'
                    : 'border-gray-300 focus:ring-blue-500'
                )
              } ${
                isDarkMode
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-white text-gray-900 placeholder-gray-500'
              } ${!isManual ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Enter any diseases or issues..."
            />
          ) : type === 'date' ? (
            <input
              type="date"
              value={String(value)}
              onChange={(e) => handlePlantParameterChange(param, e.target.value)}
              disabled={!isManual}
              className={`w-full h-8 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                hasError ? 'border-red-500 focus:ring-red-400' : (
                  isDarkMode
                    ? 'border-gray-600 focus:ring-blue-400'
                    : 'border-gray-300 focus:ring-blue-500'
                )
              } ${
                isDarkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-900'
              } ${!isManual ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          ) : type === 'time' ? (
            <input
              type="time"
              value={String(value)}
              onChange={(e) => handlePlantParameterChange(param, e.target.value)}
              disabled={!isManual}
              className={`w-full h-8 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                hasError ? 'border-red-500 focus:ring-red-400' : (
                  isDarkMode
                    ? 'border-gray-600 focus:ring-blue-400'
                    : 'border-gray-300 focus:ring-blue-500'
                )
              } ${
                isDarkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-900'
              } ${!isManual ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          ) : (
            <input
              type="number"
              value={String(value)}
              onChange={(e) => handlePlantParameterChange(param, e.target.value)}
              disabled={!isManual}
              step={step || "0.1"}
              className={`w-full h-8 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                hasError ? 'border-red-500 focus:ring-red-400' : (
                  isDarkMode
                    ? 'border-gray-600 focus:ring-blue-400'
                    : 'border-gray-300 focus:ring-blue-500'
                )
              } ${
                isDarkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-900'
              } ${!isManual ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          )}
          {hasError && (
            <p className="text-red-500 text-xs mt-1">{hasError}</p>
          )}
        </div>
      </div>
    );
  };

  const renderPlantChart = (data: PlantHistoricalEntry[], param: keyof PlantHistoricalEntry, color: string, label: string) => {
    const validData = data.filter(d => d[param] !== undefined && d[param] !== null);
    if (validData.length === 0) return (
      <div className={`p-4 rounded-lg border-2 border-dashed ${
        isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
      }`}>
        <p className={`text-sm text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>No data available for {label}</p>
      </div>
    );

    // Transform data for Recharts
    const chartData = validData.map((entry, index) => ({
      index,
      value: Number(entry[param]),
      date: new Date(String(entry.timestamp)).toLocaleDateString(),
      timestamp: entry.timestamp
    }));

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; payload?: Record<string, unknown> }> }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className={`p-3 border rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
          }`}>
            <p className={`font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>{String(data?.date || '')}</p>
            <p className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span style={{ color }}>{label}: </span>
              <span className="font-medium">{(typeof data?.value === 'number') ? data.value.toFixed(1) : '--'}</span>
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" style={{ color }} />
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-200' : 'text-gray-900'
          }`}>{label}</span>
        </div>
        <div className={`p-4 rounded-lg transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                dataKey="index"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#9ca3af' : '#6b7280'
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#9ca3af' : '#6b7280'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const hasIndividualStemData = () => {
    return ['A', 'B', 'C', 'D', 'E'].some(stem => {
      const stemData = stemHistoryData[stem] || [];
      return stemData.length > 0;
    });
  };

  const toggleChartParameter = (stem: string, param: string) => {
    setSelectedChartParams(prev => ({
      ...prev,
      [stem]: {
        ...prev[stem],
        [param]: !prev[stem][param]
      }
    }));
  };

  // Helper function to trigger header photo upload (single photo for thumbnail)
  const triggerHeaderPhotoUpload = (stemId: string) => {
    console.log(`Triggering header photo upload for ${stemId}`);
    setCurrentPhotoStem(stemId);
    setUploadType('header');

    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.multiple = false; // Single file only
    tempInput.accept = 'image/*';
    tempInput.style.display = 'none';
    tempInput.onchange = (e) => handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>);
    document.body.appendChild(tempInput);
    tempInput.click();
    document.body.removeChild(tempInput);
  };

  // Helper function to trigger multiple photos upload
  const triggerMultiplePhotoUpload = (stemId: string) => {
    console.log(`Triggering multiple photo upload for ${stemId}`);
    setCurrentPhotoStem(stemId);
    setUploadType('multiple');

    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.multiple = true; // Multiple files
    tempInput.accept = 'image/*';
    tempInput.style.display = 'none';
    tempInput.onchange = (e) => handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>);
    document.body.appendChild(tempInput);
    tempInput.click();
    document.body.removeChild(tempInput);
  };

  // Photo modal functions
  const openStemPhotoModal = (stemId: string, imageUrl: string, stemName: string, photoIndex: number = 0) => {
    setPhotoModal({
      isOpen: true,
      stemId,
      imageUrl,
      stemName,
      photoIndex
    });
  };

  const closePhotoModal = () => {
    setPhotoModal({
      isOpen: false,
      stemId: '',
      imageUrl: '',
      stemName: '',
      photoIndex: 0
    });
  };

  const downloadPhoto = () => {
    const link = document.createElement('a');
    link.href = photoModal.imageUrl;
    link.download = `${photoModal.stemName}_photo_${photoModal.photoIndex + 1}_${new Date().toISOString().split('T')[0]}.jpg`;
    link.click();
  };

  const deletePhotoFromModal = (stemId: string, photoIndex: number) => {
    setStemPhotos(prev => {
      const updated = { ...prev };
      if (updated[stemId] && updated[stemId].length > 1) {
        // Remove specific photo
        updated[stemId] = updated[stemId].filter((_, index) => index !== photoIndex);
      } else {
        // Remove entire stem photos if only one photo
        delete updated[stemId];
      }
      return updated;
    });
    closePhotoModal();
  };

  const replacePhoto = (stemId: string) => {
    // Store the photoIndex for replacement when file is selected
    setReplacePhotoContext({ stemId, photoIndex: photoModal.photoIndex });
    triggerMultiplePhotoUpload(stemId);
    closePhotoModal();
  };

  const renderStemChart = (stem: string, color: string) => {
    const stemData = stemHistoryData[stem] || [];

    if (stemData.length === 0) {
      return (
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Stem {stem}: No data yet - save some measurements to see trends
          </p>
        </div>
      );
    }

    // Convert stem data to chart format with date parsing
    const chartData = stemData.map((entry: any, index: number) => {
      const entryDate = new Date(String(entry.timestamp)).toISOString().split('T')[0];
      return {
        index: index,
        date: entryDate,
        displayDate: new Date(String(entryDate)).toLocaleDateString(),
        height: entry.height || 0,
        maturedFlowers: entry.maturedFlowers || 0,
        openBuds: entry.openBuds || 0,
        unopenedBuds: entry.unopenedBuds || 0,
        timestamp: entry.timestamp
      };
    });

    // Sort by date to ensure proper chronological order
    chartData.sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime());

    const selectedParams = selectedChartParams[stem];

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string; payload?: Record<string, unknown> }> }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className={`p-3 border rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-200'
          }`}>
            <p className={`font-semibold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>{String(data?.displayDate || '')}</p>
            {selectedParams.height && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Height: <span className="font-medium">{String(data?.height || '--')}cm</span>
              </p>
            )}
            {selectedParams.maturedFlowers && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Matured Flowers: <span className="font-medium">{String(data?.maturedFlowers || '--')}</span>
              </p>
            )}
            {selectedParams.openBuds && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Open Buds: <span className="font-medium">{String(data?.openBuds || '--')}</span>
              </p>
            )}
            {selectedParams.unopenedBuds && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Unopened Buds: <span className="font-medium">{String(data?.unopenedBuds || '--')}</span>
              </p>
            )}
          </div>
        );
      }
      return null;
    };

    const parameterOptions = [
      { key: 'height', label: 'Height', color: color },
      { key: 'maturedFlowers', label: 'Matured Flowers', color: '#dc2626' },
      { key: 'openBuds', label: 'Open Buds', color: '#f59e0b' },
      { key: 'unopenedBuds', label: 'Unopened Buds', color: '#6b7280' }
    ];

    return (
      <div className="space-y-3">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Stem {stem} - Growth Parameters
            </span>
          </div>

          {/* Parameter Selection */}
          <div className="flex flex-wrap gap-2">
            {parameterOptions.map(param => (
              <button
                key={param.key}
                onClick={() => toggleChartParameter(stem, param.key)}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                  selectedParams[param.key]
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: param.color }}
                ></div>
                {param.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-lg transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                dataKey="index"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#9ca3af' : '#6b7280'
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#9ca3af' : '#6b7280'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              {selectedParams.height && (
                <Line
                  type="monotone"
                  dataKey="height"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                  name="Height (cm)"
                />
              )}
              {selectedParams.maturedFlowers && (
                <Line
                  type="monotone"
                  dataKey="maturedFlowers"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#dc2626", strokeWidth: 2 }}
                  name="Matured Flowers"
                />
              )}
              {selectedParams.openBuds && (
                <Line
                  type="monotone"
                  dataKey="openBuds"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                  name="Open Buds"
                />
              )}
              {selectedParams.unopenedBuds && (
                <Line
                  type="monotone"
                  dataKey="unopenedBuds"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ fill: "#6b7280", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#6b7280", strokeWidth: 2 }}
                  name="Unopened Buds"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Delete functionality disabled - entries are now non-deletable
  // const deleteRecentEntry = (entryType: string, timestamp: string) => {
  //   if (entryType === 'Full Plant Data') {
  //     // Remove from plantHistoricData
  //     const updatedData = plantHistoricData.filter(entry => entry.timestamp !== timestamp);
  //     setPlantHistoricData(updatedData);
  //   } else {
  //     // Remove from individual stem data
  //     const stem = entryType.split(' ')[1]; // Extract stem letter (A, B, C, D)
  //     const stemHistoryKey = `hibiscusPlantStem${stem}History`;
  //     const stemHistory = localStorage.getItem(stemHistoryKey);
  //     if (stemHistory) {
  //       const stemData = JSON.parse(stemHistory);
  //       const updatedStemData = stemData.filter((entry: Record<string, unknown>) => entry.timestamp !== timestamp);
  //       localStorage.setItem(stemHistoryKey, JSON.stringify(updatedStemData));
  //       // Force re-render by updating refresh key
  //       setRefreshKey(prev => prev + 1);
  //     }
  //   }
  // };

  const renderRecentEntries = () => {
    console.log('🔄 renderRecentEntries called');
    console.log('📊 Current stemHistoryData:', stemHistoryData);

    // Combine all recent entries from plantHistoricData and individual stem data
    const allEntries: Array<{
      type: string;
      timestamp: string;
      data: PlantHistoricalEntry | Record<string, unknown>;
      color: string;
    }> = [];

    // Add general plant data entries
    if (plantHistoricData.length > 0) {
      plantHistoricData.slice(-5).forEach(entry => {
        allEntries.push({
          type: 'Full Plant Data',
          timestamp: entry.timestamp,
          data: entry,
          color: 'bg-blue-100 text-blue-800'
        });
      });
    }

    // Add individual stem entries from state
    ['A', 'B', 'C', 'D', 'E'].forEach((stem) => {
      const stemHistory = stemHistoryData[stem] || [];
      console.log(`📊 Stem ${stem} has ${stemHistory.length} entries`);
      if (stemHistory.length > 0) {
        stemHistory.slice(-3).forEach((entry: any) => {
          // Ensure diseases is always a string
          const cleanEntry = {
            ...entry,
            diseases: typeof entry.diseases === 'string' ? entry.diseases : String(entry.diseases || '')
          };
          allEntries.push({
            type: `Stem ${stem}`,
            timestamp: String(entry.timestamp || ''),
            data: cleanEntry,
            color: stem === 'A' ? 'bg-blue-100 text-blue-800' :
                   stem === 'B' ? 'bg-green-100 text-green-800' :
                   stem === 'C' ? 'bg-purple-100 text-purple-800' :
                   stem === 'D' ? 'bg-orange-100 text-orange-800' :
                   'bg-red-100 text-red-800'
          });
        });
      }
    });

    console.log(`📊 Total entries to display: ${allEntries.length}`);

    // Sort by timestamp (newest first)
    allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Take only the most recent 10 entries
    const recentEntries = allEntries.slice(0, 10);

    if (recentEntries.length === 0) {
      return (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No entries yet. Start by saving some plant measurements.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {recentEntries.map((entry, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isDarkMode ? entry.color.replace('100', '800').replace('800', '100') : entry.color
                }`}>
                  {entry.type}
                </span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(String(entry.timestamp)).toLocaleDateString()} {new Date(String(entry.timestamp)).toLocaleTimeString()}
                </span>
              </div>
              {/* Delete functionality disabled */}
              <span className="text-gray-400 text-sm">Protected</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              {entry.type === 'Full Plant Data' ? (
                <>
                  <div><span className="font-medium">Total Flowers:</span> {String((entry.data as Record<string, unknown>)?.totalMaturedFlowers || 0)}</div>
                  <div><span className="font-medium">Open Buds:</span> {String((entry.data as Record<string, unknown>)?.totalOpenBuds || 0)}</div>
                  <div><span className="font-medium">Unopened:</span> {String((entry.data as Record<string, unknown>)?.totalUnopenedBuds || 0)}</div>
                  <div><span className="font-medium">Health:</span> {String((entry.data as Record<string, unknown>)?.overallPlantHealth || 'N/A')}</div>
                </>
              ) : (
                <>
                  <div><span className="font-medium">Height:</span> {String((entry.data as Record<string, unknown>)?.height || 0)} cm</div>
                  <div><span className="font-medium">Flowers:</span> {String((entry.data as Record<string, unknown>)?.maturedFlowers || 0)}</div>
                  <div><span className="font-medium">Open Buds:</span> {String((entry.data as Record<string, unknown>)?.openBuds || 0)}</div>
                  <div><span className="font-medium">Unopened:</span> {String((entry.data as Record<string, unknown>)?.unopenedBuds || 0)}</div>
                  <div><span className="font-medium">Leaves:</span> {String((entry.data as Record<string, unknown>)?.leaves || 0)}</div>
                  {(entry.data as Record<string, unknown>)?.diseases && typeof (entry.data as Record<string, unknown>).diseases === 'string' && (entry.data as Record<string, unknown>).diseases !== '' && (
                    <div className="col-span-2 md:col-span-5"><span className="font-medium">Issues:</span> {String((entry.data as Record<string, unknown>)?.diseases)}</div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Prevent hydration errors
  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hibiscus Plant Management</h1>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-full transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Key Hydroponic Parameters - Prominent Display */}
        <div className={`rounded-2xl p-8 border-2 shadow-xl transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/50'
            : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300'
        }`}>
          <h2 className={`text-2xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-blue-300' : 'text-blue-900'
          }`}>
            Current Hydroponic Readings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* pH Level */}
            <div className={`rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-2 border-emerald-500/50'
                : 'bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300'
            }`}>
              <div className={`text-sm font-semibold uppercase tracking-wide mb-3 ${
                isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
              }`}>pH Level</div>
              <div className={`text-6xl font-bold mb-3 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {getCurrentHydroValue('ph')?.toFixed(1) ?? '--'}
              </div>
              <div className={`text-sm font-medium ${
                isDarkMode ? 'text-emerald-300/80' : 'text-emerald-600/80'
              }`}>
                Target: 5.8-6.5
              </div>
            </div>

            {/* EC */}
            <div className={`rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/50'
                : 'bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-300'
            }`}>
              <div className={`text-sm font-semibold uppercase tracking-wide mb-3 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>EC (Electrical Conductivity)</div>
              <div className={`text-6xl font-bold mb-3 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {getCurrentHydroValue('ec')?.toFixed(1) ?? '--'}
              </div>
              <div className={`text-sm font-medium ${
                isDarkMode ? 'text-blue-300/80' : 'text-blue-600/80'
              }`}>
                mS/cm • Target: 1.2-1.6
              </div>
            </div>

            {/* Water Temperature */}
            <div className={`rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/50'
                : 'bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-300'
            }`}>
              <div className={`text-sm font-semibold uppercase tracking-wide mb-3 ${
                isDarkMode ? 'text-orange-300' : 'text-orange-700'
              }`}>Water Temperature</div>
              <div className={`text-6xl font-bold mb-3 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {getCurrentHydroValue('waterTemp')?.toFixed(0) ?? '--'}°C
              </div>
              <div className={`text-sm font-medium ${
                isDarkMode ? 'text-orange-300/80' : 'text-orange-600/80'
              }`}>
                Target: 18-24°C
              </div>
            </div>
          </div>
        </div>

        {/* Plant Growth Trends */}
        <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <div className="mb-6">
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Plant Growth Trends</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {plantHistoricData.length > 0 ? `${plantHistoricData.length} data points recorded` : 'No data points yet - save some measurements to see trends'}
            </p>
          </div>
        </div>

        {/* Recent Entries */}
        <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Recent Entries</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Latest plant measurements and observations
              </p>
            </div>

            {/* Export buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={exportPlantDataAsCSV}
                className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </button>
              <button
                onClick={exportPlantDataAsJSON}
                className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                JSON
              </button>
            </div>
          </div>

          <div key={`recent-entries-${dataRefreshKey}`}>
            {renderRecentEntries()}
          </div>
        </div>


        {/* Hydroponic Parameters Section */}
        <div className="mb-12">
          <div className={`rounded-xl p-4 sm:p-6 lg:p-8 border transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-400/30'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
          }`}>
            <div className="flex items-center mb-6">
              <Droplets className="w-8 h-8 text-blue-600 mr-3" />
              <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hydroponic Parameters - Hibiscus Plant</h4>
            </div>
            <div className="text-center mb-6">
              <p className={`${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>Currently monitoring Dutch Bucket system for Hibiscus plant cultivation</p>
            </div>

            {/* Recent Hydroponic Entries */}
            <div className="mb-8">
              <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-blue-400/30 text-white'
                  : 'bg-white border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <BarChart className="w-6 h-6 text-blue-600 mr-2" />
                    Recent Hydroponic Entries
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                    <button
                      onClick={exportHydroponicDataAsCSV}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={hydroHistoricalData.length === 0}
                      title={hydroHistoricalData.length === 0 ? "No data to export" : "Export as CSV"}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </button>
                    <button
                      onClick={exportHydroponicDataAsJSON}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={hydroHistoricalData.length === 0}
                      title={hydroHistoricalData.length === 0 ? "No data to export" : "Export as JSON"}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON
                    </button>
                  </div>
                </div>

                {hydroHistoricalData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Date & Time</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>pH Level</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>EC (mS/cm)</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Water Temp (°C)</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Notes</th>
                          <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hydroHistoricalData.slice(-10).reverse().map((entry, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${
                                entry.ph && entry.ph >= 5.8 && entry.ph <= 6.5
                                  ? 'text-green-600' : 'text-orange-500'
                              }`}>
                                {entry.ph?.toFixed(1) ?? '--'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${
                                entry.ec && entry.ec >= 1.2 && entry.ec <= 1.6
                                  ? 'text-green-600' : 'text-orange-500'
                              }`}>
                                {entry.ec?.toFixed(1) ?? '--'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${
                                entry.waterTemp && entry.waterTemp >= 18 && entry.waterTemp <= 24
                                  ? 'text-green-600' : 'text-orange-500'
                              }`}>
                                {entry.waterTemp?.toFixed(1) ?? '--'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{('notes' in entry && typeof entry.notes === 'string') ? entry.notes : '--'}</td>
                            <td className="py-3 px-4">
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
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hydroponic entries recorded yet.</p>
                    <p className="text-sm text-gray-400">Add your first entry using the form above.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hydroponic Data Graph */}
            <div className="mb-8">
              <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-800 border-blue-400/30 text-white'
                  : 'bg-white border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
                    Hydroponic Data Trends
                  </h3>

                  {/* Time Range Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Time Range:</span>
                    <select
                      value={hydroGraphTimeRange}
                      onChange={(e) => setHydroGraphTimeRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    onClick={() => toggleHydroGraphLine('ph')}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      hydroVisibleLines.ph
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    pH Level
                  </button>
                  <button
                    onClick={() => toggleHydroGraphLine('ec')}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      hydroVisibleLines.ec
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    EC (mS/cm)
                  </button>
                  <button
                    onClick={() => toggleHydroGraphLine('waterTemp')}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      hydroVisibleLines.waterTemp
                        ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
                    Water Temperature
                  </button>
                </div>

                {/* Advanced Chart Container */}
                <div className={`rounded-lg p-6 border shadow-inner transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                    : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'
                }`}>
                  {(() => {
                    const filteredData = getFilteredHydroGraphData();

                    if (filteredData.length < 2) {
                      return (
                        <div className="text-center py-20">
                          <div className="relative">
                            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
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
                      ph: entry.ph,
                      ec: entry.ec,
                      waterTemp: entry.waterTemp,
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

                                if (entry.dataKey === 'ph') {
                                  unit = '';
                                  value = value.toFixed(1);
                                } else if (entry.dataKey === 'ec') {
                                  unit = ' mS/cm';
                                  value = value.toFixed(1);
                                } else if (entry.dataKey === 'waterTemp') {
                                  unit = '°C';
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
                                stroke="#e0e7ff"
                                opacity={0.6}
                              />
                              <XAxis
                                dataKey="time"
                                stroke="#6b7280"
                                fontSize={12}
                                tick={{ fill: '#6b7280' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                stroke="#6b7280"
                                fontSize={12}
                                tick={{ fill: '#6b7280' }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                              />

                              {hydroVisibleLines.ph && (
                                <Line
                                  type="monotone"
                                  dataKey="ph"
                                  stroke="#22c55e"
                                  strokeWidth={3}
                                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                                  name="pH Level"
                                  connectNulls={false}
                                />
                              )}

                              {hydroVisibleLines.ec && (
                                <Line
                                  type="monotone"
                                  dataKey="ec"
                                  stroke="#a855f7"
                                  strokeWidth={3}
                                  dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                                  name="EC (mS/cm)"
                                  connectNulls={false}
                                />
                              )}

                              {hydroVisibleLines.waterTemp && (
                                <Line
                                  type="monotone"
                                  dataKey="waterTemp"
                                  stroke="#06b6d4"
                                  strokeWidth={3}
                                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                                  activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                                  name="Water Temperature"
                                  connectNulls={false}
                                />
                              )}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Enhanced Statistics Cards */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {hydroVisibleLines.ph && (() => {
                            const phData = filteredData.filter(d => d.ph !== null && d.ph !== undefined);
                            if (phData.length === 0) return null;
                            const phs = phData.map(d => d.ph!);
                            const min = Math.min(...phs);
                            const max = Math.max(...phs);
                            const avg = phs.reduce((a, b) => a + b, 0) / phs.length;
                            return (
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center mb-3">
                                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                                  <span className="font-semibold text-green-800">pH Analytics</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-green-600">Current:</span>
                                    <span className="font-medium text-green-800">{phs[phs.length - 1].toFixed(1)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-green-600">Average:</span>
                                    <span className="font-medium text-green-800">{avg.toFixed(1)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-green-600">Range:</span>
                                    <span className="font-medium text-green-800">{min.toFixed(1)} - {max.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {hydroVisibleLines.ec && (() => {
                            const ecData = filteredData.filter(d => d.ec !== null && d.ec !== undefined);
                            if (ecData.length === 0) return null;
                            const ecs = ecData.map(d => d.ec!);
                            const min = Math.min(...ecs);
                            const max = Math.max(...ecs);
                            const avg = ecs.reduce((a, b) => a + b, 0) / ecs.length;
                            return (
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center mb-3">
                                  <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                                  <span className="font-semibold text-purple-800">EC Analytics</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-purple-600">Current:</span>
                                    <span className="font-medium text-purple-800">{ecs[ecs.length - 1].toFixed(1)} mS/cm</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-600">Average:</span>
                                    <span className="font-medium text-purple-800">{avg.toFixed(1)} mS/cm</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-600">Range:</span>
                                    <span className="font-medium text-purple-800">{min.toFixed(1)} - {max.toFixed(1)} mS/cm</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {hydroVisibleLines.waterTemp && (() => {
                            const tempData = filteredData.filter(d => d.waterTemp !== null && d.waterTemp !== undefined);
                            if (tempData.length === 0) return null;
                            const temps = tempData.map(d => d.waterTemp!);
                            const min = Math.min(...temps);
                            const max = Math.max(...temps);
                            const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                            return (
                              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border border-cyan-200">
                                <div className="flex items-center mb-3">
                                  <div className="w-4 h-4 bg-cyan-500 rounded-full mr-3"></div>
                                  <span className="font-semibold text-cyan-800">Water Temp Analytics</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-cyan-600">Current:</span>
                                    <span className="font-medium text-cyan-800">{temps[temps.length - 1].toFixed(1)}°C</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-cyan-600">Average:</span>
                                    <span className="font-medium text-cyan-800">{avg.toFixed(1)}°C</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-cyan-600">Range:</span>
                                    <span className="font-medium text-cyan-800">{min.toFixed(1)}°C - {max.toFixed(1)}°C</span>
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

        {/* Nutrient Calculator & Tracker */}
        <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <div className={`rounded-xl p-4 sm:p-6 lg:p-8 border transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-400/30'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
          }`}>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                isDarkMode
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                <BarChart className="w-4 h-4 mr-2" />
                Interactive Nutrient Calculator & Tracker
              </div>
              <h5 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Precise Element Tracking System
              </h5>
              <p className={`max-w-2xl mx-auto ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Enter exact amounts of each nutrient solution and see real-time elemental breakdown.
                Track individual elements (N, P, K, Ca, Mg, S, Fe, Mn, etc.) over time with interactive graphs.
              </p>
            </div>

            <NutrientTracker isDarkMode={isDarkMode} plantType="hibiscus" />
          </div>
        </div>

      </div>

      {/* Photo Edit Modal */}
      {isPhotoModalOpen && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`relative max-w-4xl max-h-[90vh] w-full rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Photo Details
              </h3>
              <button
                onClick={closeUploadedPhotoModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Photo Display */}
              <div className="flex justify-center mb-4">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.description || selectedPhoto.originalName}
                  className="max-w-full max-h-[50vh] object-contain rounded-lg"
                />
              </div>

              {/* Photo Information */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Photo Information
                  </h4>
                  <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div><strong>Original Name:</strong> {selectedPhoto.originalName}</div>
                    <div><strong>Category:</strong> {selectedPhoto.category}</div>
                    <div><strong>Upload Date:</strong> {new Date(selectedPhoto.uploadDate).toLocaleString()}</div>
                    <div><strong>File Size:</strong> {(selectedPhoto.size / 1024).toFixed(1)} KB</div>
                    {selectedPhoto.stemId && (
                      <div><strong>Stem ID:</strong> {selectedPhoto.stemId}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Metadata
                  </h4>
                  <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedPhoto.description && (
                      <div><strong>Description:</strong> {selectedPhoto.description}</div>
                    )}
                    {selectedPhoto.location && (
                      <div><strong>Location:</strong> {selectedPhoto.location}</div>
                    )}
                    {selectedPhoto.plantStage && (
                      <div><strong>Plant Stage:</strong> {selectedPhoto.plantStage}</div>
                    )}
                    {selectedPhoto.severity && (
                      <div><strong>Severity:</strong> {selectedPhoto.severity}</div>
                    )}
                    {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                      <div><strong>Tags:</strong> {selectedPhoto.tags.join(', ')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
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
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              {/* Delete functionality disabled */}
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
                <Trash2 className="w-4 h-4 mr-2" />
                Protected
              </div>
              <button
                onClick={closeUploadedPhotoModal}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
      )}

      {/* PDF Export Modal */}
      {/* Video Modal */}
      {isVideoModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`relative max-w-4xl max-h-[90vh] w-full rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Video Details
              </h3>
              <button
                onClick={closeVideoModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Video Player */}
              <div className="flex justify-center mb-4">
                <video
                  controls
                  className="max-w-full max-h-[50vh] rounded-lg"
                  preload="metadata"
                  playsInline
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    console.log('Video source:', selectedVideo.url);
                    const video = e.target as HTMLVideoElement;
                    if (video.error) {
                      console.error('Video error code:', video.error.code);
                      console.error('Video error message:', video.error.message);
                    }
                  }}
                  onLoadStart={() => {
                    console.log('Video load started for:', selectedVideo.url);
                  }}
                  onCanPlay={() => {
                    console.log('Video can play:', selectedVideo.url);
                  }}
                >
                  <source
                    src={selectedVideo.url}
                    type="video/mp4"
                  />
                  <source
                    src={selectedVideo.url}
                    type="video/webm"
                  />
                  <source
                    src={selectedVideo.url}
                    type="video/ogg"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Information */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Video Information
                  </h4>
                  <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div><strong>Original Name:</strong> {selectedVideo.originalName}</div>
                    <div><strong>Category:</strong> {selectedVideo.category}</div>
                    <div><strong>Upload Date:</strong> {new Date(selectedVideo.uploadDate).toLocaleString()}</div>
                    <div><strong>File Size:</strong> {(selectedVideo.size / 1024 / 1024).toFixed(1)} MB</div>
                    {selectedVideo.stemId && (
                      <div><strong>Stem ID:</strong> {selectedVideo.stemId}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Additional Details
                  </h4>
                  <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedVideo.description && (
                      <div><strong>Description:</strong> {selectedVideo.description}</div>
                    )}
                    {selectedVideo.tags && (
                      <div><strong>Tags:</strong> {selectedVideo.tags}</div>
                    )}
                    {selectedVideo.location && (
                      <div><strong>Location:</strong> {selectedVideo.location}</div>
                    )}
                    {selectedVideo.duration && (
                      <div><strong>Duration:</strong> {selectedVideo.duration}</div>
                    )}
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className={`flex space-x-3 p-4 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => downloadUploadedVideo(selectedVideo)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                {/* Delete functionality disabled */}
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Protected
                </div>
                <button
                  onClick={closeVideoModal}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

      {/* Document Modal */}
      {isDocumentModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`relative max-w-4xl max-h-[90vh] w-full rounded-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Document Details
              </h3>
              <button
                onClick={closeDocumentModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Document Preview/Link */}
              <div className="flex justify-center mb-4">
                {selectedDocument.originalName?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full">
                    <iframe
                      src={`/uploads/hibiscus-plant-documents/${selectedDocument.filename}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-[60vh] rounded-lg border-0"
                      title={selectedDocument.originalName}
                      loading="lazy"
                      style={{ overflow: 'auto' }}
                    />
                    <div className="mt-2 text-center">
                      <a
                        href={`/uploads/hibiscus-plant-documents/${selectedDocument.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[50vh] bg-gray-100 rounded-lg border flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">{selectedDocument.originalName}</p>
                      <div className="space-y-2">
                        <a
                          href={`/uploads/hibiscus-plant-documents/${selectedDocument.filename}`}
                          download={selectedDocument.originalName}
                          className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Download Document
                        </a>
                        <br />
                        <a
                          href={`/uploads/hibiscus-plant-documents/${selectedDocument.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          View in new tab
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Information */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Document Information
                  </h4>
                  <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div><strong>Original Name:</strong> {selectedDocument.originalName}</div>
                    <div><strong>Category:</strong> {selectedDocument.category}</div>
                    <div><strong>Upload Date:</strong> {new Date(selectedDocument.uploadDate).toLocaleString()}</div>
                    <div><strong>File Size:</strong> {(selectedDocument.size / 1024 / 1024).toFixed(1)} MB</div>
                    {selectedDocument.stemId && (
                      <div><strong>Stem ID:</strong> {selectedDocument.stemId}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Additional Details
                  </h4>
                  <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedDocument.description && (
                      <div><strong>Description:</strong> {selectedDocument.description}</div>
                    )}
                    {selectedDocument.tags && (
                      <div><strong>Tags:</strong> {selectedDocument.tags}</div>
                    )}
                    {selectedDocument.location && (
                      <div><strong>Location:</strong> {selectedDocument.location}</div>
                    )}
                    <div>
                      <a
                        href={`/uploads/hibiscus-plant-documents/${selectedDocument.filename}`}
                        download={selectedDocument.originalName}
                        className="text-green-600 hover:text-green-700 underline"
                      >
                        Download Original File
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className={`flex space-x-3 p-4 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => downloadUploadedDocument(selectedDocument)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                {/* Delete functionality disabled */}
                <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Protected
                </div>
                <button
                  onClick={closeDocumentModal}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

      {/* Link Edit Modal */}
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
                <X className="w-5 h-5" />
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
              <div className="flex space-x-2">
                <button
                  onClick={() => deleteLink(selectedLink.id)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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

      <PDFExportModal
        isOpen={isPDFExportOpen}
        onClose={() => setIsPDFExportOpen(false)}
      />
    </div>
  );
}