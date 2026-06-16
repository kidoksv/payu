import type { Product } from './types';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_INTERNAL_URL || 'http://api:3000/api/v1';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { cache: 'no-store' });
  if (!res.ok) return [] as T;
  return res.json();
}

export const productApi = {
  list: () => get<Product[]>('/products'),
  detail: (id: string | number) => get<Product>(`/products/${id}`)
};
