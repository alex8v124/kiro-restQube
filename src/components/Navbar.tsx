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
    <header className="sticky top-0 z-40 border-b border-[#b080ff]/20 bg-[#0e0c14]/90 backdrop-blur-2xl">
      {/* Emergency Crisis Status Ticker Bar */}
      <div className="bg-gradient-to-r from-[#ff3366]/20 via-[#8847ff]/20 to-[#00c8ff]/20 border-b border-[#ff3366]/30 px-4 py-1 text-[11px] font-mono text-[#ffccd7] flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3366] opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3366]"></span>
            </span>
            <span className="font-bold text-[#ff8ba7] uppercase tracking-wider">
              ALERTA ROJA FEN — PIURA &amp; CATACAOS
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[#e2d3fe]">Río Piura: 1,680 m³/s</span>
            <span className="text-white/30">•</span>
            <span className="text-[#80ffb5]">4 Albergues Activos</span>
            <span className="text-white/30">•</span>
            <span className="text-[#80f4ff]">Amazon Bedrock Claude 3 Haiku Online</span>
          </div>
          <div className="hidden lg:flex items-center gap-3 shrink-0 text-[10px] text-[#c4b8db]">
            <span className="px-1.5 py-0.2 rounded bg-black/40 border border-white/10">COER PIURA</span>
            <span className="px-1.5 py-0.2 rounded bg-black/40 border border-white/10">INDECI</span>
            <span className="text-[#80ffb5]">SLA &le; 12s</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Row: Brand + Kiro Spec Status + API Connection Pill */}
        <div className="flex flex-wrap items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3">
            {/* Kiro-inspired Ghost/Beacon Logo with Radar Pulse */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#9046ff] via-[#7138cc] to-[#3b1d7a] shadow-[0_0_30px_rgba(144,70,255,0.55)] border border-[#e2d3fe]/40">
              <div className="absolute inset-0 rounded-2xl border-2 border-[#b080ff]/40 animate-radar pointer-events-none" />
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#80ffb5] ring-2 ring-[#0e0c14] shadow-[0_0_10px_#80ffb5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">
                  FEN — Ayuda Trazable
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#8847ff]/20 text-[#e2d3fe] border border-[#b080ff]/40 shadow-[0_0_12px_rgba(176,128,255,0.2)]">
                  <Sparkles className="w-3 h-3 text-[#80f4ff]" />
                  AWS &amp; Kiro 2026
                </span>
              </div>
              <p className="text-xs text-[#c4b8db] flex items-center gap-2">
                <span>Emergencia El Niño • Piura &amp; Catacaos</span>
                <span className="text-[#b080ff]">•</span>
                <span className="font-mono text-[11px] text-[#80ffb5] font-semibold">
                  team: {teamId}
                </span>
              </p>
            </div>
          </div>

          {/* Right Controls: Lambda URL Status + Console + Config */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenConfig}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono border border-[#b080ff]/30 bg-[#191424] hover:bg-[#251f33] hover:border-[#b080ff]/60 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)] cursor-pointer"
              title="Configurar VITE_API_URL (Lambda Function URL) y Team ID"
            >
              <span className="relative flex h-2.5 w-2.5">
                {hasLiveLambda && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#80ffb5] opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    hasLiveLambda
                      ? 'bg-[#80ffb5] shadow-[0_0_10px_#80ffb5]'
                      : 'bg-[#ffcf99] shadow-[0_0_10px_#ffcf99]'
                  }`}
                />
              </span>
              <span className="text-[#f2eefc] max-w-[170px] sm:max-w-[220px] truncate font-medium">
                {hasLiveLambda ? apiUrl.replace(/^https?:\/\//, '') : 'API: Híbrido / Local'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  hasLiveLambda
                    ? 'bg-[#80ffb5]/20 text-[#80ffb5] border border-[#80ffb5]/40'
                    : 'bg-[#b080ff]/20 text-[#e2d3fe] border border-[#b080ff]/30'
                }`}
              >
                {hasLiveLambda ? 'LIVE AWS' : mode}
              </span>
              <Settings2 className="w-3.5 h-3.5 text-[#b080ff]" />
            </button>

            <button
              onClick={onToggleConsole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border border-[#80f4ff]/35 bg-[#141a24] text-[#80f4ff] hover:bg-[#1a2333] hover:border-[#80f4ff]/60 transition-all shadow-[0_0_16px_rgba(128,244,255,0.15)] cursor-pointer"
              title="Abrir Inspector de Tráfico HTTP de Kiro"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-semibold">HTTP Logs</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#80f4ff]/25 text-[#80f4ff] text-[10px] font-bold">
                {consoleCount}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Role Navigation Bar (5 Roles + Trazabilidad) */}
        <div className="relative border-t border-white/10">
          <nav
            aria-label="Selector de rol operativo"
            className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#a59bb8] mr-1 shrink-0 flex items-center gap-1 font-semibold">
              <SearchCode className="w-3.5 h-3.5 text-[#b080ff]" />
              Vista por Rol:
            </span>
            {ROLES_CONFIG.map((role) => {
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8847ff] via-[#7c3aed] to-[#6d28d9] text-white shadow-[0_0_24px_rgba(136,71,255,0.45)] border border-[#e2d3fe]/40 scale-[1.02]'
                      : 'bg-[#181322]/90 text-[#c4b8db] hover:text-white hover:bg-[#251f33] border border-white/5 hover:border-[#b080ff]/30'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#b080ff]'}>{role.icon}</span>
                  <span>{role.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isActive
                        ? 'bg-black/35 text-[#80ffb5] font-bold shadow-inner'
                        : 'bg-[#261f33] text-[#a59bb8] group-hover:text-[#e2d3fe]'
                    }`}
                  >
                    {role.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
