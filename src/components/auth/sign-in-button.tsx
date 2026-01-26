import { Button } from '@/components/ui/button';

export default function SignInButton(props: React.ComponentProps<'button'>) {
  return (
    <Button
      variant="ghost"
      className="font-medium text-blue-600 transition-colors hover:bg-blue-50/50 hover:text-purple-600"
      {...props}
    >
      Sign In
    </Button>
  );
}
