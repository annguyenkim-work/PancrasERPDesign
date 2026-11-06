import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Role } from '../../types/erp';
import { 
  Building2, 
  UserCheck, 
  FileSpreadsheet, 
  Printer, 
  Menu,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  activeTabTitle: string;
}

const ROLE_OPTIONS: { role: Role; label: string; dept: string }[] = [
  { role: 'director', label: 'Giám đốc Điều hành (CEO)', dept: 'Ban Giám Đốc' },
  { role: 'admin', label: 'Quản trị viên Hệ thống (Admin)', dept: 'IT & Quản trị' },
  { role: 'accountant', label: 'Kế toán Trưởng (CFO/Acc)', dept: 'Tài chính - Kế toán' },
  { role: 'sales', label: 'Nhân viên Kinh doanh (Sales)', dept: 'Kinh doanh B2B & Dự án' },
  { role: 'warehouse_keeper', label: 'Thủ kho (Warehouse Keeper)', dept: 'Kho vận & Logistics' },
  { role: 'showroom_manager', label: 'Trưởng Showroom', dept: 'Bán lẻ Showroom' },
  { role: 'support', label: 'CSKH & Bảo hành điện tử', dept: 'Dịch vụ Khách hàng' },
];

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, activeTabTitle }) => {
  const { 
    currentUser, 
    setCurrentUserRole, 
    locations, 
    selectedLocationId, 
    setSelectedLocationId, 
    exportTableToCSV,
    products
  } = useErp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const warehouseCount = locations.filter((item) => item.type === 'warehouse').length;
  const showroomCount = locations.filter((item) => item.type === 'showroom').length;
  const selectedLocName = selectedLocationId === 'ALL'
    ? `Toàn bộ ${warehouseCount} Kho & ${showroomCount} Showroom`
    : locations.find((l) => l.id === selectedLocationId)?.name || 'Chi nhánh';

  const handleExportQuickReport = () => {
    const headers = ['Mã SKU', 'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Đơn vị', 'Giá vốn (đ)', 'Giá bán lẻ (đ)', 'Tồn khả dụng toàn hệ thống'];
    const rows = products.map((p) => {
      const totalAvailable = Object.values(p.stockByLocation).reduce((sum, s) => sum + Math.max(0, s.onHand - s.reserved), 0);
      return [
        p.code,
        p.name,
        p.brand,
        p.category,
        p.unit,
        p.baseCost,
        p.retailPrice,
        totalAvailable
      ];
    });
    exportTableToCSV('Bao_Cao_Nhanh_PancrasERP', headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 transition-colors no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumb Trail */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900 whitespace-nowrap">PancrasERP</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-sky-700 whitespace-nowrap truncate max-w-[160px] sm:max-w-xs">
              {activeTabTitle}
            </span>
          </div>
        </div>

        {/* Center: Branch / Location Switcher */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setShowLocationDropdown(!showLocationDropdown);
              setShowRoleDropdown(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            <span className="truncate max-w-[220px]">{selectedLocName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showLocationDropdown && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Điểm quản lý kho vận
              </div>
              <button
                onClick={() => {
                  setSelectedLocationId('ALL');
                  setShowLocationDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                  selectedLocationId === 'ALL' ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Toàn bộ hệ thống ({warehouseCount} Kho + {showroomCount} Showroom)</span>
                {selectedLocationId === 'ALL' && <span className="text-sky-600 font-bold">✓</span>}
              </button>
              <div className="border-t border-slate-100 my-1" />
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocationId(loc.id);
                    setShowLocationDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                    selectedLocationId === loc.id ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-800">{loc.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {loc.type === 'warehouse' ? 'Kho tổng' : 'Showroom'} · {loc.address.split(',')[0]}
                    </div>
                  </div>
                  {selectedLocationId === loc.id && <span className="text-sky-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Zone: Role Switcher & Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Print & Excel */}
          <button
            onClick={handleExportQuickReport}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors whitespace-nowrap"
            title="Xuất bảng dữ liệu Excel (.csv chuẩn UTF-8)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
            title="In báo cáo / Lưu PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In PDF</span>
          </button>

          {/* Role Switcher Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowLocationDropdown(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100 rounded-md transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-700" />
              <div className="text-left hidden sm:block">
                <div className="leading-tight font-semibold">{currentUser.roleLabel}</div>
                <div className="text-[10px] text-sky-700 font-normal leading-none">{currentUser.name}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">Giả lập quyền truy cập (RBAC)</div>
                  <div className="text-[11px] text-slate-500">Chuyển vai trò để kiểm thử phân quyền ERP</div>
                </div>
                <div className="py-1">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.role}
                      onClick={() => {
                        setCurrentUserRole(opt.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                        currentUser.role === opt.role ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-[11px] text-slate-400">{opt.dept}</div>
                      </div>
                      {currentUser.role === opt.role && <span className="text-sky-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
