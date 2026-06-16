'use client';

import { Eye, EyeOff } from 'lucide-react';
import { InputHTMLAttributes, useState } from 'react';
import { Input } from './input';
import { Button } from './button';

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-12" />
      <Button
        type="button"
        variant="ghost"
        className="absolute right-1 top-1 min-h-9 px-3"
        aria-label={visible ? '隐藏密码' : '显示密码'}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  );
}
