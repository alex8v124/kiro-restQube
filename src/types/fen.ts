// ============================================================================
// Tipos Oficiales — FEN Ayuda Trazable (AWS & Kiro Hackathon 2026)
// ============================================================================

export type RoleId =
  | 'solicitante'
  | 'donante'
  | 'coordinador'
  | 'logistico'
  | 'trazabilidad'
  | 'administrador';

export type ApiConnectionMode = 'hybrid' | 'live' | 'mock';

// Categorías del contrato FEN (Manual de Ingeniería Full-Stack + Bedrock)
export type BedrockCategoria =
  | 'AGUA'
  | 'ALIMENTOS'
  | 'MEDICINA'
  | 'ABRIGO'
  | 'AGUA_SANEAMIENTO'
  | 'ALIMENTOS_PERECIBLES'
  | 'SALUD_EPIDEMIAS'
  | 'ALBERGUE_TEMPORAL';

export type BedrockUrgencia = 'CRITICA' | 'ALTA' | 'MEDIA' | 'MODERADA' | 'BAJA';

export type PrioridadDespacho = 1 | 2 | 3;

export interface BedrockClassification {
  categoria: BedrockCategoria;
  urgencia: BedrockUrgencia;
  prioridad_despacho: PrioridadDespacho;
  cantidad?: number;
  insumo_principal?: string;
  fallback?: boolean;
  modelId?: string;
  justificacion?: string;
  latencyMs?: number;
}

// Estados canónicos de trazabilidad logística
export type EstadoTrazabilidad = 'REGISTRADO' | 'EN_TRANSITO' | 'EN_RUTA' | 'ENTREGADO';

// Requerimiento de Albergue (unifica backend oficial y vistas de React)
export interface NecesidadItem {
  id: string;
  albergueId: string;
  albergueNombre: string;
  zona: string;
  solicitante: string;
  textoReporte: string;
  requerimientoResumen: string;
  cantidad: string;
  cantidad_solicitada?: number;
  cantidad_cubierta?: number;
  insumo_principal?: string;
  categoria: BedrockCategoria;
  urgencia: BedrockUrgencia;
  prioridad_despacho: PrioridadDespacho;
  fallbackBedrock?: boolean;
  estado: 'ABIERTA' | 'ASIGNADA' | 'EN_RUTA' | 'ATENDIDA';
  trackingIdAsociado?: string;
  creadoEn: string;
  familiasAfectadas: number;
}

export interface DonacionItem {
  id: string;
  tracking_id: string; // Ej: "TRK-FEN-2026", "TRK-4912"
  donanteNombre: string;
  donanteTipo: 'Empresa' | 'ONG' | 'Ciudadano' | 'Cooperación Internacional';
  descripcion: string;
  item?: string;
  cantidad: string;
  categoria: BedrockCategoria;
  necesidadIdDestino?: string;
  albergue_asignado?: string;
  zonaDestino?: string;
  estado: EstadoTrazabilidad;
  mensaje?: string;
  linea_tiempo?: Array<{
    paso: string;
    timestamp: string | null;
    completado: boolean;
  }>;
  creadoEn: string;
}

export interface AsignacionItem {
  id: string;
  tracking_id: string;
  donacionId: string;
  necesidadId: string;
  albergueNombre: string;
  zona: string;
  recurso: string;
  cantidad: string;
  categoria: BedrockCategoria;
  urgencia: BedrockUrgencia;
  prioridad_despacho: PrioridadDespacho;
  coordinador: string;
  operadorLogistico: string;
  vehiculoPlaca: string;
  estadoRuta: EstadoTrazabilidad;
  puntoControlActual: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface EventoTrazabilidad {
  etapa: EstadoTrazabilidad;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  responsable: string;
  timestamp: string;
  completado: boolean;
  activo: boolean;
  hashVerificacion: string;
}

export interface TrazabilidadDetalle {
  tracking_id: string;
  estadoActual: EstadoTrazabilidad;
  donante: string;
  recurso: string;
  cantidad: string;
  albergueDestino: string;
  zona: string;
  clasificacionBedrock: BedrockClassification;
  asignacionId?: string;
  operadorLogistico?: string;
  vehiculo?: string;
  eventos: EventoTrazabilidad[];
}

export interface DashboardMetrics {
  totalNecesidades: number;
  necesidadesCriticas: number;
  totalDonaciones: number;
  asignacionesActivas: number;
  entregasCompletadas: number;
  familiasAsistidas: number;
  porcentajeCobertura: number;
  porCategoria: Record<string, number>;
  porZona: Array<{ zona: string; criticas: number; atendidas: number; pendientes: number }>;
}

// ============================================================================
// Contratos Oficiales del Verificador Automático (150 Puntos)
// ============================================================================

export interface HealthResponse {
  status: string;
  team?: string;
  reto?: string;
  service?: string;
  [key: string]: unknown;
}

export interface VerifierItem {
  id: string;
  value: string;
}

export interface JobCreateResponse {
  jobId: string;
}

export interface JobStatusResponse {
  status: 'pending' | 'processing' | 'done' | 'error';
  output?: string;
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'OPTIONS';
  path: string;
  url: string;
  status: number;
  latencyMs: number;
  source: 'lambda-live' | 'local-fallback';
  requestBody?: unknown;
  responseBody?: unknown;
  error?: string;
}
