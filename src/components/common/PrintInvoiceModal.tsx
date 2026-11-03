import React from 'react';
import { Order } from '../../types/erp';
import { X, Printer } from 'lucide-react';

interface PrintInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print-backdrop">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Xem Trước Bản In Phiếu Giao Hàng &amp; Hóa Đơn</span>
            <span className="text-xs text-slate-500 font-mono">({order.code})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay (Khổ A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 font-sans text-slate-900 print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                PANCRAS VIỆT NAM CORP.
              </h1>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <div>Hệ Thống Phân Phối Thiết Bị Vệ Sinh &amp; Nội Thất Phòng Tắm Cao Cấp</div>
                <div>Trụ sở: KCN Đài Tư, 386 Nguyễn Văn Linh, Q. Long Biên, Hà Nội</div>
                <div>Chi nhánh: 468 Nguyễn Văn Linh, P. Tân Phong, Quận 7, TP.HCM</div>
                <div>Hotline: 1900 8866 · Email: contact@pancraserp.vn · MST: 0108998822</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 font-mono uppercase">
                PHIẾU XUẤT KHO KIÊM BÁN HÀNG
              </div>
              <div className="text-xs text-slate-500 mt-1">Số: <span className="font-mono font-bold text-slate-800">{order.code}</span></div>
              <div className="text-xs text-slate-500">Ngày lập: {order.createdAt}</div>
              {order.contractCode && (
                <div className="text-xs font-semibold text-purple-700 mt-1">HĐ: {order.contractCode}</div>
              )}
            </div>
          </div>

          {/* Customer & Delivery Section */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-1">
              <div><span className="font-semibold text-slate-600">Khách hàng:</span> <span className="font-bold text-slate-900">{order.customerName}</span></div>
              <div><span className="font-semibold text-slate-600">Số điện thoại:</span> <span className="font-mono">{order.customerPhone}</span></div>
              <div><span className="font-semibold text-slate-600">Phân loại:</span> <span className="uppercase font-semibold text-sky-800">{order.customerType}</span></div>
            </div>
            <div className="space-y-1">
              <div><span className="font-semibold text-slate-600">Địa chỉ giao:</span> <span>{order.deliveryAddress || 'Nhận tại kho'}</span></div>
              <div><span className="font-semibold text-slate-600">Nhân viên lập:</span> <span>{order.salesPersonName}</span></div>
              <div><span className="font-semibold text-slate-600">Ghi chú:</span> <span className="italic">{order.notes || 'Hàng chính hãng 100%'}</span></div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left mb-6 border border-slate-200">
            <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold">
              <tr>
                <th className="py-2 px-2 border-r border-slate-200 text-center w-10">STT</th>
                <th className="py-2 px-3 border-r border-slate-200">Mã SKU</th>
                <th className="py-2 px-3 border-r border-slate-200">Tên thiết bị / Quy cách</th>
                <th className="py-2 px-2 border-r border-slate-200 text-center">ĐVT</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">SL</th>
                <th className="py-2 px-3 border-r border-slate-200 text-right">Đơn giá (đ)</th>
                <th className="py-2 px-2 border-r border-slate-200 text-right">CK (%)</th>
                <th className="py-2 px-3 text-right">Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-mono">{it.productCode}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium">
                    {it.productName}
                    {it.isCombo && <span className="ml-1 text-[10px] text-sky-700 font-semibold">(Trọn bộ Combo)</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center">{it.unit}</td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold">{it.quantity}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-mono">{it.unitPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-2 px-2 border-r border-slate-200 text-right font-mono">{it.discountPercent}%</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">{it.totalPrice.toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền hàng (chưa VAT):</span>
                <span className="font-mono">{order.subtotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Chiết khấu:</span>
                <span className="font-mono text-emerald-700">-{order.discountTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thuế GTGT (10%):</span>
                <span className="font-mono">{order.taxAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>TỔNG CỘNG THANH TOÁN:</span>
                <span className="font-mono">{order.grandTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Đã thanh toán:</span>
                <span className="font-mono">{order.paidAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              {order.grandTotal - order.paidAmount > 0 && (
                <div className="flex justify-between text-xs text-rose-700 font-bold">
                  <span>Còn lại ghi nhận nợ:</span>
                  <span className="font-mono">{(order.grandTotal - order.paidAmount).toLocaleString('vi-VN')} đ</span>
                </div>
              )}
            </div>
          </div>

          {/* Signature Boxes */}
          <div className="grid grid-cols-4 gap-4 text-center text-xs pt-4 border-t border-slate-200">
            <div>
              <div className="font-bold text-slate-800">Người Lập Phiếu</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
              <div className="h-16"></div>
              <div className="font-medium text-slate-700">{order.salesPersonName}</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Thủ Kho Xuất</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, xác nhận)</div>
              <div className="h-16"></div>
              <div className="font-medium text-slate-700">Nguyễn Văn Hùng</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Người Vận Chuyển</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, số xe)</div>
              <div className="h-16"></div>
              <div className="font-medium text-slate-700">Đội xe tải công ty</div>
            </div>
            <div>
              <div className="font-bold text-slate-800">Người Nhận Hàng</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="font-medium text-slate-700">{order.customerName}</div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            Hàng sứ vệ sinh &amp; sen vòi được bảo hành chính hãng từ 24 - 60 tháng theo số Serial điện tử. Quý khách vui lòng kiểm tra kỹ bề mặt men sứ trước khi ký nhận.
          </div>
        </div>
      </div>
    </div>
  );
};
