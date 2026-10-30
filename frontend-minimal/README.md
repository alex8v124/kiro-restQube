# Frontend Minimalista y Accesible

Frontend alternativo **autocontenido** (HTML + CSS + JavaScript vanilla, sin build ni dependencias) para **Ayuda Trazable FEN**, pensado para que lo use **cualquier persona sin conocimientos técnicos**.

## Cómo está organizado

En lugar de menús técnicos, la pantalla de inicio muestra **3 acciones grandes y claras**:

| Botón | Qué hace | Endpoint |
|---|---|---|
| 🎁 **Quiero donar** | Registra una donación y te da un código para seguirla | `POST /donaciones` |
| 🔍 **Seguir mi donación** | Escribe tu código y mira dónde está tu ayuda | `GET /trazabilidad/{id}` |
| 🆘 **Necesito ayuda** | Pide lo que tu comunidad necesita, con tus propias palabras | `POST /necesidades` |

También hay un enlace secundario **"Ver qué se necesita ahora"** para transparencia (lista los pedidos y las donaciones).

## Características de accesibilidad

- **Lenguaje llano**: "Quiero donar", "¿Qué necesitás?", sin tecnicismos ni códigos internos.
- **HTML semántico** (`header`, `main`, `section`, `form`, `label`).
- **Foco visible**, enlace "saltar al contenido", **contraste AA**, `prefers-reduced-motion`.
- **Mensajes de estado** con `aria-live` y `role="status"` (el usuario siempre sabe qué pasó).
- **Navegación simple**: 3 botones grandes + botón "← Volver", sin menús complejos.
- **Textos grandes** (17px) y botones amplios, fáciles de tocar.

## Cómo usarlo

1. Abre `index.html` en tu navegador, **o** sírvelo de forma estática:

   ```bash
   npx serve .
   # o
   python -m http.server 8080
   ```

2. La URL de la API está al inicio del `<script>` en la constante `API_BASE`
   (por defecto apunta a la Lambda de producción).

> El backend ya responde CORS completo, por lo que todo funciona desde el
> navegador sin necesidad de proxy.
