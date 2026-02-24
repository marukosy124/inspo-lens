'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabaseClient } from '@/lib/supabase/client';
import { CompleteUser } from '@/lib/types';
import { BookmarkIcon, ImagesIcon, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CurrentUserAvatarProps {
  user: CompleteUser;
}

export const CurrentUserAvatar = ({ user }: CurrentUserAvatarProps) => {
  const profileImage = user.user_metadata?.avatar_url;
  const avatarColor = user.avatar_color;
  const name = user.username ?? '?';
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase();

  const router = useRouter();

  const handleLogout = () => {
    // Optimistic local clear
    supabaseClient.auth
      .signOut({ scope: 'local' })
      .catch((err) => console.error(err));

    // Non-blocking server sign-out
    supabaseClient.auth
      .signOut()
      .then(() => {
        toast.success('Logged out');
        router.push('/');
        router.refresh();
      })
      .catch((err) => {
        toast.error('Failed to logout, please try again.');
        console.error(err);
        router.push('/');
      });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          {profileImage && <AvatarImage src={profileImage} alt={initials} />}
          <AvatarFallback
            style={{ backgroundColor: avatarColor }}
            className="text-white"
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-4">
        <DropdownMenuItem onClick={() => router.push('/my-analyses')}>
          <ImagesIcon />
          My Analyses
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/saved')}>
          <BookmarkIcon />
          Saved
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
