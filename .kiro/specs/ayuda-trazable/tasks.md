# Plan de Implementación y Tareas de Ingeniería — FEN Ayuda Trazable

Lista secuencial de tareas operativas para la entrega del producto mínimo viable en la hackatón:

## Fase 1: Endpoints Base e Integración de Insignias Automáticas (+80 Puntos Iniciales)
- [x] **1.0** Configuración de endpoints base de integración en Kiro IDE con ruteo HTTP determinista y normalización de rutas sin trailing slashes (`/health/` → `/health`).
- [x] **1.1** Implementación del health check `GET /health` exponiendo el identificador de equipo en JSON plano (`{"status": "ok", "team": "NexusLabs"}`) [+20 Pts].
- [x] **1.2** Construcción del repositorio de persistencia para `/items` con soporte de identificadores nonce (`POST /items` [201], `GET /items/{id}` [200], `GET /items` [200]) [+25 Pts].
- [x] **1.3** Desarrollo del manejador de tareas asíncronas `/jobs` con inversión algorítmica de cadenas Unicode segura y respuesta `202 Accepted` (`POST /jobs`, polling `GET /jobs/{jobId}`) [+35 Pts].

## Fase 2: Inteligencia Artificial Generativa y Clasificación de Emergencia (+40 Puntos GenAI)
- [x] **2.0** Integración del cliente Bedrock Runtime consumiendo modelos fundacionales (`anthropic.claude-3-haiku-20240307-v1:0`) en `/necesidades/ia` usando la Messages API oficial para clasificar en `categoria`, `urgencia` y `prioridad_despacho` [+40 Pts].
- [x] **2.1** Implementación de clasificador de contingencia determinista de alta disponibilidad ante cortes o picos de latencia en zonas de emergencia.

## Fase 3: Frontend Humanitario Multi-Rol y Consola de Evaluación
- [x] **3.1** Desarrollo de capa cliente HTTP resiliente en `src/services/api.ts` con modo híbrido, telemetría y consola de logs.
- [x] **3.2** Módulo **Solicitante:** Portal de albergues Piura y Catacaos con entrada de texto libre y escáner Bedrock en vivo.
- [x] **3.3** Módulo **Donante:** Catálogo de necesidades y emisión de recibo digital con código `tracking_id` (`TRK-FEN-2026`).
- [x] **3.4** Módulo **Coordinador:** Mesa de cruce inteligente Donación → Necesidad emparejando por categoría y orden de prioridad (`CRITICA` → `ALTA` → `MODERADA`).
- [x] **3.5** Módulo **Logístico:** Tablero de despacho para operadores con pipeline visual de 4 etapas (`REGISTRADO` → `ASIGNADO` → `EN_RUTA` → `ENTREGADO`) y listado `GET /donaciones`.
- [x] **3.6** Módulo **Trazabilidad:** Consulta pública por `tracking_id` con línea de tiempo auditada y nodo activo en tiempo real.
- [x] **3.7** Módulo **Administrador:** Dashboard operativo con métricas ejecutivas y certificador pre-portal de las 5 insignias (150 Pts).

## Fase 4: Despliegue y Enlace Final
- [ ] **4.1** Despliegue de la interfaz de usuario en Vercel / AWS CloudFront + S3.
- [ ] **4.2** Enlace directo con AWS Lambda Function URL (`ayuda-trazable-api`) sin trailing slashes.
- [ ] **4.3** Ejecución del verificador automatizado y validación final de 150 puntos.
