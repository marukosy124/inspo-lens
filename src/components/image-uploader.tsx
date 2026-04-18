'use client';

import { useCallback, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { ImageInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GetSignedUploadUrlResponse } from '@/app/api/storage/signed-upload-url/route';
import { GetUploadedUrlResponse } from '@/app/api/storage/uploaded-url/route';
import { toast } from 'sonner';
import {
  getImageExtensionFromMime,
  generateId,
  isValidUrl,
  cn,
} from '@/lib/utils/common';

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
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingUrl, setIsUploadingUrl] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const getProxyUrl = useCallback(
    (imageUrl: string) =>
      `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`,
    []
  );

  const getSignedUploadUrl = useCallback(async (fileName: string) => {
    const params = new URLSearchParams({ filename: fileName, public: 'true' });
    const res = await fetch(`/api/storage/signed-upload-url?${params}`);
    if (!res.ok) {
      const errorText = await res.text();
      toast.error(`Failed to get upload URL: ${errorText}`);
      throw new Error(errorText);
    }
    return res.json() as Promise<GetSignedUploadUrlResponse>;
  }, []);

  const getUploadedUrl = useCallback(async (bucket: string, path: string) => {
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
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        const { signedUrl, path, bucket } = await getSignedUploadUrl(file.name);

        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          toast.error(`Failed to upload: ${errorText}`);
          throw new Error(errorText);
        }

        return await getUploadedUrl(bucket, path);
      } catch (err) {
        console.error('Failed to upload: ', (err as Error)?.message);
        return undefined;
      }
    },
    [getSignedUploadUrl, getUploadedUrl]
  );

  const downloadAndUploadRemoteImage = useCallback(
    async (url: string) => {
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
    },
    [uploadFile]
  );

  const validateUrl = useCallback((raw: string) => {
    const val = raw.trim();
    if (!val) return { valid: false, url: '', error: null };
    if (val.includes('\n'))
      return { valid: false, url: val, error: 'One URL only' };
    if (!/^https?:\/\//i.test(val))
      return { valid: false, url: val, error: 'Must start with http/https' };
    if (!isValidUrl(val))
      return { valid: false, url: val, error: 'Invalid URL' };
    return { valid: true, url: val, error: null };
  }, []);

  const handleUrlSubmit = useCallback(async () => {
    const { valid, url, error } = validateUrl(urlInput);
    if (!valid) {
      setInputError(error || 'Invalid URL');
      return;
    }

    setInputError(null);
    setIsUploadingUrl(true);

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
      setIsUploadingUrl(false);
    }
  }, [
    urlInput,
    onImagesAdded,
    downloadAndUploadRemoteImage,
    validateUrl,
    getProxyUrl,
  ]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );

      setIsUploadingFile(true);

      try {
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
      } finally {
        setIsUploadingFile(false);
      }
    },
    [onImagesAdded, uploadFile, getProxyUrl]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      setIsUploadingFile(true);

      try {
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
      } finally {
        setIsUploadingFile(false);
      }
    },
    [onImagesAdded, uploadFile, getProxyUrl]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUrlInput(value);
      const { valid, error } = validateUrl(value);
      setInputError(value.trim() && !valid ? error : null);
    },
    [validateUrl]
  );

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && urlInput.trim()) {
        e.preventDefault();
        handleUrlSubmit();
      }
    },
    [urlInput, handleUrlSubmit]
  );

  const { valid: urlValid } = validateUrl(urlInput);
  const disableAddButton =
    !urlInput.trim() ||
    !urlValid ||
    remainingImageCount === 0 ||
    isUploadingUrl;

  return (
    <div className="space-y-8">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'group relative cursor-pointer rounded-3xl border-2 border-dashed p-16 transition-all duration-300',
          isDragging
            ? 'border-blue-400 bg-linear-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-500/10'
            : 'border-stone-300/60 bg-linear-to-br from-white to-stone-50/30 hover:border-blue-300 hover:shadow-md',
          remainingImageCount === 0 && 'cursor-not-allowed opacity-60'
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={remainingImageCount === 0 || isUploadingFile}
        />

        <div className="pointer-events-none flex flex-col items-center justify-center space-y-5 text-center">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300',
              isDragging
                ? 'scale-110'
                : isUploadingFile
                  ? 'bg-blue-100'
                  : 'bg-blue-100 group-hover:scale-105'
            )}
          >
            {isUploadingFile ? (
              <Loader2
                className="h-9 w-9 animate-spin text-blue-600"
                strokeWidth={2.5}
              />
            ) : (
              <Upload
                className={cn(
                  'h-9 w-9',
                  isDragging ? 'text-blue-400' : 'text-blue-600'
                )}
                strokeWidth={2.5}
              />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-stone-900">
              {isUploadingFile
                ? 'Uploading...'
                : remainingImageCount === 0
                  ? 'Daily limit reached'
                  : 'Drop your images here'}
            </h3>
            {!isUploadingFile && remainingImageCount > 0 && (
              <p className="text-sm font-light text-stone-500">
                or click anywhere to browse your files
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="grow border-t border-stone-200" />
        <span className="mx-5 text-xs font-medium tracking-wider text-stone-400 uppercase">
          Or paste a link
        </span>
        <div className="grow border-t border-stone-200" />
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            className={cn(
              'h-12 border-stone-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-200',
              'focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20',
              'placeholder:text-stone-400',
              inputError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                : ''
            )}
            disabled={remainingImageCount === 0 || isUploadingUrl}
          />
          {inputError && (
            <p className="mt-2 text-xs font-medium text-red-600">
              {inputError}
            </p>
          )}
        </div>

        <Button
          onClick={handleUrlSubmit}
          disabled={disableAddButton}
          className="h-12 px-6 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          {isUploadingUrl ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader;
