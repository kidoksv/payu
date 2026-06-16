'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/products/product-card';
import { SectionTitle } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { productApi } from '@/lib/api';

export default function ProductsPage() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('latest');
  const { data = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: productApi.list });

  const filtered = useMemo(() => {
    const list = data.filter((p) => `${p.name} ${p.sku} ${p.description || ''}`.toLowerCase().includes(q.toLowerCase()));
    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return Number(a.price) - Number(b.price);
      if (sort === 'price-desc') return Number(b.price) - Number(a.price);
      if (sort === 'stock') return b.stock - a.stock;
      return b.id - a.id;
    });
  }, [data, q, sort]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionTitle eyebrow="Market" title="商品列表" desc="搜索、筛选和排序均基于真实商品 API 返回数据。" />
      <div className="glass mb-7 grid gap-3 rounded-xl p-4 md:grid-cols-[1fr_180px_180px]">
        <label className="relative">
          <Search className="absolute left-3 top-3 text-muted" size={18} />
          <Input className="pl-10" placeholder="搜索商品、SKU、介绍" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <Select>
          <option>全部分类</option>
          <option>虚拟商品</option>
          <option>软件授权</option>
          <option>会员服务</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="latest">最新</option>
          <option value="stock">最热</option>
          <option value="price-asc">价格升序</option>
          <option value="price-desc">价格降序</option>
        </Select>
      </div>
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      )}
    </main>
  );
}
