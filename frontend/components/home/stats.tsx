'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1200 });
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(value);
    return spring.on('change', (latest) => setDisplay(Math.floor(latest)));
  }, [inView, motionValue, spring, value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export function Stats({ productCount }: { productCount: number }) {
  const stats = [
    ['总订单数', 0, '后台登录后显示实时数据'],
    ['成功支付数', 0, '来源：订单状态'],
    ['商品数量', productCount, '来源：商品 API'],
    ['在线用户', 0, '需接入在线会话统计']
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value, desc]) => (
          <motion.div key={label as string} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card>
              <p className="text-sm text-muted">{label as string}</p>
              <div className="mt-2 text-3xl font-black"><Counter value={value as number} /></div>
              <p className="mt-2 text-xs text-muted">{desc as string}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
