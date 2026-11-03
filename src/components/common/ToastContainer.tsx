import React from 'react';
import { useErp } from '../../context/ErpContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useErp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
      {toasts.map((t) => {
        const Icon = 
          t.type === 'success' 
            ? CheckCircle2 
            : t.type === 'error' 
              ? XCircle 
              : t.type === 'warning' 
                ? AlertTriangle 
                : Info;

        const bgColor =
          t.type === 'success'
            ? 'bg-emerald-900/95 text-white border-emerald-700'
            : t.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-700'
              : t.type === 'warning'
                ? 'bg-amber-900/95 text-white border-amber-700'
                : 'bg-slate-900/95 text-white border-slate-700';

        return (
          <div
            key={t.id}
            className={`p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all ${bgColor}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold">{t.title}</div>
              <div className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">{t.message}</div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
