import React, { useState } from 'react';
import { ApiConnectionMode } from '../types/fen';
import { CheckCircle2, ExternalLink, Globe, ShieldAlert, Sparkles, X } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  currentTeamId: string;
  currentMode: ApiConnectionMode;
  onSave: (config: { apiUrl: string; teamId: string; mode: ApiConnectionMode }) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  currentTeamId,
  currentMode,
  onSave,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [teamInput, setTeamInput] = useState(currentTeamId);
  const [modeInput, setModeInput] = useState<ApiConnectionMode>(currentMode);

  if (!isOpen) return null;

  const cleanedUrl = urlInput.trim().replace(/\/+$/, '');
  const hadTrailingSlash = urlInput.trim().endsWith('/');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      apiUrl: cleanedUrl,
      teamId: teamInput.trim() || 'NexusLabs',
      mode: modeInput,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="kiro-card rounded-2xl max-w-xl w-full p-6 border border-[#b080ff]/35 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#8847ff]/20 border border-[#b080ff]/40 text-[#b080ff]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Configuración de AWS Lambda Function URL
              </h3>
              <p className="text-xs text-[#a59bb8]">
                Contrato del Verificador Automático (Secciones 3, 4 y 8 del Informe Técnico)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a59bb8] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#e2d3fe] mb-1.5">
              URL Base de la API (VITE_API_URL) — HTTPS sin barra final
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://xxxxxxxx.lambda-url.us-east-1.on.aws"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120f18] border border-[#b080ff]/30 text-sm font-mono text-white placeholder-[#6b6080] focus:outline-none focus:border-[#b080ff]"
            />
            {hadTrailingSlash && (
              <p className="mt-1.5 text-xs text-[#ffcf99] flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Se eliminará automáticamente la barra final &quot;/&quot; para evitar dobles barras (ej.{' '}
                {cleanedUrl}/health).
              </p>
            )}
            <p className="mt-1.5 text-xs text-[#9589ab]">
              También puedes definirla permanentemente en <code className="text-[#80f4ff]">.env</code>{' '}
              con <code className="text-[#80f4ff]">VITE_API_URL</code>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#e2d3fe] mb-1.5">
              Identificador de Equipo en /health (teamId)
            </label>
            <input
              type="text"
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              placeholder="NexusLabs"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#120f18] border border-[#b080ff]/30 text-sm font-mono text-white focus:outline-none focus:border-[#b080ff]"
            />
            <p className="mt-1 text-xs text-[#9589ab]">
              El campo <code className="text-[#80ffb5]">team</code> en <code className="text-[#80ffb5]">GET /health</code>{' '}
              debe coincidir exactamente con el registrado en el portal.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#e2d3fe] mb-2">
              Modo de Operación del Cliente API (api.ts)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(
                [
                  {
                    id: 'hybrid',
                    title: 'Híbrido (Recomendado)',
                    desc: 'Usa Lambda real y aplica respaldo local si una ruta de dominio aún no existe.',
                  },
                  {
                    id: 'live',
                    title: 'Lambda Estricto',
                    desc: '100% llamadas directas a la Function URL sin fallback local.',
                  },
                  {
                    id: 'mock',
                    title: 'Simulador Local',
                    desc: 'Ejecución en memoria para pruebas rápidas sin red.',
                  },
                ] as const
              ).map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setModeInput(opt.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    modeInput === opt.id
                      ? 'bg-[#8847ff]/20 border-[#b080ff] text-white'
                      : 'bg-[#14111c] border-white/10 text-[#a59bb8] hover:border-white/25'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{opt.title}</span>
                    {modeInput === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#80ffb5]" />}
                  </div>
                  <p className="text-[11px] mt-1 leading-relaxed opacity-85">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#14111d] border border-[#80f4ff]/20 text-xs text-[#c4b8db] space-y-1">
            <div className="font-mono font-semibold text-[#80f4ff] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Vista previa de rutas generadas:
            </div>
            <div className="font-mono text-[11px] text-[#80ffb5] break-all">
              {cleanedUrl || 'https://<lambda-url>.on.aws'}/health
            </div>
            <div className="font-mono text-[11px] text-[#e2d3fe] break-all">
              {cleanedUrl || 'https://<lambda-url>.on.aws'}/necesidades
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#c4b8db] hover:bg-white/10 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="kiro-glow-btn px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Guardar y Conectar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
