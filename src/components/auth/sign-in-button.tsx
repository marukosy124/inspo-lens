import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/common';
import { useModalStore } from '@/stores';

export default function SignInButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  const { open } = useModalStore();

  return (
    <Button
      size="lg"
      variant="outline"
      className={cn(
        'border-stone-200 backdrop-blur-sm transition-all duration-300 hover:border-stone-300 hover:bg-stone-50/50',
        className
      )}
      onClick={() => open('auth', { initialMode: 'sign-in' })}
      {...props}
    >
      Sign In
    </Button>
  );
}
