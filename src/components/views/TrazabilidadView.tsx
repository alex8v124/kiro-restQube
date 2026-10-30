import React, { useEffect, useState } from 'react';
import { TrazabilidadDetalle } from '../../types/fen';
import { apiGetTrazabilidad, getAllTrackingIds } from '../../services/api';
import {
  CategoriaBadge,
  EstadoTrazabilidadBadge,
  PrioridadBadge,
  UrgenciaBadge,
} from '../ui/Badges';
import {
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Hash,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react';

interface TrazabilidadViewProps {
  initialTrackingId: string;
}

export const TrazabilidadView: React.FC<TrazabilidadViewProps> = ({
  initialTrackingId,
}) => {
  const [searchId, setSearchId] = useState(initialTrackingId || 'TRK-FEN-2026');
  const [detalle, setDetalle] = useState<TrazabilidadDetalle | null>(null);
  const [loading, setLoading] = useState(false);

  const availableIds = getAllTrackingIds();

  const loadTracking = async (idToFetch: string) => {
    setLoading(true);
    try {
      const res = await apiGetTrazabilidad(idToFetch);
      setDetalle(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      setSearchId(initialTrackingId);
      loadTracking(initialTrackingId);
    } else {
      loadTracking('TRK-FEN-2026');
    }
  }, [initialTrackingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    loadTracking(searchId);
  };

  return (
    <div className="space-y-6">
      {/* Buscador superior de tracking_id */}
      <div className="kiro-card rounded-2xl p-6 border border-[#b080ff]/35">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#80ffb5]">
              <Compass className="w-3.5 h-3.5" />
              Vista Común de Auditoría Ciudadana • /trazabilidad
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Rastreador en Tiempo Real por Código <code className="text-[#80ffb5]">tracking_id</code>
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-[#80ffb5]/15 border border-[#80ffb5]/30 text-xs font-mono text-[#80ffb5]">
            GET /trazabilidad
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#b080ff] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ingresa tu tracking_id (ej. TRK-FEN-2026)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#110e17] border border-[#b080ff]/35 text-sm font-mono text-white focus:outline-none focus:border-[#80ffb5]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="kiro-glow-btn px-6 py-2.5 rounded-xl text-xs font-mono font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Consultar Cadena de Custodia
          </button>
        </form>

        {/* Chips de códigos activos para demostración */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#a59bb8]">Códigos activos en Piura / Catacaos:</span>
          {availableIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchId(id);
                loadTracking(id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
                detalle?.tracking_id === id
                  ? 'bg-[#80ffb5]/20 text-[#80ffb5] border-[#80ffb5]/50 font-bold'
                  : 'bg-[#171321] text-[#c4b8db] border-white/10 hover:border-[#b080ff]/40'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado de Trazabilidad y Línea de Tiempo de 4 Etapas */}
      {detalle && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Resumen del Envío y Clasificación Bedrock (4 cols) */}
          <div className="lg:col-span-4 kiro-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="text-[11px] font-mono uppercase text-[#9589ab]">
                  Código Auditado
                </div>
                <div className="text-lg font-mono font-bold text-[#80ffb5]">
                  {detalle.tracking_id}
                </div>
              </div>
              <EstadoTrazabilidadBadge estado={detalle.estadoActual} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10">
                <div className="text-[#9589ab] font-mono uppercase text-[10px]">
                  Donante Registrado
                </div>
                <div className="text-white font-semibold mt-0.5">{detalle.donante}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10">
                <div className="text-[#9589ab] font-mono uppercase text-[10px]">
                  Recurso &amp; Volumen
                </div>
                <div className="text-white font-semibold mt-0.5">{detalle.recurso}</div>
                <div className="text-[#80ffb5] font-mono mt-0.5">{detalle.cantidad}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10">
                <div className="text-[#9589ab] font-mono uppercase text-[10px]">
                  Albergue &amp; Zona Destino
                </div>
                <div className="text-white font-semibold mt-0.5">{detalle.albergueDestino}</div>
                <div className="text-[#b080ff] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {detalle.zona}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-[#b080ff]/25 space-y-2">
                <div className="text-[#e2d3fe] font-mono uppercase text-[10px] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#b080ff]" />
                  Priorización Amazon Bedrock Asociada
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <CategoriaBadge categoria={detalle.clasificacionBedrock.categoria} />
                  <UrgenciaBadge urgencia={detalle.clasificacionBedrock.urgencia} />
                  <PrioridadBadge prioridad={detalle.clasificacionBedrock.prioridad_despacho} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10 space-y-1">
                <div className="text-[#9589ab] font-mono uppercase text-[10px]">
                  Convoy &amp; Operador Logístico
                </div>
                <div className="text-[#80f4ff] font-mono flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {detalle.vehiculo}
                </div>
                <div className="text-[#c4b8db]">{detalle.operadorLogistico}</div>
              </div>
            </div>
          </div>

          {/* Línea de Tiempo de 4 Etapas (8 cols) */}
          <div className="lg:col-span-8 kiro-card rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#80ffb5]" />
                  Línea de Tiempo de Custodia Humanitaria (4 Etapas)
                </h3>
                <p className="text-xs text-[#a59bb8]">
                  Donación registrada → Asignada → En ruta → Entregada en Albergue
                </p>
              </div>
            </div>

            <div className="mt-6 relative pl-6 border-l-2 border-[#b080ff]/30 space-y-6">
              {detalle.eventos.map((ev) => (
                <div key={ev.etapa} className="relative">
                  {/* Nodo circular */}
                  <span
                    className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      ev.completado
                        ? 'bg-[#80ffb5] border-[#0e0c14] shadow-[0_0_12px_#80ffb5]'
                        : 'bg-[#1e1929] border-[#6b6080]'
                    }`}
                  />

                  <div
                    className={`p-4 rounded-2xl border transition ${
                      ev.activo
                        ? 'bg-[#221a33] border-[#b080ff] shadow-[0_0_24px_rgba(176,128,255,0.2)]'
                        : ev.completado
                          ? 'bg-[#14111d] border-[#80ffb5]/30'
                          : 'bg-[#110e18]/60 border-white/5 opacity-65'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{ev.titulo}</span>
                        {ev.activo && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#80f4ff]/20 text-[#80f4ff] border border-[#80f4ff]/40">
                            ETAPA ACTUAL
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[#a59bb8] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#b080ff]" />
                        {ev.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#d6cce8] mt-1.5 leading-relaxed">
                      {ev.descripcion}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#a59bb8]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#80f4ff]" />
                        {ev.ubicacion}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#80ffb5]" />
                        {ev.responsable}
                      </span>
                      <span className="flex items-center gap-1 text-[#e2d3fe]">
                        <Hash className="w-3 h-3" />
                        {ev.hashVerificacion}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
