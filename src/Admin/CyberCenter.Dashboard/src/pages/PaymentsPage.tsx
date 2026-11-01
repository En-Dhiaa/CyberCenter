import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  DollarSign,
  Search,
  Receipt,
  CreditCard,
  Building,
} from 'lucide-react';

interface TransactionItem {
  id: string;
  transactionNumber: string;
  transactionType: 'SessionRevenue' | 'StoreRevenue' | 'MembershipDeposit' | 'Expense';
  amount: number;
  description: string;
  paymentMethod: string;
  createdAt: string;
}

const initialTransactions: TransactionItem[] = [
  {
    id: 't1',
    transactionNumber: 'TXN-20261101-0084',
    transactionType: 'SessionRevenue',
    amount: 1500,
    description: 'تحصيل جلسة مفتوحة محطة VIP #02 (120 دقيقة)',
    paymentMethod: 'نقداً كاش',
    createdAt: '2026-11-01 16:30',
  },
  {
    id: 't2',
    transactionNumber: 'TXN-20261101-0083',
    transactionType: 'StoreRevenue',
    amount: 2500,
    description: 'مبيعات متجر: برجر دجاج مقرمش + بيبسي (محطة #04)',
    paymentMethod: 'محفظة جوالي',
    createdAt: '2026-11-01 16:15',
  },
  {
    id: 't3',
    transactionNumber: 'TXN-20261101-0082',
    transactionType: 'MembershipDeposit',
    amount: 10000,
    description: 'شحن رصيد نقدي للعضو فيصل عبدالرحمن (@faisal_gamer)',
    paymentMethod: 'حساب الكريمي',
    createdAt: '2026-11-01 15:40',
  },
  {
    id: 't4',
    transactionNumber: 'TXN-20261101-0081',
    transactionType: 'SessionRevenue',
    amount: 5000,
    description: 'بيع دفعة كروت مؤقتة (5 كروت فئة 60 دقيقة)',
    paymentMethod: 'نقداً كاش',
    createdAt: '2026-11-01 14:10',
  },
  {
    id: 't5',
    transactionNumber: 'TXN-20261101-0080',
    transactionType: 'Expense',
    amount: 3200,
    description: 'شراء مياه شرب معبأة ومناديل ورقية للكاونتر',
    paymentMethod: 'نقداً كاش',
    createdAt: '2026-11-01 12:25',
  },
];

export const PaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [transactions] = useState<TransactionItem[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || t.transactionType === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalInflow = transactions
    .filter((t) => t.transactionType !== 'Expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const cashInRegister = 145000;
  const electronicWallets = 82500;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Wallet className="w-7 h-7 text-emerald-400" />
            {t('المدفوعات والمحافظ (Payments Ledger)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('سجل القيود المالية لجميع عمليات الدفع، إيرادات الجلسات، وشحن المحافظ الإلكترونية')}
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي إيرادات اليوم')}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{totalInflow.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('النقد في الصندوق (الكاش)')}</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{cashInRegister.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('المحافظ الإلكترونية (جوالي/الكريمي)')}</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{electronicWallets.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي المعاملات')}</span>
            <Building className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{transactions.length}</span>
            <span className="text-xs text-slate-500">{t('حركة مسجلة')}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-500 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('البحث برقم الحركة، البيان، أو اسم العميل...')}
            className="w-full pl-4 pr-10 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'All', label: 'الكل' },
            { id: 'SessionRevenue', label: 'إيراد الجلسات' },
            { id: 'StoreRevenue', label: 'مبيعات المتجر' },
            { id: 'MembershipDeposit', label: 'شحن العضويات' },
            { id: 'Expense', label: 'مصروفات' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterType === type.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('رقم القيد والتاريخ')}</th>
                <th className="px-4 py-3 font-semibold">{t('نوع المعاملة')}</th>
                <th className="px-4 py-3 font-semibold">{t('البيان والتفاصيل')}</th>
                <th className="px-4 py-3 font-semibold">{t('طريقة الدفع')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('المبلغ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-slate-200 text-xs">{txn.transactionNumber}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{txn.createdAt}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    {txn.transactionType === 'SessionRevenue' && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {t('جلسة ألعاب')}
                      </span>
                    )}
                    {txn.transactionType === 'StoreRevenue' && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {t('مبيعات متجر')}
                      </span>
                    )}
                    {txn.transactionType === 'MembershipDeposit' && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {t('إيداع عضوية')}
                      </span>
                    )}
                    {txn.transactionType === 'Expense' && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {t('مصروف تشغيلي')}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-200 max-w-md truncate">
                    {txn.description}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {txn.paymentMethod}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`font-mono font-bold text-sm ${
                        txn.transactionType === 'Expense' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {txn.transactionType === 'Expense' ? '-' : '+'}
                      {txn.amount.toLocaleString()} ر.ي
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
