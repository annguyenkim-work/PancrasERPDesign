import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { PurchaseOrder, POLandedCostItem } from '../../types/erp';
import { 
  Container, 
  Ship, 
  Calculator, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Building, 
  FileText, 
  ArrowDownToLine, 
  X,
  Layers,
  Trash2,
  DollarSign,
  Package
} from 'lucide-react';

interface NewPOItemInput {
  productId: string;
  quantity: number;
  unitPriceUSD: number;
}

export const ProcurementView: React.FC = () => {
  const { 
    purchaseOrders, 
    suppliers, 
    locations, 
    products, 
    createPO, 
    receivePOStock,
    exportTableToCSV 
  } = useErp();

  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(purchaseOrders[0] || null);

  // New PO Header state
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 'SUP-01');
  const [targetWarehouse, setTargetWarehouse] = useState('WH_NORTH');
  const [containerNo, setContainerNo] = useState('TGHU9821450 (1x40HQ)');
  const [billOfLading, setBillOfLading] = useState('BL-2026-NOV-881');
  const [vesselName, setVesselName] = useState('MAERSK MC-KINNEY MOLLER V.2604');
  const [destinationPort, setDestinationPort] = useState('Cảng Hải Phòng (Tân Vũ)');
  const [expectedArrival, setExpectedArrival] = useState('2026-11-20');
  const [exchangeRate, setExchangeRate] = useState(25400);
  const [allocationMethod, setAllocationMethod] = useState<'by_value' | 'by_weight'>('by_value');
  const [poNotes, setPoNotes] = useState('');

  // Multiple items state for the PO
  const [poItems, setPoItems] = useState<NewPOItemInput[]>([
    { productId: products[0]?.id || 'P001', quantity: 60, unitPriceUSD: 520 },
    { productId: products[1]?.id || 'P002', quantity: 100, unitPriceUSD: 195 },
    { productId: products[5]?.id || 'P006', quantity: 200, unitPriceUSD: 36 },
  ]);

  // Import landed costs breakdown state
  const [importTaxAmount, setImportTaxAmount] = useState(250000000);
  const [oceanFreightAmount, setOceanFreightAmount] = useState(80000000);
  const [portHandlingAmount, setPortHandlingAmount] = useState(35000000);
  const [inspectionAmount, setInspectionAmount] = useState(25000000);
  const [domesticTransportAmount, setDomesticTransportAmount] = useState(28000000);

  // Helper calculations for dynamic multi-item allocation
  const calculateAllocations = () => {
    const totalExtraCost = 
      importTaxAmount + 
      oceanFreightAmount + 
      portHandlingAmount + 
      inspectionAmount + 
      domesticTransportAmount;

    let totalMerchandiseFobVND = 0;
    let totalContainerWeightKg = 0;

    const itemsSummary = poItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const fobUSD = item.quantity * item.unitPriceUSD;
      const fobVND = fobUSD * exchangeRate;
      const weight = (prod?.weightKg || 25) * item.quantity;

      totalMerchandiseFobVND += fobVND;
      totalContainerWeightKg += weight;

      return {
        ...item,
        productCode: prod?.code || '',
        productName: prod?.name || '',
        unit: prod?.unit || 'Cái',
        weightKg: weight,
        fobUSD,
        fobVND,
      };
    });

    // Allocate landed cost to each item
    const allocatedItems = itemsSummary.map((item) => {
      let allocatedCostVND = 0;
      if (allocationMethod === 'by_value') {
        const ratio = totalMerchandiseFobVND > 0 ? item.fobVND / totalMerchandiseFobVND : 0;
        allocatedCostVND = Math.round(totalExtraCost * ratio);
      } else {
        const ratio = totalContainerWeightKg > 0 ? item.weightKg / totalContainerWeightKg : 0;
        allocatedCostVND = Math.round(totalExtraCost * ratio);
      }

      const totalItemLandedCost = item.fobVND + allocatedCostVND;
      const finalUnitLandedCost = Math.round(totalItemLandedCost / (item.quantity || 1));

      return {
        ...item,
        allocatedCostVND,
        finalUnitLandedCost,
      };
    });

    const grandTotalCostVND = totalMerchandiseFobVND + totalExtraCost;

    return {
      allocatedItems,
      totalMerchandiseFobVND,
      totalContainerWeightKg,
      totalExtraCost,
      grandTotalCostVND,
    };
  };

  const handleAddItemRow = () => {
    // Pick the next available product not already in the list if possible
    const existingIds = new Set(poItems.map((i) => i.productId));
    const nextProd = products.find((p) => !p.isCombo && !existingIds.has(p.id)) || products[0];
    
    setPoItems([
      ...poItems,
      {
        productId: nextProd.id,
        quantity: 50,
        unitPriceUSD: Math.round(nextProd.baseCost / exchangeRate),
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (poItems.length <= 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof NewPOItemInput, value: any) => {
    const updated = [...poItems];
    updated[index] = { ...updated[index], [field]: value };
    setPoItems(updated);
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng vào phiếu mua!');
      return;
    }

    const sup = suppliers.find((s) => s.id === supplierId);
    const { allocatedItems, totalMerchandiseFobVND, totalExtraCost, grandTotalCostVND } = calculateAllocations();

    const landedCostsList: POLandedCostItem[] = [
      { type: 'import_tax', name: 'Thuế nhập khẩu ưu đãi & VAT hải quan', amount: importTaxAmount, allocationMethod },
      { type: 'ocean_freight', name: 'Cước vận tải biển quốc tế (Ocean Freight)', amount: oceanFreightAmount, allocationMethod },
      { type: 'port_handling', name: 'Phí THC & nâng hạ bãi cảng', amount: portHandlingAmount, allocationMethod },
      { type: 'inspection', name: 'Phí kiểm định chất lượng sản phẩm QCVN', amount: inspectionAmount, allocationMethod },
      { type: 'domestic_transport', name: 'Vận chuyển nội địa từ cảng về kho', amount: domesticTransportAmount, allocationMethod },
    ];

    const finalPoItems = allocatedItems.map((it) => ({
      productId: it.productId,
      productCode: it.productCode,
      productName: it.productName,
      quantity: it.quantity,
      unitPriceUSD: it.unitPriceUSD,
      exchangeRate,
      fobAmountVND: it.fobVND,
      weightKg: it.weightKg,
      allocatedCostVND: it.allocatedCostVND,
      finalUnitLandedCost: it.finalUnitLandedCost,
    }));

    const newPO: Partial<PurchaseOrder> = {
      supplierId,
      supplierName: sup?.name || 'Nhà cung cấp',
      targetWarehouseId: targetWarehouse,
      containerNo,
      billOfLading,
      vesselName,
      destinationPort,
      expectedArrivalDate: expectedArrival,
      status: 'shipping',
      items: finalPoItems,
      landedCosts: landedCostsList,
      totalMerchandiseVND: totalMerchandiseFobVND,
      totalLandedCostVND: totalExtraCost,
      grandTotalCostVND,
      notes: poNotes || `Lô hàng container gồm ${finalPoItems.length} mặt hàng theo tàu ${vesselName}, cập cảng ${destinationPort}.`,
    };

    createPO(newPO);
    setShowNewPOModal(false);
  };

  const handleExportPODetails = () => {
    if (!selectedPO) return;
    const headers = ['Mã Đơn PO', 'Số Cont', 'Nhà cung cấp', 'Mã SKU', 'Tên sản phẩm', 'Số lượng', 'Đơn giá FOB (USD)', 'Thành tiền FOB (VNĐ)', 'Chi phí phân bổ (VNĐ)', 'Giá vốn nhập hoàn chỉnh (VNĐ)'];
    const rows = selectedPO.items.map((it) => [
      selectedPO.code,
      selectedPO.containerNo || 'N/A',
      selectedPO.supplierName,
      it.productCode,
      it.productName,
      it.quantity,
      it.unitPriceUSD,
      it.fobAmountVND,
      it.allocatedCostVND,
      it.finalUnitLandedCost,
    ]);
    exportTableToCSV(`Don_Mua_Container_${selectedPO.code}`, headers, rows);
  };

  const currentCalc = calculateAllocations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Mua Hàng, Container Nhập Khẩu &amp; Phân Bổ Giá Vốn (Landed Cost)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ lập phiếu mua <strong>nhiều mặt hàng trong cùng 1 container</strong>, tự động phân bổ chi phí logistics &amp; thuế nhập khẩu vào giá vốn từng sản phẩm.
          </p>
        </div>

        <button
          onClick={() => setShowNewPOModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo Đơn Mua Hàng &amp; Container (Nhiều Mặt Hàng)</span>
        </button>
      </div>

      {/* Grid: Left = List of Container POs, Right = Detailed Landed Cost Allocation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): PO List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách Đơn mua Container ({purchaseOrders.length})
            </span>
          </div>

          <div className="space-y-3">
            {purchaseOrders.map((po) => {
              const isSelected = selectedPO?.id === po.id;
              const wh = locations.find((l) => l.id === po.targetWarehouseId);
              const isReceived = po.status === 'received';
              const itemCount = po.items.length;

              return (
                <div
                  key={po.id}
                  onClick={() => setSelectedPO(po)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{po.code}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {itemCount} mặt hàng
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isReceived
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'customs_cleared'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isReceived
                        ? 'Đã nhập kho'
                        : po.status === 'customs_cleared'
                          ? 'Đã thông quan cảng'
                          : 'Đang trên biển (Shipping)'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-900 mb-1">{po.supplierName}</div>
                  
                  <div className="text-[11px] text-slate-500 space-y-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Container className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cont: {po.containerNo || 'N/A'} · B/L: {po.billOfLading}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-slate-400" />
                      <span>{po.destinationPort} (ETA: {po.expectedArrivalDate})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Kho nhận: {wh?.name.split('(')[0]}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {(po.grandTotalCostVND / 1000000).toFixed(1)} tr đ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected PO Details & Multi-Item Landed Cost Breakdown */}
        {selectedPO && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-900">{selectedPO.code}</span>
                    <span className="text-xs text-slate-500">· {selectedPO.supplierName}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Tàu: {selectedPO.vesselName} · Cảng: {selectedPO.destinationPort} · Số cont: <strong>{selectedPO.containerNo}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPODetails}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <span>Xuất Excel</span>
                  </button>

                  {selectedPO.status !== 'received' && (
                    <button
                      onClick={() => receivePOStock(selectedPO.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Nhập Kho &amp; Cập Nhật Giá Vốn ({selectedPO.items.length} món)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Items in Container - Multi-item list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-sky-600" />
                    <span>Danh Sách {selectedPO.items.length} Mặt Hàng Trong Container</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Tổng SL: {selectedPO.items.reduce((s, it) => s + it.quantity, 0).toLocaleString()} đơn vị
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Mã SKU</th>
                        <th className="py-2.5 px-3">Tên sản phẩm</th>
                        <th className="py-2.5 px-2 text-right">SL</th>
                        <th className="py-2.5 px-3 text-right">Giá FOB (USD)</th>
                        <th className="py-2.5 px-3 text-right">Chi phí phân bổ</th>
                        <th className="py-2.5 px-3 text-right">Giá vốn nhập (VND)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPO.items.map((it) => (
                        <tr key={it.productId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{it.productCode}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs">{it.productName}</td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold tabular-nums text-slate-800">
                            {it.quantity.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                            ${it.unitPriceUSD}
                            <div className="text-[10px] text-slate-400">
                              ({(it.fobAmountVND / 1000000).toFixed(1)} tr đ)
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700 font-semibold">
                            +{it.allocatedCostVND.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                            {it.finalUnitLandedCost.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Landed Cost Breakdown Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-sky-600" />
                    <span>Bảng Chi Phí Nhập Khẩu &amp; Phân Bổ (Landed Cost Breakdown)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Phân bổ tỷ lệ thuận theo giá trị hàng hóa
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedPO.landedCosts.map((cost, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{cost.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Phương pháp: {cost.allocationMethod === 'by_weight' ? 'Theo khối lượng container' : 'Theo trị giá FOB'}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {cost.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Rollup */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tổng tiền hàng FOB ({selectedPO.items.length} mặt hàng quy đổi):</span>
                  <span className="font-mono tabular-nums">{selectedPO.totalMerchandiseVND.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tổng chi phí nhập khẩu &amp; logistics biển:</span>
                  <span className="font-mono tabular-nums text-amber-400">+{selectedPO.totalLandedCostVND.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-700 text-emerald-400">
                  <span>Tổng Giá Vốn Đích Thực Container (Landed Total):</span>
                  <span className="font-mono tabular-nums">{selectedPO.grandTotalCostVND.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: TẠO ĐƠN MUA HÀNG & CONTAINER (HỖ TRỢ NHIỀU MẶT HÀNG) */}
      {showNewPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Container className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Lập Phiếu Mua Hàng &amp; Container Nhập Khẩu (Nhiều Mặt Hàng)
                </h3>
              </div>
              <button onClick={() => setShowNewPOModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Container & Supplier Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nhà cung cấp quốc tế</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.country})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kho tiếp nhận đích</label>
                  <select
                    value={targetWarehouse}
                    onChange={(e) => setTargetWarehouse(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {locations.filter(l => l.type === 'warehouse').map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tỷ giá USD / VNĐ</label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseInt(e.target.value) || 25400)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số hiệu Container</label>
                  <input
                    type="text"
                    value={containerNo}
                    onChange={(e) => setContainerNo(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số Vận Đơn (Bill of Lading)</label>
                  <input
                    type="text"
                    value={billOfLading}
                    onChange={(e) => setBillOfLading(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Tàu &amp; Số Chuyến</label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cảng Đến Tiếp Nhận</label>
                  <input
                    type="text"
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày Dự Kiến Cập Cảng (ETA)</label>
                  <input
                    type="date"
                    value={expectedArrival}
                    onChange={(e) => setExpectedArrival(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu chí phân bổ chi phí</label>
                  <select
                    value={allocationMethod}
                    onChange={(e) => setAllocationMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    <option value="by_value">Theo Trị Giá Hàng (Value-based %)</option>
                    <option value="by_weight">Theo Khối Lượng Container (Weight-based %)</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC MULTIPLE ITEMS TABLE */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-sky-600" />
                      <span>Danh Sách Các Mặt Hàng Đặt Mua Trong Container ({poItems.length} mặt hàng)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Cho phép nhập nhiều mặt hàng thiết bị vệ sinh, gạch, tủ chậu trong cùng một đơn PO
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Mặt Hàng Nhập</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Sản phẩm / Thiết bị</th>
                        <th className="py-2.5 px-2 text-right w-24">Số lượng</th>
                        <th className="py-2.5 px-3 text-right w-32">Đơn giá FOB (USD)</th>
                        <th className="py-2.5 px-3 text-right">FOB (VNĐ)</th>
                        <th className="py-2.5 px-3 text-right">Phân bổ chi phí</th>
                        <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Giá vốn dự kiến</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentCalc.allocatedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <select
                              value={item.productId}
                              onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.code} - {p.name} ({p.unit})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full px-2 py-1 text-xs rounded border border-slate-300 text-right font-mono"
                            />
                          </td>

                          <td className="py-2 px-3 text-right">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={item.unitPriceUSD}
                                onChange={(e) => handleUpdateItem(idx, 'unitPriceUSD', parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-2 py-1 text-xs rounded border border-slate-300 text-right font-mono"
                              />
                            </div>
                          </td>

                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-800">
                            {item.fobVND.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="py-2 px-3 text-right font-mono tabular-nums text-amber-700 font-medium">
                            +{item.allocatedCostVND.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                            {item.finalUnitLandedCost.toLocaleString('vi-VN')} đ / {item.unit}
                          </td>

                          <td className="py-2 px-2 text-center">
                            {poItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItemRow(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                title="Xóa dòng này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center text-xs px-1 text-slate-600">
                  <span>Tổng tiền hàng FOB (chưa gồm chi phí):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {currentCalc.totalMerchandiseFobVND.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* LANDED COSTS EXPENSES BREAKDOWN */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-amber-700" />
                    <span>Chi Phí Nhập Khẩu &amp; Logistics Biển Cần Phân Bổ (VND)</span>
                  </h4>
                  <span className="text-[11px] text-amber-800 font-semibold">
                    Tổng chi phí: {currentCalc.totalExtraCost.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      1. Thuế nhập khẩu + VAT hải quan
                    </label>
                    <input
                      type="number"
                      step="1000000"
                      value={importTaxAmount}
                      onChange={(e) => setImportTaxAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      2. Cước tàu biển quốc tế (Ocean Freight)
                    </label>
                    <input
                      type="number"
                      step="1000000"
                      value={oceanFreightAmount}
                      onChange={(e) => setOceanFreightAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      3. Phí nâng hạ bãi cảng (THC, D/O, vệ sinh cont)
                    </label>
                    <input
                      type="number"
                      step="1000000"
                      value={portHandlingAmount}
                      onChange={(e) => setPortHandlingAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      4. Phí kiểm định chất lượng sản phẩm
                    </label>
                    <input
                      type="number"
                      step="1000000"
                      value={inspectionAmount}
                      onChange={(e) => setInspectionAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      5. Vận chuyển kéo xe container từ cảng về kho
                    </label>
                    <input
                      type="number"
                      step="1000000"
                      value={domesticTransportAmount}
                      onChange={(e) => setDomesticTransportAmount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Total Rollup Banner */}
              <div className="p-4 bg-slate-900 rounded-xl text-white flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                <div>
                  <div className="text-slate-300">Tổng giá trị đơn mua container hoàn chỉnh:</div>
                  <div className="text-lg font-mono font-bold text-emerald-400">
                    {currentCalc.grandTotalCostVND.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>

                <div className="text-right text-slate-400">
                  <div>Tiền hàng: {currentCalc.totalMerchandiseFobVND.toLocaleString('vi-VN')} đ</div>
                  <div>Chi phí phân bổ: +{currentCalc.totalExtraCost.toLocaleString('vi-VN')} đ</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú đơn mua hàng</label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="Ghi chú hải quan, kiểm tra chứng từ CO/CQ..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPOModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Lưu Đơn Mua Hàng &amp; Container ({poItems.length} Mặt Hàng)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
