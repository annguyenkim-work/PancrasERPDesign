import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Location, LocationType } from '../../types/erp';
import { Building2, MapPin, Pencil, Plus, Search, Store, Trash2, X } from 'lucide-react';

type LocationForm = Omit<Location, 'id'>;

const emptyForm = (): LocationForm => ({
  code: '',
  name: '',
  type: 'warehouse',
  address: '',
  managerName: '',
  phone: '',
  capacityM2: 500,
});

const TYPE_FILTERS: { id: 'ALL' | LocationType; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'warehouse', label: 'Kho' },
  { id: 'showroom', label: 'Showroom' },
];

export const SitesView: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation, currentUser } = useErp();
  const [typeFilter, setTypeFilter] = useState<'ALL' | LocationType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<Location | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LocationForm>(emptyForm());
  const [pendingDelete, setPendingDelete] = useState<Location | null>(null);

  const allowed = currentUser.role === 'admin' || currentUser.role === 'director';
  const warehouseCount = locations.filter((item) => item.type === 'warehouse').length;
  const showroomCount = locations.filter((item) => item.type === 'showroom').length;

  const filtered = locations.filter((item) => {
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.code.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query) ||
      item.managerName.toLowerCase().includes(query);
    return matchesType && matchesSearch;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (location: Location) => {
    setEditing(location);
    setForm({
      code: location.code,
      name: location.name,
      type: location.type,
      address: location.address,
      managerName: location.managerName,
      phone: location.phone,
      capacityM2: location.capacityM2,
    });
    setShowForm(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const saved = editing ? updateLocation(editing.id, form) : addLocation(form);
    if (!saved) return;
    setShowForm(false);
    setEditing(null);
  };

  if (!allowed) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-sm text-slate-600">
        Màn hình này chỉ dành cho Admin và Giám đốc.
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-x-clip">
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Quản lý Kho &amp; Showroom
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Danh mục địa điểm chỉ Admin và Giám đốc được thêm, sửa và xóa. Hiện có {warehouseCount} kho và {showroomCount} showroom.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="shrink-0 self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm địa điểm
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3 shadow-xs min-w-0">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit max-w-full">
          {TYPE_FILTERS.map((item) => {
            const count =
              item.id === 'ALL' ? locations.length : item.id === 'warehouse' ? warehouseCount : showroomCount;
            const active = typeFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTypeFilter(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                  active ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm mã, tên, địa chỉ, người phụ trách..."
            className="w-full min-w-0 pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-w-0 max-w-full">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full min-w-[760px] text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Mã</th>
                <th className="py-3 px-4">Địa điểm</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-3">Người phụ trách</th>
                <th className="py-3 px-3 text-right">Diện tích</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                    Không có địa điểm nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((location) => (
                  <tr key={location.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">{location.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{location.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{location.address}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          location.type === 'warehouse' ? 'bg-sky-50 text-sky-800' : 'bg-violet-50 text-violet-800'
                        }`}
                      >
                        {location.type === 'warehouse' ? <Building2 className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                        {location.type === 'warehouse' ? 'Kho' : 'Showroom'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div>{location.managerName}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">{location.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {location.capacityM2.toLocaleString('vi-VN')} m²
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(location)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 rounded-md"
                        >
                          <Pencil className="w-3 h-3" />
                          Sửa
                        </button>
                        <button
                          onClick={() => setPendingDelete(location)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 rounded-md"
                        >
                          <Trash2 className="w-3 h-3" />
                          Xóa
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-5 h-5 text-sky-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm">{editing ? 'Sửa địa điểm' : 'Thêm địa điểm'}</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block min-w-0">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Mã</span>
                  <input
                    required
                    value={form.code}
                    onChange={(event) => setForm({ ...form, code: event.target.value })}
                    className="w-full min-w-0 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    placeholder="KT-MN hoặc SR-Q1"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Loại</span>
                  <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value as LocationType })}
                    className="w-full min-w-0 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="warehouse">Kho</option>
                    <option value="showroom">Showroom</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Tên địa điểm</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ</span>
                <input
                  required
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block min-w-0">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Người phụ trách</span>
                  <input
                    required
                    value={form.managerName}
                    onChange={(event) => setForm({ ...form, managerName: event.target.value })}
                    className="w-full min-w-0 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Điện thoại</span>
                  <input
                    required
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="w-full min-w-0 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                  />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Diện tích (m²)</span>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.capacityM2}
                  onChange={(event) => setForm({ ...form, capacityM2: Math.max(1, Number(event.target.value) || 1) })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">
                  {editing ? 'Lưu thay đổi' : 'Thêm địa điểm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Xóa {pendingDelete.name}?</h3>
            <p className="text-xs text-slate-600">
              Địa điểm còn tồn kho, đơn hàng, phiếu chuyển, kiểm kê, đơn mua hoặc nhân viên gắn vào sẽ không bị xóa.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteLocation(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Xóa địa điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
