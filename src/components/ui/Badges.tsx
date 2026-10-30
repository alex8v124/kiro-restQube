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
    BedrockCategoria,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    AGUA: {
      label: 'AGUA',
      color: 'bg-[#80f4ff]/10 text-[#80f4ff] border-[#80f4ff]/30',
      icon: <Droplets className="w-3.5 h-3.5" />,
    },
    AGUA_SANEAMIENTO: {
      label: 'AGUA_SANEAMIENTO',
      color: 'bg-[#80f4ff]/10 text-[#80f4ff] border-[#80f4ff]/30',
      icon: <Droplets className="w-3.5 h-3.5" />,
    },
    ALIMENTOS: {
      label: 'ALIMENTOS',
      color: 'bg-[#ffcf99]/10 text-[#ffcf99] border-[#ffcf99]/30',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    ALIMENTOS_PERECIBLES: {
      label: 'ALIMENTOS_PERECIBLES',
      color: 'bg-[#ffcf99]/10 text-[#ffcf99] border-[#ffcf99]/30',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    MEDICINA: {
      label: 'MEDICINA',
      color: 'bg-[#ff80b5]/10 text-[#ff80b5] border-[#ff80b5]/30',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
    },
    SALUD_EPIDEMIAS: {
      label: 'SALUD_EPIDEMIAS',
      color: 'bg-[#ff80b5]/10 text-[#ff80b5] border-[#ff80b5]/30',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
    },
    ABRIGO: {
      label: 'ABRIGO',
      color: 'bg-[#b080ff]/12 text-[#d4b8ff] border-[#b080ff]/35',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    ALBERGUE_TEMPORAL: {
      label: 'ALBERGUE_TEMPORAL',
      color: 'bg-[#b080ff]/12 text-[#d4b8ff] border-[#b080ff]/35',
      icon: <Home className="w-3.5 h-3.5" />,
    },
  };

  const item = map[categoria] || map.AGUA;

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
    MEDIA: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40',
    MODERADA: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40',
    BAJA: 'bg-white/10 text-[#a59bb8] border-white/20',
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
    1: 'bg-[#8847ff]/25 text-[#e2d3fe] border-[#b080ff]/50 shadow-[0_0_14px_rgba(136,71,255,0.25)]',
    2: 'bg-[#2a2338] text-[#c4b5fd] border-[#b080ff]/25',
    3: 'bg-[#1f1a29] text-[#9ca3af] border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
        colors[prioridad] || colors[2]
      }`}
    >
      <Zap className="w-3.5 h-3.5 text-[#b080ff]" />
      P{prioridad} (prioridad_despacho: {prioridad})
    </span>
  );
};

export const EstadoTrazabilidadBadge: React.FC<{ estado: EstadoTrazabilidad | string }> = ({
  estado,
}) => {
  const map: Record<string, { text: string; cls: string; icon: React.ReactNode; pulse?: boolean }> = {
    REGISTRADO: {
      text: 'REGISTRADO',
      cls: 'bg-[#b080ff]/15 text-[#e2d3fe] border-[#b080ff]/35',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    ABIERTA: {
      text: 'ABIERTA',
      cls: 'bg-[#ff3366]/15 text-[#ff8ba7] border-[#ff3366]/40 shadow-[0_0_10px_rgba(255,51,102,0.2)]',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      pulse: true,
    },
    ASIGNADO: {
      text: 'ASIGNADO',
      cls: 'bg-[#ff9900]/15 text-[#ffd180] border-[#ff9900]/35',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    ASIGNADA: {
      text: 'ASIGNADA',
      cls: 'bg-[#ff9900]/15 text-[#ffd180] border-[#ff9900]/35',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    EN_TRANSITO: {
      text: 'EN TRÁNSITO',
      cls: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40 shadow-[0_0_12px_rgba(0,200,255,0.2)]',
      icon: <Truck className="w-3.5 h-3.5" />,
      pulse: true,
    },
    EN_RUTA: {
      text: 'EN RUTA',
      cls: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40 shadow-[0_0_12px_rgba(0,200,255,0.2)]',
      icon: <Truck className="w-3.5 h-3.5" />,
      pulse: true,
    },
    ENTREGADO: {
      text: 'ENTREGADO',
      cls: 'bg-[#00ff99]/15 text-[#80ffcc] border-[#00ff99]/40 shadow-[0_0_12px_rgba(0,255,153,0.2)]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    ATENDIDA: {
      text: 'ATENDIDA',
      cls: 'bg-[#00ff99]/15 text-[#80ffcc] border-[#00ff99]/40 shadow-[0_0_12px_rgba(0,255,153,0.2)]',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  };

  const cfg = map[estado] || map.REGISTRADO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${cfg.cls}`}
    >
      {cfg.pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      )}
      {cfg.icon}
      {cfg.text}
    </span>
  );
};
