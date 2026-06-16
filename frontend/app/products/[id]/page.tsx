import { Package, ShieldCheck, ShoppingCart, Star } from 'lucide-react';
import { notFound } from 'next/navigation';
import { LinkButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { money } from '@/lib/utils';
import { productApi } from '@/lib/server-api';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await productApi.detail(id);
  if (!product || !product.id) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_.9fr]">
        <div className="glass grid min-h-[520px] place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/18 via-slate-900 to-amber-300/10">
          <Package size={150} className="text-emerald-200" />
        </div>
        <div>
          <Badge tone={product.stock > 0 ? 'success' : 'danger'}>{product.stock > 0 ? '库存充足' : '库存不足'}</Badge>
          <h1 className="mt-5 text-4xl font-black">{product.name}</h1>
          <p className="mt-4 text-muted">{product.description || '虚拟商品详情介绍。支付成功后可通过发货系统自动交付。'}</p>
          <div className="mt-7 text-4xl font-black text-emerald-300">{money(product.price)}</div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Card><Star className="mb-3 text-amber-300" /><b>销量</b><p className="mt-1 text-sm text-muted">后台统计接入后显示</p></Card>
            <Card><ShieldCheck className="mb-3 text-emerald-300" /><b>自动到账</b><p className="mt-1 text-sm text-muted">TRC20 监听确认</p></Card>
            <Card><ShoppingCart className="mb-3 text-sky-300" /><b>库存</b><p className="mt-1 text-sm text-muted">{product.stock}</p></Card>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={`/checkout/${product.id}`}>立即购买</LinkButton>
            <LinkButton href="/products" variant="secondary">加入购物车</LinkButton>
          </div>
        </div>
      </div>
      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {['商品规格', '交付说明', '售后保障'].map((title) => (
          <Card key={title}>
            <h3 className="font-black">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">此区域读取当前商品信息并预留扩展字段，适配虚拟商品规格、授权码和自动发货说明。</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
