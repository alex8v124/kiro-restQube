# Requisitos — FEN Ayuda Trazable

## 1. Problema y contexto

El Fenómeno El Niño provoca inundaciones recurrentes en Piura y Catacaos. Los coordinadores de albergues reportan necesidades urgentes por teléfono o mensajes informales; los donantes no saben adónde va su aporte; los operadores logísticos improvisan rutas sin un registro compartido. El resultado es ayuda mal dirigida, duplicada o extraviada mientras familias damnificadas esperan recursos críticos.

**FEN Ayuda Trazable** convierte ese caos en un flujo digital trazable: reporte de necesidad → clasificación automática con IA → registro de donación → asignación logística → entrega verificada, todo identificado por un `tracking_id` único visible para cada actor.

---

## 2. Persona principal (usuario del track)

**La Coordinadora de Albergue** — representada en el sistema como rol `Solicitante` — es la persona que opera directamente en el centro de atención (Albergue Catacaos, Albergue Piura Centro u otros). Su perfil simulado:

- Nombre ficticio de prueba: **Coord. Albergue Demo**
- Ubicación: Piura / Catacaos, zona de emergencia FEN
- Dispositivo: smartphone o tablet con conectividad limitada
- Necesidad inmediata: reportar en texto libre lo que falta en el albergue y recibir una prioridad de despacho en segundos, sin formularios complejos

Todos los datos de personas usados en el sistema son **simulados o genéricos**; ningún nombre real, correo ni teléfono aparece en el código o en la base de datos.

---

## 3. Historia de usuario principal (punta a punta para el evento)

> **Como coordinadora de albergue**, quiero escribir en lenguaje natural lo que falta en mi centro (agua, medicamentos, alimentos, refugio) y que el sistema me diga de inmediato la categoría, la urgencia y la prioridad de despacho, para poder coordinar con el COER sin perder tiempo llenando formularios.

### Criterios de aceptación verificables

| ID | Criterio | Verificación |
|----|----------|--------------|
| AC-01 | `POST /necesidades` con `{"texto_reporte": "…"}` devuelve HTTP **201** con un objeto `NecesidadItem` que incluye `categoria`, `urgencia` y `prioridad_despacho` poblados | Llamada directa desde `AdminView` o `curl` |
| AC-02 | La clasificación proviene de Amazon Bedrock (`anthropic.claude-3-haiku-20240307-v1:0`); si Bedrock falla, el campo `fallbackBedrock: true` aparece en la respuesta y la operación no se interrumpe | Revisar respuesta JSON; forzar error de red para probar fallback |
| AC-03 | El registro queda persistido en DynamoDB (`fen-necesidades`) y es recuperable vía `GET /necesidades` con HTTP **200** en menos de 12 s | `GET /necesidades` tras el POST devuelve array con el ítem creado |
| AC-04 | La `SolicitanteView` muestra la tarjeta de clasificación (categoría con color, urgencia, prioridad) sin recargar la página | Demo visual en el navegador |
| AC-05 | Todas las respuestas llevan cabeceras `Access-Control-Allow-Origin: *` y `Content-Type: application/json` | Inspector de red del navegador o `curl -I` |
| AC-06 | `GET /health` devuelve HTTP **200** con `{"status":"ok","team":"NexusLabs"}` | Consola de certificación en `AdminView` |
| AC-07 | `POST /items` devuelve HTTP **201**; `POST /jobs` devuelve HTTP **202** y el job termina con `status: done` en ≤ 12 s | Consola de certificación en `AdminView` |

---

## 4. Requisitos de soporte (EARS)

- **REQ-F1 (Event-Driven):** WHEN `POST /items` recibe `{"value":"<nonce>"}`, the system SHALL persist the record and return HTTP 201 with `{"id":"<itemId>","value":"<nonce>"}`.
- **REQ-F2 (Event-Driven):** WHEN `POST /jobs` recibe `{"input":"<nonce>"}`, the system SHALL return HTTP 202 with `{"jobId":"<uuid>"}` and, when queried via `GET /jobs/{jobId}` within 12 s, return `{"status":"done","output":"<nonce invertido>"}`.
- **REQ-F3 (Event-Driven):** WHEN `POST /necesidades` recibe un texto libre, the system SHALL invoke Bedrock and return HTTP 201 with `categoria`, `urgencia` y `prioridad_despacho`.
- **REQ-F4 (Unwanted):** IF Bedrock is unavailable, the system SHALL execute the deterministic fallback classifier and return `fallbackBedrock: true` without interrupting operations.
- **REQ-F5 (Ubiquitous):** The system SHALL expose `GET /health` without authentication returning HTTP 200 with `{"status":"ok","team":"NexusLabs"}`.
- **REQ-NF1 (Security):** No hardcoded credentials, API keys or secrets SHALL appear in source code or repository; all AWS access is resolved via IAM execution role.
- **REQ-NF2 (CORS):** Every response SHALL include `Access-Control-Allow-Origin: *` and respond HTTP 200 to `OPTIONS` preflight requests.
- **REQ-NF3 (Latency):** All synchronous endpoints SHALL respond within 12 seconds under hackathon evaluator conditions.

---

## 5. Siguiente paso después del evento

Una vez terminado el hackathon, el próximo incremento es habilitar notificaciones push al coordinador de albergue cuando el estado de su necesidad cambia a `EN_RUTA` o `ENTREGADO`, usando Amazon SNS y un endpoint `POST /suscripciones` con número de teléfono simulado. Esto cierra el ciclo de trazabilidad sin requerir que el coordinador refresque la app manualmente.
