'use client';

import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
}

export function ImageUploader({ onImageSelected, isLoading = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="w-full">
      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              onClick={() => document.getElementById('file-input')?.click()}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              Choose Another Image
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-12 h-12 text-green-600 mb-2" />
            <p className="text-lg font-semibold text-gray-700 mb-1">
              Drag and drop your image here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              disabled={isLoading}
            />
            <span className="text-xs text-gray-400">
              PNG, JPG up to 10MB
            </span>
          </label>
        )}
      </Card>

      {error && (
        <div className="mt-4 flex items-gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 ml-2">{error}</p>
        </div>
      )}
    </div>
  );
}
