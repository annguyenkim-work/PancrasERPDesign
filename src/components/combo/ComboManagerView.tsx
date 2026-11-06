import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Product } from '../../types/erp';
import { 
  Boxes, 
  Layers, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Warehouse, 
  ChevronRight,
  X
} from 'lucide-react';
import { MoneyInput } from '../common/MoneyInput';

export const ComboManagerView: React.FC = () => {
  const { products, locations, createCombo } = useErp();

  const comboProducts = products.filter((p) => p.isCombo);
  const regularProducts = products.filter((p) => !p.isCombo);

  const [selectedCombo, setSelectedCombo] = useState<Product | null>(comboProducts[0] || null);
  const [showCreate, setShowCreate] = useState(false);
  const [comboForm, setComboForm] = useState({
    code: 'CB-NEW-01',
    name: '',
    brand: 'Sanita Collection',
    retailPrice: 0,
    dealerPrice: 0,
    projectPrice: 0,
    warrantyMonths: 24,
    description: '',
  });
  const [components, setComponents] = useState<{ productId: string; quantity: number }[]>([
    { productId: regularProducts[0]?.id || '', quantity: 1 },
  ]);

  // Calculate package availability for each location for the selected combo
  const calculatePackableCombosForLocation = (combo: Product, locId: string) => {
    if (!combo.comboComponents) return 0;

    let minCombos = Infinity;
    for (const comp of combo.comboComponents) {
      const child = products.find((p) => p.id === comp.productId);
      if (!child) return 0;
      const onHand = child.stockByLocation[locId]?.onHand || 0;
      const reserved = child.stockByLocation[locId]?.reserved || 0;
      const available = Math.max(0, onHand - reserved);
      const possible = Math.floor(available / comp.quantity);
      if (possible < minCombos) {
        minCombos = possible;
      }
    }
    return minCombos === Infinity ? 0 : minCombos;
  };

  const handleCreateCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboForm.name.trim() || components.length === 0) return;
    createCombo({ ...comboForm, components });
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Combo Sản Phẩm Nội Thất Phòng Tắm &amp; Thiết Bị Vệ Sinh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đóng gói bộ giải pháp gồm Tủ chậu, Lavabo, Gương LED và Phụ kiện sen vòi với thuật toán tự động quét tồn kho linh kiện.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Tạo combo mới
        </button>
      </div>

      {/* Grid: Combo Cards & Detailed Bill of Materials (BOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Combo Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
            Danh Sách Combo Hiện Hành
          </div>

          <div className="space-y-3">
            {comboProducts.map((combo) => {
              const isSelected = selectedCombo?.id === combo.id;
              const totalRetailOfParts = (combo.comboComponents || []).reduce((acc, comp) => {
                const child = products.find((p) => p.id === comp.productId);
                return acc + (child?.retailPrice || 0) * comp.quantity;
              }, 0);
              const savings = totalRetailOfParts - combo.retailPrice;

              return (
                <div
                  key={combo.id}
                  onClick={() => setSelectedCombo(combo)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{combo.code}</span>
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                      Bộ {combo.comboComponents?.length} món
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mb-1">{combo.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{combo.description}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block line-through">
                        Mua lẻ: {totalRetailOfParts.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {combo.retailPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {savings > 0 && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Tiết kiệm {(savings / 1000000).toFixed(1)} tr
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Bill of Materials (BOM) & Multi-Warehouse Stock Readiness */}
        {selectedCombo && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-sky-600" />
                    <h2 className="text-base font-bold text-slate-900">{selectedCombo.name}</h2>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Mã SKU: {selectedCombo.code} · Thương hiệu: {selectedCombo.brand}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Giá bán lẻ combo:</div>
                  <div className="text-base font-mono font-bold text-sky-700">
                    {selectedCombo.retailPrice.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Ready to pack by location banner */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Khả Năng Lắp Ráp &amp; Xuất Combo Tại Từng Kho (Bottleneck Inventory)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {locations.map((loc) => {
                    const maxPacks = calculatePackableCombosForLocation(selectedCombo, loc.id);
                    const isZero = maxPacks === 0;

                    return (
                      <div
                        key={loc.id}
                        className={`p-2.5 rounded-lg border text-center ${
                          isZero
                            ? 'bg-rose-50/50 border-rose-200 text-rose-800'
                            : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <div className="text-[10px] font-semibold text-slate-500 truncate" title={loc.name}>
                          {loc.code}
                        </div>
                        <div className="text-base font-bold font-mono my-0.5">
                          {maxPacks} bộ
                        </div>
                        <div className="text-[10px] font-medium">
                          {isZero ? 'Thiếu linh kiện' : 'Sẵn sàng bán'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Components Breakdown Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Cấu Thành Thành Phần Linh Kiện (BOM)
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Mã linh kiện</th>
                        <th className="py-2.5 px-3">Tên linh kiện / Thành phần</th>
                        <th className="py-2.5 px-2 text-center">SL định mức</th>
                        <th className="py-2.5 px-3 text-right">Đơn giá bán lẻ</th>
                        <th className="py-2.5 px-3 text-right">Thành tiền</th>
                        <th className="py-2.5 px-3 text-center">Trạng thái tồn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCombo.comboComponents?.map((comp) => {
                        const child = products.find((p) => p.id === comp.productId);
                        const totalAvailAll = Object.values(child?.stockByLocation || {}).reduce(
                          (acc, s) => acc + Math.max(0, s.onHand - s.reserved),
                          0
                        );

                        return (
                          <tr key={comp.productId}>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{comp.productCode}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{comp.productName}</td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums text-slate-900">
                              {comp.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                              {child?.retailPrice.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                              {((child?.retailPrice || 0) * comp.quantity).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  totalAvailAll > 20
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                Tồn hệ thống: {totalAvailAll}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Strategy Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">
                  Chính Sách Giá Theo Kênh Bán Hàng
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Khách Lẻ (Showroom)</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {selectedCombo.retailPrice.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Đại Lý Cấp 1 &amp; Cấp 2</div>
                    <div className="font-mono font-bold text-blue-700 text-sm">
                      {selectedCombo.dealerPrice.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Chào Thầu Dự Án</div>
                    <div className="font-mono font-bold text-purple-700 text-sm">
                      {selectedCombo.projectPrice.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Tạo bộ combo phòng tắm</h3>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCombo} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Mã combo</span>
                  <input required value={comboForm.code} onChange={(e) => setComboForm({ ...comboForm, code: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Thương hiệu bộ</span>
                  <input required value={comboForm.brand} onChange={(e) => setComboForm({ ...comboForm, brand: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Tên combo</span>
                <input required value={comboForm.name} onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Giá lẻ</span>
                  <MoneyInput value={comboForm.retailPrice} onChange={(retailPrice) => setComboForm({ ...comboForm, retailPrice })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Giá đại lý</span>
                  <MoneyInput value={comboForm.dealerPrice} onChange={(dealerPrice) => setComboForm({ ...comboForm, dealerPrice })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Giá dự án</span>
                  <MoneyInput value={comboForm.projectPrice} onChange={(projectPrice) => setComboForm({ ...comboForm, projectPrice })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">BH (tháng)</span>
                  <input type="number" min={0} value={comboForm.warrantyMonths} onChange={(e) => setComboForm({ ...comboForm, warrantyMonths: Number(e.target.value) })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Linh kiện trong bộ</span>
                  <button
                    type="button"
                    onClick={() => setComponents([...components, { productId: regularProducts[0]?.id || '', quantity: 1 }])}
                    className="text-[11px] font-semibold text-sky-700"
                  >
                    + Thêm linh kiện
                  </button>
                </div>
                <div className="space-y-2">
                  {components.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={row.productId}
                        onChange={(e) => {
                          const next = [...components];
                          next[idx] = { ...row, productId: e.target.value };
                          setComponents(next);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      >
                        {regularProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => {
                          const next = [...components];
                          next[idx] = { ...row, quantity: Math.max(1, Number(e.target.value) || 1) };
                          setComponents(next);
                        }}
                        className="w-16 px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setComponents(components.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600"
                        disabled={components.length <= 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Mô tả bộ</span>
                <textarea rows={2} value={comboForm.description} onChange={(e) => setComboForm({ ...comboForm, description: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">
                  Lưu combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
