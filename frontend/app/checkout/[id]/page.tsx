'use client';

import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { productApi, orderApi } from '@/lib/api';
import { money } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [qty, setQty] = useState(1);
  const { data: product } = useQuery({ queryKey: ['product', id], queryFn: () => productApi.detail(id) });
  const createOrder = useMutation({
    mutationFn: () => orderApi.create(Number(id), qty),
    onSuccess: (order) => {
      toast.success('订单创建成功');
      router.push(`/pay/${order.orderNo}?orderId=${order.id || ''}`);
    },
    onError: () => toast.error('创建订单失败，请先登录或稍后重试')
  });

  if (!token) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20">
        <Card className="text-center">
          <h1 className="text-2xl font-black">请先登录</h1>
          <p className="mt-3 text-muted">登录后即可创建订单并生成 USDT TRC20 支付信息。</p>
          <Button className="mt-6" onClick={() => router.push('/auth/login')}>去登录</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <SectionTitle eyebrow="Checkout" title="创建订单" />
      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="text-xl font-black">{product?.name || '加载商品中'}</h2>
          <p className="mt-3 text-muted">{product?.description}</p>
          <div className="mt-6 flex items-center gap-3">
            <Button variant="secondary" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></Button>
            <div className="w-16 text-center text-2xl font-black">{qty}</div>
            <Button variant="secondary" onClick={() => setQty(qty + 1)}><Plus size={16} /></Button>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">订单金额</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">单价</span><b>{money(product?.price || 0)}</b></div>
            <div className="flex justify-between"><span className="text-muted">数量</span><b>{qty}</b></div>
            <div className="border-t border-white/10 pt-4 text-2xl font-black text-emerald-300">{money(Number(product?.price || 0) * qty)}</div>
          </div>
          <Button className="mt-6 w-full" disabled={!product || createOrder.isPending} onClick={() => createOrder.mutate()}>
            确认购买
          </Button>
        </Card>
      </div>
    </main>
  );
}
