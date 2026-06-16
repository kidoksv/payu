import { cn } from '@/lib/utils';

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'success' | 'warning' | 'danger' | 'neutral' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black',
        tone === 'success' && 'bg-emerald-400/15 text-emerald-300',
        tone === 'warning' && 'bg-amber-400/15 text-amber-300',
        tone === 'danger' && 'bg-rose-400/15 text-rose-300',
        tone === 'neutral' && 'bg-white/10 text-muted'
      )}
    >
      {children}
    </span>
  );
}
