import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  ClipboardList, 
  Search, 
  Download, 
  Filter, 
  Clock, 
  User, 
  Building2, 
  ShieldCheck, 
  Layers
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, exportTableToCSV } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.locationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const handleExportAudit = () => {
    const headers = ['Thời gian', 'Người thực hiện', 'Vai trò', 'Phân hệ', 'Hành động', 'Chi nhánh', 'Chi tiết thao tác'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.userName,
      l.role,
      l.module,
      l.action,
      l.locationName,
      l.details,
    ]);
    exportTableToCSV('Nhat_Ky_Audit_Log_PancrasERP', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Nhật Ký Thao Tác Hệ Thống (Audit Trail &amp; Compliance)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận bất biến mọi thao tác tạo đơn, duyệt công nợ ngoại lệ, điều chỉnh tồn kho và phân bổ chi phí container.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Báo Cáo Audit Excel</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo người thao tác, nội dung chi tiết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">Tất cả phân hệ</option>
            <option value="orders">Đơn hàng (Orders)</option>
            <option value="inventory">Tồn kho (Inventory)</option>
            <option value="transfers">Chuyển kho (Transfers)</option>
            <option value="procurement">Mua hàng &amp; Container</option>
            <option value="debt">Công nợ &amp; Thu tiền</option>
            <option value="warranty">Bảo hành điện tử</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Hiển thị <strong className="text-slate-900">{filteredLogs.length}</strong> sự kiện
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-3 text-center">Vai trò</th>
                <th className="py-3 px-3">Phân hệ</th>
                <th className="py-3 px-3">Hành động</th>
                <th className="py-3 px-3">Chi nhánh / Điểm</th>
                <th className="py-3 px-4">Mô tả chi tiết thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{log.userName}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded uppercase">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 uppercase tracking-wide text-[11px]">
                    {log.module}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[11px] text-slate-800">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {log.locationName}
                  </td>
                  <td className="py-3 px-4 text-slate-800 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
