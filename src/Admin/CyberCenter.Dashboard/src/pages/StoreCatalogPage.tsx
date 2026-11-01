import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Plus,
  Search,
  Tag,
  AlertTriangle,
  Package,
  Layers,
  CheckCircle2,
  XCircle,
  X,
  Trash2,
} from 'lucide-react';

interface ProductItem {
  id: string;
  categoryId: string;
  categoryName: string;
  nameAr: string;
  nameEn: string;
  price: number;
  cost: number;
  stockQuantity: number;
  isAvailable: boolean;
}

const initialProducts: ProductItem[] = [
  {
    id: 'p1',
    categoryId: 'c1',
    categoryName: 'مشروبات باردة',
    nameAr: 'مشروب طاقة ريدبول (Red Bull)',
    nameEn: 'Red Bull Energy Drink',
    price: 1500,
    cost: 1100,
    stockQuantity: 38,
    isAvailable: true,
  },
  {
    id: 'p2',
    categoryId: 'c1',
    categoryName: 'مشروبات باردة',
    nameAr: 'بيبسي مثلج علبة (Pepsi Can)',
    nameEn: 'Pepsi Ice Cold Can',
    price: 500,
    cost: 350,
    stockQuantity: 72,
    isAvailable: true,
  },
  {
    id: 'p3',
    categoryId: 'c2',
    categoryName: 'مشروبات ساخنة',
    nameAr: 'قهوة إسبريسو مزدوجة',
    nameEn: 'Double Espresso',
    price: 600,
    cost: 200,
    stockQuantity: 50,
    isAvailable: true,
  },
  {
    id: 'p4',
    categoryId: 'c3',
    categoryName: 'وجبات وسناكس',
    nameAr: 'برجر دجاج مقرمش مع بطاطس',
    nameEn: 'Crispy Chicken Burger & Fries',
    price: 2500,
    cost: 1600,
    stockQuantity: 14,
    isAvailable: true,
  },
  {
    id: 'p5',
    categoryId: 'c3',
    categoryName: 'وجبات وسناكس',
    nameAr: 'شيبس دوريتوس حار كبير',
    nameEn: 'Doritos Spicy Large',
    price: 800,
    cost: 550,
    stockQuantity: 4,
    isAvailable: true,
  },
  {
    id: 'p6',
    categoryId: 'c4',
    categoryName: 'إكسسوارات',
    nameAr: 'سماعة ألعاب احترافية HyperX',
    nameEn: 'HyperX Gaming Headset',
    price: 18000,
    cost: 14000,
    stockQuantity: 0,
    isAvailable: false,
  },
];

export const StoreCatalogPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('مشروبات باردة');
  const [newPrice, setNewPrice] = useState(1000);
  const [newCost, setNewCost] = useState(700);
  const [newStock, setNewStock] = useState(24);

  const categories = ['All', 'مشروبات باردة', 'مشروبات ساخنة', 'وجبات وسناكس', 'إكسسوارات'];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stockQuantity, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim()) return;

    const newProd: ProductItem = {
      id: `p-${Date.now()}`,
      categoryId: 'c-custom',
      categoryName: newCategoryName,
      nameAr: newNameAr.trim(),
      nameEn: newNameEn.trim() || newNameAr.trim(),
      price: Number(newPrice) || 0,
      cost: Number(newCost) || 0,
      stockQuantity: Number(newStock) || 0,
      isAvailable: Number(newStock) > 0,
    };

    setProducts([newProd, ...products]);
    setShowAddModal(false);
    setNewNameAr('');
    setNewNameEn('');
    setNewPrice(1000);
    setNewCost(700);
    setNewStock(24);
  };

  const toggleAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm(t('هل أنت متأكد من حذف هذا المنتج؟'))) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-cyan-400" />
            {t('المتجر والمنتجات (Store Catalog)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('إدارة قائمة المشروبات والوجبات الخفيفة والأسعار ومتابعة المخزون اللحظي')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>{t('إضافة منتج جديد')}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي الأصناف')}</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{totalProducts}</span>
            <span className="text-xs text-slate-500">{t('منتج مسجل')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('قيمة المخزون الإجمالية')}</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{totalValue.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('تنبيه كمية منخفضة')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{lowStockCount}</span>
            <span className="text-xs text-slate-500">{t('أصناف أوشكت على النفاد')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('أصناف غير متوفرة')}</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">{outOfStockCount}</span>
            <span className="text-xs text-slate-500">{t('نفد من المستودع')}</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-500 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('البحث باسم المنتج بالعربية أو الإنجليزية...')}
            className="w-full pl-4 pr-10 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat === 'All' ? t('الكل') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('المنتج')}</th>
                <th className="px-4 py-3 font-semibold">{t('التصنيف')}</th>
                <th className="px-4 py-3 font-semibold">{t('سعر البيع')}</th>
                <th className="px-4 py-3 font-semibold">{t('تكلفة الشراء')}</th>
                <th className="px-4 py-3 font-semibold">{t('المخزون المتاح')}</th>
                <th className="px-4 py-3 font-semibold">{t('الحالة')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('الإجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    {t('لا توجد منتجات تطابق معايير البحث.')}
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-100">{prod.nameAr}</div>
                      <div className="text-xs text-slate-500 font-sans">{prod.nameEn}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800/60 text-slate-300 border border-slate-700/60">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        {prod.categoryName}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {prod.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 mr-1 rtl:mr-1 ltr:ml-1">ر.ي</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono text-slate-400 text-xs">
                        {prod.cost.toLocaleString()} ر.ي
                      </span>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        ربح: +{(prod.price - prod.cost).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {prod.stockQuantity === 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {t('نفد المخزون')} (0)
                        </span>
                      ) : prod.stockQuantity <= 5 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {t('منخفض')} ({prod.stockQuantity})
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-slate-200">
                          {prod.stockQuantity} {t('قطعة')}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleAvailability(prod.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                          prod.isAvailable && prod.stockQuantity > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {prod.isAvailable && prod.stockQuantity > 0 ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t('متاح للطلب')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>{t('معطل')}</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title={t('حذف المنتج')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>{t('إضافة منتج جديد للمتجر')}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('اسم المنتج بالعربية')} *
                </label>
                <input
                  type="text"
                  required
                  value={newNameAr}
                  onChange={(e) => setNewNameAr(e.target.value)}
                  placeholder="مشروب طاقة ريدبول"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('الاسم بالإنجليزية (اختياري)')}
                </label>
                <input
                  type="text"
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  placeholder="Red Bull Energy Drink"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('التصنيف')}
                  </label>
                  <select
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="مشروبات باردة">مشروبات باردة</option>
                    <option value="مشروبات ساخنة">مشروبات ساخنة</option>
                    <option value="وجبات وسناكس">وجبات وسناكس</option>
                    <option value="إكسسوارات">إكسسوارات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('الكمية الافتتاحية للمخزون')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('سعر البيع للزبون (ر.ي)')} *
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-cyan-400 font-bold font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('سعر التكلفة والشراء (ر.ي)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newCost}
                    onChange={(e) => setNewCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  {t('إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-cyan-500/20"
                >
                  {t('حفظ المنتج')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
