import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Factory, Plus, X } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, purchaseOrders, addSupplier } = useErp();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    country: '',
    contactPerson: '',
    phone: '',
    email: '',
    bankAccount: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier(form);
    setShowCreate(false);
    setForm({ code: '', name: '', country: '', contactPerson: '', phone: '', email: '', bankAccount: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nhà Cung Cấp &amp; Đối Tác Nhập Khẩu</h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách hãng dùng khi lập đơn mua container. Nhà cung cấp mới xuất hiện ngay trong phiếu mua hàng.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm nhà cung cấp
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((s) => {
          const poCount = purchaseOrders.filter((po) => po.supplierId === s.id).length;
          const openPo = purchaseOrders.filter((po) => po.supplierId === s.id && po.status !== 'received' && po.status !== 'cancelled').length;
          return (
            <div key={s.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Factory className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900">{s.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{s.code}</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded shrink-0">
                  {s.country}
                </span>
              </div>
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                <Row label="Liên hệ" value={s.contactPerson} />
                <Row label="Điện thoại" value={s.phone} mono />
                <Row label="Email" value={s.email} />
                <Row label="Tài khoản" value={s.bankAccount} />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500">{poCount} đơn mua</span>
                <span className={openPo > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                  {openPo > 0 ? `${openPo} lô chưa nhập kho` : 'Không có lô đang về'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Thêm nhà cung cấp</h3>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Mã NCC</span>
                  <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Quốc gia / khu vực</span>
                  <input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Tên nhà cung cấp</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Người liên hệ</span>
                  <input required value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Điện thoại</span>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Email</span>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Tài khoản ngân hàng</span>
                <input required value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">
                  Lưu nhà cung cấp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className={`text-slate-800 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);
