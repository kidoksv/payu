import { LinkButton } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-4 py-20 text-center">
      <div className="glass rounded-2xl p-10">
        <div className="mx-auto mb-8 grid size-44 place-items-center rounded-full bg-emerald-400/10 text-6xl font-black text-emerald-300">404</div>
        <h1 className="text-4xl font-black">页面走进了未确认区块</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">你访问的页面不存在，或链接已经过期。</p>
        <LinkButton href="/" className="mt-8">返回首页</LinkButton>
      </div>
    </main>
  );
}
