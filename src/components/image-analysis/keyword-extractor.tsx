import { Tag, Copy, ExternalLink } from 'lucide-react';

interface KeywordExtractorProps {
  copiedKey: string | null;
  keywords: string[];
  onPinterestSearch: (query: string) => void;
  onCopy: (key: string, value: string) => void;
}

const KeywordExtractor = ({
  copiedKey,
  keywords,
  onPinterestSearch,
  onCopy,
}: KeywordExtractorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Tag className="w-4 h-4 text-blue-500" />
        <span>Keywords</span>
        <button
          onClick={() =>
            onCopy(
              'keywords',
              keywords && keywords.length > 0 ? keywords.join(', ') : ''
            )
          }
          className="ml-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          title="Copy all keywords"
          type="button"
        >
          {copiedKey === 'keywords' ? (
            <span className="text-green-500 text-xs">&#10003;</span>
          ) : (
            <Copy className="w-3 h-3 text-gray-400" />
          )}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword: string, idx: number) => (
          <div key={idx} className="flex items-center gap-1">
            {/* Pinterest search (separate button) */}
            <button
              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 hover:bg-blue-500 hover:text-white transition-colors group/keyword cursor-pointer"
              onClick={() => onPinterestSearch(keyword)}
              type="button"
              title={`Search "${keyword}" on Pinterest`}
            >
              {keyword}
              <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-0 group-hover/keyword:opacity-100 transition-opacity" />
            </button>
            {/* Copy keyword - separate button */}
            <button
              onClick={() => onCopy(`keyword-${idx}`, keyword)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              title={`Copy "${keyword}"`}
              type="button"
            >
              {copiedKey === `keyword-${idx}` ? (
                <span className="text-green-500 text-xs">&#10003;</span>
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordExtractor;
