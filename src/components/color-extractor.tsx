import useColorThief from 'use-color-thief';

interface ColorExtractorProps {
  imageUrl: string;
}

const ColorExtractor = ({ imageUrl }: ColorExtractorProps) => {
  const { palette } = useColorThief(imageUrl, {
    format: 'hex',
    colorCount: 5,
    quality: 10,
  });

  return (
    <div className="flex items-center gap-2">
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
