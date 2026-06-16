'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  identifier: z.string().min(3, '请输入邮箱或用户名'),
  password: z.string().min(8)
});

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { identifier: '', password: '' } });

  const submit = handleSubmit(async (values) => {
    try {
      const data = await authApi.login(values.identifier, values.password);
      setAuth(data.accessToken, data.user?.email || data.user?.username || values.identifier);
      toast.success('登录成功');
      router.push('/products');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || '登录失败，请检查账号或密码');
    }
  });

  return (
    <main className="mx-auto grid min-h-[76vh] max-w-md place-items-center px-4 py-12">
      <Card className="w-full">
        <h1 className="text-3xl font-black">登录</h1>
        <p className="mt-2 text-sm text-muted">使用注册时填写的邮箱或用户名都可以登录。</p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold">邮箱或用户名<Input {...register('identifier')} placeholder="you@example.com 或 username" /></label>
          <label className="grid gap-2 text-sm font-bold">密码<PasswordInput {...register('password')} placeholder="请输入密码" /></label>
          <Button disabled={formState.isSubmitting}>登录</Button>
        </form>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" disabled>Google 登录</Button>
          <Button variant="secondary" disabled>Telegram 登录</Button>
        </div>
        <p className="mt-5 text-sm text-muted">还没有账号？<Link className="font-bold text-emerald-300" href="/auth/register">立即注册</Link></p>
      </Card>
    </main>
  );
}
