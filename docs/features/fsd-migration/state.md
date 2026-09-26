# Estado de Migración (Memoria de Implementación)

> **Contexto:** Este documento sirve como "memoria" paso a paso de la migración para continuar en sesiones posteriores de forma determinista y para que sub-agentes puedan continuar desde donde se dejó.

## Meta Principal
Llevar `mexican-train-scorekeeper` a un patrón arquitectónico de **FSD Lite** (Feature-Sliced Design simplificado) según el análisis provisto en `docs/architecture.md`.

---

## 📊 Progreso de las Fases

### Fase 1: Quick Wins ⏳ [100%]
- [x] Limpieza en `useCameraCheck.ts`
- [x] Unificar doble dispatch de setup (`START_GAME`)
- [x] Mover `formatDuration` a helpers
- [x] Añadir validadores de estado estricto (schema types) en `persistenceHelpers.ts`
- [x] Typo fixes en la API de Vercel & Type guard.
- [x] Configuración e integración inicial de ESLint en pipeline.

### Fase 2: Refactorización de Concerns ⏳ [100%]
- [x] Extraer `useGamePersistence.ts` de `GameContext.tsx`.
- [x] Mover UI de notificaciones (`Banners`) a `App.tsx`.
- [x] Crear el `game-repository.ts`.
- [x] Mover refs del UI al VM de `useGameBoard.ts`.
- [x] Extraer prompts a `api/prompts/`.

### Fase 3: Estructura de Directorios ⏳ [100%]
- [x] Crear capa `app/` y mover archivos core.
- [x] Crear capa `domain/` y mover state puros/tipos.
- [x] Crear capa `infrastructure/`.
- [x] Crear capa `shared/`.
- [x] Aplanar y organizar `store/` y `features/`.

### Fase 4: Testing & Coverage ⏳ [0%]
- [ ] Mover tests actuales
- [ ] Testing intensivo de reducers y helpers
- [ ] Testing de setup pipelines.

---

## 📝 Bitácora de Eventos

**Fecha:** Septiembre 26, 2026
**Autor:** Antigravity 
**Acción:** Implementación masiva y completado de la Fase 3 (Estructura de Directorios FSD Lite). 
**Estado Actual:** Fase 3 completada al 100%. Se migró y reestructuró de forma profunda la base de código. Se añadieron path aliases (`@/*`) en `tsconfig.json` y `vite.config.ts`. Se movieron decenas de archivos con scripts a `app/`, `domain/`, `infrastructure/`, `shared/`, `store/` y `features/` corrigiendo sistemáticamente todos los imports dañados. `npm run build` corre a la perfección.
**Siguiente Paso:** Iniciar la **Fase 4: Testing & Coverage**, consolidando que nada se haya roto en los comportamientos centrales.
