import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useModalStore } from '@/stores/use-modal-store';

export default function SignUpButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  const { open } = useModalStore();

  return (
    <Button
      size="lg"
      className={cn(
        'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30',
        className
      )}
      onClick={() => open('auth', { initialMode: 'sign-up' })}
      {...props}
    >
      Sign Up
    </Button>
  );
}
