'use client';

import { motion } from 'framer-motion';
import { Card, SectionTitle } from '@/components/ui/card';

const items = [
  ['数字内容卖家', 'PayU 的唯一金额机制很适合虚拟商品，支付确认后几乎不需要人工干预。'],
  ['软件授权平台', 'USDT TRC20 到账快，页面风格也足够接近交易所级支付体验。'],
  ['会员服务商', '订单、支付、后台流水都打通后，客服处理效率提高很多。']
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle eyebrow="Feedback" title="为数字商品交易而设计" />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(([role, text]) => (
          <motion.div key={role} whileHover={{ y: -4 }}>
            <Card>
              <div className="mb-4 text-amber-300">★★★★★</div>
              <p className="leading-7 text-muted">{text}</p>
              <div className="mt-6 font-black">{role}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
