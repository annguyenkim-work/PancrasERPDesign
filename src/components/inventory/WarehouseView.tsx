import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Location,
  Order,
  Product,
  ProductCategory,
  PurchaseOrder,
  StockTake,
  StockTransfer,
} from '../../types/erp';
import { 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardCheck, 
  Search, 
  Plus, 
  Check, 
  Download, 
  AlertCircle,
  Truck,
  PackageCheck,
  CheckCircle2,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const WarehouseView: React.FC = () => {
  const { 
    products, 
    locations, 
    transfers, 
    stockTakes,
    orders,
    purchaseOrders,
    createTransfer, 
    receiveTransfer, 
    createStockTake, 
    approveStockTake, 
    directStockAdjust,
    currentUser,
    exportTableToCSV
  } = useErp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'transfers' | 'stocktake'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocFilter, setSelectedLocFilter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showStockTakeModal, setShowStockTakeModal] = useState(false);
  const [showQuickAdjustModal, setShowQuickAdjustModal] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<string | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [manualAdjustments, setManualAdjustments] = useState<ManualAdjustment[]>([]);

  // New transfer form state
  const [fromLocation, setFromLocation] = useState('WH_NORTH');
  const [toLocation, setToLocation] = useState('SR_HANOI');
  const [transferItems, setTransferItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || 'P001', quantity: 2 },
  ]);
  const [transferNotes, setTransferNotes] = useState('');

  // Quick adjust form state
  const [adjustLoc, setAdjustLoc] = useState('WH_NORTH');
  const [adjustDelta, setAdjustDelta] = useState(1);
  const [adjustReason, setAdjustReason] = useState('Nhập bù hàng mẫu kiểm định');

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportStock = () => {
    const headers = ['Mã SKU', 'Tên sản phẩm', 'Đơn vị', 'Danh mục', 'Giá vốn (đ)', 'Tồn thực tế', 'Đang giữ chỗ', 'Khả dụng', 'Đang chuyển kho'];
    const rows = filteredProducts.map((p) => {
      let onHand = 0;
      let reserved = 0;
      let inTransit = 0;

      if (selectedLocFilter === 'ALL') {
        Object.values(p.stockByLocation).forEach((s) => {
          onHand += s.onHand;
          reserved += s.reserved;
          inTransit += s.inTransit;
        });
      } else {
        const s = p.stockByLocation[selectedLocFilter] || { onHand: 0, reserved: 0, inTransit: 0 };
        onHand = s.onHand;
        reserved = s.reserved;
        inTransit = s.inTransit;
      }

      return [
        p.code,
        p.name,
        p.unit,
        p.category,
        p.baseCost,
        onHand,
        reserved,
        Math.max(0, onHand - reserved),
        inTransit,
      ];
    });

    exportTableToCSV(`Ton_Kho_${selectedLocFilter}`, headers, rows);
  };

  const handleCreateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocation === toLocation) {
      alert('Kho nguồn và kho nhận không được trùng nhau!');
      return;
    }
    createTransfer(fromLocation, toLocation, transferItems, transferNotes);
    setShowTransferModal(false);
    setTransferItems([{ productId: products[0]?.id || 'P001', quantity: 1 }]);
    setTransferNotes('');
  };

  const handleAddTransferRow = () => {
    setTransferItems([...transferItems, { productId: products[0]?.id || 'P001', quantity: 1 }]);
  };

  const handleRemoveTransferRow = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const handleQuickAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;
    setManualAdjustments((prev) => [
      {
        id: `ADJ-${Date.now()}`,
        productId: selectedProductForAdjust,
        locationId: adjustLoc,
        delta: adjustDelta,
        reason: adjustReason,
        at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: `${currentUser.name} (${currentUser.roleLabel})`,
      },
      ...prev,
    ]);
    directStockAdjust(selectedProductForAdjust, adjustLoc, adjustDelta, adjustReason);
    setShowQuickAdjustModal(false);
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-x-clip">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 min-w-0">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Đa Kho &amp; Điều Chuyển Hàng Hóa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý độc lập 3 kho tổng (Long Biên, Bình Dương, Đà Nẵng) và 2 showroom bán lẻ (Cầu Giấy, Q7).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
          {/* Segmented Tab Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-full min-w-0">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Tra cứu tồn kho</span>
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'transfers' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Chuyển kho ({transfers.filter(t => t.status === 'in_transit').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('stocktake')}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'stocktake' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Kiểm kê &amp; Điều chỉnh</span>
            </button>
          </div>

          <button
            onClick={() => setShowTransferModal(true)}
            className="shrink-0 self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Phiếu Chuyển Kho</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INVENTORY LOOKUP & MULTI-LOCATION MATRIX */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs min-w-0">
            <div className="flex flex-1 flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 min-w-0">
              <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo mã SKU, tên thiết bị, thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-w-0 pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50"
                />
              </div>

              {/* Warehouse selector */}
              <select
                value={selectedLocFilter}
                onChange={(e) => setSelectedLocFilter(e.target.value)}
                className="w-full sm:w-auto sm:max-w-[240px] min-w-0 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">Toàn hệ thống (5 địa điểm)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.type === 'warehouse' ? 'Kho: ' : 'SR: '} {loc.name}
                  </option>
                ))}
              </select>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto sm:max-w-[200px] min-w-0 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tất cả ngành hàng</option>
                <option value="thiet_bi_ve_sinh">Thiết bị vệ sinh</option>
                <option value="noi_that_phong_tam">Nội thất phòng tắm</option>
                <option value="vat_tu_xay_dung">Vật tư xây dựng</option>
                <option value="combo">Combo phòng tắm</option>
              </select>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {filteredProducts.length} mặt hàng
              </span>
              <button
                onClick={handleExportStock}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden min-w-0 max-w-full">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[920px] text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Mã SKU</th>
                    <th className="py-3 px-4">Tên hàng hóa &amp; Quy cách</th>
                    <th className="py-3 px-3 text-center">ĐVT</th>
                    <th className="py-3 px-3 text-right">Giá vốn niêm yết</th>
                    <th className="py-3 px-3 text-right">Tồn thực tế</th>
                    <th className="py-3 px-3 text-right">Đang giữ chỗ</th>
                    <th className="py-3 px-3 text-right">Khả dụng</th>
                    <th className="py-3 px-3 text-right">Đang chuyển</th>
                    <th className="py-3 px-4 text-center">Tồn tại các điểm</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    let onHand = 0;
                    let reserved = 0;
                    let inTransit = 0;

                    if (selectedLocFilter === 'ALL') {
                      Object.values(p.stockByLocation).forEach((s) => {
                        onHand += s.onHand;
                        reserved += s.reserved;
                        inTransit += s.inTransit;
                      });
                    } else {
                      const s = p.stockByLocation[selectedLocFilter] || { onHand: 0, reserved: 0, inTransit: 0 };
                      onHand = s.onHand;
                      reserved = s.reserved;
                      inTransit = s.inTransit;
                    }

                    const available = Math.max(0, onHand - reserved);
                    const isLow = onHand <= p.minStockAlert;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">{p.code}</td>
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-semibold text-slate-900 line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{p.brand}</span>
                            <span>·</span>
                            <span>{p.origin}</span>
                            {p.isCombo && (
                              <>
                                <span>·</span>
                                <span className="text-sky-600 font-semibold">Bộ Combo {p.comboComponents?.length} món</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">{p.unit}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {p.baseCost.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          {onHand.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700 font-medium">
                          {reserved.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                          {available.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-sky-700">
                          {inTransit.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 text-[10px]">
                            {locations.map((loc) => {
                              const qty = p.stockByLocation[loc.id]?.onHand || 0;
                              return (
                                <span
                                  key={loc.id}
                                  title={`${loc.name}: ${qty} ${p.unit}`}
                                  className={`px-1.5 py-0.5 rounded font-mono ${
                                    qty === 0
                                      ? 'bg-slate-100 text-slate-400'
                                      : 'bg-sky-50 text-sky-800 font-semibold'
                                  }`}
                                >
                                  {loc.code.replace('KT-', 'K-').replace('SR-', 'S-')}: {qty}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setDetailProductId(p.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 rounded-md"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProductForAdjust(p.id);
                                setShowQuickAdjustModal(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                              title="Điều chỉnh số lượng tồn kho"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSFERS BETWEEN WAREHOUSES & SHOWROOMS */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <Truck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900">
                  Lịch Sử Điều Chuyển Hàng Giữa Các Kho &amp; Showroom
                </h3>
                <p className="text-xs text-slate-500">
                  Hàng hóa chuyển từ Kho Tổng đến Showroom hoặc liên kho được kiểm soát trạng thái Đang vận chuyển.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTransferModal(true)}
              className="shrink-0 self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Phiếu Chuyển Kho</span>
            </button>
          </div>

          <div className="space-y-3">
            {transfers.map((trf) => {
              const srcLoc = locations.find((l) => l.id === trf.fromLocationId);
              const destLoc = locations.find((l) => l.id === trf.toLocationId);
              const isInTransit = trf.status === 'in_transit';

              return (
                <div
                  key={trf.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900">{trf.code}</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isInTransit ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isInTransit ? 'Đang vận chuyển' : 'Đã tiếp nhận nhập kho'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Khởi tạo: {trf.createdAt}</span>
                      <span>·</span>
                      <span>Người tạo: {trf.createdBy}</span>
                    </div>
                  </div>

                  {/* Route Visualizer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/70 text-xs min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Kho xuất hàng</div>
                      <div className="font-bold text-slate-900">{srcLoc?.name}</div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-1 sm:gap-0 px-1 sm:px-4">
                      <ArrowLeftRight className={`w-4 h-4 ${isInTransit ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-mono text-slate-400 sm:mt-0.5">
                        {isInTransit ? 'Đang trên xe' : 'Đã hoàn tất'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 sm:text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Điểm tiếp nhận</div>
                      <div className="font-bold text-slate-900">{destLoc?.name}</div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-xs text-left">
                      <thead className="bg-slate-100/60 text-slate-600">
                        <tr>
                          <th className="py-2 px-3">Mã SKU</th>
                          <th className="py-2 px-3">Tên sản phẩm</th>
                          <th className="py-2 px-3 text-right">Số lượng chuyển</th>
                          <th className="py-2 px-3 text-center">ĐVT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {trf.items.map((it) => (
                          <tr key={it.productId}>
                            <td className="py-2 px-3 font-mono font-medium text-slate-700">{it.productCode}</td>
                            <td className="py-2 px-3 text-slate-900 font-medium">{it.productName}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                              {it.quantity}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-500">{it.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer & Action button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 italic min-w-0">
                      {trf.notes ? `Ghi chú: ${trf.notes}` : 'Chuyển hàng định kỳ'}
                    </div>

                    {isInTransit && (
                      <button
                        onClick={() => receiveTransfer(trf.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Xác Nhận Đã Nhận Hàng &amp; Nhập Kho</span>
                      </button>
                    )}

                    {!isInTransit && (
                      <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã nhập kho bởi: {trf.receivedBy || 'Thủ kho'} ({trf.receivedAt})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STOCK TAKE & INVENTORY AUDITS */}
      {activeTab === 'stocktake' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <ClipboardCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900">Kiểm Kê Kho Định Kỳ &amp; Cân Đối Tồn Kho</h3>
                <p className="text-xs text-slate-500">
                  Ghi nhận chênh lệch kiểm đếm thực tế và sổ sách ERP, phê duyệt điều chỉnh số liệu tự động.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowStockTakeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lập Biên Bản Kiểm Kê</span>
            </button>
          </div>

          <div className="space-y-4">
            {stockTakes.map((st) => {
              const loc = locations.find((l) => l.id === st.locationId);
              const isPending = st.status === 'pending_approval';

              return (
                <div key={st.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900">{st.code}</span>
                      <span className="text-xs font-semibold text-slate-700">Kho kiểm tra: {loc?.name}</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isPending ? 'Chờ duyệt điều chỉnh' : 'Đã duyệt cập nhật tồn'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Ngày kiểm kê: {st.takeDate} · Người kiểm: {st.inspectorName}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Mã SKU</th>
                          <th className="py-2.5 px-3">Tên sản phẩm</th>
                          <th className="py-2.5 px-3 text-center">ĐVT</th>
                          <th className="py-2.5 px-3 text-right">Tồn sổ sách</th>
                          <th className="py-2.5 px-3 text-right">Tồn thực đếm</th>
                          <th className="py-2.5 px-3 text-right">Chênh lệch</th>
                          <th className="py-2.5 px-3">Lý do chênh lệch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {st.items.map((it) => (
                          <tr key={it.productId}>
                            <td className="py-2 px-3 font-mono text-slate-700">{it.productCode}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{it.productName}</td>
                            <td className="py-2 px-3 text-center text-slate-500">{it.unit}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">{it.bookQuantity}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-900">{it.actualQuantity}</td>
                            <td
                              className={`py-2 px-3 text-right font-mono font-bold tabular-nums ${
                                it.difference === 0
                                  ? 'text-slate-400'
                                  : it.difference > 0
                                    ? 'text-emerald-600'
                                    : 'text-rose-600'
                              }`}
                            >
                              {it.difference > 0 ? `+${it.difference}` : it.difference}
                            </td>
                            <td className="py-2 px-3 text-slate-500 italic">{it.reason || 'Khớp số liệu'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 min-w-0">
                      Ghi chú: {st.notes}
                    </div>

                    {isPending && (currentUser.role === 'admin' || currentUser.role === 'director' || currentUser.role === 'accountant') && (
                      <button
                        onClick={() => approveStockTake(st.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Phê Duyệt Điều Chỉnh Tồn Kho</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: TẠO PHIẾU CHUYỂN KHO */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Lập Phiếu Điều Chuyển Kho Hàng</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransferSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kho xuất (Nguồn)</label>
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kho / Showroom nhận (Đích)</label>
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List to transfer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">Danh sách thiết bị chuyển</label>
                  <button
                    type="button"
                    onClick={handleAddTransferRow}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm mặt hàng</span>
                  </button>
                </div>

                <div className="space-y-2 min-w-0">
                  {transferItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 min-w-0">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const updated = [...transferItems];
                          updated[idx].productId = e.target.value;
                          setTransferItems(updated);
                        }}
                        className="w-0 min-w-0 flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        {products.map((p) => {
                          const stockInFrom = p.stockByLocation[fromLocation]?.onHand || 0;
                          return (
                            <option key={p.id} value={p.id}>
                              {p.code} - {p.name} (Kho xuất còn: {stockInFrom})
                            </option>
                          );
                        })}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...transferItems];
                          updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                          setTransferItems(updated);
                        }}
                        className="w-20 shrink-0 px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-center font-mono"
                        placeholder="Số lượng"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveTransferRow(idx)}
                        disabled={transferItems.length === 1}
                        className="shrink-0 p-1.5 text-slate-400 hover:text-rose-600 disabled:invisible"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú vận chuyển</label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Ví dụ: Chuyển mẫu trưng bày showroom hoặc bù tồn kho phục vụ dự án..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Xác Nhận Xuất Xe Chuyển Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LẬP BIÊN BẢN KIỂM KÊ */}
      {showStockTakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Lập Biên Bản Kiểm Kê Kho</h3>
              <button onClick={() => setShowStockTakeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <p className="text-xs text-slate-500">
                Kiểm đếm nhanh mặt hàng để gửi kế toán và ban giám đốc duyệt cân đối số liệu tồn kho.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn địa điểm kiểm kê</label>
                <select
                  value={adjustLoc}
                  onChange={(e) => setAdjustLoc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mặt hàng kiểm đếm</label>
                <select
                  value={selectedProductForAdjust || products[0]?.id}
                  onChange={(e) => setSelectedProductForAdjust(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} (Tồn sổ sách: {p.stockByLocation[adjustLoc]?.onHand || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng thực tế kiểm đếm được</label>
                <input
                  type="number"
                  min="0"
                  defaultValue={products[0]?.stockByLocation[adjustLoc]?.onHand || 10}
                  id="actualCountInput"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lý do giải trình chênh lệch</label>
                <input
                  type="text"
                  defaultValue="Kiểm kê định kỳ tháng 11"
                  id="reasonStockTakeInput"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStockTakeModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const actualQty = parseInt((document.getElementById('actualCountInput') as HTMLInputElement)?.value || '0');
                    const reason = (document.getElementById('reasonStockTakeInput') as HTMLInputElement)?.value || 'Kiểm kê định kỳ';
                    createStockTake(adjustLoc, [{ productId: selectedProductForAdjust || products[0].id, actualQuantity: actualQty, reason }], reason);
                    setShowStockTakeModal(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Lưu Biên Bản Kiểm Kê
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK STOCK ADJUSTMENT */}
      {showQuickAdjustModal && selectedProductForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Điều Chỉnh Tồn Kho Trực Tiếp</h3>
              <button onClick={() => setShowQuickAdjustModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAdjustSubmit} className="space-y-3">
              <div className="text-xs text-slate-600 font-medium">
                Sản phẩm: {products.find(p => p.id === selectedProductForAdjust)?.name}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kho điều chỉnh</label>
                <select
                  value={adjustLoc}
                  onChange={(e) => setAdjustLoc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số lượng thay đổi (+ thêm vào, - bớt ra)
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lý do điều chỉnh</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAdjustModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Cập Nhật Tồn Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailProductId && (
        <ProductStockDetail
          product={products.find((item) => item.id === detailProductId) || null}
          locations={locations}
          orders={orders}
          purchaseOrders={purchaseOrders}
          transfers={transfers}
          stockTakes={stockTakes}
          manualAdjustments={manualAdjustments.filter((item) => item.productId === detailProductId)}
          workplaceId={currentUser.branchId !== 'ALL' ? currentUser.branchId : null}
          onClose={() => setDetailProductId(null)}
        />
      )}
    </div>
  );
};

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  thiet_bi_ve_sinh: 'Thiết bị vệ sinh',
  noi_that_phong_tam: 'Nội thất phòng tắm',
  vat_tu_xay_dung: 'Vật tư xây dựng',
  combo: 'Combo',
};

const ORDER_MOVE_LABEL: Record<string, string> = {
  exporting: 'Đang soạn xuất kho',
  delivering: 'Đã xuất, đang giao',
  completed: 'Đã xuất và hoàn tất',
};

interface ManualAdjustment {
  id: string;
  productId: string;
  locationId: string;
  delta: number;
  reason: string;
  at: string;
  actor: string;
}

type HistoryKind = 'inbound' | 'outbound' | 'transfer_out' | 'transfer_in' | 'adjust';

interface HistoryEvent {
  id: string;
  at: string;
  sortKey: number;
  locationId: string;
  kind: HistoryKind;
  badge: string;
  title: string;
  qtyLabel: string;
  place: string;
  detail: string;
  actorLabel: string;
  actor: string;
}

const HISTORY_FILTERS: { id: 'all' | HistoryKind | 'transfer'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'inbound', label: 'Nhập' },
  { id: 'outbound', label: 'Xuất bán' },
  { id: 'transfer', label: 'Chuyển kho' },
  { id: 'adjust', label: 'Điều chỉnh' },
];

const historyTone: Record<HistoryKind, string> = {
  inbound: 'bg-emerald-100 text-emerald-800',
  outbound: 'bg-sky-100 text-sky-800',
  transfer_out: 'bg-amber-100 text-amber-800',
  transfer_in: 'bg-indigo-100 text-indigo-800',
  adjust: 'bg-rose-100 text-rose-800',
};

const timeValue = (value: string) => {
  const parsed = Date.parse(value.includes('T') ? value : value.replace(' ', 'T'));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const placeName = (locations: Location[], id: string) => locations.find((item) => item.id === id)?.name || id;

const buildHistory = (
  product: Product,
  locations: Location[],
  orders: Order[],
  purchaseOrders: PurchaseOrder[],
  transfers: StockTransfer[],
  stockTakes: StockTake[],
  manualAdjustments: ManualAdjustment[],
): HistoryEvent[] => {
  const events: HistoryEvent[] = [];

  purchaseOrders.forEach((po) => {
    const line = po.items.find((item) => item.productId === product.id);
    if (!line || po.status === 'cancelled') return;
    const received = po.status === 'received';
    events.push({
      id: `po-${po.id}`,
      at: received ? po.expectedArrivalDate || po.orderDate : po.orderDate,
      sortKey: timeValue(received ? po.expectedArrivalDate || po.orderDate : po.orderDate),
      locationId: po.targetWarehouseId,
      kind: 'inbound',
      badge: received ? 'Nhập kho' : 'Vận đơn',
      title: received
        ? `Đã nhập từ vận đơn ${po.billOfLading || po.code}`
        : `Vận đơn ${po.billOfLading || 'chưa có số'} — chưa nhập kho`,
      qtyLabel: `+${line.quantity.toLocaleString('vi-VN')} ${product.unit}`,
      place: placeName(locations, po.targetWarehouseId),
      detail: `${po.code} · ${po.supplierName}${po.containerNo ? ` · Container ${po.containerNo}` : ''}${po.vesselName ? ` · ${po.vesselName}` : ''}`,
      actorLabel: 'Người nhập',
      actor: received ? 'Bộ phận mua hàng' : 'Chưa nhập kho',
    });
  });

  orders.forEach((order) => {
    if (!ORDER_MOVE_LABEL[order.status]) return;
    const line = order.items.find((item) => item.productId === product.id);
    if (!line) return;
    events.push({
      id: `ord-${order.id}`,
      at: order.deliveryDate || order.createdAt,
      sortKey: timeValue(order.deliveryDate || order.createdAt),
      locationId: order.locationId,
      kind: 'outbound',
      badge: 'Xuất bán',
      title: `Xuất cho hóa đơn ${order.code}`,
      qtyLabel: `-${line.quantity.toLocaleString('vi-VN')} ${product.unit}`,
      place: placeName(locations, order.locationId),
      detail: `${ORDER_MOVE_LABEL[order.status]} · ${order.customerName}${order.contractCode ? ` · HĐ ${order.contractCode}` : ''}`,
      actorLabel: 'Người xuất',
      actor: order.salesPersonName,
    });
  });

  transfers.forEach((transfer) => {
    if (transfer.status === 'cancelled') return;
    const line = transfer.items.find((item) => item.productId === product.id);
    if (!line) return;
    const fromName = placeName(locations, transfer.fromLocationId);
    const toName = placeName(locations, transfer.toLocationId);
    events.push({
      id: `trf-out-${transfer.id}`,
      at: transfer.shippedAt || transfer.createdAt,
      sortKey: timeValue(transfer.shippedAt || transfer.createdAt),
      locationId: transfer.fromLocationId,
      kind: 'transfer_out',
      badge: 'Chuyển đi',
      title: `Chuyển sang ${toName}`,
      qtyLabel: `-${line.quantity.toLocaleString('vi-VN')} ${product.unit}`,
      place: fromName,
      detail: `${transfer.code}${transfer.status === 'in_transit' ? ' · Đang trên đường' : ' · Đã giao kho nhận'}`,
      actorLabel: 'Người xuất chuyển',
      actor: transfer.createdBy,
    });
    if (transfer.status === 'received') {
      events.push({
        id: `trf-in-${transfer.id}`,
        at: transfer.receivedAt || transfer.shippedAt || transfer.createdAt,
        sortKey: timeValue(transfer.receivedAt || transfer.shippedAt || transfer.createdAt),
        locationId: transfer.toLocationId,
        kind: 'transfer_in',
        badge: 'Nhận về',
        title: `Nhận từ ${fromName}`,
        qtyLabel: `+${line.quantity.toLocaleString('vi-VN')} ${product.unit}`,
        place: toName,
        detail: transfer.code,
        actorLabel: 'Người nhập',
        actor: transfer.receivedBy || 'Chưa ghi người nhận',
      });
    }
  });

  stockTakes.forEach((take) => {
    if (take.status !== 'approved') return;
    const line = take.items.find((item) => item.productId === product.id);
    if (!line) return;
    const delta = line.difference;
    events.push({
      id: `st-${take.id}`,
      at: take.takeDate,
      sortKey: timeValue(take.takeDate),
      locationId: take.locationId,
      kind: 'adjust',
      badge: 'Điều chỉnh',
      title: delta === 0 ? `Kiểm kê ${take.code}, không lệch sổ` : `Điều chỉnh theo kiểm kê ${take.code}`,
      qtyLabel: `${delta > 0 ? '+' : ''}${delta.toLocaleString('vi-VN')} ${product.unit}`,
      place: placeName(locations, take.locationId),
      detail: line.reason || (delta === 0 ? 'Số đếm khớp sổ sách' : take.notes || 'Không ghi lý do'),
      actorLabel: 'Người điều chỉnh',
      actor: take.inspectorName,
    });
  });

  manualAdjustments.forEach((item) => {
    events.push({
      id: item.id,
      at: item.at,
      sortKey: timeValue(item.at),
      locationId: item.locationId,
      kind: 'adjust',
      badge: 'Điều chỉnh',
      title: 'Điều chỉnh tồn trực tiếp',
      qtyLabel: `${item.delta > 0 ? '+' : ''}${item.delta.toLocaleString('vi-VN')} ${product.unit}`,
      place: placeName(locations, item.locationId),
      detail: item.reason,
      actorLabel: 'Người điều chỉnh',
      actor: item.actor,
    });
  });

  return events.sort((a, b) => b.sortKey - a.sortKey);
};

const PAGE_SIZES = [10, 20, 50];

const ProductStockDetail: React.FC<{
  product: Product | null;
  locations: Location[];
  orders: Order[];
  purchaseOrders: PurchaseOrder[];
  transfers: StockTransfer[];
  stockTakes: StockTake[];
  manualAdjustments: ManualAdjustment[];
  workplaceId: string | null;
  onClose: () => void;
}> = ({ product, locations, orders, purchaseOrders, transfers, stockTakes, manualAdjustments, workplaceId, onClose }) => {
  const [filter, setFilter] = useState<(typeof HISTORY_FILTERS)[number]['id']>('all');
  const [pageSize, setPageSize] = useState(10);
  const [locationId, setLocationId] = useState(workplaceId || 'ALL');
  if (!product) return null;

  const activeLocationId = workplaceId || locationId;
  const workplace = workplaceId ? locations.find((item) => item.id === workplaceId) : null;
  const history = buildHistory(product, locations, orders, purchaseOrders, transfers, stockTakes, manualAdjustments);
  const matched = history.filter((event) => {
    if (activeLocationId !== 'ALL' && event.locationId !== activeLocationId) return false;
    if (filter === 'all') return true;
    if (filter === 'transfer') return event.kind === 'transfer_out' || event.kind === 'transfer_in';
    return event.kind === filter;
  });
  const visible = matched.slice(0, pageSize);

  const info: { label: string; value: string }[] = [
    { label: 'Danh mục', value: CATEGORY_LABEL[product.category] },
    { label: 'Thương hiệu', value: product.brand },
    { label: 'Xuất xứ', value: product.origin },
    { label: 'Đơn vị tính', value: product.unit },
    { label: 'Khối lượng', value: `${product.weightKg} kg` },
    { label: 'Bảo hành', value: `${product.warrantyMonths} tháng` },
    { label: 'Tồn tối thiểu', value: `${product.minStockAlert} ${product.unit}` },
    { label: 'Giá vốn', value: `${product.baseCost.toLocaleString('vi-VN')} đ` },
    { label: 'Giá lẻ', value: `${product.retailPrice.toLocaleString('vi-VN')} đ` },
    { label: 'Giá đại lý', value: `${product.dealerPrice.toLocaleString('vi-VN')} đ` },
    { label: 'Giá dự án', value: `${product.projectPrice.toLocaleString('vi-VN')} đ` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-100">
          <div>
            <div className="font-mono text-[11px] font-semibold text-sky-700">{product.code}</div>
            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{product.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <section className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Thông tin hàng hóa</h4>
            <p className="text-xs text-slate-600">{product.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {info.map((item) => (
                <div key={item.label} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{item.label}</div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
            {product.isCombo && product.comboComponents && (
              <div className="text-xs text-slate-700">
                <span className="font-semibold">Thành phần combo: </span>
                {product.comboComponents.map((item) => `${item.quantity} ${item.productCode}`).join(', ')}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900">Tồn theo điểm</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Điểm</th>
                    <th className="py-2 px-3 text-right">Tồn</th>
                    <th className="py-2 px-3 text-right">Giữ chỗ</th>
                    <th className="py-2 px-3 text-right">Khả dụng</th>
                    <th className="py-2 px-3 text-right">Đang chuyển tới</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((location) => {
                    const stock = product.stockByLocation[location.id] || { onHand: 0, reserved: 0, inTransit: 0 };
                    return (
                      <tr key={location.id}>
                        <td className="py-2 px-3 font-medium text-slate-900">{location.name}</td>
                        <td className="py-2 px-3 text-right font-mono">{stock.onHand.toLocaleString('vi-VN')}</td>
                        <td className="py-2 px-3 text-right font-mono text-amber-700">{stock.reserved.toLocaleString('vi-VN')}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-700">{Math.max(0, stock.onHand - stock.reserved).toLocaleString('vi-VN')}</td>
                        <td className="py-2 px-3 text-right font-mono text-sky-700">{stock.inTransit.toLocaleString('vi-VN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900">Lịch sử thay đổi</h4>
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {HISTORY_FILTERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md ${
                        filter === item.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                <label className="block">
                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">Số dòng</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
                <label className="block flex-1">
                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">Địa điểm</span>
                  <select
                    value={activeLocationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    disabled={Boolean(workplaceId)}
                    className={`w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 ${
                      workplaceId ? 'bg-slate-100 text-slate-600' : 'bg-white'
                    }`}
                  >
                    {!workplaceId && <option value="ALL">Tất cả địa điểm</option>}
                    {(workplace ? [workplace] : locations).map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              {workplace && (
                <p className="text-[11px] text-slate-500">Chỉ xem lịch sử tại {workplace.name}, nơi bạn đang làm việc.</p>
              )}
              <p className="text-[11px] text-slate-400">Hiển thị {visible.length} / {matched.length} dòng</p>
            </div>
            {visible.length === 0 ? (
              <div className="p-3 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                Chưa có biến động nào cho bộ lọc này.
              </div>
            ) : (
              <div className="space-y-2">
                {visible.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${historyTone[event.kind]}`}>{event.badge}</span>
                          <span className="text-xs font-semibold text-slate-900">{event.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{event.at} · {event.place}</div>
                        <div className="text-[11px] text-slate-700 mt-1">{event.detail}</div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          <span className="font-semibold">{event.actorLabel}: </span>
                          {event.actor}
                        </div>
                      </div>
                      <div className="shrink-0 font-mono text-xs font-bold text-slate-900">{event.qtyLabel}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
