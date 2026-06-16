# USDT(TRC20) 自动支付系统

生产栈：NestJS, TypeORM, MySQL 8, Redis, TronGrid, Docker Compose。

默认收款地址：`TWEaLoQqKWnxdvARfULsm9R94bKk3rnWis`

## 功能闭环

用户注册登录 -> 商品查询 -> 创建订单 -> 生成唯一 USDT 金额和二维码 -> TronGrid 监听 TRC20 USDT 到账 -> txid 幂等 -> 金额匹配 -> 订单改为已支付 -> 后续发货系统可接入。

## 目录结构

```text
src/
  common/              JWT、RBAC、签名、过滤器、拦截器
  config/              应用配置
  domain/              DDD 实体：users/products/orders/payments/wallets/admin
  infrastructure/      MySQL、Redis、TronGrid
  modules/             auth/users/products/orders/payments/wallets/admin/webhooks
  jobs/                Tron 监听、超时订单取消
database/schema.sql    MySQL 8 建表脚本和初始化数据
nginx/                 反向代理配置
scripts/smoke-test.sh  冒烟测试脚本
docs-API.md            REST API 文档和 ER 图
```

## 本地启动

```bash
cp .env.example .env
docker compose up -d --build
```

服务地址：`http://localhost/api/v1`

没有 Docker 时也可以手动准备 MySQL/Redis 后运行：

```bash
npm install
npm run build
npm start
```

## 冒烟测试

```bash
BASE_URL=http://localhost:3000/api/v1 ./scripts/smoke-test.sh
```

## 生产配置

必须修改 `.env`：

- `JWT_SECRET`
- `SIGNING_SECRET`
- `MYSQL_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `TRONGRID_API_KEY`

Nginx 在生产环境应补充 HTTPS 证书、访问日志留存、WAF/限流策略。

## 风控与一致性

- Redis `SET NX` 保证 30 分钟窗口内唯一金额不重复。
- MySQL `transactions.txid` 和 `payments.txid` 唯一索引保证重复 txid 不会重复入账。
- 支付确认使用事务和订单行锁。
- 金额严格匹配应付金额，少付/错付写入 `payment_logs`。
- 超时订单每分钟扫描取消，并回补库存。
- 多实例部署时 Tron 监听器用 Redis 分布式锁避免重复拉取。

## 扩展路线

第一阶段使用单地址 + 唯一金额。

第二阶段可把 `WalletsService` 扩展为策略接口：

- `SINGLE`: 所有订单共用默认地址。
- `ADDRESS_POOL`: 从地址池分配未占用地址给订单。
- `HD`: BIP39/BIP44 派生子地址，记录 `derivation_path`。

归集可新增独立 job：

订单地址 -> 归集钱包 -> 热钱包

归集任务需要私钥管理、TRX 能量/带宽管理、失败重试和人工审批阈值。MVP 中已保留 `wallets.mode`, `wallets.derivation_path`, `wallets.assigned_order_id` 字段。

## 已验证

```bash
npm run build
```

构建通过。

当前机器没有 `docker` 命令，未能在本地执行 `docker compose config`。
