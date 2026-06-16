'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, Moon, ShoppingBag, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { LinkButton, Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

const links = [
  ['首页', '/'],
  ['商品', '/products'],
  ['订单', '/account'],
  ['帮助中心', '/help']
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const adminToken = useAuthStore((s) => s.adminToken);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20">
            <ShoppingBag size={21} />
          </span>
          <span className="text-lg font-black">PayU</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className={cn('rounded-lg px-3 py-2 text-sm font-bold text-muted transition hover:text-white', pathname === href && 'bg-white/10 text-white')}>
              {label}
            </Link>
          ))}
          {adminToken ? (
            <Link href="/admin" className={cn('rounded-lg px-3 py-2 text-sm font-bold text-muted transition hover:text-white', isAdmin && 'bg-white/10 text-white')}>
              管理后台
            </Link>
          ) : null}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" aria-label="theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
          {adminToken ? (
            <>
              <LinkButton href="/admin" variant="secondary">管理后台</LinkButton>
              <Button variant="danger" onClick={logout}><LogOut size={16} />退出后台</Button>
            </>
          ) : token ? (
            <LinkButton href="/account" variant="secondary">用户中心</LinkButton>
          ) : (
            <>
              <LinkButton href="/auth/login" variant="secondary">登录</LinkButton>
              <LinkButton href="/auth/register">注册</LinkButton>
            </>
          )}
        </div>
        <Button className="md:hidden" variant="ghost" onClick={() => setOpen((v) => !v)}><Menu /></Button>
      </div>
      {open ? (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          {links.map(([label, href]) => <Link key={href} className="block rounded-lg px-3 py-3 text-sm font-bold" href={href}>{label}</Link>)}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {adminToken ? (
              <>
                <LinkButton href="/admin" variant="secondary">管理后台</LinkButton>
                <Button variant="danger" onClick={logout}>退出后台</Button>
              </>
            ) : token ? (
              <LinkButton href="/account" variant="secondary">用户中心</LinkButton>
            ) : (
              <>
                <LinkButton href="/auth/login" variant="secondary">登录</LinkButton>
                <LinkButton href="/auth/register">注册</LinkButton>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
