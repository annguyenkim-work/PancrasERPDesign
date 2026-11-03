import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Role } from '../../types/erp';
import { INITIAL_USERS } from '../../data/initialData';
import { 
  Users, 
  ShieldCheck, 
  Building, 
  Briefcase, 
  Check, 
  X, 
  UserCheck,
  Lock,
  Eye,
  Sliders
} from 'lucide-react';

const PERMISSION_MATRIX: {
  module: string;
  admin: boolean;
  director: boolean;
  accountant: boolean;
  sales: boolean;
  warehouse_keeper: boolean;
  showroom_manager: boolean;
  support: boolean;
}[] = [
  { module: 'Xem Tổng quan Dashboard & Doanh thu', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: true, support: false },
  { module: 'Quản lý Tồn Kho & Xuất Nhập 5 Kho/SR', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: true, showroom_manager: true, support: false },
  { module: 'Điều Chuyển Hàng Kho Tổng sang Showroom', admin: true, director: true, accountant: false, sales: false, warehouse_keeper: true, showroom_manager: true, support: false },
  { module: 'Mua Hàng Container & Phân Bổ Giá Vốn PO', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Tạo Đơn Bán Hàng (Lẻ - Đại Lý - Dự Án)', admin: true, director: true, accountant: false, sales: true, warehouse_keeper: false, showroom_manager: true, support: false },
  { module: 'Phê Duyệt Ngoại Lệ Vượt Hạn Mức Công Nợ', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Thu Tiền & Gạch Nợ Khách Hàng', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Kích Hoạt Bảo Hành & Xử Lý Vé RMA', admin: true, director: false, accountant: false, sales: true, warehouse_keeper: false, showroom_manager: true, support: true },
  { module: 'Xem Nhật Ký Hệ Thống (Audit Logs)', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
];

export const HrView: React.FC = () => {
  const { currentUser, setCurrentUserRole, locations } = useErp();
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'matrix'>('employees');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hồ Sơ Nhân Sự &amp; Ma Trận Phân Quyền Vai Trò (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân quyền 7 nhóm vai trò: Admin, Giám đốc, Kế toán, Sales, Thủ kho, Trưởng showroom và CSKH.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveSubTab('employees')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'employees' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Danh Sách Nhân Viên
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Ma Trận Quyền Hạn (7 Roles)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EMPLOYEES LIST */}
      {activeSubTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_USERS.map((usr) => {
            const isCurrent = currentUser.id === usr.id || currentUser.role === usr.role;
            const branchName = usr.branchId === 'ALL'
              ? 'Toàn bộ Trụ sở & Chi nhánh'
              : locations.find((l) => l.id === usr.branchId)?.name || 'Chi nhánh';

            return (
              <div
                key={usr.id}
                className={`p-5 rounded-xl border bg-white shadow-xs space-y-3 transition-all ${
                  isCurrent ? 'ring-2 ring-sky-500 border-sky-400 bg-sky-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sky-800 text-sm">
                      {usr.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{usr.name}</div>
                      <div className="text-xs text-slate-500">{usr.email}</div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      ĐANG ĐĂNG NHẬP
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chức vụ:</span>
                    <span className="font-semibold text-slate-800">{usr.roleLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Phòng ban:</span>
                    <span className="text-slate-700">{usr.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chi nhánh:</span>
                    <span className="text-slate-700 max-w-[170px] truncate" title={branchName}>
                      {branchName.replace(/Kho Tổng |Showroom /g, '')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Điện thoại:</span>
                    <span className="font-mono text-slate-700">{usr.phone}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setCurrentUserRole(usr.role)}
                    className={`w-full py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-600 cursor-default'
                        : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                    }`}
                  >
                    {isCurrent ? 'Vai trò đang kích hoạt' : 'Chuyển sang tài khoản này'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: PERMISSION MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Bảng Phân Quyền Chi Tiết Theo 7 Vai Trò
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Đảm bảo nguyên tắc phân tách trách nhiệm (Separation of Duties) giữa Kinh doanh, Kho vận và Kế toán.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tính năng / Phân hệ</th>
                  <th className="py-3 px-2 text-center">Admin</th>
                  <th className="py-3 px-2 text-center">Giám đốc</th>
                  <th className="py-3 px-2 text-center">Kế toán</th>
                  <th className="py-3 px-2 text-center">Sales</th>
                  <th className="py-3 px-2 text-center">Thủ kho</th>
                  <th className="py-3 px-2 text-center">Trưởng SR</th>
                  <th className="py-3 px-2 text-center">CSKH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_MATRIX.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{row.module}</td>
                    <td className="py-3 px-2 text-center">
                      {row.admin ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {row.director ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {row.accountant ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {row.sales ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {row.warehouse_keeper ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {row.showroom_manager ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {row.support ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
