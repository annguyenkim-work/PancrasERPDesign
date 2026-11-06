export type Role = 
  | 'admin'
  | 'director'
  | 'accountant'
  | 'sales'
  | 'warehouse_keeper'
  | 'showroom_manager'
  | 'support';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  department: string;
  branchId: string;
  avatar: string;
  phone: string;
}

export type LocationType = 'warehouse' | 'showroom';

export interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  address: string;
  managerName: string;
  phone: string;
  capacityM2: number;
}

export type ProductCategory = 
  | 'thiet_bi_ve_sinh'      // Bồn cầu, sen tắm, vòi chậu, bồn tiểu
  | 'noi_that_phong_tam'   // Tủ chậu cabinet, gương LED, kệ lavabo
  | 'vat_tu_xay_dung'      // Gạch ốp lát, keo dán gạch, phụ kiện cấp thoát nước
  | 'combo';               // Combo phòng tắm hoàn thiện

export interface ProductStockInfo {
  onHand: number;      // Tồn kho thực tế
  reserved: number;    // Đang giữ chỗ cho đơn hàng
  inTransit: number;   // Đang điều chuyển tới kho này
}

export interface ComboItemComponent {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
}

export interface Product {
  id: string;
  code: string; // SKU
  name: string;
  category: ProductCategory;
  brand: string;
  unit: string;
  baseCost: number;       // Giá vốn nhập kho (VNĐ)
  retailPrice: number;    // Giá bán lẻ niêm yết
  dealerPrice: number;    // Giá bán đại lý
  projectPrice: number;   // Giá chào thầu dự án
  minStockAlert: number;  // Định mức tồn tối thiểu
  weightKg: number;
  origin: string;
  isCombo?: boolean;
  comboComponents?: ComboItemComponent[];
  stockByLocation: Record<string, ProductStockInfo>;
  warrantyMonths: number;
  description: string;
}

export type CustomerType = 'retail' | 'dealer' | 'distributor' | 'project';

export interface Customer {
  id: string;
  code: string;
  name: string;
  type: CustomerType;
  phone: string;
  email: string;
  address: string;
  taxCode?: string;
  creditLimit: number;      // Hạn mức công nợ (VNĐ)
  paymentTermDays: number;  // Thời hạn nợ (15, 30, 45 ngày)
  currentDebt: number;      // Dư nợ hiện tại
  discountRate: number;     // Chiết khấu mặc định (%)
  assignedSalesId: string;  // Nhân viên phụ trách
  status: 'active' | 'blocked_debt' | 'warning_debt';
  // Cho khách hàng dự án
  projectName?: string;
  contractValue?: number;
  milestones?: ProjectMilestone[];
}

export type OrderStatus = 
  | 'draft'               // Nháp / Báo giá
  | 'pending_approval'   // Chờ duyệt (vượt nợ hoặc chiết khấu cao)
  | 'approved'           // Đã duyệt
  | 'exporting'          // Đang soạn & xuất kho
  | 'delivering'         // Đang giao hàng
  | 'completed'          // Hoàn tất
  | 'cancelled';         // Đã hủy

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
  isCombo?: boolean;
}

export interface MilestoneLine {
  productId: string;
  quantity: number;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  deliveryDate: string;
  itemsSummary: string;
  items?: MilestoneLine[];
  percentage: number;
  paymentAmount: number;
  deliveryStatus: 'pending' | 'shipping' | 'delivered';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
}

export interface Order {
  id: string;
  code: string;
  createdAt: string;
  customerType: CustomerType;
  customerId: string;
  customerName: string;
  customerPhone: string;
  locationId: string; // Kho hoặc Showroom xử lý
  salesPersonId: string;
  salesPersonName: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  status: OrderStatus;
  requiresCreditApproval?: boolean;
  creditApprovalReason?: string;
  approvedBy?: string;
  notes?: string;
  deliveryAddress: string;
  deliveryDate?: string;
  // Dành riêng cho dự án
  contractCode?: string;
  milestoneId?: string;
  milestoneName?: string;
  projectMilestones?: ProjectMilestone[];
  billingDocuments?: BillingDocument[];
}

export interface BillingDocument {
  id: string;
  code: string;
  side: 'dealer' | 'walk_in';
  customerId: string;
  customerCode: string;
  customerName: string;
  lines: OrderItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  grandTotal: number;
}

export type TransferStatus = 'draft' | 'in_transit' | 'received' | 'cancelled';

export interface TransferItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
}

export interface StockTransfer {
  id: string;
  code: string;
  fromLocationId: string;
  toLocationId: string;
  createdAt: string;
  shippedAt?: string;
  receivedAt?: string;
  createdBy: string;
  receivedBy?: string;
  status: TransferStatus;
  notes?: string;
  items: TransferItem[];
}

export interface StockTakeItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  bookQuantity: number;      // Tồn theo sổ sách
  actualQuantity: number;    // Tồn thực tế kiểm đếm
  difference: number;        // Chênh lệch (+/-)
  reason?: string;
}

export interface StockTake {
  id: string;
  code: string;
  locationId: string;
  takeDate: string;
  inspectorName: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  notes: string;
  items: StockTakeItem[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  bankAccount: string;
}

export interface POLandedCostItem {
  type: 'import_tax' | 'vat' | 'ocean_freight' | 'port_handling' | 'inspection' | 'domestic_transport';
  name: string;
  amount: number;
  allocationMethod: 'by_value' | 'by_weight'; // Phân bổ theo trị giá hay khối lượng
}

export interface PurchaseOrderItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPriceUSD: number;
  exchangeRate: number; // Tỷ giá USD -> VND
  fobAmountVND: number;
  weightKg: number;
  importDutyPercent?: number;
  allocatedCostVND: number; // Chi phí nhập khẩu phân bổ
  finalUnitLandedCost: number; // Giá vốn nhập kho hoàn chỉnh sau phân bổ
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedArrivalDate: string;
  targetWarehouseId: string;
  containerNo?: string;
  billOfLading?: string;
  vesselName?: string;
  destinationPort: string;
  status: 'draft' | 'ordered' | 'shipping' | 'customs_cleared' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  vatRate?: number;
  landedCosts: POLandedCostItem[];
  totalMerchandiseVND: number;
  totalLandedCostVND: number;
  grandTotalCostVND: number;
  notes?: string;
}

export interface PaymentReceipt {
  id: string;
  code: string;
  date: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'bank_transfer' | 'cash' | 'credit_card';
  appliedOrderCodes: string[];
  notes?: string;
  collectedBy: string;
}

export interface ElectronicWarranty {
  id: string;
  serialNumber: string;
  productId: string;
  productCode: string;
  productName: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  activatedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'voided';
  notes?: string;
}

export interface WarrantyTicket {
  id: string;
  code: string;
  warrantyId?: string;
  serialNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  createdAt: string;
  issueDescription: string;
  assignedTechnician: string;
  resolutionStatus: 'received' | 'inspecting' | 'replacing_parts' | 'resolved' | 'handed_over';
  repairNotes?: string;
  costVND: number;
  completedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  module: 'orders' | 'inventory' | 'transfers' | 'procurement' | 'debt' | 'warranty' | 'hr';
  action: 
    | 'CREATE_ORDER' 
    | 'EDIT_ORDER' 
    | 'CANCEL_ORDER' 
    | 'APPROVE_CREDIT_OVERRIDE'
    | 'APPROVE_DISCOUNT'
    | 'STOCK_INBOUND' 
    | 'STOCK_OUTBOUND' 
    | 'STOCK_TRANSFER_SHIP' 
    | 'STOCK_TRANSFER_RECEIVE' 
    | 'STOCK_TAKE_ADJUST' 
    | 'CREATE_PO' 
    | 'ALLOCATE_LANDED_COST' 
    | 'DEBT_PAYMENT_COLLECT' 
    | 'WARRANTY_ACTIVATE' 
    | 'WARRANTY_TICKET_UPDATE'
    | 'CREATE_PRODUCT'
    | 'CREATE_CUSTOMER'
    | 'UPDATE_PROJECT_MILESTONES'
    | 'CREATE_SUPPLIER'
    | 'CREATE_COMBO'
    | 'CREATE_EMPLOYEE'
    | 'UPDATE_EMPLOYEE'
    | 'CREATE_LOCATION'
    | 'UPDATE_LOCATION'
    | 'DELETE_LOCATION';
  locationName: string;
  details: string;
}
