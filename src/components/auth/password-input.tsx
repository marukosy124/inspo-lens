'use client';

import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useState,
  useImperativeHandle,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface PasswordInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  extraHeaderContent?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}

export interface PasswordInputRef {
  resetVisibility: () => void;
}

const PasswordInput = forwardRef<PasswordInputRef, PasswordInputProps>(
  (
    { label, extraHeaderContent, error, className, wrapperClassName, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Expose the reset method to the parent via ref
    useImperativeHandle(ref, () => ({
      resetVisibility: () => {
        setShowPassword(false);
      },
    }));

    const hasHeader = label || extraHeaderContent;

    return (
      <div className={cn('grid gap-2', wrapperClassName)}>
        {hasHeader && (
          <div className="flex items-center justify-between">
            {label && (
              <Label
                htmlFor={props.id}
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </Label>
            )}

            {extraHeaderContent && (
              <div className="ml-auto">{extraHeaderContent}</div>
            )}
          </div>
        )}

        <div className="relative">
          <Input
            {...props}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground focus:ring-ring absolute top-1/2 right-3 -translate-y-1/2 rounded-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
