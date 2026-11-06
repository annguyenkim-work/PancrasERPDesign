import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Warehouse, 
  AlertTriangle, 
  Download, 
  Printer, 
  Calendar,
  Layers
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    orders, 
    products, 
    customers, 
    locations, 
    transfers, 
    exportTableToCSV 
  } = useErp();

  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'month' | 'year'>('month');
  const warehouseCount = locations.filter((item) => item.type === 'warehouse').length;
  const showroomCount = locations.filter((item) => item.type === 'showroom').length;

  // Revenue metrics
  const totalCompletedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'delivering' || o.status === 'exporting');
  
  // Simulated revenue breakdown
  const revenueDay = 126920000; // 126.9 triệu VNĐ hôm nay
  const revenueMonth = 3120650000; // 3.12 tỷ VNĐ tháng này
  const revenueYear = 28450000000; // 28.45 tỷ VNĐ năm nay

  const currentDisplayRevenue = revenuePeriod === 'day' 
    ? revenueDay 
    : revenuePeriod === 'month' 
      ? revenueMonth 
      : revenueYear;

  const currentRevenueLabel = revenuePeriod === 'day' 
    ? 'Hôm nay (03/11/2026)' 
    : revenuePeriod === 'month' 
      ? 'Tháng 11/2026' 
      : 'Cả năm 2026';

  // Orders metrics
  const totalOrdersCount = orders.length;
  const processingOrdersCount = orders.filter((o) => o.status === 'exporting' || o.status === 'delivering' || o.status === 'pending_approval').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;

  // Debt metrics
  const dealerCustomers = customers.filter((c) => c.type === 'dealer');
  const projectCustomers = customers.filter((c) => c.type === 'project');
  const totalDealerDebt = dealerCustomers.reduce((acc, c) => acc + c.currentDebt, 0);
  const totalProjectDebt = projectCustomers.reduce((acc, c) => acc + c.currentDebt, 0);
  const totalOverdueDebt = customers.filter((c) => c.status === 'blocked_debt').reduce((acc, c) => acc + c.currentDebt, 0);

  // Low stock products alert
  const lowStockProducts = products.map((prod) => {
    const totalOnHand = Object.values(prod.stockByLocation).reduce((sum, s) => sum + s.onHand, 0);
    const totalAvailable = Object.values(prod.stockByLocation).reduce((sum, s) => sum + Math.max(0, s.onHand - s.reserved), 0);
    return {
      product: prod,
      totalOnHand,
      totalAvailable,
      isLow: totalOnHand <= prod.minStockAlert,
    };
  }).filter((item) => item.isLow || item.totalOnHand < 30);

  // Top selling products (calculated from orders items)
  const productSalesMap: Record<string, { code: string; name: string; quantity: number; revenue: number; unit: string }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      if (!productSalesMap[it.productId]) {
        productSalesMap[it.productId] = {
          code: it.productCode,
          name: it.productName,
          quantity: 0,
          revenue: 0,
          unit: it.unit,
        };
      }
      productSalesMap[it.productId].quantity += it.quantity;
      productSalesMap[it.productId].revenue += it.totalPrice;
    });
  });
  const topSellingList = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Performance by Showroom
  const showroomHanoiRevenue = orders.filter((o) => o.locationId === 'SR_HANOI').reduce((acc, o) => acc + o.grandTotal, 0) || 185000000;
  const showroomHcmRevenue = orders.filter((o) => o.locationId === 'SR_HCM').reduce((acc, o) => acc + o.grandTotal, 0) || 240000000;

  // Performance by Sales Staff
  const salesStaffPerformance = [
    { name: 'Lê Thanh Thảo', role: 'Sales Dự án Miền Nam', revenue: 2641169300, orders: 2, target: 3000000000, rate: 88 },
    { name: 'Nguyễn Tiến Dũng', role: 'Sales B2B Miền Bắc', revenue: 340120000, orders: 2, target: 500000000, rate: 68 },
    { name: 'Phạm Thu Thảo', role: 'Showroom Cầu Giấy', revenue: 185000000, orders: 4, target: 200000000, rate: 92 },
    { name: 'Vũ Minh Tuấn', role: 'Showroom Quận 7', revenue: 240000000, orders: 5, target: 250000000, rate: 96 },
  ];

  // Stock overview across 5 locations
  const locationStockStats = locations.map((loc) => {
    let totalItems = 0;
    let totalStockValue = 0;
    let totalReserved = 0;

    products.forEach((prod) => {
      const stock = prod.stockByLocation[loc.id] || { onHand: 0, reserved: 0, inTransit: 0 };
      totalItems += stock.onHand;
      totalStockValue += stock.onHand * prod.baseCost;
      totalReserved += stock.reserved;
    });

    return {
      location: loc,
      totalItems,
      totalStockValue,
      totalReserved,
    };
  });

  const handleExportDashboard = () => {
    const headers = ['Kho / Showroom', 'Loại hình', 'Địa chỉ', 'Tổng SL Tồn', 'Tồn Giữ Chỗ (Đơn hàng)', 'Giá trị Tồn theo Giá Vốn (đ)'];
    const rows = locationStockStats.map((st) => [
      st.location.name,
      st.location.type === 'warehouse' ? 'Kho Tổng' : 'Showroom',
      st.location.address,
      st.totalItems,
      st.totalReserved,
      st.totalStockValue,
    ]);
    exportTableToCSV('Bao_Cao_Ton_Kho_Realtime', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Bảng Điều Hành Trung Tâm Doanh Nghiệp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đồng bộ dữ liệu thời gian thực giữa 3 kho tổng (Bắc - Trung - Nam), 2 Showroom và các chi nhánh kinh doanh.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Revenue Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setRevenuePeriod('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                revenuePeriod === 'day' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setRevenuePeriod('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                revenuePeriod === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setRevenuePeriod('year')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                revenuePeriod === 'year' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Năm 2026
            </button>
          </div>

          <button
            onClick={handleExportDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            title="Xuất bảng Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* KPI 4-Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Doanh thu ({revenuePeriod.toUpperCase()})</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {currentDisplayRevenue.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-semibold text-slate-500">VNĐ</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
            <span className="font-semibold">+18.4%</span>
            <span className="text-slate-400">so với cùng kỳ kỳ trước</span>
          </div>
        </div>

        {/* Card 2: Orders Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalOrdersCount}</span>
            <span className="text-xs text-slate-400">đơn phát sinh</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <span className="text-amber-600 font-medium">{processingOrdersCount} đang xử lý</span>
            <span>·</span>
            <span className="text-emerald-600 font-medium">{completedOrdersCount} hoàn tất</span>
          </div>
        </div>

        {/* Card 3: Debt Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Công Nợ Phải Thu</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {(totalDealerDebt + totalProjectDebt).toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-semibold text-slate-500">VNĐ</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Đại lý: {totalDealerDebt.toLocaleString('vi-VN')} đ</span>
            {totalOverdueDebt > 0 && (
              <span className="text-rose-600 font-semibold">Quá hạn: {totalOverdueDebt.toLocaleString('vi-VN')} đ</span>
            )}
          </div>
        </div>

        {/* Card 4: Inventory Total Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Giá Trị Tồn Kho</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {locationStockStats.reduce((sum, s) => sum + s.totalStockValue, 0).toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-semibold text-slate-500">VNĐ</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>{warehouseCount} Kho Tổng &amp; {showroomCount} Showroom</span>
            <span>·</span>
            <span className="text-amber-600 font-medium">{lowStockProducts.length} mặt hàng chạm min</span>
          </div>
        </div>
      </div>

      {/* Row 2: Multi-Warehouse Inventory Status (3 Kho Tổng + 2 Showroom) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Tình Trạng Tồn Kho Tại Từng Điểm ({warehouseCount} Kho Tổng &amp; {showroomCount} Showroom)
            </h2>
            <p className="text-xs text-slate-500">
              Cập nhật đồng bộ theo thời gian thực - Số lượng tồn thực tế và giá trị hàng hóa theo giá vốn.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {transfers.filter((t) => t.status === 'in_transit').length} phiếu điều chuyển đang trên đường
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {locationStockStats.map((stat) => {
            const isWarehouse = stat.location.type === 'warehouse';
            return (
              <div
                key={stat.location.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isWarehouse ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isWarehouse ? 'KHO TỔNG' : 'SHOWROOM'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{stat.location.code}</span>
                </div>

                <div className="text-xs font-bold text-slate-900 line-clamp-1 mb-1" title={stat.location.name}>
                  {stat.location.name.replace(/Kho Tổng |Showroom /g, '')}
                </div>

                <div className="space-y-1.5 text-xs mt-3 pt-3 border-t border-slate-200/70">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tồn thực tế:</span>
                    <span className="font-bold text-slate-900 tabular-nums">{stat.totalItems.toLocaleString()} đv</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Đang giữ chỗ:</span>
                    <span className="font-medium text-amber-700 tabular-nums">{stat.totalReserved.toLocaleString()} đv</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Giá trị tồn:</span>
                    <span className="font-semibold text-slate-900 tabular-nums text-[11px]">
                      {(stat.totalStockValue / 1000000).toFixed(1)} tr đ
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Two-Column Data Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Top Selling & Low Stock Alerts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Sản Phẩm Bán Chạy Nhất</h3>
                <p className="text-xs text-slate-500">Xếp hạng theo tổng doanh số lũy kế</p>
              </div>
              <span className="text-xs text-sky-600 font-medium">Báo cáo chuẩn</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Mã SKU</th>
                    <th className="py-2.5 px-3 font-semibold">Tên sản phẩm</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Số lượng</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topSellingList.map((item, idx) => (
                    <tr key={item.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{item.code}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">{item.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                        {item.revenue.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Warning Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Cảnh Báo Hàng Sắp Hết Tồn Kho</h3>
                  <p className="text-xs text-slate-500">Các mặt hàng cần lập đơn mua hàng (PO) container bổ sung</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Mã</th>
                    <th className="py-2.5 px-3 font-semibold">Sản phẩm</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Định mức Min</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Tổng tồn</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Khả dụng</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockProducts.map((p) => (
                    <tr key={p.product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{p.product.code}</td>
                      <td className="py-2.5 px-3 text-slate-900 max-w-xs truncate font-medium">{p.product.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">{p.product.minStockAlert}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-amber-700">{p.totalOnHand}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">{p.totalAvailable}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          Cần nhập thêm
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Sales Staff & Showroom Performance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Showroom Performance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Hiệu Suất Bán Hàng Theo Showroom
            </h3>
            
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">Showroom 1 - Cầu Giấy (Hà Nội)</span>
                  <span className="font-mono font-bold text-sky-700">{showroomHanoiRevenue.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>Mục tiêu tháng: 250,000,000 đ</span>
                  <span>Đạt 75%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">Showroom 2 - Quận 7 (TP.HCM)</span>
                  <span className="font-mono font-bold text-emerald-700">{showroomHcmRevenue.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>Mục tiêu tháng: 300,000,000 đ</span>
                  <span>Đạt 85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Staff Performance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Hiệu Suất Bán Hàng Theo Nhân Viên
            </h3>

            <div className="space-y-3">
              {salesStaffPerformance.map((staff) => (
                <div key={staff.name} className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{staff.name}</div>
                      <div className="text-[11px] text-slate-500">{staff.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {(staff.revenue / 1000000).toFixed(1)} tr đ
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700">Đạt {staff.rate}% KPI</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full ${staff.rate >= 90 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      style={{ width: `${Math.min(100, staff.rate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
