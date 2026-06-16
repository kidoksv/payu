'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, CreditCard, PackageCheck, ScanQrCode, ShoppingCart } from 'lucide-react';
import { SectionTitle } from '@/components/ui/card';

const steps = [
  [ShoppingCart, '选择商品', '浏览库存和价格'],
  [CreditCard, '创建订单', '生成唯一金额'],
  [ScanQrCode, 'USDT付款', 'TRC20 网络转账'],
  [CheckCircle2, '自动到账', 'TronGrid 监听确认'],
  [PackageCheck, '自动发货', '预留发货回调']
];

export function Process() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle eyebrow="Payment Flow" title="从下单到发货的自动化链路" desc="每一笔订单都通过唯一金额和链上 txid 进行匹配，减少人工确认成本。" />
      <div className="grid gap-4 md:grid-cols-5">
        {steps.map(([Icon, title, desc], index) => (
          <motion.div key={title as string} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} viewport={{ once: true }} className="glass rounded-xl p-5">
            <Icon className="mb-4 text-emerald-300" size={28} />
            <div className="text-sm font-black text-emerald-300">0{index + 1}</div>
            <h3 className="mt-2 font-black">{title as string}</h3>
            <p className="mt-2 text-sm text-muted">{desc as string}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
