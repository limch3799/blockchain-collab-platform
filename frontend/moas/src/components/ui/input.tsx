import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 기본 스타일
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 rounded-2xl border border-gray-300 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',

        // focus 시 moas-main 색상 + 테두리 조금 굵게
        'focus:border-2 focus:border-moas-main focus:ring-0',

        // aria-invalid 시 (오류 시)
        'aria-invalid:border-destructive dark:aria-invalid:border-destructive/80',

        className,
      )}
      {...props}
    />
  );
}

export { Input };
