import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Bell,
  Monitor,
  Flame,
  Check,
  RotateCcw,
} from 'lucide-react';

interface KdsOrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface KdsOrder {
  id: string;
  orderNumber: string;
  stationNumber: number;
  stationName: string;
  status: 'New' | 'Preparing' | 'Delivered';
  createdAt: string;
  elapsedMinutes: number;
  customerNotes?: string;
  items: KdsOrderItem[];
  totalAmount: number;
}

const initialOrders: KdsOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-101',
    stationNumber: 4,
    stationName: 'Station-04 (VIP)',
    status: 'New',
    createdAt: '16:42',
    elapsedMinutes: 3,
    customerNotes: 'مشروب بارد جداً وبدون ثلج رجاءً',
    items: [
      { productName: 'مشروب طاقة ريدبول (Red Bull)', quantity: 1, unitPrice: 1500 },
      { productName: 'برجر دجاج مقرمش مع بطاطس', quantity: 1, unitPrice: 2500 },
    ],
    totalAmount: 4000,
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-102',
    stationNumber: 2,
    stationName: 'Station-02',
    status: 'New',
    createdAt: '16:44',
    elapsedMinutes: 1,
    items: [
      { productName: 'بيبسي مثلج علبة (Pepsi Can)', quantity: 2, unitPrice: 500 },
      { productName: 'شيبس دوريتوس حار كبير', quantity: 1, unitPrice: 800 },
    ],
    totalAmount: 1800,
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-100',
    stationNumber: 7,
    stationName: 'Station-07',
    status: 'Preparing',
    createdAt: '16:35',
    elapsedMinutes: 10,
    customerNotes: 'القهوة سكر زيادة',
    items: [
      { productName: 'قهوة إسبريسو مزدوجة', quantity: 2, unitPrice: 600 },
    ],
    totalAmount: 1200,
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-099',
    stationNumber: 1,
    stationName: 'Station-01 (VIP)',
    status: 'Delivered',
    createdAt: '16:15',
    elapsedMinutes: 30,
    items: [
      { productName: 'مشروب طاقة ريدبول', quantity: 2, unitPrice: 1500 },
    ],
    totalAmount: 3000,
  },
];

export const KitchenKdsPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<KdsOrder[]>(initialOrders);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const newOrders = orders.filter((o) => o.status === 'New');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing');
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');

  const moveToPreparing = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Preparing' } : o))
    );
  };

  const moveToDelivered = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Delivered' } : o))
    );
  };

  const resetToNew = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'New' } : o))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <ChefHat className="w-7 h-7 text-amber-400" />
            {t('شاشة المطبخ والطلبات (Kitchen KDS)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('متابعة وتجهيز وتسليم طلبات الزوار والمحطات في الوقت الفعلي بنظام العرض المباشر')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{soundEnabled ? t('التنبيه الصوتي مفعّل') : t('كتم الصوت')}</span>
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: New Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="font-bold text-slate-100 text-sm">
                {t('طلبات جديدة قيد الانتظار')}
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {newOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                {t('لا توجد طلبات جديدة حالياً.')}
              </div>
            ) : (
              newOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-900 border-2 border-amber-500/40 shadow-lg shadow-amber-500/5 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span className="font-black text-slate-100 text-base">
                        المحطة #{order.stationNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>منذ {order.elapsedMinutes} دقيقة ({order.createdAt})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-200 font-medium">
                          <span className="text-amber-400 font-black ml-1 rtl:ml-1 ltr:mr-1">
                            {item.quantity}x
                          </span>{' '}
                          {item.productName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {(item.quantity * item.unitPrice).toLocaleString()} ر.ي
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.customerNotes && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <span className="font-bold">ملاحظات الزبون: </span>
                      {order.customerNotes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-xs font-mono">
                      الإجمالي: {order.totalAmount.toLocaleString()} ر.ي
                    </span>

                    <button
                      onClick={() => moveToPreparing(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md"
                    >
                      <span>بدء التجهيز</span>
                      <Flame className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-cyan-400 animate-bounce" />
              <h2 className="font-bold text-slate-100 text-sm">
                {t('قيد التجهيز والإعداد')}
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-cyan-500 text-slate-950">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                {t('لا توجد طلبات قيد الإعداد.')}
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-900 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/5 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span className="font-black text-slate-100 text-base">
                        المحطة #{order.stationNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>جارِ الإعداد • {order.elapsedMinutes} د</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-200 font-medium">
                          <span className="text-cyan-400 font-black ml-1 rtl:ml-1 ltr:mr-1">
                            {item.quantity}x
                          </span>{' '}
                          {item.productName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {(item.quantity * item.unitPrice).toLocaleString()} ر.ي
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.customerNotes && (
                    <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                      <span className="font-bold">ملاحظات الزبون: </span>
                      {order.customerNotes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => resetToNew(order.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-300 transition"
                      title="إعادة للانتظار"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => moveToDelivered(order.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>جاهز للتسليم</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Delivered */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-slate-100 text-sm">
                {t('تم التسليم مؤخراً')}
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950">
              {deliveredOrders.length}
            </span>
          </div>

          <div className="space-y-3">
            {deliveredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                {t('سجل التسليم فارغ.')}
              </div>
            ) : (
              deliveredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 opacity-80 hover:opacity-100 transition"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-200">المحطة #{order.stationNumber} ({order.orderNumber})</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تم التسليم
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-0.5">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.quantity}x {item.productName}
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-between font-mono">
                    <span>الوقت: {order.createdAt}</span>
                    <span className="text-slate-300 font-bold">{order.totalAmount.toLocaleString()} ر.ي</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
