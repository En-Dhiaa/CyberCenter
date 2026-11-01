import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCog,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  Phone,
  Mail,
  User,
} from 'lucide-react';

interface EmployeeItem {
  id: string;
  username: string;
  fullName: string;
  userType: 'SuperAdmin' | 'Admin' | 'Cashier';
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

const initialEmployees: EmployeeItem[] = [
  {
    id: '1',
    username: 'superadmin',
    fullName: 'ضياء المهندس',
    userType: 'SuperAdmin',
    email: 'admin@cybercenter.local',
    phoneNumber: '+967 770 000 111',
    isActive: true,
    createdAt: '2026-10-01',
  },
  {
    id: '2',
    username: 'omar_admin',
    fullName: 'عمر الورد (مشرف مسائي)',
    userType: 'Admin',
    email: 'omar@cybercenter.local',
    phoneNumber: '+967 771 222 333',
    isActive: true,
    createdAt: '2026-10-15',
  },
  {
    id: '3',
    username: 'ahmed_cashier',
    fullName: 'أحمد السامعي (كاشير)',
    userType: 'Cashier',
    phoneNumber: '+967 773 444 555',
    isActive: true,
    createdAt: '2026-10-20',
  },
];

export const EmployeesPage: React.FC = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<EmployeeItem[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Cashier'>('Cashier');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isActive: !e.isActive } : e))
    );
  };

  const handleDelete = (id: string, role: string) => {
    if (role === 'SuperAdmin') {
      alert('لا يمكن حذف حساب المدير العام الرئيسي للنظام.');
      return;
    }
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الموظف؟')) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newFullName || !newPassword) return;

    const newEmp: EmployeeItem = {
      id: Date.now().toString(),
      username: newUsername.trim(),
      fullName: newFullName.trim(),
      userType: newRole,
      phoneNumber: newPhone.trim() || undefined,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setEmployees((prev) => [...prev, newEmp]);
    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewPhone('');
    setNewPassword('');
  };

  const roleBadges = {
    SuperAdmin: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: ShieldAlert,
      label: 'مدير عام (Super Admin)',
    },
    Admin: {
      bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      icon: ShieldCheck,
      label: 'مشرف وردية (Admin)',
    },
    Cashier: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: UserCheck,
      label: 'كاشير / استقبال (Cashier)',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h1 className="text-xl font-bold text-cyber-textMain flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-cyan">
              <UserCog className="w-5 h-5" />
            </div>
            <span>{t('nav.employees')}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              RBAC PROTECTED
            </span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            إدارة حسابات المشرفين، الكاشير، توزيع الصلاحيات، وضبط الوصول للعمليات الحساسة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-cyber-textDark absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو اسم المستخدم..."
              className="bg-cyber-card border border-cyber-border rounded-xl ps-9 pe-4 py-2 text-xs text-cyber-textMain placeholder:text-cyber-textDark focus:outline-none focus:border-cyber-cyan/50 font-sans"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold text-xs shadow-glow-cyan hover:from-cyan-400 hover:to-cyan-300 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* Employees Directory Table */}
      <div className="bg-cyber-card/80 border border-cyber-border rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-start text-xs">
          <thead className="bg-cyber-deep/80 text-cyber-textDark border-b border-cyber-border uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="py-3.5 px-4 text-start">الموظف</th>
              <th className="py-3.5 px-4 text-start">الدور الإداري (Role)</th>
              <th className="py-3.5 px-4 text-start">بيانات الاتصال</th>
              <th className="py-3.5 px-4 text-start">حالة الحساب</th>
              <th className="py-3.5 px-4 text-start">تاريخ الإنشاء</th>
              <th className="py-3.5 px-4 text-end">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40">
            {filtered.map((emp) => {
              const RoleBadge = roleBadges[emp.userType];
              const Icon = RoleBadge.icon;

              return (
                <tr key={emp.id} className="hover:bg-cyber-deep/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyber-deep border border-cyber-border flex items-center justify-center font-bold text-cyber-cyan text-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-cyber-textMain text-sm">{emp.fullName}</p>
                        <p className="text-cyber-textDark font-mono text-[11px]">@{emp.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${RoleBadge.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{RoleBadge.label}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 space-y-0.5">
                    {emp.phoneNumber && (
                      <p className="flex items-center gap-1.5 text-cyber-textMuted font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-cyber-textDark" /> {emp.phoneNumber}
                      </p>
                    )}
                    {emp.email && (
                      <p className="flex items-center gap-1.5 text-cyber-textDark font-mono text-[11px]">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleStatus(emp.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                        emp.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      {emp.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{emp.isActive ? 'نشط' : 'موقوف'}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 font-mono text-cyber-textDark text-[11px]">{emp.createdAt}</td>
                  <td className="py-4 px-4 text-end">
                    <button
                      onClick={() => handleDelete(emp.id, emp.userType)}
                      disabled={emp.userType === 'SuperAdmin'}
                      className={`p-2 rounded-lg border transition-all ${
                        emp.userType === 'SuperAdmin'
                          ? 'opacity-30 cursor-not-allowed border-cyber-border text-cyber-textDark'
                          : 'bg-cyber-deep border-cyber-border hover:border-rose-500/40 text-cyber-textDark hover:text-rose-400'
                      }`}
                      title={emp.userType === 'SuperAdmin' ? 'لا يمكن حذف المدير العام' : 'حذف الموظف'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-deep border border-cyber-borderLight rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <h3 className="font-bold text-base text-cyber-textMain">إضافة موظف جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-cyber-textDark hover:text-cyber-textMain">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">اسم المستخدم (Username)</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. omar_cashier"
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="الاسم الثلاثي أو اللقب"
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">الدور الإداري والصلاحيات</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                >
                  <option value="Cashier">كاشير واستقبال (Cashier - صلاحيات تشغيلية فقط)</option>
                  <option value="Admin">مشرف وردية (Admin - إدارة الجلسات والمتجر)</option>
                </select>
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">رقم الهاتف للتواصل</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+967 77x xxx xxx"
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div>
                <label className="block text-cyber-textMuted mb-1 font-semibold">كلمة المرور المؤقتة</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-3 py-2 text-cyber-textMain focus:outline-none focus:border-cyber-cyan"
                />
              </div>

              <div className="pt-3 border-t border-cyber-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-textMuted hover:text-cyber-textMain"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyber-cyan text-black font-bold hover:bg-cyan-400 shadow-glow-cyan"
                >
                  إنشاء الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

