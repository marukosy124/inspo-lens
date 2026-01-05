import quantize from 'quantize';

export interface ExtractedColor {
  hex: string;
  percentage: number; // 0–1 (e.g., 0.35 = 35%)
  rgb: { r: number; g: number; b: number };
  hsl: {
    h: number; // 0–360
    s: number; // 0–100
    l: number; // 0–100
  };
  isDark: boolean; // true if perceived brightness is low
}

export async function extractColors(
  imageUrl: string,
  colorCount: number = 10, // not controling exactly how many colors to return, it's only a max
  quality: number = 10 // Use 1 for max accuracy (slower), 10 for speed
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context not available');

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const pixelCount = canvas.width * canvas.height;

        // Sample pixels (exact Color Thief logic)
        const pixelArray: [number, number, number][] = [];
        for (let i = 0; i < pixelCount; i += quality) {
          const offset = i * 4;
          const r = pixels[offset + 0];
          const g = pixels[offset + 1];
          const b = pixels[offset + 2];
          const a = pixels[offset + 3];

          if ((a ?? 255) >= 125 && !(r > 250 && g > 250 && b > 250)) {
            pixelArray.push([r, g, b]);
          }
        }

        if (pixelArray.length === 0) {
          reject(new Error('No valid pixels found'));
          return;
        }

        const cmap = quantize(pixelArray, colorCount);
        if (!cmap) {
          reject(new Error('Quantization failed'));
          return;
        }

        const palette = cmap.palette(); // [[r,g,b], ...]

        // Map each sampled pixel to nearest palette color and count
        const colorCounts = new Map<string, number>();
        palette.forEach((rgb) => {
          colorCounts.set(rgb.join(','), 0);
        });

        pixelArray.forEach((pixel) => {
          const nearest = cmap.nearest(pixel); // Finds closest palette color
          const key = nearest.join(',');
          colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
        });

        const colors: ExtractedColor[] = palette.map((rgb) => {
          const hex = rgbToHex(rgb);
          const count = colorCounts.get(rgb.join(',')) || 0;
          const percentage = count / pixelArray.length;

          const hsl = rgbToHsl(rgb);
          const luminance =
            (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

          return {
            hex,
            percentage,
            rgb: { r: rgb[0], g: rgb[1], b: rgb[2] },
            hsl: {
              h: Math.round(hsl[0]),
              s: Math.round(hsl[1] * 100),
              l: Math.round(hsl[2] * 100),
            },
            isDark: luminance < 0.5,
          };
        });

        // Sort most dominant → least (based on actual counts)
        colors.sort((a, b) => b.percentage - a.percentage);

        resolve(colors);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
  });
}

// Helpers unchanged
function rgbToHex([r, g, b]: number[]): string {
  return (
    '#' +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

function rgbToHsl([r, g, b]: number[]): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}
