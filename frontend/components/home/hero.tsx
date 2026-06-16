'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Timer, WalletCards } from 'lucide-react';
import { LinkButton } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_.92fr] md:px-6 md:py-24">
      <div className="flex flex-col justify-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-xs font-black uppercase tracking-[.25em] text-emerald-300">
          Tron Mainnet · USDT TRC20
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .05 }} className="text-4xl font-black leading-tight md:text-6xl">
          <span className="gradient-text">USDT TRC20</span><br />虚拟商品商城
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
          安全、快速、自动到账。订单生成唯一金额，链上到账后自动确认，为数字商品、会员兑换码、软件授权和 API 服务提供完整支付闭环。
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/products">立即购买 <ArrowRight size={17} /></LinkButton>
          <LinkButton href="/products" variant="secondary">浏览商品</LinkButton>
        </motion.div>
        <div className="mt-9 grid gap-3 sm:grid-cols-3">
          {[
            [ShieldCheck, '链上校验', 'txid 幂等确认'],
            [Timer, '30 分钟有效', '超时自动取消'],
            [WalletCards, '唯一金额', '单地址精准匹配']
          ].map(([Icon, title, desc]) => (
            <div key={title as string} className="glass rounded-xl p-4">
              <Icon className="mb-3 text-emerald-300" size={22} />
              <div className="font-black">{title as string}</div>
              <p className="mt-1 text-xs text-muted">{desc as string}</p>
            </div>
          ))}
        </div>
      </div>
      <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="glass relative min-h-[440px] overflow-hidden rounded-2xl p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,208,156,.16),transparent_42%,rgba(240,185,11,.12))]" />
        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-black">PayU Checkout</span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">Listening</span>
          </div>
          <div className="rounded-xl bg-slate-950/55 p-5 ring-1 ring-white/10">
            <p className="text-sm text-muted">订单金额</p>
            <div className="mt-2 text-5xl font-black">100.01 <span className="text-lg text-muted">USDT</span></div>
            <div className="mt-6 grid gap-3">
              <div className="h-12 rounded-lg bg-white/8" />
              <div className="h-12 rounded-lg bg-white/8" />
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <div className="aspect-square rounded-xl bg-white p-3">
                  <div className="size-full rounded-lg bg-[repeating-linear-gradient(45deg,#061014_0_6px,#fff_6px_12px)]" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 rounded bg-emerald-300/40" />
                  <div className="h-4 rounded bg-white/10" />
                  <div className="h-4 rounded bg-white/10" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {['创建订单', '等待付款', '确认中', '支付成功'].map((s, i) => (
              <div key={s} className="rounded-lg bg-white/8 p-3 text-center text-xs font-bold text-muted">
                <div className={`mx-auto mb-2 size-2 rounded-full ${i < 2 ? 'bg-emerald-300' : 'bg-white/30'}`} />{s}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
