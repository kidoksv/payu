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
  email: z.email(),
  username: z.string().optional(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  captcha: z.string().min(4)
});

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, watch, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { captcha: 'PAYU' } });
  const password = watch('password') || '';
  const strength = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;

  const submit = handleSubmit(async (values) => {
    try {
      const data = await authApi.register(values.email, values.password);
      setAuth(data.accessToken, values.email);
      toast.success('注册成功');
      router.push('/products');
    } catch {
      toast.error('注册失败，邮箱可能已存在');
    }
  });

  return (
    <main className="mx-auto grid min-h-[76vh] max-w-md place-items-center px-4 py-12">
      <Card className="w-full">
        <h1 className="text-3xl font-black">创建账号</h1>
        <p className="mt-2 text-sm text-muted">邮箱注册后即可购买虚拟商品。</p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold">邮箱<Input {...register('email')} /></label>
          <label className="grid gap-2 text-sm font-bold">用户名<Input {...register('username')} placeholder="预留字段" /></label>
          <label className="grid gap-2 text-sm font-bold">密码<PasswordInput {...register('password')} placeholder="至少8位，包含大小写和数字" /></label>
          <div className="grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-2 rounded ${strength >= i ? 'bg-emerald-300' : 'bg-white/10'}`} />)}</div>
          <label className="grid gap-2 text-sm font-bold">图形验证码<Input {...register('captcha')} /></label>
          <Button disabled={formState.isSubmitting}>注册</Button>
        </form>
        <p className="mt-5 text-sm text-muted">已有账号？<Link className="font-bold text-emerald-300" href="/auth/login">去登录</Link></p>
      </Card>
    </main>
  );
}
