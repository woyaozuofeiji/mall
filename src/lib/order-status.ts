import type { Locale } from '@/lib/types';

export type StorefrontOrderStatus = 'new' | 'confirmed' | 'awaiting_payment' | 'processing' | 'shipped' | 'cancelled';

export interface OrderStatusMeta {
  label: string;
  title: string;
  description: string;
  paymentLabel: string;
  badgeClassName: string;
  panelClassName: string;
}

export interface OrderTimelineStep {
  key: string;
  label: string;
  state: 'complete' | 'current' | 'pending';
}

export function getOrderStatusMeta(status: StorefrontOrderStatus, locale: Locale): OrderStatusMeta {
  const zh = locale === 'zh';

  switch (status) {
    case 'new':
      return {
        label: zh ? '已创建' : 'Order received',
        title: zh ? '订单已创建，等待系统确认' : 'The order has been created and is awaiting confirmation',
        description: zh
          ? '我们正在校验订单资料。确认完成后，系统会推进到付款或履约阶段。'
          : 'We are validating the order details before moving it into payment or fulfillment.',
        paymentLabel: zh ? '待确认' : 'Pending review',
        badgeClassName: 'bg-[#f5f0ff] text-[#6c55c6] ring-[rgba(131,102,255,0.24)]',
        panelClassName: 'bg-[linear-gradient(180deg,#faf7ff_0%,#fffdfd_100%)] ring-[rgba(226,216,255,0.95)]',
      };
    case 'awaiting_payment':
      return {
        label: zh ? '待付款' : 'Payment pending',
        title: zh ? '等待完成付款' : 'Awaiting payment completion',
        description: zh
          ? '订单已经创建。付款确认后，系统会立即将订单推进到确认与备货队列。'
          : 'The order has been created. Once payment is confirmed, it will move straight into confirmation and fulfillment.',
        paymentLabel: zh ? '待付款' : 'Pending',
        badgeClassName: 'bg-[#fff3f6] text-[#ff6d88] ring-[rgba(248,192,205,0.62)]',
        panelClassName: 'bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] ring-[rgba(241,225,230,0.95)]',
      };
    case 'confirmed':
      return {
        label: zh ? '已确认' : 'Confirmed',
        title: zh ? '付款已记录，订单已确认' : 'Payment recorded and order confirmed',
        description: zh
          ? '我们已经记录本次付款。订单正排入履约队列，接下来会进入仓配复核与备货。'
          : 'We have recorded the payment and queued the order for fulfillment. Warehouse review and preparation come next.',
        paymentLabel: zh ? '已付款' : 'Paid',
        badgeClassName: 'bg-[#eef8f1] text-[#25734f] ring-[rgba(108,190,142,0.28)]',
        panelClassName: 'bg-[linear-gradient(180deg,#f3fbf6_0%,#fffdfd_100%)] ring-[rgba(214,238,223,0.95)]',
      };
    case 'processing':
      return {
        label: zh ? '处理中' : 'Processing',
        title: zh ? '订单正在备货处理' : 'The order is being prepared',
        description: zh
          ? '仓配团队正在核对商品、包装与出库安排。发货后会同步最新物流信息。'
          : 'The fulfillment team is verifying items, packaging and dispatch arrangements. Tracking updates will appear after shipment.',
        paymentLabel: zh ? '已付款' : 'Paid',
        badgeClassName: 'bg-[#eef4ff] text-[#3856b5] ring-[rgba(120,149,255,0.28)]',
        panelClassName: 'bg-[linear-gradient(180deg,#f4f8ff_0%,#fffdfd_100%)] ring-[rgba(216,227,255,0.95)]',
      };
    case 'shipped':
      return {
        label: zh ? '已发货' : 'Shipped',
        title: zh ? '包裹已发出' : 'The package is on the way',
        description: zh
          ? '订单已经完成出库，后续运输进度会根据物流承运商的更新持续同步。'
          : 'The parcel has left the warehouse and future movement will follow carrier updates.',
        paymentLabel: zh ? '已付款' : 'Paid',
        badgeClassName: 'bg-[#eef5ff] text-[#1f5da8] ring-[rgba(131,167,255,0.28)]',
        panelClassName: 'bg-[linear-gradient(180deg,#f2f7ff_0%,#fffdfd_100%)] ring-[rgba(214,227,255,0.95)]',
      };
    case 'cancelled':
      return {
        label: zh ? '已取消' : 'Cancelled',
        title: zh ? '订单已关闭' : 'The order has been closed',
        description: zh
          ? '如果你仍需要这笔订单，请联系客户支持确认恢复或重新下单。'
          : 'If you still need this order, please contact support to review reinstatement or place a new order.',
        paymentLabel: zh ? '已关闭' : 'Closed',
        badgeClassName: 'bg-[#f8f1f4] text-[#a5566c] ring-[rgba(206,154,174,0.28)]',
        panelClassName: 'bg-[linear-gradient(180deg,#fbf5f7_0%,#fffdfd_100%)] ring-[rgba(241,225,230,0.95)]',
      };
    default:
      return getOrderStatusMeta('new', locale);
  }
}

export function getOrderTimeline(status: StorefrontOrderStatus, locale: Locale): OrderTimelineStep[] {
  const labels =
    locale === 'zh'
      ? [
          { key: 'placed', label: '订单创建' },
          { key: 'payment', label: '付款确认' },
          { key: 'processing', label: '备货处理' },
          { key: 'shipped', label: '包裹发出' },
        ]
      : [
          { key: 'placed', label: 'Order placed' },
          { key: 'payment', label: 'Payment received' },
          { key: 'processing', label: 'Processing' },
          { key: 'shipped', label: 'Shipped' },
        ];

  const completeIndexMap: Record<StorefrontOrderStatus, number> = {
    new: -1,
    awaiting_payment: 0,
    confirmed: 1,
    processing: 1,
    shipped: 3,
    cancelled: 0,
  };

  const currentIndexMap: Record<StorefrontOrderStatus, number> = {
    new: 0,
    awaiting_payment: 1,
    confirmed: 2,
    processing: 2,
    shipped: -1,
    cancelled: -1,
  };

  const completeIndex = completeIndexMap[status];
  const currentIndex = currentIndexMap[status];

  return labels.map((item, index) => ({
    ...item,
    state: index <= completeIndex ? 'complete' : index === currentIndex ? 'current' : 'pending',
  }));
}
