'use client';

import { useState } from 'react';
import {
  Upload, Link, X, Tag, MapPin, ExternalLink, BookOpen,
  Wrench, FileText, Globe, GraduationCap
} from 'lucide-react';

interface LinkMetadata {
  title: string;
  url: string;
  category: string;
  description?: string;
  tags?: string;
  location?: string;
  stemId?: string;
}

interface EnhancedLinkUploadProps {
  onUpload: (metadata: LinkMetadata) => Promise<void>;
  stemId?: string;
  defaultCategory?: string;
  className?: string;
  page?: string;
}

const linkCategories = [
  { id: 'tutorial', name: 'Tutorial', description: 'How-to guides and tutorials', icon: GraduationCap, color: 'blue' },
  { id: 'research', name: 'Research', description: 'Research papers and studies', icon: BookOpen, color: 'green' },
  { id: 'documentation', name: 'Documentation', description: 'Technical documentation', icon: FileText, color: 'gray' },
  { id: 'tools', name: 'Tools', description: 'Useful tools and calculators', icon: Wrench, color: 'orange' },
  { id: 'suppliers', name: 'Suppliers', description: 'Equipment and supply vendors', icon: Globe, color: 'purple' },
  { id: 'guides', name: 'Guides', description: 'Complete growing guides', icon: ExternalLink, color: 'teal' },
  { id: 'other', name: 'Other', description: 'Other useful resources', icon: Link, color: 'indigo' },
];

export default function EnhancedLinkUpload({
  onUpload,
  stemId,
  defaultCategory = 'tutorial',
  className = '',
  page = 'dashboard'
}: EnhancedLinkUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setTags('');
    setLocation('');
    setSelectedCategory(defaultCategory);
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleUpload = async () => {
    if (!title.trim() || !url.trim()) return;

    setIsUploading(true);
    try {
      const metadata = {
        title: title.trim(),
        url: url.trim(),
        category: selectedCategory,
        description: description.trim() || undefined,
        tags: tags.trim() || undefined,
        location: location.trim() || undefined,
        stemId: stemId || 'ROSE_PLANT'
      };

      await onUpload(metadata);
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to add link. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedCategoryInfo = linkCategories.find(cat => cat.id === selectedCategory);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${className}`}
      >
        <Link className="w-4 h-4 mr-2" />
        Add Links
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add Resource Link</h2>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Link Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for the link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {linkCategories.map((category) => {
                    const IconComponent = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this resource provides..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="hydroponic, nutrients, pH (comma-separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              {/* Location/Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source/Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="YouTube, University website, Blog, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Preview */}
              {title && url && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="flex items-start space-x-3">
                    {selectedCategoryInfo && (
                      <div className={`w-8 h-8 bg-${selectedCategoryInfo.color}-500 rounded flex items-center justify-center flex-shrink-0`}>
                        <selectedCategoryInfo.icon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">{title}</h5>
                      <p className="text-sm text-gray-600 truncate">{url}</p>
                      {description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !title.trim() || !url.trim()}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Link...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Add Link
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
    </>
  );
}