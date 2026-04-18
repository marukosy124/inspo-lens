import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnalysisCreator } from '@/lib/types';
import { cn } from '@/lib/utils/common';

interface UserAvatarProps {
  user: AnalysisCreator;
  size?: 'small' | 'medium';
  className?: string;
}

export const UserAvatar = ({
  user,
  size = 'medium',
  className,
}: UserAvatarProps) => {
  const profileImage = user.avatar_url;
  const avatarColor = user.avatar_color;
  const username = (user.username as string) ?? '?';
  const initials = username
    ?.split(' ')
    ?.map((word) => word[0])
    ?.join('')
    ?.toUpperCase();

  const sizeClasses =
    size === 'medium'
      ? { avatar: 'w-8 h-8', text: 'text-sm' }
      : { avatar: 'h-6 w-6', text: 'text-xs' };

  return (
    <div className={cn('flex items-center gap-x-2', className)}>
      <Avatar className={sizeClasses.avatar}>
        {profileImage && (
          <AvatarImage
            src={profileImage}
            alt={initials}
            className={sizeClasses.avatar}
          />
        )}
        <AvatarFallback
          style={{ backgroundColor: avatarColor }}
          className={`text-white ${sizeClasses.avatar} ${sizeClasses.text}`}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className={sizeClasses.text}>{username}</span>
    </div>
  );
};
