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
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-[#b080ff]/40 bg-[#0b0910]/95 backdrop-blur-xl shadow-[0_-16px_48px_rgba(0,0,0,0.8)] max-h-[45vh] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#14111d]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#80f4ff]" />
          <span className="text-xs font-mono font-bold text-white">
            Kiro HTTP Traffic &amp; Contract Inspector (api.ts)
          </span>
          <span className="text-[11px] font-mono text-[#a59bb8]">
            • Monitoreando códigos 200 / 201 / 202 / 404 y latencia
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="px-2.5 py-1 rounded text-xs font-mono text-[#a59bb8] hover:text-white hover:bg-white/10 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#a59bb8] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-3 space-y-2 font-mono text-xs flex-1">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-[#9589ab]">
            Aún no hay peticiones registradas en esta sesión. Interactúa con cualquier rol o
            ejecuta el verificador.
          </div>
        ) : (
          logs.map((log) => {
            const statusColor =
              log.status >= 200 && log.status < 300
                ? 'bg-[#80ffb5]/15 text-[#80ffb5] border-[#80ffb5]/35'
                : log.status === 404
                  ? 'bg-[#ffcf99]/15 text-[#ffcf99] border-[#ffcf99]/35'
                  : 'bg-[#ff4d6d]/15 text-[#ff8096] border-[#ff4d6d]/35';

            return (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-[#14111d] border border-white/10 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#9589ab]">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-[#b080ff]/20 text-[#e2d3fe] font-bold">
                      {log.method}
                    </span>
                    <span className="text-white font-semibold">{log.path}</span>
                    <span className={`px-2 py-0.5 rounded border text-[11px] ${statusColor}`}>
                      HTTP {log.status || 'ERR'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span
                      className={
                        log.source === 'lambda-live' ? 'text-[#80ffb5]' : 'text-[#80f4ff]'
                      }
                    >
                      {log.source === 'lambda-live' ? '● AWS Lambda Live' : '● Híbrido / Local'}
                    </span>
                    <span className="text-[#a59bb8]">{log.latencyMs} ms</span>
                  </div>
                </div>

                {log.error && (
                  <div className="text-[11px] text-[#ffcf99]">{log.error}</div>
                )}

                {log.responseBody !== undefined && (
                  <pre className="p-2 rounded bg-black/50 text-[11px] text-[#80ffb5] overflow-x-auto max-h-24">
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
