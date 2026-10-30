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
  Clock,
  Compass,
  Hash,
  HeartHandshake,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableIds = getAllTrackingIds();

  const loadTracking = async (idToFetch: string) => {
    if (!idToFetch || !idToFetch.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiGetTrazabilidad(idToFetch.trim());
      if (res && res.data) {
        setDetalle(res.data);
      } else {
        setErrorMsg('No se encontró información para el código ingresado.');
      }
    } catch (err) {
      console.error('Error al cargar trazabilidad:', err);
      setErrorMsg('No se pudo cargar el recorrido en este momento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idToUse = initialTrackingId || 'TRK-FEN-2026';
    setSearchId(idToUse);
    loadTracking(idToUse);
  }, [initialTrackingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    loadTracking(searchId);
  };

  return (
    <div className="space-y-6">
      {/* Buscador superior accesible y amigable */}
      <div className="kiro-card rounded-2xl p-6 border border-[#b080ff]/25 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#80ffb5]">
              <Compass className="w-3.5 h-3.5" />
              Seguimiento y Transparencia
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Rastreo de Ayuda Humanitaria en Tiempo Real
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#80ffb5]/10 border border-[#80ffb5]/30 text-xs font-medium text-[#80ffb5] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Custodia Verificada
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#b080ff] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ingresa tu código de seguimiento (ej. TRK-FEN-2026)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#110e17] border border-[#b080ff]/35 text-sm font-sans text-white focus:outline-none focus:border-[#80ffb5] transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="kiro-glow-btn px-6 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Rastrear Envío
          </button>
        </form>

        {/* Códigos activos de fácil acceso */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#a59bb8]">Envíos recientes:</span>
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

      {/* Mensaje de error amigable */}
      {errorMsg && (
        <div className="kiro-card rounded-2xl p-6 text-center text-[#ff9e9e] border border-red-500/30">
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Estado cargando */}
      {loading && !detalle && (
        <div className="kiro-card rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#80ffb5]" />
          <p className="text-sm text-[#a59bb8]">Consultando trayecto en tiempo real...</p>
        </div>
      )}

      {/* Resultado de Trazabilidad */}
      {detalle && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tarjeta de Resumen del Envío (4 columnas) */}
          <div className="lg:col-span-4 kiro-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="text-[11px] font-medium uppercase text-[#9589ab]">
                  Código de Envío
                </div>
                <div className="text-lg font-mono font-bold text-[#80ffb5]">
                  {detalle.tracking_id}
                </div>
              </div>
              <EstadoTrazabilidadBadge estado={detalle.estadoActual || 'EN_TRANSITO'} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10">
                <div className="text-[#9589ab] font-medium uppercase text-[10px] flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#80ffb5]" />
                  Donante Registrado
                </div>
                <div className="text-white font-semibold mt-1">
                  {detalle.donante || 'Donante Solidario'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10">
                <div className="text-[#9589ab] font-medium uppercase text-[10px]">
                  Recurso &amp; Cantidad
                </div>
                <div className="text-white font-semibold mt-1">
                  {detalle.recurso || 'Insumos de Emergencia'}
                </div>
                <div className="text-[#80ffb5] font-semibold mt-0.5">
                  {detalle.cantidad || '1 unidad'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10">
                <div className="text-[#9589ab] font-medium uppercase text-[10px]">
                  Albergue &amp; Destino
                </div>
                <div className="text-white font-semibold mt-1">
                  {detalle.albergueDestino || 'Albergue en Piura / Catacaos'}
                </div>
                <div className="text-[#b080ff] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {detalle.zona || 'Catacaos Sur'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-[#b080ff]/25 space-y-2">
                <div className="text-[#e2d3fe] font-medium uppercase text-[10px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#b080ff]" />
                  Prioridad del Envío
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <CategoriaBadge categoria={detalle.clasificacionBedrock?.categoria || 'MEDICINA'} />
                  <UrgenciaBadge urgencia={detalle.clasificacionBedrock?.urgencia || 'CRITICA'} />
                  <PrioridadBadge prioridad={detalle.clasificacionBedrock?.prioridad_despacho || 1} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#13101c] border border-white/10 space-y-1">
                <div className="text-[#9589ab] font-medium uppercase text-[10px]">
                  Transporte &amp; Responsable
                </div>
                <div className="text-[#80f4ff] flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  {detalle.vehiculo || 'Camión de Apoyo Humanitario'}
                </div>
                <div className="text-[#c4b8db]">{detalle.operadorLogistico || 'Brigada INDECI / COER'}</div>
              </div>
            </div>
          </div>

          {/* Línea de Tiempo del Recorrido (8 columnas) */}
          <div className="lg:col-span-8 kiro-card rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#80ffb5]" />
                  Recorrido y Custodia de la Ayuda
                </h3>
                <p className="text-xs text-[#a59bb8] mt-0.5">
                  Recepción de donación → Asignación a albergue → En camino → Entrega final
                </p>
              </div>
            </div>

            <div className="mt-6 relative pl-6 border-l-2 border-[#b080ff]/30 space-y-6">
              {(detalle.eventos || []).map((ev, idx) => (
                <div key={ev.etapa || idx} className="relative">
                  {/* Nodo circular con indicador activo */}
                  <span
                    className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      ev.activo
                        ? 'bg-[#80f4ff] border-[#0e0c14] shadow-[0_0_16px_#80f4ff]'
                        : ev.completado
                          ? 'bg-[#80ffb5] border-[#0e0c14] shadow-[0_0_12px_#80ffb5]'
                          : 'bg-[#1e1929] border-[#6b6080]'
                    }`}
                  >
                    {ev.activo && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#80f4ff] opacity-75" />
                    )}
                  </span>

                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      ev.activo
                        ? 'bg-[#221a33] border-[#b080ff] shadow-[0_0_24px_rgba(176,128,255,0.25)] scale-[1.01]'
                        : ev.completado
                          ? 'bg-[#14111d] border-[#80ffb5]/30'
                          : 'bg-[#110e18]/60 border-white/5 opacity-65'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{ev.titulo}</span>
                        {ev.activo && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#80f4ff]/20 text-[#80f4ff] border border-[#80f4ff]/40 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#80f4ff] animate-pulse" />
                            EN CURSO
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#a59bb8] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#b080ff]" />
                        {ev.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#d6cce8] mt-1.5 leading-relaxed">
                      {ev.descripcion}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a59bb8]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#80f4ff]" />
                        {ev.ubicacion}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#80ffb5]" />
                        {ev.responsable}
                      </span>
                      <span className="flex items-center gap-1 text-[#e2d3fe] font-mono text-[10px]">
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
