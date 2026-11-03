import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { WarrantyTicket } from '../../types/erp';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Phone, 
  QrCode, 
  History, 
  User, 
  Calendar,
  X,
  FileCheck
} from 'lucide-react';

export const WarrantyView: React.FC = () => {
  const { 
    warranties, 
    warrantyTickets, 
    products, 
    orders, 
    activateWarranty, 
    createWarrantyTicket, 
    updateWarrantyTicketStatus,
    exportTableToCSV 
  } = useErp();

  const [activeTab, setActiveTab] = useState<'lookup' | 'cards' | 'tickets'>('lookup');
  const [lookupQuery, setLookupQuery] = useState('0988 555 123');
  const [lookupResult, setLookupResult] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Modals state
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Activation form state
  const [actSerial, setActSerial] = useState('BRA-F98-2026-9905');
  const [actProductId, setActProductId] = useState(products[0]?.id || 'P001');
  const [actOrderCode, setActOrderCode] = useState(orders[0]?.code || 'DH-260301-001');
  const [actCustName, setActCustName] = useState('Trần Quốc Bảo');
  const [actCustPhone, setActCustPhone] = useState('0988 555 123');
  const [actCustAddress, setActCustAddress] = useState('Biệt thự H10, KĐT Starlake Tây Hồ Tây');

  // Ticket form state
  const [ticketSerial, setTicketSerial] = useState('BRA-F98-2026-9901');
  const [ticketIssue, setTicketIssue] = useState('Áp lực nước vòi rửa hơi yếu, cần bảo dưỡng vệ sinh màng lọc.');
  const [ticketName, setTicketName] = useState('Trần Quốc Bảo');
  const [ticketPhone, setTicketPhone] = useState('0988 555 123');

  const handleSearchLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const q = lookupQuery.trim().toLowerCase().replace(/\s+/g, '');
    if (!q) return;

    const matchedWarranties = warranties.filter((w) => {
      const matchPhone = w.customerPhone.replace(/\s+/g, '').includes(q);
      const matchSerial = w.serialNumber.toLowerCase().includes(q);
      return matchPhone || matchSerial;
    });

    setLookupResult(matchedWarranties);
    setHasSearched(true);
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    activateWarranty(actSerial, actProductId, actOrderCode, actCustName, actCustPhone, actCustAddress);
    setShowActivateModal(false);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWarrantyTicket(ticketSerial, ticketIssue, ticketName, ticketPhone);
    setShowTicketModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hệ Thống Quản Lý Bảo Hành Điện Tử (e-Warranty)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu nhanh thời hạn bảo hành qua SĐT / Serial, kích hoạt bảo hành điện tử và xử lý yêu cầu sửa chữa RMA.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Tab Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('lookup')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'lookup' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tra Cứu Nhanh
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'cards' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thẻ Bảo Hành ({warranties.length})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'tickets' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phiếu Tiếp Nhận RMA ({warrantyTickets.length})
            </button>
          </div>

          <button
            onClick={() => setShowActivateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kích Hoạt Bảo Hành Mới</span>
          </button>
        </div>
      </div>

      {/* TAB 1: QUICK LOOKUP PORTAL */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cổng Tra Cứu Bảo Hành Điện Tử Chính Hãng
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Nhập số điện thoại người mua hoặc mã Serial in trên tem sản phẩm (VD: BRA-F98-2026-9901 hoặc 0988 555 123)
              </p>
            </div>

            <form onSubmit={handleSearchLookup} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Nhập SĐT hoặc Mã Serial..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
              >
                Tra Cứu
              </button>
            </form>
          </div>

          {/* Search Result */}
          {hasSearched && (
            <div className="space-y-3 max-w-3xl mx-auto">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kết Quả Tìm Kiếm ({lookupResult.length} sản phẩm)
                </span>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Tiếp nhận sửa chữa cho thiết bị này</span>
                </button>
              </div>

              {lookupResult.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                  Không tìm thấy thông tin bảo hành khớp với từ khóa "{lookupQuery}".
                </div>
              ) : (
                lookupResult.map((w) => {
                  const now = new Date();
                  const expire = new Date(w.expiresAt);
                  const isStillValid = expire >= now;

                  return (
                    <div key={w.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900">{w.serialNumber}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isStillValid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isStillValid ? 'Đang trong thời hạn bảo hành' : 'Hết hạn bảo hành'}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 mt-1">{w.productName}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Hiệu lực bảo hành:</div>
                          <div className="text-xs font-mono font-bold text-slate-900">
                            {w.activatedAt} đến {w.expiresAt}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-500">Khách hàng: </span>
                          <span className="font-bold text-slate-900">{w.customerName}</span>
                          <div className="text-slate-600 mt-0.5">SĐT: {w.customerPhone}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Địa chỉ lắp đặt: </span>
                          <span className="text-slate-800">{w.customerAddress}</span>
                          <div className="text-slate-500 mt-0.5">Đơn hàng gốc: {w.orderCode}</div>
                        </div>
                      </div>

                      {/* Associated Tickets */}
                      {warrantyTickets.filter((t) => t.serialNumber === w.serialNumber).length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-700 block mb-1">
                            Lịch sử bảo hành / sửa chữa thiết bị này:
                          </span>
                          <div className="space-y-1 text-xs">
                            {warrantyTickets
                              .filter((t) => t.serialNumber === w.serialNumber)
                              .map((t) => (
                                <div key={t.id} className="p-2 bg-sky-50/50 rounded border border-sky-100 flex items-center justify-between">
                                  <div>
                                    <span className="font-mono font-bold text-sky-900">{t.code}: </span>
                                    <span className="text-slate-700">{t.issueDescription}</span>
                                  </div>
                                  <span className="text-[10px] font-semibold text-sky-800">
                                    {t.resolutionStatus}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE WARRANTY CARDS */}
      {activeTab === 'cards' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Số Serial</th>
                  <th className="py-3 px-4">Tên thiết bị</th>
                  <th className="py-3 px-4">Chủ sở hữu</th>
                  <th className="py-3 px-3">Số điện thoại</th>
                  <th className="py-3 px-3">Mã đơn hàng</th>
                  <th className="py-3 px-3 text-center">Ngày kích hoạt</th>
                  <th className="py-3 px-3 text-center">Hết hạn</th>
                  <th className="py-3 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warranties.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{w.serialNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{w.productName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{w.customerName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{w.customerPhone}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{w.orderCode}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">{w.activatedAt}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">{w.expiresAt}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Có hiệu lực
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RMA REPAIR TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Danh Sách Yêu Cầu Bảo Hành &amp; Sửa Chữa (RMA)</h3>
              <p className="text-xs text-slate-500">Điều phối kỹ thuật viên xử lý sự cố thiết bị vệ sinh tại nhà khách hàng.</p>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tiếp Nhận Yêu Cầu Mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {warrantyTickets.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900">{t.code}</span>
                    <span className="text-xs font-mono font-medium text-slate-600">Serial: {t.serialNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.resolutionStatus === 'handed_over'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.resolutionStatus === 'inspecting'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {t.resolutionStatus === 'handed_over'
                        ? 'Đã bàn giao khách'
                        : t.resolutionStatus === 'inspecting'
                          ? 'Đang kiểm tra kỹ thuật'
                          : t.resolutionStatus === 'replacing_parts'
                            ? 'Đang thay linh kiện'
                            : 'Mới tiếp nhận'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Tiếp nhận: {t.createdAt} · Kỹ thuật viên: <strong>{t.assignedTechnician}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="font-semibold text-slate-900 mb-0.5">{t.productName} (Khách hàng: {t.customerName} - {t.customerPhone})</div>
                  <div>Nội dung sự cố: {t.issueDescription}</div>
                  {t.repairNotes && (
                    <div className="text-slate-500 mt-1 italic">Ghi chú xử lý: {t.repairNotes}</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Chi phí phụ tùng: <strong className="text-slate-900">{t.costVND.toLocaleString('vi-VN')} đ (Bảo hành miễn phí)</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.resolutionStatus !== 'handed_over' && (
                      <button
                        onClick={() => updateWarrantyTicketStatus(t.id, 'handed_over', 'Đã thay mới van xả và nghiệm thu vận hành tốt.')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                      >
                        Nghiệm Thu &amp; Bàn Giao Khách Hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: KÍCH HOẠT BẢO HÀNH */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Kích Hoạt Bảo Hành Điện Tử Mới</h3>
              <button onClick={() => setShowActivateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleActivateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã Serial Sản Phẩm</label>
                <input
                  type="text"
                  value={actSerial}
                  onChange={(e) => setActSerial(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sản phẩm</label>
                <select
                  value={actProductId}
                  onChange={(e) => setActProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã đơn hàng</label>
                <input
                  type="text"
                  value={actOrderCode}
                  onChange={(e) => setActOrderCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên khách hàng</label>
                  <input
                    type="text"
                    value={actCustName}
                    onChange={(e) => setActCustName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={actCustPhone}
                    onChange={(e) => setActCustPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa chỉ lắp đặt</label>
                <input
                  type="text"
                  value={actCustAddress}
                  onChange={(e) => setActCustAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowActivateModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Kích Hoạt Bảo Hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TIẾP NHẬN YÊU CẦU RMA */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Tiếp Nhận Sửa Chữa / Bảo Hành (RMA)</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã Serial thiết bị</label>
                <input
                  type="text"
                  value={ticketSerial}
                  onChange={(e) => setTicketSerial(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên khách</label>
                  <input
                    type="text"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={ticketPhone}
                    onChange={(e) => setTicketPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả hiện tượng lỗi</label>
                <textarea
                  rows={3}
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Tạo Phiếu RMA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
