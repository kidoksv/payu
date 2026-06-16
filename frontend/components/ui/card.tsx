import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('glass rounded-xl p-5', className)}>{children}</div>;
}

export function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="mb-7">
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-emerald-300">{eyebrow}</p> : null}
      <h2 className="text-2xl font-black md:text-4xl">{title}</h2>
      {desc ? <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">{desc}</p> : null}
    </div>
  );
}
