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
    (d) => d.estado === 'REGISTRADO' || d.estado === 'ASIGNADO'
  );

  const [selectedNecId, setSelectedNecId] = useState<string>(
    necesidades.find((n) => n.estado === 'ABIERTA')?.id || necesidades[0]?.id || ''
  );
  const [selectedDonId, setSelectedDonId] = useState<string>(
    donaciones.find((d) => d.estado === 'REGISTRADO')?.id || donaciones[0]?.id || ''
  );
  const [coordinador, setCoordinador] = useState('Ing. M. Seminario (COER Piura — Turno Alfa)');
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
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#b080ff]">
                <Layers className="w-3.5 h-3.5" />
                Rol 03 • Centro de Operaciones COER Piura (Coordinador)
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Cola de Necesidades Priorizada por Bedrock (P1 → P3)
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#b080ff]/15 border border-[#b080ff]/30 text-xs font-mono text-[#e2d3fe]">
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
                      ? 'bg-[#211a30] border-[#b080ff] shadow-[0_0_20px_rgba(176,128,255,0.2)]'
                      : 'bg-[#14111d] border-white/10 hover:border-[#b080ff]/35'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <PrioridadBadge prioridad={nec.prioridad_despacho} />
                      <UrgenciaBadge urgencia={nec.urgencia} />
                      <span className="font-mono text-xs font-bold text-white">
                        {nec.albergueId}
                      </span>
                    </div>
                    <EstadoTrazabilidadBadge estado={nec.estado} />
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2">{nec.albergueNombre}</h4>
                  <p className="text-xs text-[#c4b8db] mt-1">{nec.requerimientoResumen}</p>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CategoriaBadge categoria={nec.categoria} />
                      <span className="text-[#a59bb8] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#b080ff]" />
                        {nec.zona}
                      </span>
                    </div>
                    <span className="font-mono text-[#80ffb5]">{nec.cantidad}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Vinculación POST /asignaciones (5 cols) */}
        <div className="lg:col-span-5 kiro-card rounded-2xl p-6 border border-[#b080ff]/35">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#b080ff]" />
                Vincular Donación → Necesidad
              </h3>
              <p className="text-xs text-[#a59bb8]">
                Asigna un lote con <code className="text-[#80ffb5]">tracking_id</code> a un
                albergue priorizado y emite la orden de despacho.
              </p>
            </div>
            <span className="px-2 py-1 rounded bg-[#b080ff]/15 border border-[#b080ff]/30 text-[11px] font-mono text-[#e2d3fe]">
              POST /asignaciones
            </span>
          </div>

          <form onSubmit={handleCreateAsignacion} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#e2d3fe] mb-1">
                1. Necesidad Objetivo (Albergue Priorizado)
              </label>
              <select
                value={selectedNecId}
                onChange={(e) => setSelectedNecId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#110e17] border border-[#b080ff]/35 text-xs font-mono text-white focus:outline-none focus:border-[#b080ff]"
              >
                {necesidadesPendientes.map((n) => (
                  <option key={n.id} value={n.id}>
                    [P{n.prioridad_despacho} • {n.urgencia}] {n.albergueId} — {n.cantidad} ({n.estado})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#80ffb5] mb-1">
                2. Lote de Donación Disponible (tracking_id)
              </label>
              <select
                value={selectedDonId}
                onChange={(e) => setSelectedDonId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#110e17] border border-[#80ffb5]/35 text-xs font-mono text-white focus:outline-none focus:border-[#80ffb5]"
              >
                {donacionesDisponibles.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.tracking_id}] {d.descripcion.slice(0, 42)}... ({d.estado})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                Oficial Coordinador COER Piura
              </label>
              <input
                type="text"
                value={coordinador}
                onChange={(e) => setCoordinador(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Brigada Logística Asignada
                </label>
                <input
                  type="text"
                  value={operadorLogistico}
                  onChange={(e) => setOperadorLogistico(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-xs text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Unidad / Placa de Transporte
                </label>
                <input
                  type="text"
                  value={vehiculoPlaca}
                  onChange={(e) => setVehiculoPlaca(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>
            </div>

            {assignMessage && (
              <div className="p-3 rounded-xl bg-[#80ffb5]/12 border border-[#80ffb5]/35 text-xs text-[#80ffb5] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{assignMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAssigning}
              className="w-full kiro-glow-btn py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
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
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#b080ff]" />
          Matriz de Asignaciones Activas ({asignaciones.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {asignaciones.map((asg) => (
            <div
              key={asg.id}
              className="p-4 rounded-xl bg-[#14111d] border border-white/10 space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onInspectTracking(asg.tracking_id)}
                    className="font-mono text-xs font-bold text-[#80ffb5] hover:underline cursor-pointer"
                  >
                    {asg.tracking_id}
                  </button>
                  <EstadoTrazabilidadBadge estado={asg.estadoRuta} />
                </div>
                <h4 className="text-sm font-bold text-white mt-1.5">{asg.albergueNombre}</h4>
                <p className="text-xs text-[#c4b8db] mt-1">{asg.recurso}</p>
              </div>

              <div className="pt-2.5 border-t border-white/10 text-xs space-y-1 text-[#a59bb8]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#80f4ff]" />
                  <span className="truncate">{asg.operadorLogistico}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#b080ff]" />
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
