import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, 
  UserProfile, 
  Location, 
  Product, 
  ProductCategory,
  Customer, 
  CustomerType,
  ProjectMilestone,
  Order, 
  Supplier, 
  StockTransfer, 
  StockTake, 
  PurchaseOrder, 
  PaymentReceipt, 
  ElectronicWarranty, 
  WarrantyTicket, 
  AuditLog,
  TransferStatus,
  OrderStatus
} from '../types/erp';
import { 
  INITIAL_LOCATIONS, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS, 
  INITIAL_TRANSFERS, 
  INITIAL_STOCK_TAKES, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_WARRANTIES, 
  INITIAL_WARRANTY_TICKETS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_USERS,
  INITIAL_SUPPLIERS
} from '../data/initialData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ComboAvailabilityCheck {
  canFulfill: boolean;
  missingItems: {
    productName: string;
    productCode: string;
    requiredQty: number;
    availableQty: number;
    shortage: number;
  }[];
}

interface ErpContextType {
  currentUser: UserProfile;
  users: UserProfile[];
  setCurrentUserRole: (role: Role) => void;
  switchToEmployee: (id: string) => void;
  addEmployee: (data: Omit<UserProfile, 'id' | 'avatar'>) => void;
  updateEmployee: (id: string, data: Omit<UserProfile, 'id' | 'avatar'>) => void;
  selectedLocationId: string; // 'ALL' or specific location ID
  setSelectedLocationId: (id: string) => void;
  locations: Location[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  transfers: StockTransfer[];
  stockTakes: StockTake[];
  purchaseOrders: PurchaseOrder[];
  suppliers: typeof INITIAL_SUPPLIERS;
  warranties: ElectronicWarranty[];
  warrantyTickets: WarrantyTicket[];
  auditLogs: AuditLog[];
  toasts: Toast[];
  dismissToast: (id: string) => void;
  showToast: (type: Toast['type'], title: string, message: string) => void;

  // Inventory actions
  createTransfer: (fromLoc: string, toLoc: string, items: { productId: string; quantity: number }[], notes?: string) => void;
  receiveTransfer: (transferId: string) => void;
  createStockTake: (locationId: string, items: { productId: string; actualQuantity: number; reason?: string }[], notes: string) => void;
  approveStockTake: (stockTakeId: string) => void;
  directStockAdjust: (productId: string, locationId: string, deltaQty: number, reason: string) => void;

  // Procurement actions
  createPO: (poData: Partial<PurchaseOrder>) => void;
  receivePOStock: (poId: string) => void;

  // Sales & Combo actions
  checkComboAvailability: (comboId: string, locationId: string, requestedComboQty: number) => ComboAvailabilityCheck;
  createOrder: (orderData: Partial<Order>) => { success: boolean; requiresApproval?: boolean; reason?: string };
  approveOrder: (orderId: string, approvalReason?: string) => void;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;

  // Debt actions
  recordPayment: (payment: Partial<PaymentReceipt>) => void;
  updateCustomerCredit: (customerId: string, newLimit: number, newTermDays: number) => void;

  // Master data
  addProduct: (data: {
    code: string;
    name: string;
    category: ProductCategory;
    brand: string;
    unit: string;
    baseCost: number;
    retailPrice: number;
    dealerPrice: number;
    projectPrice: number;
    minStockAlert: number;
    weightKg: number;
    origin: string;
    warrantyMonths: number;
    description: string;
  }) => void;
  addCustomer: (data: {
    name: string;
    type: CustomerType;
    phone: string;
    email: string;
    address: string;
    taxCode?: string;
    creditLimit: number;
    paymentTermDays: number;
    discountRate: number;
    projectName?: string;
    contractValue?: number;
    milestones?: ProjectMilestone[];
  }) => void;
  updateProjectMilestones: (customerId: string, milestones: ProjectMilestone[]) => void;
  addSupplier: (data: Omit<Supplier, 'id'>) => void;
  createCombo: (data: {
    code: string;
    name: string;
    brand: string;
    retailPrice: number;
    dealerPrice: number;
    projectPrice: number;
    warrantyMonths: number;
    description: string;
    components: { productId: string; quantity: number }[];
  }) => void;

  // Warranty actions
  activateWarranty: (serial: string, productId: string, orderCode: string, name: string, phone: string, address: string) => void;
  createWarrantyTicket: (serial: string, issue: string, customerName: string, customerPhone: string) => void;
  updateWarrantyTicketStatus: (ticketId: string, status: WarrantyTicket['resolutionStatus'], notes?: string) => void;

  // Helpers
  exportTableToCSV: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const ErpContext = createContext<ErpContextType | null>(null);

const STORAGE_KEY_PREFIX = 'pancras_erp_';

const canPlanProjectMilestones = (role: Role) =>
  role === 'admin' || role === 'director' || role === 'sales';

const withSeedMilestones = (list: Customer[]): Customer[] =>
  list.map((customer) => {
    if (customer.type !== 'project' || (customer.milestones && customer.milestones.length > 0)) {
      return customer;
    }
    const seed = INITIAL_CUSTOMERS.find((item) => item.id === customer.id);
    if (!seed?.milestones?.length) return customer;
    return { ...customer, milestones: seed.milestones };
  });

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
  const [locations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // Core state with local storage hydration
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}customers`);
    return withSeedMilestones(saved ? JSON.parse(saved) : INITIAL_CUSTOMERS);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [transfers, setTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transfers`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [stockTakes, setStockTakes] = useState<StockTake[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stock_takes`);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_TAKES;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}pos`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [warranties, setWarranties] = useState<ElectronicWarranty[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}warranties`);
    return saved ? JSON.parse(saved) : INITIAL_WARRANTIES;
  });

  const [warrantyTickets, setWarrantyTickets] = useState<WarrantyTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tickets`);
    return saved ? JSON.parse(saved) : INITIAL_WARRANTY_TICKETS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audits`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transfers`, JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}purchaseOrders`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}warranties`, JSON.stringify(warranties));
  }, [warranties]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}warrantyTickets`, JSON.stringify(warrantyTickets));
  }, [warrantyTickets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  const showToast = (type: Toast['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAudit = (module: AuditLog['module'], action: AuditLog['action'], details: string) => {
    const locName = selectedLocationId === 'ALL' 
      ? 'Toàn hệ thống' 
      : locations.find((l) => l.id === selectedLocationId)?.name || 'Chi nhánh';

    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: `${currentUser.name} (${currentUser.roleLabel})`,
      role: currentUser.role,
      module,
      action,
      locationName: locName,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const setCurrentUserRole = (role: Role) => {
    const match = users.find((u) => u.role === role) || {
      ...currentUser,
      role,
      roleLabel: role.toUpperCase(),
    };
    setCurrentUser(match);
    showToast('info', 'Chuyển đổi vai trò', `Đang mô phỏng quyền truy cập: ${match.roleLabel}`);
  };

  const switchToEmployee = (id: string) => {
    const match = users.find((u) => u.id === id);
    if (!match) return;
    setCurrentUser(match);
    showToast('info', 'Chuyển đổi vai trò', `Đang mô phỏng quyền truy cập: ${match.roleLabel}`);
  };

  const addEmployee = (data: Omit<UserProfile, 'id' | 'avatar'>) => {
    const employee: UserProfile = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      avatar: '',
      ...data,
    };
    setUsers((prev) => [employee, ...prev]);
    logAudit('hr', 'CREATE_EMPLOYEE', `Thêm nhân viên ${employee.name} — ${employee.roleLabel}`);
    showToast('success', 'Đã thêm nhân viên', `${employee.name} đã có trong danh sách nhân sự.`);
  };

  const updateEmployee = (id: string, data: Omit<UserProfile, 'id' | 'avatar'>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    setCurrentUser((prev) => (prev.id === id ? { ...prev, ...data } : prev));
    logAudit('hr', 'UPDATE_EMPLOYEE', `Cập nhật hồ sơ nhân viên ${data.name} — ${data.roleLabel}`);
    showToast('success', 'Đã cập nhật hồ sơ', `${data.name} đã được lưu.`);
  };

  // Combo Stock Availability Check
  const checkComboAvailability = (comboId: string, locationId: string, requestedComboQty: number): ComboAvailabilityCheck => {
    const combo = products.find((p) => p.id === comboId);
    if (!combo || !combo.isCombo || !combo.comboComponents) {
      return { canFulfill: true, missingItems: [] };
    }

    const missingItems: ComboAvailabilityCheck['missingItems'] = [];

    for (const comp of combo.comboComponents) {
      const child = products.find((p) => p.id === comp.productId);
      if (!child) continue;

      const locStock = child.stockByLocation[locationId] || { onHand: 0, reserved: 0, inTransit: 0 };
      const available = Math.max(0, locStock.onHand - locStock.reserved);
      const needed = comp.quantity * requestedComboQty;

      if (available < needed) {
        missingItems.push({
          productName: child.name,
          productCode: child.code,
          requiredQty: needed,
          availableQty: available,
          shortage: needed - available,
        });
      }
    }

    return {
      canFulfill: missingItems.length === 0,
      missingItems,
    };
  };

  // Stock Transfer Actions
  const createTransfer = (fromLoc: string, toLoc: string, items: { productId: string; quantity: number }[], notes?: string) => {
    const fromLocation = locations.find((l) => l.id === fromLoc);
    const toLocation = locations.find((l) => l.id === toLoc);

    const transferItems = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productCode: prod?.code || '',
        productName: prod?.name || '',
        quantity: it.quantity,
        unit: prod?.unit || 'Cái',
      };
    });

    const newTransfer: StockTransfer = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      code: `CK-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(transfers.length + 1).padStart(2, '0')}`,
      fromLocationId: fromLoc,
      toLocationId: toLoc,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      shippedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: currentUser.name,
      status: 'in_transit',
      notes,
      items: transferItems,
    };

    // Update product stock: subtract onHand from source, add to inTransit of destination
    setProducts((prev) =>
      prev.map((prod) => {
        const item = items.find((i) => i.productId === prod.id);
        if (!item) return prod;

        const updatedStock = { ...prod.stockByLocation };
        const srcStock = updatedStock[fromLoc] || { onHand: 0, reserved: 0, inTransit: 0 };
        const destStock = updatedStock[toLoc] || { onHand: 0, reserved: 0, inTransit: 0 };

        updatedStock[fromLoc] = {
          ...srcStock,
          onHand: Math.max(0, srcStock.onHand - item.quantity),
        };
        updatedStock[toLoc] = {
          ...destStock,
          inTransit: destStock.inTransit + item.quantity,
        };

        return {
          ...prod,
          stockByLocation: updatedStock,
        };
      })
    );

    setTransfers((prev) => [newTransfer, ...prev]);
    logAudit(
      'transfers',
      'STOCK_TRANSFER_SHIP',
      `Tạo phiếu chuyển kho ${newTransfer.code} từ ${fromLocation?.name} đến ${toLocation?.name} (${items.length} mặt hàng)`
    );
    showToast('success', 'Xuất chuyển kho thành công', `Mã phiếu ${newTransfer.code} đã chuyển sang trạng thái Đang vận chuyển`);
  };

  const receiveTransfer = (transferId: string) => {
    const trf = transfers.find((t) => t.id === transferId);
    if (!trf || trf.status !== 'in_transit') return;

    const toLocation = locations.find((l) => l.id === trf.toLocationId);

    // Update products: deduct inTransit, add to onHand at target warehouse
    setProducts((prev) =>
      prev.map((prod) => {
        const item = trf.items.find((i) => i.productId === prod.id);
        if (!item) return prod;

        const updatedStock = { ...prod.stockByLocation };
        const destStock = updatedStock[trf.toLocationId] || { onHand: 0, reserved: 0, inTransit: 0 };

        updatedStock[trf.toLocationId] = {
          ...destStock,
          inTransit: Math.max(0, destStock.inTransit - item.quantity),
          onHand: destStock.onHand + item.quantity,
        };

        return {
          ...prod,
          stockByLocation: updatedStock,
        };
      })
    );

    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'received' as TransferStatus,
              receivedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              receivedBy: currentUser.name,
            }
          : t
      )
    );

    logAudit(
      'transfers',
      'STOCK_TRANSFER_RECEIVE',
      `Xác nhận tiếp nhận và nhập kho hoàn tất phiếu chuyển kho ${trf.code} tại ${toLocation?.name}`
    );
    showToast('success', 'Nhận hàng thành công', `Đã nhập kho ${trf.code} vào ${toLocation?.name}`);
  };

  // Stock Take & Inventory Adjustments
  const createStockTake = (locationId: string, items: { productId: string; actualQuantity: number; reason?: string }[], notes: string) => {
    const loc = locations.find((l) => l.id === locationId);
    const takeItems = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const curOnHand = prod?.stockByLocation[locationId]?.onHand || 0;
      return {
        productId: it.productId,
        productCode: prod?.code || '',
        productName: prod?.name || '',
        unit: prod?.unit || 'Cái',
        bookQuantity: curOnHand,
        actualQuantity: it.actualQuantity,
        difference: it.actualQuantity - curOnHand,
        reason: it.reason || 'Kiểm kê định kỳ',
      };
    });

    const newStockTake: StockTake = {
      id: `ST-${Date.now().toString().slice(-4)}`,
      code: `KK-${new Date().getFullYear()}-M${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(stockTakes.length + 1).padStart(2, '0')}`,
      locationId,
      takeDate: new Date().toISOString().split('T')[0],
      inspectorName: currentUser.name,
      status: 'pending_approval',
      notes,
      items: takeItems,
    };

    setStockTakes((prev) => [newStockTake, ...prev]);
    logAudit('inventory', 'STOCK_TAKE_ADJUST', `Lập biên bản kiểm kê kho ${newStockTake.code} tại ${loc?.name}`);
    showToast('info', 'Biên bản kiểm kê đã tạo', `Chờ Giám đốc hoặc Kế toán duyệt điều chỉnh tồn kho`);
  };

  const approveStockTake = (stockTakeId: string) => {
    const st = stockTakes.find((s) => s.id === stockTakeId);
    if (!st || st.status === 'approved') return;

    // Apply adjustments directly to product onHand
    setProducts((prev) =>
      prev.map((prod) => {
        const item = st.items.find((i) => i.productId === prod.id);
        if (!item) return prod;

        const updatedStock = { ...prod.stockByLocation };
        const curLoc = updatedStock[st.locationId] || { onHand: 0, reserved: 0, inTransit: 0 };

        updatedStock[st.locationId] = {
          ...curLoc,
          onHand: item.actualQuantity,
        };

        return {
          ...prod,
          stockByLocation: updatedStock,
        };
      })
    );

    setStockTakes((prev) =>
      prev.map((s) => (s.id === stockTakeId ? { ...s, status: 'approved' } : s))
    );

    const loc = locations.find((l) => l.id === st.locationId);
    logAudit('inventory', 'STOCK_TAKE_ADJUST', `Phê duyệt điều chỉnh số lượng tồn kho theo biên bản kiểm kê ${st.code} tại ${loc?.name}`);
    showToast('success', 'Đã duyệt kiểm kê', `Tồn kho tại ${loc?.name} đã được cập nhật chuẩn xác theo thực tế.`);
  };

  const directStockAdjust = (productId: string, locationId: string, deltaQty: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    const loc = locations.find((l) => l.id === locationId);

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const curStock = p.stockByLocation[locationId] || { onHand: 0, reserved: 0, inTransit: 0 };
        return {
          ...p,
          stockByLocation: {
            ...p.stockByLocation,
            [locationId]: {
              ...curStock,
              onHand: Math.max(0, curStock.onHand + deltaQty),
            },
          },
        };
      })
    );

    logAudit('inventory', 'STOCK_TAKE_ADJUST', `Điều chỉnh tồn kho ${prod?.name} tại ${loc?.name}: ${deltaQty > 0 ? '+' : ''}${deltaQty} ${prod?.unit}. Lý do: ${reason}`);
    showToast('success', 'Điều chỉnh tồn kho thành công', `${prod?.code} đã được cập nhật.`);
  };

  // Procurement & Landed Cost POs
  const createPO = (poData: Partial<PurchaseOrder>) => {
    const code = `PO-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      code,
      supplierId: poData.supplierId || '',
      supplierName: poData.supplierName || '',
      orderDate: poData.orderDate || new Date().toISOString().split('T')[0],
      expectedArrivalDate: poData.expectedArrivalDate || '',
      targetWarehouseId: poData.targetWarehouseId || 'WH_NORTH',
      containerNo: poData.containerNo,
      billOfLading: poData.billOfLading,
      vesselName: poData.vesselName,
      destinationPort: poData.destinationPort || 'Cảng Cát Lái',
      status: poData.status || 'ordered',
      items: poData.items || [],
      landedCosts: poData.landedCosts || [],
      totalMerchandiseVND: poData.totalMerchandiseVND || 0,
      totalLandedCostVND: poData.totalLandedCostVND || 0,
      grandTotalCostVND: poData.grandTotalCostVND || 0,
      notes: poData.notes,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    logAudit('procurement', 'CREATE_PO', `Tạo đơn mua hàng & container ${newPO.code} từ NCC ${newPO.supplierName}`);
    showToast('success', 'Tạo đơn mua hàng thành công', `Đơn mua ${newPO.code} đã lưu.`);
  };

  const receivePOStock = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'received') return;

    // Update product stock and baseCost with the allocated final landed cost!
    setProducts((prev) =>
      prev.map((prod) => {
        const item = po.items.find((i) => i.productId === prod.id);
        if (!item) return prod;

        const currentStock = prod.stockByLocation[po.targetWarehouseId] || { onHand: 0, reserved: 0, inTransit: 0 };
        const updatedOnHand = currentStock.onHand + item.quantity;

        // Weighted moving average base cost or update to landed cost
        const newBaseCost = Math.round(
          (prod.baseCost * currentStock.onHand + item.finalUnitLandedCost * item.quantity) / (updatedOnHand || 1)
        );

        return {
          ...prod,
          baseCost: newBaseCost > 0 ? newBaseCost : item.finalUnitLandedCost,
          stockByLocation: {
            ...prod.stockByLocation,
            [po.targetWarehouseId]: {
              ...currentStock,
              onHand: updatedOnHand,
            },
          },
        };
      })
    );

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'received' } : p))
    );

    const wh = locations.find((l) => l.id === po.targetWarehouseId);
    logAudit(
      'procurement',
      'STOCK_INBOUND',
      `Nhập kho lô hàng container ${po.code} vào ${wh?.name}, tự động cập nhật giá vốn hàng hóa sau phân bổ chi phí.`
    );
    showToast('success', 'Nhập kho hoàn tất', `Lô hàng ${po.code} đã nhập vào ${wh?.name} và cập nhật giá vốn.`);
  };

  // Sales Orders & Credit Checking
  const createOrder = (orderData: Partial<Order>): { success: boolean; requiresApproval?: boolean; reason?: string } => {
    const customer = customers.find((c) => c.id === orderData.customerId);
    const location = locations.find((l) => l.id === orderData.locationId);
    const targetLocId = orderData.locationId || 'WH_NORTH';

    // 1. Combo component availability verification
    for (const item of orderData.items || []) {
      if (item.isCombo) {
        const check = checkComboAvailability(item.productId, targetLocId, item.quantity);
        if (!check.canFulfill) {
          const detail = check.missingItems.map((m) => `${m.productName} (thiếu ${m.shortage})`).join(', ');
          showToast('error', 'Không đủ tồn kho Combo', `Kho ${location?.name} không đủ thành phần: ${detail}`);
          return {
            success: false,
            reason: `Không đủ tồn linh kiện tạo combo: ${detail}`,
          };
        }
      }
    }

    // 2. Credit limit check for Dealers and Projects
    let requiresCreditApproval = false;
    let creditApprovalReason = '';

    if (customer && customer.type !== 'retail') {
      const grandTotal = orderData.grandTotal || 0;
      const projectedDebt = customer.currentDebt + grandTotal;

      if (customer.creditLimit > 0 && projectedDebt > customer.creditLimit) {
        requiresCreditApproval = true;
        const overAmount = projectedDebt - customer.creditLimit;
        creditApprovalReason = `Vượt hạn mức tín dụng ${overAmount.toLocaleString('vi-VN')} đ (Hạn mức: ${customer.creditLimit.toLocaleString('vi-VN')} đ, Dư nợ sau đơn: ${projectedDebt.toLocaleString('vi-VN')} đ).`;
      }

      if (customer.status === 'blocked_debt') {
        requiresCreditApproval = true;
        creditApprovalReason = `Khách hàng đang trong trạng thái Khóa công nợ do có khoản nợ quá hạn chưa thanh toán.`;
      }
    }

    const orderCode = `DH-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      code: orderCode,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerType: orderData.customerType || customer?.type || 'retail',
      customerId: orderData.customerId || '',
      customerName: customer?.name || orderData.customerName || 'Khách vãng lai',
      customerPhone: customer?.phone || orderData.customerPhone || '',
      locationId: targetLocId,
      salesPersonId: currentUser.id,
      salesPersonName: currentUser.name,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discountTotal: orderData.discountTotal || 0,
      taxAmount: orderData.taxAmount || 0,
      grandTotal: orderData.grandTotal || 0,
      paidAmount: orderData.paidAmount || 0,
      status: requiresCreditApproval ? 'pending_approval' : 'approved',
      requiresCreditApproval,
      creditApprovalReason,
      deliveryAddress: orderData.deliveryAddress || customer?.address || '',
      deliveryDate: orderData.deliveryDate,
      notes: orderData.notes,
      contractCode: orderData.contractCode,
      milestoneId: orderData.milestoneId,
      milestoneName: orderData.milestoneName,
      projectMilestones: orderData.projectMilestones,
    };

    // If approved immediately, reserve stock or record
    setOrders((prev) => [newOrder, ...prev]);

    // Update customer debt if not retail and not fully paid
    if (customer && customer.type !== 'retail') {
      const unpaidPortion = newOrder.grandTotal - newOrder.paidAmount;
      if (unpaidPortion > 0) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id
              ? {
                  ...c,
                  currentDebt: c.currentDebt + unpaidPortion,
                  status: c.currentDebt + unpaidPortion > c.creditLimit ? 'blocked_debt' : c.status,
                }
              : c
          )
        );
      }
    }

    logAudit('orders', 'CREATE_ORDER', `Tạo đơn hàng ${newOrder.code} cho ${newOrder.customerName} giá trị ${newOrder.grandTotal.toLocaleString('vi-VN')} đ`);

    if (requiresCreditApproval) {
      showToast('warning', 'Đơn hàng cần phê duyệt', `Đơn hàng ${newOrder.code} vượt hạn mức công nợ. Chờ Giám đốc/Kế toán phê duyệt.`);
      return { success: true, requiresApproval: true, reason: creditApprovalReason };
    }

    showToast('success', 'Tạo đơn hàng thành công', `Đơn hàng ${newOrder.code} đã được ghi nhận.`);
    return { success: true };
  };

  const approveOrder = (orderId: string, approvalReason?: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'approved',
              approvedBy: `${currentUser.name} (${currentUser.roleLabel})`,
              notes: o.notes ? `${o.notes} | Đã duyệt: ${approvalReason || 'Đồng ý ngoại lệ công nợ'}` : approvalReason,
            }
          : o
      )
    );

    logAudit('orders', 'APPROVE_CREDIT_OVERRIDE', `Phê duyệt ngoại lệ công nợ cho đơn hàng ${ord.code}. Lý do: ${approvalReason || 'Giám đốc/Kế toán chấp thuận'}`);
    showToast('success', 'Đã phê duyệt đơn hàng', `Đơn hàng ${ord.code} đã được cấp phép xuất kho.`);
  };

  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    // If moving to delivering or completed, deduct onHand stock
    if (nextStatus === 'delivering' && ord.status !== 'delivering' && ord.status !== 'completed') {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = ord.items.find((i) => i.productId === prod.id);
          if (!item) return prod;

          const curLocStock = prod.stockByLocation[ord.locationId] || { onHand: 0, reserved: 0, inTransit: 0 };
          return {
            ...prod,
            stockByLocation: {
              ...prod.stockByLocation,
              [ord.locationId]: {
                ...curLocStock,
                onHand: Math.max(0, curLocStock.onHand - item.quantity),
                reserved: Math.max(0, curLocStock.reserved - item.quantity),
              },
            },
          };
        })
      );
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    logAudit('orders', 'EDIT_ORDER', `Cập nhật trạng thái đơn hàng ${ord.code} sang ${nextStatus}`);
    showToast('info', 'Cập nhật đơn hàng', `${ord.code} chuyển sang trạng thái: ${nextStatus}`);
  };

  // Debt & Payment Actions
  const recordPayment = (payment: Partial<PaymentReceipt>) => {
    const customer = customers.find((c) => c.id === payment.customerId);
    const amount = payment.amount || 0;

    if (customer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                currentDebt: Math.max(0, c.currentDebt - amount),
                status: Math.max(0, c.currentDebt - amount) <= c.creditLimit ? 'active' : c.status,
              }
            : c
        )
      );
    }

    // Allocate payment to orders if specified
    if (payment.appliedOrderCodes && payment.appliedOrderCodes.length > 0) {
      let remainingPayment = amount;
      setOrders((prev) =>
        prev.map((o) => {
          if (payment.appliedOrderCodes?.includes(o.code) && remainingPayment > 0) {
            const needPay = o.grandTotal - o.paidAmount;
            const apply = Math.min(needPay, remainingPayment);
            remainingPayment -= apply;
            return {
              ...o,
              paidAmount: o.paidAmount + apply,
            };
          }
          return o;
        })
      );
    }

    logAudit(
      'debt',
      'DEBT_PAYMENT_COLLECT',
      `Thu tiền gạch nợ ${amount.toLocaleString('vi-VN')} đ từ ${customer?.name} (${payment.method === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'})`
    );
    showToast('success', 'Thu tiền & Gạch nợ thành công', `Đã ghi nhận ${amount.toLocaleString('vi-VN')} đ cho ${customer?.name}`);
  };

  const updateCustomerCredit = (customerId: string, newLimit: number, newTermDays: number) => {
    const cust = customers.find((c) => c.id === customerId);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              creditLimit: newLimit,
              paymentTermDays: newTermDays,
              status: c.currentDebt > newLimit ? 'blocked_debt' : 'active',
            }
          : c
      )
    );

    logAudit(
      'debt',
      'APPROVE_CREDIT_OVERRIDE',
      `Điều chỉnh hạn mức công nợ cho ${cust?.name}: ${newLimit.toLocaleString('vi-VN')} đ, thời hạn ${newTermDays} ngày`
    );
    showToast('success', 'Đã cập nhật hạn mức', `${cust?.name} có hạn mức mới: ${newLimit.toLocaleString('vi-VN')} đ`);
  };

  const blankStock = () => {
    const stock: Product['stockByLocation'] = {};
    for (const loc of locations) {
      stock[loc.id] = { onHand: 0, reserved: 0, inTransit: 0 };
    }
    return stock;
  };

  const addProduct = (data: {
    code: string;
    name: string;
    category: ProductCategory;
    brand: string;
    unit: string;
    baseCost: number;
    retailPrice: number;
    dealerPrice: number;
    projectPrice: number;
    minStockAlert: number;
    weightKg: number;
    origin: string;
    warrantyMonths: number;
    description: string;
  }) => {
    const product: Product = {
      id: `P-${Date.now().toString().slice(-6)}`,
      ...data,
      stockByLocation: blankStock(),
    };
    setProducts((prev) => [product, ...prev]);
    logAudit('inventory', 'CREATE_PRODUCT', `Thêm sản phẩm ${product.code} — ${product.name} vào danh mục`);
    showToast('success', 'Đã thêm sản phẩm', `${product.code} đã có trong danh mục hàng hóa.`);
  };

  const addCustomer = (data: {
    name: string;
    type: CustomerType;
    phone: string;
    email: string;
    address: string;
    taxCode?: string;
    creditLimit: number;
    paymentTermDays: number;
    discountRate: number;
    projectName?: string;
    contractValue?: number;
    milestones?: ProjectMilestone[];
  }) => {
    const prefix = data.type === 'dealer' ? 'DL' : data.type === 'project' ? 'DA' : 'KH';
    const customer: Customer = {
      id: `CUST-${Date.now().toString().slice(-6)}`,
      code: `${prefix}-${Date.now().toString().slice(-4)}`,
      name: data.name,
      type: data.type,
      phone: data.phone,
      email: data.email,
      address: data.address,
      taxCode: data.taxCode,
      creditLimit: data.type === 'retail' ? 0 : data.creditLimit,
      paymentTermDays: data.type === 'retail' ? 0 : data.paymentTermDays,
      currentDebt: 0,
      discountRate: data.type === 'retail' ? 0 : data.discountRate,
      assignedSalesId: currentUser.id,
      status: 'active',
      projectName: data.type === 'project' ? data.projectName : undefined,
      contractValue: data.type === 'project' ? data.contractValue : undefined,
      milestones:
        data.type === 'project' && canPlanProjectMilestones(currentUser.role)
          ? data.milestones
          : undefined,
    };
    setCustomers((prev) => [customer, ...prev]);
    logAudit('debt', 'CREATE_CUSTOMER', `Thêm khách hàng ${customer.code} — ${customer.name}`);
    const batchCount = customer.milestones?.length || 0;
    showToast(
      'success',
      'Đã thêm khách hàng',
      batchCount > 0
        ? `${customer.name} đã có trong danh bạ, kèm ${batchCount} đợt bàn giao.`
        : `${customer.name} đã có trong danh bạ.`
    );
  };

  const updateProjectMilestones = (customerId: string, milestones: ProjectMilestone[]) => {
    if (!canPlanProjectMilestones(currentUser.role)) {
      showToast('error', 'Không có quyền', 'Chỉ Sales, Admin và Giám đốc được lập đợt bàn giao.');
      return;
    }
    const customer = customers.find((item) => item.id === customerId);
    if (!customer || customer.type !== 'project') {
      showToast('error', 'Không phải khách dự án', 'Đợt bàn giao chỉ gắn trên hồ sơ dự án.');
      return;
    }
    setCustomers((prev) =>
      prev.map((item) => (item.id === customerId ? { ...item, milestones } : item))
    );
    logAudit(
      'debt',
      'UPDATE_PROJECT_MILESTONES',
      `Cập nhật ${milestones.length} đợt bàn giao cho ${customer.name}`
    );
    showToast('success', 'Đã lưu đợt bàn giao', `${customer.projectName || customer.name} có ${milestones.length} đợt.`);
  };

  const addSupplier = (data: Omit<Supplier, 'id'>) => {
    const supplier: Supplier = {
      id: `SUP-${Date.now().toString().slice(-4)}`,
      ...data,
    };
    setSuppliers((prev) => [supplier, ...prev]);
    logAudit('procurement', 'CREATE_SUPPLIER', `Thêm nhà cung cấp ${supplier.code} — ${supplier.name}`);
    showToast('success', 'Đã thêm nhà cung cấp', `${supplier.name} có thể chọn khi lập đơn mua.`);
  };

  const createCombo = (data: {
    code: string;
    name: string;
    brand: string;
    retailPrice: number;
    dealerPrice: number;
    projectPrice: number;
    warrantyMonths: number;
    description: string;
    components: { productId: string; quantity: number }[];
  }) => {
    const comboComponents = data.components.map((comp) => {
      const child = products.find((p) => p.id === comp.productId);
      return {
        productId: comp.productId,
        productCode: child?.code || '',
        productName: child?.name || '',
        quantity: comp.quantity,
      };
    });
    const baseCost = comboComponents.reduce((sum, comp) => {
      const child = products.find((p) => p.id === comp.productId);
      return sum + (child?.baseCost || 0) * comp.quantity;
    }, 0);

    const combo: Product = {
      id: `COMBO-${Date.now().toString().slice(-4)}`,
      code: data.code,
      name: data.name,
      category: 'combo',
      brand: data.brand,
      unit: 'Bộ Combo',
      baseCost,
      retailPrice: data.retailPrice,
      dealerPrice: data.dealerPrice,
      projectPrice: data.projectPrice,
      minStockAlert: 0,
      weightKg: comboComponents.reduce((sum, comp) => {
        const child = products.find((p) => p.id === comp.productId);
        return sum + (child?.weightKg || 0) * comp.quantity;
      }, 0),
      origin: 'Lắp ráp nội bộ',
      isCombo: true,
      comboComponents,
      stockByLocation: blankStock(),
      warrantyMonths: data.warrantyMonths,
      description: data.description,
    };
    setProducts((prev) => [combo, ...prev]);
    logAudit('inventory', 'CREATE_COMBO', `Tạo combo ${combo.code} gồm ${comboComponents.length} linh kiện`);
    showToast('success', 'Đã tạo combo', `${combo.name} đã có trong danh sách bộ sản phẩm.`);
  };

  // Warranty Actions
  const activateWarranty = (
    serial: string,
    productId: string,
    orderCode: string,
    name: string,
    phone: string,
    address: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (prod?.warrantyMonths || 24));

    const newWarranty: ElectronicWarranty = {
      id: `W-${Date.now().toString().slice(-4)}`,
      serialNumber: serial.toUpperCase().trim(),
      productId,
      productCode: prod?.code || '',
      productName: prod?.name || '',
      orderCode,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      activatedAt: now.toISOString().split('T')[0],
      expiresAt: expiry.toISOString().split('T')[0],
      status: 'active',
      notes: `Bảo hành điện tử ${prod?.warrantyMonths || 24} tháng chính hãng`,
    };

    setWarranties((prev) => [newWarranty, ...prev]);
    logAudit('warranty', 'WARRANTY_ACTIVATE', `Kích hoạt bảo hành điện tử Serial ${newWarranty.serialNumber} cho khách hàng ${name} (${phone})`);
    showToast('success', 'Kích hoạt bảo hành thành công', `Mã Serial ${newWarranty.serialNumber} có hiệu lực đến ${newWarranty.expiresAt}`);
  };

  const createWarrantyTicket = (serial: string, issue: string, customerName: string, customerPhone: string) => {
    const war = warranties.find((w) => w.serialNumber.toLowerCase() === serial.toLowerCase());
    const newTicket: WarrantyTicket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      code: `RMA-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(warrantyTickets.length + 1).padStart(2, '0')}`,
      serialNumber: serial.toUpperCase(),
      warrantyId: war?.id,
      customerName,
      customerPhone,
      productName: war?.productName || 'Thiết bị vệ sinh',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      issueDescription: issue,
      assignedTechnician: 'Đỗ Hữu Thắng (Kỹ thuật Trưởng)',
      resolutionStatus: 'received',
      costVND: 0,
    };

    setWarrantyTickets((prev) => [newTicket, ...prev]);
    logAudit('warranty', 'WARRANTY_TICKET_UPDATE', `Tiếp nhận yêu cầu bảo hành RMA ${newTicket.code} - Serial ${serial}`);
    showToast('info', 'Đã tiếp nhận yêu cầu bảo hành', `Phiếu ${newTicket.code} đã được tạo và chuyển cho phòng kỹ thuật`);
  };

  const updateWarrantyTicketStatus = (
    ticketId: string,
    status: WarrantyTicket['resolutionStatus'],
    notes?: string
  ) => {
    const tkt = warrantyTickets.find((t) => t.id === ticketId);
    setWarrantyTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              resolutionStatus: status,
              repairNotes: notes || t.repairNotes,
              completedAt: status === 'handed_over' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
            }
          : t
      )
    );

    logAudit('warranty', 'WARRANTY_TICKET_UPDATE', `Cập nhật tiến độ phiếu bảo hành ${tkt?.code} sang: ${status}`);
    showToast('success', 'Cập nhật phiếu bảo hành', `${tkt?.code} chuyển sang trạng thái mới`);
  };

  // Export to CSV / Excel helper with UTF-8 BOM
  const exportTableToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent =
      '\uFEFF' + // UTF-8 Byte Order Mark for Excel support
      [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Xuất file thành công', `Đã xuất ${filename}.csv tương thích Microsoft Excel.`);
  };

  return (
    <ErpContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUserRole,
        switchToEmployee,
        addEmployee,
        updateEmployee,
        selectedLocationId,
        setSelectedLocationId,
        locations,
        products,
        customers,
        orders,
        transfers,
        stockTakes,
        purchaseOrders,
        suppliers,
        warranties,
        warrantyTickets,
        auditLogs,
        toasts,
        dismissToast,
        showToast,
        createTransfer,
        receiveTransfer,
        createStockTake,
        approveStockTake,
        directStockAdjust,
        createPO,
        receivePOStock,
        checkComboAvailability,
        createOrder,
        approveOrder,
        updateOrderStatus,
        recordPayment,
        updateCustomerCredit,
        addProduct,
        addCustomer,
        updateProjectMilestones,
        addSupplier,
        createCombo,
        activateWarranty,
        createWarrantyTicket,
        updateWarrantyTicketStatus,
        exportTableToCSV,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error('useErp must be used within an ErpProvider');
  return ctx;
};
