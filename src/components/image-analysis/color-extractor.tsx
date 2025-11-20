import { ExternalLink, Copy, Palette } from 'lucide-react';
import useColorThief from 'use-color-thief';

interface ColorExtractorProps {
  imageUrl: string;
  copiedKey: string | null;
  onPinterestSearch: (value: string) => void;
  onCopy: (key: string, value: string) => void;
}

const ColorExtractor = ({
  imageUrl,
  copiedKey,
  onPinterestSearch,
  onCopy,
}: ColorExtractorProps) => {
  const { palette } = useColorThief(imageUrl, {
    format: 'hex',
    colorCount: 5,
    quality: 10,
  });

  // Compose all colors as string for "copy all"
  const allColors =
    palette && palette.length > 0
      ? palette.filter((hex) => typeof hex === 'string').join(', ')
      : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Palette className="w-4 h-4 text-blue-500" />
        <span>Colors</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          {palette
            .filter((hex) => typeof hex === 'string')
            .map((hex) => (
              <div key={hex} className="flex items-center gap-1">
                <button
                  onClick={() => onPinterestSearch(hex)}
                  className="group/color flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Search on Pinterest"
                  type="button"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs font-medium">{hex}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover/color:opacity-100 transition-opacity" />
                </button>
                {/* Copy color button */}
                <button
                  onClick={() => onCopy(`color-${hex}`, hex)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  title={`Copy ${hex}`}
                  type="button"
                >
                  {copiedKey === `color-${hex}` ? (
                    <span className="text-green-500 text-xs">&#10003;</span>
                  ) : (
                    <Copy className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          {allColors && (
            <button
              onClick={() => onCopy('colors', allColors)}
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              title="Copy all colors"
              type="button"
            >
              {copiedKey === 'colors' ? (
                <span className="text-green-500 text-xs">&#10003;</span>
              ) : (
                <Copy className="w-4 h-4 text-gray-900" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorExtractor;
