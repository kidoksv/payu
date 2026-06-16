'use client';

import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Activity, Ban, CheckCircle2, CreditCard, DollarSign, Package, RefreshCw, Settings, Store, Users } from 'lucide-react';
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

type AdminTab = 'dashboard' | 'products' | 'orders' | 'payments' | 'users' | 'settings';

export default function AdminPage() {
  const adminToken = useAuthStore((s) => s.adminToken);
  const setAdminAuth = useAuthStore((s) => s.setAdminAuth);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<AdminTab>('products');
  const [reconcileTxid, setReconcileTxid] = useState('');
  const loginForm = useForm({ defaultValues: { email: 'admin@example.com', password: '' } });
  const productForm = useForm<ProductForm>({
    defaultValues: { sku: '', name: '', description: '', price: '1.00', stock: 100, status: 'ACTIVE' }
  });
  const [ordersQ, paymentsQ, paymentLogsQ, productsQ, usersQ] = useQueries({
    queries: [
      { queryKey: ['admin-orders'], queryFn: adminDataApi.orders, enabled: Boolean(adminToken) },
      { queryKey: ['admin-payments'], queryFn: adminDataApi.payments, enabled: Boolean(adminToken) },
      { queryKey: ['admin-payment-logs'], queryFn: adminDataApi.paymentLogs, enabled: Boolean(adminToken) },
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

  const productStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'INACTIVE' }) => adminDataApi.updateProduct(id, { status }),
    onSuccess: () => {
      toast.success('商品状态已更新');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('商品状态更新失败')
  });

  const reconcilePayment = useMutation({
    mutationFn: (txid: string) => adminDataApi.reconcilePayment({ txid }),
    onSuccess: (data: { result?: { matched?: boolean; orderNo?: string } }) => {
      const orderNo = data.result?.orderNo ? `：${data.result.orderNo}` : '';
      toast.success(data.result?.matched ? `补单成功${orderNo}` : '已重扫该 txid，但没有匹配到订单');
      setReconcileTxid('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-logs'] });
    },
    onError: () => toast.error('补单失败：请确认 txid 是已确认的 USDT TRC20 转账')
  });

  const orders = ordersQ.data || [];
  const payments = paymentsQ.data || [];
  const paymentLogs = paymentLogsQ.data || [];
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
  const adminMenu: Array<[AdminTab, LucideIcon, string]> = [
    ['dashboard', Activity, '仪表盘'],
    ['products', Store, '商品管理'],
    ['orders', Package, '订单管理'],
    ['payments', CreditCard, '支付管理'],
    ['users', Users, '用户管理'],
    ['settings', Settings, '系统设置']
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
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit lg:sticky lg:top-24">
          <div className="mb-4 text-sm font-black text-muted">后台模块</div>
          <div className="grid gap-2">
            {adminMenu.map(([key, Icon, label]) => (
              <button
                key={key}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-black transition hover:bg-white/8 ${tab === key ? 'bg-emerald-400 text-slate-950' : ''}`}
                onClick={() => setTab(key)}
              >
                <Icon size={18} />{label}
              </button>
            ))}
          </div>
        </Card>

        <section className="grid gap-6">
          {tab === 'dashboard' ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                {cards.map(([Icon, title, value]) => (
                  <Card key={title}>
                    <Icon className="mb-4 text-emerald-300" />
                    <p className="text-sm text-muted">{title}</p>
                    <div className="mt-2 text-3xl font-black">{value}</div>
                  </Card>
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Card><h2 className="mb-4 font-black">订单趋势</h2><OrderTrendChart orders={orders} /></Card>
                <Card><h2 className="mb-4 font-black">收入趋势</h2><RevenueChart payments={payments} /></Card>
                <Card><h2 className="mb-4 font-black">支付成功率</h2><SuccessRateChart orders={orders} /></Card>
                <Card><h2 className="mb-4 font-black">商品销量排行</h2><ProductRankChart products={products} /></Card>
              </div>
            </>
          ) : null}

          {tab === 'orders' ? (
            <Card>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Package size={20} />订单管理</h2>
              <DataTable>
                <thead><tr><Th>订单号</Th><Th>金额</Th><Th>状态</Th><Th>地址</Th><Th>创建时间</Th></tr></thead>
                <tbody>{orders.map((o) => <tr key={o.orderNo}><Td>{o.orderNo}</Td><Td>{money(o.payAmount)}</Td><Td><Badge tone={o.status === 'PAID' ? 'success' : 'warning'}>{o.status}</Badge></Td><Td>{shortHash(o.payAddress)}</Td><Td>{o.createdAt}</Td></tr>)}</tbody>
              </DataTable>
            </Card>
          ) : null}

          {tab === 'payments' ? (
            <Card>
              <h2 className="mb-4 text-xl font-black">支付管理</h2>
              <form
                className="mb-5 grid gap-3 rounded-xl bg-white/6 p-4 md:grid-cols-[1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  const txid = reconcileTxid.trim();
                  if (!txid) return toast.error('请输入 Tronscan 上的 txid');
                  reconcilePayment.mutate(txid);
                }}
              >
                <Input value={reconcileTxid} onChange={(event) => setReconcileTxid(event.target.value)} placeholder="输入已支付的 txid，手动查询链上并补单" />
                <Button disabled={reconcilePayment.isPending}>
                  <RefreshCw size={16} />{reconcilePayment.isPending ? '补单中' : '手动补单'}
                </Button>
              </form>
              <div className="grid gap-6">
                <div>
                  <h3 className="mb-3 font-black">链上支付流水</h3>
                  <DataTable>
                    <thead><tr><Th>txid</Th><Th>金额</Th><Th>地址</Th><Th>状态</Th><Th>支付时间</Th></tr></thead>
                    <tbody>{payments.map((p) => <tr key={p.txid}><Td><a className="text-emerald-300" href={`https://tronscan.org/#/transaction/${p.txid}`} target="_blank">{shortHash(p.txid)}</a></Td><Td>{money(p.amount)}</Td><Td>{shortHash(p.toAddress)}</Td><Td>{p.status}</Td><Td>{p.paidAt || p.createdAt}</Td></tr>)}</tbody>
                  </DataTable>
                </div>
                <div>
                  <h3 className="mb-3 font-black">异常与补单日志</h3>
                  <DataTable>
                    <thead><tr><Th>级别</Th><Th>事件</Th><Th>订单</Th><Th>txid</Th><Th>说明</Th><Th>时间</Th></tr></thead>
                    <tbody>
                      {paymentLogs.map((log) => (
                        <tr key={log.id}>
                          <Td><Badge tone={log.level === 'INFO' ? 'success' : log.level === 'WARN' ? 'warning' : 'danger'}>{log.level}</Badge></Td>
                          <Td>{log.event}</Td>
                          <Td>{log.orderId || '-'}</Td>
                          <Td>{log.txid ? <a className="text-emerald-300" href={`https://tronscan.org/#/transaction/${log.txid}`} target="_blank">{shortHash(log.txid)}</a> : '-'}</Td>
                          <Td>{log.message}</Td>
                          <Td>{log.createdAt}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </DataTable>
                </div>
              </div>
            </Card>
          ) : null}

          {tab === 'products' ? (
            <Card>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Store size={20} />商品管理</h2>
          <p className="mb-4 text-sm text-muted">这里是真实商品管理。修改价格、库存、上下架会直接写入后端数据库，用户商品页和下单金额会立即变化。</p>
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
                      {p.status === 'ACTIVE' ? (
                        <Button variant="danger" onClick={() => productStatus.mutate({ id: p.id, status: 'INACTIVE' })}>下架</Button>
                      ) : (
                        <Button onClick={() => productStatus.mutate({ id: p.id, status: 'ACTIVE' })}>上架</Button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
            </Card>
          ) : null}

          {tab === 'users' ? (
            <Card>
          <h2 className="mb-4 text-xl font-black">用户管理</h2>
          <DataTable>
            <thead><tr><Th>邮箱</Th><Th>状态</Th><Th>创建时间</Th><Th>操作</Th></tr></thead>
            <tbody>{users.map((u) => <tr key={u.id}><Td>{u.email}</Td><Td>{u.status}</Td><Td>{u.createdAt}</Td><Td><Button variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'} onClick={() => userAction.mutate({ id: u.id, action: u.status === 'ACTIVE' ? 'freeze' : 'unfreeze' })}>{u.status === 'ACTIVE' ? <Ban size={15} /> : null}{u.status === 'ACTIVE' ? '封禁' : '解封'}</Button></Td></tr>)}</tbody>
          </DataTable>
            </Card>
          ) : null}

          {tab === 'settings' ? (
            <Card>
              <h2 className="text-xl font-black">系统设置</h2>
              <div className="mt-4 grid gap-3 text-sm text-muted">
                <div className="rounded-lg bg-white/6 p-4">网站配置、支付配置、邮件配置、公告管理需要后端配置表支撑。当前版本先保留入口，下一步可接入真实 settings 表。</div>
                <div className="rounded-lg bg-white/6 p-4">支付地址当前来自 `.env` 的 DEFAULT_RECEIVE_ADDRESS，生产修改后需重启 API 服务。</div>
              </div>
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  );
}
