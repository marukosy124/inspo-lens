'use client';

import useColorThief from 'use-color-thief';
import Image from 'next/image';

interface ColorExtractorProps {
  imageUrl: string;
}

const ColorExtractor = ({ imageUrl }: ColorExtractorProps) => {
  const imageProxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;

  const { palette } = useColorThief(imageProxyUrl, {
    format: 'hex',
    colorCount: 5,
    quality: 10,
  });

  return (
    <div className="flex items-center gap-2">
      <Image
        src={imageProxyUrl}
        alt="image"
        width={0}
        height={0}
        sizes="500px"
        className="w-full h-auto"
        priority
      />
      <div className="space-y-2">
        {palette
          .filter((hex) => typeof hex === 'string')
          .map((hex) => (
            <div className="flex items-center gap-2" key={hex}>
              <div
                className="w-10 h-10 rounded-sm"
                style={{ backgroundColor: hex }}
              ></div>
              {hex}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ColorExtractor;
