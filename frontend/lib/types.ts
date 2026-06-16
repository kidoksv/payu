export type Product = {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id?: number;
  orderNo: string;
  userId?: number;
  productId?: number;
  quantity?: number;
  productAmount?: string;
  payAmount: string;
  payAddress: string;
  qrCodeDataUrl?: string;
  status: 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  txid?: string;
  expiresAt?: string;
  createdAt?: string;
  paidAt?: string | null;
};

export type Payment = {
  id: number;
  orderId: number;
  txid: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  blockNumber?: number;
  confirmations: number;
  status: string;
  paidAt?: string;
  createdAt: string;
};

export type PaymentLog = {
  id: number;
  orderId?: number;
  txid?: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  event: string;
  message: string;
  context?: unknown;
  createdAt: string;
};

export type User = {
  id: number;
  email: string;
  username?: string;
  status: 'ACTIVE' | 'FROZEN';
  createdAt: string;
};
