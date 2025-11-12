'use client';

import { useState, useRef } from 'react';
import {
  Upload, Video, X, Tag, MapPin, AlertTriangle, FileText,
  Play, Clock, Settings, Cog, Scissors
} from 'lucide-react';
import VideoProcessor from './VideoProcessor';

interface VideoMetadata {
  category: string;
  description?: string;
  tags?: string;
  location?: string;
  duration?: string;
  stemId?: string;
}

interface EnhancedVideoUploadProps {
  onUpload: (files: FileList, metadata: VideoMetadata) => Promise<void>;
  stemId?: string;
  defaultCategory?: string;
  className?: string;
  page?: string;
}

const videoCategories = [
  { id: 'timelapse', name: 'Time-lapse', description: 'Plant growth over time', icon: Clock, color: 'blue' },
  { id: 'process', name: 'Process', description: 'Setup/maintenance procedures', icon: Settings, color: 'gray' },
  { id: 'system_operation', name: 'System Operation', description: 'Running system footage', icon: Cog, color: 'green' },
  { id: 'problems', name: 'Problems', description: 'Issue documentation', icon: AlertTriangle, color: 'red' },
  { id: 'tutorial', name: 'Tutorial', description: 'How-to videos', icon: Play, color: 'purple' },
];

export default function EnhancedVideoUpload({
  onUpload,
  stemId,
  defaultCategory = 'timelapse',
  className = '',
  page = 'dashboard'
}: EnhancedVideoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingFile, setProcessingFile] = useState<File | null>(null);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryData = videoCategories.find(cat => cat.id === selectedCategory);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      const validFiles = Array.from(files).filter(file => {
        if (file.size > maxSize) {
          alert(`${file.name} is too large. Maximum size is 100MB.`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        // For videos over 30 seconds or larger than 50MB, offer processing
        const file = validFiles[0]; // Process one at a time

        // Check if file needs processing
        const needsProcessing = file.size > 50 * 1024 * 1024; // 50MB

        if (needsProcessing) {
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

  const handleVideoProcessed = (processedFile: File) => {
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

  const handleUpload = async () => {
    if (!selectedFiles) return;

    setIsUploading(true);
    try {
      const metadata = {
        category: selectedCategory,
        description,
        tags,
        location,
        duration,
        stemId: stemId || 'SYSTEM'
      };

      await onUpload(selectedFiles, metadata);

      // Reset form
      setDescription('');
      setTags('');
      setLocation('');
      setDuration('');
      setSelectedFiles(null);
      setIsOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Video upload failed:', error);
      alert('Video upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Video className="w-4 h-4 mr-2" />
        Upload Videos
      </button>

      {/* Video Processing Modal */}
      {processingFile && (
        <VideoProcessor
          file={processingFile}
          onProcessed={handleVideoProcessed}
          onCancel={handleProcessCancel}
        />
      )}

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Upload Videos</h2>
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
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">Selected Videos:</h3>
                  <div className="text-sm text-purple-700">
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
                  Video Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {videoCategories.map((category) => {
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the video content..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (optional)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 2:30, 45 seconds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  placeholder="e.g., timelapse, growth, week-3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  placeholder="e.g., Greenhouse A, Main growing area"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFiles}
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {selectedFiles?.length || 0} Video{(selectedFiles?.length || 0) !== 1 ? 's' : ''}
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