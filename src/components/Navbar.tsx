import React from 'react';
import { RoleId } from '../types/fen';
import {
  Activity,
  Compass,
  HandHeart,
  Layers,
  Radio,
  SearchCode,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Truck,
} from 'lucide-react';

interface NavbarProps {
  activeRole: RoleId;
  onSelectRole: (role: RoleId) => void;
  apiUrl: string;
  teamId: string;
  mode: string;
  onOpenConfig: () => void;
  onToggleConsole: () => void;
  consoleCount: number;
}

export const ROLES_CONFIG: Array<{
  id: RoleId;
  label: string;
  shortDesc: string;
  badge: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'solicitante',
    label: 'Solicitante',
    shortDesc: 'Albergues Piura / Catacaos + Clasificación IA Bedrock',
    badge: 'Bedrock AI',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'donante',
    label: 'Donante',
    shortDesc: 'Catálogo de urgencias y registro con tracking_id',
    badge: '/donaciones',
    icon: <HandHeart className="w-4 h-4" />,
  },
  {
    id: 'coordinador',
    label: 'Coordinador',
    shortDesc: 'Cola priorizada P1/P2/P3 y cruce Donación → Necesidad',
    badge: '/asignaciones',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'logistico',
    label: 'Logístico',
    shortDesc: 'Control de despacho y rutas Piura / Catacaos',
    badge: '/entregas',
    icon: <Truck className="w-4 h-4" />,
  },
  {
    id: 'trazabilidad',
    label: 'Trazabilidad',
    shortDesc: 'Línea de tiempo en vivo por tracking_id',
    badge: 'TRK-FEN',
    icon: <Compass className="w-4 h-4" />,
  },
  {
    id: 'administrador',
    label: 'Administrador',
    shortDesc: 'Dashboard + Certificador Oficial de Insignias (150 Pts)',
    badge: '150 Pts',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onSelectRole,
  apiUrl,
  teamId,
  mode,
  onOpenConfig,
  onToggleConsole,
  consoleCount,
}) => {
  const hasLiveLambda = Boolean(apiUrl && apiUrl.startsWith('http'));

  return (
    <header className="sticky top-0 z-40 border-b border-[#b080ff]/15 bg-[#0e0c14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Row: Brand + Kiro Spec Status + API Connection Pill */}
        <div className="flex flex-wrap items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3">
            {/* Kiro-inspired Ghost/Beacon Logo */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#9046ff] via-[#7138cc] to-[#3b1d7a] shadow-[0_0_24px_rgba(144,70,255,0.45)] border border-[#e2d3fe]/30">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#80ffb5] ring-2 ring-[#0e0c14]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg text-white">
                  FEN — Ayuda Trazable
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#b080ff]/15 text-[#e2d3fe] border border-[#b080ff]/30">
                  AWS &amp; Kiro 2026
                </span>
              </div>
              <p className="text-xs text-[#a59bb8] flex items-center gap-2">
                <span>Emergencia El Niño • Piura &amp; Catacaos</span>
                <span className="text-[#b080ff]">•</span>
                <span className="font-mono text-[11px] text-[#80ffb5]">
                  team: {teamId}
                </span>
              </p>
            </div>
          </div>

          {/* Right Controls: Lambda URL Status + Console + Config */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConfig}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border border-[#b080ff]/25 bg-[#1b1625] hover:bg-[#251f33] hover:border-[#b080ff]/50 transition cursor-pointer"
              title="Configurar VITE_API_URL (Lambda Function URL) y Team ID"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasLiveLambda
                    ? 'bg-[#80ffb5] shadow-[0_0_8px_#80ffb5]'
                    : 'bg-[#ffcf99] shadow-[0_0_8px_#ffcf99]'
                }`}
              />
              <span className="text-[#e2d3fe] max-w-[180px] sm:max-w-[240px] truncate">
                {hasLiveLambda ? apiUrl.replace(/^https?:\/\//, '') : 'API: Modo Híbrido / Local'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#b080ff]/20 text-[#e2d3fe] text-[10px] uppercase">
                {mode}
              </span>
              <Settings2 className="w-3.5 h-3.5 text-[#b080ff]" />
            </button>

            <button
              onClick={onToggleConsole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-[#80f4ff]/25 bg-[#161b26] text-[#80f4ff] hover:bg-[#1e2636] transition cursor-pointer"
              title="Abrir Inspector de Tráfico HTTP de Kiro"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">HTTP Logs</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#80f4ff]/20 text-[#80f4ff] text-[10px]">
                {consoleCount}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Role Navigation Bar (5 Roles + Trazabilidad) */}
        <nav
          aria-label="Selector de rol operativo"
          className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar border-t border-white/5"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#9589ab] mr-1 shrink-0 flex items-center gap-1">
            <SearchCode className="w-3.5 h-3.5 text-[#b080ff]" />
            Vista por Rol:
          </span>
          {ROLES_CONFIG.map((role) => {
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#8847ff] to-[#6d28d9] text-white shadow-[0_0_20px_rgba(136,71,255,0.4)] border border-[#e2d3fe]/30'
                    : 'bg-[#171320]/80 text-[#c4b8db] hover:text-white hover:bg-[#221c2e] border border-transparent hover:border-[#b080ff]/20'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#b080ff]'}>{role.icon}</span>
                <span>{role.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isActive
                      ? 'bg-black/30 text-[#80ffb5]'
                      : 'bg-[#251f33] text-[#a59bb8] group-hover:text-[#e2d3fe]'
                  }`}
                >
                  {role.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
