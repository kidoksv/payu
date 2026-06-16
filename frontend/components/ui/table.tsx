import { cn } from '@/lib/utils';

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-white/10', className)}>
      <table className="w-full min-w-[760px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="border-b border-white/10 px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-muted">{children}</th>;
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-white/8 px-4 py-3 align-top">{children}</td>;
}
