'use client';

import { useState, useRef } from 'react';
import {
  Upload, FileText, X, Tag, MapPin, Folder,
  BookOpen, FileSpreadsheet, File, ClipboardList
} from 'lucide-react';

interface DocumentMetadata {
  category: string;
  description?: string;
  tags?: string;
  location?: string;
  documentType?: string;
  stemId?: string;
}

interface EnhancedDocumentUploadProps {
  onUpload: (files: FileList, metadata: DocumentMetadata) => Promise<void>;
  stemId?: string;
  defaultCategory?: string;
  className?: string;
  page?: string;
}

const documentCategories = [
  { id: 'manual', name: 'Manuals', description: 'Equipment manuals & guides', icon: BookOpen, color: 'blue' },
  { id: 'datasheet', name: 'Data Sheets', description: 'Product specifications', icon: FileSpreadsheet, color: 'green' },
  { id: 'report', name: 'Reports', description: 'Analysis and reports', icon: ClipboardList, color: 'purple' },
  { id: 'documentation', name: 'Documentation', description: 'General documentation', icon: FileText, color: 'gray' },
  { id: 'research', name: 'Research', description: 'Research papers & studies', icon: File, color: 'orange' },
  { id: 'reference', name: 'Reference', description: 'Reference materials', icon: Folder, color: 'cyan' },
];

export default function EnhancedDocumentUpload({
  onUpload,
  stemId,
  defaultCategory = 'documentation',
  className = '',
  page = 'dashboard'
}: EnhancedDocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryData = documentCategories.find(cat => cat.id === selectedCategory);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      setIsOpen(true);
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
        documentType,
        stemId: stemId || 'SYSTEM'
      };

      await onUpload(selectedFiles, metadata);

      // Reset form
      setDescription('');
      setTags('');
      setLocation('');
      setDocumentType('');
      setSelectedFiles(null);
      setIsOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Document upload failed:', error);
      alert('Document upload failed. Please try again.');
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
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv,.json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <FileText className="w-4 h-4 mr-2" />
        Upload Documents
      </button>

      {/* Upload Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
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
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Selected Documents:</h3>
                  <div className="text-sm text-green-700">
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
                  Document Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {documentCategories.map((category) => {
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

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <input
                  type="text"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder="e.g., PDF, Excel, Manual, Specification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                  placeholder="Describe the document content..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  placeholder="e.g., manual, reference, v2.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  placeholder="e.g., Equipment cabinet, Office desk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFiles}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {selectedFiles?.length || 0} Document{(selectedFiles?.length || 0) !== 1 ? 's' : ''}
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