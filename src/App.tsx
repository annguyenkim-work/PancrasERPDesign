/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { WarehouseView } from './components/inventory/WarehouseView';
import { ProcurementView } from './components/procurement/ProcurementView';
import { SalesView } from './components/sales/SalesView';
import { ComboManagerView } from './components/combo/ComboManagerView';
import { DebtView } from './components/debt/DebtView';
import { WarrantyView } from './components/warranty/WarrantyView';
import { HrView } from './components/hr/HrView';
import { AuditLogView } from './components/audit/AuditLogView';
import { ToastContainer } from './components/common/ToastContainer';

const TAB_TITLES: Record<TabKey, string> = {
  dashboard: 'Tổng quan Điều hành',
  warehouse: 'Quản lý Kho & Điều chuyển',
  procurement: 'Mua hàng & Container Nhập',
  sales: 'Bán hàng (Lẻ - Đại lý - Dự án)',
  combo: 'Quản lý Combo Sản phẩm',
  debt: 'Quản lý Công nợ & Hạn mức',
  warranty: 'Bảo hành Điện tử (e-Warranty)',
  hr: 'Hồ sơ Nhân sự & Phân quyền (RBAC)',
  audit: 'Nhật ký Hệ thống (Audit Log)',
};

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTabTitle={TAB_TITLES[activeTab]}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'warehouse' && <WarehouseView />}
            {activeTab === 'procurement' && <ProcurementView />}
            {activeTab === 'sales' && <SalesView />}
            {activeTab === 'combo' && <ComboManagerView />}
            {activeTab === 'debt' && <DebtView />}
            {activeTab === 'warranty' && <WarrantyView />}
            {activeTab === 'hr' && <HrView />}
            {activeTab === 'audit' && <AuditLogView />}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <MainContent />
    </ErpProvider>
  );
}
