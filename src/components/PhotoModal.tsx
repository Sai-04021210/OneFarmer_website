'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  stemId: string;
  filename: string;
  originalName: string;
  uploadDate: string;
  size: number;
  url: string;
}

interface PhotoModalProps {
  photos: Photo[];
  currentPhotoIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
}

export default function PhotoModal({
  photos,
  currentPhotoIndex,
  isOpen,
  onClose,
  onDelete
}: PhotoModalProps) {
  const [currentIndex, setCurrentIndex] = useState(currentPhotoIndex);

  // All hooks must be at the top, before any conditional logic
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : photos.length - 1
    );
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex < photos.length - 1 ? prevIndex + 1 : 0
    );
  }, [photos.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [goToPrevious, goToNext, onClose]);

  // Add keyboard event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Early return after all hooks
  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = currentPhoto.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this photo?')) {
      onDelete(currentPhoto.id);
      if (photos.length > 1) {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-6xl max-h-screen w-full mx-4">
        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white hover:bg-opacity-75 rounded-full transition-all"
              title="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white hover:bg-opacity-75 rounded-full transition-all"
              title="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">
              {currentPhoto.originalName}
            </h3>
            <p className="text-sm text-gray-500">
              Stem {currentPhoto.stemId} • {new Date(currentPhoto.uploadDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            {onDelete ? (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-2 text-gray-300 rounded-lg cursor-not-allowed" title="Protected">
                <Trash2 className="w-5 h-5" />
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.originalName}
            className="max-w-full max-h-[70vh] object-contain"
          />

        </div>

        {/* Footer */}
        {photos.length > 1 && (
          <div className="p-4 border-t text-center text-sm text-gray-600">
            {currentIndex + 1} of {photos.length} photos
          </div>
        )}
        </div>
      </div>
    </div>
  );
}