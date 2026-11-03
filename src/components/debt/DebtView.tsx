import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Customer } from '../../types/erp';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  DollarSign, 
  Clock, 
  Sliders, 
  ShieldAlert, 
  FileText, 
  X,
  Lock,
  Unlock,
  Check
} from 'lucide-react';

export const DebtView: React.FC = () => {
  const { 
    customers, 
    orders, 
    recordPayment, 
    updateCustomerCredit, 
    currentUser, 
    exportTableToCSV 
  } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'dealer' | 'project'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'blocked' | 'warning'>('all');

  // Modals state
  const [selectedCustForPayment, setSelectedCustForPayment] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(100000000);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer');
  const [paymentNotes, setPaymentNotes] = useState('Chuyển khoản thanh toán theo ủy nhiệm chi');

  const [selectedCustForLimit, setSelectedCustForLimit] = useState<Customer | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState(600000000);
  const [newTermDays, setNewTermDays] = useState(30);

  // Financial aggregates
  const b2bCustomers = customers.filter((c) => c.type !== 'retail');
  const totalDebt = b2bCustomers.reduce((acc, c) => acc + c.currentDebt, 0);
  const totalCreditLimit = b2bCustomers.reduce((acc, c) => acc + c.creditLimit, 0);
  const blockedCount = b2bCustomers.filter((c) => c.status === 'blocked_debt').length;

  const filteredCustomers = b2bCustomers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'blocked' && c.status === 'blocked_debt') ||
      (statusFilter === 'warning' && c.status === 'warning_debt');
    return matchesSearch && matchesType && matchesStatus;
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForPayment) return;

    recordPayment({
      customerId: selectedCustForPayment.id,
      customerName: selectedCustForPayment.name,
      amount: paymentAmount,
      method: paymentMethod,
      date: new Date().toISOString().split('T')[0],
      notes: paymentNotes,
    });

    setSelectedCustForPayment(null);
  };

  const handleUpdateLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForLimit) return;

    updateCustomerCredit(selectedCustForLimit.id, newCreditLimit, newTermDays);
    setSelectedCustForLimit(null);
  };

  const handleExportDebt = () => {
    const headers = ['Mã KH', 'Tên khách hàng / Đại lý', 'Loại hình', 'Hạn mức (đ)', 'Dư nợ hiện tại (đ)', 'Còn lại (đ)', 'Hạn nợ (Ngày)', 'Trạng thái'];
    const rows = filteredCustomers.map((c) => [
      c.code,
      c.name,
      c.type === 'dealer' ? 'Đại lý' : 'Dự án',
      c.creditLimit,
      c.currentDebt,
      Math.max(0, c.creditLimit - c.currentDebt),
      c.paymentTermDays,
      c.status === 'blocked_debt' ? 'Khóa đơn (Vượt nợ)' : c.status === 'warning_debt' ? 'Cảnh báo nợ' : 'Bình thường',
    ]);
    exportTableToCSV('Cong_No_Khach_Hang', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Công Nợ Đại Lý &amp; Khách Hàng Dự Án
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập hạn mức tín dụng (Credit Limit), thời hạn thanh toán (Payment Terms), tự động chặn đơn và thu tiền gạch nợ.
          </p>
        </div>

        <button
          onClick={handleExportDebt}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
        >
          <span>Xuất Báo Cáo Công Nợ Excel</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Dư Nợ Toàn Hệ Thống</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1.5">
            {totalDebt.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">VNĐ</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Phải thu từ {b2bCustomers.length} đại lý và nhà thầu dự án
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Hạn Mức Tín Dụng Cấp</span>
          <div className="text-2xl font-bold text-sky-700 tabular-nums mt-1.5">
            {totalCreditLimit.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">VNĐ</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tỷ lệ sử dụng hạn mức: <strong className="text-slate-900">{((totalDebt / totalCreditLimit) * 100).toFixed(1)}%</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách Hàng Vượt Hạn Mức</span>
          <div className="text-2xl font-bold text-rose-600 tabular-nums mt-1.5">
            {blockedCount} <span className="text-xs font-normal text-slate-500">tài khoản bị khóa đơn</span>
          </div>
          <div className="text-xs text-rose-700 mt-1 font-medium">
            Tự động ngăn chặn tạo đơn bán hàng chờ phê duyệt
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên đại lý, mã khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">Tất cả phân loại</option>
            <option value="dealer">Chỉ Đại lý B2B</option>
            <option value="project">Chỉ Khách hàng Dự án</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">Tất cả trạng thái nợ</option>
            <option value="blocked">Đã bị khóa (Vượt hạn mức)</option>
            <option value="warning">Cảnh báo chạm ngưỡng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Mã KH</th>
                <th className="py-3 px-4">Đại lý / Chủ đầu tư dự án</th>
                <th className="py-3 px-3 text-center">Phân loại</th>
                <th className="py-3 px-3 text-right">Hạn mức tín dụng</th>
                <th className="py-3 px-3 text-right">Dư nợ hiện tại</th>
                <th className="py-3 px-3 text-right">Hạn mức khả dụng</th>
                <th className="py-3 px-3 text-center">Thời hạn nợ</th>
                <th className="py-3 px-3 text-center">Trạng thái hệ thống</th>
                <th className="py-3 px-4 text-center">Thao tác kế toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => {
                const isBlocked = cust.status === 'blocked_debt';
                const isWarning = cust.status === 'warning_debt';
                const remainingCredit = Math.max(0, cust.creditLimit - cust.currentDebt);
                const overDebt = cust.currentDebt > cust.creditLimit ? cust.currentDebt - cust.creditLimit : 0;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{cust.code}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {cust.phone} · {cust.address.split(',')[0]}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          cust.type === 'project' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {cust.type === 'project' ? 'DỰ ÁN' : 'ĐẠI LÝ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 font-medium">
                      {cust.creditLimit.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums">
                      <span className={isBlocked ? 'text-rose-600' : 'text-slate-900'}>
                        {cust.currentDebt.toLocaleString('vi-VN')} đ
                      </span>
                      {overDebt > 0 && (
                        <div className="text-[10px] text-rose-600 font-normal">
                          (Vượt {overDebt.toLocaleString('vi-VN')} đ)
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold tabular-nums text-emerald-700">
                      {remainingCredit.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                      {cust.paymentTermDays} ngày
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isBlocked ? (
                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded">
                          <Lock className="w-3 h-3" />
                          <span>KHÓA ĐƠN</span>
                        </div>
                      ) : isWarning ? (
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Sắp chạm trần</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>An toàn</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCustForPayment(cust);
                            setPaymentAmount(Math.min(cust.currentDebt, 100000000));
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                        >
                          Thu tiền &amp; Gạch nợ
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustForLimit(cust);
                            setNewCreditLimit(cust.creditLimit);
                            setNewTermDays(cust.paymentTermDays);
                          }}
                          className="p-1 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Điều chỉnh hạn mức & thời hạn nợ"
                        >
                          <Sliders className="w-3.5 h-3.5" />
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

      {/* MODAL 1: THU TIỀN & GẠCH NỢ */}
      {selectedCustForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Lập Phiếu Thu Tiền &amp; Gạch Nợ</h3>
              </div>
              <button onClick={() => setSelectedCustForPayment(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">{selectedCustForPayment.name}</div>
                <div className="text-slate-500 mt-0.5">
                  Dư nợ hiện tại: <strong className="text-rose-600 font-mono">{selectedCustForPayment.currentDebt.toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số tiền thanh toán (VNĐ)</label>
                <input
                  type="number"
                  min="1000"
                  max={selectedCustForPayment.currentDebt}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hình thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="bank_transfer">Chuyển khoản Ngân hàng (Ủy nhiệm chi / Vietcombank)</option>
                  <option value="cash">Tiền mặt tại Quầy Showroom</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú &amp; Chứng từ kèm theo</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCustForPayment(null)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Xác Nhận Thu Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ĐIỀU CHỈNH HẠN MỨC & THỜI HẠN NỢ */}
      {selectedCustForLimit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Điều Chỉnh Hạn Mức Tín Dụng</h3>
              <button onClick={() => setSelectedCustForLimit(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLimitSubmit} className="space-y-3 text-xs">
              <div className="font-bold text-slate-900">{selectedCustForLimit.name}</div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hạn mức công nợ tối đa (VNĐ)</label>
                <input
                  type="number"
                  step="10000000"
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời hạn cho nợ (Số ngày)</label>
                <select
                  value={newTermDays}
                  onChange={(e) => setNewTermDays(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value={15}>15 Ngày</option>
                  <option value={30}>30 Ngày (Tiêu chuẩn đại lý)</option>
                  <option value={45}>45 Ngày (Dự án xây dựng)</option>
                  <option value={60}>60 Ngày (Chủ đầu tư chiến lược)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCustForLimit(null)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Lưu Thiết Lập Hạn Mức
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
