'use client';

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Activity, Ban, CheckCircle2, DollarSign, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { DataTable, Td, Th } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { authApi, adminDataApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { money, shortHash } from '@/lib/utils';
import { OrderTrendChart, ProductRankChart, RevenueChart, SuccessRateChart } from '@/components/charts/dashboard-charts';
import type { LucideIcon } from 'lucide-react';

type ProductForm = {
  id?: number;
  sku: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
};

export default function AdminPage() {
  const adminToken = useAuthStore((s) => s.adminToken);
  const setAdminAuth = useAuthStore((s) => s.setAdminAuth);
  const queryClient = useQueryClient();
  const loginForm = useForm({ defaultValues: { email: 'admin@example.com', password: '' } });
  const productForm = useForm<ProductForm>({
    defaultValues: { sku: '', name: '', description: '', price: '1.00', stock: 100, status: 'ACTIVE' }
  });
  const [ordersQ, paymentsQ, productsQ, usersQ] = useQueries({
    queries: [
      { queryKey: ['admin-orders'], queryFn: adminDataApi.orders, enabled: Boolean(adminToken) },
      { queryKey: ['admin-payments'], queryFn: adminDataApi.payments, enabled: Boolean(adminToken) },
      { queryKey: ['admin-products'], queryFn: adminDataApi.products, enabled: Boolean(adminToken) },
      { queryKey: ['admin-users'], queryFn: adminDataApi.users, enabled: Boolean(adminToken) }
    ]
  });

  const userAction = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'freeze' | 'unfreeze' }) => action === 'freeze' ? adminDataApi.freeze(id) : adminDataApi.unfreeze(id),
    onSuccess: () => {
      toast.success('操作成功');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const saveProduct = useMutation({
    mutationFn: (values: ProductForm) => {
      if (values.id) {
        return adminDataApi.updateProduct(values.id, {
          name: values.name,
          description: values.description,
          price: values.price,
          stock: Number(values.stock),
          status: values.status
        });
      }
      return adminDataApi.createProduct({
        sku: values.sku,
        name: values.name,
        description: values.description,
        price: values.price,
        stock: Number(values.stock)
      });
    },
    onSuccess: () => {
      toast.success('商品已保存');
      productForm.reset({ sku: '', name: '', description: '', price: '1.00', stock: 100, status: 'ACTIVE' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('商品保存失败，请检查权限或字段')
  });

  const removeProduct = useMutation({
    mutationFn: (id: number) => adminDataApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('商品已下架');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('下架失败')
  });

  const orders = ordersQ.data || [];
  const payments = paymentsQ.data || [];
  const products = productsQ.data || [];
  const users = usersQ.data || [];
  const paid = orders.filter((o) => ['PAID', 'SHIPPED', 'COMPLETED'].includes(o.status)).length;
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const cards: Array<[LucideIcon, string, string | number]> = [
    [Activity, '今日订单', orders.length],
    [DollarSign, '今日支付金额', totalAmount.toFixed(2)],
    [Users, '在线用户', users.length],
    [CheckCircle2, '支付成功率', orders.length ? `${Math.round((paid / orders.length) * 100)}%` : '0%']
  ];

  const login = loginForm.handleSubmit(async (values) => {
    try {
      const data = await authApi.adminLogin(values.email, values.password);
      setAdminAuth(data.accessToken, values.email);
      toast.success('管理员登录成功');
    } catch {
      toast.error('管理员登录失败');
    }
  });

  if (!adminToken) {
    return (
      <main className="mx-auto grid min-h-[76vh] max-w-md place-items-center px-4 py-12">
        <Card className="w-full">
          <h1 className="text-3xl font-black">管理后台</h1>
          <p className="mt-2 text-sm text-muted">请输入 `.env` 中配置的管理员账号。</p>
          <form className="mt-6 grid gap-4" onSubmit={login}>
            <Input {...loginForm.register('email')} placeholder="admin@example.com" />
            <PasswordInput {...loginForm.register('password')} placeholder="管理员密码" />
            <Button>登录后台</Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionTitle eyebrow="Admin Pro" title="管理后台" desc="订单、流水、商品和用户数据均来自真实后台 API。" />
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([Icon, title, value]) => (
          <Card key={title as string}>
            <Icon className="mb-4 text-emerald-300" />
            <p className="text-sm text-muted">{title as string}</p>
            <div className="mt-2 text-3xl font-black">{value as string}</div>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-black">订单趋势</h2><OrderTrendChart orders={orders} /></Card>
        <Card><h2 className="mb-4 font-black">收入趋势</h2><RevenueChart payments={payments} /></Card>
        <Card><h2 className="mb-4 font-black">支付成功率</h2><SuccessRateChart orders={orders} /></Card>
        <Card><h2 className="mb-4 font-black">商品销量排行</h2><ProductRankChart products={products} /></Card>
      </div>
      <section className="mt-8 grid gap-8">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Package size={20} />订单管理</h2>
          <DataTable>
            <thead><tr><Th>订单号</Th><Th>金额</Th><Th>状态</Th><Th>地址</Th><Th>创建时间</Th></tr></thead>
            <tbody>{orders.map((o) => <tr key={o.orderNo}><Td>{o.orderNo}</Td><Td>{money(o.payAmount)}</Td><Td><Badge tone={o.status === 'PAID' ? 'success' : 'warning'}>{o.status}</Badge></Td><Td>{shortHash(o.payAddress)}</Td><Td>{o.createdAt}</Td></tr>)}</tbody>
          </DataTable>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-black">支付管理</h2>
          <DataTable>
            <thead><tr><Th>txid</Th><Th>金额</Th><Th>地址</Th><Th>状态</Th><Th>时间</Th></tr></thead>
            <tbody>{payments.map((p) => <tr key={p.txid}><Td><a className="text-emerald-300" href={`https://tronscan.org/#/transaction/${p.txid}`} target="_blank">{shortHash(p.txid)}</a></Td><Td>{money(p.amount)}</Td><Td>{shortHash(p.toAddress)}</Td><Td>{p.status}</Td><Td>{p.createdAt}</Td></tr>)}</tbody>
          </DataTable>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-black">商品管理</h2>
          <form className="mb-5 grid gap-3 rounded-xl bg-white/6 p-4 md:grid-cols-6" onSubmit={productForm.handleSubmit((values) => saveProduct.mutate(values))}>
            <Input {...productForm.register('sku')} placeholder="SKU" disabled={Boolean(productForm.watch('id'))} />
            <Input {...productForm.register('name')} placeholder="商品名称" />
            <Input {...productForm.register('price')} placeholder="价格 USDT" />
            <Input {...productForm.register('stock', { valueAsNumber: true })} type="number" placeholder="库存" />
            <Select {...productForm.register('status')}>
              <option value="ACTIVE">上架</option>
              <option value="INACTIVE">下架</option>
            </Select>
            <Button disabled={saveProduct.isPending}>{productForm.watch('id') ? '保存修改' : '新增商品'}</Button>
            <Input className="md:col-span-5" {...productForm.register('description')} placeholder="商品描述" />
            <Button
              type="button"
              variant="secondary"
              onClick={() => productForm.reset({ sku: '', name: '', description: '', price: '1.00', stock: 100, status: 'ACTIVE' })}
            >
              清空
            </Button>
          </form>
          <DataTable>
            <thead><tr><Th>SKU</Th><Th>名称</Th><Th>价格</Th><Th>库存</Th><Th>状态</Th><Th>操作</Th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <Td>{p.sku}</Td>
                  <Td>{p.name}</Td>
                  <Td>{money(p.price)}</Td>
                  <Td>{p.stock}</Td>
                  <Td><Badge tone={p.status === 'ACTIVE' ? 'success' : 'danger'}>{p.status}</Badge></Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => productForm.reset({
                          id: p.id,
                          sku: p.sku,
                          name: p.name,
                          description: p.description || '',
                          price: Number(p.price).toFixed(2),
                          stock: p.stock,
                          status: p.status
                        })}
                      >
                        编辑
                      </Button>
                      <Button variant="danger" onClick={() => removeProduct.mutate(p.id)}>下架</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-black">用户管理</h2>
          <DataTable>
            <thead><tr><Th>邮箱</Th><Th>状态</Th><Th>创建时间</Th><Th>操作</Th></tr></thead>
            <tbody>{users.map((u) => <tr key={u.id}><Td>{u.email}</Td><Td>{u.status}</Td><Td>{u.createdAt}</Td><Td><Button variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'} onClick={() => userAction.mutate({ id: u.id, action: u.status === 'ACTIVE' ? 'freeze' : 'unfreeze' })}>{u.status === 'ACTIVE' ? <Ban size={15} /> : null}{u.status === 'ACTIVE' ? '封禁' : '解封'}</Button></Td></tr>)}</tbody>
          </DataTable>
        </Card>
      </section>
    </main>
  );
}
