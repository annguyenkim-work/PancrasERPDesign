import React, { useEffect, useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { BillingDocument, Order, OrderItem } from '../../types/erp';
import { X, Printer } from 'lucide-react';

interface PrintInvoiceModalProps {
  order: Order;
  onClose: () => void;
}

type BillingSide = 'dealer' | 'walk_in';

const moneyOf = (lines: OrderItem[]) => {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const discountTotal = lines.reduce((sum, line) => sum + (line.unitPrice * line.quantity * line.discountPercent) / 100, 0);
  const taxAmount = Math.round((subtotal - discountTotal) * 0.1);
  return { subtotal, discountTotal, taxAmount, grandTotal: subtotal - discountTotal + taxAmount };
};

const sidesOf = (order: Order): BillingSide[] => {
  if (!order.billingDocuments?.length) return order.items.map(() => 'dealer');
  return order.items.map((item) => {
    const walkIn = order.billingDocuments?.find((doc) => doc.side === 'walk_in' && doc.lines.some((line) => line.productId === item.productId));
    return walkIn ? 'walk_in' : 'dealer';
  });
};

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ order: source, onClose }) => {
  const { orders, customers, currentUser, saveBillingSplit } = useErp();
  const order = orders.find((item) => item.id === source.id) ?? source;
  const finished = order.status === 'completed';
  const issued = order.status === 'delivering';
  const isDealer = order.customerType === 'dealer';
  const canBill = currentUser.role === 'admin' || currentUser.role === 'director' || currentUser.role === 'accountant';
  const retailCustomers = customers.filter((customer) => customer.type === 'retail');
  const [sides, setSides] = useState<BillingSide[]>(() => sidesOf(order));
  const [walkInId, setWalkInId] = useState(() => order.billingDocuments?.find((doc) => doc.side === 'walk_in')?.customerId || '');

  useEffect(() => {
    setSides(sidesOf(order));
    setWalkInId(order.billingDocuments?.find((doc) => doc.side === 'walk_in')?.customerId || '');
  }, [order.id, order.billingDocuments]);

  const dealerLines = order.items.filter((_, index) => sides[index] !== 'walk_in');
  const walkLines = order.items.filter((_, index) => sides[index] === 'walk_in');
  const walkIn = retailCustomers.find((customer) => customer.id === walkInId);
  const dealerCode = customers.find((customer) => customer.id === order.customerId)?.code || order.customerId;
  const preview: BillingDocument[] = [];
  if (dealerLines.length > 0) {
    preview.push({
      id: 'preview-dealer',
      code: walkLines.length > 0 ? `${order.code}-HD1` : `${order.code}-HD1`,
      side: 'dealer',
      customerId: order.customerId,
      customerCode: dealerCode,
      customerName: order.customerName,
      lines: dealerLines,
      ...moneyOf(dealerLines),
    });
  }
  if (walkLines.length > 0) {
    preview.push({
      id: 'preview-walk',
      code: `${order.code}-HD${preview.length + 1}`,
      side: 'walk_in',
      customerId: walkIn?.id || '',
      customerCode: walkIn?.code || 'Chưa chọn',
      customerName: walkIn?.name || 'Chưa chọn Khách lẻ / Khách vãng lai',
      lines: walkLines,
      ...moneyOf(walkLines),
    });
  }

  const saved = order.billingDocuments && order.billingDocuments.length > 0;
  const closedDocuments: BillingDocument[] = saved
    ? order.billingDocuments!
    : [{
        id: 'closed-full',
        code: `${order.code}-HD1`,
        side: 'dealer',
        customerId: order.customerId,
        customerCode: dealerCode,
        customerName: order.customerName,
        lines: order.items,
        ...moneyOf(order.items),
      }];
  const invoiceDocs = finished ? (isDealer ? closedDocuments : []) : (isDealer ? preview : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print-backdrop">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="min-w-0">
            <div className="font-bold text-slate-800 text-sm">In phiếu xuất và hóa đơn</div>
            <div className="text-xs text-slate-500 font-mono">{order.code}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In ngay (A4)</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="no-print border-b border-sky-200 bg-sky-50 px-4 py-3 space-y-3">
          {finished ? (
            <div>
              <p className="text-xs font-bold text-slate-900">Đơn đã hoàn tất</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Không còn tách hoặc gộp hóa đơn. Phiếu xuất và chứng từ đã lưu chỉ để in.
              </p>
            </div>
          ) : (
          <>
          <div>
            <p className="text-xs font-bold text-slate-900">Tách hóa đơn</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Phiếu xuất vẫn là một phiếu cho cả chuyến. Hóa đơn tách sau khi hàng đã xuất, trước khi đơn hoàn tất: mặt hàng lấy hóa đơn gắn đại lý, mặt hàng không lấy hóa đơn gắn Khách lẻ / Khách vãng lai. Gộp lại là đưa mọi mặt hàng về một chứng từ.
            </p>
          </div>
          {!isDealer && (
            <p className="text-[11px] text-amber-800">Tách hóa đơn chỉ dùng cho đơn đại lý. Đơn này không tách, phiếu xuất in đủ dòng.</p>
          )}
          {isDealer && !issued && (
            <p className="text-[11px] text-amber-800">Đơn chưa có phiếu xuất. Xem trước được, nhưng chưa lưu được cho đến khi hàng đã bàn giao đi giao.</p>
          )}
          {isDealer && !canBill && (
            <p className="text-[11px] text-amber-800">Chỉ Kế toán, Giám đốc và Admin được lưu tách hóa đơn.</p>
          )}
          {isDealer && (
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-sky-100 px-3 py-2">
                  <div className="min-w-0 text-xs">
                    <span className="font-mono text-slate-500">{item.productCode}</span>
                    <span className="ml-2 font-medium text-slate-900">{item.productName}</span>
                    <span className="ml-2 text-slate-500">SL {item.quantity}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      disabled={!canBill}
                      onClick={() => setSides(sides.map((side, sideIndex) => sideIndex === index ? 'dealer' : side))}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md border ${sides[index] !== 'walk_in' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'}`}
                    >
                      Lấy hóa đơn đại lý
                    </button>
                    <button
                      type="button"
                      disabled={!canBill}
                      onClick={() => setSides(sides.map((side, sideIndex) => sideIndex === index ? 'walk_in' : side))}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-md border ${sides[index] === 'walk_in' ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-slate-600 border-slate-300'}`}
                    >
                      Không lấy hóa đơn
                    </button>
                  </div>
                </div>
              ))}
              {walkLines.length > 0 && (
                <label className="block text-xs">
                  <span className="block font-semibold text-slate-700 mb-1">Mã Khách lẻ / Khách vãng lai</span>
                  <select
                    value={walkInId}
                    disabled={!canBill}
                    onChange={(event) => setWalkInId(event.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- Chọn khách lẻ --</option>
                    {retailCustomers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.code} · {customer.name}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-slate-600">
                  {preview.length === 1
                    ? `Sẽ có một chứng từ ${preview[0].code}, không tạo chứng từ trống.`
                    : `Sẽ có ${preview[0]?.code} (${dealerLines.length} dòng) và ${preview[1]?.code} (${walkLines.length} dòng).`}
                  {saved ? ' Đã lưu trên đơn.' : ' Chưa lưu.'}
                </p>
                <button
                  type="button"
                  disabled={!canBill}
                  onClick={() => saveBillingSplit(order.id, sides, walkInId)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 rounded-lg"
                >
                  Lưu tách hóa đơn
                </button>
              </div>
            </div>
          )}
          </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 font-sans text-slate-900 print:p-0 print:overflow-visible space-y-10">
          <section>
            <DocumentHead
              title="PHIẾU XUẤT KHO"
              code={order.code}
              date={order.createdAt}
              note="Một chuyến, đủ mặt hàng trên đơn. Phiếu này không tách theo hóa đơn."
            />
            <Party
              leftLabel="Khách trên đơn"
              leftName={order.customerName}
              leftMeta={`${dealerCode} · ${order.customerPhone}`}
              right={[
                ['Địa chỉ giao', order.deliveryAddress || 'Nhận tại kho'],
                ['Nhân viên lập', order.salesPersonName],
                ['Ghi chú', order.notes || 'Hàng chính hãng 100%'],
              ]}
            />
            <LinesTable lines={order.items} />
            <p className="mt-3 text-[11px] text-slate-500">
              {finished
                ? 'Đơn đã hoàn tất. Phiếu xuất chỉ để in, không tách hoặc gộp hóa đơn.'
                : 'Phiếu xuất ghi hàng đã đi. Tách hóa đơn không trừ kho thêm.'}
            </p>
          </section>

          {invoiceDocs.map((doc) => (
            <section key={doc.id} className="print:break-before-page">
              <DocumentHead
                title="HÓA ĐƠN / CHỨNG TỪ THANH TOÁN"
                code={doc.code}
                date={order.createdAt}
                note={finished
                  ? 'Đơn đã hoàn tất. Chứng từ này chỉ để in, không tách hoặc gộp thêm.'
                  : saved
                    ? `Đã lưu từ phiếu xuất ${order.code}.`
                    : 'Xem trước. Bấm Lưu tách hóa đơn thì chứng từ mới được ghi.'}
              />
              <Party
                leftLabel={doc.side === 'dealer' ? 'Khách lấy hóa đơn' : 'Khách không lấy hóa đơn đại lý'}
                leftName={doc.customerName}
                leftMeta={doc.customerCode}
                right={[
                  ['Phiếu xuất gốc', order.code],
                  ['Đơn gốc', `${order.code} · ${order.customerName}`],
                  ['Số dòng', `${doc.lines.length}`],
                ]}
              />
              <LinesTable lines={doc.lines} />
              <Totals money={doc} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

const DocumentHead: React.FC<{ title: string; code: string; date: string; note: string }> = ({ title, code, date, note }) => (
  <div className="flex justify-between items-start gap-4 border-b-2 border-slate-900 pb-4 mb-4">
    <div>
      <h1 className="text-lg font-bold tracking-tight">PANCRAS VIỆT NAM CORP.</h1>
      <p className="text-[11px] text-slate-600 mt-1">Thiết bị vệ sinh &amp; nội thất phòng tắm · MST: 0108998822</p>
    </div>
    <div className="text-right">
      <div className="text-sm font-bold uppercase">{title}</div>
      <div className="text-xs text-slate-500 mt-1">Số: <span className="font-mono font-bold text-slate-800">{code}</span></div>
      <div className="text-xs text-slate-500">Ngày lập: {date}</div>
      <p className="text-[11px] text-slate-500 mt-1 max-w-xs">{note}</p>
    </div>
  </div>
);

const Party: React.FC<{
  leftLabel: string;
  leftName: string;
  leftMeta: string;
  right: [string, string][];
}> = ({ leftLabel, leftName, leftMeta, right }) => (
  <div className="grid grid-cols-2 gap-4 text-xs mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
    <div>
      <div className="text-slate-500">{leftLabel}</div>
      <div className="font-bold text-slate-900">{leftName}</div>
      <div className="font-mono text-slate-600">{leftMeta}</div>
    </div>
    <div className="space-y-1">
      {right.map(([label, value]) => (
        <div key={label}><span className="font-semibold text-slate-600">{label}: </span>{value}</div>
      ))}
    </div>
  </div>
);

const LinesTable: React.FC<{ lines: OrderItem[] }> = ({ lines }) => (
  <table className="w-full text-xs text-left border border-slate-200">
    <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold">
      <tr>
        <th className="py-2 px-2 border-r border-slate-200 text-center w-10">STT</th>
        <th className="py-2 px-3 border-r border-slate-200">Mã</th>
        <th className="py-2 px-3 border-r border-slate-200">Tên thiết bị</th>
        <th className="py-2 px-2 border-r border-slate-200 text-right">SL</th>
        <th className="py-2 px-3 text-right">Thành tiền</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200">
      {lines.map((line, index) => (
        <tr key={`${line.productId}-${index}`}>
          <td className="py-2 px-2 border-r border-slate-200 text-center font-mono">{index + 1}</td>
          <td className="py-2 px-3 border-r border-slate-200 font-mono">{line.productCode}</td>
          <td className="py-2 px-3 border-r border-slate-200">{line.productName}</td>
          <td className="py-2 px-2 border-r border-slate-200 text-right font-mono font-bold">{line.quantity}</td>
          <td className="py-2 px-3 text-right font-mono">{line.totalPrice.toLocaleString('vi-VN')} đ</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Totals: React.FC<{ money: { subtotal: number; discountTotal: number; taxAmount: number; grandTotal: number } }> = ({ money }) => (
  <div className="flex justify-end mt-3">
    <div className="w-64 space-y-1 text-xs">
      <div className="flex justify-between"><span>Tiền hàng</span><span className="font-mono">{money.subtotal.toLocaleString('vi-VN')} đ</span></div>
      <div className="flex justify-between"><span>Chiết khấu</span><span className="font-mono">-{money.discountTotal.toLocaleString('vi-VN')} đ</span></div>
      <div className="flex justify-between"><span>VAT 10%</span><span className="font-mono">{money.taxAmount.toLocaleString('vi-VN')} đ</span></div>
      <div className="flex justify-between font-bold border-t border-slate-300 pt-1"><span>Tổng chứng từ</span><span className="font-mono">{money.grandTotal.toLocaleString('vi-VN')} đ</span></div>
    </div>
  </div>
);
