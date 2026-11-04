import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Product, ProductCategory } from '../../types/erp';
import { Package, Plus, Search, X } from 'lucide-react';

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  thiet_bi_ve_sinh: 'Thiết bị vệ sinh',
  noi_that_phong_tam: 'Nội thất phòng tắm',
  vat_tu_xay_dung: 'Vật tư xây dựng',
  combo: 'Combo',
};

const emptyForm = {
  code: '',
  name: '',
  category: 'thiet_bi_ve_sinh' as ProductCategory,
  brand: '',
  unit: 'Cái',
  baseCost: 0,
  retailPrice: 0,
  dealerPrice: 0,
  projectPrice: 0,
  minStockAlert: 5,
  weightKg: 10,
  origin: 'Nhập khẩu',
  warrantyMonths: 24,
  description: '',
};

export const CatalogView: React.FC = () => {
  const { products, locations, addProduct, exportTableToCSV } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | ProductCategory>('all');
  const [selected, setSelected] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const catalog = products.filter((p) => !p.isCombo);
  const filtered = catalog.filter((p) => {
    const matchesCategory = category === 'all' || p.category === category;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleExport = () => {
    const headers = ['Mã SKU', 'Tên', 'Danh mục', 'Thương hiệu', 'ĐVT', 'Giá vốn', 'Giá lẻ', 'Giá đại lý', 'Giá dự án', 'BH (tháng)'];
    const rows = filtered.map((p) => [
      p.code,
      p.name,
      CATEGORY_LABEL[p.category],
      p.brand,
      p.unit,
      p.baseCost,
      p.retailPrice,
      p.dealerPrice,
      p.projectPrice,
      p.warrantyMonths,
    ]);
    exportTableToCSV('Danh_Muc_San_Pham', headers, rows);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(form);
    setShowCreate(false);
    setForm(emptyForm);
  };

  const setField = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Danh Mục Sản Phẩm &amp; Bảng Giá Ba Kênh</h1>
          <p className="text-xs text-slate-500 mt-1">
            SKU thiết bị vệ sinh, nội thất phòng tắm và vật tư. Mỗi mã có giá vốn, giá lẻ, giá đại lý và giá chào thầu.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Xuất Excel
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {(['all', 'thiet_bi_ve_sinh', 'noi_that_phong_tam', 'vat_tu_xay_dung'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                category === key ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              {key === 'all' ? `Tất cả (${catalog.length})` : CATEGORY_LABEL[key]}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm mã SKU, tên, thương hiệu..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-3">Thương hiệu</th>
                <th className="py-3 px-3 text-right">Giá vốn</th>
                <th className="py-3 px-3 text-right">Giá lẻ</th>
                <th className="py-3 px-3 text-right">Giá đại lý</th>
                <th className="py-3 px-3 text-right">Giá dự án</th>
                <th className="py-3 px-3 text-center">BH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => setSelected(p)} className="hover:bg-slate-50 cursor-pointer">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{p.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400">{CATEGORY_LABEL[p.category]} · {p.unit}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{p.brand}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{p.baseCost.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">{p.retailPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-blue-700">{p.dealerPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-purple-700">{p.projectPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-3 text-center">{p.warrantyMonths} th</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="text-slate-500">{selected.description}</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Info label="Mã SKU" value={selected.code} />
                <Info label="Xuất xứ" value={selected.origin} />
                <Info label="Khối lượng" value={`${selected.weightKg} kg`} />
                <Info label="Tồn tối thiểu" value={String(selected.minStockAlert)} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Info label="Giá vốn" value={`${selected.baseCost.toLocaleString('vi-VN')} đ`} />
                <Info label="Giá lẻ" value={`${selected.retailPrice.toLocaleString('vi-VN')} đ`} />
                <Info label="Giá đại lý" value={`${selected.dealerPrice.toLocaleString('vi-VN')} đ`} />
                <Info label="Giá dự án" value={`${selected.projectPrice.toLocaleString('vi-VN')} đ`} />
              </div>
              <div>
                <div className="font-bold text-slate-800 uppercase tracking-wider mb-2">Tồn theo điểm</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {locations.map((loc) => {
                    const s = selected.stockByLocation[loc.id] || { onHand: 0, reserved: 0, inTransit: 0 };
                    return (
                      <div key={loc.id} className="p-2.5 rounded-lg border border-slate-200 text-center">
                        <div className="text-[10px] text-slate-500 truncate">{loc.code}</div>
                        <div className="font-mono font-bold text-slate-900">{s.onHand}</div>
                        <div className="text-[10px] text-slate-400">giữ {s.reserved}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Thêm sản phẩm vào danh mục</h3>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Mã SKU">
                  <input required value={form.code} onChange={(e) => setField('code', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Thương hiệu">
                  <input required value={form.brand} onChange={(e) => setField('brand', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Đơn vị tính">
                  <input required value={form.unit} onChange={(e) => setField('unit', e.target.value)} className={inputClass} />
                </Field>
              </div>
              <Field label="Tên sản phẩm">
                <input required value={form.name} onChange={(e) => setField('name', e.target.value)} className={inputClass} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Danh mục">
                  <select value={form.category} onChange={(e) => setField('category', e.target.value)} className={inputClass}>
                    <option value="thiet_bi_ve_sinh">Thiết bị vệ sinh</option>
                    <option value="noi_that_phong_tam">Nội thất phòng tắm</option>
                    <option value="vat_tu_xay_dung">Vật tư xây dựng</option>
                  </select>
                </Field>
                <Field label="Xuất xứ">
                  <input value={form.origin} onChange={(e) => setField('origin', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Bảo hành (tháng)">
                  <input type="number" min={0} value={form.warrantyMonths} onChange={(e) => setField('warrantyMonths', Number(e.target.value))} className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Giá vốn (đ)">
                  <input type="number" min={0} required value={form.baseCost} onChange={(e) => setField('baseCost', Number(e.target.value))} className={inputClass} />
                </Field>
                <Field label="Giá lẻ (đ)">
                  <input type="number" min={0} required value={form.retailPrice} onChange={(e) => setField('retailPrice', Number(e.target.value))} className={inputClass} />
                </Field>
                <Field label="Giá đại lý (đ)">
                  <input type="number" min={0} required value={form.dealerPrice} onChange={(e) => setField('dealerPrice', Number(e.target.value))} className={inputClass} />
                </Field>
                <Field label="Giá dự án (đ)">
                  <input type="number" min={0} required value={form.projectPrice} onChange={(e) => setField('projectPrice', Number(e.target.value))} className={inputClass} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Khối lượng (kg)">
                  <input type="number" min={0} value={form.weightKg} onChange={(e) => setField('weightKg', Number(e.target.value))} className={inputClass} />
                </Field>
                <Field label="Định mức tồn tối thiểu">
                  <input type="number" min={0} value={form.minStockAlert} onChange={(e) => setField('minStockAlert', Number(e.target.value))} className={inputClass} />
                </Field>
              </div>
              <Field label="Mô tả">
                <textarea rows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} className={inputClass} />
              </Field>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputClass = 'w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
    {children}
  </label>
);

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
    <div className="text-[10px] uppercase text-slate-400 font-semibold">{label}</div>
    <div className="font-semibold text-slate-900 mt-0.5">{value}</div>
  </div>
);
