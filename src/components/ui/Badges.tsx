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
  Truck,
  Zap,
} from 'lucide-react';

export const CategoriaBadge: React.FC<{ categoria: BedrockCategoria }> = ({ categoria }) => {
  const map: Record<
    BedrockCategoria,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    AGUA_SANEAMIENTO: {
      label: 'AGUA_SANEAMIENTO',
      color: 'bg-[#80f4ff]/10 text-[#80f4ff] border-[#80f4ff]/30',
      icon: <Droplets className="w-3.5 h-3.5" />,
    },
    ALIMENTOS_PERECIBLES: {
      label: 'ALIMENTOS_PERECIBLES',
      color: 'bg-[#ffcf99]/10 text-[#ffcf99] border-[#ffcf99]/30',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    SALUD_EPIDEMIAS: {
      label: 'SALUD_EPIDEMIAS',
      color: 'bg-[#ff80b5]/10 text-[#ff80b5] border-[#ff80b5]/30',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
    },
    ALBERGUE_TEMPORAL: {
      label: 'ALBERGUE_TEMPORAL',
      color: 'bg-[#b080ff]/12 text-[#d4b8ff] border-[#b080ff]/35',
      icon: <Home className="w-3.5 h-3.5" />,
    },
  };

  const item = map[categoria] || map.AGUA_SANEAMIENTO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${item.color}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
};

export const UrgenciaBadge: React.FC<{ urgencia: BedrockUrgencia }> = ({ urgencia }) => {
  const styles: Record<BedrockUrgencia, string> = {
    CRITICA:
      'bg-[#ff4d6d]/15 text-[#ff8096] border-[#ff4d6d]/40 shadow-[0_0_12px_rgba(255,77,109,0.2)]',
    ALTA: 'bg-[#ffcf99]/15 text-[#ffcf99] border-[#ffcf99]/40',
    MODERADA: 'bg-[#8dc8fb]/15 text-[#8dc8fb] border-[#8dc8fb]/35',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
        styles[urgencia] || styles.ALTA
      }`}
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      URGENCIA: {urgencia}
    </span>
  );
};

export const PrioridadBadge: React.FC<{ prioridad: PrioridadDespacho }> = ({ prioridad }) => {
  const colors: Record<PrioridadDespacho, string> = {
    1: 'bg-[#8847ff]/25 text-[#e2d3fe] border-[#b080ff]/50',
    2: 'bg-[#2a2338] text-[#c4b5fd] border-[#b080ff]/25',
    3: 'bg-[#1f1a29] text-[#9ca3af] border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
        colors[prioridad] || colors[2]
      }`}
    >
      <Zap className="w-3 h-3 text-[#b080ff]" />
      P{prioridad} (prioridad_despacho: {prioridad})
    </span>
  );
};

export const EstadoTrazabilidadBadge: React.FC<{ estado: EstadoTrazabilidad | string }> = ({
  estado,
}) => {
  const map: Record<string, { text: string; cls: string; icon: React.ReactNode }> = {
    REGISTRADO: {
      text: 'REGISTRADO',
      cls: 'bg-[#b080ff]/15 text-[#e2d3fe] border-[#b080ff]/35',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    ABIERTA: {
      text: 'ABIERTA',
      cls: 'bg-[#ff80b5]/15 text-[#ff80b5] border-[#ff80b5]/35',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    ASIGNADO: {
      text: 'ASIGNADO',
      cls: 'bg-[#ffcf99]/15 text-[#ffcf99] border-[#ffcf99]/35',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    ASIGNADA: {
      text: 'ASIGNADA',
      cls: 'bg-[#ffcf99]/15 text-[#ffcf99] border-[#ffcf99]/35',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    EN_RUTA: {
      text: 'EN RUTA',
      cls: 'bg-[#80f4ff]/15 text-[#80f4ff] border-[#80f4ff]/35',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    ENTREGADO: {
      text: 'ENTREGADO',
      cls: 'bg-[#80ffb5]/15 text-[#80ffb5] border-[#80ffb5]/35',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    ATENDIDA: {
      text: 'ATENDIDA',
      cls: 'bg-[#80ffb5]/15 text-[#80ffb5] border-[#80ffb5]/35',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  };

  const cfg = map[estado] || map.REGISTRADO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.text}
    </span>
  );
};
