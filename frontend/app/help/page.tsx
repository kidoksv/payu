import { Card, SectionTitle } from '@/components/ui/card';

const groups = [
  ['FAQ', ['如何创建订单？', '付款多久确认？', '为什么金额有小数？']],
  ['支付教程', ['复制收款地址', '选择 TRC20 网络', '准确支付订单金额']],
  ['USDT充值教程', ['从交易所提币', '使用自有钱包转账', '查询 Tronscan 记录']],
  ['订单问题', ['超时未付款会取消', '少付会记录异常', '重复 txid 不会重复入账']],
  ['退款说明', ['虚拟商品自动发货后通常不支持退款', '异常支付可联系人工处理']]
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <SectionTitle eyebrow="Help Center" title="帮助中心" desc="了解 USDT、TRC20 网络、订单支付和异常处理。" />
      <div className="grid gap-5 md:grid-cols-2">
        {groups.map(([title, items]) => (
          <Card key={title as string}>
            <h2 className="text-xl font-black">{title as string}</h2>
            <div className="mt-4 grid gap-3">
              {(items as string[]).map((item) => <div key={item} className="rounded-lg bg-white/6 p-3 text-sm text-muted">{item}</div>)}
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
