'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, ThermometerSun, Droplets, Wifi, FlaskConical, Zap, Download, AlertCircle, CheckCircle, AlertTriangle, LucideIcon, Camera, Upload, X, Play, Pause, Scissors, TrendingUp, Leaf } from 'lucide-react';
import SensorGraph from './SensorGraph';
import PhotoModal from './PhotoModal';
import Link from 'next/link';

interface ApiSensorData {
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  ph: number | null;
  ec: number | null;
  waterTemp: number | null;
  lastUpdate: string | null;
  status: 'connected' | 'error' | 'connecting';
  error?: string;
  timestamp: string;
}

interface SensorData {
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  ph: number | null;
  ec: number | null;
  waterTemp: number | null;
  waterQuality: number | null;
  lastUpdate: Date | null;
}

interface Photo {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  url: string;
  category?: 'stem' | 'system' | 'setup' | 'maintenance' | 'electronics' | 'hydro' | 'environment';
  description?: string;
}

interface NutrientEntry {
  date: Date;
  quantity: number;
  unit: string;
  notes?: string;
}

interface HydroNutrients {
  masterblend: {
    nitrogen: number;
    ammoniumNitrogen: number;
    phosphorus: number;
    potassium: number;
    micronutrients: {
      boron: number;
      copper: number;
      iron: number;
      manganese: number;
      molybdenum: number;
      zinc: number;
    };
    lastAddedDate: Date | null;
    totalQuantity: number;
    unit: string;
    entries: NutrientEntry[];
  };
  calciumNitrate: {
    totalNitrogen: number;
    nitricNitrogen: number;
    ammoniacalNitrogen: number;
    lastAddedDate: Date | null;
    totalQuantity: number;
    unit: string;
    entries: NutrientEntry[];
  };
  magnesiumSulfate: {
    magnesium: number;
    sulfur: number;
    lastAddedDate: Date | null;
    totalQuantity: number;
    unit: string;
    entries: NutrientEntry[];
  };
  phUp: {
    lastAddedDate: Date | null;
    totalQuantity: number;
    unit: string;
    entries: NutrientEntry[];
  };
  phDown: {
    lastAddedDate: Date | null;
    totalQuantity: number;
    unit: string;
    entries: NutrientEntry[];
  };
  water: {
    lastAddedDate: Date | null;
    totalQuantity: number;
    unit: string;
    entries: NutrientEntry[];
  };
}

interface HistoricalEntry {
  timestamp: string;
  temperature?: number | null;
  humidity?: number | null;
  light?: number | null;
  ph?: number | null;
  ec?: number | null;
  waterTemp?: number | null;
  waterQuality?: number | null;
}

interface VideoCropModal {
  isOpen: boolean;
  file: File | null;
  category: string;
  description?: string;
  duration: number;
  startTime: number;
  endTime: number;
}

// Optimal ranges for Rose plants in hydroponic systems
const OPTIMAL_RANGES = {
  temperature: { min: 18, max: 24, night: { min: 15, max: 21 } },
  humidity: { min: 50, max: 70 },
  ph: { min: 5.5, max: 6.5 },
  ec: { min: 1.2, max: 2.0 },
  waterTemp: { min: 18, max: 22 },
  waterQuality: { min: 90, max: 100 },
  light: { min: 20000, max: 40000 }
};

export default function MQTTDashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: null,
    humidity: null,
    light: null,
    ph: null,
    ec: null,
    waterTemp: null,
    waterQuality: null,
    lastUpdate: null,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'connecting'>('connecting');
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalEntry[]>([]);
  const [hydroHistoricalData, setHydroHistoricalData] = useState<HistoricalEntry[]>([]);

  const [systemPhotos, setSystemPhotos] = useState<Photo[]>([]);
  const [electronicsPhotos, setElectronicsPhotos] = useState<Photo[]>([]);
  const [hydroPhotos, setHydroPhotos] = useState<Photo[]>([]);
  const [environmentPhotos, setEnvironmentPhotos] = useState<Photo[]>([]);

  const [hydroNutrients, setHydroNutrients] = useState<HydroNutrients>({
    masterblend: {
      nitrogen: 13,
      ammoniumNitrogen: 0,
      phosphorus: 2,
      potassium: 13,
      micronutrients: {
        boron: 0.012,
        copper: 0.0012,
        iron: 0.12,
        manganese: 0.012,
        molybdenum: 0.0008,
        zinc: 0.0012,
      },
      lastAddedDate: null,
      totalQuantity: 0,
      unit: 'g',
      entries: [],
    },
    calciumNitrate: {
      totalNitrogen: 14.5,
      nitricNitrogen: 14.5,
      ammoniacalNitrogen: 0,
      lastAddedDate: null,
      totalQuantity: 0,
      unit: 'g',
      entries: [],
    },
    magnesiumSulfate: {
      magnesium: 9.7,
      sulfur: 13,
      lastAddedDate: null,
      totalQuantity: 0,
      unit: 'g',
      entries: [],
    },
    phUp: {
      lastAddedDate: null,
      totalQuantity: 0,
      unit: 'ml',
      entries: [],
    },
    phDown: {
      lastAddedDate: null,
      totalQuantity: 0,
      unit: 'ml',
      entries: [],
    },
    water: {
      lastAddedDate: null,
      totalQuantity: 0,
      unit: 'L',
      entries: [],
    },
  });

  // Manual control states
  const [manualMode, setManualMode] = useState<Record<string, boolean>>({
    temperature: false,
    humidity: false,
    light: false,
    ph: false,
    ec: false,
    waterTemp: false,
    waterQuality: false
  });

  const [manualValues, setManualValues] = useState<Record<string, number>>({
    temperature: 0,
    humidity: 0,
    light: 0,
    ph: 0,
    ec: 0,
    waterTemp: 0,
    waterQuality: 0
  });

  // Photo modal state
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    photos: Photo[];
    currentIndex: number;
  }>({
    isOpen: false,
    photos: [],
    currentIndex: 0,
  });

  // Video cropping modal state
  const [videoCropModal, setVideoCropModal] = useState<VideoCropModal>({
    isOpen: false,
    file: null,
    category: '',
    description: '',
    duration: 0,
    startTime: 0,
    endTime: 30
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchSensorData();
    fetchHistoricalData();
    fetchSystemPhotos();

    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Generate mock historical data for demonstration
  useEffect(() => {
    const generateData = () => {
      const data: HistoricalEntry[] = [];
      const now = new Date();

      for (let i = 144; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
        data.push({
          timestamp: timestamp.toISOString(),
          temperature: 20 + Math.random() * 8,
          humidity: 45 + Math.random() * 30,
          light: Math.random() > 0.3 ? 15000 + Math.random() * 25000 : null,
          ph: null,
          ec: null,
          waterTemp: null,
          waterQuality: null,
        });
      }

      setHistoricalData(data);
    };

    const generateHydroData = () => {
      const data: HistoricalEntry[] = [];
      const now = new Date();

      for (let i = 144; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * 10 * 60 * 1000));
        data.push({
          timestamp: timestamp.toISOString(),
          ph: 5.8 + Math.random() * 1.4,
          ec: 1.4 + Math.random() * 0.8,
          waterTemp: 19 + Math.random() * 6,
          waterQuality: 85 + Math.random() * 15,
        });
      }

      setHydroHistoricalData(data);
    };

    generateData();
    generateHydroData();
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/mqtt-data');
      if (response.ok) {
        const data: ApiSensorData = await response.json();

        setSensorData({
          temperature: data.temperature,
          humidity: data.humidity,
          light: data.light,
          ph: data.ph,
          ec: data.ec,
          waterTemp: data.waterTemp,
          waterQuality: null,
          lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : null,
        });

        setConnectionStatus(data.status);
        setIsConnected(data.status === 'connected');
        setLastUpdateTime(data.lastUpdate);
      } else {
        setConnectionStatus('error');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch('/api/mqtt-data/historical');
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data);
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
  };

  const toggleManualMode = (parameter: string) => {
    setManualMode(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));

    if (!manualMode[parameter]) {
      const currentValue = sensorData[parameter as keyof SensorData];
      if (currentValue !== null && typeof currentValue === 'number') {
        setManualValues(prev => ({
          ...prev,
          [parameter]: currentValue
        }));
      }
    }
  };

  const updateManualValue = (parameter: string, value: number) => {
    setManualValues(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  const getCurrentValue = (parameter: string): number | null => {
    if (manualMode[parameter]) {
      return manualValues[parameter];
    }
    return sensorData[parameter as keyof SensorData] as number | null;
  };

  const exportData = async (format: 'csv' | 'json', days: number = 7) => {
    try {
      const nutrientData = {
        masterblend: { total: hydroNutrients.masterblend.totalQuantity, lastAdded: hydroNutrients.masterblend.lastAddedDate?.toISOString() || '' },
        calciumNitrate: { total: hydroNutrients.calciumNitrate.totalQuantity, lastAdded: hydroNutrients.calciumNitrate.lastAddedDate?.toISOString() || '' },
        magnesiumSulfate: { total: hydroNutrients.magnesiumSulfate.totalQuantity, lastAdded: hydroNutrients.magnesiumSulfate.lastAddedDate?.toISOString() || '' },
        phUp: { total: hydroNutrients.phUp.totalQuantity, lastAdded: hydroNutrients.phUp.lastAddedDate?.toISOString() || '' },
        phDown: { total: hydroNutrients.phDown.totalQuantity, lastAdded: hydroNutrients.phDown.lastAddedDate?.toISOString() || '' },
        water: { total: hydroNutrients.water.totalQuantity, lastAdded: hydroNutrients.water.lastAddedDate?.toISOString() || '' }
      };

      const response = await fetch(`/api/export-data?format=${format}&days=${days}&includePlantData=false&nutrientData=${encodeURIComponent(JSON.stringify(nutrientData))}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `onefarmer-data-${days}days.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const fetchSystemPhotos = async () => {
    try {
      const response = await fetch('/api/plant-photos');
      if (response.ok) {
        const data = await response.json();
        const photos = data.photos || [];

        const system: Photo[] = [];
        const electronics: Photo[] = [];
        const hydro: Photo[] = [];
        const environment: Photo[] = [];

        photos.forEach((photo: Photo) => {
          if (photo.stemId === 'SYSTEM') {
            switch (photo.category) {
              case 'electronics':
                electronics.push(photo);
                break;
              case 'hydro':
                hydro.push(photo);
                break;
              case 'environment':
                environment.push(photo);
                break;
              default:
                system.push(photo);
            }
          }
        });

        setSystemPhotos(system);
        setElectronicsPhotos(electronics);
        setHydroPhotos(hydro);
        setEnvironmentPhotos(environment);
      }
    } catch (error) {
      console.error('Failed to fetch system photos:', error);
    }
  };

  const handleSystemPhotoUpload = async (file: File, category: string, description?: string) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('stemId', 'SYSTEM');
      formData.append('category', category);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch('/api/plant-photos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchSystemPhotos();
        alert('System photo uploaded successfully! MQTT notification sent.');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('System photo upload error:', error);
      alert('Failed to upload system photo. Please try again.');
    }
  };

  const openPhotoModal = (photos: Photo[], startIndex: number = 0) => {
    setPhotoModal({
      isOpen: true,
      photos,
      currentIndex: startIndex,
    });
  };

  const handleMultipleFileUpload = async (files: FileList, category: string, description?: string) => {
    const fileArray = Array.from(files);
    let successCount = 0;
    let failCount = 0;

    for (const file of fileArray) {
      try {
        if (file.type.startsWith('video/')) {
          const video = document.createElement('video');
          video.preload = 'metadata';

          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              const duration = video.duration;
              window.URL.revokeObjectURL(video.src);

              if (duration > 30) {
                openVideoCropModal(file, category, description);
                resolve(true);
              } else {
                handleSystemPhotoUpload(file, category, description ? `${description} - ${file.name}` : file.name)
                  .then(() => successCount++)
                  .catch(() => failCount++);
                resolve(true);
              }
            };

            video.onerror = () => {
              window.URL.revokeObjectURL(video.src);
              failCount++;
              resolve(false);
            };

            video.src = URL.createObjectURL(file);
          });
        } else {
          await handleSystemPhotoUpload(file, category, description ? `${description} - ${file.name}` : file.name);
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        failCount++;
      }
    }

    if (successCount > 0 || failCount > 0) {
      if (successCount > 0 && failCount === 0) {
        alert(`Successfully uploaded ${successCount} file(s)!`);
      } else if (successCount > 0 && failCount > 0) {
        alert(`Uploaded ${successCount} file(s) successfully. ${failCount} file(s) failed to upload.`);
      } else if (failCount > 0) {
        alert(`Failed to upload ${failCount} file(s).`);
      }
    }
  };

  const openVideoCropModal = (file: File, category: string, description?: string) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      setVideoCropModal({
        isOpen: true,
        file,
        category,
        description,
        duration,
        startTime: 0,
        endTime: Math.min(duration, 30)
      });
      window.URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  };

  const handleVideoCrop = async () => {
    if (!videoCropModal.file) return;

    try {
      const trimmedFile = new File([videoCropModal.file], `trimmed_${videoCropModal.file.name}`, {
        type: videoCropModal.file.type,
        lastModified: Date.now()
      });

      setVideoCropModal(prev => ({ ...prev, isOpen: false }));
      await handleSystemPhotoUpload(trimmedFile, videoCropModal.category, videoCropModal.description);
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Video crop error:', error);
      alert('Failed to process video. Please try again.');
    }
  };

  const addNutrientEntry = (nutrientType: keyof HydroNutrients, quantity: number, unit: string, notes?: string, isSubtraction: boolean = false) => {
    const newEntry: NutrientEntry = {
      date: new Date(),
      quantity: isSubtraction ? -quantity : quantity,
      unit,
      notes
    };

    setHydroNutrients(prev => ({
      ...prev,
      [nutrientType]: {
        ...prev[nutrientType],
        lastAddedDate: new Date(),
        totalQuantity: prev[nutrientType].totalQuantity + (isSubtraction ? -quantity : quantity),
        entries: [...prev[nutrientType].entries, newEntry],
      },
    }));
  };

  const formatLastAdded = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than 1 hour ago';
    }
  };

  // Delete functionality disabled - photos are now non-deletable
  // const deletePhoto = async (photoId: string) => {
  //   try {
  //     const response = await fetch(`/api/plant-photos?photoId=${photoId}`, {
  //       method: 'DELETE',
  //     });

  //     if (response.ok) {
  //       await fetchSystemPhotos();
  //     }
  //   } catch (error) {
  //     console.error('Delete error:', error);
  //   }
  // };

  const getStatusColor = (status: 'connected' | 'error' | 'connecting') => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'connecting': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: 'connected' | 'error' | 'connecting'): LucideIcon => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'error': return AlertCircle;
      case 'connecting': return AlertTriangle;
      default: return AlertCircle;
    }
  };

  const isInRange = (value: number | null, range: { min: number; max: number }) => {
    if (value === null) return false;
    return value >= range.min && value <= range.max;
  };

  const getSensorColor = (value: number | null, range: { min: number; max: number }) => {
    if (value === null) return 'text-gray-400';
    return isInRange(value, range) ? 'text-green-600' : 'text-orange-500';
  };

  const renderParameterCard = (
    icon: LucideIcon,
    title: string,
    value: number | null,
    unit: string,
    range: { min: number; max: number },
    parameter: string,
    color: string = 'blue'
  ) => {
    const IconComponent = icon;
    const currentValue = getCurrentValue(parameter);
    const isManual = manualMode[parameter];

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-${color}-100 rounded-lg`}>
              <IconComponent className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500">
                Optimal: {range.min}-{range.max}{unit}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {isManual ? 'Manual' : 'Auto'}
            </span>
            <button
              onClick={() => toggleManualMode(parameter)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isManual ? 'bg-blue-600' : 'bg-gray-200'
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

        <div className="text-right">
          <div className={`text-3xl font-bold ${getSensorColor(currentValue, range)}`}>
            {isManual ? (
              <input
                type="number"
                value={currentValue || 0}
                onChange={(e) => updateManualValue(parameter, parseFloat(e.target.value) || 0)}
                className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-lg"
                step={parameter === 'ph' || parameter === 'ec' ? '0.1' : '1'}
              />
            ) : (
              currentValue?.toFixed(parameter === 'ph' || parameter === 'ec' ? 1 : 0) ?? '--'
            )}
            <span className="text-lg text-gray-500 ml-1">{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = (data: HistoricalEntry[], param: keyof HistoricalEntry, color: string, label: string) => {
    const validData = data.filter(d => d[param] !== undefined && d[param] !== null);
    if (validData.length === 0) return null;

    const values = validData.map(d => Number(d[param]));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const points = validData.map((d, i) => {
      const x = (i / (validData.length - 1)) * 300;
      const y = 100 - ((Number(d[param]) - minValue) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" style={{ color }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <svg width="300" height="100" className="w-full h-20">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
            />
          </svg>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>24h ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">


        {/* Video Cropping Modal */}
        {videoCropModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  Video Duration: {videoCropModal.duration.toFixed(1)}s - Crop to 30s
                </h3>

                {videoCropModal.file && (
                  <video
                    ref={videoRef}
                    src={URL.createObjectURL(videoCropModal.file)}
                    className="w-full max-h-64 mb-4 rounded"
                    controls
                  />
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Time: {videoCropModal.startTime.toFixed(1)}s
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, videoCropModal.duration - 30)}
                      step="0.1"
                      value={videoCropModal.startTime}
                      onChange={(e) => {
                        const startTime = parseFloat(e.target.value);
                        setVideoCropModal(prev => ({
                          ...prev,
                          startTime,
                          endTime: startTime + 30
                        }));
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    Selected Range: {videoCropModal.startTime.toFixed(1)}s - {videoCropModal.endTime.toFixed(1)}s
                    (30s duration)
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleVideoCrop}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      <Scissors className="w-4 h-4 inline mr-2" />
                      Crop & Upload
                    </button>
                    <button
                      onClick={() => setVideoCropModal(prev => ({ ...prev, isOpen: false }))}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Modal */}
        <PhotoModal
          isOpen={photoModal.isOpen}
          photos={photoModal.photos}
          currentPhotoIndex={photoModal.currentIndex}
          onClose={() => setPhotoModal(prev => ({ ...prev, isOpen: false }))}
          onDelete={undefined}
        />

      </div>
    </div>
  );
}