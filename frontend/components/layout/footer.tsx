import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <div className="text-xl font-black">PayU</div>
          <p className="mt-3 text-sm leading-6 text-muted">面向虚拟商品的 USDT TRC20 自动支付商城。</p>
        </div>
        {[
          ['关于我们', ['公司介绍', '服务协议', '隐私政策']],
          ['支持', ['帮助中心', '支付教程', '订单问题']],
          ['联系我们', ['Telegram', 'support@payu.local', '商务合作']]
        ].map(([title, items]) => (
          <div key={title as string}>
            <h3 className="font-black">{title}</h3>
            <div className="mt-3 grid gap-2 text-sm text-muted">
              {(items as string[]).map((item) => <Link key={item} href="/help">{item}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
