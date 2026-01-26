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
import { useRouter } from 'next/navigation';

interface CurrentUserAvatarProps {
  user: CompleteUser;
}

export const CurrentUserAvatar = ({ user }: CurrentUserAvatarProps) => {
  const profileImage = user.user_metadata.avatar_url;
  const avatarColor = user.avatar_color;
  const name = user.email ?? '?';
  const initials = name
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase();

  const router = useRouter();

  const logout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/');
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
        {/* TODO */}
        {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
