import { Hero } from '@/components/home/hero';
import { Process } from '@/components/home/process';
import { Stats } from '@/components/home/stats';
import { Testimonials } from '@/components/home/testimonials';
import { ProductCard } from '@/components/products/product-card';
import { SectionTitle } from '@/components/ui/card';
import { productApi } from '@/lib/server-api';

export default async function HomePage() {
  const products = await productApi.list();
  return (
    <main>
      <Hero />
      <Stats productCount={products.length} />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Hot Products" title="热门虚拟商品" desc="所有商品来自真实后端 API，库存和价格实时读取。" />
        <div className="grid gap-5 md:grid-cols-3">
          {products.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
      <Process />
      <Testimonials />
    </main>
  );
}
