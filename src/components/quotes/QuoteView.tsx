import React, { useMemo, useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { CustomerType, Product } from '../../types/erp';
import { FileText, Plus, Trash2, X } from 'lucide-react';

type QuoteLine = {
  productId: string;
  quantity: number;
  discountPercent: number;
};

const CHANNEL_LABEL: Record<CustomerType, string> = {
  retail: 'Khách lẻ',
  dealer: 'Đại lý',
  distributor: 'Nhà phân phối',
  project: 'Dự án',
};

const money = (n: number) => `${Math.round(n).toLocaleString('vi-VN')} đ`;

const listPriceOf = (product: Product, channel: CustomerType) => {
  if (channel === 'dealer' || channel === 'distributor') return product.dealerPrice;
  if (channel === 'project') return product.projectPrice;
  return product.retailPrice;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const defaultValidUntil = () => {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().split('T')[0];
};

export const QuoteView: React.FC = () => {
  const { products, customers, currentUser, showToast } = useErp();
  const [channel, setChannel] = useState<CustomerType>('dealer');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [notes, setNotes] = useState('Giá đã chiết khấu theo chương trình báo giá. Chưa bao gồm chi phí lắp đặt.');
  const [lines, setLines] = useState<QuoteLine[]>([
    { productId: products.find((p) => !p.isCombo)?.id || products[0]?.id || '', quantity: 1, discountPercent: 15 },
  ]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState('');

  const channelCustomers = customers.filter((c) => c.type === channel);

  const pricedLines = useMemo(() => {
    return lines.map((line) => {
      const product = products.find((p) => p.id === line.productId);
      const listPrice = product ? listPriceOf(product, channel) : 0;
      const discount = Math.min(100, Math.max(0, line.discountPercent));
      const netUnit = Math.round(listPrice * (1 - discount / 100));
      const lineTotal = netUnit * line.quantity;
      return { ...line, product, listPrice, discount, netUnit, lineTotal };
    });
  }, [lines, products, channel]);

  const subtotal = pricedLines.reduce((sum, line) => sum + line.listPrice * line.quantity, 0);
  const discountTotal = pricedLines.reduce((sum, line) => sum + (line.listPrice - line.netUnit) * line.quantity, 0);
  const taxAmount = Math.round((subtotal - discountTotal) * 0.1);
  const grandTotal = subtotal - discountTotal + taxAmount;

  const applyDiscountToLines = (percent: number) => {
    const next = Math.min(100, Math.max(0, percent));
    setDiscountPercent(next);
    setLines((prev) => prev.map((line) => ({ ...line, discountPercent: next })));
  };

  const handleChannel = (next: CustomerType) => {
    setChannel(next);
    setCustomerId('');
    if (next === 'retail') applyDiscountToLines(0);
  };

  const handlePickCustomer = (id: string) => {
    setCustomerId(id);
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerAddress(customer.address);
    applyDiscountToLines(customer.discountRate || 0);
  };

  const addLine = () => {
    const used = new Set(lines.map((line) => line.productId));
    const next = products.find((p) => !used.has(p.id)) || products[0];
    if (!next) return;
    setLines((prev) => [...prev, { productId: next.id, quantity: 1, discountPercent }]);
  };

  const buildCatalogFile = () => {
    if (!customerName.trim()) {
      showToast('error', 'Thiếu khách hàng', 'Nhập tên khách trước khi tạo catalog báo giá.');
      return null;
    }
    if (pricedLines.some((line) => !line.product)) {
      showToast('error', 'Thiếu mặt hàng', 'Mỗi dòng báo giá cần một sản phẩm.');
      return null;
    }

    const code = `BG-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`;
    const issued = new Date().toLocaleDateString('vi-VN');
    const cards = pricedLines.map((line) => {
      const product = line.product!;
      return `
        <article class="card">
          <div class="brand">${escapeHtml(product.brand)} · ${escapeHtml(product.code)}</div>
          <h2>${escapeHtml(product.name)}</h2>
          <p>${escapeHtml(product.description || '')}</p>
          <div class="meta">
            <span>Xuất xứ: ${escapeHtml(product.origin)}</span>
            <span>Bảo hành: ${product.warrantyMonths} tháng</span>
            <span>ĐVT: ${escapeHtml(product.unit)}</span>
            <span>SL: ${line.quantity.toLocaleString('vi-VN')}</span>
          </div>
          <div class="price">
            <div>
              <div class="label">Giá niêm yết</div>
              <div class="old">${money(line.listPrice)}</div>
            </div>
            <div>
              <div class="label">Chiết khấu</div>
              <div class="disc">${line.discount}%</div>
            </div>
            <div>
              <div class="label">Giá báo</div>
              <div class="net">${money(line.netUnit)}</div>
            </div>
            <div>
              <div class="label">Thành tiền</div>
              <div class="net">${money(line.lineTotal)}</div>
            </div>
          </div>
        </article>`;
    }).join('');

    const payload = JSON.stringify({
      kind: 'pancras-quote',
      code,
      channel,
      customerName: customerName.trim(),
      customerPhone,
      customerAddress,
      lines: pricedLines.map((line) => ({
        productCode: line.product!.code,
        quantity: line.quantity,
        unitPrice: line.netUnit,
      })),
    }).replace(/</g, '\\u003c');

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Catalog báo giá ${code}</title>
  <style>
    body { margin: 0; font-family: "Segoe UI", sans-serif; color: #0f172a; background: #f8fafc; }
    .page { max-width: 920px; margin: 0 auto; padding: 32px 28px 48px; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #0f172a; padding-bottom: 18px; }
    h1 { margin: 0; font-size: 26px; letter-spacing: -0.03em; }
    .sub { color: #475569; font-size: 13px; margin-top: 6px; line-height: 1.5; }
    .code { text-align: right; }
    .code strong { display: block; font-size: 18px; }
    .who { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0; font-size: 13px; }
    .who div { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; margin-bottom: 12px; }
    .brand { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #0369a1; }
    h2 { margin: 4px 0 6px; font-size: 16px; }
    p { margin: 0; color: #475569; font-size: 13px; }
    .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; font-size: 12px; color: #334155; }
    .price { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
    .price div { background: #f8fafc; border-radius: 10px; padding: 8px 10px; }
    .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .old { text-decoration: line-through; color: #94a3b8; margin-top: 2px; }
    .disc { color: #047857; font-weight: 700; margin-top: 2px; }
    .net { font-weight: 800; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    td { padding: 7px 0; }
    td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
    .grand td { font-size: 16px; font-weight: 800; border-top: 2px solid #0f172a; }
    footer { margin-top: 18px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <div>
        <h1>PANCRAS — Catalog báo giá</h1>
        <div class="sub">Thiết bị vệ sinh &amp; nội thất phòng tắm<br/>Bảng giá kênh: ${escapeHtml(CHANNEL_LABEL[channel])}</div>
      </div>
      <div class="code">
        <strong>${code}</strong>
        <div class="sub">Ngày lập: ${issued}<br/>Hiệu lực đến: ${escapeHtml(validUntil.split('-').reverse().join('/'))}</div>
      </div>
    </header>
    <section class="who">
      <div>
        <strong>Kính gửi</strong><br/>
        ${escapeHtml(customerName)}<br/>
        ${escapeHtml(customerPhone || '')}<br/>
        ${escapeHtml(customerAddress || '')}
      </div>
      <div>
        <strong>Người lập</strong><br/>
        ${escapeHtml(currentUser.name)}<br/>
        ${escapeHtml(currentUser.roleLabel)}<br/>
        ${escapeHtml(currentUser.phone)}
      </div>
    </section>
    ${cards}
    <table>
      <tr><td>Tiền hàng niêm yết</td><td>${money(subtotal)}</td></tr>
      <tr><td>Chiết khấu</td><td>-${money(discountTotal)}</td></tr>
      <tr><td>VAT 10%</td><td>${money(taxAmount)}</td></tr>
      <tr class="grand"><td>Tổng thanh toán</td><td>${money(grandTotal)}</td></tr>
    </table>
    <footer>${escapeHtml(notes)}<br/>Báo giá này chưa phải đơn hàng. Giá vốn và tồn kho không bị thay đổi.</footer>
  </div>
  <script type="application/json" id="pancras-quote">${payload}</script>
</body>
</html>`;

    return { code, html };
  };

  const handleGenerate = () => {
    const file = buildCatalogFile();
    if (!file) return;
    const blob = new Blob([file.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Catalog_Bao_Gia_${file.code}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setPreviewCode(file.code);
    setPreviewHtml(file.html);
    showToast('success', 'Đã tạo catalog báo giá', `File Catalog_Bao_Gia_${file.code}.html đã được tải về.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lập Bảng Báo Giá &amp; Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Chọn mặt hàng theo bảng giá lẻ, đại lý, nhà phân phối hoặc dự án, nhập chiết khấu, rồi xuất file catalog gửi khách.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs self-start sm:self-auto"
        >
          <FileText className="w-3.5 h-3.5" />
          Tạo catalog báo giá
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
          {(['retail', 'dealer', 'distributor', 'project'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChannel(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                channel === key ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              {CHANNEL_LABEL[key]}
            </button>
          ))}
        </div>
        {channel === 'distributor' && (
          <p className="text-[11px] text-amber-800">
            Báo giá nhà phân phối đang lấy bảng giá đại lý. Kênh giá riêng chưa được chốt.
          </p>
        )}

        {channel !== 'retail' && (
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Lấy hồ sơ khách để điền chiết khấu mặc định</span>
            <select
              value={customerId}
              onChange={(e) => handlePickCustomer(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="">Nhập tay, không lấy từ danh bạ</option>
              {channelCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} — chiết khấu {customer.discountRate}%
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block sm:col-span-2">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Khách hàng</span>
            <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tên người nhận báo giá" className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Điện thoại</span>
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Hiệu lực đến</span>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
          </label>
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ</span>
            <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-700 mb-1">Mức chiết khấu (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => applyDiscountToLines(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mặt hàng báo giá</div>
          <button type="button" onClick={addLine} className="text-xs font-semibold text-sky-700 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Thêm mặt hàng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-3 text-right">Giá niêm yết</th>
                <th className="py-3 px-3 text-center">SL</th>
                <th className="py-3 px-3 text-center">CK %</th>
                <th className="py-3 px-3 text-right">Giá báo</th>
                <th className="py-3 px-3 text-right">Thành tiền</th>
                <th className="py-3 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pricedLines.map((line, index) => (
                <tr key={index}>
                  <td className="py-3 px-4">
                    <select
                      value={line.productId}
                      onChange={(e) => {
                        const next = [...lines];
                        next[index] = { ...line, productId: e.target.value };
                        setLines(next);
                      }}
                      className="w-full min-w-64 px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.code} — {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">{money(line.listPrice)}</td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => {
                        const next = [...lines];
                        next[index] = { ...line, quantity: Math.max(1, Number(e.target.value) || 1) };
                        setLines(next);
                      }}
                      className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-center font-mono"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={line.discountPercent}
                      onChange={(e) => {
                        const next = [...lines];
                        next[index] = { ...line, discountPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) };
                        setLines(next);
                      }}
                      className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-center font-mono"
                    />
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums">{money(line.netUnit)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">{money(line.lineTotal)}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      disabled={lines.length <= 1}
                      onClick={() => setLines(lines.filter((_, i) => i !== index))}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col items-end gap-1 text-xs">
          <div>Tiền hàng: <span className="font-mono">{money(subtotal)}</span></div>
          <div>Chiết khấu: <span className="font-mono text-emerald-700">-{money(discountTotal)}</span></div>
          <div>VAT 10%: <span className="font-mono">{money(taxAmount)}</span></div>
          <div className="text-sm font-bold text-slate-900">Tổng thanh toán: <span className="font-mono">{money(grandTotal)}</span></div>
        </div>
      </div>

      <label className="block bg-white p-4 rounded-xl border border-slate-200">
        <span className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú in trên catalog</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
      </label>

      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Đã tải catalog {previewCode}</h3>
              <button onClick={() => setPreviewHtml(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe title="Catalog báo giá" srcDoc={previewHtml} className="flex-1 min-h-[70vh] w-full bg-slate-50" />
          </div>
        </div>
      )}
    </div>
  );
};
