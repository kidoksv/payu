'use client';

import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip
} from 'chart.js';
import type { Order, Payment, Product } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export function OrderTrendChart({ orders }: { orders: Order[] }) {
  const labels = orders.slice(0, 7).reverse().map((o) => o.orderNo.slice(-4));
  return (
    <Line
      data={{
        labels,
        datasets: [{ label: '订单', data: labels.map((_, i) => i + 1), borderColor: '#00d09c', backgroundColor: 'rgba(0,208,156,.2)', tension: .38 }]
      }}
      options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#8ea5ae' } }, x: { ticks: { color: '#8ea5ae' } } } }}
    />
  );
}

export function RevenueChart({ payments }: { payments: Payment[] }) {
  return (
    <Bar
      data={{
        labels: payments.slice(0, 8).map((p) => p.txid.slice(0, 4)),
        datasets: [{ label: 'USDT', data: payments.slice(0, 8).map((p) => Number(p.amount)), backgroundColor: 'rgba(240,185,11,.72)' }]
      }}
      options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#8ea5ae' } }, x: { ticks: { color: '#8ea5ae' } } } }}
    />
  );
}

export function SuccessRateChart({ orders }: { orders: Order[] }) {
  const paid = orders.filter((o) => o.status === 'PAID' || o.status === 'SHIPPED' || o.status === 'COMPLETED').length;
  const other = Math.max(orders.length - paid, 0);
  return (
    <Doughnut
      data={{ labels: ['成功', '其他'], datasets: [{ data: [paid, other], backgroundColor: ['#00d09c', 'rgba(255,255,255,.14)'] }] }}
      options={{ plugins: { legend: { labels: { color: '#8ea5ae' } } } }}
    />
  );
}

export function ProductRankChart({ products }: { products: Product[] }) {
  return (
    <Bar
      data={{
        labels: products.slice(0, 6).map((p) => p.name),
        datasets: [{ label: '库存', data: products.slice(0, 6).map((p) => p.stock), backgroundColor: 'rgba(0,208,156,.66)' }]
      }}
      options={{ indexAxis: 'y', plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#8ea5ae' } }, x: { ticks: { color: '#8ea5ae' } } } }}
    />
  );
}
