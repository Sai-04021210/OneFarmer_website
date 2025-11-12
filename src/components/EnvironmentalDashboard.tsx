'use client';

import { useState, useEffect } from 'react';
import { Sun, ThermometerSun, Droplets, TrendingUp, LucideIcon } from 'lucide-react';

interface EnvironmentalData {
  temperature: number | null;
  humidity: number | null;
  light: number | null;
  lastUpdate: Date | null;
  status: 'connected' | 'error' | 'connecting';
}

interface HistoricalEntry {
  timestamp: string;
  temperature?: number | null;
  humidity?: number | null;
  light?: number | null;
}

// Optimal ranges for Rose plants in hydroponic systems
const OPTIMAL_RANGES = {
  temperature: { min: 18, max: 24 },
  humidity: { min: 50, max: 70 },
  light: { min: 20000, max: 40000 }
};

export default function EnvironmentalDashboard() {
  const [envData, setEnvData] = useState<EnvironmentalData>({
    temperature: null,
    humidity: null,
    light: null,
    lastUpdate: null,
    status: 'connecting'
  });

  const [historicalData, setHistoricalData] = useState<HistoricalEntry[]>([]);
  const [manualMode, setManualMode] = useState<Record<string, boolean>>({
    temperature: false,
    humidity: false,
    light: false
  });
  const [manualValues, setManualValues] = useState<Record<string, number>>({
    temperature: 0,
    humidity: 0,
    light: 0
  });

  // Fetch sensor data
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('/api/mqtt-data');
        if (response.ok) {
          const data = await response.json();
          setEnvData({
            temperature: data.temperature,
            humidity: data.humidity,
            light: data.light,
            lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : null,
            status: data.status
          });
        } else {
          setEnvData(prev => ({ ...prev, status: 'error' }));
        }
      } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        setEnvData(prev => ({ ...prev, status: 'error' }));
      }
    };

    // Generate mock historical data for demonstration
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
        });
      }
      setHistoricalData(data);
    };

    fetchSensorData();
    generateData();

    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'connecting': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatValue = (value: number | null, unit: string, decimals: number = 1) => {
    if (value === null) return '--';
    return `${value.toFixed(decimals)}${unit}`;
  };

  const toggleManualMode = (parameter: string) => {
    setManualMode(prev => ({
      ...prev,
      [parameter]: !prev[parameter]
    }));

    if (!manualMode[parameter]) {
      const currentValue = envData[parameter as keyof EnvironmentalData];
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
    return envData[parameter as keyof EnvironmentalData] as number | null;
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
                step={parameter === 'light' ? '100' : '1'}
              />
            ) : (
              currentValue?.toFixed(parameter === 'light' ? 0 : 0) ?? '--'
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
    <div className="space-y-6">
      {/* Environmental Parameters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderParameterCard(ThermometerSun, 'Air Temperature', envData.temperature, '°C', OPTIMAL_RANGES.temperature, 'temperature', 'red')}
        {renderParameterCard(Droplets, 'Humidity', envData.humidity, '%', OPTIMAL_RANGES.humidity, 'humidity', 'blue')}
        {renderParameterCard(Sun, 'Light Intensity', envData.light, ' lux', OPTIMAL_RANGES.light, 'light', 'yellow')}
      </div>

      {/* Environment Historic Data */}
      <div className="bg-white/70 rounded-lg p-4 border border-green-200">
        <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Environmental Historic Data (24 Hours)
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderChart(historicalData, 'temperature', '#ef4444', 'Temperature (°C)')}
          {renderChart(historicalData, 'humidity', '#3b82f6', 'Humidity (%)')}
          {renderChart(historicalData, 'light', '#f59e0b', 'Light (lux)')}
        </div>
      </div>
    </div>
  );
}