import React, { useState } from 'react';
import {
  BedrockCategoria,
  BedrockUrgencia,
  DonacionItem,
  NecesidadItem,
} from '../../types/fen';
import { apiRegistrarDonacion } from '../../services/api';
import {
  CategoriaBadge,
  EstadoTrazabilidadBadge,
  PrioridadBadge,
  UrgenciaBadge,
} from '../ui/Badges';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Filter,
  HandHeart,
  Loader2,
  MapPin,
  PackagePlus,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface DonanteViewProps {
  necesidades: NecesidadItem[];
  donaciones: DonacionItem[];
  onRefresh: () => void;
  onInspectTracking: (trackingId: string) => void;
}

export const DonanteView: React.FC<DonanteViewProps> = ({
  necesidades,
  donaciones,
  onRefresh,
  onInspectTracking,
}) => {
  const [filtroUrgencia, setFiltroUrgencia] = useState<BedrockUrgencia | 'TODAS'>('TODAS');
  const [selectedNecId, setSelectedNecId] = useState<string>('NEC-2026-02');
  const [donanteNombre, setDonanteNombre] = useState('Consorcio AgroPiura Solidaria');
  const [donanteTipo, setDonanteTipo] = useState<DonacionItem['donanteTipo']>('Empresa');
  const [categoria, setCategoria] = useState<BedrockCategoria>('AGUA_SANEAMIENTO');
  const [descripcion, setDescripcion] = useState(
    '100 Bidones sellados de agua potable de 20L + pastillas potabilizadoras'
  );
  const [cantidad, setCantidad] = useState('100 bidones (2,000 litros)');
  const [mensaje, setMensaje] = useState(
    'Entrega inmediata disponible en almacén Zona Industrial Piura.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reciboTracking, setReciboTracking] = useState<{
    tracking_id: string;
    estado: string;
    mensaje: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const necesidadesFiltradas = necesidades.filter((n) =>
    filtroUrgencia === 'TODAS' ? true : n.urgencia === filtroUrgencia
  );

  const handleSelectNecesidadParaDonar = (nec: NecesidadItem) => {
    setSelectedNecId(nec.id);
    setCategoria(nec.categoria);
    setCantidad(nec.cantidad);
    setDescripcion(`Aporte directo para ${nec.albergueId}: ${nec.requerimientoResumen}`);
    setReciboTracking(null);
  };

  const handleSubmitDonacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const targetNec = necesidades.find((n) => n.id === selectedNecId);
      const res = await apiRegistrarDonacion({
        donanteNombre,
        donanteTipo,
        descripcion,
        cantidad,
        categoria,
        necesidadIdDestino: selectedNecId || undefined,
        zonaDestino: targetNec?.zona || 'Piura Centro',
        mensaje,
      });
      setReciboTracking({
        tracking_id: res.tracking_id,
        estado: res.estado,
        mensaje: res.mensaje,
      });
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTracking = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Necesidades Abiertas por Urgencia (7 cols) */}
        <div className="lg:col-span-7 kiro-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-blue-600">
                <HandHeart className="w-3.5 h-3.5" />
                Rol 02 • Portal del Donante
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Necesidades Abiertas Priorizadas por Urgencia
              </h2>
            </div>

            {/* Filtro por Urgencia */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
              {(['TODAS', 'CRITICA', 'ALTA', 'MODERADA'] as const).map((urg) => (
                <button
                  key={urg}
                  onClick={() => setFiltroUrgencia(urg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    filtroUrgencia === urg
                      ? 'bg-blue-600 text-slate-900 text-slate-900 font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {necesidadesFiltradas.map((nec) => {
              const isSelected = selectedNecId === nec.id;
              return (
                <div
                  key={nec.id}
                  onClick={() => handleSelectNecesidadParaDonar(nec)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 border-[#b080ff] shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-slate-200">
                        {nec.albergueId}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{nec.albergueNombre}</span>
                    </div>
                    <EstadoTrazabilidadBadge estado={nec.estado} />
                  </div>

                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {nec.textoReporte}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <UrgenciaBadge urgencia={nec.urgencia} />
                      <PrioridadBadge prioridad={nec.prioridad_despacho} />
                      <CategoriaBadge categoria={nec.categoria} />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNecesidadParaDonar(nec);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-blue-600 text-slate-900 hover:bg-blue-600 text-slate-900 text-slate-900 hover:text-slate-900 border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isSelected ? 'Seleccionada para Donar' : 'Comprometer Ayuda'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Formulario POST /donaciones + Emisión de tracking_id (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="kiro-card rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-emerald-600" />
                  Registrar Donación Trazable
                </h3>
                <p className="text-xs text-slate-500">
                  Genera tu código <code className="text-emerald-600">tracking_id</code> para auditar
                  cada etapa hasta el albergue.
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono text-emerald-600">
                POST /donaciones
              </span>
            </div>

            <form onSubmit={handleSubmitDonacion} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1">
                  Entidad o Ciudadano Donante
                </label>
                <input
                  type="text"
                  value={donanteNombre}
                  onChange={(e) => setDonanteNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-700 mb-1">
                    Tipo de Donante
                  </label>
                  <select
                    value={donanteTipo}
                    onChange={(e) =>
                      setDonanteTipo(e.target.value as DonacionItem['donanteTipo'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Empresa">Empresa Privada</option>
                    <option value="ONG">ONG / Fundación</option>
                    <option value="Cooperación Internacional">Cooperación Internacional</option>
                    <option value="Ciudadano">Ciudadano Solidario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-700 mb-1">
                    Necesidad Vinculada
                  </label>
                  <select
                    value={selectedNecId}
                    onChange={(e) => setSelectedNecId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Fondo General Piura</option>
                    {necesidades.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.albergueId} ({n.urgencia})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1">
                  Categoría Humanitaria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as BedrockCategoria)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="AGUA_SANEAMIENTO">AGUA_SANEAMIENTO</option>
                  <option value="ALIMENTOS_PERECIBLES">ALIMENTOS_PERECIBLES</option>
                  <option value="SALUD_EPIDEMIAS">SALUD_EPIDEMIAS</option>
                  <option value="ALBERGUE_TEMPORAL">ALBERGUE_TEMPORAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1">
                  Descripción de Insumos Donados
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1">
                  Cantidad Total Comprometida
                </label>
                <input
                  type="text"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full kiro-glow-btn py-2.5 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HandHeart className="w-4 h-4" />
                )}
                Registrar Donación y Emitir tracking_id
              </button>
            </form>

            {/* Tarjeta de Recibo Oficial con tracking_id */}
            {reciboTracking && (
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-[#80ffb5]/15 via-[#182622] to-[#120f18] border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    ESTADO: {reciboTracking.estado}
                  </span>
                  <QrCode className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      Código Oficial de Rastreo (tracking_id)
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 tracking-wider">
                      {reciboTracking.tracking_id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTracking(reciboTracking.tracking_id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-50 text-xs font-mono text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <p className="text-xs text-slate-700">{reciboTracking.mensaje}</p>

                <button
                  type="button"
                  onClick={() => onInspectTracking(reciboTracking.tracking_id)}
                  className="w-full py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-emerald-700 text-emerald-600 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Abrir Línea de Tiempo de Trazabilidad
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Historial de Donaciones Registradas */}
          <div className="kiro-card rounded-2xl p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              Últimas Donaciones con Tracking Activo ({donaciones.length})
            </h4>
            <div className="space-y-2.5">
              {donaciones.map((don) => (
                <div
                  key={don.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectTracking(don.tracking_id)}
                        className="font-mono text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        {don.tracking_id}
                      </button>
                      <span className="text-xs text-slate-500 truncate">
                        • {don.donanteNombre}
                      </span>
                    </div>
                    <p className="text-xs text-slate-900 truncate mt-0.5">{don.descripcion}</p>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      Destino: {don.zonaDestino}
                    </span>
                  </div>
                  <EstadoTrazabilidadBadge estado={don.estado} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
