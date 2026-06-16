'use client';

import { motion } from 'framer-motion';
import { Package, Zap } from 'lucide-react';
import { Product } from '@/lib/types';
import { money } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';

export function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group glass overflow-hidden rounded-xl"
    >
      <div className="relative grid aspect-[16/10] place-items-center bg-gradient-to-br from-emerald-400/18 via-slate-800 to-amber-300/12">
        <Package className="text-emerald-200 transition group-hover:scale-110" size={76} />
        <div className="absolute right-3 top-3"><Badge tone={product.stock > 0 ? 'success' : 'danger'}>{product.stock > 0 ? '有库存' : '售罄'}</Badge></div>
      </div>
      <div className="p-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{product.sku}</div>
        <h3 className="text-lg font-black">{product.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-6 text-muted">{product.description || '虚拟商品，自动确认支付后可对接自动发货。'}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">价格</p>
            <p className="text-xl font-black text-emerald-300">{money(product.price)}</p>
          </div>
          <LinkButton href={`/products/${product.id}`}><Zap size={16} />立即购买</LinkButton>
        </div>
      </div>
    </motion.article>
  );
}
