'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ThermometerSun, Droplets, Calendar, BarChart3 } from 'lucide-react';

interface SensorDataPoint {
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  time: string;
}

interface SensorGraphProps {
  currentTemperature: number | null;
  currentHumidity: number | null;
}

export default function SensorGraph({ currentTemperature, currentHumidity }: SensorGraphProps) {
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'both'>('both');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [graphData, setGraphData] = useState<SensorDataPoint[]>([]);

  // Generate mock historical data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const now = new Date();
      const dataPoints: SensorDataPoint[] = [];
      const intervals = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : 144; // 5min, 10min, 10min intervals
      const intervalMs = timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '6h' ? 10 * 60 * 1000 : 10 * 60 * 1000;

      for (let i = intervals; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * intervalMs));

        // Generate realistic temperature data (18-24°C with some variation)
        const baseTemp = 21;
        const tempVariation = Math.sin(i * 0.1) * 2 + Math.random() * 1 - 0.5;
        const temperature = baseTemp + tempVariation;

        // Generate realistic humidity data (50-70% with some variation)
        const baseHumidity = 60;
        const humidityVariation = Math.cos(i * 0.15) * 8 + Math.random() * 3 - 1.5;
        const humidity = baseHumidity + humidityVariation;

        dataPoints.push({
          timestamp: timestamp.toISOString(),
          temperature: Number(temperature.toFixed(1)),
          humidity: Number(humidity.toFixed(0)),
          time: timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        });
      }

      // Add current values as the latest point if available
      if (currentTemperature !== null || currentHumidity !== null) {
        dataPoints[dataPoints.length - 1] = {
          ...dataPoints[dataPoints.length - 1],
          temperature: currentTemperature,
          humidity: currentHumidity
        };
      }

      setGraphData(dataPoints);
    };

    generateMockData();

    // Update every 30 seconds
    const interval = setInterval(generateMockData, 30000);
    return () => clearInterval(interval);
  }, [timeRange, currentTemperature, currentHumidity]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'temperature') {
      return [`${value}°C`, 'Temperature'];
    } else if (name === 'humidity') {
      return [`${value}%`, 'Humidity'];
    }
    return [value, name];
  };

  const formatTooltipLabel = (label: string) => {
    const timestamp = graphData.find(d => d.time === label)?.timestamp;
    if (timestamp) {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return label;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Sensor Trends</h3>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full animate-pulse bg-blue-500"></div>
          <span className="text-xs text-blue-600 font-medium">LIVE GRAPH</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Metric Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Show:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedMetric('temperature')}
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                selectedMetric === 'temperature'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ThermometerSun className="w-3 h-3 mr-1" />
              Temp
            </button>
            <button
              onClick={() => setSelectedMetric('humidity')}
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                selectedMetric === 'humidity'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Droplets className="w-3 h-3 mr-1" />
              Humidity
            </button>
            <button
              onClick={() => setSelectedMetric('both')}
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                selectedMetric === 'both'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Both
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1h' | '6h' | '24h')}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
        </div>
      </div>

      {/* Graph */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />

            {(selectedMetric === 'temperature' || selectedMetric === 'both') && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#ef4444' }}
                connectNulls={false}
              />
            )}

            {(selectedMetric === 'humidity' || selectedMetric === 'both') && (
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        {(selectedMetric === 'temperature' || selectedMetric === 'both') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Temperature (°C)</span>
          </div>
        )}
        {(selectedMetric === 'humidity' || selectedMetric === 'both') && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Humidity (%)</span>
          </div>
        )}
      </div>

      {/* Current Values Footer */}
      <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <ThermometerSun className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-gray-600">Current: </span>
            <span className="font-medium text-gray-900">
              {currentTemperature !== null ? `${currentTemperature.toFixed(1)}°C` : 'Loading...'}
            </span>
          </div>
          <div className="flex items-center">
            <Droplets className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-gray-600">Current: </span>
            <span className="font-medium text-gray-900">
              {currentHumidity !== null ? `${currentHumidity.toFixed(0)}%` : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}