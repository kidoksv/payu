import http from 'node:http';
import { randomUUID } from 'node:crypto';
import QRCode from 'qrcode';

const PORT = Number(process.env.DEMO_PORT || 4000);
const RECEIVE_ADDRESS = 'TWEaLoQqKWnxdvARfULsm9R94bKk3rnWis';

const users = new Map();
const products = [
  {
    id: 1,
    sku: 'VIRTUAL-001',
    name: '虚拟商品体验包',
    description: '用于本地测试的虚拟商品，下单后可模拟 USDT(TRC20) 到账。',
    price: 100,
    stock: 9999
  },
  {
    id: 2,
    sku: 'VIRTUAL-002',
    name: '高级会员兑换码',
    description: '演示库存、订单和自动确认支付流程。',
    price: 188,
    stock: 500
  }
];
const orders = new Map();
const transactions = [];
let sequence = 1;
const reservedAmounts = new Set();

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function html(res, body) {
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(body);
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function orderNo() {
  const d = new Date();
  const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `ORD${day}${String(sequence++).padStart(4, '0')}`;
}

function uniqueAmount(base) {
  for (let i = 1; i <= 9999; i += 1) {
    const amount = (base + i / 100).toFixed(2);
    if (!reservedAmounts.has(amount)) {
      reservedAmounts.add(amount);
      return amount;
    }
  }
  throw new Error('no unique amount available');
}

function ui() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>USDT(TRC20) 支付测试环境</title>
  <style>
    :root {
      --bg: #f6f7f9;
      --panel: #ffffff;
      --ink: #15202b;
      --muted: #607083;
      --line: #d9e0e7;
      --accent: #0f8f72;
      --danger: #b42318;
      --soft: #eef8f5;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--ink);
    }
    header {
      background: #102820;
      color: #fff;
      padding: 22px clamp(18px, 4vw, 48px);
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    header h1 { margin: 0; font-size: clamp(20px, 3vw, 30px); letter-spacing: 0; }
    header p { margin: 6px 0 0; color: #c9ded8; }
    main { max-width: 1180px; margin: 0 auto; padding: 24px clamp(14px, 4vw, 34px) 42px; }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 18px; align-items: start; }
    section, aside {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      box-shadow: 0 1px 2px rgba(18, 28, 45, .04);
    }
    h2 { margin: 0 0 14px; font-size: 18px; }
    .products { display: grid; gap: 12px; }
    .product {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: center;
    }
    .product strong { display: block; font-size: 16px; margin-bottom: 4px; }
    .muted { color: var(--muted); font-size: 13px; line-height: 1.5; }
    .price { font-size: 18px; font-weight: 800; color: var(--accent); }
    button {
      border: 0;
      border-radius: 7px;
      padding: 10px 13px;
      background: var(--accent);
      color: #fff;
      font-weight: 700;
      cursor: pointer;
      min-height: 40px;
    }
    button.secondary { background: #274862; }
    button.warning { background: var(--danger); }
    button:disabled { opacity: .55; cursor: not-allowed; }
    input {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 7px;
      padding: 10px 12px;
      min-height: 40px;
      font-size: 14px;
    }
    label { display: grid; gap: 6px; color: var(--muted); font-size: 13px; margin-bottom: 10px; }
    .auth { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; }
    .paybox { display: grid; gap: 12px; }
    .qr { width: 210px; height: 210px; border: 1px solid var(--line); border-radius: 8px; padding: 8px; background: #fff; }
    .kv { display: grid; gap: 8px; }
    .kv div { display: grid; grid-template-columns: 92px 1fr; gap: 8px; align-items: start; }
    code {
      background: #f0f3f6;
      border: 1px solid #dce3ea;
      border-radius: 6px;
      padding: 4px 6px;
      word-break: break-all;
    }
    .status {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 5px 9px;
      border-radius: 999px;
      background: var(--soft);
      color: var(--accent);
      font-size: 13px;
      font-weight: 800;
    }
    .logs { margin-top: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; border-bottom: 1px solid var(--line); padding: 9px 6px; vertical-align: top; }
    th { color: var(--muted); font-weight: 700; }
    @media (max-width: 920px) {
      .grid { grid-template-columns: 1fr; }
      .auth { grid-template-columns: 1fr; }
      .product { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>USDT(TRC20) 自动支付测试环境</h1>
      <p>单地址收款 + 唯一金额识别 + 模拟链上到账确认</p>
    </div>
    <div class="status" id="systemStatus">Demo Ready</div>
  </header>

  <main>
    <section style="margin-bottom:18px">
      <h2>测试账号</h2>
      <div class="auth">
        <label>邮箱<input id="email" value="demo@example.com" /></label>
        <label>密码<input id="password" value="Password123!" type="password" /></label>
        <button onclick="login()">注册 / 登录</button>
      </div>
      <p class="muted" id="authState">未登录。点击按钮后会获得本地测试 token。</p>
    </section>

    <div class="grid">
      <section>
        <h2>商品列表</h2>
        <div class="products" id="products"></div>

        <div class="logs">
          <h2>链上交易记录</h2>
          <table>
            <thead><tr><th>txid</th><th>from</th><th>to</th><th>amount</th><th>time</th></tr></thead>
            <tbody id="txs"><tr><td colspan="5" class="muted">暂无交易</td></tr></tbody>
          </table>
        </div>
      </section>

      <aside>
        <h2>订单支付</h2>
        <div id="orderBox" class="muted">请先登录并创建订单。</div>
      </aside>
    </div>
  </main>

  <script>
    let token = '';
    let currentOrder = null;

    async function api(path, options = {}) {
      const res = await fetch(path, {
        ...options,
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: 'Bearer ' + token } : {}),
          ...(options.headers || {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'request failed');
      return data;
    }

    async function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      token = data.accessToken;
      document.getElementById('authState').textContent = '已登录：' + email;
    }

    async function loadProducts() {
      const data = await api('/api/products');
      document.getElementById('products').innerHTML = data.map(p => \`
        <div class="product">
          <div>
            <strong>\${p.name}</strong>
            <div class="muted">SKU: \${p.sku} · 库存: \${p.stock}</div>
            <div class="muted">\${p.description}</div>
          </div>
          <div>
            <div class="price">\${p.price.toFixed(2)} USDT</div>
            <button onclick="createOrder(\${p.id})">下单</button>
          </div>
        </div>
      \`).join('');
    }

    async function createOrder(productId) {
      if (!token) await login();
      currentOrder = await api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: 1 })
      });
      renderOrder();
      loadProducts();
    }

    async function simulatePayment() {
      if (!currentOrder) return;
      const result = await api('/api/demo/simulate-payment', {
        method: 'POST',
        body: JSON.stringify({ orderNo: currentOrder.orderNo })
      });
      currentOrder = result.order;
      renderOrder();
      loadTransactions();
    }

    async function refreshStatus() {
      if (!currentOrder) return;
      currentOrder = await api('/api/orders/' + currentOrder.orderNo + '/payment-status');
      renderOrder();
    }

    function renderOrder() {
      const paid = currentOrder.status === 'PAID';
      document.getElementById('orderBox').innerHTML = \`
        <div class="paybox">
          <span class="status">\${currentOrder.status}</span>
          <img class="qr" src="\${currentOrder.qrCodeDataUrl}" alt="USDT payment qr" />
          <div class="kv">
            <div><span class="muted">订单号</span><code>\${currentOrder.orderNo}</code></div>
            <div><span class="muted">收款地址</span><code>\${currentOrder.payAddress}</code></div>
            <div><span class="muted">应付金额</span><code>\${currentOrder.payAmount} USDT</code></div>
            <div><span class="muted">网络</span><code>Tron Mainnet / TRC20</code></div>
            <div><span class="muted">txid</span><code>\${currentOrder.txid || '-'}</code></div>
          </div>
          <button class="secondary" onclick="refreshStatus()">刷新状态</button>
          <button class="\${paid ? 'secondary' : 'warning'}" onclick="simulatePayment()" \${paid ? 'disabled' : ''}>模拟链上到账</button>
          <p class="muted">真实生产环境中，这一步由 TronGrid 监听任务自动完成。</p>
        </div>
      \`;
    }

    async function loadTransactions() {
      const data = await api('/api/transactions');
      document.getElementById('txs').innerHTML = data.length ? data.map(t => \`
        <tr><td><code>\${t.txid}</code></td><td>\${t.fromAddress}</td><td>\${t.toAddress}</td><td>\${t.amount}</td><td>\${new Date(t.createdAt).toLocaleString()}</td></tr>
      \`).join('') : '<tr><td colspan="5" class="muted">暂无交易</td></tr>';
    }

    loadProducts();
    loadTransactions();
  </script>
</body>
</html>`;
}

async function createOrder(body) {
  const product = products.find((p) => p.id === Number(body.productId));
  if (!product) return [404, { message: 'product not found' }];
  if (product.stock < Number(body.quantity || 1)) return [400, { message: 'insufficient stock' }];
  product.stock -= Number(body.quantity || 1);
  const baseAmount = product.price * Number(body.quantity || 1);
  const payAmount = uniqueAmount(baseAmount);
  const tronUri = `tron:${RECEIVE_ADDRESS}?amount=${payAmount}&token=USDT`;
  const qrCodeDataUrl = await QRCode.toDataURL(tronUri);
  const order = {
    id: orders.size + 1,
    orderNo: orderNo(),
    productId: product.id,
    quantity: Number(body.quantity || 1),
    productAmount: baseAmount.toFixed(2),
    payAmount,
    payAddress: RECEIVE_ADDRESS,
    qrCodeDataUrl,
    status: 'PENDING_PAYMENT',
    txid: null,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString()
  };
  orders.set(order.orderNo, order);
  return [200, order];
}

function simulatePayment(orderNoValue) {
  const order = orders.get(orderNoValue);
  if (!order) return [404, { message: 'order not found' }];
  if (order.status === 'PAID') return [200, { order }];
  const tx = {
    txid: randomUUID().replaceAll('-', ''),
    fromAddress: 'TMockPayerAddressForLocalDemoOnly',
    toAddress: order.payAddress,
    amount: `${Number(order.payAmount).toFixed(6)}`,
    blockNumber: Math.floor(65000000 + Math.random() * 100000),
    confirmations: 1,
    createdAt: new Date().toISOString()
  };
  transactions.unshift(tx);
  order.status = 'PAID';
  order.txid = tx.txid;
  order.paidAt = tx.createdAt;
  reservedAmounts.delete(order.payAmount);
  return [200, { order, transaction: tx }];
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/') return html(res, ui());
    if (req.method === 'GET' && url.pathname === '/api/products') return json(res, 200, products);
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJson(req);
      users.set(body.email, { email: body.email });
      return json(res, 200, { accessToken: Buffer.from(`${body.email}:${Date.now()}`).toString('base64'), tokenType: 'Bearer' });
    }
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      const [status, payload] = await createOrder(await readJson(req));
      return json(res, status, payload);
    }
    const orderStatusMatch = url.pathname.match(/^\/api\/orders\/([^/]+)\/payment-status$/);
    if (req.method === 'GET' && orderStatusMatch) {
      const order = orders.get(orderStatusMatch[1]);
      return order ? json(res, 200, order) : json(res, 404, { message: 'order not found' });
    }
    if (req.method === 'POST' && url.pathname === '/api/demo/simulate-payment') {
      const [status, payload] = simulatePayment((await readJson(req)).orderNo);
      return json(res, status, payload);
    }
    if (req.method === 'GET' && url.pathname === '/api/transactions') return json(res, 200, transactions);
    return json(res, 404, { message: 'not found' });
  } catch (error) {
    return json(res, 500, { message: error.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`USDT TRC20 demo running at http://127.0.0.1:${PORT}`);
});
