'use client';

import { useParams } from 'next/navigation';
import { CheckCircle2, Clipboard, Loader2, Radio, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { orderApi } from '@/lib/api';
import { money, shortHash } from '@/lib/utils';

function useCountdown(expiresAt?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return useMemo(() => {
    if (!expiresAt) return '--:--';
    const left = Math.max(0, new Date(expiresAt).getTime() - now);
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [expiresAt, now]);
}

export default function PayPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const { data: order } = useQuery({ queryKey: ['payment-status', orderNo], queryFn: () => orderApi.paymentStatus(orderNo), refetchInterval: 5000 });
  const countdown = useCountdown(order?.expiresAt);
  const paid = order?.status === 'PAID';

  const copy = async (text?: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success('已复制');
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-300">Binance style checkout</p>
          <h1 className="mt-2 text-3xl font-black">USDT TRC20 支付</h1>
        </div>
        <Badge tone={paid ? 'success' : 'warning'}>{order?.status || '加载中'}</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <div className="grid place-items-center rounded-xl bg-white p-4">
              {order?.qrCodeDataUrl ? <img src={order.qrCodeDataUrl} alt="USDT payment QR" className="size-48" /> : <Loader2 className="animate-spin text-slate-900" />}
            </div>
            <div>
              <div className="text-sm text-muted">订单金额</div>
              <div className="mt-2 text-4xl font-black text-emerald-300">{money(order?.payAmount || 0)}</div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-lg bg-white/6 p-3">
                  <div className="mb-1 text-xs text-muted">订单号</div>
                  <code>{orderNo}</code>
                </div>
                <div className="rounded-lg bg-white/6 p-3">
                  <div className="mb-1 text-xs text-muted">收款地址</div>
                  <div className="flex items-center gap-2">
                    <code className="break-all">{order?.payAddress}</code>
                    <Button variant="ghost" onClick={() => copy(order?.payAddress)}><Clipboard size={16} /></Button>
                  </div>
                </div>
                <Button onClick={() => copy(order?.payAmount)}>复制金额</Button>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-sm text-muted">剩余支付时间</div>
          <div className="mt-2 text-5xl font-black">{countdown}</div>
          <div className="mt-7 space-y-4">
            {[
              ['等待付款', true],
              ['监听中', !paid],
              ['确认中', !paid],
              ['支付成功', paid]
            ].map(([label, active], index) => (
              <div key={label as string} className="flex items-center gap-3">
                <motion.span animate={{ scale: active ? [1, 1.18, 1] : 1 }} transition={{ repeat: active ? Infinity : 0, duration: 1.2 }} className={`grid size-9 place-items-center rounded-full ${active ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-muted'}`}>
                  {paid && index === 3 ? <CheckCircle2 size={18} /> : <Radio size={16} />}
                </motion.span>
                <span className="font-bold">{label as string}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-black"><ShieldAlert size={18} />付款提醒</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
            <li>请务必使用 TRC20 网络转账。</li>
            <li>请准确支付页面显示金额，少付或错付将记录为异常支付。</li>
            <li>到账确认数达到 1 后系统自动确认。</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-black">链上记录</h2>
          <div className="mt-4 space-y-3 text-sm">
            {order?.txid ? (
              <a className="block rounded-lg bg-white/6 p-3 hover:bg-white/10" href={`https://tronscan.org/#/transaction/${order.txid}`} target="_blank">
                <b>{shortHash(order.txid)}</b><p className="mt-1 text-muted">支付成功后可跳转 Tronscan 查看。</p>
              </a>
            ) : <p className="text-muted">暂无链上支付记录，到账后系统会自动更新状态。</p>}
          </div>
        </Card>
      </div>
    </main>
  );
}
