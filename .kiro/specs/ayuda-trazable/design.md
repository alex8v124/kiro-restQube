# Diseño de Arquitectura y Datos — FEN Ayuda Trazable

## 1. Arquitectura General Serverless
El sistema implementa una arquitectura desacoplada orientada a eventos de emergencia para el Fenómeno El Niño (Piura y Catacaos):

1. **Capa de Presentación (Frontend Web React + TypeScript + Vite):**
   - Navegación multi-rol para los 5 actores operativos (`Solicitante`, `Donante`, `Coordinador`, `Logístico`, `Administrador`) más vista pública de `Trazabilidad`.
   - Consume la URL pública de AWS Lambda Function URL configurada mediante `VITE_API_URL` (HTTPS sin barra diagonal final).
   - Capa de abstracción HTTP (`src/services/api.ts`) con normalización de esquemas, manejo explícito de códigos `200`, `201`, `202` y `404`, polling automático de jobs asíncronos (intervalo de 1s, timeout ≤ 12s) y consola de diagnóstico en vivo.

2. **Capa de Cómputo y API (AWS Lambda Function URL — `ayuda-trazable-api`):**
   - Único handler unificado de baja latencia con enrutamiento por `rawPath` / `path` y método HTTP.
   - Autenticación `NONE` y cabeceras CORS globales (`Access-Control-Allow-Origin: *`) con respuesta inmediata `200 OK` a preflight `OPTIONS`.
   - Rutas del verificador oficial: `GET /health`, `POST /items`, `GET /items`, `GET /items/{id}`, `POST /jobs`, `GET /jobs/{jobId}`.
   - Rutas de dominio humanitario FEN: `/necesidades`, `/donaciones`, `/asignaciones`, `/entregas`, `/trazabilidad`, `/dashboard` y `/clasificar`.

3. **Capa de Inteligencia Artificial (Amazon Bedrock Runtime):**
   - Integración directa mediante SDK nativo (`boto3` / `@aws-sdk/client-bedrock-runtime`) invocando `anthropic.claude-3-haiku-20240307-v1:0` en `us-east-1`.
   - Prompt estructurado del Centro de Operaciones FEN Piura que fuerza salida exclusivamente en formato JSON con campos `categoria`, `urgencia` y `prioridad_despacho`, respaldado por un clasificador determinista de contingencia (`fallback: true`).

4. **Modelo de Datos y Estado:**
   - Almacenamiento rápido en memoria y soporte para persistencia en Amazon DynamoDB para garantizar consistencia entre invocaciones concurrentes de Lambda.
