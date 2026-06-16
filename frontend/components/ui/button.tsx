import Link from 'next/link';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-emerald-400 text-slate-950 shadow-[0_16px_40px_rgba(0,208,156,.24)]',
        variant === 'secondary' && 'bg-slate-800 text-white ring-1 ring-white/10 dark:bg-white/10',
        variant === 'ghost' && 'bg-transparent text-[color:var(--foreground)] hover:bg-white/10',
        variant === 'danger' && 'bg-rose-500 text-white',
        className
      )}
      {...props}
    />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonProps['variant'];
};

export function LinkButton({ href, className, variant = 'primary', ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5',
        variant === 'primary' && 'bg-emerald-400 text-slate-950 shadow-[0_16px_40px_rgba(0,208,156,.24)]',
        variant === 'secondary' && 'bg-slate-800 text-white ring-1 ring-white/10 dark:bg-white/10',
        variant === 'ghost' && 'bg-transparent text-[color:var(--foreground)] hover:bg-white/10',
        variant === 'danger' && 'bg-rose-500 text-white',
        className
      )}
      {...props}
    />
  );
}
