import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnalysisCreator } from '@/lib/types';

interface CurrentUserAvatarProps {
  user: AnalysisCreator;
}

export const UserAvatar = ({ user }: CurrentUserAvatarProps) => {
  const profileImage = user.avatar_url;
  const avatarColor = user.avatar_color;
  const username = (user.username as string) ?? '?';
  const initials = username
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase();

  return (
    <div className="flex items-center gap-x-2">
      <Avatar>
        {profileImage && <AvatarImage src={profileImage} alt={initials} />}
        <AvatarFallback
          style={{ backgroundColor: avatarColor }}
          className="text-white"
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <span>{username}</span>
    </div>
  );
};
