'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  challengeAnswer: z.string().min(1, '请输入验证答案')
});

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const challenge = useQuery({ queryKey: ['register-challenge'], queryFn: authApi.challenge, staleTime: 0 });
  const { register, handleSubmit, watch, formState } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '', username: '', password: '', challengeAnswer: '' } });
  const password = watch('password') || '';
  const strength = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;

  const submit = handleSubmit(async (values) => {
    try {
      if (!challenge.data?.challengeId) {
        toast.error('验证题加载失败，请刷新验证');
        return;
      }
      const data = await authApi.register({
        email: values.email,
        username: values.username,
        password: values.password,
        challengeId: challenge.data.challengeId,
        challengeAnswer: values.challengeAnswer
      });
      setAuth(data.accessToken, data.user?.email || values.email);
      toast.success('注册成功');
      router.push('/products');
    } catch (error: any) {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.message || '注册失败，请检查信息后重试');
      challenge.refetch();
    }
  });

  return (
    <main className="mx-auto grid min-h-[76vh] max-w-md place-items-center px-4 py-12">
      <Card className="w-full">
        <h1 className="text-3xl font-black">创建账号</h1>
        <p className="mt-2 text-sm text-muted">注册后可用邮箱或用户名登录。用户名只允许字母、数字和下划线。</p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold">邮箱<Input {...register('email')} placeholder="you@example.com" /></label>
          <label className="grid gap-2 text-sm font-bold">用户名<Input {...register('username')} placeholder="例如 payu_user" /></label>
          <label className="grid gap-2 text-sm font-bold">密码<PasswordInput {...register('password')} placeholder="至少8位，包含大小写和数字" /></label>
          <div className="grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-2 rounded ${strength >= i ? 'bg-emerald-300' : 'bg-white/10'}`} />)}</div>
          <div className="grid gap-2 rounded-lg bg-white/6 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold">简单验证：{challenge.data?.question || '加载中...'}</span>
              <Button type="button" variant="secondary" onClick={() => challenge.refetch()}>换一题</Button>
            </div>
            <Input {...register('challengeAnswer')} placeholder="请输入答案" />
          </div>
          <Button disabled={formState.isSubmitting}>注册</Button>
        </form>
        <p className="mt-5 text-sm text-muted">已有账号？<Link className="font-bold text-emerald-300" href="/auth/login">去登录</Link></p>
      </Card>
    </main>
  );
}
