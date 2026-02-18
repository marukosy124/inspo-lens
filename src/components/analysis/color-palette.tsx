import { Check, Copy } from 'lucide-react';
import { Color } from '@/lib/types';
import { motion } from 'motion/react';
import { CopyButton } from '@/components/copy-button';

interface ColorPaletteProps {
  colors: Color[];
  copied: string | null;
  onCopy: (key: string, value: string) => void;
}

export const ColorPalette = ({ colors, copied, onCopy }: ColorPaletteProps) => {
  const allColorsString = colors.map((c) => `${c.hex} ${c.name}`).join(', ');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold tracking-tight uppercase opacity-60">
          Color Palette
        </h3>
        {colors.length > 0 && (
          <CopyButton
            id="allColors"
            copied={copied}
            onCopy={() => onCopy('allColors', allColorsString)}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color, idx) => {
          const id = `color-${color.hex}`;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCopy(id, `${color.hex} ${color.name}`)}
              className="group/color flex flex-col items-center gap-1.5"
            >
              <div className="relative">
                <div
                  className="ring-border/60 h-12 w-12 rounded-full shadow-sm ring-1 transition-shadow group-hover/color:shadow-md"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="bg-card ring-border absolute -top-0.5 -right-0.5 rounded-full p-1 opacity-0 ring-1 transition-opacity group-hover/color:opacity-100">
                  {copied === id ? (
                    <Check className="text-accent-emerald h-2.5 w-2.5" />
                  ) : (
                    <Copy className="text-muted-foreground h-2.5 w-2.5" />
                  )}
                </span>
              </div>
              <div className="max-w-[60px] text-center">
                <div className="text-foreground/80 font-mono text-xs font-medium">
                  {color.hex}
                </div>
                <div className="text-muted-foreground text-[11px] leading-tight wrap-break-word">
                  {color.name}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
