# Diseño Técnico y Arquitectura de Trazabilidad Humanitaria

La arquitectura se fundamenta en un desacoplamiento estricto Serverless bajo la infraestructura de Amazon Web Services (AWS) para garantizar costo marginal cero en inactividad y tolerancia a picos masivos de demanda.

## Componentes y Flujo de Datos
- **Capa Perimetral (Ingress):** Enrutamiento mediante AWS Lambda Function URLs con políticas CORS globales habilitadas para clientes web móviles y respuestas 200 OK a solicitudes preflight `OPTIONS`. Normalización estricta de rutas eliminando trailing slashes (`/health/` → `/health`).
- **Motor de Cómputo:** Funciones AWS Lambda ejecutando lógica determinista de emparejamiento entre requerimientos de albergues y lotes de donación registrados, cruzando por categoría humanitaria (`AGUA_SANEAMIENTO`, `ALIMENTOS_PERECIBLES`, `SALUD_EPIDEMIAS`, `ALBERGUE_TEMPORAL`) y orden de prioridad (`CRITICA` → `ALTA` → `MODERADA`).
- **Inferencia Generativa:** Amazon Bedrock Runtime procesando reportes de campo no estructurados a través del modelo `anthropic.claude-3-haiku-20240307-v1:0` en el endpoint `/necesidades/ia` usando la Messages API oficial para convertirlos en entidades estructuradas con `categoria`, `urgencia` y `prioridad_despacho`. Respaldado por clasificador determinista de contingencia.
- **Capa de Presentación:** Aplicación Web React + TypeScript + Vite con diseño temático de Centro de Operaciones FEN (Piura y Catacaos) con 5 roles especializados más trazabilidad pública por `tracking_id`.
- **Insignias y Verificador Oficial:** Soporte nativo y validación de las 3 insignias automáticas: `GET /health` (+20 Pts), `POST /items` y `GET /items` (+25 Pts), y `POST /jobs` asíncrono con polling a `GET /jobs/{jobId}` e inversión algorítmica Unicode segura (+35 Pts).
