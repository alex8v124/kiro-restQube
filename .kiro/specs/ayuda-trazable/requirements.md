# Requisitos del Sistema — FEN Ayuda Trazable (Sintaxis EARS)

## 1. Contexto Operativo
Plataforma humanitaria serverless para la coordinación, priorización mediante IA generativa (Amazon Bedrock) y trazabilidad de extremo a extremo de ayuda humanitaria ante el Fenómeno El Niño (FEN) en los centros poblados y albergues de Piura y Catacaos.

## 2. Requisitos Funcionales y No Funcionales (EARS)

- **REQ-01 (Ubiquitous - Salud y Disponibilidad):** The system SHALL expose a public `GET /health` endpoint without authentication that immediately returns HTTP 200 with a JSON payload containing `{"status": "ok", "team": "NexusLabs"}` matching the official hackathon portal team identifier.
- **REQ-02 (Event-Driven - Persistencia de Ítems):** WHEN a client sends a `POST /items` request with a JSON payload `{"value": "<nonce>"}`, the system SHALL persist the record and return HTTP 201 Created with `{"id": "<itemId>", "value": "<nonce>"}`.
- **REQ-03 (Event-Driven - Consulta de Ítems):** WHEN a client requests `GET /items/{id}` or `GET /items`, the system SHALL return HTTP 200 OK with the matching item object or full collection array within the 12-second evaluator timeout.
- **REQ-04 (Event-Driven - Procesamiento Asíncrono):** WHEN a client sends `POST /jobs` with `{"input": "<nonce>"}`, the system SHALL immediately respond with HTTP 202 Accepted and `{"jobId": "<uuid>"}`, and WHEN queried via `GET /jobs/{jobId}` within 12 seconds, the system SHALL return HTTP 200 with `{"status": "done", "output": "<nonce invertido>"}`.
- **REQ-05 (Event-Driven - Clasificación GenAI con Amazon Bedrock):** WHEN a shelter requester submits a free-text humanitarian need report from Piura or Catacaos, the system SHALL invoke Amazon Bedrock Runtime (`anthropic.claude-3-haiku-20240307-v1:0`) to classify the report into `categoria` (`AGUA_SANEAMIENTO`, `ALIMENTOS_PERECIBLES`, `SALUD_EPIDEMIAS`, `ALBERGUE_TEMPORAL`), `urgencia` (`CRITICA`, `ALTA`, `MODERADA`), and `prioridad_despacho` (`1`, `2`, `3`).
- **REQ-06 (Unwanted Behavior - Fallback Determinista):** IF Amazon Bedrock Runtime experiences throttling, latency spikes, or connectivity failure during an emergency, THEN the system SHALL execute a deterministic high-availability fallback classification returning valid structured JSON without interrupting shelter operations.
- **REQ-07 (State-Driven - Trazabilidad por Rol):** WHILE operating in emergency response mode, the frontend application SHALL provide role-based views for Solicitante, Donante, Coordinador, Logístico, and Administrador, enabling end-to-end tracking via `tracking_id` from donation registration to final shelter delivery.
