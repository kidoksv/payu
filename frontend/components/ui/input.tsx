import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('min-h-11 w-full rounded-lg border border-white/10 bg-white/8 px-3 text-sm outline-none transition focus:border-emerald-300 dark:bg-white/5', className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 text-sm outline-none transition focus:border-emerald-300', className)} {...props}>
      {children}
    </select>
  );
}
