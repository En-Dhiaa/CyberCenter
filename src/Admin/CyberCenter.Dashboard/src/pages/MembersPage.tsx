import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Search,
  Wallet,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  XCircle,
  X,
  CreditCard,
  Sparkles,
} from 'lucide-react';

interface MemberItem {
  id: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  walletBalance: number;
  remainingMinutes: number;
  isActive: boolean;
  createdAtUtc: string;
}

const initialMembers: MemberItem[] = [
  {
    id: 'm1',
    username: 'faisal_gamer',
    fullName: 'فيصل عبدالرحمن (VIP)',
    phoneNumber: '+967 775 111 222',
    email: 'faisal@gamers.ye',
    walletBalance: 14500,
    remainingMinutes: 380,
    isActive: true,
    createdAtUtc: '2026-10-10T14:30:00Z',
  },
  {
    id: 'm2',
    username: 'tariq_pro',
    fullName: 'طارق العريقي',
    phoneNumber: '+967 773 999 888',
    email: 'tariq@esports.ye',
    walletBalance: 4200,
    remainingMinutes: 120,
    isActive: true,
    createdAtUtc: '2026-10-14T19:00:00Z',
  },
  {
    id: 'm3',
    username: 'samir_valorant',
    fullName: 'سمير القادري',
    phoneNumber: '+967 770 555 444',
    walletBalance: 0,
    remainingMinutes: 45,
    isActive: true,
    createdAtUtc: '2026-10-22T16:15:00Z',
  },
  {
    id: 'm4',
    username: 'monir_cs',
    fullName: 'منير الحكيمي',
    phoneNumber: '+967 772 333 111',
    walletBalance: 750,
    remainingMinutes: 0,
    isActive: false,
    createdAtUtc: '2026-10-25T11:45:00Z',
  },
];

export const MembersPage: React.FC = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<MemberItem[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Add Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDeposit, setNewDeposit] = useState(2000);
  const [newMinutes, setNewMinutes] = useState(120);

  // Recharge Modal
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState(5000);
  const [rechargeMinutes, setRechargeMinutes] = useState(0);
  const [rechargeMethod, setRechargeMethod] = useState<'Cash' | 'Jawaly' | 'Kuraimi'>('Cash');

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phoneNumber && m.phoneNumber.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && m.isActive) ||
      (statusFilter === 'suspended' && !m.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.isActive).length;
  const totalBalance = members.reduce((acc, m) => acc + m.walletBalance, 0);
  const totalMinutes = members.reduce((acc, m) => acc + m.remainingMinutes, 0);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newPassword) return;

    const newMember: MemberItem = {
      id: `m-${Date.now()}`,
      username: newUsername.trim(),
      fullName: newFullName.trim(),
      phoneNumber: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      walletBalance: Number(newDeposit) || 0,
      remainingMinutes: Number(newMinutes) || 0,
      isActive: true,
      createdAtUtc: new Date().toISOString(),
    };

    setMembers([newMember, ...members]);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    setNewPhone('');
    setNewEmail('');
    setNewDeposit(2000);
    setNewMinutes(120);
  };

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === selectedMember.id) {
          return {
            ...m,
            walletBalance: m.walletBalance + Number(rechargeAmount || 0),
            remainingMinutes: m.remainingMinutes + Number(rechargeMinutes || 0),
          };
        }
        return m;
      })
    );

    setSelectedMember(null);
  };

  const toggleStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Users className="w-7 h-7 text-cyan-400" />
            {t('الأعضاء والاشتراكات (Members & Subscriptions)')}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t('إدارة حسابات الأعضاء الدائمين، شحن أرصدة المحافظ، ومتابعة باقات الساعات المتبقية')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20"
        >
          <UserPlus className="w-5 h-5" />
          <span>{t('تسجيل عضو جديد')}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي الأعضاء')}</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{totalMembers}</span>
            <span className="text-xs text-slate-500">{t('مشترك')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('الحسابات النشطة')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{activeMembers}</span>
            <span className="text-xs text-slate-500">{t('حساب مفعّل')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('أرصدة المحافظ النقدية')}</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{totalBalance.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{t('ر.ي')}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t('إجمالي الساعات المتبقية')}</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400">{(totalMinutes / 60).toFixed(1)}</span>
            <span className="text-xs text-slate-500">{t('ساعة')} ({totalMinutes} دقيقة)</span>
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
            placeholder={t('البحث باسم العضو، المعرف، أو رقم الهاتف...')}
            className="w-full pl-4 pr-10 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'suspended'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {filter === 'all' && t('الكل')}
              {filter === 'active' && t('النشطين فقط')}
              {filter === 'suspended' && t('الموقوفين')}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{t('العضو والمستخدم')}</th>
                <th className="px-4 py-3 font-semibold">{t('بيانات الاتصال')}</th>
                <th className="px-4 py-3 font-semibold">{t('رصيد المحفظة')}</th>
                <th className="px-4 py-3 font-semibold">{t('الوقت المتبقي')}</th>
                <th className="px-4 py-3 font-semibold">{t('الحالة')}</th>
                <th className="px-4 py-3 font-semibold text-center">{t('الإجراءات')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    {t('لا يوجد أعضاء يطابقون معايير البحث الحالية.')}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-base">
                          {member.fullName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            {member.fullName}
                            {member.walletBalance > 10000 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">@{member.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-400 space-y-1">
                      {member.phoneNumber && (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{member.phoneNumber}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{member.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="font-mono font-bold text-slate-100 text-base">
                            {member.walletBalance.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 mr-1 rtl:mr-1 ltr:ml-1">ر.ي</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <div>
                          <span className="font-mono font-bold text-slate-100">
                            {Math.floor(member.remainingMinutes / 60)} {t('س')} {member.remainingMinutes % 60} {t('د')}
                          </span>
                          <div className="text-[10px] text-slate-500">
                            ({member.remainingMinutes} {t('دقيقة إجمالية')})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('نشط')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          {t('موقوف')}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setRechargeAmount(5000);
                            setRechargeMinutes(0);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-sm"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{t('شحن رصيد')}</span>
                        </button>

                        <button
                          onClick={() => toggleStatus(member.id)}
                          title={member.isActive ? t('إيقاف الحساب') : t('تفعيل الحساب')}
                          className={`p-1.5 rounded-lg transition ${
                            member.isActive
                              ? 'text-rose-400 hover:bg-rose-500/20'
                              : 'text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {member.isActive ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
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

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>{t('تسجيل عضو دائم جديد')}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('اسم المستخدم (Login Username)')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="gamer99"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('الاسم الثلاثي أو المستعار')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="أحمد علي الشرعبي"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('كلمة المرور للدخول للأجهزة')} *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('رقم الهاتف')}
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+967 77..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('البريد الإلكتروني')}
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('الرصيد النقدي الأولي (ر.ي)')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {t('دقائق اللعب الممنوحة')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="30"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
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
                  {t('حفظ وتسجيل')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>{t('شحن رصيد العضو')}</span>
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400">
                {selectedMember.fullName[0]}
              </div>
              <div>
                <div className="font-bold text-slate-200">{selectedMember.fullName}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {t('الرصيد الحالي:')}{' '}
                  <span className="text-amber-400 font-bold">{selectedMember.walletBalance.toLocaleString()} ر.ي</span>
                  {' • '}
                  <span className="text-purple-400 font-bold">{selectedMember.remainingMinutes} دقيقة</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleRecharge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('المبلغ المالي المضاف (ر.ي)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-base text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-2 mt-2">
                  {[1000, 2000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRechargeAmount(preset)}
                      className="px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 text-[11px] font-mono text-slate-300"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('باقة دقائق إضافية (اختياري)')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="30"
                  value={rechargeMinutes}
                  onChange={(e) => setRechargeMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-purple-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {t('طريقة الاستلام والدفع')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Cash', label: 'نقداً كاش', icon: Wallet },
                    { id: 'Jawaly', label: 'محفظة جوالي', icon: CreditCard },
                    { id: 'Kuraimi', label: 'حساب الكريمي', icon: Sparkles },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setRechargeMethod(method.id as any)}
                      className={`p-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition ${
                        rechargeMethod === method.id
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <method.icon className="w-4 h-4" />
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  {t('إلغاء')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-amber-500/20"
                >
                  {t('تأكيد وإيداع')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
