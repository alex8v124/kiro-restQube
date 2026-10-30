# Convenciones del Producto — FEN Ayuda Trazable

## Identidad del proyecto

**FEN Ayuda Trazable** es una plataforma serverless de coordinación humanitaria para el Fenómeno El Niño en Piura y Catacaos. Convierte reportes en lenguaje natural de coordinadoras de albergue en flujos trazables de donación → asignación → entrega, con clasificación automática via Amazon Bedrock.

- **Team ID del hackathon:** `NexusLabs` (aparece en `GET /health` y en `VITE_TEAM_ID`)
- **Año de operación:** 2026
- **Formato de tracking_id:** `TRK-FEN-2026-NNN` (NNN = número aleatorio de 3 dígitos o más)
- **Región AWS:** `us-east-1`

---

## Estructura de carpetas

```
src/                        Frontend React + TypeScript (Vite)
  components/views/         Una vista por rol (6 roles)
  components/ui/            Componentes reutilizables (Badges, etc.)
  services/api.ts           Única capa HTTP del frontend
  types/fen.ts              Contratos TypeScript del dominio
src/app.py                  Handler Lambda Python 3.12 (backend único)
template.yaml               SAM/CloudFormation: API GW, Lambda, DynamoDB
.env / .env.example         VITE_API_URL y VITE_TEAM_ID (sin secretos AWS)
.kiro/specs/ayuda-trazable/ requirements.md · design.md · tasks.md
.kiro/steering/             project.md · fen-rules.md
```

---

## Convenciones de código

### Backend (Python 3.12 — `src/app.py`)

- Handler único `handler(event, context)`. Sin frameworks externos (solo `boto3` + stdlib).
- Enrutar por `rawPath` primero, luego `path`; limpiar trailing slash con `.rstrip('/')`.
- `resp(status, body)` es la única función que construye respuestas; siempre incluye `CORS_HEADERS`.
- Nombres de tablas DynamoDB desde variables de entorno (`os.environ['TABLE_*']`); nunca hardcodeados.
- No usar credenciales fijas. Todo acceso a AWS via rol IAM de ejecución del Lambda.
- Jobs asíncronos: persistir en `fen-jobs` con campo `expireAt` (TTL de 1 hora en epoch segundos).
- Bedrock: capturar cualquier excepción y caer al `classify_deterministic()` con `fallback: True`.

### Frontend (TypeScript — React + Vite)

- Toda comunicación HTTP pasa por `src/services/api.ts`. No usar `fetch` directamente en componentes.
- `VITE_API_URL`: leer desde `import.meta.env.VITE_API_URL`; aplicar `.trim().replace(/\/+$/, '')` antes de usar.
- Modo de conexión: `live` | `hybrid` | `mock` — persiste en `localStorage` bajo `fen_kiro_api_mode`.
- Tipos: todos los contratos de dominio en `src/types/fen.ts`. No definir interfaces inline en componentes.
- Datos de demo: usar datos ficticios con nombres genéricos (`Coord. Albergue Demo`, `ALB-CATACAOS-02`). Nunca nombres reales, correos ni teléfonos reales.

---

## Códigos HTTP canónicos

| Situación | Código |
|-----------|--------|
| Lectura exitosa, `/health` | 200 |
| Creación (`POST /items`, `POST /necesidades`, `POST /donaciones`, `POST /asignaciones`) | 201 |
| Job asíncrono aceptado (`POST /jobs`) | 202 |
| Ruta o recurso inexistente | 404 |
| Error interno (DynamoDB, parsing) | 500 |
| Preflight CORS (`OPTIONS`) | 200 |

---

## Cabeceras CORS obligatorias

Todas las respuestas del Lambda incluyen:

```
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Roles del sistema

| ID | Label | Endpoint principal |
|----|-------|--------------------|
| `solicitante` | Solicitante | `POST /necesidades` |
| `donante` | Donante | `POST /donaciones` |
| `coordinador` | Coordinador | `POST /asignaciones` |
| `logistico` | Logístico | `POST /entregas` |
| `trazabilidad` | Trazabilidad | `GET /trazabilidad` |
| `administrador` | Administrador | `GET /health`, `POST /items`, `POST /jobs` |

---

## Clasificación Bedrock

- Modelo: `anthropic.claude-3-haiku-20240307-v1:0`
- Permiso IAM: `bedrock:InvokeModel` (sin API key, sin credencial fija)
- Categorías válidas: `AGUA_SANEAMIENTO` | `ALIMENTOS_PERECIBLES` | `SALUD_EPIDEMIAS` | `ALBERGUE_TEMPORAL`
- Urgencias válidas: `CRITICA` | `ALTA` | `MODERADA`
- Prioridades: `1` (mayor urgencia) · `2` · `3`
- Fallback determinista siempre disponible; marca `fallback: true` en la respuesta

---

## Variables de entorno

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `.env` (frontend) | Lambda Function URL, HTTPS, sin `/` final |
| `VITE_TEAM_ID` | `.env` (frontend) | `NexusLabs` |
| `TABLE_ITEMS` | Lambda env | Nombre de la tabla DynamoDB `fen-items` |
| `TABLE_JOBS` | Lambda env | Nombre de la tabla DynamoDB `fen-jobs` |
| `TABLE_NECESIDADES` | Lambda env | Nombre de la tabla DynamoDB `fen-necesidades` |
| `TABLE_DONACIONES` | Lambda env | Nombre de la tabla DynamoDB `fen-donaciones` |
| `TABLE_ASIGNACIONES` | Lambda env | Nombre de la tabla DynamoDB `fen-asignaciones` |

Ninguna de estas variables contiene secretos de AWS. Las credenciales de AWS nunca aparecen en código, `.env` ni en el repositorio.
