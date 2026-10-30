import React, { useEffect, useState } from 'react';
import { TrazabilidadDetalle } from '../../types/fen';
import { apiGetTrazabilidad, getAllTrackingIds } from '../../services/api';
import {
  Compass,
  Loader2,
  Package,
  Search,
  ShieldCheck,
} from 'lucide-react';

interface TrackingDataProps {
  tracking_id?: string;
  item?: string;
  recurso?: string;
  estado?: string;
  estadoActual?: string;
  donante?: string;
  albergue_asignado?: string;
  albergueDestino?: string;
  zona?: string;
  eventos?: any[];
  linea_tiempo?: any[];
}

/**
 * Componente de Trazabilidad estilo Apple / Delivery App (Amazon / Temu)
 */
export function TrackingDeliveryCard({ data }: { data: TrackingDataProps }) {
  const trk = data.tracking_id || 'TRK-101';
  const itemNombre = data.item || data.recurso || '50 Bidones de Agua Potable 20L';
  const st = (data.estadoActual || data.estado || 'EN_TRANSITO').toUpperCase();
  const isEntregado = st === 'ENTREGADO';
  const isTransito = st === 'EN_TRANSITO' || st === 'EN_RUTA';
  const isRegistrado = st === 'REGISTRADO';

  const estadoBadge = isEntregado
    ? 'Entregado con éxito'
    : isTransito
      ? 'En camino a destino'
      : 'Donación Registrada';

  const destinoFinal =
    data.zona ||
    (data.albergueDestino ? `${data.albergueDestino} — 40 Familias beneficiadas` : 'Catacaos — 40 Familias beneficiadas');

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-8 transition-all">
      {/* Header del Paquete */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <span
            className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
              isEntregado
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-blue-600 bg-blue-50'
            }`}
          >
            {estadoBadge}
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            {itemNombre}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Código de rastreo:{' '}
            <span className="font-mono font-medium text-slate-700">{trk}</span>
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100 shrink-0">
          📦
        </div>
      </div>

      {/* Stepper tipo Temu / Amazon */}
      <div className="mt-8 space-y-6">
        {/* Paso 1: Donación Recibida */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
              ✓
            </div>
            <div
              className={`w-0.5 h-12 ${
                isRegistrado ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
            ></div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Donación Recibida</h4>
            <p className="text-xs text-slate-500">
              Punto de acopio central Lima — Registrado
            </p>
          </div>
        </div>

        {/* Paso 2: Asignación Vital con Albergue */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            {isRegistrado ? (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                ⚡
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
            <div
              className={`w-0.5 h-12 ${
                isEntregado
                  ? 'bg-emerald-500'
                  : isTransito
                    ? 'bg-blue-500'
                    : 'bg-slate-200'
              }`}
            ></div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Asignación Vital con Albergue
            </h4>
            <p className="text-xs text-slate-500">
              Emparejado con {data.albergueDestino || data.albergue_asignado || 'Albergue San Pablo (Catacaos, Piura)'}
            </p>
          </div>
        </div>

        {/* Paso 3: En Tránsito Terrestre */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            {isEntregado ? (
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            ) : isTransito ? (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                🚚
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">
                3
              </div>
            )}
            <div
              className={`w-0.5 h-12 ${
                isEntregado ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            ></div>
          </div>
          <div>
            <h4
              className={`text-sm font-semibold ${
                isTransito
                  ? 'text-blue-600'
                  : isEntregado
                    ? 'text-slate-900'
                    : 'text-slate-400'
              }`}
            >
              En Tránsito Terrestre
            </h4>
            <p className="text-xs text-slate-500">
              Despacho en ruta Panamericana Norte — Camión #04
            </p>
          </div>
        </div>

        {/* Paso 4: Entrega en Caserío */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            {isEntregado ? (
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">
                4
              </div>
            )}
          </div>
          <div>
            <h4
              className={`text-sm font-semibold ${
                isEntregado ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              Entrega en Caserío
            </h4>
            <p className="text-xs text-slate-400">
              {isEntregado
                ? 'Entregado y conforme por brigada local'
                : 'Recepción y firma digital por brigada local'}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen del Destino */}
      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase font-medium">Destino Final</p>
          <p className="text-sm font-semibold text-slate-800">{destinoFinal}</p>
        </div>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
          Prioridad Vital
        </span>
      </div>
    </div>
  );
}

interface TrazabilidadViewProps {
  initialTrackingId: string;
}

export const TrazabilidadView: React.FC<TrazabilidadViewProps> = ({
  initialTrackingId,
}) => {
  const [searchId, setSearchId] = useState(initialTrackingId || 'TRK-101');
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
    const idToUse = initialTrackingId || 'TRK-101';
    setSearchId(idToUse);
    loadTracking(idToUse);
  }, [initialTrackingId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    loadTracking(searchId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Buscador superior Apple Clean */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <Compass className="w-3.5 h-3.5" />
              Rastreo de Paquetes y Ayuda
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Seguimiento en Tiempo Real
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cadena de Custodia
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ingresa código (ej. TRK-101 o TRK-FEN-2026)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Rastrear
          </button>
        </form>

        {/* Envíos de prueba rápidos */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Ejemplos:</span>
          {['TRK-101', 'TRK-FEN-2026', ...availableIds.filter(id => id !== 'TRK-101' && id !== 'TRK-FEN-2026')].slice(0, 4).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSearchId(id);
                loadTracking(id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer border ${
                detalle?.tracking_id === id
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje de error amigable */}
      {errorMsg && (
        <div className="bg-white rounded-2xl p-6 text-center text-red-600 border border-red-200 shadow-sm">
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Estado cargando */}
      {loading && !detalle && (
        <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center gap-3 border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500 font-medium">Buscando paquete en ruta...</p>
        </div>
      )}

      {/* Componente Clave: Temu / Amazon Tracking Delivery Card */}
      {detalle && (
        <TrackingDeliveryCard data={detalle} />
      )}
    </div>
  );
};
