'use client';

import Link from 'next/link';
import { CreditCard, KeyRound, LogOut, Shield, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { DataTable, Td, Th } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PasswordInput } from '@/components/ui/password-input';
import { authApi, orderApi, paymentApi } from '@/lib/api';
import { money, shortHash } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import type { LucideIcon } from 'lucide-react';

type Tab = 'profile' | 'orders' | 'payments' | 'security' | 'apiKeys';

export default function AccountPage() {
  const email = useAuthStore((s) => s.email);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState<Tab>('orders');
  const passwordForm = useForm({ defaultValues: { oldPassword: '', newPassword: '' } });
  const { data: orders = [] } = useQuery({ queryKey: ['my-orders'], queryFn: orderApi.mine, enabled: Boolean(token) });
  const { data: payments = [] } = useQuery({ queryKey: ['my-payments'], queryFn: paymentApi.mine, enabled: Boolean(token) });
  const passwordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => authApi.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.success('密码已修改，请妥善保存新密码');
      passwordForm.reset();
    },
    onError: () => toast.error('密码修改失败，请检查旧密码')
  });

  const menu: Array<[Tab, LucideIcon, string]> = [
    ['profile', UserRound, '个人资料'],
    ['orders', CreditCard, '订单管理'],
    ['payments', Shield, '支付记录'],
    ['security', KeyRound, '安全设置'],
    ['apiKeys', KeyRound, 'API密钥']
  ];

  if (!token) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-12">
        <Card className="text-center">
          <h1 className="text-2xl font-black">请先登录</h1>
          <p className="mt-3 text-muted">登录后可查看订单、支付记录和安全设置。</p>
          <Link className="mt-6 inline-flex rounded-lg bg-emerald-400 px-4 py-2 font-black text-slate-950" href="/auth/login">去登录</Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionTitle eyebrow="Account" title="用户中心" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <div className="mb-6">
            <div className="grid size-14 place-items-center rounded-full bg-emerald-400 text-xl font-black text-slate-950">{email?.[0]?.toUpperCase() || 'U'}</div>
            <div className="mt-3 break-all font-black">{email || '用户'}</div>
            <p className="text-sm text-muted">普通用户</p>
          </div>
          <div className="grid gap-2">
            {menu.map(([key, Icon, label]) => (
              <button
                key={key}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold hover:bg-white/8 ${tab === key ? 'bg-white/10 text-emerald-300' : ''}`}
                onClick={() => setTab(key)}
              >
                <Icon size={18} />{label}
              </button>
            ))}
            <Button variant="danger" onClick={logout}><LogOut size={16} />退出登录</Button>
          </div>
        </Card>
        <div className="grid gap-6">
          {tab === 'profile' ? (
            <Card>
              <h2 className="text-xl font-black">个人资料</h2>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between rounded-lg bg-white/6 p-3"><span className="text-muted">邮箱</span><b>{email}</b></div>
                <div className="flex justify-between rounded-lg bg-white/6 p-3"><span className="text-muted">账号状态</span><Badge tone="success">ACTIVE</Badge></div>
              </div>
            </Card>
          ) : null}

          {tab === 'orders' ? (
            <Card>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-black">订单管理</h2>
                <Link className="font-bold text-emerald-300" href="/products">继续购买商品</Link>
              </div>
              <DataTable>
                <thead><tr><Th>订单号</Th><Th>金额</Th><Th>状态</Th><Th>地址</Th><Th>操作</Th></tr></thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderNo}>
                      <Td>{order.orderNo}</Td>
                      <Td>{money(order.payAmount)}</Td>
                      <Td><Badge tone={order.status === 'PAID' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'warning'}>{order.status}</Badge></Td>
                      <Td>{shortHash(order.payAddress)}</Td>
                      <Td><Link className="font-bold text-emerald-300" href={`/pay/${order.orderNo}`}>查看</Link></Td>
                    </tr>
                  ))}
                  {!orders.length ? <tr><Td>暂无订单</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr> : null}
                </tbody>
              </DataTable>
            </Card>
          ) : null}

          {tab === 'payments' ? (
            <Card>
              <h2 className="mb-4 text-xl font-black">支付记录</h2>
              <DataTable>
                <thead><tr><Th>txid</Th><Th>金额</Th><Th>付款地址</Th><Th>状态</Th><Th>时间</Th></tr></thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.txid}>
                      <Td><a className="text-emerald-300" target="_blank" href={`https://tronscan.org/#/transaction/${payment.txid}`}>{shortHash(payment.txid)}</a></Td>
                      <Td>{money(payment.amount)}</Td>
                      <Td>{shortHash(payment.fromAddress)}</Td>
                      <Td>{payment.status}</Td>
                      <Td>{payment.createdAt}</Td>
                    </tr>
                  ))}
                  {!payments.length ? <tr><Td>暂无支付记录</Td><Td>-</Td><Td>-</Td><Td>-</Td><Td>-</Td></tr> : null}
                </tbody>
              </DataTable>
            </Card>
          ) : null}

          {tab === 'security' ? (
            <Card>
              <h2 className="text-xl font-black">安全设置</h2>
              <form className="mt-5 grid max-w-md gap-4" onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values))}>
                <label className="grid gap-2 text-sm font-bold">旧密码<PasswordInput {...passwordForm.register('oldPassword')} /></label>
                <label className="grid gap-2 text-sm font-bold">新密码<PasswordInput {...passwordForm.register('newPassword')} /></label>
                <Button disabled={passwordMutation.isPending}>修改密码</Button>
              </form>
            </Card>
          ) : null}

          {tab === 'apiKeys' ? (
            <Card>
              <h2 className="text-xl font-black">API 密钥</h2>
              <p className="mt-3 text-muted">API Key 属于高风险能力，需要后端增加密钥表、作用域、过期时间和审计日志后启用。当前生产版先关闭创建入口，避免生成不可审计的密钥。</p>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}
