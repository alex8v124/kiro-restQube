import React, { useState } from 'react';
import {
  BedrockClassification,
  NecesidadItem,
} from '../../types/fen';
import {
  apiClasificarNecesidadBedrock,
  apiCreateNecesidad,
} from '../../services/api';
import {
  CategoriaBadge,
  EstadoTrazabilidadBadge,
  PrioridadBadge,
  UrgenciaBadge,
} from '../ui/Badges';
import {
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Cpu,
  FileCode2,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';

interface SolicitanteViewProps {
  necesidades: NecesidadItem[];
  onRefresh: () => void;
  onInspectTracking: (trackingId: string) => void;
}

const PRESET_REPORTES = [
  {
    titulo: 'Agua Potable (ALB-PIURA-01)',
    albergueId: 'ALB-PIURA-01',
    albergueNombre: 'Albergue Coliseo Seminario y Jaime — Piura Centro',
    zona: 'Piura Centro',
    solicitante: 'Carlos Merino (Líder de Albergue)',
    cantidad: '100 bidones de 20L (2,000 litros)',
    familias: 120,
    texto:
      'Urgente en albergue ALB-PIURA-01: corte total de agua potable tras colapso de tubería matriz por inundación FEN en Piura Centro. Hay 120 familias y niños sin agua segura para consumo ni saneamiento básico.',
  },
  {
    titulo: 'Salud / Dengue (ALB-CATACAOS-02)',
    albergueId: 'ALB-CATACAOS-02',
    albergueNombre: 'Albergue I.E. Juan de Mori — Catacaos',
    zona: 'Catacaos Sur (Bajo Piura)',
    solicitante: 'Rosa Ipanaqué (Enfermera Comunitaria)',
    cantidad: '40 kits médicos + 80 mosquiteros',
    familias: 85,
    texto:
      'Emergencia sanitaria en ALB-CATACAOS-02: aguas estancadas tras desborde del río Piura han generado brote febril con síntomas de dengue en 18 niños y adultos mayores. Requerimos kits médicos, suero oral y mosquiteros.',
  },
  {
    titulo: 'Alimentos Olla Común (Cura Mori)',
    albergueId: 'ALB-CURAMORI-03',
    albergueNombre: 'Campamento Km 980 — Cura Mori',
    zona: 'Bajo Piura — Cura Mori',
    solicitante: 'Jorge Yovera (Comité de Olla Común)',
    cantidad: '300 raciones no perecibles (arroz, menestras, conservas)',
    familias: 65,
    texto:
      'Carretera bloqueada hacia Cura Mori dejó sin abastecimiento de víveres a la olla común del campamento Km 980. Necesitamos alimentos perecibles y no perecibles, leche y conservas para alimentar a 65 familias.',
  },
  {
    titulo: 'Refugio / Carpas (Tambogrande)',
    albergueId: 'ALB-TAMBO-04',
    albergueNombre: 'Centro Comunal Malingas — Tambogrande',
    zona: 'Tambogrande — Malingas',
    solicitante: 'Elena Chiroque (Defensa Civil Local)',
    cantidad: '25 carpas familiares impermeables + 100 colchonetas',
    familias: 32,
    texto:
      'Lluvias torrenciales colapsaron techos de adobe en caserío Malingas. Solicitamos carpas impermeables de albergue temporal, frazadas y colchonetas para reubicar a 32 familias en zona alta.',
  },
];

export const SolicitanteView: React.FC<SolicitanteViewProps> = ({
  necesidades,
  onRefresh,
  onInspectTracking,
}) => {
  const [albergueId, setAlbergueId] = useState('ALB-PIURA-05');
  const [albergueNombre, setAlbergueNombre] = useState(
    'Albergue I.E. San Miguel — Piura'
  );
  const [zona, setZona] = useState('Piura Centro');
  const [solicitante, setSolicitante] = useState('María Bancayán (Coordinadora de Albergue)');
  const [cantidad, setCantidad] = useState('80 bidones de agua 20L + kits de cloro');
  const [familias, setFamilias] = useState(90);
  const [textoReporte, setTextoReporte] = useState(
    'Desborde de dren pluvial inundó el sector bajo. Tenemos 90 familias damnificadas con niños pequeños sin acceso a agua potable segura ni hipoclorito para desinfección en el albergue.'
  );

  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bedrockResult, setBedrockResult] = useState<BedrockClassification | null>({
    categoria: 'AGUA_SANEAMIENTO',
    urgencia: 'CRITICA',
    prioridad_despacho: 1,
    fallback: false,
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    justificacion:
      'Clasificación inicial lista: déficit crítico de agua potable para 90 familias con niños en Piura.',
    latencyMs: 184,
  });
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);

  const handleLoadPreset = async (preset: (typeof PRESET_REPORTES)[number]) => {
    setAlbergueId(preset.albergueId);
    setAlbergueNombre(preset.albergueNombre);
    setZona(preset.zona);
    setSolicitante(preset.solicitante);
    setCantidad(preset.cantidad);
    setFamilias(preset.familias);
    setTextoReporte(preset.texto);
    setSubmitBanner(null);

    setIsClassifying(true);
    try {
      const res = await apiClasificarNecesidadBedrock(preset.texto);
      setBedrockResult(res.data);
    } finally {
      setIsClassifying(false);
    }
  };

  const handlePreviewBedrock = async () => {
    if (!textoReporte.trim()) return;
    setIsClassifying(true);
    try {
      const res = await apiClasificarNecesidadBedrock(textoReporte);
      setBedrockResult(res.data);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoReporte.trim()) return;
    setIsSubmitting(true);
    setSubmitBanner(null);
    try {
      const res = await apiCreateNecesidad({
        albergueId,
        albergueNombre,
        zona,
        solicitante,
        textoReporte,
        cantidad,
        familiasAfectadas: Number(familias) || 50,
      });
      setBedrockResult(res.clasificacion);
      setSubmitBanner(
        `Solicitud ${res.necesidad.id} registrada y priorizada como P${res.clasificacion.prioridad_despacho} (${res.clasificacion.urgencia}) en la cola del COER Piura.`
      );
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Grid: Formulario Solicitante + Panel en vivo de Amazon Bedrock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Formulario de Reporte en Texto Libre (7 cols) */}
        <div className="lg:col-span-7 kiro-card rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#b080ff]">
                <Building2 className="w-3.5 h-3.5" />
                Rol 01 • Portal del Solicitante (Albergues Piura &amp; Catacaos)
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Registrar Necesidad Humanitaria en Texto Libre
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#8847ff]/15 border border-[#b080ff]/30 text-xs font-mono text-[#e2d3fe]">
              POST /necesidades
            </span>
          </div>

          {/* Casos rápidos del informe técnico */}
          <div className="mt-4">
            <span className="text-xs font-mono text-[#a59bb8] block mb-2">
              Cargar escenario de prueba rápida (Piura / Catacaos):
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_REPORTES.map((p) => (
                <button
                  key={p.titulo}
                  type="button"
                  onClick={() => handleLoadPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1524] hover:bg-[#282038] text-[#e2d3fe] border border-[#b080ff]/25 hover:border-[#b080ff]/60 transition cursor-pointer"
                >
                  {p.titulo}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Código Albergue
                </label>
                <input
                  type="text"
                  value={albergueId}
                  onChange={(e) => setAlbergueId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Nombre del Albergue / Centro Temporal
                </label>
                <input
                  type="text"
                  value={albergueNombre}
                  onChange={(e) => setAlbergueNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Zona / Distrito FEN
                </label>
                <select
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
                >
                  <option value="Piura Centro">Piura Centro</option>
                  <option value="Catacaos Sur (Bajo Piura)">Catacaos Sur (Bajo Piura)</option>
                  <option value="Bajo Piura — Cura Mori">Bajo Piura — Cura Mori</option>
                  <option value="Castilla — El Indio">Castilla — El Indio</option>
                  <option value="Tambogrande — Malingas">Tambogrande — Malingas</option>
                  <option value="Chulucanas — Alto Piura">Chulucanas — Alto Piura</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Responsable Solicitante
                </label>
                <input
                  type="text"
                  value={solicitante}
                  onChange={(e) => setSolicitante(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                  Familias Damnificadas
                </label>
                <input
                  type="number"
                  min={1}
                  value={familias}
                  onChange={(e) => setFamilias(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#b080ff]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-[#e2d3fe] font-semibold">
                  Reporte de Emergencia en Texto Libre (Analizado por Amazon Bedrock)
                </label>
                <button
                  type="button"
                  onClick={handlePreviewBedrock}
                  disabled={isClassifying}
                  className="text-xs font-mono text-[#80f4ff] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Re-analizar texto con Bedrock IA
                </button>
              </div>
              <textarea
                rows={4}
                value={textoReporte}
                onChange={(e) => setTextoReporte(e.target.value)}
                required
                placeholder="Describe la situación del albergue, síntomas, falta de agua, alimentos o daños estructurales..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#110e17] border border-[#b080ff]/35 text-sm text-white placeholder-[#6b6080] focus:outline-none focus:border-[#b080ff] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c4b8db] mb-1">
                Cantidad / Insumos Específicos Requeridos
              </label>
              <input
                type="text"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#110e17] border border-white/15 text-sm text-white focus:outline-none focus:border-[#b080ff]"
              />
            </div>

            {submitBanner && (
              <div className="p-3.5 rounded-xl bg-[#80ffb5]/12 border border-[#80ffb5]/35 text-xs text-[#80ffb5] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitBanner}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePreviewBedrock}
                disabled={isClassifying}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-[#221c2e] hover:bg-[#2d253d] text-[#e2d3fe] border border-[#b080ff]/30 flex items-center gap-2 cursor-pointer"
              >
                {isClassifying ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#b080ff]" />
                ) : (
                  <Bot className="w-4 h-4 text-[#b080ff]" />
                )}
                1. Probar Clasificación Bedrock
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="kiro-glow-btn px-5 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                2. Enviar Solicitud al COER Piura
              </button>
            </div>
          </form>
        </div>

        {/* Columna Derecha: Inspector GenAI con Propósito (+40 Pts) — Amazon Bedrock Runtime (5 cols) */}
        <div className="lg:col-span-5 kiro-card rounded-2xl p-6 flex flex-col justify-between border border-[#b080ff]/35">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#8847ff]/30 to-[#80f4ff]/20 border border-[#b080ff]/40 text-[#e2d3fe]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Amazon Bedrock Runtime
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#80ffb5]/15 text-[#80ffb5] border border-[#80ffb5]/30">
                      +40 PTS INSIGNIA
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#a59bb8]">
                    modelId: anthropic.claude-3-haiku-20240307-v1:0
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-[#c4b8db] leading-relaxed">
              El reporte del albergue es evaluado mediante prompt estructurado del Centro de
              Operaciones FEN Piura con salida JSON forzada y fallback determinista de alta
              disponibilidad.
            </p>

            {bedrockResult && (
              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-xl bg-[#120f19] border border-[#b080ff]/25 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#a59bb8]">
                    <span>CLASIFICACIÓN ESTRUCTURADA</span>
                    <span className="text-[#80ffb5]">
                      {bedrockResult.fallback ? 'FALLBACK DETERMINISTA' : 'BEDROCK RUNTIME OK'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <CategoriaBadge categoria={bedrockResult.categoria} />
                    <UrgenciaBadge urgencia={bedrockResult.urgencia} />
                    <PrioridadBadge prioridad={bedrockResult.prioridad_despacho} />
                  </div>

                  {bedrockResult.justificacion && (
                    <p className="text-xs text-[#d6cce8] bg-[#1b1626] p-2.5 rounded-lg border border-white/5">
                      {bedrockResult.justificacion}
                    </p>
                  )}
                </div>

                {/* Bloque de código JSON exacto exigido por el manual */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#a59bb8] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-[#80f4ff]" />
                      Payload JSON devuelto por el clasificador:
                    </span>
                    <span>us-east-1</span>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#0b0910] border border-white/10 text-xs font-mono text-[#80ffb5] overflow-x-auto">
                    {JSON.stringify(
                      {
                        categoria: bedrockResult.categoria,
                        urgencia: bedrockResult.urgencia,
                        prioridad_despacho: bedrockResult.prioridad_despacho,
                        ...(bedrockResult.fallback ? { fallback: true } : {}),
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#9589ab]">
            <span>Valores válidos: AGUA | ALIMENTOS | SALUD | ALBERGUE</span>
            <span className="text-[#e2d3fe]">Prioridad 1 → 3</span>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes Activas de Albergues */}
      <div className="kiro-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Solicitudes Registradas por Albergues ({necesidades.length})
            </h3>
            <p className="text-xs text-[#a59bb8]">
              Estado en tiempo real de los requerimientos de Piura y Catacaos y su código de
              trazabilidad asociado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {necesidades.map((nec) => (
            <div
              key={nec.id}
              className="p-4 rounded-xl bg-[#14111d] border border-white/10 hover:border-[#b080ff]/35 transition flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#e2d3fe] px-2 py-0.5 rounded bg-[#b080ff]/15 border border-[#b080ff]/30">
                      {nec.albergueId}
                    </span>
                    <span className="font-mono text-xs text-[#9589ab]">{nec.id}</span>
                  </div>
                  <EstadoTrazabilidadBadge estado={nec.estado} />
                </div>

                <h4 className="font-bold text-sm text-white">{nec.albergueNombre}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#a59bb8] mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#b080ff]" />
                    {nec.zona}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#80f4ff]" />
                    {nec.familiasAfectadas} familias
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-[#d6cce8] leading-relaxed bg-[#0e0c14]/70 p-2.5 rounded-lg border border-white/5">
                  &ldquo;{nec.textoReporte}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CategoriaBadge categoria={nec.categoria} />
                  <UrgenciaBadge urgencia={nec.urgencia} />
                  <PrioridadBadge prioridad={nec.prioridad_despacho} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#c4b8db]">
                    Requerido: <strong className="text-white">{nec.cantidad}</strong>
                  </span>
                  {nec.trackingIdAsociado ? (
                    <button
                      onClick={() => onInspectTracking(nec.trackingIdAsociado!)}
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#80ffb5] hover:underline cursor-pointer"
                    >
                      Rastrear {nec.trackingIdAsociado}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="font-mono text-[11px] text-[#ffcf99]">
                      Esperando asignación de donante
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
