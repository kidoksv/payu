export default () => ({
  appName: process.env.APP_NAME || 'usdt-trc20-payment',
  paymentExpireMinutes: Number(process.env.PAYMENT_EXPIRE_MINUTES || 30),
  minConfirmations: Number(process.env.MIN_CONFIRMATIONS || 1),
  defaultReceiveAddress: process.env.DEFAULT_RECEIVE_ADDRESS || 'TWEaLoQqKWnxdvARfULsm9R94bKk3rnWis',
  usdtContract: process.env.TRON_USDT_CONTRACT || 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj',
  signingSecret: process.env.SIGNING_SECRET || 'change-me'
});
