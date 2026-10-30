# Diseño — FEN Ayuda Trazable

## Visión general

Plataforma serverless de coordinación humanitaria ante el Fenómeno El Niño en Piura y Catacaos. Un único Lambda Python 3.12 detrás de API Gateway HTTP expone los endpoints del verificador oficial del hackathon y las rutas de dominio FEN. Amazon Bedrock clasifica reportes de necesidad en lenguaje natural; Amazon DynamoDB persiste el estado entre invocaciones concurrentes. El frontend React/TypeScript (Vite) consume todo desde `VITE_API_URL`.

---

## Arquitectura en AWS (mínima viable)

```
Navegador
  └── src/services/api.ts  (VITE_API_URL, sin barra final, HTTPS)
        │
        ▼ HTTPS
API Gateway HTTP API  (template.yaml: AWS::Serverless::Api)
        │
        ▼ Proxy {proxy+}
AWS Lambda  ayuda-trazable-api  (Python 3.12, IAM Role sin credenciales fijas)
        ├── GET  /health               → 200 {"status":"ok","team":"NexusLabs"}
        ├── POST /items                → 201  DynamoDB PutItem  fen-items
        ├── GET  /items / /items/{id}  → 200  DynamoDB GetItem / Scan
        ├── POST /jobs                 → 202  DynamoDB PutItem  fen-jobs (TTL 1h)
        ├── GET  /jobs/{jobId}         → 200  DynamoDB GetItem  fen-jobs
        ├── POST /necesidades          → 201  Bedrock → DynamoDB PutItem  fen-necesidades
        ├── GET  /necesidades          → 200  DynamoDB Scan
        ├── POST /donaciones           → 201  DynamoDB PutItem  fen-donaciones
        ├── GET  /donaciones           → 200  DynamoDB Scan
        ├── POST /asignaciones         → 201  DynamoDB PutItem  fen-asignaciones
        ├── GET  /asignaciones         → 200  DynamoDB Scan
        ├── POST /entregas             → 200  DynamoDB UpdateItem
        ├── GET  /trazabilidad?…       → 200/404
        ├── GET  /dashboard            → 200  (métricas agregadas desde Scan)
        ├── POST /clasificar           → 200  Bedrock o fallback determinista
        └── OPTIONS /*                 → 200  preflight CORS
        │
        ├── Amazon Bedrock Runtime  anthropic.claude-3-haiku-20240307-v1:0
        │     bedrock:InvokeModel  (IAM Role, sin API key)
        └── Amazon DynamoDB  (us-east-1)
              dynamodb:PutItem / GetItem / Scan / UpdateItem  (IAM Role)
```

### Servicios declarados en template.yaml

| Recurso SAM | Tipo | Configuración clave |
|-------------|------|---------------------|
| `AyudaTrazableFunction` | `AWS::Serverless::Function` | Runtime: python3.12, Handler: app.handler, Auth: NONE en FunctionUrl |
| `AyudaTrazableApi` | `AWS::Serverless::HttpApi` | CorsConfiguration: AllowOrigins `*`, AllowMethods `*` |
| `FenItemsTable` | `AWS::DynamoDB::Table` | PK: `id` (S), BillingMode: PAY_PER_REQUEST |
| `FenJobsTable` | `AWS::DynamoDB::Table` | PK: `jobId` (S), TTL attribute: `expireAt` |
| `FenNecesidadesTable` | `AWS::DynamoDB::Table` | PK: `id` (S) |
| `FenDonacionesTable` | `AWS::DynamoDB::Table` | PK: `tracking_id` (S), SK: `id` (S) |
| `FenAsignacionesTable` | `AWS::DynamoDB::Table` | PK: `id` (S) |
| `LambdaExecutionRole` | `AWS::IAM::Role` | Policies: BedrockInvokeModel + DynamoDBCRUD (sin credenciales fijas) |

---

## Qué cambia en src/app.py

El archivo `src/app.py` es el único handler Lambda. Estructura mínima:

```python
# src/app.py  —  handler unificado Python 3.12
import json, re, uuid, os, boto3
from datetime import datetime, timezone, timedelta

dynamodb = boto3.resource('dynamodb')
bedrock  = boto3.client('bedrock-runtime', region_name='us-east-1')

TABLE_ITEMS       = os.environ['TABLE_ITEMS']        # 'fen-items'
TABLE_JOBS        = os.environ['TABLE_JOBS']         # 'fen-jobs'
TABLE_NECESIDADES = os.environ['TABLE_NECESIDADES']  # 'fen-necesidades'
TABLE_DONACIONES  = os.environ['TABLE_DONACIONES']   # 'fen-donaciones'
TABLE_ASIGNACIONES = os.environ['TABLE_ASIGNACIONES']# 'fen-asignaciones'

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event, context):
    path   = (event.get('rawPath') or event.get('path', '/')).rstrip('/') or '/'
    method = event.get('requestContext', {}).get('http', {}).get('method', 'GET').upper()

    if method == 'OPTIONS':
        return resp(200, {})

    # Verificador oficial
    if path == '/health' and method == 'GET':
        return resp(200, {'status': 'ok', 'team': 'NexusLabs'})

    if path == '/items' and method == 'POST':
        return post_item(event)

    if path == '/items' and method == 'GET':
        return get_items()

    m = re.match(r'^/items/(.+)$', path)
    if m and method == 'GET':
        return get_item_by_id(m.group(1))

    if path == '/jobs' and method == 'POST':
        return post_job(event)

    m = re.match(r'^/jobs/(.+)$', path)
    if m and method == 'GET':
        return get_job_status(m.group(1))

    # Rutas de dominio FEN
    if path == '/necesidades' and method == 'POST':
        return post_necesidad(event)
    if path == '/necesidades' and method == 'GET':
        return get_necesidades()
    if path == '/donaciones' and method == 'POST':
        return post_donacion(event)
    if path == '/donaciones' and method == 'GET':
        return get_donaciones()
    if path == '/asignaciones' and method == 'POST':
        return post_asignacion(event)
    if path == '/asignaciones' and method == 'GET':
        return get_asignaciones()
    if path == '/entregas' and method == 'POST':
        return post_entrega(event)
    if path == '/trazabilidad' and method == 'GET':
        return get_trazabilidad(event)
    if path == '/dashboard' and method == 'GET':
        return get_dashboard()
    if path == '/clasificar' and method == 'POST':
        return clasificar(event)

    return resp(404, {'error': 'Not found'})


def resp(status, body):
    return {'statusCode': status, 'headers': CORS_HEADERS, 'body': json.dumps(body)}
```

### Integración Bedrock en `post_necesidad` y `clasificar`

```python
def invoke_bedrock(texto: str) -> dict:
    prompt = (
        "Eres el clasificador del Centro de Operaciones FEN Piura. "
        "Responde SOLO con JSON, sin texto adicional. "
        "Campos requeridos: categoria (AGUA_SANEAMIENTO|ALIMENTOS_PERECIBLES|"
        "SALUD_EPIDEMIAS|ALBERGUE_TEMPORAL), urgencia (CRITICA|ALTA|MODERADA), "
        f"prioridad_despacho (1|2|3).\n\nReporte: {texto}"
    )
    try:
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 128,
                'messages': [{'role': 'user', 'content': prompt}]
            }),
            contentType='application/json',
        )
        result = json.loads(json.loads(response['body'].read())['content'][0]['text'])
        result['fallback'] = False
        return result
    except Exception:
        return classify_deterministic(texto)


def classify_deterministic(texto: str) -> dict:
    t = texto.lower()
    if any(w in t for w in ['médico', 'medicina', 'enfermo', 'epidemia', 'salud', 'fiebre']):
        cat, urg, pri = 'SALUD_EPIDEMIAS', 'CRITICA', 1
    elif any(w in t for w in ['alimento', 'comida', 'ración', 'hambre', 'vívere']):
        cat, urg, pri = 'ALIMENTOS_PERECIBLES', 'ALTA', 2
    elif any(w in t for w in ['albergue', 'techo', 'refugio', 'cobija', 'colchón']):
        cat, urg, pri = 'ALBERGUE_TEMPORAL', 'MODERADA', 3
    else:
        cat, urg, pri = 'AGUA_SANEAMIENTO', 'ALTA', 2
    return {'categoria': cat, 'urgencia': urg, 'prioridad_despacho': pri, 'fallback': True}
```

---

## Qué cambia en src/web/ (frontend React/TypeScript)

El frontend ya está completo en `src/`. Los únicos cambios necesarios después de desplegar el backend son:

1. **`.env`** — actualizar `VITE_API_URL` con la Lambda Function URL real (HTTPS, sin barra final).
2. **`src/services/api.ts`** — sin cambios estructurales; el modo `live` enviará peticiones reales al Lambda desplegado.
3. **`SolicitanteView.tsx`** — ya muestra `fallbackBedrock: true` con una insignia visual si Bedrock no responde.
4. **`AdminView.tsx`** — la consola de certificación ya ejecuta los tres flujos del verificador oficial (`/health`, `/items`, `/jobs`).

No se agregan nuevas dependencias npm ni se modifica la configuración de Vite.

---

## Modelo de datos DynamoDB (resumen)

| Tabla | PK | SK | Campos clave |
|-------|----|----|--------------|
| `fen-items` | `id` | — | `value` |
| `fen-jobs` | `jobId` | — | `input`, `output`, `status`, `expireAt` (TTL) |
| `fen-necesidades` | `id` | — | `textoReporte`, `categoria`, `urgencia`, `prioridad_despacho`, `estado`, `fallbackBedrock` |
| `fen-donaciones` | `tracking_id` | `id` | `descripcion`, `cantidad`, `categoria`, `estado` |
| `fen-asignaciones` | `id` | — | `donacionId`, `necesidadId`, `tracking_id`, `estadoRuta` |

---

## Flujos de estado

**Donación / Asignación:** `REGISTRADO → ASIGNADO → EN_RUTA → ENTREGADO`

**Necesidad:** `ABIERTA → ASIGNADA → EN_RUTA → ATENDIDA`

---

## Seguridad

- Sin credenciales fijas en código ni en repositorio. El Lambda resuelve DynamoDB y Bedrock mediante el rol IAM de ejecución.
- `VITE_API_URL` es variable de entorno Vite (prefijo `VITE_`); no contiene secretos.
- CORS global (`Access-Control-Allow-Origin: *`) es intencional para el verificador del hackathon.
- `AuthType: NONE` en la Function URL es requerido por el evaluador automático.
