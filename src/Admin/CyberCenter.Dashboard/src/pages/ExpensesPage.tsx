import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  Search,
  Zap,
  Wifi,
  Sparkles,
  X,
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  expenseNumber: string;
  category: 'Electricity' | 'Internet' | 'Supplies' | 'Maintenance' | 'Other';
  amount: number;
  description: string;
  spentBy: string;
  paymentMethod: string;
  createdAt: string;
}

const initialExpenses: ExpenseItem[] = [
  {
    id: 'e1',
    expenseNumber: 'EXP-202611-001',
    category: 'Internet',
    amount: 45000,
    description: 'اشتراك خط الفايبر المخصص للألعاب 1Gbps (شهر نوفمبر)',
    spentBy: 'ضياء المهندس',
    paymentMethod: 'محفظة جوالي',
    createdAt: '2026-11-01',
  },
  {
    id: 'e2',
    expenseNumber: 'EXP-202611-002',
    category: 'Electricity',
    amount: 32000,
    description: 'سداد فاتورة استهلاك الطاقة والكهرباء للمركز',
    spentBy: 'عمر الورد',
    paymentMethod: 'نقداً كاش',
    createdAt: '2026-10-28',
  },
  {
    id: 'e3',
    expenseNumber: 'EXP-202611-003',
    category: 'Supplies',
    amount: 14500,
    description: 'شراء معقمات ومنظفات الشاشات وأكواب ورقية للكاونتر',
    spentBy: 'أحمد السامعي',
    paymentMethod: 'نقداً كاش',
    createdAt: '2026-10-25',
  },
  {
    id: 'e4',
    expenseNumber: 'EXP-202611-004',
    category: 'Maintenance',
    amount: 8000,
    description: 'استبدال كيبل HDMI 2.1 عالي السرعة لمحطة محاكاة القيادة',
    spentBy: 'عمر الورد',
    paymentMethod: 'نقداً كاش',
    createdAt: '2026-10-20',
  },
];

export const ExpensesPage: React.FC = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<'Electricity' | 'Internet' | 'Supplies' | 'Maintenance' | 'Other'>('Supplies');
  const [newAmount, setNewAmount] = useState(5000);
  const [newDescription, setNewDescription] = useState('');
  const [newSpentBy, setNewSpentBy] = useState('مشرف الكاونتر');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Cash');

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.spentBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const internetExpenses = expenses.filter((e) => e.category === 'Internet').reduce((acc, e) => acc + e.amount, 0);
  const energyExpenses = expenses.filter((e) => e.category === 'Electricity').reduce((acc, e) => acc + e.amount, 0);
  const suppliesExpenses = expenses.filter((e) => e.category === 'Supplies' || e.category === 'Maintenance').reduce((acc, e) => acc + e.amount, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || newAmount <= 0) return;

    const newExp: ExpenseItem = {
      id: `e-${Date.now()}`,
      expenseNumber: `EXP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(expenses.length + 1).padStart(3, '0')}`,
      category: newCategory,
      amount: Number(newAmount),
      description: newDescription.trim(),
      spentBy: newSpentBy.trim(),
      paymentMethod: newPaymentMethod === 'Cash' ? 'نقداً كاش' : 'محفظة إلكترونية',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setExpenses([newExp, ...expenses]);
    setShowAddModal(false);
    setNewDescription('');
    setNewAmount(5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Receipt className="w-7 h-7 text-rose-400" />
            {t('المصروفات اليومية والتشغيلية (Expenses)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('توثيق واعتماد المصروفات التشغيلية، فواتير الطاقة والإنترنت، ومشتريات المركز')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold transition shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>{t('تسجيل مصروف جديد')}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي المصروفات')}</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{totalExpenses.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('خطوط الإنترنت والشبكة')}</span>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{internetExpenses.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('الكهرباء والطاقة')}</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{energyExpenses.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('المستلزمات والصيانة')}</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{suppliesExpenses.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
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
            placeholder={t('البحث في وصف المصروف، رقم السند، أو اسم القائم بالصرف...')}
            className="w-full pl-4 pr-10 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'All', label: 'الكل' },
            { id: 'Internet', label: 'الإنترنت والشبكة' },
            { id: 'Electricity', label: 'الكهرباء' },
            { id: 'Supplies', label: 'مستلزمات ونظافة' },
            { id: 'Maintenance', label: 'صيانة وتجهيزات' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat.id
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('رقم السند')}</th>
                <th className="px-4 py-3 font-semibold">{t('التصنيف')}</th>
                <th className="px-4 py-3 font-semibold">{t('بيان المصروف')}</th>
                <th className="px-4 py-3 font-semibold">{t('القائم بالصرف')}</th>
                <th className="px-4 py-3 font-semibold">{t('طريقة الدفع')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('المبلغ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-300 text-xs">
                    {exp.expenseNumber}
                    <div className="text-[10px] text-slate-500 font-normal">{exp.createdAt}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {exp.category === 'Internet' && 'إنترنت وشبكة'}
                      {exp.category === 'Electricity' && 'كهرباء وطاقة'}
                      {exp.category === 'Supplies' && 'مستلزمات'}
                      {exp.category === 'Maintenance' && 'صيانة'}
                      {exp.category === 'Other' && 'أخرى'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-100 max-w-sm truncate">
                    {exp.description}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-400">
                    {exp.spentBy}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-400">
                    {exp.paymentMethod}
                  </td>

                  <td className="px-4 py-3.5 text-center font-mono font-bold text-rose-400 text-sm">
                    -{exp.amount.toLocaleString()} ر.ي
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                <span>{t('تسجيل سند صرف جديد')}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('تصنيف المصروف')} *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="Supplies">مستلزمات ونظافة</option>
                  <option value="Electricity">كهرباء وطاقة</option>
                  <option value="Internet">إنترنت وشبكات</option>
                  <option value="Maintenance">صيانة وإصلاحات</option>
                  <option value="Other">مصروفات أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('المبلغ المصروف (ر.ي)')} *
                </label>
                <input
                  type="number"
                  min="100"
                  step="500"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-base font-bold font-mono text-rose-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('بيان وتفاصيل المصروف')} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="شراء أدوات تنظيف للكاونتر والشاشات..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('القائم بالصرف')}
                  </label>
                  <input
                    type="text"
                    value={newSpentBy}
                    onChange={(e) => setNewSpentBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('طريقة الدفع')}
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Cash">نقداً كاش</option>
                    <option value="Wallet">محفظة إلكترونية</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  {t('إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-rose-500/20"
                >
                  {t('تأكيد وتسجيل')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
