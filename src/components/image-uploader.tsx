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
import { GetSignedUploadUrlResponse } from '@/app/api/storage/signed-upload-url/route';
import { GetUploadedUrlResponse } from '@/app/api/storage/uploaded-url/route';
import { toast } from 'sonner';

interface ImageUploaderProps {
  remainingImageCount: number;
  onImagesAdded: (newImages: ImageInfo[]) => void;
}

const ImageUploader = ({
  onImagesAdded,
  remainingImageCount,
}: ImageUploaderProps) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const getProxyUrl = (imageUrl: string) =>
    `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

  const getSignedUploadUrl = async (fileName: string) => {
    const params = new URLSearchParams({ filename: fileName, public: 'true' });
    const res = await fetch(`/api/storage/signed-upload-url?${params}`);
    if (!res.ok) {
      const errorText = await res.text();
      toast.error(`Failed to get upload URL: ${errorText}`);
      throw new Error(errorText);
    }
    return res.json() as Promise<GetSignedUploadUrlResponse>;
  };

  const getUploadedUrl = async (bucket: string, path: string) => {
    const params = new URLSearchParams({ bucket, path, public: 'true' });
    const res = await fetch(`/api/storage/uploaded-url?${params}`);
    if (!res.ok) {
      const errorText = await res.text();
      toast.error(`Failed to get final URL: ${errorText}`);
      throw new Error(errorText);
    }
    const data = await res.json();
    if (data.error) {
      toast.error(data.error);
      throw new Error(data.error);
    }
    return data as GetUploadedUrlResponse;
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);

      const { signedUrl, path, bucket } = await getSignedUploadUrl(file.name);

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        toast.error(`Upload failed: ${errorText}`);
        throw new Error(errorText);
      }

      return await getUploadedUrl(bucket, path);
    } catch (err) {
      console.error('Upload error:', err);
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const downloadAndUploadRemoteImage = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        toast.error(`Failed to fetch image: ${errorText}`);
        throw new Error(errorText);
      }

      const blob = await res.blob();
      const type = res.headers.get('content-type') || blob.type;
      const ext = getImageExtensionFromMime(type);
      const fileName = `remote-${generateId()}.${ext}`;
      const file = new File([blob], fileName, { type });

      return await uploadFile(file);
    } catch (err) {
      console.error('Remote upload error:', err);
      return undefined;
    }
  };

  const validateUrl = (raw: string) => {
    const val = raw.trim();
    if (!val) return { valid: false, url: '', error: null };
    if (val.includes('\n'))
      return { valid: false, url: val, error: 'One URL only' };
    if (!/^https?:\/\//i.test(val))
      return { valid: false, url: val, error: 'Must start with http/https' };
    if (!isValidUrl(val))
      return { valid: false, url: val, error: 'Invalid URL' };
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
      const data = await downloadAndUploadRemoteImage(url);
      if (!data?.url) {
        toast.error('No URL returned from upload');
        throw new Error('No URL returned');
      }

      onImagesAdded([
        {
          id: generateId(),
          imageUrl: data.url,
          proxyUrl: getProxyUrl(data.url),
          bucket: data.bucket,
          path: data.path,
        },
      ]);

      setUrlInput('');
    } catch {
      setInputError('Failed to process URL');
    } finally {
      setIsUploading(false);
    }
  }, [urlInput, onImagesAdded, downloadAndUploadRemoteImage]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      const newImages = await Promise.all(
        files.map(async (file) => {
          const data = await uploadFile(file);
          if (!data?.url) {
            toast.error('Upload failed for dropped file');
            throw new Error('Upload failed');
          }
          return {
            id: generateId(),
            imageUrl: data.url,
            proxyUrl: getProxyUrl(data.url),
            bucket: data.bucket,
            path: data.path,
          };
        })
      );

      onImagesAdded(newImages);
    },
    [onImagesAdded, uploadFile]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newImages = await Promise.all(
        files.map(async (file) => {
          const data = await uploadFile(file);
          if (!data?.url) {
            toast.error('Upload failed for selected file');
            throw new Error('Upload failed');
          }
          return {
            id: generateId(),
            imageUrl: data.url,
            proxyUrl: getProxyUrl(data.url),
            bucket: data.bucket,
            path: data.path,
          };
        })
      );

      onImagesAdded(newImages);
    },
    [onImagesAdded, uploadFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlInput(value);
    const { valid, error } = validateUrl(value);
    setInputError(value.trim() && !valid ? error : null);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && urlInput.trim()) {
      e.preventDefault();
      handleUrlSubmit();
    }
  };

  const { valid: urlValid } = validateUrl(urlInput);
  const disableAddButton =
    !urlInput.trim() || !urlValid || remainingImageCount === 0 || isUploading;

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed p-12 transition-all duration-300',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-blue-400',
          remainingImageCount === 0 && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0"
          disabled={remainingImageCount === 0}
        />

        <div className="pointer-events-none flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500 shadow-lg">
            {isUploading ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
            ) : (
              <Upload className="h-8 w-8 text-white" />
            )}
          </div>
          <h3 className="text-lg font-semibold">
            {isUploading
              ? 'Uploading...'
              : remainingImageCount === 0
                ? 'Limit reached'
                : 'Drop images here'}
          </h3>
          {!isUploading && remainingImageCount > 0 && (
            <p className="text-sm text-gray-500">or click to browse</p>
          )}
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="grow border-t border-gray-300" />
        <span className="mx-4 text-sm text-gray-500 uppercase">Or</span>
        <div className="grow border-t border-gray-300" />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Paste image URL"
            value={urlInput}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            className={cn(
              'pr-3 pl-10',
              inputError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : ''
            )}
            disabled={remainingImageCount === 0 || isUploading}
          />
          {inputError && (
            <p className="mt-1 text-xs text-red-500">{inputError}</p>
          )}
        </div>

        <Button onClick={handleUrlSubmit} disabled={disableAddButton}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader;
