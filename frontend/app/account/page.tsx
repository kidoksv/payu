'use client';

import Link from 'next/link';
import { CreditCard, KeyRound, LogOut, Shield, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, SectionTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';

export default function AccountPage() {
  const email = useAuthStore((s) => s.email);
  const logout = useAuthStore((s) => s.logout);

  const menu = [
    [UserRound, '个人资料'],
    [CreditCard, '订单管理'],
    [Shield, '支付记录'],
    [KeyRound, 'API密钥']
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionTitle eyebrow="Account" title="用户中心" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card>
          <div className="mb-6">
            <div className="grid size-14 place-items-center rounded-full bg-emerald-400 text-xl font-black text-slate-950">{email?.[0]?.toUpperCase() || 'U'}</div>
            <div className="mt-3 font-black">{email || '未登录'}</div>
            <p className="text-sm text-muted">普通用户</p>
          </div>
          <div className="grid gap-2">
            {menu.map(([Icon, label]) => <button key={label as string} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold hover:bg-white/8"><Icon size={18} />{label as string}</button>)}
            <Button variant="danger" onClick={logout}><LogOut size={16} />退出登录</Button>
          </div>
        </Card>
        <div className="grid gap-6">
          <Card>
            <h2 className="text-xl font-black">订单管理</h2>
            <p className="mt-3 text-muted">当前后端暂未提供用户订单列表接口。你可以从支付页或订单号直接查询订单支付状态。</p>
            <Link className="mt-4 inline-flex font-bold text-emerald-300" href="/products">继续购买商品</Link>
          </Card>
          <Card>
            <h2 className="text-xl font-black">安全设置</h2>
            <p className="mt-3 text-muted">密码修改、二次验证、API Key 管理接口已预留，可在后端扩展后直接接入。</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
