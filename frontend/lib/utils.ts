import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(value: string | number) {
  return `${Number(value).toFixed(2)} USDT`;
}

export function shortHash(value?: string | null) {
  if (!value) return '-';
  return `${value.slice(0, 8)}...${value.slice(-8)}`;
}
