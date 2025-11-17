'use client';

import { useRef, useState } from 'react';
import { Upload, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PutBlobResult } from '@vercel/blob';

interface ImageUploaderProps {
  onImageSelect?: (imageUrl: string) => void;
}

const ImageUploader = ({ onImageSelect }: ImageUploaderProps) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = () => {
    const trimmedUrl = urlInput.trim();
    if (trimmedUrl) {
      onImageSelect?.(trimmedUrl);
      setUrlInput('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const response = await fetch(`/api/upload-image?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const newBlob = (await response.json()) as PutBlobResult;

      onImageSelect?.(newBlob.url);
      inputFileRef.current && (inputFileRef.current.value = '');
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400'
        }`}
      >
        <Upload className="w-8 h-8 text-blue-500 mb-2" />
        <span className="text-sm font-medium text-slate-600">
          Drag & drop or click to upload
        </span>
        <span className="text-xs text-slate-500">PNG, JPG, WebP</span>
        <input
          name="file"
          ref={inputFileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={() =>
            inputFileRef.current?.files?.length &&
            uploadFile(inputFileRef.current?.files[0])
          }
        />
      </label>

      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          Or paste image URL
        </label>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            className="flex-1"
          />
          <Button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            variant="outline"
            size="sm"
          >
            Load
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
