import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/LoginPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { LiveDevicesPage } from '@/pages/LiveDevicesPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { SystemSettingsPage } from '@/pages/SystemSettingsPage';
import { SessionsPage } from '@/pages/SessionsPage';
import { MembersPage } from '@/pages/MembersPage';
import { TemporaryCardsPage } from '@/pages/TemporaryCardsPage';
import { StoreCatalogPage } from '@/pages/StoreCatalogPage';
import { KitchenKdsPage } from '@/pages/KitchenKdsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { FinancialReportsPage } from '@/pages/FinancialReportsPage';
import { MonthlyClosingPage } from '@/pages/MonthlyClosingPage';
import { GenericPage } from '@/components/ui/GenericPage';
import {
  Activity,
  Zap,
} from 'lucide-react';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="devices" element={<LiveDevicesPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="cards" element={<TemporaryCardsPage />} />
          <Route path="store" element={<StoreCatalogPage />} />
          <Route path="kitchen" element={<KitchenKdsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<FinancialReportsPage />} />
          <Route path="closing" element={<MonthlyClosingPage />} />
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
          {/* Phase 2 Pages */}
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
