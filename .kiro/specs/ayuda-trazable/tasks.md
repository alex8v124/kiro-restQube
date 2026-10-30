# Tareas — FEN Ayuda Trazable

Las tareas siguen el orden de la historia de usuario principal de punta a punta: primero el flujo verificable del evaluador oficial, luego el flujo humanitario FEN, finalmente las vistas y el pulido.

---

## Bloque 0 — Spec y contratos (ya hecho)

- [x] **T-001** Escribir `requirements.md` con problema, persona, historia de usuario, criterios de aceptación y siguiente paso post-evento (≥ 300 chars).
- [x] **T-002** Escribir `design.md` con arquitectura AWS mínima, cambios en `app.py` y en el frontend (≥ 300 chars).
- [x] **T-003** Escribir `tasks.md` en orden, pequeñas y comprobables, empezando por la historia principal (≥ 300 chars).
- [x] **T-004** Actualizar `fen-rules.md` con CORS, códigos HTTP canónicos y política IAM sin credenciales fijas.
- [x] **T-005** Actualizar `README.md` con el problema y la persona principal en la primera línea.
- [x] **T-006** Actualizar `.kiro/steering/project.md` con convenciones del producto.

---

## Bloque 1 — Verificador oficial (150 pts)

Estas tres tareas son la base del puntaje automático. Deben pasar antes de cualquier otra cosa.

- [ ] **T-101** Crear `src/app.py` con el handler unificado Python 3.12: enrutamiento por `rawPath`/`path` + método, cabeceras CORS en todas las respuestas, `OPTIONS /*` → 200.
  - Comprobación: `curl -s <URL>/health` → `{"status":"ok","team":"NexusLabs"}` con HTTP 200.

- [ ] **T-102** Implementar `GET /health` y `POST /items` + `GET /items` + `GET /items/{id}` con DynamoDB (`fen-items`).
  - Comprobación: `POST /items {"value":"hola"}` → HTTP 201 + `id`; `GET /items/{id}` → HTTP 200 con el mismo valor; `GET /items` → array con el ítem.

- [ ] **T-103** Implementar `POST /jobs` (HTTP 202, DynamoDB `fen-jobs`, TTL 1h) y `GET /jobs/{jobId}` (HTTP 200, `status: done`, `output` = nonce invertido).
  - Comprobación: `POST /jobs {"input":"abc"}` → `{"jobId":"<uuid>"}`; `GET /jobs/<uuid>` en ≤ 12 s → `{"status":"done","output":"cba"}`.

---

## Bloque 2 — Clasificación con Bedrock (historia principal)

- [ ] **T-201** Implementar `invoke_bedrock(texto)` en `app.py` con el prompt del sistema FEN y parseo del JSON de respuesta de Claude Haiku.
  - Comprobación: llamada directa → respuesta con `categoria`, `urgencia`, `prioridad_despacho`, `fallback: false`.

- [ ] **T-202** Implementar `classify_deterministic(texto)` como fallback: sin dependencias externas, retorna siempre JSON válido con `fallback: true`.
  - Comprobación: deshabilitar credenciales IAM de Bedrock temporalmente → respuesta sigue llegando con `fallback: true`.

- [ ] **T-203** Implementar `POST /clasificar` → HTTP 200 con `BedrockClassification`.
  - Comprobación: `POST /clasificar {"texto_reporte":"faltan medicamentos para niños con fiebre"}` → `{"categoria":"SALUD_EPIDEMIAS","urgencia":"CRITICA","prioridad_despacho":1}`.

---

## Bloque 3 — Rutas de dominio FEN

- [ ] **T-301** Implementar `POST /necesidades` (HTTP 201): invoca Bedrock, persiste en `fen-necesidades`, devuelve `NecesidadItem` completo.
  - Comprobación: body con `texto_reporte` → ítem con `id`, `categoria`, `urgencia` y `estado: ABIERTA`.

- [ ] **T-302** Implementar `GET /necesidades` → HTTP 200, array `NecesidadItem[]`.
  - Comprobación: scan `fen-necesidades` → devuelve el ítem creado en T-301.

- [ ] **T-303** Implementar `POST /donaciones` (HTTP 201): genera `tracking_id` formato `TRK-FEN-2026-NNN`, persiste en `fen-donaciones`.
  - Comprobación: respuesta contiene `tracking_id` con prefijo `TRK-FEN-2026-`.

- [ ] **T-304** Implementar `GET /donaciones` → HTTP 200, array `DonacionItem[]`.

- [ ] **T-305** Implementar `POST /asignaciones` (HTTP 201): persiste en `fen-asignaciones`, actualiza `estado` de `DonacionItem` a `ASIGNADO` y `NecesidadItem` a `ASIGNADA`.
  - Comprobación: `GET /donaciones` tras asignar → `estado: ASIGNADO`.

- [ ] **T-306** Implementar `GET /asignaciones` → HTTP 200, array `AsignacionItem[]`.

- [ ] **T-307** Implementar `POST /entregas` → HTTP 200: actualiza `estadoRuta` y `puntoControlActual` en `fen-asignaciones`.
  - Comprobación: avanzar a `EN_RUTA` y luego a `ENTREGADO`; `GET /asignaciones` refleja el cambio.

- [ ] **T-308** Implementar `GET /trazabilidad?tracking_id=<id>` → HTTP 200 con `TrazabilidadDetalle` o HTTP 404.
  - Comprobación: `tracking_id` inexistente → `{"error":"Not found"}` con HTTP 404.

- [ ] **T-309** Implementar `GET /dashboard` → HTTP 200 con `DashboardMetrics` calculado desde scans de las cinco tablas.

---

## Bloque 4 — Infraestructura y despliegue

- [ ] **T-401** Crear/actualizar `template.yaml` con todas las tablas DynamoDB, la función Lambda y el API Gateway HTTP API con CORS `*`.
  - Comprobación: `sam validate` sin errores.

- [ ] **T-402** Configurar variables de entorno en el Lambda (`TABLE_ITEMS`, `TABLE_JOBS`, `TABLE_NECESIDADES`, `TABLE_DONACIONES`, `TABLE_ASIGNACIONES`).

- [ ] **T-403** Configurar el rol IAM de ejecución con `bedrock:InvokeModel` y `dynamodb:PutItem/GetItem/Scan/UpdateItem` — sin credenciales fijas.
  - Comprobación: policy document no contiene `AccessKey` ni `SecretKey`.

- [ ] **T-404** Desplegar con `sam deploy`; copiar la Function URL a `.env` como `VITE_API_URL` (HTTPS, sin barra final).
  - Comprobación: `.env` tiene `VITE_API_URL=https://…lambda-url.us-east-1.on.aws` sin `/` final.

---

## Bloque 5 — Conexión frontend y smoke test

- [ ] **T-501** Verificar que `api.ts` en modo `live` conecta correctamente con la Function URL desplegada: `GET /health` desde la consola de `AdminView` → badge verde con HTTP 200.

- [ ] **T-502** Flujo E2E manual (historia de usuario principal):
  1. `SolicitanteView` → enviar reporte libre → tarjeta de clasificación aparece con `categoria`, `urgencia`, `prioridad_despacho`.
  2. `DonanteView` → registrar donación → `tracking_id` generado con formato `TRK-FEN-2026-NNN`.
  3. `CoordinadorView` → asignar donación a la necesidad → ambos estados cambian.
  4. `LogisticoView` → avanzar estado a `EN_RUTA` → `ENTREGADO`.
  5. `TrazabilidadView` → ingresar `tracking_id` → línea de tiempo con 4 etapas.
  - Comprobación: cada paso es visible en el `ApiInspectorDrawer` con el código HTTP correcto.

- [ ] **T-503** Ejecutar los tres flujos del verificador desde `AdminView` (consola de certificación):
  - `GET /health` → HTTP 200 ✓
  - `POST /items` → HTTP 201 ✓ + `GET /items/{id}` → HTTP 200 ✓
  - `POST /jobs` → HTTP 202 ✓ + `GET /jobs/{jobId}` → `status: done` en ≤ 12 s ✓

---

## Siguiente paso después del evento

**T-NEXT** Agregar notificaciones push al coordinador de albergue cuando su necesidad pasa a `EN_RUTA` o `ENTREGADO`, usando Amazon SNS (`sns:Publish`) y un nuevo endpoint `POST /suscripciones`. Requiere extender `template.yaml` con un `AWS::SNS::Topic` y actualizar el rol IAM con `sns:Publish`. Datos de contacto: solo números de teléfono ficticios (ej. `+51999000001`).
