'use client';

import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';
import type { Order, Payment, Product, User } from './types';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
  timeout: 15000
});

adminApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().adminToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (email: string, password: string) => api.post<{ accessToken: string; tokenType: string }>('/auth/register', { email, password }).then((r) => r.data),
  login: (email: string, password: string) => api.post<{ accessToken: string; tokenType: string }>('/auth/login', { email, password }).then((r) => r.data),
  adminLogin: (email: string, password: string) => api.post<{ accessToken: string; tokenType: string }>('/admin/login', { email, password }).then((r) => r.data),
  changePassword: (oldPassword: string, newPassword: string) => api.patch('/auth/password', { oldPassword, newPassword }).then((r) => r.data)
};

export const productApi = {
  list: () => api.get<Product[]>('/products').then((r) => r.data),
  detail: (id: string | number) => api.get<Product>(`/products/${id}`).then((r) => r.data)
};

export const orderApi = {
  create: (productId: number, quantity: number) => api.post<Order>('/orders', { productId, quantity }).then((r) => r.data),
  mine: () => api.get<Order[]>('/orders').then((r) => r.data),
  detail: (id: number) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  paymentStatus: (orderNo: string) => api.get<Order>(`/orders/${orderNo}/payment-status`).then((r) => r.data)
};

export const paymentApi = {
  byOrder: (orderId: number) => api.get<Payment[]>(`/payments/order/${orderId}`).then((r) => r.data),
  mine: () => api.get<Payment[]>('/payments/my').then((r) => r.data)
};

export const adminDataApi = {
  orders: () => adminApi.get<Order[]>('/admin/orders').then((r) => r.data),
  payments: () => adminApi.get<Payment[]>('/admin/payments').then((r) => r.data),
  users: () => adminApi.get<User[]>('/admin/users').then((r) => r.data),
  products: () => adminApi.get<Product[]>('/admin/products').then((r) => r.data),
  createProduct: (payload: { sku: string; name: string; description?: string; price: string; stock: number }) => adminApi.post<Product>('/products', payload).then((r) => r.data),
  updateProduct: (id: number, payload: Partial<{ name: string; description: string; price: string; stock: number; status: 'ACTIVE' | 'INACTIVE' }>) => adminApi.patch<Product>(`/products/${id}`, payload).then((r) => r.data),
  deleteProduct: (id: number) => adminApi.delete<Product>(`/products/${id}`).then((r) => r.data),
  freeze: (id: number) => adminApi.patch(`/admin/users/${id}/freeze`).then((r) => r.data),
  unfreeze: (id: number) => adminApi.patch(`/admin/users/${id}/unfreeze`).then((r) => r.data)
};
