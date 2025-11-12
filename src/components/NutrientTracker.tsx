'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Plus, Save, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NutrientFormulation {
  name: string;
  formula: string;
  elements: {
    [key: string]: number; // percentage
  };
}

interface NutrientEntry {
  date: string;
  time: string;
  masterblend: number; // grams
  calciumNitrate: number; // grams
  magnesiumSulfate: number; // grams
  phDown: number; // ml
  phUp: number; // ml
  totalVolume: number; // liters
  calculatedElements: {
    [key: string]: number; // mg/L concentration
  };
  notes?: string;
}

interface ElementData {
  element: string;
  symbol: string;
  values: { date: string; concentration: number }[];
  color: string;
}

const NUTRIENT_FORMULATIONS: NutrientFormulation[] = [
  {
    name: 'Masterblend 4-18-38',
    formula: 'C12H22O11',
    elements: {
      'N': 4.0,        // Total Nitrogen
      'N-NO3': 3.5,    // Nitrate Nitrogen
      'N-NH4': 0.5,    // Ammonia Nitrogen
      'P2O5': 18.0,    // Phosphorus Pentoxide
      'P': 7.86,       // Elemental Phosphorus (P2O5 × 0.437)
      'K2O': 38.0,     // Potassium Oxide
      'K': 31.54,      // Elemental Potassium (K2O × 0.83)
      'B': 0.02,       // Boron
      'Cu': 0.05,      // Chelated Copper
      'Fe': 0.40,      // Chelated Iron
      'Mn': 0.20,      // Chelated Manganese
      'Mo': 0.01,      // Chelated Molybdenum
      'Zn': 0.05       // Chelated Zinc
    }
  },
  {
    name: 'Calcium Nitrate',
    formula: 'Ca(NO3)2',
    elements: {
      'N': 15.5,       // Total Nitrogen
      'N-NO3': 14.4,   // Nitric Nitrogen
      'N-NH4': 1.1,    // Ammoniacal Nitrogen
      'Ca': 19.0,      // Elemental Calcium
      'CaO': 26.5      // Calcium Oxide
    }
  },
  {
    name: 'Magnesium Sulfate',
    formula: 'MgSO4·7H2O',
    elements: {
      'MgO': 16.0,     // Magnesium Oxide
      'Mg': 9.6,       // Elemental Magnesium
      'SO3': 32.5,     // Sulfur Trioxide
      'S': 13.0        // Elemental Sulfur
    }
  }
];

const ELEMENT_COLORS: { [key: string]: string } = {
  'N': '#22c55e',      // Green
  'P': '#f59e0b',      // Orange
  'K': '#8b5cf6',      // Purple
  'Ca': '#3b82f6',     // Blue
  'Mg': '#ef4444',     // Red
  'S': '#f97316',      // Orange-Red
  'Fe': '#6b7280',     // Gray
  'Mn': '#92400e',     // Brown
  'B': '#059669',      // Emerald
  'Cu': '#dc2626',     // Red
  'Mo': '#7c3aed',     // Violet
  'Zn': '#0891b2'      // Cyan
};

interface NutrientTrackerProps {
  isDarkMode?: boolean;
  plantType?: 'dashboard' | 'rose' | 'hibiscus';
}

export default function NutrientTracker({ isDarkMode = false, plantType = 'dashboard' }: NutrientTrackerProps) {
  const [entries, setEntries] = useState<NutrientEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<NutrientEntry>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    masterblend: 0,
    calciumNitrate: 0,
    magnesiumSulfate: 0,
    phDown: 0,
    phUp: 0,
    totalVolume: 1
  });
  const [selectedElements, setSelectedElements] = useState<string[]>(['N', 'P', 'K', 'Ca', 'Mg']);
  const [graphTimeRange, setGraphTimeRange] = useState('1week');
  const [visibleLines, setVisibleLines] = useState<{[key: string]: boolean}>({
    'N': true,
    'P': true,
    'K': true,
    'Ca': true,
    'Mg': true,
    'S': true,
    'Fe': true,
    'Mn': true,
    'B': true,
    'Cu': true,
    'Mo': true,
    'Zn': true
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const getApiEndpoint = () => {
    if (plantType === 'rose') return '/api/rose-plant-nutrient-entries';
    if (plantType === 'hibiscus') return '/api/hibiscus-plant-nutrient-entries';
    return '/api/nutrient-entries';
  };

  const loadEntries = async () => {
    try {
      const response = await fetch(getApiEndpoint());
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Failed to load nutrient entries:', error);
      setEntries([]);
    }
  };

  const calculateElementConcentrations = (entry: Partial<NutrientEntry>): { [key: string]: number } => {
    const concentrations: { [key: string]: number } = {};

    if (!entry.totalVolume || entry.totalVolume <= 0) return concentrations;

    // Calculate concentrations for each nutrient solution
    NUTRIENT_FORMULATIONS.forEach((formulation, index) => {
      let amount = 0;
      switch (index) {
        case 0: amount = entry.masterblend || 0; break;
        case 1: amount = entry.calciumNitrate || 0; break;
        case 2: amount = entry.magnesiumSulfate || 0; break;
      }

      // Calculate concentration for each element in this formulation
      Object.entries(formulation.elements).forEach(([element, percentage]) => {
        const elementAmount = (amount * percentage / 100); // grams of element
        const concentration = (elementAmount * 1000) / entry.totalVolume!; // mg/L

        if (!concentrations[element]) {
          concentrations[element] = 0;
        }
        concentrations[element] += concentration;
      });
    });

    return concentrations;
  };

  const handleInputChange = (field: keyof NutrientEntry, value: string | number) => {
    const updatedEntry = {
      ...currentEntry,
      [field]: field === 'date' || field === 'time' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : value)
    };

    // Recalculate element concentrations
    updatedEntry.calculatedElements = calculateElementConcentrations(updatedEntry);

    setCurrentEntry(updatedEntry);
  };

  const saveEntry = async () => {
    if (!currentEntry.date || !currentEntry.time) return;

    // Create entry with combined timestamp
    const combinedDateTime = new Date(`${currentEntry.date}T${currentEntry.time}:00`);
    const newEntry = {
      ...currentEntry,
      timestamp: combinedDateTime.toISOString()
    } as NutrientEntry;

    try {
      const response = await fetch(getApiEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        // Reload entries from server
        await loadEntries();

        // Reset form
        setCurrentEntry({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          masterblend: 0,
          calciumNitrate: 0,
          magnesiumSulfate: 0,
          phDown: 0,
          phUp: 0,
          totalVolume: 1
        });
      } else {
        console.error('Failed to save nutrient entry');
      }
    } catch (error) {
      console.error('Error saving nutrient entry:', error);
    }
  };

  // Delete functionality disabled - entries are now non-deletable
  // const deleteEntry = (date: string, time: string) => {
  //   const updatedEntries = entries.filter(e => {
  //     // Normalize time values for comparison
  //     const entryTime = e.time || '00:00';
  //     const compareTime = time || '00:00';
  //     return !(e.date === date && entryTime === compareTime);
  //   });
  //   setEntries(updatedEntries);
  //   localStorage.setItem('nutrient-entries', JSON.stringify(updatedEntries));
  // };

  // const deleteEntryByIndex = (targetEntry: NutrientEntry) => {
  //   const updatedEntries = entries.filter(e => e !== targetEntry);
  //   setEntries(updatedEntries);
  //   localStorage.setItem('nutrient-entries', JSON.stringify(updatedEntries));
  // };

  // Graph helper functions
  const getFilteredGraphData = () => {
    const now = new Date();
    let cutoffTime = new Date();

    switch (graphTimeRange) {
      case '1day':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '3days':
        cutoffTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case '1week':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '2weeks':
        cutoffTime = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Filter entries by time range and transform for chart
    const filteredEntries = entries.filter(entry => {
      const entryTime = new Date(`${entry.date}T${entry.time || '00:00'}:00`);
      return entryTime >= cutoffTime;
    });

    // Transform entries into chart data format
    return filteredEntries.map(entry => {
      const timestamp = new Date(`${entry.date}T${entry.time || '00:00'}:00`).toISOString();
      const chartData: Record<string, unknown> = { timestamp };

      // Add all element concentrations to the chart data
      Object.entries(entry.calculatedElements || {}).forEach(([element, concentration]) => {
        chartData[element] = concentration;
      });

      return chartData;
    }).sort((a, b) => new Date(String(a.timestamp)).getTime() - new Date(String(b.timestamp)).getTime());
  };

  const toggleElementLine = (element: string) => {
    setVisibleLines(prev => ({
      ...prev,
      [element]: !prev[element]
    }));
  };

  const getElementColor = (element: string): string => {
    const colors: { [key: string]: string } = {
      'N': '#ef4444',   // red
      'P': '#f97316',   // orange
      'K': '#eab308',   // yellow
      'Ca': '#22c55e',  // green
      'Mg': '#3b82f6', // blue
      'S': '#8b5cf6',   // purple
      'Fe': '#ec4899',  // pink
      'Mn': '#06b6d4',  // cyan
      'Zn': '#84cc16',  // lime
      'Cu': '#f59e0b',  // amber
      'B': '#6366f1',   // indigo
      'Mo': '#14b8a6'   // teal
    };
    return colors[element] || '#6b7280';
  };

  const downloadData = (format: 'csv' | 'json') => {
    if (entries.length === 0) return;

    if (format === 'csv') {
      // Create CSV content
      const headers = [
        'Date',
        'Time',
        'Masterblend (g)',
        'Calcium Nitrate (g)',
        'Magnesium Sulfate (g)',
        'pH Down (ml)',
        'pH Up (ml)',
        'Volume of Water (L)',
        // Element concentrations
        'N (mg/L)',
        'P (mg/L)',
        'K (mg/L)',
        'Ca (mg/L)',
        'Mg (mg/L)',
        'S (mg/L)',
        'Fe (mg/L)',
        'Mn (mg/L)',
        'B (mg/L)',
        'Cu (mg/L)',
        'Mo (mg/L)',
        'Zn (mg/L)',
        'Notes'
      ];

      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          entry.date,
          entry.time || '00:00',
          entry.masterblend.toFixed(2),
          entry.calciumNitrate.toFixed(2),
          entry.magnesiumSulfate.toFixed(2),
          entry.phDown.toFixed(2),
          entry.phUp.toFixed(2),
          entry.totalVolume.toFixed(2),
          (entry.calculatedElements['N'] || 0).toFixed(2),
          (entry.calculatedElements['P'] || 0).toFixed(2),
          (entry.calculatedElements['K'] || 0).toFixed(2),
          (entry.calculatedElements['Ca'] || 0).toFixed(2),
          (entry.calculatedElements['Mg'] || 0).toFixed(2),
          (entry.calculatedElements['S'] || 0).toFixed(2),
          (entry.calculatedElements['Fe'] || 0).toFixed(2),
          (entry.calculatedElements['Mn'] || 0).toFixed(2),
          (entry.calculatedElements['B'] || 0).toFixed(2),
          (entry.calculatedElements['Cu'] || 0).toFixed(2),
          (entry.calculatedElements['Mo'] || 0).toFixed(2),
          (entry.calculatedElements['Zn'] || 0).toFixed(2),
          `"${(entry.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `nutrient-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Download JSON
      const jsonContent = JSON.stringify(entries, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `nutrient-data-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getElementData = (element: string): ElementData => {
    const values = entries.map(entry => ({
      date: entry.date,
      concentration: entry.calculatedElements[element] || 0
    }));

    return {
      element,
      symbol: element,
      values,
      color: ELEMENT_COLORS[element] || '#6b7280'
    };
  };

  const renderChart = (elementData: ElementData) => {
    if (elementData.values.length === 0) return null;

    const values = elementData.values.map(v => v.concentration);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const points = elementData.values.map((v, i) => {
      const x = elementData.values.length > 1
        ? (i / (elementData.values.length - 1)) * 300
        : 150; // Center if only one point
      const y = range > 0
        ? 100 - ((v.concentration - minValue) / range) * 80
        : 50; // Center if no range

      // Return valid coordinates or fallback
      const validX = isNaN(x) ? 0 : x;
      const validY = isNaN(y) ? 50 : y;

      return `${validX},${validY}`;
    }).join(' ');

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: elementData.color }}
            ></div>
            <span className="font-medium text-sm">{elementData.element}</span>
          </div>
          <span className="text-xs text-gray-500">
            {values[values.length - 1]?.toFixed(1)} mg/L
          </span>
        </div>
        <svg width="300" height="100" className="w-full h-20">
          <polyline
            fill="none"
            stroke={elementData.color}
            strokeWidth="2"
            points={points}
          />
          {/* Data points */}
          {elementData.values.map((v, i) => {
            const x = elementData.values.length > 1
              ? (i / (elementData.values.length - 1)) * 300
              : 150; // Center if only one point
            const y = range > 0
              ? 100 - ((v.concentration - minValue) / range) * 80
              : 50; // Center if no range

            // Only render if coordinates are valid numbers
            if (isNaN(x) || isNaN(y)) return null;

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill={elementData.color}
                className="opacity-60"
              />
            );
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>
    );
  };

  const allElements = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'B', 'Cu', 'Mo', 'Zn'];

  return (
    <div className="space-y-6">
      {/* Element Concentration Analytics */}
      <div className={`rounded-lg p-4 border transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800/70 border-green-400/30 text-white'
          : 'bg-white/70 border-green-200'
      }`}>
        <h4 className={`text-lg font-bold mb-4 flex items-center ${
          isDarkMode ? 'text-green-400' : 'text-green-800'
        }`}>
          <TrendingUp className={`w-5 h-5 mr-2 ${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          }`} />
          Element Concentration Analytics
        </h4>

        {/* Time Range and Element Toggle Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>Time Range:</span>
            <select
              value={graphTimeRange}
              onChange={(e) => setGraphTimeRange(e.target.value)}
              className={`px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="1day">1 Day</option>
              <option value="3days">3 Days</option>
              <option value="1week">1 Week</option>
              <option value="2weeks">2 Weeks</option>
              <option value="1month">1 Month</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(visibleLines).map(([element, visible]) => (
              <button
                key={element}
                onClick={() => toggleElementLine(element)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  visible
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                style={{
                  backgroundColor: visible ? getElementColor(element) : undefined
                }}
              >
                {element}
              </button>
            ))}
          </div>
        </div>

        {/* Graph */}
        <div className={`rounded-lg p-4 border transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gray-800 border-gray-600'
            : 'bg-white border-gray-200'
        }`}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getFilteredGraphData()}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'Concentration (mg/L)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)} mg/L`,
                  name
                ]}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                }}
              />
              <Legend />
              {Object.entries(visibleLines).map(([element, visible]) =>
                visible ? (
                  <Line
                    key={element}
                    type="monotone"
                    dataKey={element}
                    stroke={getElementColor(element)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          {Object.entries(visibleLines)
            .filter(([_, visible]) => visible)
            .map(([element]) => {
              const data = getFilteredGraphData();
              const values = data.map(d => d[element]).filter(v => v != null) as number[];
              const current = values[values.length - 1];
              const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              const min = values.length > 0 ? Math.min(...values) : 0;
              const max = values.length > 0 ? Math.max(...values) : 0;

              return (
                <div key={element} className={`rounded-lg p-3 border transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{element}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getElementColor(element) }}></div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Current: <span className="font-medium">{current?.toFixed(1) || '--'} mg/L</span></div>
                    <div>Average: <span className="font-medium">{average.toFixed(1)} mg/L</span></div>
                    <div>Range: <span className="font-medium">{min.toFixed(1)} - {max.toFixed(1)} mg/L</span></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Recent Entries */}
      <div className={`rounded-xl p-6 border shadow-sm transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-800 border-gray-600 text-white'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Recent Nutrient Entries</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => downloadData('csv')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
            <button
              onClick={() => downloadData('json')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              JSON
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Date & Time</th>
                <th className="text-left py-2">Masterblend (g)</th>
                <th className="text-left py-2">Ca(NO₃)₂ (g)</th>
                <th className="text-left py-2">MgSO₄ (g)</th>
                <th className="text-left py-2">Volume of Water (L)</th>
                <th className="text-left py-2">N (mg/L)</th>
                <th className="text-left py-2">P (mg/L)</th>
                <th className="text-left py-2">K (mg/L)</th>
                <th className="text-left py-2">Ca (mg/L)</th>
                <th className="text-left py-2">Mg (mg/L)</th>
                <th className="text-left py-2">S (mg/L)</th>
                <th className="text-left py-2">Fe (mg/L)</th>
                <th className="text-left py-2">Mn (mg/L)</th>
                <th className="text-left py-2">B (mg/L)</th>
                <th className="text-left py-2">Cu (mg/L)</th>
                <th className="text-left py-2">Mo (mg/L)</th>
                <th className="text-left py-2">Zn (mg/L)</th>
                <th className="text-left py-2">Notes</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(-10).reverse().map((entry, index) => (
                <tr key={`${entry.date}-${entry.time || '00:00'}`} className="border-b border-gray-100">
                  <td className="py-2">
                    <div>{entry.date}</div>
                    <div className="text-xs text-gray-500">{entry.time || '00:00'}</div>
                  </td>
                  <td className="py-2">{entry.masterblend.toFixed(2)}</td>
                  <td className="py-2">{entry.calciumNitrate.toFixed(2)}</td>
                  <td className="py-2">{entry.magnesiumSulfate.toFixed(2)}</td>
                  <td className="py-2">{entry.totalVolume.toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['N'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['P'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['K'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['Ca'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['Mg'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['S'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['Fe'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['Mn'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['B'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['Cu'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['Mo'] || 0).toFixed(1)}</td>
                  <td className="py-2">{(entry.calculatedElements['Zn'] || 0).toFixed(1)}</td>
                  <td className="py-2 max-w-xs truncate">{entry.notes || '--'}</td>
                  <td className="py-2">
                    {/* Delete functionality disabled */}
                    <span className="text-gray-400 text-sm">Protected</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}