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
      color: 'bg-[#80f4ff]/10 text-[#80f4ff] border-[#80f4ff]/30',
      icon: <Droplets className="w-3.5 h-3.5" />,
    },
    AGUA_SANEAMIENTO: {
      label: 'Agua y Saneamiento',
      color: 'bg-[#80f4ff]/10 text-[#80f4ff] border-[#80f4ff]/30',
      icon: <Droplets className="w-3.5 h-3.5" />,
    },
    ALIMENTOS: {
      label: 'Alimentos',
      color: 'bg-[#ffcf99]/10 text-[#ffcf99] border-[#ffcf99]/30',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    ALIMENTOS_PERECIBLES: {
      label: 'Alimentos',
      color: 'bg-[#ffcf99]/10 text-[#ffcf99] border-[#ffcf99]/30',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    MEDICINA: {
      label: 'Salud y Medicina',
      color: 'bg-[#ff80b5]/10 text-[#ff80b5] border-[#ff80b5]/30',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
    },
    SALUD_EPIDEMIAS: {
      label: 'Salud y Medicina',
      color: 'bg-[#ff80b5]/10 text-[#ff80b5] border-[#ff80b5]/30',
      icon: <HeartPulse className="w-3.5 h-3.5" />,
    },
    ABRIGO: {
      label: 'Refugio y Abrigo',
      color: 'bg-[#b080ff]/12 text-[#d4b8ff] border-[#b080ff]/35',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    ALBERGUE_TEMPORAL: {
      label: 'Refugio y Abrigo',
      color: 'bg-[#b080ff]/12 text-[#d4b8ff] border-[#b080ff]/35',
      icon: <Home className="w-3.5 h-3.5" />,
    },
  };

  const item = map[categoria] || map.AGUA;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${item.color}`}
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
    CRITICA: 'bg-[#ff3366]/20 text-[#ff8ba7] border-[#ff3366]/50',
    ALTA: 'bg-[#ff9900]/20 text-[#ffd180] border-[#ff9900]/40',
    MEDIA: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40',
    MODERADA: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40',
    BAJA: 'bg-white/10 text-[#a59bb8] border-white/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
        styles[urgencia] || styles.ALTA
      }`}
    >
      {isCritica ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff3366] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff3366]"></span>
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
    1: 'bg-[#8847ff]/20 text-[#e2d3fe] border-[#b080ff]/40',
    2: 'bg-[#2a2338] text-[#c4b5fd] border-[#b080ff]/25',
    3: 'bg-[#1f1a29] text-[#9ca3af] border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
        colors[prioridad] || colors[2]
      }`}
    >
      <Zap className="w-3 h-3 text-[#b080ff]" />
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
      cls: 'bg-[#b080ff]/15 text-[#e2d3fe] border-[#b080ff]/35',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    ABIERTA: {
      text: 'Pendiente',
      cls: 'bg-[#ff3366]/15 text-[#ff8ba7] border-[#ff3366]/40',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    ASIGNADO: {
      text: 'Asignado a Albergue',
      cls: 'bg-[#ff9900]/15 text-[#ffd180] border-[#ff9900]/35',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    ASIGNADA: {
      text: 'Asignado a Albergue',
      cls: 'bg-[#ff9900]/15 text-[#ffd180] border-[#ff9900]/35',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    EN_TRANSITO: {
      text: 'En Camino',
      cls: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    EN_RUTA: {
      text: 'En Camino',
      cls: 'bg-[#00c8ff]/15 text-[#80e5ff] border-[#00c8ff]/40',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    ENTREGADO: {
      text: 'Entregado con Éxito',
      cls: 'bg-[#00ff99]/15 text-[#80ffcc] border-[#00ff99]/40',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    ATENDIDA: {
      text: 'Atendido',
      cls: 'bg-[#00ff99]/15 text-[#80ffcc] border-[#00ff99]/40',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
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
