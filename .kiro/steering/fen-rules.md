# Directrices de Ingeniería y Seguridad — FEN Ayuda Trazable (Steering Rules)

Todas las respuestas expuestas hacia el verificador deben utilizar encabezados CORS globales (`Access-Control-Allow-Origin: *`, `Content-Type: application/json`) y códigos de estado HTTP canónicos: `200` (OK para lecturas y `/health`), `201` (Created para `POST /items`, `POST /necesidades` y `POST /donaciones`), `202` (Accepted para `POST /jobs` asíncronos) y `404` (Not Found para rutas o recursos inexistentes).

Se prohíbe estrictamente el uso de credenciales fijas, secretos hardcodeados o API keys en texto plano tanto en el frontend como en el repositorio; todas las autorizaciones hacia servicios externos de AWS (incluyendo Amazon Bedrock Runtime y Amazon DynamoDB) deben resolverse exclusivamente mediante políticas de roles nativos de AWS IAM. La URL base configurada en `VITE_API_URL` debe utilizar protocolo HTTPS público sin barra diagonal final.
