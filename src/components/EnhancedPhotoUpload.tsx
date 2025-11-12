'use client';

import { useState, useRef } from 'react';
import {
  Upload, Camera, X, Tag, MapPin, AlertTriangle, FileText,
  Leaf, TrendingUp, Wheat, Bug, Shield, Zap,
  Settings, Gauge, Cpu, Droplets, Sun,
  FlaskConical, TestTube, Pill, Wrench, Cog,
  Scale, Hammer, Microscope, ArrowLeftRight,
  CheckCircle, FileText as Document, Sprout
} from 'lucide-react';

interface PhotoCategory {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide React component
  color: string;
  requiresStem?: boolean;
  fields?: string[];
  pages?: string[]; // Which pages this category appears on
}

const photoCategories: PhotoCategory[] = [
  // Plant-specific categories
  { id: 'stem', name: 'Plant Stems', description: 'Individual plant stem photos', icon: Sprout, color: 'green', requiresStem: true, pages: ['rose-plant', 'hibiscus-plant'] },
  { id: 'growth_stages', name: 'Growth Stages', description: 'Plant development phases', icon: TrendingUp, color: 'blue', requiresStem: true, fields: ['plantStage'], pages: ['rose-plant'] },
  { id: 'harvest', name: 'Harvest', description: 'Harvest photos and yields', icon: Wheat, color: 'yellow', requiresStem: true, pages: ['rose-plant'] },
  { id: 'diseases', name: 'Diseases', description: 'Plant diseases and symptoms', icon: Shield, color: 'red', requiresStem: true, fields: ['severity'], pages: ['rose-plant'] },
  { id: 'pests', name: 'Pests', description: 'Pest identification and damage', icon: Bug, color: 'orange', requiresStem: true, fields: ['severity'], pages: ['rose-plant'] },
  { id: 'problems', name: 'Problems', description: 'General plant issues', icon: AlertTriangle, color: 'red', requiresStem: true, fields: ['severity'], pages: ['rose-plant', 'dashboard'] },

  // System and Equipment categories
  { id: 'system', name: 'System Overview', description: 'Overall system setup', icon: Settings, color: 'gray', pages: ['dashboard', 'hibiscus-plant'] },
  { id: 'equipment', name: 'Equipment', description: 'Pumps, reservoirs, tools', icon: Cog, color: 'gray', pages: ['dashboard'] },
  { id: 'sensors', name: 'Sensors', description: 'pH, EC, temperature sensors', icon: Gauge, color: 'blue', pages: ['dashboard'] },
  { id: 'electronics', name: 'Electronics', description: 'Controllers, wiring, circuits', icon: Cpu, color: 'purple', pages: ['dashboard', 'hibiscus-plant'] },
  { id: 'hydro', name: 'Hydroponic Setup', description: 'Water systems, pipes, channels', icon: Droplets, color: 'blue', pages: ['dashboard', 'hibiscus-plant'] },
  { id: 'environment', name: 'Environment', description: 'Growing environment, lighting', icon: Sun, color: 'cyan', pages: ['dashboard', 'hibiscus-plant'] },

  // Inputs and Materials categories
  { id: 'fertilizers', name: 'Fertilizers', description: 'Fertilizer products and packaging', icon: FlaskConical, color: 'green', pages: ['dashboard'] },
  { id: 'chemicals', name: 'Chemicals', description: 'pH adjusters, additives', icon: TestTube, color: 'yellow', pages: ['dashboard'] },
  { id: 'nutrients', name: 'Nutrients', description: 'Nutrient solutions and mixes', icon: Pill, color: 'blue', pages: ['dashboard'] },

  // Process and Documentation categories
  { id: 'setup', name: 'Setup Process', description: 'Installation and setup steps', icon: Wrench, color: 'gray', pages: ['dashboard', 'hibiscus-plant'] },
  { id: 'maintenance', name: 'Maintenance', description: 'Cleaning, repairs, upkeep', icon: Wrench, color: 'orange', pages: ['dashboard', 'hibiscus-plant'] },
  { id: 'calibration', name: 'Calibration', description: 'Sensor calibration process', icon: Scale, color: 'purple', pages: ['dashboard'] },
  { id: 'installation', name: 'Installation', description: 'Equipment installation steps', icon: Hammer, color: 'brown', pages: ['dashboard'] },
  { id: 'experiments', name: 'Experiments', description: 'Research and testing', icon: Microscope, color: 'purple', pages: ['dashboard', 'rose-plant'] },
  { id: 'before_after', name: 'Before/After', description: 'Comparison photos', icon: ArrowLeftRight, color: 'blue', pages: ['dashboard', 'rose-plant'] },
  { id: 'solutions', name: 'Solutions', description: 'Problem solutions and fixes', icon: CheckCircle, color: 'green', pages: ['dashboard', 'rose-plant'] },
  { id: 'documentation', name: 'Documentation', description: 'Labels, manuals, references', icon: Document, color: 'gray', pages: ['dashboard'] },
];

const plantStages = [
  'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Mature', 'Harvest Ready'
];

const severityLevels = [
  { id: 'low', name: 'Low', color: 'green' },
  { id: 'medium', name: 'Medium', color: 'yellow' },
  { id: 'high', name: 'High', color: 'orange' },
  { id: 'critical', name: 'Critical', color: 'red' }
];

interface UploadMetadata {
  category: string;
  description?: string;
  tags?: string;
  location?: string;
  plantStage?: string;
  severity?: string;
  stemId?: string;
}

interface EnhancedPhotoUploadProps {
  onUpload: (files: FileList, metadata: UploadMetadata) => Promise<void>;
  stemId?: string;
  defaultCategory?: string;
  className?: string;
  page?: string; // Current page context (dashboard, rose-plant, etc.)
}

export default function EnhancedPhotoUpload({
  onUpload,
  stemId,
  defaultCategory = 'stem',
  className = '',
  page = 'dashboard'
}: EnhancedPhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [plantStage, setPlantStage] = useState('');
  const [severity, setSeverity] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingFile, setProcessingFile] = useState<File | null>(null);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter categories based on current page
  const availableCategories = photoCategories.filter(cat =>
    !cat.pages || cat.pages.includes(page)
  );

  const selectedCategoryData = availableCategories.find(cat => cat.id === selectedCategory);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Validate file size (max 25MB for images)
      const maxSize = 25 * 1024 * 1024; // 25MB
      const validFiles = Array.from(files).filter(file => {
        if (file.size > maxSize) {
          alert(`${file.name} is too large. Maximum size is 25MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        // For images larger than 5MB, offer compression
        const file = validFiles[0]; // Process one at a time

        // Check if file needs compression (>5MB or large dimensions)
        const needsCompression = file.size > 5 * 1024 * 1024; // 5MB

        if (needsCompression && file.type.startsWith('image/')) {
          setProcessingFile(file);
        } else {
          const fileList = new DataTransfer();
          validFiles.forEach(f => fileList.items.add(f));
          setSelectedFiles(fileList.files);
          setIsOpen(true);
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;
    
    setIsUploading(true);
    try {
      const metadata = {
        category: selectedCategory,
        description,
        tags,
        location,
        plantStage: selectedCategoryData?.fields?.includes('plantStage') ? plantStage : undefined,
        severity: selectedCategoryData?.fields?.includes('severity') ? severity : undefined,
        stemId: selectedCategoryData?.requiresStem ? stemId : 'SYSTEM'
      };
      
      await onUpload(selectedFiles, metadata);
      
      // Reset form
      setDescription('');
      setTags('');
      setLocation('');
      setPlantStage('');
      setSeverity('');
      setSelectedFiles(null);
      setIsOpen(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageProcessed = (processedFile: File) => {
    setProcessedFiles([processedFile]);
    setProcessingFile(null);

    const fileList = new DataTransfer();
    fileList.items.add(processedFile);
    setSelectedFiles(fileList.files);
    setIsOpen(true);
  };

  const handleProcessCancel = () => {
    setProcessingFile(null);
  };

  const handleCancel = () => {
    setSelectedFiles(null);
    setIsOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {/* Upload Trigger Button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Camera className="w-4 h-4 mr-2" />
        Upload Photos
      </button>


      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Upload Photos</h2>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Selected Files Info */}
              {selectedFiles && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Selected Files:</h3>
                  <div className="text-sm text-blue-700">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <span className="text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photo Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedCategory === category.id
                            ? `border-${category.color}-500 bg-${category.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{category.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Fields Based on Category */}
              {selectedCategoryData?.fields?.includes('plantStage') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plant Stage
                  </label>
                  <select
                    value={plantStage}
                    onChange={(e) => setPlantStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select stage...</option>
                    {plantStages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCategoryData?.fields?.includes('severity') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level
                  </label>
                  <div className="flex space-x-2">
                    {severityLevels.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setSeverity(level.id)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          severity === level.id
                            ? `border-${level.color}-500 bg-${level.color}-100 text-${level.color}-800`
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {level.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's in the photo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., deficiency, yellowing, week-3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Greenhouse A, Reservoir area, Lab bench"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFiles}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {selectedFiles?.length || 0} Photo{(selectedFiles?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
