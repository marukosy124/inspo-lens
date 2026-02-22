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
import { BookmarkIcon, LogOutIcon } from 'lucide-react';
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

  const handleLogout = async () => {
    try {
      await supabaseClient.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong during logout');
    }
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
