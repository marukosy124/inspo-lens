'use client';

import { useCallback, useState } from 'react';
import { Upload, LinkIcon, Loader2 } from 'lucide-react';
import { PutBlobResult } from '@vercel/blob';
import { cn, generateId } from '@/lib/utils';
import { ImageInfo } from '@/lib/types';

interface ImageUploaderProps {
  remainingImageCount: number;
  onImagesAdded: (newImages: ImageInfo[]) => void;
}

const ImageUploader = ({
  onImagesAdded,
  remainingImageCount,
}: ImageUploaderProps) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const getProxyUrl = (imageUrl: string) => {
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      const response = await fetch(`/api/upload-image?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const newBlob = (await response.json()) as PutBlobResult;

      return newBlob.url;
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;

    const urls = urlInput.split('\n').filter((url) => url.trim());
    const images = urls.map((url) => {
      const trimmedUrl = url.trim();
      return {
        id: generateId(),
        imageUrl: trimmedUrl ?? null,
        proxyUrl: trimmedUrl ? getProxyUrl(trimmedUrl) : null,
      };
    });

    onImagesAdded(images);
    setUrlInput('');
  }, [urlInput, onImagesAdded]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      const newImages = await Promise.all(
        files.map(async (file) => {
          const uploadedUrl = await uploadImage(file);
          return {
            id: generateId(),
            imageUrl: uploadedUrl ?? null,
            proxyUrl: uploadedUrl ? getProxyUrl(uploadedUrl) : null,
            // file,
          };
        })
      );

      onImagesAdded(newImages);
    },
    [onImagesAdded]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newImages = await Promise.all(
        files.map(async (file) => {
          const uploadedUrl = await uploadImage(file);
          return {
            id: generateId(),
            imageUrl: uploadedUrl ?? null,
            proxyUrl: uploadedUrl ? getProxyUrl(uploadedUrl) : null,
            // file,
          };
        })
      );

      onImagesAdded(newImages);
    },
    [onImagesAdded]
  );

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      {/* <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex gap-3">
        <div className="text-xs text-green-700">
          <p className="font-semibold mb-1">Privacy & Security</p>
          <p>
            Your images are analyzed locally and automatically deleted after 7
            days. We never store or share your data.
          </p>
        </div>
      </div> */}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-12 transition-all duration-300',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-400'
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={remainingImageCount === 0}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {isUploading ? 'Uploading...' : 'Drop images here'}
            </h3>
            {!isUploading && (
              <p className="text-sm text-gray-500">
                or click to browse your files
              </p>
            )}
            {/* {remainingImageCount !== null && (
              <p className="text-xs text-blue-600 mt-2">
                {remainingImageCount} images remaining today
              </p>
            )} */}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-50 px-2 text-gray-500">Or</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Paste image URL(s), one per line..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) =>
                e.key === 'Enter' && e.metaKey && handleUrlSubmit()
              }
              disabled={remainingImageCount === 0}
            />
          </div>
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim() || remainingImageCount === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add URL
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Tip: You can paste multiple URLs, one per line
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
