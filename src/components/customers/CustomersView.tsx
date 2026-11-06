import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Customer, CustomerType, Product, ProjectMilestone } from '../../types/erp';
import { Plus, Search, UserRound, X } from 'lucide-react';
import { MoneyInput } from '../common/MoneyInput';

const TYPE_LABEL: Record<CustomerType, string> = {
  retail: 'Khách lẻ',
  dealer: 'Đại lý',
  distributor: 'Nhà phân phối',
  project: 'Dự án',
};

const typeBadgeClass = (type: CustomerType) => {
  if (type === 'retail') return 'bg-slate-100 text-slate-700';
  if (type === 'dealer') return 'bg-blue-50 text-blue-800';
  if (type === 'distributor') return 'bg-amber-50 text-amber-800';
  return 'bg-purple-50 text-purple-800';
};

interface MilestoneDraft {
  id: string;
  name: string;
  deliveryDate: string;
  lines: { productId: string; quantity: number }[];
}

const dateAfter = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const blankMilestone = (products: Product[]): MilestoneDraft => ({
  id: `M-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
  name: '',
  deliveryDate: dateAfter(14),
  lines: [{ productId: products[0]?.id || '', quantity: 1 }],
});

const draftsFrom = (milestones: ProjectMilestone[] | undefined, products: Product[]): MilestoneDraft[] =>
  (milestones || []).map((item) => ({
    id: item.id,
    name: item.name,
    deliveryDate: item.deliveryDate,
    lines: item.items?.length
      ? item.items.map((line) => ({ productId: line.productId, quantity: line.quantity }))
      : [{ productId: products[0]?.id || '', quantity: 1 }],
  }));

const milestoneError = (drafts: MilestoneDraft[]) => {
  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    if (!draft.name.trim()) return `Đợt ${index + 1} chưa có tên.`;
    if (!draft.deliveryDate) return `Đợt ${index + 1} chưa có ngày bàn giao.`;
    if (draft.lines.length === 0) return `Đợt ${index + 1} chưa có mặt hàng.`;
    if (draft.lines.some((line) => !line.productId || line.quantity < 1)) {
      return `Đợt ${index + 1} có dòng số lượng chưa hợp lệ.`;
    }
  }
  return null;
};

const toMilestones = (drafts: MilestoneDraft[], products: Product[], existing?: ProjectMilestone[]): ProjectMilestone[] =>
  drafts.map((draft) => {
    const previous = existing?.find((item) => item.id === draft.id);
    const itemsSummary = draft.lines
      .map((line) => {
        const product = products.find((item) => item.id === line.productId);
        return `${line.quantity} ${product?.unit || ''} ${product?.code || ''}`.replace(/\s+/g, ' ').trim();
      })
      .join(', ');
    return {
      id: draft.id,
      name: draft.name.trim(),
      deliveryDate: draft.deliveryDate,
      itemsSummary,
      items: draft.lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      percentage: previous?.percentage ?? 0,
      paymentAmount: previous?.paymentAmount ?? 0,
      deliveryStatus: previous?.deliveryStatus ?? 'pending',
      paymentStatus: previous?.paymentStatus ?? 'unpaid',
    };
  });

const emptyForm = () => ({
  name: '',
  type: 'dealer' as CustomerType,
  phone: '',
  email: '',
  address: '',
  taxCode: '',
  creditLimit: 300000000,
  paymentTermDays: 30,
  discountRate: 15,
  projectName: '',
  contractValue: 0,
  milestones: [] as MilestoneDraft[],
});

export const CustomersView: React.FC = () => {
  const { customers, products, addCustomer, updateProjectMilestones, exportTableToCSV, showToast, currentUser } = useErp();
  const canPlanMilestones = currentUser.role === 'admin' || currentUser.role === 'director' || currentUser.role === 'sales';
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CustomerType>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<Customer | null>(null);
  const [editDrafts, setEditDrafts] = useState<MilestoneDraft[]>([]);
  const [form, setForm] = useState(emptyForm);

  const filtered = customers.filter((c) => {
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const q = searchTerm.toLowerCase();
    return matchesType && (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.phone.includes(searchTerm));
  });

  const counts = {
    all: customers.length,
    retail: customers.filter((c) => c.type === 'retail').length,
    dealer: customers.filter((c) => c.type === 'dealer').length,
    distributor: customers.filter((c) => c.type === 'distributor').length,
    project: customers.filter((c) => c.type === 'project').length,
  };

  const handleExport = () => {
    const headers = ['Mã', 'Tên', 'Loại', 'Điện thoại', 'Địa chỉ', 'Chiết khấu %', 'Hạn mức', 'Dư nợ'];
    const rows = filtered.map((c) => [c.code, c.name, TYPE_LABEL[c.type], c.phone, c.address, c.discountRate, c.creditLimit, c.currentDebt]);
    exportTableToCSV('Danh_Ba_Khach_Hang', headers, rows);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.type === 'project' && canPlanMilestones) {
      const error = milestoneError(form.milestones);
      if (error) {
        showToast('error', 'Đợt bàn giao chưa đủ', error);
        return;
      }
    }
    addCustomer({
      name: form.name,
      type: form.type,
      phone: form.phone,
      email: form.email,
      address: form.address,
      taxCode: form.taxCode,
      creditLimit: form.creditLimit,
      paymentTermDays: form.paymentTermDays,
      discountRate: form.discountRate,
      projectName: form.projectName,
      contractValue: form.contractValue,
      milestones: form.type === 'project' && canPlanMilestones ? toMilestones(form.milestones, products) : undefined,
    });
    setShowCreate(false);
    setForm(emptyForm());
  };

  const openMilestones = (customer: Customer) => {
    setEditingProject(customer);
    setEditDrafts(draftsFrom(customer.milestones, products));
  };

  const saveMilestones = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const error = milestoneError(editDrafts);
    if (error) {
      showToast('error', 'Đợt bàn giao chưa đủ', error);
      return;
    }
    updateProjectMilestones(editingProject.id, toMilestones(editDrafts, products, editingProject.milestones));
    setEditingProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Danh Bạ Khách Hàng (Lẻ · Đại lý · Nhà phân phối · Dự án)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hồ sơ dự án có các đợt bàn giao. Khi lập đơn, chọn đợt để lấy sẵn mặt hàng và số lượng.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={handleExport} className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
            Xuất Excel
          </button>
          <button
            onClick={() => {
              setForm(emptyForm());
              setShowCreate(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm khách hàng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Tổng hồ sơ" value={String(counts.all)} />
        <Stat label="Khách lẻ" value={String(counts.retail)} />
        <Stat label="Đại lý" value={String(counts.dealer)} />
        <Stat label="Nhà phân phối" value={String(counts.distributor)} />
        <Stat label="Dự án" value={String(counts.project)} />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['all', 'retail', 'dealer', 'distributor', 'project'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                typeFilter === key ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              {key === 'all' ? 'Tất cả' : TYPE_LABEL[key]}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên, mã khách, số điện thoại..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Mã</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-3 text-right">Chiết khấu</th>
                <th className="py-3 px-3 text-right">Hạn mức</th>
                <th className="py-3 px-3 text-right">Dư nợ</th>
                <th className="py-3 px-3 text-center">Kỳ hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{c.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.phone} · {c.address}</div>
                    {c.projectName && <div className="text-[11px] text-purple-700 mt-0.5">{c.projectName}</div>}
                    {c.type === 'project' && (
                      canPlanMilestones ? (
                        <button
                          type="button"
                          onClick={() => openMilestones(c)}
                          className="mt-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900"
                        >
                          Đợt bàn giao ({c.milestones?.length || 0})
                        </button>
                      ) : (
                        <div className="mt-1 text-[11px] text-purple-700">{c.milestones?.length || 0} đợt bàn giao</div>
                      )
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${typeBadgeClass(c.type)}`}>
                      {TYPE_LABEL[c.type]}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{c.discountRate}%</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{c.creditLimit.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{c.currentDebt.toLocaleString('vi-VN')}</td>
                  <td className="py-3 px-3 text-center">{c.paymentTermDays ? `${c.paymentTermDays} ngày` : 'Thu ngay'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className={`bg-white rounded-xl shadow-2xl border border-slate-200 w-full ${form.type === 'project' ? 'max-w-3xl' : 'max-w-2xl'} max-h-[92vh] flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Thêm khách hàng</h3>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
                {(['retail', 'dealer', 'distributor', 'project'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, type: key }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                      form.type === key ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    {TYPE_LABEL[key]}
                  </button>
                ))}
              </div>
              {form.type === 'distributor' && (
                <p className="text-[11px] text-amber-800">
                  Nhà phân phối dùng hạn mức, kỳ hạn và chiết khấu như đại lý. Không có đợt bàn giao của dự án.
                </p>
              )}
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Tên khách hàng</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Điện thoại</span>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Email</span>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                </label>
              </div>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ</span>
                <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
              </label>
              {form.type !== 'retail' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Mã số thuế</span>
                    <input value={form.taxCode} onChange={(e) => setForm({ ...form, taxCode: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Hạn mức (đ)</span>
                    <MoneyInput value={form.creditLimit} onChange={(creditLimit) => setForm({ ...form, creditLimit })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Kỳ hạn (ngày)</span>
                    <input type="number" min={0} value={form.paymentTermDays} onChange={(e) => setForm({ ...form, paymentTermDays: Number(e.target.value) })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Chiết khấu mặc định (%)</span>
                    <input type="number" min={0} max={100} value={form.discountRate} onChange={(e) => setForm({ ...form, discountRate: Number(e.target.value) })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                  </label>
                </div>
              )}
              {form.type === 'project' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Tên dự án</span>
                    <input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300" />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Giá trị hợp đồng (đ)</span>
                    <MoneyInput value={form.contractValue} onChange={(contractValue) => setForm({ ...form, contractValue })} className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono" />
                  </label>
                </div>
              )}
              {form.type === 'project' && canPlanMilestones && (
                <MilestoneEditor
                  drafts={form.milestones}
                  products={products}
                  onChange={(milestones) => setForm((current) => ({ ...current, milestones }))}
                />
              )}
              {form.type === 'project' && !canPlanMilestones && (
                <p className="text-[11px] text-slate-500">
                  Đợt bàn giao do Sales, Admin hoặc Giám đốc lập sau khi hồ sơ được lưu.
                </p>
              )}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">
                  Lưu khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Đợt bàn giao</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{editingProject.projectName || editingProject.name}</p>
              </div>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveMilestones} className="flex-1 overflow-y-auto p-5 space-y-4">
              <MilestoneEditor drafts={editDrafts} products={products} onChange={setEditDrafts} />
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">
                  Lưu đợt bàn giao
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MilestoneEditor: React.FC<{
  drafts: MilestoneDraft[];
  products: Product[];
  onChange: (next: MilestoneDraft[]) => void;
}> = ({ drafts, products, onChange }) => {
  const update = (index: number, next: MilestoneDraft) => {
    onChange(drafts.map((item, itemIndex) => (itemIndex === index ? next : item)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-800">Đợt bàn giao</div>
          <p className="text-[11px] text-slate-500">Mỗi đợt ghi mặt hàng và số lượng. Lập đơn sẽ lấy đúng các dòng này.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...drafts, blankMilestone(products)])}
          className="flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm đợt
        </button>
      </div>
      {drafts.length === 0 && (
        <div className="p-3 rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-500">
          Chưa có đợt. Bấm Thêm đợt để lập kế hoạch giao hàng.
        </div>
      )}
      {drafts.map((draft, index) => (
        <div key={draft.id} className="p-3 rounded-lg border border-purple-200 bg-purple-50/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-purple-800">Đợt {index + 1}</span>
            <button
              type="button"
              onClick={() => onChange(drafts.filter((_, itemIndex) => itemIndex !== index))}
              className="text-[11px] font-medium text-rose-600 hover:text-rose-700"
            >
              Xóa đợt
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="block sm:col-span-2">
              <span className="block text-[11px] font-semibold text-slate-700 mb-1">Tên đợt</span>
              <input
                value={draft.name}
                onChange={(e) => update(index, { ...draft, name: e.target.value })}
                placeholder="Đợt 1: Gạch khối đế"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold text-slate-700 mb-1">Ngày bàn giao</span>
              <input
                type="date"
                value={draft.deliveryDate}
                onChange={(e) => update(index, { ...draft, deliveryDate: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </label>
          </div>
          <div className="space-y-2">
            {draft.lines.map((line, lineIndex) => (
              <div key={`${draft.id}-${lineIndex}`} className="flex items-center gap-2">
                <select
                  value={line.productId}
                  onChange={(e) => {
                    const lines = draft.lines.map((item, itemIndex) =>
                      itemIndex === lineIndex ? { ...item, productId: e.target.value } : item
                    );
                    update(index, { ...draft, lines });
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} — {product.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => {
                    const lines = draft.lines.map((item, itemIndex) =>
                      itemIndex === lineIndex ? { ...item, quantity: Math.max(1, Number(e.target.value) || 1) } : item
                    );
                    update(index, { ...draft, lines });
                  }}
                  className="w-20 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-center font-mono"
                />
                <button
                  type="button"
                  disabled={draft.lines.length === 1}
                  onClick={() => update(index, { ...draft, lines: draft.lines.filter((_, itemIndex) => itemIndex !== lineIndex) })}
                  className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update(index, { ...draft, lines: [...draft.lines, { productId: products[0]?.id || '', quantity: 1 }] })}
              className="text-[11px] font-semibold text-sky-700 hover:text-sky-800"
            >
              + Thêm mặt hàng
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200">
    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
    <div className="text-lg font-bold text-slate-900 mt-1">{value}</div>
  </div>
);
