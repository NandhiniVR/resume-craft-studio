import React from 'react';
import { cn } from '@/utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, fallback, className, ...props }) => {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 items-center justify-center',
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt="Avatar"
          onError={() => setError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="font-outfit text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase select-none">
          {fallback.substring(0, 2)}
        </span>
      )}
    </div>
  );
};
