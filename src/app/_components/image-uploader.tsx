'use client';

import { useCallback, useState } from 'react';
import { Upload, LinkIcon, Loader2 } from 'lucide-react';
import {
  cn,
  generateId,
  getImageExtensionFromMime,
  isValidUrl,
} from '@/lib/utils';
import { ImageInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [inputError, setInputError] = useState<string | null>(null);

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
      const newBlob = await response.json();
      return newBlob.url;
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadAndUploadRemoteImage = async (
    url: string
  ): Promise<string | undefined> => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch remote image');
      const blob = await res.blob();
      const contentType = res.headers.get('content-type') || blob.type;
      const ext = getImageExtensionFromMime(contentType);
      const fileName = `remote-${generateId()}.${ext}`;
      const file = new File([blob], fileName, { type: blob.type });

      const uploadedUrl = await uploadImage(file);
      return uploadedUrl;
    } catch (err) {
      console.error('Remote image error:', err);
      return undefined;
    }
  };

  // Validate only accepts one url, must start with http/https
  const validateUrl = (raw: string) => {
    const val = raw.trim();
    if (!val) {
      return { valid: false, url: '', error: null };
    }

    // Allow only a single URL (no line breaks)
    if (val.includes('\n')) {
      return {
        valid: false,
        url: val,
        error: 'Please enter only one URL at a time.',
      };
    }

    // Only valid if starts with http or https and has a valid format
    if (!/^https?:\/\//i.test(val)) {
      return {
        valid: false,
        url: val,
        error: 'Only http:// or https:// image URLs are supported.',
      };
    }

    if (!isValidUrl(val)) {
      return {
        valid: false,
        url: val,
        error: 'Invalid URL provided.',
      };
    }

    return { valid: true, url: val, error: null };
  };

  const handleUrlSubmit = useCallback(async () => {
    const { valid, url, error } = validateUrl(urlInput);
    if (!valid) {
      setInputError(error || 'Invalid URL');
      return;
    }

    setInputError(null);
    setIsUploading(true);

    try {
      const uploadedUrl = await downloadAndUploadRemoteImage(url);
      if (!uploadedUrl) throw new Error('Failed to process URL image');

      const images = [
        {
          id: generateId(),
          imageUrl: uploadedUrl,
          proxyUrl: getProxyUrl(uploadedUrl),
        },
      ];

      onImagesAdded(images);
      setUrlInput('');
    } catch (err) {
      setInputError('Failed to process URL image');
    } finally {
      setIsUploading(false);
    }
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
          };
        })
      );

      onImagesAdded(newImages);
    },
    [onImagesAdded]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    const result = validateUrl(e.target.value);
    setInputError(!e.target.value.trim() || result.valid ? null : result.error);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter (either press just Enter or ctrl/cmd+Enter)
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      urlInput.trim()
    ) {
      e.preventDefault();
      handleUrlSubmit();
    }
    // (Optionally allow Cmd+Enter for legacy)
    if (e.key === 'Enter' && e.metaKey && urlInput.trim()) {
      e.preventDefault();
      handleUrlSubmit();
    }
  };

  // Determine if any validation errors exist for current input
  const urlCheck = validateUrl(urlInput);
  const disableAddButton =
    !urlInput.trim() || !urlCheck.valid || remainingImageCount === 0;

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
          'relative rounded-xl border-2 border-dashed p-12 transition-all duration-300',
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
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={remainingImageCount === 0}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 shadow-lg">
            {isUploading ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
            ) : (
              <Upload className="h-8 w-8 text-white" />
            )}
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold">
              {isUploading ? 'Uploading...' : 'Drop images here'}
            </h3>
            {!isUploading && (
              <p className="text-sm text-gray-500">
                or click to browse your files
              </p>
            )}
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
          <div className="relative flex-1">
            <LinkIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Paste image URL"
              value={urlInput}
              onChange={onInputChange}
              className={`w-full rounded-lg border py-2 pr-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                inputError
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-gray-300'
              }`}
              onKeyDown={onInputKeyDown}
              disabled={remainingImageCount === 0}
            />
            {inputError && (
              <div className="absolute right-0 left-0 mt-1 text-xs text-red-500">
                {inputError}
              </div>
            )}
          </div>
          <Button onClick={handleUrlSubmit} disabled={disableAddButton}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
