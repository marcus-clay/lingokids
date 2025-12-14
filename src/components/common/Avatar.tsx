import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import type { AvatarCustomization } from '../../types';

interface AvatarProps {
  name: string;
  customization?: AvatarCustomization;
  fallbackColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  customization,
  fallbackColor = 'bg-blue-500',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const avatarSvg = useMemo(() => {
    if (!customization?.skinTone) {
      return null;
    }

    try {
      const avatar = createAvatar(adventurer, {
        seed: name,
        skinColor: [customization.skinTone],
        hairColor: [customization.hairColor],
        hair: customization.hairStyle ? [customization.hairStyle] as any : undefined,
        eyes: customization.eyes ? [customization.eyes] as any : undefined,
        mouth: customization.mouth ? [customization.mouth] as any : undefined,
        eyebrows: customization.eyebrows ? [customization.eyebrows] as any : undefined,
        backgroundColor: ['transparent'],
      });
      return avatar.toDataUri();
    } catch (error) {
      console.error('Error generating avatar:', error);
      return null;
    }
  }, [name, customization]);

  // Fallback to letter avatar if no customization
  if (!avatarSvg) {
    return (
      <div
        className={`${sizeClasses[size]} ${fallbackColor} rounded-full flex items-center justify-center text-white font-bold ${className}`}
      >
        {name[0]?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 ${className}`}
    >
      <img
        src={avatarSvg}
        alt={`Avatar de ${name}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
