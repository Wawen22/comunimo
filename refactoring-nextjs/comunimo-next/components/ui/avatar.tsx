'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

/**
 * Simple Avatar component
 * Shows image if src is provided, otherwise shows fallback text
 */
export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  // Get initials from fallback text (first 2 characters)
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200',
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-medium text-white">
          {initials}
        </div>
      )}
    </div>
  );
}

