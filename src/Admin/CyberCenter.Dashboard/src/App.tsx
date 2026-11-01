import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewPage } from '@/pages/OverviewPage';
import { LiveDevicesPage } from '@/pages/LiveDevicesPage';
import { GenericPage } from '@/components/ui/GenericPage';
import {
  History,
  Users,
  CreditCard,
  ShoppingBag,
  ChefHat,
  Wallet,
  Receipt,
  BarChart3,
  CalendarCheck2,
  Activity,
  Zap,
  UserCog,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="devices" element={<LiveDevicesPage />} />
          <Route
            path="sessions"
            element={
              <GenericPage
                title="سجل الجلسات (Sessions)"
                subtitle="متابعة الجلسات المفتوحة، كروت الدقائق، وجلسات الأعضاء المشتركين"
                icon={History}
              />
            }
          />
          <Route
            path="members"
            element={
              <GenericPage
                title="الأعضاء والاشتراكات (Members & Plans)"
                subtitle="إدارة حسابات الأعضاء الدائمين، الخطط الشهرية، وأرصدة المحافظ"
                icon={Users}
              />
            }
          />
          <Route
            path="cards"
            element={
              <GenericPage
                title="الكروت المؤقتة (Temporary Cards)"
                subtitle="توليد وطباعة دفعات الكروت المؤقتة بالـ PIN المشفر المكون من 16 رقماً"
                icon={CreditCard}
              />
            }
          />
          <Route
            path="store"
            element={
              <GenericPage
                title="المتجر والمنتجات (Store & Catalog)"
                subtitle="إدارة قائمة المشروبات والمأكولات والإكسسوارات وأسعارها"
                icon={ShoppingBag}
              />
            }
          />
          <Route
            path="kitchen"
            element={
              <GenericPage
                title="شاشة المطبخ والطلبات (Kitchen KDS)"
                subtitle="استقبال ومتابعة تجهيز وتسليم طلبات الزوار الموجهة من الأجهزة"
                icon={ChefHat}
              />
            }
          />
          <Route
            path="payments"
            element={
              <GenericPage
                title="المدفوعات والمحافظ (Payments)"
                subtitle="إدارة عمليات الدفع النقدية والمحافظ الإلكترونية والتحويلات المحلية"
                icon={Wallet}
              />
            }
          />
          <Route
            path="expenses"
            element={
              <GenericPage
                title="المصروفات اليومية (Expenses)"
                subtitle="تسجيل وتوثيق مصروفات المركز التشغيلية من قبل المشرفين"
                icon={Receipt}
              />
            }
          />
          <Route
            path="reports"
            element={
              <GenericPage
                title="التقارير المالية (Financial Reports)"
                subtitle="تحليلات تفصيلية للإيرادات، مبيعات المتجر، وصافي الأرباح التراكمية"
                icon={BarChart3}
              />
            }
          />
          <Route
            path="closing"
            element={
              <GenericPage
                title="الإقفال الشهري (Monthly Closing)"
                subtitle="اعتماد وتثبيت النتائج المالية الشهرية من قبل المدير العام"
                icon={CalendarCheck2}
              />
            }
          />
          <Route
            path="network"
            element={
              <GenericPage
                title="مراقبة الشبكة (Network Monitor)"
                subtitle="مراقبة استهلاك الباندويث وسرعات الأجهزة وتكامل الراوتر"
                icon={Activity}
              />
            }
          />
          <Route
            path="energy"
            element={
              <GenericPage
                title="مراقبة الطاقة والكهرباء (Energy Monitor)"
                subtitle="تسجيل ومقارنة استهلاك العدادات الذكية الفعلي مع التقدير الحسابي للأجهزة"
                icon={Zap}
              />
            }
          />
          <Route
            path="employees"
            element={
              <GenericPage
                title="الموظفون والصلاحيات (Staff & Roles)"
                subtitle="إدارة حسابات المشرفين والكاشير وتعيين أدوار الـ RBAC الصارمة"
                icon={UserCog}
              />
            }
          />
          <Route
            path="audit"
            element={
              <GenericPage
                title="سجل العمليات والتدقيق (Audit Logs)"
                subtitle="سجل تدقيق أمني غير قابل للتعديل يوثق كافة العمليات الإدارية الحساسة"
                icon={FileSpreadsheet}
              />
            }
          />
          <Route
            path="settings"
            element={
              <GenericPage
                title="إعدادات النظام (System Settings)"
                subtitle="إعدادات المركز، تسعيرة الساعات، مهلة عدم الاتصال، وسياسات الأمان"
                icon={Settings}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

