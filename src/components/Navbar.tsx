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
    icon: <Sparkles className="w-4 h-4 text-blue-600" />,
  },
  {
    id: 'donante',
    label: 'Donar',
    shortDesc: 'Aportes directos con código de seguimiento',
    icon: <HandHeart className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'coordinador',
    label: 'Coordinación',
    shortDesc: 'Asignación prioritaria a albergues',
    icon: <Layers className="w-4 h-4 text-indigo-600" />,
  },
  {
    id: 'logistico',
    label: 'Envíos y Ruta',
    shortDesc: 'Seguimiento de transporte y entrega',
    icon: <Truck className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'trazabilidad',
    label: 'Rastrear Ayuda',
    shortDesc: 'Consulta de entrega en tiempo real',
    icon: <Compass className="w-4 h-4 text-blue-600" />,
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3.5 gap-4">
          {/* Logo y Nombre Principal */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white shadow-sm">
              <Radio className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg text-slate-900">
                  Ayuda Trazable FEN
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  En Línea
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Plataforma de Emergencia Humanitaria • Piura y Catacaos
              </p>
            </div>
          </div>

          {/* Menú de Roles / Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70">
            {ROLES_CONFIG.map((role) => {
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {role.icon}
                  <span>{role.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Botones de Diagnóstico */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenConfig}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              title="Ajustes de Conexión"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleConsole}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              title="Registro de Actividad"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>{consoleCount}</span>
            </button>
          </div>
        </div>

        {/* Navegación Móvil de Roles */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 no-scrollbar">
          {ROLES_CONFIG.map((role) => {
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600'
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
