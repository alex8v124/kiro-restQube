import React from 'react';
import { ApiLogEntry } from '../types/fen';
import { Terminal, Trash2, X } from 'lucide-react';

interface ApiInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ApiLogEntry[];
  onClear: () => void;
}

export const ApiInspectorDrawer: React.FC<ApiInspectorDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-slate-50 backdrop-blur-xl shadow-[0_-16px_48px_rgba(0,0,0,0.8)] max-h-[45vh] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-mono font-bold text-slate-900">
            Kiro HTTP Traffic &amp; Contract Inspector (api.ts)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            • Monitoreando códigos 200 / 201 / 202 / 404 y latencia
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded text-xs font-mono text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-3 space-y-2 font-mono text-xs flex-1">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Aún no hay peticiones registradas en esta sesión. Interactúa con cualquier rol o
            ejecuta el verificador.
          </div>
        ) : (
          logs.map((log) => {
            const statusColor =
              log.status >= 200 && log.status < 300
                ? 'bg-emerald-50 text-emerald-700 text-emerald-600 border-emerald-200'
                : log.status === 404
                  ? 'bg-amber-50 text-amber-800 text-amber-600 border-amber-200'
                  : 'bg-[#ff4d6d]/15 text-[#ff8096] border-[#ff4d6d]/35';

            return (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-slate-900 font-bold">
                      {log.method}
                    </span>
                    <span className="text-slate-900 font-semibold">{log.path}</span>
                    <span className={`px-2 py-0.5 rounded border text-[11px] ${statusColor}`}>
                      HTTP {log.status || 'ERR'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span
                      className={
                        log.source === 'lambda-live' ? 'text-emerald-600' : 'text-blue-600'
                      }
                    >
                      {log.source === 'lambda-live' ? '● AWS Lambda Live' : '● Híbrido / Local'}
                    </span>
                    <span className="text-slate-500">{log.latencyMs} ms</span>
                  </div>
                </div>

                {log.error && (
                  <div className="text-[11px] text-amber-600">{log.error}</div>
                )}

                {log.responseBody !== undefined && (
                  <pre className="p-2 rounded bg-black/50 text-[11px] text-emerald-600 overflow-x-auto max-h-24">
                    {JSON.stringify(log.responseBody)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
