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
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#b080ff]">
                <HandHeart className="w-3.5 h-3.5" />
                Rol 02 • Portal del Donante
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Necesidades Abiertas Priorizadas por Urgencia
              </h2>
            </div>

            {/* Filtro por Urgencia */}
            <div className="flex items-center gap-1.5 bg-[#120f19] p-1 rounded-xl border border-white/10">
              <Filter className="w-3.5 h-3.5 text-[#a59bb8] ml-2" />
              {(['TODAS', 'CRITICA', 'ALTA', 'MODERADA'] as const).map((urg) => (
                <button
                  key={urg}
                  onClick={() => setFiltroUrgencia(urg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    filtroUrgencia === urg
                      ? 'bg-[#8847ff] text-white font-semibold'
                      : 'text-[#a59bb8] hover:text-white'
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
                      ? 'bg-[#211a30] border-[#b080ff] shadow-[0_0_20px_rgba(176,128,255,0.2)]'
                      : 'bg-[#14111d] border-white/10 hover:border-[#b080ff]/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#e2d3fe] px-2 py-0.5 rounded bg-[#b080ff]/15 border border-[#b080ff]/30">
                        {nec.albergueId}
                      </span>
                      <span className="text-sm font-bold text-white">{nec.albergueNombre}</span>
                    </div>
                    <EstadoTrazabilidadBadge estado={nec.estado} />
                  </div>

                  <p className="text-xs text-[#d6cce8] mt-2 leading-relaxed">
                    {nec.textoReporte}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/10">
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
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#8847ff]/20 hover:bg-[#8847ff] text-[#e2d3fe] hover:text-white border border-[#b080ff]/40 transition flex items-center gap-1 cursor-pointer"
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
          <div className="kiro-card rounded-2xl p-6 border border-[#b080ff]/35">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-[#80ffb5]" />
                  Registrar Donación Trazable
                </h3>
                <p className="text-xs text-[#a59bb8]">
                  Genera tu código <code className="text-[#80ffb5]">tracking_id</code> para auditar
                  cada etapa hasta el albergue.
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-[#80ffb5]/15 border border-[#80ffb5]/30 text-[11px] font-mono text-[#80ffb5]">
                POST /donaciones
              </span>
            </div>

            <form onSubmit={handleSubmitDonacion} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Entidad o Ciudadano Donante
                </label>
                <input
                  type="text"
                  value={donanteNombre}
                  onChange={(e) => setDonanteNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                    Tipo de Donante
                  </label>
                  <select
                    value={donanteTipo}
                    onChange={(e) =>
                      setDonanteTipo(e.target.value as DonacionItem['donanteTipo'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
                  >
                    <option value="Empresa">Empresa Privada</option>
                    <option value="ONG">ONG / Fundación</option>
                    <option value="Cooperación Internacional">Cooperación Internacional</option>
                    <option value="Ciudadano">Ciudadano Solidario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                    Necesidad Vinculada
                  </label>
                  <select
                    value={selectedNecId}
                    onChange={(e) => setSelectedNecId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#b080ff]"
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
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Categoría Humanitaria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as BedrockCategoria)}
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#b080ff]"
                >
                  <option value="AGUA_SANEAMIENTO">AGUA_SANEAMIENTO</option>
                  <option value="ALIMENTOS_PERECIBLES">ALIMENTOS_PERECIBLES</option>
                  <option value="SALUD_EPIDEMIAS">SALUD_EPIDEMIAS</option>
                  <option value="ALBERGUE_TEMPORAL">ALBERGUE_TEMPORAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Descripción de Insumos Donados
                </label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Cantidad Total Comprometida
                </label>
                <input
                  type="text"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full kiro-glow-btn py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-[#80ffb5]/15 via-[#182622] to-[#120f18] border border-[#80ffb5]/45 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#80ffb5]">
                    <CheckCircle2 className="w-4 h-4" />
                    ESTADO: {reciboTracking.estado}
                  </span>
                  <QrCode className="w-5 h-5 text-[#80ffb5]" />
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#a59bb8]">
                      Código Oficial de Rastreo (tracking_id)
                    </div>
                    <div className="text-base font-mono font-bold text-white tracking-wider">
                      {reciboTracking.tracking_id}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTracking(reciboTracking.tracking_id)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <p className="text-xs text-[#d6cce8]">{reciboTracking.mensaje}</p>

                <button
                  type="button"
                  onClick={() => onInspectTracking(reciboTracking.tracking_id)}
                  className="w-full py-2 rounded-lg bg-[#80ffb5]/20 hover:bg-[#80ffb5]/30 text-[#80ffb5] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Abrir Línea de Tiempo de Trazabilidad
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Historial de Donaciones Registradas */}
          <div className="kiro-card rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">
              Últimas Donaciones con Tracking Activo ({donaciones.length})
            </h4>
            <div className="space-y-2.5">
              {donaciones.map((don) => (
                <div
                  key={don.id}
                  className="p-3 rounded-xl bg-[#14111d] border border-white/10 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectTracking(don.tracking_id)}
                        className="font-mono text-xs font-bold text-[#80ffb5] hover:underline cursor-pointer"
                      >
                        {don.tracking_id}
                      </button>
                      <span className="text-xs text-[#a59bb8] truncate">
                        • {don.donanteNombre}
                      </span>
                    </div>
                    <p className="text-xs text-white truncate mt-0.5">{don.descripcion}</p>
                    <span className="text-[11px] text-[#9589ab] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#b080ff]" />
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
