import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function capitalize(str: string) {
  if (!str || typeof str !== 'string') return null;

  return str
    .trim() // Remove extra whitespace
    .toLowerCase() // Normalize to lowercase first
    .replace(/[_]/g, ' ') // Replace hyphens/underscores with spaces
    .split(' ') // Split into words
    .map((word) => {
      if (word.length === 0) return '';
      // Capitalize first letter, keep rest lowercase
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function getImageExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  };
  return map[mime] || 'jpg';
}

export function isValidUrl(url: string): boolean {
  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      !!parsed.hostname
    );
  } catch {
    return false;
  }
}
