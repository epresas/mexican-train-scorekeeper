# Team MCP Configuration

Este directorio configura los servidores MCP (*Model Context Protocol*) compartidos para el equipo dentro del proyecto `mexican-train-scorekeeper`.

Antigravity detecta automáticamente este plugin desde `.agents/plugins/team-mcp/` al clonar o abrir el repositorio.

## Servidores Configurados

### 1. Playwright (`playwright`)
- **Paquete:** `@playwright/mcp`
- **Uso:** Pruebas E2E, validaciones snapshot en navegador y automatización.
- **Requisito inicial:** Si no tienes instalados los navegadores de Playwright en tu entorno, ejecuta una vez:
  ```bash
  npx playwright install
  ```

### 2. Chrome DevTools (`chrome-devtools`)
- **Paquete:** `chrome-devtools-mcp`
- **Uso:** Navegación, inspección, console logs y debugging avanzado mediante Chrome DevTools Protocol.
- **Requisito inicial:** Disponer de Google Chrome o Chromium en el sistema.

### 3. Google Drive (`google-drive`)
- **Paquete:** `@modelcontextprotocol/server-gdrive`
- **Uso:** Búsqueda, lectura y acceso a archivos de Google Drive / Workspace.
- **Autenticación (OAuth):**
  1. En [Google Cloud Console](https://console.cloud.google.com/):
     - Crea o selecciona un proyecto.
     - Habilita la **Google Drive API**.
     - Configura la pantalla de consentimiento OAuth (*OAuth consent screen*).
     - Crea credenciales OAuth de tipo **Desktop App** y descarga el archivo JSON.
  2. Guarda las claves en tu entorno o autentica el servidor ejecutando el flujo OAuth según la documentación del servidor MCP de Google Drive.

### 4. File System (`filesystem`)
- **Paquete:** `@modelcontextprotocol/server-filesystem`
- **Uso:** Acceso y manipulación del sistema de archivos local del repositorio (`.`).
