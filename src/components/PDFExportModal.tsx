'use client';

import { useState } from 'react';
import { X, FileText, Download, Calendar, Image, Database, CheckSquare, Square } from 'lucide-react';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dataTypes = [
  { id: 'environmental', name: 'Environmental Data', description: 'Temperature, humidity, light, pH, EC', icon: '🌤️' },
  { id: 'hydroponic', name: 'Hydroponic Parameters', description: 'Water quality, pH, EC, TDS, dissolved oxygen', icon: '💧' },
  { id: 'plant', name: 'Plant Monitoring', description: 'Growth measurements, health status, observations', icon: '🌱' },
  { id: 'nutrients', name: 'Nutrient Data', description: 'Fertilizer additions, formulations, calculations', icon: '🧪' },
];

const photoCategories = [
  { id: 'stem', name: 'Plant Stems', icon: '🌱' },
  { id: 'growth_stages', name: 'Growth Stages', icon: '📈' },
  { id: 'harvest', name: 'Harvest', icon: '🌾' },
  { id: 'diseases', name: 'Diseases', icon: '🦠' },
  { id: 'pests', name: 'Pests', icon: '🐛' },
  { id: 'problems', name: 'Problems', icon: '⚠️' },
  { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
  { id: 'chemicals', name: 'Chemicals', icon: '⚗️' },
  { id: 'equipment', name: 'Equipment', icon: '⚙️' },
  { id: 'sensors', name: 'Sensors', icon: '📊' },
  { id: 'system', name: 'System Overview', icon: '🏗️' },
  { id: 'maintenance', name: 'Maintenance', icon: '🛠️' },
];

export default function PDFExportModal({ isOpen, onClose }: PDFExportModalProps) {
  const [includeData, setIncludeData] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['environmental', 'hydroponic']);
  const [selectedPhotoCategories, setSelectedPhotoCategories] = useState<string[]>(['stem', 'growth_stages']);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [stemId, setStemId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleDataTypeToggle = (typeId: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handlePhotoCategoryToggle = (categoryId: string) => {
    setSelectedPhotoCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportOptions = {
        includeData,
        includePhotos,
        dataTypes: selectedDataTypes,
        categories: selectedPhotoCategories,
        dateRange,
        stemId: stemId || undefined
      };

      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `onefarmer-report-${dateRange.start}-to-${dateRange.end}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert('PDF report generated successfully!');
        onClose();
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Export PDF Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stem Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Plant Stem (Optional)
            </label>
            <select
              value={stemId}
              onChange={(e) => setStemId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All stems</option>
              <option value="A">Stem A</option>
              <option value="B">Stem B</option>
              <option value="C">Stem C</option>
              <option value="D">Stem D</option>
            </select>
          </div>

          {/* Include Data Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() => setIncludeData(!includeData)}
                className="flex items-center space-x-2"
              >
                {includeData ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  <Database className="w-4 h-4 inline mr-1" />
                  Include Data Tables
                </span>
              </button>
            </div>

            {includeData && (
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600 mb-3">Select data types to include:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleDataTypeToggle(type.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedDataTypes.includes(type.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium text-sm">{type.name}</span>
                        {selectedDataTypes.includes(type.id) && (
                          <CheckSquare className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Include Photos Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <button
                onClick={() => setIncludePhotos(!includePhotos)}
                className="flex items-center space-x-2"
              >
                {includePhotos ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  <Image className="w-4 h-4 inline mr-1" />
                  Include Photos
                </span>
              </button>
            </div>

            {includePhotos && (
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600 mb-3">Select photo categories to include:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {photoCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handlePhotoCategoryToggle(category.id)}
                      className={`p-2 rounded-lg border text-left transition-all text-sm ${
                        selectedPhotoCategories.includes(category.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">{category.icon}</span>
                        <span className="font-medium text-xs">{category.name}</span>
                        {selectedPhotoCategories.includes(category.id) && (
                          <CheckSquare className="w-3 h-3 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Only the first 4 photos from each category will be included in the PDF to keep file size manageable.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Export Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Date range: {dateRange.start} to {dateRange.end}</p>
              {stemId && <p>• Filtered to: Stem {stemId}</p>}
              {includeData && <p>• Data types: {selectedDataTypes.length} selected</p>}
              {includePhotos && <p>• Photo categories: {selectedPhotoCategories.length} selected</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              onClick={handleExport}
              disabled={isExporting || (!includeData && !includePhotos)}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </div>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
