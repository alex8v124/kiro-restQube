import React from 'react';
import { RoleId } from '../types/fen';
import {
  Compass,
  HandHeart,
  Layers,
  Radio,
  Settings2,
  Sparkles,
  Terminal,
  Truck,
  Zap,
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
  icon: React.ReactNode;
}> = [
  {
    id: 'solicitante',
    label: 'Pedir Ayuda',
    shortDesc: 'Reporte para albergues damnificados',
    icon: <Sparkles className="w-4 h-4 text-[#b080ff]" />,
  },
  {
    id: 'donante',
    label: 'Donar',
    shortDesc: 'Aportes directos con código de seguimiento',
    icon: <HandHeart className="w-4 h-4 text-[#80ffb5]" />,
  },
  {
    id: 'coordinador',
    label: 'Coordinación',
    shortDesc: 'Asignación prioritaria a albergues',
    icon: <Layers className="w-4 h-4 text-[#80f4ff]" />,
  },
  {
    id: 'logistico',
    label: 'Envíos y Ruta',
    shortDesc: 'Seguimiento de transporte y entrega',
    icon: <Truck className="w-4 h-4 text-[#ffcf99]" />,
  },
  {
    id: 'trazabilidad',
    label: 'Rastrear Ayuda',
    shortDesc: 'Consulta de entrega en tiempo real',
    icon: <Compass className="w-4 h-4 text-[#80ffb5]" />,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  onSelectRole,
  apiUrl,
  onOpenConfig,
  onToggleConsole,
  consoleCount,
}) => {
  const hasLiveLambda = Boolean(apiUrl && apiUrl.startsWith('http'));

  return (
    <header className="sticky top-0 z-40 border-b border-[#b080ff]/15 bg-[#0e0c14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3.5 gap-4">
          {/* Logo y Nombre Principal */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#8847ff] via-[#6d28d9] to-[#3b1d7a] shadow-[0_0_20px_rgba(136,71,255,0.4)] border border-[#e2d3fe]/30">
              <Radio className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#80ffb5] ring-2 ring-[#0e0c14]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg text-white">
                  Ayuda Trazable FEN
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#80ffb5]/15 text-[#80ffb5] border border-[#80ffb5]/30">
                  En Línea
                </span>
              </div>
              <p className="text-xs text-[#a59bb8]">
                Plataforma de Emergencia Humanitaria • Piura y Catacaos
              </p>
            </div>
          </div>

          {/* Menú de Roles / Navegación */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#14111d] p-1.5 rounded-xl border border-white/10">
            {ROLES_CONFIG.map((role) => {
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#8847ff] text-white shadow-[0_0_15px_rgba(136,71,255,0.4)] font-semibold'
                      : 'text-[#c4b8db] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {role.icon}
                  <span>{role.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Botones Discretos de Diagnóstico (Sin abrumar al usuario) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConfig}
              className="p-2 rounded-lg text-xs text-[#a59bb8] hover:text-white bg-[#14111d] border border-white/10 hover:border-[#b080ff]/40 transition cursor-pointer"
              title="Ajustes de Conexión"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleConsole}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#a59bb8] hover:text-white bg-[#14111d] border border-white/10 transition cursor-pointer"
              title="Registro de Actividad"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{consoleCount}</span>
            </button>
          </div>
        </div>

        {/* Navegación Móvil de Roles */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-white/5 no-scrollbar">
          {ROLES_CONFIG.map((role) => {
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#8847ff] text-white'
                    : 'bg-[#14111d] text-[#c4b8db]'
                }`}
              >
                {role.icon}
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
