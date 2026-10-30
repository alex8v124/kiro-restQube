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

// Categorías y Urgencias oficiales del contrato Amazon Bedrock (Manual Sección 5 / Informe 4.5)
export type BedrockCategoria =
  | 'AGUA_SANEAMIENTO'
  | 'ALIMENTOS_PERECIBLES'
  | 'SALUD_EPIDEMIAS'
  | 'ALBERGUE_TEMPORAL';

export type BedrockUrgencia = 'CRITICA' | 'ALTA' | 'MODERADA';

export type PrioridadDespacho = 1 | 2 | 3;

export interface BedrockClassification {
  categoria: BedrockCategoria;
  urgencia: BedrockUrgencia;
  prioridad_despacho: PrioridadDespacho;
  fallback?: boolean;
  modelId?: string;
  justificacion?: string;
  latencyMs?: number;
}

// Estado del flujo de trazabilidad (Sección 6 del Informe Técnico)
export type EstadoTrazabilidad = 'REGISTRADO' | 'ASIGNADO' | 'EN_RUTA' | 'ENTREGADO';

// Modelo normalizado de Necesidad (unifica Handler JS, Handler Python y Bedrock)
export interface NecesidadItem {
  id: string;
  albergueId: string;
  albergueNombre: string;
  zona: string; // Ej: "Piura Centro", "Catacaos Sur", "Bajo Piura - Cura Mori"
  solicitante: string;
  textoReporte: string;
  requerimientoResumen: string;
  cantidad: string;
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
  tracking_id: string; // Ej: "TRK-FEN-2026" o "TRK-FEN-2026-841"
  donanteNombre: string;
  donanteTipo: 'Empresa' | 'ONG' | 'Ciudadano' | 'Cooperación Internacional';
  descripcion: string;
  cantidad: string;
  categoria: BedrockCategoria;
  necesidadIdDestino?: string;
  zonaDestino?: string;
  estado: EstadoTrazabilidad;
  mensaje?: string;
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
  porCategoria: Record<BedrockCategoria, number>;
  porZona: Array<{ zona: string; criticas: number; atendidas: number; pendientes: number }>;
}

// ============================================================================
// Contratos Oficiales del Verificador Automático (150 Puntos - Sección 4)
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
