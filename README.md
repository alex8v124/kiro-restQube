# FEN Ayuda Trazable — La Coordinadora de Albergue reporta una necesidad urgente y recibe en segundos la categoría, urgencia y prioridad de despacho clasificadas por IA, para que la ayuda humanitaria en Piura y Catacaos llegue a quien la necesita sin perderse en el camino.

Plataforma serverless de coordinación humanitaria ante el Fenómeno El Niño. Convierte reportes en lenguaje natural en flujos trazables de donación → asignación → entrega, identificados por un `tracking_id` único visible para cada actor del sistema.

## Stack

- **Frontend:** React 18 + TypeScript + Vite (6 vistas por rol)
- **Backend:** AWS Lambda Python 3.12 (handler único)
- **Base de datos:** Amazon DynamoDB (5 tablas, PAY_PER_REQUEST)
- **IA:** Amazon Bedrock Runtime — `anthropic.claude-3-haiku-20240307-v1:0`
- **Infraestructura:** AWS SAM (`template.yaml`) — API Gateway HTTP + Lambda Function URL

## Inicio rápido

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Configurar la URL del backend
cp .env.example .env
# Editar VITE_API_URL con la Lambda Function URL (HTTPS, sin barra final)

# 3. Levantar el frontend en desarrollo
npm run dev
```

## Despliegue del backend

```bash
sam build
sam deploy --guided
```

## Roles

| Rol | Acción principal |
|-----|-----------------|
| Solicitante | Reporta necesidades del albergue → clasificación Bedrock |
| Donante | Registra aportes → genera `tracking_id` |
| Coordinador | Asigna donación ↔ necesidad |
| Logístico | Controla estado de ruta hasta entrega |
| Trazabilidad | Consulta línea de tiempo por `tracking_id` |
| Administrador | Consola de certificación (verificador oficial) |

## Convenciones

Ver `.kiro/steering/project.md` y `.kiro/steering/fen-rules.md`.

## Spec

Ver `.kiro/specs/ayuda-trazable/` — `requirements.md`, `design.md`, `tasks.md`.
