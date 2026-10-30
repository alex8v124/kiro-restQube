import React from 'react';
import {
  BedrockCategoria,
  BedrockUrgencia,
  EstadoTrazabilidad,
  PrioridadDespacho,
} from '../../types/fen';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Home,
  Package,
  Shield,
  Truck,
  Zap,
} from 'lucide-react';

export const CategoriaBadge: React.FC<{ categoria: BedrockCategoria }> = ({ categoria }) => {
  const map: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    AGUA: {
      label: 'Agua Potable',
      color: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: <Droplets className="w-3.5 h-3.5 text-sky-600" />,
    },
    AGUA_SANEAMIENTO: {
      label: 'Agua y Saneamiento',
      color: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: <Droplets className="w-3.5 h-3.5 text-sky-600" />,
    },
    ALIMENTOS: {
      label: 'Alimentos',
      color: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: <Package className="w-3.5 h-3.5 text-amber-600" />,
    },
    ALIMENTOS_PERECIBLES: {
      label: 'Alimentos',
      color: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: <Package className="w-3.5 h-3.5 text-amber-600" />,
    },
    MEDICINA: {
      label: 'Salud y Medicina',
      color: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-600" />,
    },
    SALUD_EPIDEMIAS: {
      label: 'Salud y Medicina',
      color: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-600" />,
    },
    ABRIGO: {
      label: 'Refugio y Abrigo',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: <Shield className="w-3.5 h-3.5 text-indigo-600" />,
    },
    ALBERGUE_TEMPORAL: {
      label: 'Refugio y Abrigo',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: <Home className="w-3.5 h-3.5 text-indigo-600" />,
    },
  };

  const item = map[categoria] || map.AGUA;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${item.color}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
};

export const UrgenciaBadge: React.FC<{ urgencia: BedrockUrgencia }> = ({ urgencia }) => {
  const isCritica = urgencia === 'CRITICA';
  const labels: Record<string, string> = {
    CRITICA: 'Urgencia Crítica',
    ALTA: 'Prioridad Alta',
    MEDIA: 'Prioridad Moderada',
    MODERADA: 'Prioridad Moderada',
    BAJA: 'Atención General',
  };

  const styles: Record<string, string> = {
    CRITICA: 'bg-red-50 text-red-700 border-red-200',
    ALTA: 'bg-orange-50 text-orange-700 border-orange-200',
    MEDIA: 'bg-blue-50 text-blue-700 border-blue-200',
    MODERADA: 'bg-blue-50 text-blue-700 border-blue-200',
    BAJA: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
        styles[urgencia] || styles.ALTA
      }`}
    >
      {isCritica ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
      ) : (
        <AlertTriangle className="w-3 h-3 shrink-0" />
      )}
      {labels[urgencia] || 'Atención Requerida'}
    </span>
  );
};

export const PrioridadBadge: React.FC<{ prioridad: PrioridadDespacho }> = ({ prioridad }) => {
  const labels: Record<PrioridadDespacho, string> = {
    1: 'Despacho Inmediato',
    2: 'Despacho Prioritario',
    3: 'Despacho Programado',
  };

  const colors: Record<PrioridadDespacho, string> = {
    1: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    2: 'bg-slate-100 text-slate-700 border-slate-200',
    3: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
        colors[prioridad] || colors[2]
      }`}
    >
      <Zap className="w-3 h-3 text-blue-600" />
      {labels[prioridad] || 'Prioritario'}
    </span>
  );
};

export const EstadoTrazabilidadBadge: React.FC<{ estado: EstadoTrazabilidad | string }> = ({
  estado,
}) => {
  const map: Record<string, { text: string; cls: string; icon: React.ReactNode }> = {
    REGISTRADO: {
      text: 'Registrado',
      cls: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <Package className="w-3.5 h-3.5 text-slate-500" />,
    },
    ABIERTA: {
      text: 'Pendiente',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    },
    ASIGNADO: {
      text: 'Asignado a Albergue',
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Zap className="w-3.5 h-3.5 text-blue-500" />,
    },
    ASIGNADA: {
      text: 'Asignado a Albergue',
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Zap className="w-3.5 h-3.5 text-blue-500" />,
    },
    EN_TRANSITO: {
      text: 'En Camino a Destino',
      cls: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
      icon: <Truck className="w-3.5 h-3.5 text-blue-600" />,
    },
    EN_RUTA: {
      text: 'En Camino a Destino',
      cls: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
      icon: <Truck className="w-3.5 h-3.5 text-blue-600" />,
    },
    ENTREGADO: {
      text: 'Entregado con Éxito',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    ATENDIDA: {
      text: 'Atendido',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
  };

  const cfg = map[estado] || map.REGISTRADO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.text}
    </span>
  );
};
