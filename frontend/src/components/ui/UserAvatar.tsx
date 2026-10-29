'use client';

import { useState } from 'react';
import { initialsOf } from '@/utils/format';

type UserAvatarProps = {
  src: string | null;
  name: string;
  className: string;
  fallbackClassName?: string;
};

export function UserAvatar({ src, name, className, fallbackClassName = '' }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${className} ${showImage ? '' : fallbackClassName}`}
      aria-hidden
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
