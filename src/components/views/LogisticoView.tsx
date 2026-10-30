import React, { useState } from 'react';
import { AsignacionItem, EstadoTrazabilidad } from '../../types/fen';
import { apiActualizarEntrega } from '../../services/api';
import {
  CategoriaBadge,
  EstadoTrazabilidadBadge,
  PrioridadBadge,
  UrgenciaBadge,
} from '../ui/Badges';
import {
  CheckCircle2,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface LogisticoViewProps {
  asignaciones: AsignacionItem[];
  onRefresh: () => void;
  onInspectTracking: (trackingId: string) => void;
}

const PUNTOS_CONTROL_PIURA_CATACAOS = [
  'Salida Almacén Adelantado COER Piura (Zona Industrial)',
  'Cruzando Puente Independencia — Vía Piura-Catacaos Km 8',
  'Punto de Control Policial Monte Sullón — Catacaos',
  'Desvío Bajo Piura — Sector Pedregal / Cura Mori',
  'Arribo verificado en Albergue Destino — Acta firmada',
];

export const LogisticoView: React.FC<LogisticoViewProps> = ({
  asignaciones,
  onRefresh,
  onInspectTracking,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [customCheckpoint, setCustomCheckpoint] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const handleUpdateRoute = async (
    asg: AsignacionItem,
    nuevoEstado: EstadoTrazabilidad
  ) => {
    setLoadingId(`${asg.id}-${nuevoEstado}`);
    setBanner(null);
    const defaultPoint =
      nuevoEstado === 'EN_RUTA'
        ? 'Cruzando Puente Independencia — Corredor Humanitario Piura-Catacaos'
        : nuevoEstado === 'ENTREGADO'
          ? `Entregado con acta de conformidad en ${asg.albergueNombre}`
          : 'Orden de carga validada en almacén COER Piura';

    const checkpoint = customCheckpoint[asg.id]?.trim() || defaultPoint;

    try {
      await apiActualizarEntrega({
        asignacionId: asg.id,
        nuevoEstado,
        puntoControlActual: checkpoint,
      });
      setBanner(
        `Despacho ${asg.tracking_id} actualizado a estado ${nuevoEstado} (${checkpoint}).`
      );
      onRefresh();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="kiro-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-blue-600">
              <Truck className="w-3.5 h-3.5" />
              Rol 04 • Operador Logístico y Brigadas de Ruta (INDECI / COER)
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Control de Convoyes, Estados de Ruta y Confirmación de Entregas
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono text-blue-600">
            POST /entregas
          </span>
        </div>

        {banner && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{banner}</span>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {asignaciones.map((asg) => {
            const isDelivered = asg.estadoRuta === 'ENTREGADO';
            return (
              <div
                key={asg.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-200 transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-slate-900 border border-slate-200 font-bold">
                      {asg.id}
                    </span>
                    <button
                      onClick={() => onInspectTracking(asg.tracking_id)}
                      className="font-mono text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      {asg.tracking_id}
                    </button>
                    <PrioridadBadge prioridad={asg.prioridad_despacho} />
                    <UrgenciaBadge urgencia={asg.urgencia} />
                    <CategoriaBadge categoria={asg.categoria} />
                  </div>

                  <EstadoTrazabilidadBadge estado={asg.estadoRuta} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-slate-500">
                      Albergue Destino
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {asg.albergueNombre}
                    </div>
                    <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {asg.zona}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono uppercase text-slate-500">
                      Carga Humanitaria Auditada
                    </div>
                    <div className="text-sm font-medium text-slate-900 mt-0.5">{asg.recurso}</div>
                    <div className="text-xs font-mono text-emerald-600 mt-0.5">
                      Cantidad: {asg.cantidad}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono uppercase text-slate-500">
                      Unidad &amp; Último Punto de Control
                    </div>
                    <div className="text-xs font-mono text-blue-600 mt-0.5">
                      {asg.vehiculoPlaca} • {asg.operadorLogistico}
                    </div>
                    <div className="text-xs text-slate-900 mt-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                      📍 {asg.puntoControlActual}
                    </div>
                  </div>
                </div>

                {/* Visual Route Stage Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5">
                    <span>Línea de Despacho Humanitario:</span>
                    <span className="text-blue-600 font-semibold">{asg.estadoRuta}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'REGISTRADO', label: '1. Registrado' },
                      { key: 'ASIGNADO', label: '2. Asignado' },
                      { key: 'EN_RUTA', label: '3. En Ruta FEN' },
                      { key: 'ENTREGADO', label: '4. Conforme' },
                    ].map((step, idx) => {
                      const stages = ['REGISTRADO', 'ASIGNADO', 'EN_RUTA', 'ENTREGADO'];
                      const currentIdx = stages.indexOf(asg.estadoRuta);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div
                          key={step.key}
                          className={`p-2 rounded-xl text-center text-xs font-mono transition-all border ${
                            isCurrent
                              ? 'bg-blue-600 text-slate-900 border-[#b080ff] text-slate-900 shadow-sm'
                              : isComplete
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            {isComplete && !isCurrent && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-50 text-blue-700 animate-ping" />}
                            <span className="font-semibold truncate">{step.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Controles para avanzar estado de ruta */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                    <select
                      value={customCheckpoint[asg.id] || ''}
                      onChange={(e) =>
                        setCustomCheckpoint((prev) => ({
                          ...prev,
                          [asg.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Seleccionar punto de control en corredor Piura / Catacaos...
                      </option>
                      {PUNTOS_CONTROL_PIURA_CATACAOS.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={loadingId !== null}
                      onClick={() => handleUpdateRoute(asg, 'EN_RUTA')}
                      className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-blue-50 text-blue-700 hover:bg-blue-50 text-blue-700 text-blue-600 border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      {loadingId === `${asg.id}-EN_RUTA` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Truck className="w-3.5 h-3.5" />
                      )}
                      Marcar EN RUTA
                    </button>

                    <button
                      type="button"
                      disabled={loadingId !== null || isDelivered}
                      onClick={() => handleUpdateRoute(asg, 'ENTREGADO')}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700 text-emerald-600/60 border border-emerald-200 cursor-not-allowed'
                          : 'kiro-glow-btn text-slate-900'
                      }`}
                    >
                      {loadingId === `${asg.id}-ENTREGADO` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isDelivered ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <PackageCheck className="w-3.5 h-3.5" />
                      )}
                      {isDelivered ? 'Entrega Completada' : 'Confirmar ENTREGA en Albergue'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
