# FEN Ayuda Trazable

> **AWS & Kiro Hackathon 2026 (IAThon Kiro)** · Frente: *Solidaridad y ayuda humanitaria ante el Fenómeno El Niño (FEN)* · Reto: **Ayuda trazable** · Equipo: **NexusLabs**

La Coordinadora de Albergue reporta una necesidad urgente y recibe en segundos la categoría, urgencia y prioridad de despacho clasificadas por IA, para que la ayuda humanitaria en Piura y Catacaos llegue a quien la necesita sin perderse en el camino.

Plataforma serverless de coordinación humanitaria ante el Fenómeno El Niño. Convierte reportes en lenguaje natural en flujos trazables de **donación → asignación → entrega**, identificados por un `tracking_id` único visible para cada actor del sistema.

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS 4 (6 vistas por rol) |
| **Backend** | AWS Lambda — `src/app.py` (Python 3.12, handler `src.app.lambda_handler`, desplegado por `template.yaml`) |
| **Base de datos** | Amazon DynamoDB (tablas por dominio, PAY_PER_REQUEST) |
| **IA** | Amazon Bedrock Runtime — `anthropic.claude-3-haiku-20240307-v1:0` |
| **Infraestructura** | AWS SAM / API Gateway HTTP + Lambda Function URL |
| **Orquestación** | Kiro (`.kiro/`) — specs, steering y hooks auditables |

## Inicio rápido

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Configurar la URL del backend
cp .env.example .env
# Editar VITE_API_URL con la Lambda Function URL (HTTPS, sin barra final)

# 3. Levantar el frontend en desarrollo (http://localhost:5173)
npm run dev

# 4. Build de producción
npm run build
npm run preview

# 5. Pruebas del backend
python3 -m venv .venv && .venv/bin/pip install pytest -r requirements.txt
.venv/bin/python -m pytest -q tests
```

## Despliegue del backend

```bash
sam build
sam deploy --guided
```

## Roles

| Rol | Acción principal | Endpoint |
|-----|-----------------|----------|
| Solicitante | Reporta necesidades del albergue → clasificación Bedrock | `POST /necesidades` |
| Donante | Registra aportes → genera `tracking_id` | `POST /donaciones` |
| Coordinador | Asigna donación ↔ necesidad | `POST /asignaciones` |
| Logístico | Controla estado de ruta hasta entrega | `POST /entregas` |
| Trazabilidad | Consulta línea de tiempo por `tracking_id` | `GET /trazabilidad` |
| Administrador | Consola de certificación (verificador oficial) | `GET /health`, `POST /items`, `POST /jobs` |

## API / Endpoints

### Verificador automático (150 pts)

| Endpoint | Método | Respuesta | Pts |
|---|---|---|---|
| `/health` | GET | `{"status":"ok","team":"<teamId>"}` | +20 |
| `/items` | POST | `201 {"id","value"}` | +25 |
| `/items/{id}` · `/items` | GET | `200` | |
| `/jobs` | POST | `202 {"jobId"}` | +35 |
| `/jobs/{jobId}` | GET | `200 {"status":"done","output"}` | |

### Endpoints de dominio FEN

| Endpoint | Método | Descripción |
|---|---|---|
| `/necesidades` | GET / POST | Requerimientos de albergues |
| `/necesidades/ia` | POST | Clasificación GenAI con Bedrock |
| `/donaciones` | GET / POST | Donaciones y emisión de `tracking_id` |
| `/asignaciones` | GET / POST | Cruce Donación → Necesidad |
| `/entregas/{tracking_id}` | PUT / POST | Avance de estado logístico (`EN_RUTA`, `ENTREGADO`) |
| `/trazabilidad/{tracking_id}` | GET | Detalle público por `tracking_id` (404 si no existe) |
| `/dashboard` | GET | Métricas de impacto |

## Clasificación Bedrock

- **Modelo:** `anthropic.claude-3-haiku-20240307-v1:0`
- **Categorías:** `AGUA_SANEAMIENTO` · `ALIMENTOS_PERECIBLES` · `SALUD_EPIDEMIAS` · `ALBERGUE_TEMPORAL`
- **Urgencias:** `CRITICA` · `ALTA` · `MODERADA`
- **Prioridades:** `1` (mayor) · `2` · `3`
- **Validación de la salida del modelo:** `categoria` y `urgencia` deben pertenecer al enum (si no, se descarta la respuesta y se usa el fallback); `prioridad_despacho` se deriva de la urgencia (`CRITICA→1`, `ALTA→2`, `MODERADA→3`); `cantidad` se acota a 1–10 000 e `insumo_principal` a 120 caracteres.
- **Fallback determinista** siempre disponible (marca `fallback: true` ante throttling o latencia). Cada fallback queda registrado en CloudWatch Logs con el código de error de Bedrock (`ThrottlingException`, `AccessDeniedException`, etc.) o el motivo del parseo fallido.

## Despliegue del frontend

- **Vercel:** importa el repo (framework **Vite**), build `npm run build`, output `dist`, y configura `VITE_API_URL` / `VITE_TEAM_ID`.
- **GitLab Pages:** el `.gitlab-ci.yml` incluye auditoría estática de `.kiro/` + build + publicación.
- **AWS CloudFront + S3:** compila y sube `dist/` a un bucket S3 con CloudFront como CDN (configura `404.html` para SPA).

## Puntuación objetivo (1000 pts)

| Entrega | Pts |
|---|---|
| Código (estático + agente) | 350 |
| Pitch | 250 |
| Frontend | 150 |
| Documento | 100 |
| Bonus (insignias) | 150 |

## Convenciones

Ver [`.kiro/steering/project.md`](.kiro/steering/project.md) y `.kiro/steering/fen-rules.md`.

## Spec

Ver `.kiro/specs/ayuda-trazable/` — `requirements.md`, `design.md`, `tasks.md`.

## Control de acceso (alcance de la demo)

Las 6 vistas por rol son un **selector de perspectiva para la demo**, no un mecanismo de autorización: el frontend no autentica usuarios y la Lambda se expone con `FunctionUrlConfig.AuthType: NONE`, por lo que cualquier visitante puede abrir cualquier vista y llamar a cualquier endpoint. Es aceptable aquí porque todos los datos son simulados y no hay información personal.

Para producción, el siguiente paso es Amazon Cognito (User Pool con grupos `solicitante`, `donante`, `coordinador`, `logistico`, `administrador`) y un JWT authorizer en el HTTP API que valide el grupo por ruta (por ejemplo, `POST /asignaciones` solo para `coordinador`), además de ocultar en el frontend las vistas no permitidas según los claims del token.

## Datos simulados

Todos los datos son **ficticios** para la demo del IAThon. No se conectan sistemas externos reales ni se exponen datos personales de beneficiarios (se usan identificadores simulados como `ALB-####`, `TRK-####`, `DON-###`).
