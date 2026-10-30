# Frontend Minimalista y Accesible

Frontend alternativo **autocontenido** (HTML + CSS + JavaScript vanilla, sin build ni dependencias) para **Ayuda Trazable FEN**.

## Características

- **Minimalista**: una sola página, tema claro, tipografía de sistema, sin animaciones ni ruido visual.
- **Accesible**:
  - HTML semántico (`header`, `nav`, `main`, `section`, `form`, `label`).
  - Pestañas con patrón WAI-ARIA (navegación por flechas, `aria-selected`, `aria-controls`).
  - Enlace "saltar al contenido", foco visible, contraste AA, `prefers-reduced-motion`.
  - Mensajes de estado con `aria-live` y `role="status"`.
  - Barras de progreso con `role="progressbar"`.
- **Sin dependencias**: no requiere `npm`, se abre directamente en el navegador.

## Cómo usarlo

1. Abre `index.html` en tu navegador, **o** sírvelo de forma estática:

   ```bash
   npx serve .
   # o
   python -m http.server 8080
   ```

2. La URL de la API (Lambda) se puede cambiar en el campo del pie de página
   (se guarda en `localStorage`). Por defecto usa la Lambda de producción.

## Funcionalidades

| Pestaña | Endpoint |
|---|---|
| Inicio | `GET /health` + `GET /dashboard` |
| Necesidades | `GET /necesidades` |
| Donaciones | `GET /donaciones` |
| Seguimiento | `GET /trazabilidad/{tracking_id}` |
| Donar | `POST /donaciones` |
| Reportar | `POST /necesidades` |

> El backend ya responde CORS completo (`Access-Control-Allow-Origin: *` y
> preflight con métodos/headers), por lo que todo funciona desde el navegador
> sin necesidad de proxy.
