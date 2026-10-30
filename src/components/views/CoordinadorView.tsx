import React, { useState } from 'react';
import {
  AsignacionItem,
  DonacionItem,
  NecesidadItem,
} from '../../types/fen';
import { apiCrearAsignacion } from '../../services/api';
import {
  CategoriaBadge,
  EstadoTrazabilidadBadge,
  PrioridadBadge,
  UrgenciaBadge,
} from '../ui/Badges';
import {
  ArrowRightLeft,
  CheckCircle2,
  Layers,
  Link2,
  Loader2,
  MapPin,
  Sparkles,
  Truck,
} from 'lucide-react';

interface CoordinadorViewProps {
  necesidades: NecesidadItem[];
  donaciones: DonacionItem[];
  asignaciones: AsignacionItem[];
  onRefresh: () => void;
  onInspectTracking: (trackingId: string) => void;
}

export const CoordinadorView: React.FC<CoordinadorViewProps> = ({
  necesidades,
  donaciones,
  asignaciones,
  onRefresh,
  onInspectTracking,
}) => {
  const necesidadesPendientes = [...necesidades].sort(
    (a, b) => a.prioridad_despacho - b.prioridad_despacho
  );

  const donacionesDisponibles = donaciones.filter(
    (d) => d.estado === 'REGISTRADO' || (d.estado as string) === 'ASIGNADO'
  );

  const [selectedNecId, setSelectedNecId] = useState<string>(
    necesidades.find((n) => n.estado === 'ABIERTA')?.id || necesidades[0]?.id || ''
  );
  const [selectedDonId, setSelectedDonId] = useState<string>(
    donaciones.find((d) => d.estado === 'REGISTRADO')?.id || donaciones[0]?.id || ''
  );
  const [coordinador, setCoordinador] = useState('Coordinación COER Piura — Turno Alfa');
  const [operadorLogistico, setOperadorLogistico] = useState(
    'Brigada INDECI Piura-Catacaos 04'
  );
  const [vehiculoPlaca, setVehiculoPlaca] = useState('EGF-891 (Camión 4x4 Cisterna/Carga)');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);

  const handleCreateAsignacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonId || !selectedNecId) return;
    setIsAssigning(true);
    setAssignMessage(null);
    try {
      const res = await apiCrearAsignacion({
        donacionId: selectedDonId,
        necesidadId: selectedNecId,
        coordinador,
        operadorLogistico,
        vehiculoPlaca,
      });
      if (!res.ok) {
        const detalle = (res.data as unknown as { error?: string })?.error || `HTTP ${res.status}`;
        setAssignMessage(`No se pudo crear la asignación: ${detalle}.`);
        return;
      }
      setAssignMessage(
        `Asignación ${res.data.id} creada exitosamente. Tracking ${res.data.tracking_id} vinculado al albergue ${res.data.albergueNombre}.`
      );
      onRefresh();
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mesa de Cruce Inteligente Donación -> Necesidad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cola Priorizada por Bedrock (7 cols) */}
        <div className="lg:col-span-7 kiro-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-blue-600">
                <Layers className="w-3.5 h-3.5" />
                Rol 03 • Centro de Operaciones COER Piura (Coordinador)
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Cola de Necesidades Priorizada por Bedrock (P1 → P3)
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-slate-200 text-xs font-mono text-slate-900">
              Ordenado por prioridad_despacho
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {necesidadesPendientes.map((nec) => {
              const isSelected = selectedNecId === nec.id;
              return (
                <div
                  key={nec.id}
                  onClick={() => setSelectedNecId(nec.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 border-[#b080ff] shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PrioridadBadge prioridad={nec.prioridad_despacho} />
                      <UrgenciaBadge urgencia={nec.urgencia} />
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {nec.albergueId}
                      </span>
                    </div>
                    <EstadoTrazabilidadBadge estado={nec.estado} />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mt-2">{nec.albergueNombre}</h4>
                  <p className="text-xs text-slate-700 mt-1">{nec.requerimientoResumen}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CategoriaBadge categoria={nec.categoria} />
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {nec.zona}
                      </span>
                    </div>
                    <span className="font-mono text-emerald-600">{nec.cantidad}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Vinculación POST /asignaciones (5 cols) */}
        <div className="lg:col-span-5 kiro-card rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                Vincular Donación → Necesidad
              </h3>
              <p className="text-xs text-slate-500">
                Asigna un lote con <code className="text-emerald-600">tracking_id</code> a un
                albergue priorizado y emite la orden de despacho.
              </p>
            </div>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-slate-200 text-[11px] font-mono text-slate-900">
              POST /asignaciones
            </span>
          </div>

          <form onSubmit={handleCreateAsignacion} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-900 mb-1">
                1. Necesidad Objetivo (Albergue Priorizado)
              </label>
              <select
                value={selectedNecId}
                onChange={(e) => setSelectedNecId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {necesidadesPendientes.map((n) => (
                  <option key={n.id} value={n.id}>
                    [P{n.prioridad_despacho} • {n.urgencia}] {n.albergueId} — {n.cantidad} ({n.estado})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-emerald-600 mb-1">
                2. Lote de Donación Disponible (tracking_id)
              </label>
              <select
                value={selectedDonId}
                onChange={(e) => setSelectedDonId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-emerald-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {donacionesDisponibles.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.tracking_id}] {d.descripcion.slice(0, 42)}... ({d.estado})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1">
                Oficial Coordinador COER Piura
              </label>
              <input
                type="text"
                value={coordinador}
                onChange={(e) => setCoordinador(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1">
                  Brigada Logística Asignada
                </label>
                <input
                  type="text"
                  value={operadorLogistico}
                  onChange={(e) => setOperadorLogistico(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1">
                  Unidad / Placa de Transporte
                </label>
                <input
                  type="text"
                  value={vehiculoPlaca}
                  onChange={(e) => setVehiculoPlaca(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {assignMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{assignMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAssigning}
              className="w-full kiro-glow-btn py-2.5 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAssigning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              Confirmar Asignación y Emitir Orden de Ruta
            </button>
          </form>
        </div>
      </div>

      {/* Tabla de Asignaciones Activas */}
      <div className="kiro-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Matriz de Asignaciones Activas ({asignaciones.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {asignaciones.map((asg) => (
            <div
              key={asg.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onInspectTracking(asg.tracking_id)}
                    className="font-mono text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {asg.tracking_id}
                  </button>
                  <EstadoTrazabilidadBadge estado={asg.estadoRuta} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5">{asg.albergueNombre}</h4>
                <p className="text-xs text-slate-700 mt-1">{asg.recurso}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-200 text-xs space-y-1 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{asg.operadorLogistico}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{asg.puntoControlActual}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
