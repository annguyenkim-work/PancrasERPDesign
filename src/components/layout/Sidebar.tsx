import React from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  LayoutDashboard, 
  Warehouse, 
  Container, 
  ShoppingCart, 
  Boxes, 
  CreditCard, 
  ShieldCheck, 
  Users, 
  ClipboardList, 
  X,
  Bath
} from 'lucide-react';

export type TabKey = 
  | 'dashboard'
  | 'warehouse'
  | 'procurement'
  | 'sales'
  | 'combo'
  | 'debt'
  | 'warranty'
  | 'hr'
  | 'audit';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { orders, transfers, warrantyTickets } = useErp();

  // Badges calculation
  const pendingApprovalOrders = orders.filter((o) => o.status === 'pending_approval').length;
  const inTransitTransfers = transfers.filter((t) => t.status === 'in_transit').length;
  const openRmaTickets = warrantyTickets.filter((t) => t.resolutionStatus !== 'handed_over').length;

  const navItems = [
    {
      key: 'dashboard' as TabKey,
      label: 'Tổng quan Điều hành',
      icon: LayoutDashboard,
      section: 'HỆ THỐNG',
    },
    {
      key: 'warehouse' as TabKey,
      label: 'Quản lý Kho & Điều chuyển',
      icon: Warehouse,
      section: 'VẬN HÀNH KHO BÃI',
      badge: inTransitTransfers > 0 ? `${inTransitTransfers} đang chuyển` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      key: 'procurement' as TabKey,
      label: 'Mua hàng & Container Nhập',
      icon: Container,
      section: 'VẬN HÀNH KHO BÃI',
    },
    {
      key: 'sales' as TabKey,
      label: 'Bán hàng (Lẻ - Đại lý - Dự án)',
      icon: ShoppingCart,
      section: 'KINH DOANH & PHÂN PHỐI',
      badge: pendingApprovalOrders > 0 ? `${pendingApprovalOrders} chờ duyệt` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      key: 'combo' as TabKey,
      label: 'Quản lý Combo Sản phẩm',
      icon: Boxes,
      section: 'KINH DOANH & PHÂN PHỐI',
    },
    {
      key: 'debt' as TabKey,
      label: 'Quản lý Công nợ & Hạn mức',
      icon: CreditCard,
      section: 'TÀI CHÍNH',
    },
    {
      key: 'warranty' as TabKey,
      label: 'Bảo hành Điện tử (Serial/SĐT)',
      icon: ShieldCheck,
      section: 'DỊCH VỤ KHÁCH HÀNG',
      badge: openRmaTickets > 0 ? `${openRmaTickets} RMA` : undefined,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      key: 'hr' as TabKey,
      label: 'Nhân sự & Phân quyền',
      icon: Users,
      section: 'QUẢN TRỊ NỘI BỘ',
    },
    {
      key: 'audit' as TabKey,
      label: 'Nhật ký Hệ thống (Audit Log)',
      icon: ClipboardList,
      section: 'QUẢN TRỊ NỘI BỘ',
    },
  ];

  // Group items by section
  const sections = Array.from(new Set(navItems.map((item) => item.section)));

  const handleSelect = (key: TabKey) => {
    onSelectTab(key);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Lockup */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <Bath className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">PancrasERP</span>
              <div className="text-[10px] text-slate-400 font-medium">Thiết Bị Vệ Sinh &amp; Nội Thất</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Facility Tag */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="truncate">3 Kho Tổng · 2 Showroom</span>
          <span className="text-emerald-400 font-mono text-[10px]">REALTIME</span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {sections.map((secName) => {
            const items = navItems.filter((i) => i.section === secName);
            return (
              <div key={secName}>
                <div className="px-3 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {secName}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSelect(item.key)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-xs font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded shrink-0 ${
                              isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="text-[11px] text-slate-400">
            Hệ thống Quản trị Đồng bộ Doanh nghiệp
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Phiên bản 2026 · Tiêu chuẩn DN TBVS &amp; VLXD
          </div>
        </div>
      </aside>
    </>
  );
};
