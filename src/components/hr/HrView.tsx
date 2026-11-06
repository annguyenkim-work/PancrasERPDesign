import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Role, UserProfile } from '../../types/erp';
import { Plus, X, Pencil } from 'lucide-react';

const PERMISSION_MATRIX: {
  module: string;
  admin: boolean;
  director: boolean;
  accountant: boolean;
  sales: boolean;
  warehouse_keeper: boolean;
  showroom_manager: boolean;
  support: boolean;
  settled?: boolean;
}[] = [
  { module: 'Xem Tổng quan Dashboard & Doanh thu', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: true, support: false },
  { module: 'Quản lý Tồn Kho & Xuất Nhập 5 Kho/SR', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: true, showroom_manager: true, support: false },
  { module: 'Điều Chuyển Hàng Kho Tổng sang Showroom', admin: true, director: true, accountant: false, sales: false, warehouse_keeper: true, showroom_manager: true, support: false },
  { module: 'Mua Hàng Container & Phân Bổ Giá Vốn PO', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Danh mục sản phẩm & bảng giá 3 kênh', admin: true, director: true, accountant: true, sales: true, warehouse_keeper: false, showroom_manager: true, support: false },
  { module: 'Danh bạ khách hàng lẻ / đại lý / nhà phân phối / dự án', admin: true, director: true, accountant: true, sales: true, warehouse_keeper: false, showroom_manager: true, support: true },
  { module: 'Lập đợt bàn giao trên hồ sơ dự án', admin: true, director: true, accountant: false, sales: true, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Hồ sơ nhà cung cấp nhập khẩu', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Tạo Đơn Bán Hàng (Lẻ - Đại lý - Nhà phân phối - Dự án)', admin: true, director: true, accountant: false, sales: true, warehouse_keeper: false, showroom_manager: true, support: false },
  { module: 'Sửa đơn bán / hóa đơn trước khi xuất kho', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false, settled: true },
  { module: 'Lập báo giá và xuất catalog', admin: true, director: true, accountant: false, sales: true, warehouse_keeper: false, showroom_manager: true, support: false },
  { module: 'Phê Duyệt Ngoại Lệ Vượt Hạn Mức Công Nợ', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Thu Tiền & Gạch Nợ Khách Hàng', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Kích Hoạt Bảo Hành & Xử Lý Vé RMA', admin: true, director: false, accountant: false, sales: true, warehouse_keeper: false, showroom_manager: true, support: true },
  { module: 'Xem Nhật Ký Hệ Thống (Audit Logs)', admin: true, director: true, accountant: true, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Thêm và sửa hồ sơ nhân viên', admin: true, director: true, accountant: false, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
  { module: 'Thêm, sửa, xóa Kho & Showroom', admin: true, director: true, accountant: false, sales: false, warehouse_keeper: false, showroom_manager: false, support: false },
];

const ROLE_PRESETS: Record<Role, { roleLabel: string; department: string }> = {
  admin: { roleLabel: 'Quản trị viên Hệ thống (Admin)', department: 'IT & Quản trị' },
  director: { roleLabel: 'Giám đốc Điều hành (CEO)', department: 'Ban Giám Đốc' },
  accountant: { roleLabel: 'Kế toán Trưởng', department: 'Phòng Tài Chính - Kế Toán' },
  sales: { roleLabel: 'Nhân viên Kinh doanh', department: 'Kinh doanh B2B & Dự án' },
  warehouse_keeper: { roleLabel: 'Thủ kho', department: 'Kho vận & Logistics' },
  showroom_manager: { roleLabel: 'Trưởng Showroom', department: 'Bán lẻ Showroom' },
  support: { roleLabel: 'CSKH & Bảo hành', department: 'Dịch vụ Khách hàng' },
};

type EmployeeForm = Omit<UserProfile, 'id' | 'avatar'>;

const emptyForm = (): EmployeeForm => ({
  name: '',
  email: '',
  phone: '',
  role: 'sales',
  roleLabel: ROLE_PRESETS.sales.roleLabel,
  department: ROLE_PRESETS.sales.department,
  branchId: 'ALL',
});

export const HrView: React.FC = () => {
  const { currentUser, users, switchToEmployee, locations, addEmployee, updateEmployee } = useErp();
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'matrix'>('employees');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const canManageStaff = currentUser.role === 'admin' || currentUser.role === 'director';

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (usr: UserProfile) => {
    setEditingId(usr.id);
    setForm({
      name: usr.name,
      email: usr.email,
      phone: usr.phone,
      role: usr.role,
      roleLabel: usr.roleLabel,
      department: usr.department,
      branchId: usr.branchId,
    });
    setShowForm(true);
  };

  const handleRoleChange = (role: Role) => {
    const preset = ROLE_PRESETS[role];
    setForm((prev) => ({
      ...prev,
      role,
      roleLabel: preset.roleLabel,
      department: preset.department,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateEmployee(editingId, form);
    else addEmployee(form);
    setShowForm(false);
  };

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canManageStaff && activeSubTab === 'employees' && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm nhân viên
            </button>
          )}
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
      </div>

      {/* SUBTAB 1: EMPLOYEES LIST */}
      {activeSubTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((usr) => {
            const isCurrent = currentUser.id === usr.id;
            const initial = usr.name.trim().split(' ').slice(-1)[0]?.[0] || '?';
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
                      {initial}
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

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => switchToEmployee(usr.id)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-600 cursor-default'
                        : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                    }`}
                  >
                    {isCurrent ? 'Vai trò đang kích hoạt' : 'Chuyển sang tài khoản này'}
                  </button>
                  {canManageStaff && (
                    <button
                      onClick={() => openEdit(usr)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Sửa hồ sơ
                    </button>
                  )}
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
              Dòng có nhãn Đã chốt là quyền khách xác nhận: Kế toán, Giám đốc và Admin sửa đơn trước khi xuất. Dấu ? là vai trò còn lại chưa được trả lời. Các dòng khác vẫn là đề xuất.
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
                {PERMISSION_MATRIX.map((row, idx) => {
                  const mark = (allowed: boolean) =>
                    allowed ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : row.settled ? (
                      <span className="text-amber-600 font-bold" title="Khách chưa trả lời vai trò này">?</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    );
                  return (
                  <tr key={idx} className={row.settled ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{row.module}</span>
                        {row.settled && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Đã chốt
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">{mark(row.admin)}</td>
                    <td className="py-3 px-2 text-center">{mark(row.director)}</td>
                    <td className="py-3 px-2 text-center">{mark(row.accountant)}</td>
                    <td className="py-3 px-2 text-center">{mark(row.sales)}</td>
                    <td className="py-3 px-2 text-center">{mark(row.warehouse_keeper)}</td>
                    <td className="py-3 px-2 text-center">{mark(row.showroom_manager)}</td>
                    <td className="py-3 px-2 text-center">{mark(row.support)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Sửa hồ sơ nhân viên' : 'Thêm nhân viên'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3">
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Email</span>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Điện thoại</span>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Vai trò</span>
                <select value={form.role} onChange={(e) => handleRoleChange(e.target.value as Role)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300">
                  {(Object.keys(ROLE_PRESETS) as Role[]).map((role) => (
                    <option key={role} value={role}>{ROLE_PRESETS[role].roleLabel}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Chức danh hiển thị</span>
                  <input required value={form.roleLabel} onChange={(e) => setForm({ ...form, roleLabel: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban</span>
                  <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Chi nhánh</span>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300">
                  <option value="ALL">Toàn bộ trụ sở và chi nhánh</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">
                  {editingId ? 'Lưu hồ sơ' : 'Thêm nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
