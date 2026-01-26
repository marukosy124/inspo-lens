import { Button } from '@/components/ui/button';

export default function SignUpButton(props: React.ComponentProps<'button'>) {
  return (
    <Button
      className="group relative overflow-hidden font-medium text-white shadow-md transition-shadow hover:shadow-lg"
      {...props}
    >
      <span className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500" />
      <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-blue-600 to-purple-600 transition-transform duration-300 ease-out group-hover:translate-x-0" />
      <span className="relative z-10">Sign Up</span>
    </Button>
  );
}
