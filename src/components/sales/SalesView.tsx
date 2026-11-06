import React, { useEffect, useRef, useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Order, OrderStatus, CustomerType, OrderItem, ProjectMilestone } from '../../types/erp';
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
  ShieldAlert,
  Pencil,
  Upload
} from 'lucide-react';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';

type DraftOrderLine = {
  productId: string;
  quantity: number;
  quotedUnitPrice?: number;
  unmatchedCode?: string;
};

type ParsedQuoteFile = {
  code: string;
  channel?: CustomerType;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  lines: { productCode: string; quantity: number; unitPrice?: number }[];
};

const CHANNEL_FROM_LABEL: Record<string, CustomerType> = {
  'khách lẻ': 'retail',
  'đại lý': 'dealer',
  'nhà phân phối': 'distributor',
  'dự án': 'project',
};

/** Đọc tệp catalog tạo từ màn báo giá. Tệp khác trả về null, form không bị điền. */
function parseQuoteFile(text: string): ParsedQuoteFile | null {
  const marker = text.match(/<script type="application\/json" id="pancras-quote">([\s\S]*?)<\/script>/);
  if (marker) {
    try {
      const data = JSON.parse(marker[1]);
      if (data?.kind !== 'pancras-quote' || typeof data.customerName !== 'string') return null;
      const channel = ['retail', 'dealer', 'distributor', 'project'].includes(data.channel) ? data.channel as CustomerType : undefined;
      const lines = Array.isArray(data.lines)
        ? data.lines
            .filter((line: { productCode?: string; quantity?: number }) => typeof line?.productCode === 'string' && Number(line.quantity) > 0)
            .map((line: { productCode: string; quantity: number; unitPrice?: number }) => ({
              productCode: line.productCode,
              quantity: Math.floor(Number(line.quantity)),
              unitPrice: Number.isFinite(Number(line.unitPrice)) ? Number(line.unitPrice) : undefined,
            }))
        : [];
      return {
        code: typeof data.code === 'string' ? data.code : 'Báo giá',
        channel,
        customerName: data.customerName,
        customerPhone: typeof data.customerPhone === 'string' ? data.customerPhone : '',
        customerAddress: typeof data.customerAddress === 'string' ? data.customerAddress : '',
        lines,
      };
    } catch {
      return null;
    }
  }

  if (!text.includes('Catalog báo giá')) return null;
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const who = doc.querySelector('.who div');
  const customerName = who
    ? Array.from(who.childNodes).map((node) => (node.textContent || '').trim()).find((part) => part && part !== 'Kính gửi') || ''
    : '';
  if (!customerName) return null;
  const channelLabel = (doc.querySelector('.sub')?.textContent || '').split('Bảng giá kênh:')[1]?.trim().toLowerCase() || '';
  const code = doc.querySelector('.code strong')?.textContent?.trim() || 'Báo giá';
  const lines = Array.from(doc.querySelectorAll('article.card')).flatMap((card) => {
    const brand = card.querySelector('.brand')?.textContent || '';
    const productCode = brand.split('·').pop()?.trim() || '';
    const qtyText = (card.querySelector('.meta')?.textContent || '').match(/SL:\s*([\d.]+)/);
    const quantity = qtyText ? Number(qtyText[1].replace(/\./g, '')) : 0;
    const priceNodes = Array.from(card.querySelectorAll('.price .net'));
    const priceText = priceNodes[0]?.textContent?.replace(/[^\d]/g, '') || '';
    if (!productCode || quantity <= 0) return [];
    return [{ productCode, quantity, unitPrice: priceText ? Number(priceText) : undefined }];
  });
  return {
    code,
    channel: CHANNEL_FROM_LABEL[channelLabel],
    customerName,
    customerPhone: '',
    customerAddress: '',
    lines,
  };
}

const ORDER_TYPE_LABEL: Record<CustomerType, string> = {
  retail: 'KHÁCH LẺ',
  dealer: 'ĐẠI LÝ',
  distributor: 'NHÀ PHÂN PHỐI',
  project: 'DỰ ÁN',
};

const orderTypeClass = (type: CustomerType) => {
  if (type === 'project') return 'bg-purple-100 text-purple-800';
  if (type === 'dealer') return 'bg-blue-100 text-blue-800';
  if (type === 'distributor') return 'bg-amber-100 text-amber-800';
  return 'bg-emerald-100 text-emerald-800';
};

export const SalesView: React.FC = () => {
  const { 
    orders, 
    customers, 
    products, 
    locations, 
    createOrder, 
    approveOrder, 
    updateOrderStatus,
    reviseOrderBeforeIssue,
    checkComboAvailability,
    currentUser,
    exportTableToCSV,
    showToast
  } = useErp();

  const canChooseExportLocation = currentUser.role === 'admin' || currentUser.role === 'director';
  const workplace = locations.find((l) => l.id === currentUser.branchId) || null;

  const [activeTab, setActiveTab] = useState<'all' | CustomerType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  // Approval modal state
  const [orderToApprove, setOrderToApprove] = useState<Order | null>(null);
  const [reviseOrder, setReviseOrder] = useState<Order | null>(null);
  const [reviseCustomerId, setReviseCustomerId] = useState('');
  const [reviseName, setReviseName] = useState('');
  const [revisePhone, setRevisePhone] = useState('');
  const [reviseAddress, setReviseAddress] = useState('');
  const [reviseType, setReviseType] = useState<CustomerType>('retail');
  const [reviseItems, setReviseItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [approvalReason, setApprovalReason] = useState('Chấp thuận phê duyệt ngoại lệ hạn mức công nợ tạm thời cho đợt hàng');

  // New Order Form state
  const [orderChannel, setOrderChannel] = useState<'retail' | 'trade' | 'project'>('retail');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [retailCustomerName, setRetailCustomerName] = useState('');
  const [retailCustomerPhone, setRetailCustomerPhone] = useState('');
  const [retailCustomerAddress, setRetailCustomerAddress] = useState('');
  const [orderLocationId, setOrderLocationId] = useState('WH_NORTH');
  const [orderItems, setOrderItems] = useState<DraftOrderLine[]>([
    { productId: products[0]?.id || 'P001', quantity: 1 },
  ]);
  const [importedQuoteCode, setImportedQuoteCode] = useState<string | null>(null);
  const [importedCustomerName, setImportedCustomerName] = useState('');
  const quoteFileRef = useRef<HTMLInputElement>(null);
  const [contractCode] = useState('HĐ-DA-2026-X01');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const selectedFormCustomer = customers.find((c) => c.id === selectedCustomerId);
  const orderCustomerType: CustomerType =
    orderChannel === 'project'
      ? 'project'
      : orderChannel === 'trade'
        ? selectedFormCustomer?.type === 'distributor'
          ? 'distributor'
          : 'dealer'
        : 'retail';

  useEffect(() => {
    if (orderChannel === 'retail' && !canChooseExportLocation && workplace) {
      setOrderLocationId(workplace.id);
    }
  }, [orderChannel, canChooseExportLocation, workplace]);

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

    if (custType === 'dealer' || custType === 'distributor') {
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

    const exportLocationId =
      orderCustomerType === 'retail' && !canChooseExportLocation
        ? workplace?.id || ''
        : orderLocationId;

    if (orderCustomerType === 'retail' && !exportLocationId) {
      showToast('error', 'Chưa có điểm xuất hàng', 'Tài khoản chưa được gán chi nhánh làm việc nên không thể lập đơn khách lẻ.');
      return;
    }

    const selectedCust = customers.find((c) => c.id === selectedCustomerId);
    const selectedMilestone = selectedCust?.milestones?.find((item) => item.id === selectedMilestoneId);
    if (!importedQuoteCode && orderCustomerType === 'project' && (selectedCust?.milestones?.length || 0) > 0 && !selectedMilestone) {
      showToast('error', 'Chưa chọn đợt bàn giao', 'Chọn đợt đã lập trên hồ sơ dự án để lấy mặt hàng và số lượng.');
      return;
    }
    if (orderItems.length === 0 || orderItems.some((item) => !item.productId || item.quantity <= 0)) {
      showToast('error', 'Dòng hàng chưa hợp lệ', 'Mỗi dòng cần một mặt hàng có trong danh mục. Tệp chưa tạo đơn.');
      return;
    }
    const finalItems: OrderItem[] = orderItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const priced = item.quotedUnitPrice != null
        ? { unitPrice: item.quotedUnitPrice, discount: 0 }
        : calculateItemPrice(prod.id, orderCustomerType, selectedCustomerId);
      const { unitPrice, discount } = priced;
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
      customerName: orderCustomerType === 'retail' ? retailCustomerName : selectedCust?.name || importedCustomerName,
      customerPhone: orderCustomerType === 'retail' ? retailCustomerPhone : selectedCust?.phone || '',
      locationId: exportLocationId,
      items: finalItems,
      subtotal,
      discountTotal,
      taxAmount,
      grandTotal,
      paidAmount: orderCustomerType === 'retail' ? grandTotal : 0,
      deliveryAddress: orderCustomerType === 'retail' ? retailCustomerAddress : selectedCust?.address || '',
      contractCode: orderCustomerType === 'project' ? contractCode : undefined,
      milestoneId: orderCustomerType === 'project' ? selectedMilestone?.id : undefined,
      milestoneName: orderCustomerType === 'project' ? selectedMilestone?.name : undefined,
      deliveryDate: orderCustomerType === 'project' ? selectedMilestone?.deliveryDate : undefined,
      notes: orderNotes,
    });

    if (res.success) {
      setShowNewOrderModal(false);
      setOrderItems([{ productId: products[0]?.id || 'P001', quantity: 1 }]);
      setImportedQuoteCode(null);
      setImportedCustomerName('');
    }
  };

  const handleImportQuoteFile = async (file: File) => {
    const parsed = parseQuoteFile(await file.text());
    if (quoteFileRef.current) quoteFileRef.current.value = '';
    if (!parsed) {
      showToast('error', 'Không đọc được báo giá', 'Chọn tệp catalog HTML đã tạo từ màn Báo giá. Form chưa bị điền và chưa có đơn.');
      return;
    }
    if (parsed.channel === 'project') setOrderChannel('project');
    else if (parsed.channel === 'dealer' || parsed.channel === 'distributor') setOrderChannel('trade');
    else setOrderChannel('retail');
    setSelectedMilestoneId('');
    setImportedQuoteCode(parsed.code);
    setImportedCustomerName(parsed.customerName.trim());
    setRetailCustomerName(parsed.customerName.trim());
    setRetailCustomerPhone(parsed.customerPhone);
    setRetailCustomerAddress(parsed.customerAddress);
    const matched = customers.find((customer) =>
      customer.name.trim().toLowerCase() === parsed.customerName.trim().toLowerCase()
      || (parsed.customerPhone && customer.phone === parsed.customerPhone)
    );
    setSelectedCustomerId(matched?.id || '');
    if (parsed.lines.length === 0) {
      setOrderItems([]);
      showToast('error', 'Tệp không có dòng hàng', 'Thêm dòng trên form hoặc chọn tệp khác. Đơn chưa được tạo.');
      return;
    }
    const unmatched = parsed.lines.filter((line) => !products.some((product) => product.code === line.productCode));
    setOrderItems(parsed.lines.map((line) => {
      const product = products.find((item) => item.code === line.productCode);
      return product
        ? { productId: product.id, quantity: line.quantity, quotedUnitPrice: line.unitPrice }
        : { productId: '', quantity: line.quantity, quotedUnitPrice: line.unitPrice, unmatchedCode: line.productCode };
    }));
    showToast(
      unmatched.length ? 'error' : 'success',
      unmatched.length ? 'Có dòng chưa khớp danh mục' : 'Đã điền form từ báo giá',
      unmatched.length
        ? `${parsed.code}: ${unmatched.length} mã không có trong danh mục. Sửa dòng đó rồi mới tạo. Đơn chưa được tạo.`
        : `${parsed.code} đã điền ${parsed.customerName.trim()} và ${parsed.lines.length} dòng. Chọn kho xuất, xem lại, rồi bấm tạo.`
    );
  };

  const handleExportOrders = () => {
    const headers = ['Mã Đơn', 'Ngày tạo', 'Loại KH', 'Tên khách hàng', 'Điện thoại', 'Kho/SR', 'Nhân viên', 'Tổng tiền (đ)', 'Đã thu (đ)', 'Trạng thái'];
    const rows = filteredOrders.map((o) => [
      o.code,
      o.createdAt,
      ORDER_TYPE_LABEL[o.customerType],
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
            Quản Lý Bán Hàng (Lẻ - Đại lý - Nhà phân phối - Dự án)
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
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {([
            ['all', `Tất cả đơn (${orders.length})`],
            ['retail', 'Khách lẻ'],
            ['dealer', 'Đại lý'],
            ['distributor', 'Nhà phân phối'],
            ['project', 'Dự án'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === key ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
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
          const milestoneLabel = ord.milestoneName
            || customers.find((c) => c.id === ord.customerId)?.milestones?.find((m) => m.id === ord.milestoneId)?.name;

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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${orderTypeClass(ord.customerType)}`}>
                    {ORDER_TYPE_LABEL[ord.customerType]}
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
                  {milestoneLabel && (
                    <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                      Đợt bàn giao: {milestoneLabel}{ord.deliveryDate ? ` · ${ord.deliveryDate}` : ''}
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

                <div className="flex flex-wrap items-center gap-2">
                  {(ord.status === 'draft' || ord.status === 'pending_approval' || ord.status === 'approved') && canApprove && (
                    <button
                      onClick={() => {
                        setReviseOrder(ord);
                        setReviseCustomerId(ord.customerId);
                        setReviseName(ord.customerName);
                        setRevisePhone(ord.customerPhone);
                        setReviseAddress(ord.deliveryAddress);
                        setReviseType(ord.customerType);
                        setReviseItems(ord.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Sửa trước khi xuất</span>
                    </button>
                  )}
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

            <form onSubmit={handleCreateOrderSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-sky-300 bg-sky-50 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Nhập file báo giá</p>
                  <p className="text-[11px] text-slate-600">
                    {importedQuoteCode
                      ? `Đã điền từ ${importedQuoteCode}${importedCustomerName ? ` · ${importedCustomerName}` : ''}. Đơn chưa tạo — xem lại, chọn kho xuất, rồi bấm Lưu.`
                      : 'Chọn tệp catalog HTML đã tải từ màn Báo giá. Form được điền sẵn khách và dòng hàng, chưa tạo đơn.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => quoteFileRef.current?.click()}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Nhập file
                </button>
                <input
                  ref={quoteFileRef}
                  type="file"
                  accept=".html,text/html"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImportQuoteFile(file);
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
                {([
                  ['retail', 'Khách lẻ'],
                  ['trade', 'Nhà phân phối/Đại lý'],
                  ['project', 'Dự án'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setOrderChannel(key);
                      setSelectedCustomerId('');
                      setSelectedMilestoneId('');
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      orderChannel === key ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {orderChannel === 'trade' && (
                <p className="text-[11px] text-amber-800">
                  Nhà phân phối và đại lý dùng chung bảng giá đại lý. Bảng giá riêng cho nhà phân phối chưa chốt.
                </p>
              )}

              {/* Customer Info */}
              {orderChannel === 'retail' ? (
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
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Xuất từ</label>
                    <select
                      value={canChooseExportLocation ? orderLocationId : workplace?.id || ''}
                      onChange={(e) => setOrderLocationId(e.target.value)}
                      disabled={!canChooseExportLocation}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 ${
                        canChooseExportLocation ? 'bg-white' : 'bg-slate-100 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {canChooseExportLocation ? (
                        locations.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))
                      ) : workplace ? (
                        <option value={workplace.id}>{workplace.name}</option>
                      ) : (
                        <option value="">Chưa gán chi nhánh làm việc</option>
                      )}
                    </select>
                    {!canChooseExportLocation && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Xuất từ chi nhánh bạn đang làm việc. Chỉ Admin và Giám đốc được đổi điểm xuất.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chọn {orderChannel === 'trade' ? 'nhà phân phối / đại lý' : 'chủ đầu tư / nhà thầu dự án'}
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        setSelectedMilestoneId('');
                        if (!importedQuoteCode) {
                          setOrderItems([{ productId: products[0]?.id || 'P001', quantity: 1 }]);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      required={!importedCustomerName}
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customers
                        .filter((c) =>
                          orderChannel === 'trade'
                            ? c.type === 'dealer' || c.type === 'distributor'
                            : c.type === 'project',
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {orderChannel === 'trade' ? `${c.type === 'distributor' ? 'Nhà phân phối' : 'Đại lý'} · ` : ''}
                            {c.name} (Dư nợ: {(c.currentDebt / 1000000).toFixed(1)} tr / Hạn mức: {(c.creditLimit / 1000000).toFixed(0)} tr)
                          </option>
                        ))}
                    </select>
                    {importedCustomerName && !selectedCustomerId && (
                      <p className="text-[11px] text-amber-800 mt-1">
                        Tệp ghi khách “{importedCustomerName}” nhưng chưa thấy trong danh bạ. Đơn sẽ dùng tên này, hoặc chọn khách có sẵn.
                      </p>
                    )}
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

              {orderChannel === 'project' && selectedCustomerId && (
                <ProjectBatchPicker
                  milestones={customers.find((c) => c.id === selectedCustomerId)?.milestones || []}
                  selectedId={selectedMilestoneId}
                  onSelect={(milestone) => {
                    setSelectedMilestoneId(milestone?.id || '');
                    if (milestone?.items?.length) {
                      setOrderItems(milestone.items.map((line) => ({ productId: line.productId, quantity: line.quantity })));
                    }
                  }}
                />
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
                  {orderItems.length === 0 && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Chưa có dòng hàng. Thêm thiết bị hoặc chọn tệp báo giá khác. Đơn chưa được tạo.
                    </p>
                  )}
                  {orderItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const isCombo = prod?.isCombo;
                    const comboCheck = isCombo ? checkComboAvailability(prod.id, orderLocationId, item.quantity) : null;

                    return (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <select
                            value={item.productId}
                            onChange={(e) => {
                              const updated = [...orderItems];
                              updated[idx] = { productId: e.target.value, quantity: updated[idx].quantity };
                              setOrderItems(updated);
                            }}
                            className="w-0 min-w-0 flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            {!item.productId && <option value="">Chưa khớp danh mục</option>}
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.code} - {p.name} {p.isCombo ? '(COMBO)' : ''}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1 shrink-0">
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

                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={!importedQuoteCode && orderItems.length <= 1}
                            className="shrink-0 p-1 text-slate-400 hover:text-rose-600 disabled:invisible"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {item.unmatchedCode && (
                          <p className="text-[11px] text-rose-700">
                            Mã {item.unmatchedCode} không có trong danh mục. Chọn mặt hàng khác hoặc xóa dòng trước khi tạo.
                          </p>
                        )}
                        {item.quotedUnitPrice != null && !item.unmatchedCode && (
                          <p className="text-[11px] text-slate-600">
                            Giá theo báo giá: {item.quotedUnitPrice.toLocaleString('vi-VN')} đ. Đổi mặt hàng thì lấy lại giá danh mục.
                          </p>
                        )}

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

      {reviseOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Sửa {reviseOrder.code} trước khi xuất</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kế toán, Giám đốc và Admin sửa khách hàng và dòng hàng trước khi ghi phiếu xuất. Sau bước soạn xuất kho thì không sửa.
                </p>
              </div>
              <button onClick={() => setReviseOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              className="flex-1 overflow-y-auto p-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const saved = reviseOrderBeforeIssue(reviseOrder.id, {
                  customerId: reviseCustomerId,
                  customerName: reviseName,
                  customerPhone: revisePhone,
                  deliveryAddress: reviseAddress,
                  customerType: reviseType,
                  items: reviseItems,
                });
                if (saved) setReviseOrder(null);
              }}
            >
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Chọn lại khách trong danh bạ</span>
                <select
                  value={reviseCustomerId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setReviseCustomerId(nextId);
                    const customer = customers.find((item) => item.id === nextId);
                    if (!customer) return;
                    setReviseName(customer.name);
                    setRevisePhone(customer.phone);
                    setReviseAddress(customer.address);
                    setReviseType(customer.type);
                  }}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">Giữ khách đang ghi trên đơn</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {ORDER_TYPE_LABEL[customer.type]} · {customer.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Tên trên hóa đơn</span>
                  <input required value={reviseName} onChange={(e) => setReviseName(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Điện thoại</span>
                  <input required value={revisePhone} onChange={(e) => setRevisePhone(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ giao</span>
                <input value={reviseAddress} onChange={(e) => setReviseAddress(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Dòng hàng</span>
                  <button
                    type="button"
                    onClick={() => setReviseItems([...reviseItems, { productId: products[0]?.id || '', quantity: 1 }])}
                    className="text-[11px] font-semibold text-sky-700"
                  >
                    Thêm dòng
                  </button>
                </div>
                {reviseItems.map((line, index) => (
                  <div key={index} className="grid grid-cols-[1fr_88px_28px] gap-2">
                    <select
                      value={line.productId}
                      onChange={(e) => setReviseItems(reviseItems.map((item, itemIndex) => itemIndex === index ? { ...item, productId: e.target.value } : item))}
                      className="w-full min-w-0 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.code} · {product.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => setReviseItems(reviseItems.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.max(1, parseInt(e.target.value) || 1) } : item))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 text-right font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setReviseItems(reviseItems.filter((_, itemIndex) => itemIndex !== index))}
                      className="text-slate-400 hover:text-rose-600"
                      title="Xóa dòng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setReviseOrder(null)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg">
                  Lưu nội dung trước khi xuất
                </button>
              </div>
            </form>
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

const ProjectBatchPicker: React.FC<{
  milestones: ProjectMilestone[];
  selectedId: string;
  onSelect: (milestone: ProjectMilestone | null) => void;
}> = ({ milestones, selectedId, onSelect }) => {
  const selected = milestones.find((item) => item.id === selectedId);
  if (milestones.length === 0) {
    return (
      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900">
        Dự án này chưa có đợt bàn giao. Sales, Admin hoặc Giám đốc lập các đợt trong Danh bạ khách hàng, mỗi đợt gồm mặt hàng và số lượng.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="block text-xs font-semibold text-slate-700 mb-1">Đợt bàn giao</span>
        <select
          required
          value={selectedId}
          onChange={(e) => onSelect(milestones.find((item) => item.id === e.target.value) || null)}
          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
        >
          <option value="">-- Chọn đợt đã lập trên hồ sơ dự án --</option>
          {milestones.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.deliveryDate} · {item.itemsSummary}
            </option>
          ))}
        </select>
      </label>
      {selected && (
        <p className="text-[11px] text-purple-700">
          Đã lấy {selected.items?.length || 0} dòng mặt hàng từ đợt này. Số lượng vẫn sửa được trước khi lưu đơn.
        </p>
      )}
    </div>
  );
};
