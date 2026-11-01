import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Plus,
  Printer,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';

interface CardBatchItem {
  id: string;
  name: string;
  count: number;
  durationMinutes: number;
  price: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
}

interface PrintableCardPreview {
  code: string;
  pin: string;
  durationMinutes: number;
  price: number;
}

const initialBatches: CardBatchItem[] = [
  { id: '1', name: 'دفعة الويكند - ساعة كاملة (1 Hour)', count: 50, durationMinutes: 60, price: 500, usedCount: 38, expiresAt: '2026-11-30', createdAt: '2026-11-01' },
  { id: '2', name: 'دفعة المحترفين - ساعتان (2 Hours)', count: 30, durationMinutes: 120, price: 900, usedCount: 14, expiresAt: '2026-11-30', createdAt: '2026-11-01' },
  { id: '3', name: 'كروت سريعة - 30 دقيقة (Quick Play)', count: 100, durationMinutes: 30, price: 300, usedCount: 65, expiresAt: '2026-11-15', createdAt: '2026-10-25' },
];

export const TemporaryCardsPage: React.FC = () => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<CardBatchItem[]>(initialBatches);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [printableCards, setPrintableCards] = useState<PrintableCardPreview[] | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form state
  const [batchName, setBatchName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [cardCount, setCardCount] = useState(50);
  const [pricePerCard, setPricePerCard] = useState(500);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName || cardCount <= 0 || durationMinutes <= 0) return;

    // Simulate batch creation and generate printable sample cards
    const newBatch: CardBatchItem = {
      id: Date.now().toString(),
      name: batchName.trim(),
      count: cardCount,
      durationMinutes,
      price: pricePerCard,
      usedCount: 0,
      expiresAt: '2026-12-01',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const samplePrintables: PrintableCardPreview[] = [];
    for (let i = 1; i <= Math.min(cardCount, 12); i++) {
      const p1 = Math.floor(10000000 + Math.random() * 90000000).toString();
      const p2 = Math.floor(10000000 + Math.random() * 90000000).toString();
      const fullPin = `${p1}${p2}`;
      samplePrintables.push({
        code: `CC-****-****-${fullPin.slice(-4)}`,
        pin: fullPin,
        durationMinutes,
        price: pricePerCard,
      });
    }

    setBatches((prev) => [newBatch, ...prev]);
    setPrintableCards(samplePrintables);
    setShowGenerateModal(false);
    notify(`تم توليد دفعة الكروت '${batchName}' بنجاح (${cardCount} كرت بـ PIN عشوائي مشفر).`);
  };

  const handleExportCsv = (batch: CardBatchItem) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'CardBatch,DurationMinutes,Price,ExpiresAt\n' +
      `${batch.name},${batch.durationMinutes},${batch.price},${batch.expiresAt}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Batch_${batch.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`تم تصدير ملف كروت الدفعة ${batch.name} بصيغة CSV.`);
  };

  const filteredBatches = batches.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <CreditCard className="w-5 h-5" />
            </div>
            <span>{t('nav.temporaryCards')}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-gold/10 border border-cyber-gold/30 text-cyber-gold">
              16-DIGIT ENCRYPTED PIN
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            توليد دفعات الكروت المؤقتة برموز PIN مشفرة عشوائياً، الطباعة الفورية، وتصدير PDF / Excel
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {actionNotice && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionNotice}</span>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-cyber-textDark absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالدفعة..."
              className="bg-cyber-card border border-cyber-border rounded-xl ps-9 pe-4 py-2 text-xs text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/50 font-sans"
            />
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold text-xs shadow-glow-cyan hover:from-cyan-400 hover:to-cyan-300 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>توليد دفعة جديدة (Batch)</span>
          </button>
        </div>
      </div>

      {/* Batches Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBatches.map((batch) => {
          const usedPercent = Math.round((batch.usedCount / batch.count) * 100);
          return (
            <div
              key={batch.id}
              className="bg-cyber-card/80 border border-cyber-border hover:border-cyber-borderLight rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-cyber-border/50">
                  <div>
                    <h3 className="font-bold text-sm text-cyber-textMain">{batch.name}</h3>
                    <p className="text-[11px] text-cyber-textDark font-mono mt-0.5">
                      تاريخ الإنشاء: {batch.createdAt} • ينتهي: {batch.expiresAt}
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-cyber-deep border border-cyber-border text-cyber-gold">
                    <KeyRound className="w-4 h-4" />
                  </span>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-cyber-textDark flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyber-cyan" /> المدة الزمنية:
                    </span>
                    <span className="font-mono font-bold text-cyber-textMain">{batch.durationMinutes} دقيقة</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-cyber-textDark flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-cyber-gold" /> سعر الكرت:
                    </span>
                    <span className="font-mono font-bold text-cyber-gold">{batch.price} ر.ي</span>
                  </div>

                  {/* Usage Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-cyber-textDark mb-1">
                      <span>الاستهلاك: {batch.usedCount} من {batch.count} كرت</span>
                      <span className="text-cyber-cyan font-bold">{usedPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-cyber-deep overflow-hidden border border-cyber-border/40">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-cyber-border/50 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleExportCsv(batch)}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyber-deep border border-cyber-border hover:border-cyber-cyan/40 text-cyber-textMuted hover:text-cyber-textMain text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تصدير Excel / CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Cards Sheet (Appears upon generation or inspect) */}
      {printableCards && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-cyber-deep border border-cyber-borderLight rounded-3xl w-full max-w-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
              <div>
                <h3 className="font-bold text-base text-cyber-textMain flex items-center gap-2">
                  <Printer className="w-5 h-5 text-cyber-cyan" />
                  <span>طباعة بطاقات الكروت المؤقتة</span>
                </h3>
                <p className="text-xs text-cyber-textDark mt-0.5">
                  تظهر رموز الـ PIN كاملة هنا فقط لغرض الطباعة الورقية والتسليم، وتُشفر تلقائياً في قاعدة البيانات.
                </p>
              </div>
              <button onClick={() => setPrintableCards(null)} className="text-cyber-textDark hover:text-cyber-textMain">✕</button>
            </div>

            {/* Printable Cards Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {printableCards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-br from-cyber-card to-cyber-deep border border-cyber-cyan/30 space-y-2 relative overflow-hidden shadow"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyber-textDark">
                    <span className="font-bold text-cyber-cyan">CYBERCENTER</span>
                    <span>{card.durationMinutes} دقيقة</span>
                  </div>

                  <div className="py-2 text-center bg-black/40 rounded-lg border border-cyber-border/40 font-mono">
                    <p className="text-[10px] text-cyber-textDark">رمز الكرت (PIN)</p>
                    <p className="text-sm font-bold text-cyber-gold tracking-widest">{card.pin}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-cyber-textDark pt-1">
                    <span>السعر: {card.price} ر.ي</span>
                    <span className="text-emerald-400">صالح للاستخدام</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-cyber-border flex items-center justify-between text-xs">
              <span className="text-cyber-textDark font-mono">عدد الكروت الجاهزة للطباعة: {printableCards.length} كرت</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-cyber-cyan text-black font-bold flex items-center gap-2 shadow-glow-cyan"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة فورية (Print)</span>
                </button>
                <button
                  onClick={() => setPrintableCards(null)}
                  className="px-4 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-cyber-textMain"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Batch Modal Dialog */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-deep border border-cyber-borderLight rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <h3 className="font-bold text-base text-cyber-textMain">توليد دفعة كروت مؤقتة</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-cyber-textDark hover:text-cyber-textMain">✕</button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">اسم الدفعة</label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. كروت عطلة نهاية الأسبوع"
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain focus:outline-none focus:border-cyber-cyan font-sans"
                />
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">مدة الجلسة بالدقائق</label>
                <div className="grid grid-cols-4 gap-2 mb-2 font-mono">
                  {[30, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        durationMinutes === m
                          ? 'bg-cyber-cyan text-black font-bold border-cyber-cyan'
                          : 'bg-cyber-card border-cyber-border text-cyber-textMuted hover:text-cyber-textMain'
                      }`}
                    >
                      {m} د
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyber-textMuted mb-1 font-semibold">عدد الكروت المطلوب</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-textMain font-mono font-bold focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
                <div>
                  <label className="block text-cyber-textMuted mb-1 font-semibold">سعر الكرت (ر.ي)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={pricePerCard}
                    onChange={(e) => setPricePerCard(Number(e.target.value))}
                    className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3.5 py-2.5 text-cyber-gold font-mono font-bold focus:outline-none focus:border-cyber-cyan"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-cyber-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-cyber-card border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyber-cyan text-black font-bold hover:bg-cyan-400 shadow-glow-cyan"
                >
                  توليد الكروت والطباعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
