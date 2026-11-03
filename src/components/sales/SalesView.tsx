import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Order, OrderStatus, CustomerType, OrderItem } from '../../types/erp';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Check, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Boxes, 
  X,
  Layers,
  Building2,
  User,
  ShieldAlert
} from 'lucide-react';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';

export const SalesView: React.FC = () => {
  const { 
    orders, 
    customers, 
    products, 
    locations, 
    createOrder, 
    approveOrder, 
    updateOrderStatus,
    checkComboAvailability,
    currentUser,
    exportTableToCSV
  } = useErp();

  const [activeTab, setActiveTab] = useState<'all' | 'retail' | 'dealer' | 'project'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Approval modal state
  const [orderToApprove, setOrderToApprove] = useState<Order | null>(null);
  const [approvalReason, setApprovalReason] = useState('Chấp thuận phê duyệt ngoại lệ hạn mức công nợ tạm thời cho đợt hàng');

  // New Order Form state
  const [orderCustomerType, setOrderCustomerType] = useState<CustomerType>('retail');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [retailCustomerName, setRetailCustomerName] = useState('');
  const [retailCustomerPhone, setRetailCustomerPhone] = useState('');
  const [retailCustomerAddress, setRetailCustomerAddress] = useState('');
  const [orderLocationId, setOrderLocationId] = useState('WH_NORTH');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || 'P001', quantity: 1 },
  ]);
  const [contractCode, setContractCode] = useState('HĐ-DA-2026-X01');
  const [orderNotes, setOrderNotes] = useState('');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.customerType === activeTab;
    const matchesSearch = 
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.salesPersonName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate prices based on customer type
  const calculateItemPrice = (prodId: string, custType: CustomerType, custId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return { unitPrice: 0, discount: 0 };

    const cust = customers.find((c) => c.id === custId);
    const baseDiscount = cust?.discountRate || 0;

    if (custType === 'dealer') {
      return { unitPrice: prod.dealerPrice, discount: baseDiscount };
    } else if (custType === 'project') {
      return { unitPrice: prod.projectPrice, discount: baseDiscount };
    } else {
      return { unitPrice: prod.retailPrice, discount: 0 };
    }
  };

  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { productId: products[0]?.id || 'P001', quantity: 1 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCust = customers.find((c) => c.id === selectedCustomerId);
    const finalItems: OrderItem[] = orderItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const { unitPrice, discount } = calculateItemPrice(prod.id, orderCustomerType, selectedCustomerId);
      const sub = unitPrice * item.quantity;
      const discAmt = (sub * discount) / 100;
      return {
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        unit: prod.unit,
        quantity: item.quantity,
        unitPrice,
        discountPercent: discount,
        totalPrice: sub - discAmt,
        isCombo: prod.isCombo,
      };
    });

    const subtotal = finalItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const discountTotal = finalItems.reduce((sum, it) => sum + (it.unitPrice * it.quantity * it.discountPercent) / 100, 0);
    const taxAmount = Math.round((subtotal - discountTotal) * 0.1);
    const grandTotal = subtotal - discountTotal + taxAmount;

    const res = createOrder({
      customerType: orderCustomerType,
      customerId: selectedCustomerId,
      customerName: orderCustomerType === 'retail' ? retailCustomerName : selectedCust?.name || '',
      customerPhone: orderCustomerType === 'retail' ? retailCustomerPhone : selectedCust?.phone || '',
      locationId: orderLocationId,
      items: finalItems,
      subtotal,
      discountTotal,
      taxAmount,
      grandTotal,
      paidAmount: orderCustomerType === 'retail' ? grandTotal : 0,
      deliveryAddress: orderCustomerType === 'retail' ? retailCustomerAddress : selectedCust?.address || '',
      contractCode: orderCustomerType === 'project' ? contractCode : undefined,
      notes: orderNotes,
    });

    if (res.success) {
      setShowNewOrderModal(false);
      setOrderItems([{ productId: products[0]?.id || 'P001', quantity: 1 }]);
    }
  };

  const handleExportOrders = () => {
    const headers = ['Mã Đơn', 'Ngày tạo', 'Loại KH', 'Tên khách hàng', 'Điện thoại', 'Kho/SR', 'Nhân viên', 'Tổng tiền (đ)', 'Đã thu (đ)', 'Trạng thái'];
    const rows = filteredOrders.map((o) => [
      o.code,
      o.createdAt,
      o.customerType === 'retail' ? 'Khách lẻ' : o.customerType === 'dealer' ? 'Đại lý' : 'Dự án',
      o.customerName,
      o.customerPhone,
      o.locationId,
      o.salesPersonName,
      o.grandTotal,
      o.paidAmount,
      o.status,
    ]);
    exportTableToCSV('Danh_Sach_Don_Hang_PancrasERP', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Bán Hàng &amp; Phân Phối (Lẻ - Đại Lý - Dự Án)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bảng giá tự động theo đối tượng, kiểm tra tồn linh kiện Combo trước khi xuất và kiểm soát hạn mức tín dụng.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Đơn Hàng Mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả đơn ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('retail')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'retail' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khách lẻ Showroom
          </button>
          <button
            onClick={() => setActiveTab('dealer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'dealer' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đại lý B2B
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'project' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dự án &amp; Hợp đồng
          </button>
        </div>

        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((ord) => {
          const loc = locations.find((l) => l.id === ord.locationId);
          const isPendingApproval = ord.status === 'pending_approval';
          const canApprove = currentUser.role === 'admin' || currentUser.role === 'director' || currentUser.role === 'accountant';

          return (
            <div
              key={ord.id}
              className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 transition-colors ${
                isPendingApproval ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900">{ord.code}</span>
                  
                  {/* Customer Type Tag */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ord.customerType === 'project'
                        ? 'bg-purple-100 text-purple-800'
                        : ord.customerType === 'dealer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ord.customerType === 'project' ? 'DỰ ÁN' : ord.customerType === 'dealer' ? 'ĐẠI LÝ' : 'KHÁCH LẺ'}
                  </span>

                  {/* Status Tag */}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      ord.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'delivering'
                          ? 'bg-sky-100 text-sky-800'
                          : ord.status === 'exporting'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.status === 'pending_approval'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {ord.status === 'completed'
                      ? 'Hoàn tất'
                      : ord.status === 'delivering'
                        ? 'Đang giao hàng'
                        : ord.status === 'exporting'
                          ? 'Đang xuất kho'
                          : ord.status === 'pending_approval'
                            ? 'Chờ duyệt công nợ'
                            : 'Đã duyệt đơn'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{ord.createdAt}</span>
                  <span>·</span>
                  <span>Kho/SR: {loc?.name.split('(')[0]}</span>
                  <span>·</span>
                  <span>Sales: {ord.salesPersonName}</span>
                </div>
              </div>

              {/* Warning Alert if Over Credit Limit */}
              {isPendingApproval && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Cảnh báo kiểm soát tín dụng: </span>
                    <span>{ord.creditApprovalReason || 'Đơn hàng vượt hạn mức tín dụng hoặc khách hàng có nợ quá hạn.'}</span>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      Đơn hàng bị tạm khóa. Chỉ Giám đốc hoặc Kế toán trưởng có thẩm quyền duyệt ngoại lệ.
                    </div>
                  </div>
                </div>
              )}

              {/* Customer and Delivery info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500">Khách hàng: </span>
                  <span className="font-bold text-slate-900">{ord.customerName}</span>
                  <span className="text-slate-500"> ({ord.customerPhone})</span>
                  {ord.contractCode && (
                    <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                      Hợp đồng kinh tế: {ord.contractCode}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-slate-500">Địa chỉ giao: </span>
                  <span className="text-slate-800">{ord.deliveryAddress || 'Nhận tại Showroom'}</span>
                </div>
              </div>

              {/* Project Milestones Progress (If Project) */}
              {ord.projectMilestones && ord.projectMilestones.length > 0 && (
                <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span>Tiến Độ Bàn Giao &amp; Nghiệm Thu Dự Án ({ord.projectMilestones.length} Đợt)</span>
                    <span>Giá trị hợp đồng: {ord.grandTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {ord.projectMilestones.map((m) => (
                      <div key={m.id} className="p-2 bg-white rounded border border-purple-200">
                        <div className="font-semibold text-slate-900">{m.name.split(':')[0]}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{m.itemsSummary}</div>
                        <div className="flex justify-between text-[11px] mt-1 pt-1 border-t border-slate-100">
                          <span className={m.deliveryStatus === 'delivered' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-medium'}>
                            {m.deliveryStatus === 'delivered' ? '✓ Đã giao' : 'Đang giao'}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {(m.paymentAmount / 1000000).toFixed(1)} tr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-y border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Mã SKU</th>
                      <th className="py-2 px-3">Tên sản phẩm</th>
                      <th className="py-2 px-2 text-center">ĐVT</th>
                      <th className="py-2 px-2 text-right">SL</th>
                      <th className="py-2 px-3 text-right">Đơn giá</th>
                      <th className="py-2 px-2 text-right">CK (%)</th>
                      <th className="py-2 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ord.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono text-slate-700">{it.productCode}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{it.productName}</span>
                            {it.isCombo && (
                              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-semibold">
                                Combo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center text-slate-500">{it.unit}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold tabular-nums text-slate-900">{it.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                          {it.unitPrice.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-600">
                          {it.discountPercent}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          {it.totalPrice.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Tổng thanh toán: </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {ord.grandTotal.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Đã thanh toán: </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {ord.paidAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrderForPrint(ord)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Hóa Đơn / Phiếu Xuất</span>
                  </button>

                  {/* Approve button for credit override */}
                  {isPendingApproval && canApprove && (
                    <button
                      onClick={() => setOrderToApprove(ord)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Duyệt Ngoại Lệ Công Nợ</span>
                    </button>
                  )}

                  {/* Order lifecycle buttons */}
                  {ord.status === 'approved' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'exporting')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>Soạn Xuất Kho</span>
                    </button>
                  )}

                  {ord.status === 'exporting' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'delivering')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Bàn Giao Xe Đi Giao</span>
                    </button>
                  )}

                  {ord.status === 'delivering' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'completed')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Nghiệm Thu Hoàn Tất</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: TẠO ĐƠN HÀNG MỚI (CÓ CHECK TỒN COMBO) */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Lập Đơn Bán Hàng &amp; Kiểm Soát Combo</h3>
              </div>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Customer Type Selector */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOrderCustomerType('retail')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    orderCustomerType === 'retail' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Khách Lẻ (Showroom)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderCustomerType('dealer')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    orderCustomerType === 'dealer' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Đại Lý (Giá B2B &amp; Chiết Khấu)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderCustomerType('project')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    orderCustomerType === 'project' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Khách Hàng Dự Án (Hợp Đồng)
                </button>
              </div>

              {/* Customer Info */}
              {orderCustomerType === 'retail' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tên khách hàng</label>
                    <input
                      type="text"
                      placeholder="Anh/Chị..."
                      value={retailCustomerName}
                      onChange={(e) => setRetailCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="09..."
                      value={retailCustomerPhone}
                      onChange={(e) => setRetailCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ giao hàng</label>
                    <input
                      type="text"
                      placeholder="Địa chỉ nhà..."
                      value={retailCustomerAddress}
                      onChange={(e) => setRetailCustomerAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chọn {orderCustomerType === 'dealer' ? 'Đại lý' : 'Chủ đầu tư / Nhà thầu dự án'}
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      required
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers
                        .filter((c) => c.type === orderCustomerType)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Dư nợ: {(c.currentDebt / 1000000).toFixed(1)} tr / Hạn mức: {(c.creditLimit / 1000000).toFixed(0)} tr)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kho xuất hàng</label>
                    <select
                      value={orderLocationId}
                      onChange={(e) => setOrderLocationId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Items in Order */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">Danh mục sản phẩm &amp; Combo đặt mua</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm thiết bị</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const isCombo = prod?.isCombo;
                    const comboCheck = isCombo ? checkComboAvailability(prod.id, orderLocationId, item.quantity) : null;

                    return (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.productId}
                            onChange={(e) => {
                              const updated = [...orderItems];
                              updated[idx].productId = e.target.value;
                              setOrderItems(updated);
                            }}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.code} - {p.name} {p.isCombo ? '(COMBO)' : ''}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500">SL:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...orderItems];
                                updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                setOrderItems(updated);
                              }}
                              className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 text-center font-mono"
                            />
                          </div>

                          {orderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* COMBO COMPONENT STOCK VALIDATOR BANNER */}
                        {isCombo && (
                          <div className={`p-2.5 rounded-md text-xs ${
                            comboCheck?.canFulfill 
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-900 border border-rose-200'
                          }`}>
                            <div className="flex items-center justify-between font-semibold">
                              <span>Kiểm tra tồn kho thành phần Combo ({prod.comboComponents?.length} món):</span>
                              <span>{comboCheck?.canFulfill ? '✓ Đủ linh kiện đóng bộ' : '⚠ THIẾU LINH KIỆN'}</span>
                            </div>
                            
                            {!comboCheck?.canFulfill && (
                              <div className="mt-1 space-y-0.5 text-[11px] text-rose-700">
                                {comboCheck?.missingItems.map((m, mIdx) => (
                                  <div key={mIdx}>
                                    · Thiếu: {m.productName} (Cần {m.requiredQty}, kho chỉ còn {m.availableQty} -&gt; Thiếu {m.shortage})
                                  </div>
                                ))}
                                <div className="text-[10px] text-slate-600 italic mt-1">
                                  Hệ thống sẽ không cho phép tạo đơn nếu thiếu linh kiện tạo Combo. Vui lòng chuyển kho cấp bù trước.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú giao hàng</label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Yêu cầu lắp đặt, thời gian giao hàng, người nhận..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Lưu &amp; Tạo Đơn Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL OVERRIDE MODAL */}
      {orderToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">Phê Duyệt Ngoại Lệ Công Nợ</h3>
              </div>
              <button onClick={() => setOrderToApprove(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Bạn đang thực hiện quyền của: <strong className="text-slate-900">{currentUser.roleLabel}</strong>.
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                <div>Đơn hàng: <strong>{orderToApprove.code}</strong></div>
                <div>Khách hàng: <strong>{orderToApprove.customerName}</strong></div>
                <div>Giá trị đơn: <strong>{orderToApprove.grandTotal.toLocaleString('vi-VN')} đ</strong></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Căn cứ phê duyệt ngoại lệ</label>
                <textarea
                  rows={2}
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToApprove(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  approveOrder(orderToApprove.id, approvalReason);
                  setOrderToApprove(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Chấp Thuận &amp; Xuất Đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE MODAL */}
      {selectedOrderForPrint && (
        <PrintInvoiceModal
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}
    </div>
  );
};
