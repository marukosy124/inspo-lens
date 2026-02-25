import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  id: string;
  copied: string | null;
  onCopy: () => void;
}

export const CopyButton = ({ id, copied, onCopy }: CopyButtonProps) => (
  <button
    onClick={onCopy}
    className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1 rounded-full px-2 py-2 transition-colors"
  >
    {id === copied ? (
      <Check className="text-accent-emerald h-3.5 w-3.5" strokeWidth={2.5} />
    ) : (
      <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
    )}
  </button>
);
