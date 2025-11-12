'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Save, Download, Droplets, Sun, Database } from 'lucide-react';

interface ParameterEntry {
  date: string;
  // Environmental Parameters
  airTemperature?: number;
  airHumidity?: number;
  lightIntensity?: number;
  co2Level?: number;
  // Hydroponic Parameters
  pH?: number;
  ec?: number;
  waterTemperature?: number;
  tds?: number;
  // System Parameters
  pumpCycles?: number;
  flowRate?: number;
  notes?: string;
}

type ParameterType = 'environmental' | 'hydroponic' | 'system';

interface ParameterTrackerProps {
  type: ParameterType;
  title: string;
  color: string;
}

export default function ParameterTracker({ type, title, color }: ParameterTrackerProps) {
  const [entries, setEntries] = useState<ParameterEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<ParameterEntry>>({
    date: new Date().toISOString().split('T')[0]
  });

  const storageKey = `${type}-parameter-entries`;

  useEffect(() => {
    loadEntries();
  }, [type]);

  const loadEntries = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      setEntries([]);
    }
  };

  const handleInputChange = (field: keyof ParameterEntry, value: string | number) => {
    setCurrentEntry(prev => ({
      ...prev,
      [field]: field === 'date' || field === 'notes' ? value : parseFloat(String(value)) || 0
    }));
  };

  const saveEntry = () => {
    if (!currentEntry.date) return;

    const newEntry = currentEntry as ParameterEntry;
    const updatedEntries = [...entries.filter(e => e.date !== newEntry.date), newEntry]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setEntries(updatedEntries);
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries));

    // Reset form
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Delete functionality disabled - entries are now non-deletable
  // const deleteEntry = (date: string) => {
  //   const updatedEntries = entries.filter(e => e.date !== date);
  //   setEntries(updatedEntries);
  //   localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
  // };

  const downloadData = (format: 'csv' | 'json') => {
    if (entries.length === 0) return;

    if (format === 'csv') {
      const fields = getFieldsForType(type);
      const headers = ['Date', ...fields.map(f => f.label)];

      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          entry.date,
          ...fields.map(f => (entry[f.key as keyof ParameterEntry] || '').toString())
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}-parameters-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const jsonContent = JSON.stringify(entries, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}-parameters-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFieldsForType = (type: ParameterType) => {
    switch (type) {
      case 'environmental':
        return [
          { key: 'airTemperature', label: 'Air Temperature (°C)', step: '0.1' },
          { key: 'airHumidity', label: 'Air Humidity (%)', step: '0.1' },
          { key: 'lightIntensity', label: 'Light Intensity (lux)', step: '100' },
          { key: 'co2Level', label: 'CO₂ Level (ppm)', step: '10' }
        ];
      case 'hydroponic':
        return [
          { key: 'pH', label: 'pH Level', step: '0.1' },
          { key: 'ec', label: 'EC (mS/cm)', step: '0.1' },
          { key: 'waterTemperature', label: 'Water Temperature (°C)', step: '0.1' },
          { key: 'tds', label: 'TDS (ppm)', step: '10' }
        ];
      case 'system':
        return [
          { key: 'pumpCycles', label: 'Pump Cycles', step: '1' },
          { key: 'flowRate', label: 'Flow Rate (L/min)', step: '0.1' }
        ];
      default:
        return [];
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'environmental': return <Sun className="w-6 h-6" style={{ color }} />;
      case 'hydroponic': return <Droplets className="w-6 h-6" style={{ color }} />;
      case 'system': return <Database className="w-6 h-6" style={{ color }} />;
    }
  };

  const fields = getFieldsForType(type);

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Plus className="w-6 h-6 mr-2" style={{ color }} />
          Add {title} Entry
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={currentEntry.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Parameter Fields */}
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
              <input
                type="number"
                step={field.step}
                value={currentEntry[field.key as keyof ParameterEntry] || ''}
                onChange={(e) => handleInputChange(field.key as keyof ParameterEntry, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          ))}

          {/* Notes */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <input
              type="text"
              value={currentEntry.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Optional notes about conditions or observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveEntry}
            className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: color }}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </button>
        </div>
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              {getIcon()}
              <span className="ml-2">Recent {title} Entries</span>
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadData('csv')}
                className="inline-flex items-center px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: color }}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </button>
              <button
                onClick={() => downloadData('json')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
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
                  <th className="text-left py-2">Date</th>
                  {fields.map(field => (
                    <th key={field.key} className="text-left py-2">{field.label}</th>
                  ))}
                  <th className="text-left py-2">Notes</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(-10).reverse().map((entry) => (
                  <tr key={entry.date} className="border-b border-gray-100">
                    <td className="py-2">{entry.date}</td>
                    {fields.map(field => (
                      <td key={field.key} className="py-2">
                        {entry[field.key as keyof ParameterEntry] || '--'}
                      </td>
                    ))}
                    <td className="py-2">{entry.notes || '--'}</td>
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
      )}
    </div>
  );
}