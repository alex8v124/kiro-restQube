# Plan de Ingeniería y Desglose Secuencial de Tareas — FEN Ayuda Trazable

## Fase 1: Especificación Kiro y Contratos de Verificación (+30 Pts Maestría Kiro)
- [x] **TASK-101:** Definir requisitos funcionales y no funcionales en `.kiro/specs/ayuda-trazable/requirements.md` empleando sintaxis formal EARS (>300 caracteres).
- [x] **TASK-102:** Documentar la arquitectura serverless, modelo de datos y contratos HTTP en `.kiro/specs/ayuda-trazable/design.md` (>300 caracteres).
- [x] **TASK-103:** Configurar directrices de seguridad, códigos HTTP canónicos (200, 201, 202) y política IAM sin credenciales fijas en `.kiro/steering/fen-rules.md` (>200 caracteres).
- [x] **TASK-104:** Implementar hooks automatizados de auditoría de sintaxis y esquemas JSON en `.kiro/hooks/auto-audit.json` con llaves `when` y `then`.

## Fase 2: Desarrollo del Frontend Multi-Rol e Inspector de Insignias
- [x] **TASK-201:** Construir la capa de cliente HTTP `src/services/api.ts` leyendo `VITE_API_URL` sin barra final, con soporte de códigos 200/201/202/404, telemetría de latencia y compatibilidad entre variantes de handlers.
- [x] **TASK-202:** Implementar módulo **Solicitante** con formulario de reporte de albergues (Piura / Catacaos) y visualización de la clasificación de Amazon Bedrock (`categoria`, `urgencia`, `prioridad_despacho`).
- [x] **TASK-203:** Implementar módulo **Donante** con catálogo de necesidades priorizadas, registro de aportes y generación de código de rastreo `tracking_id` (`TRK-FEN-2026`).
- [x] **TASK-204:** Implementar módulos **Coordinador** y **Logístico** para asignación inteligente `donación → necesidad` y control de despacho en ruta (`REGISTRADO` → `ASIGNADO` → `EN_RUTA` → `ENTREGADO`).
- [x] **TASK-205:** Implementar vista pública de **Trazabilidad** por `tracking_id` y **Panel de Administrador** con Dashboard operativo y consola interactiva de certificación para probar en vivo `GET /health` (+20), `/items` (+25) y `/jobs` (+35).

## Fase 3: Backend Unificado AWS Lambda y Amazon Bedrock (+120 Pts Operativos)
- [ ] **TASK-301:** Unificar en un solo handler de AWS Lambda los endpoints de evaluación (`/health`, `/items`, `/jobs`) junto con las rutas de dominio FEN (`/necesidades`, `/donaciones`, `/asignaciones`, `/entregas`, `/trazabilidad`, `/dashboard`).
- [ ] **TASK-302:** Integrar Amazon Bedrock Runtime (`anthropic.claude-3-haiku-20240307-v1:0`) con rol IAM `bedrock:InvokeModel` y fallback determinista de alta disponibilidad.
