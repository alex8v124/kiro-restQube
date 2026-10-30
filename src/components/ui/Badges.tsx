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
  const isCritica = urgencia === 'CRITICA';
  const styles: Record<BedrockUrgencia, string> = {
    CRITICA:
      'bg-[#ff3366]/20 text-[#ff8ba7] border-[#ff3366]/60 shadow-[0_0_16px_rgba(255,51,102,0.35)]',
    ALTA: 'bg-[#ff9900]/20 text-[#ffd180] border-[#ff9900]/50 shadow-[0_0_12px_rgba(255,153,0,0.2)]',
    MODERADA: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-bold border tracking-wide ${
        styles[urgencia] || styles.ALTA
      }`}
    >
      {isCritica ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3366] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3366]"></span>
        </span>
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      )}
      URGENCIA: {urgencia}
    </span>
  );
};

export const PrioridadBadge: React.FC<{ prioridad: PrioridadDespacho }> = ({ prioridad }) => {
  const colors: Record<PrioridadDespacho, string> = {
    1: 'bg-gradient-to-r from-[#8847ff]/30 to-[#b080ff]/20 text-[#f3e8ff] border-[#b080ff]/60 shadow-[0_0_12px_rgba(136,71,255,0.3)]',
    2: 'bg-[#292238] text-[#d8b4fe] border-[#b080ff]/30',
    3: 'bg-[#1c1826] text-[#a59bb8] border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
        colors[prioridad] || colors[2]
      }`}
    >
      <Zap className="w-3.5 h-3.5 text-[#b080ff] shrink-0" />
      <span>P{prioridad}</span>
      <span className="text-[10px] opacity-75 font-normal">(prioridad_despacho: {prioridad})</span>
    </span>
  );
};

export const EstadoTrazabilidadBadge: React.FC<{ estado: EstadoTrazabilidad | string }> = ({
  estado,
}) => {
  const map: Record<string, { text: string; cls: string; icon: React.ReactNode; isLive?: boolean }> = {
    REGISTRADO: {
      text: 'REGISTRADO',
      cls: 'bg-[#b080ff]/15 text-[#e2d3fe] border-[#b080ff]/40',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    ABIERTA: {
      text: 'ABIERTA',
      cls: 'bg-[#ff80b5]/15 text-[#ff80b5] border-[#ff80b5]/40',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    ASIGNADO: {
      text: 'ASIGNADO',
      cls: 'bg-[#ffcf99]/20 text-[#ffd9a3] border-[#ffcf99]/40',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    ASIGNADA: {
      text: 'ASIGNADA',
      cls: 'bg-[#ffcf99]/20 text-[#ffd9a3] border-[#ffcf99]/40',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    EN_RUTA: {
      text: 'EN RUTA',
      cls: 'bg-[#80f4ff]/20 text-[#80f4ff] border-[#80f4ff]/50 shadow-[0_0_14px_rgba(128,244,255,0.25)]',
      icon: <Truck className="w-3.5 h-3.5 animate-pulse" />,
      isLive: true,
    },
    ENTREGADO: {
      text: 'ENTREGADO',
      cls: 'bg-[#80ffb5]/20 text-[#80ffb5] border-[#80ffb5]/50 shadow-[0_0_14px_rgba(128,255,181,0.2)]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    ATENDIDA: {
      text: 'ATENDIDA',
      cls: 'bg-[#80ffb5]/20 text-[#80ffb5] border-[#80ffb5]/50 shadow-[0_0_14px_rgba(128,255,181,0.2)]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  };

  const cfg = map[estado] || map.REGISTRADO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border tracking-wide ${cfg.cls}`}
    >
      {cfg.isLive && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#80f4ff] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#80f4ff]"></span>
        </span>
      )}
      {cfg.icon}
      {cfg.text}
    </span>
  );
};
