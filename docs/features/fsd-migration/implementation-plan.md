# Plan de Implementación: Migración a FSD Lite

Este documento detalla el plan paso a paso para la refactorización arquitectónica de "Mexican Train Scorekeeper" hacia un patrón de Feature-Sliced Design (FSD) Lite, según lo acordado en `docs/architecture.md`.

## Fase 1: Quick Wins (Bajo riesgo, alto impacto)
1. **Limpieza en `useCameraCheck.ts`:** Eliminar `console.log` y remover bloque `if` duplicado (dead code).
2. **Setup atómico:** Unificar `SET_GAME_RULES` y `START_GAME` en un solo dispatch en `useGameSetup.ts` y en el reducer para evitar estados intermedios inconsistentes.
3. **Mover Helpers Puros:** Mover `formatDuration` de `useTimer.ts` hacia una carpeta de helpers centralizada (ej. `helpers/time-helpers.ts`).
4. **Seguridad de Tipado (Backend & Local):** 
   - Modificar tipo en `api/process-domino.ts` de `error: any` a `error: unknown` y usar type guard.
   - Implementar validador `isValidGameState()` para la deserialización en la capa de persistencia (`persistenceHelpers.ts`).
5. **Configuraciones Base:** Añadir y configurar ESLint (`package.json`) y asegurar que todos los directorios usen convención `kebab-case`.

## Fase 2: Refactorización de Lógica Central y Concerns (Riesgo medio)
1. **Limpieza del Contexto Global (`GameContext.tsx`):**
   - Extraer la lógica de side-effects e I/O de guardado al nuevo hook `useGamePersistence.ts`.
   - Mover el estado de banners visuales al Layout (en `App.tsx`) para limpiar responsabilidades.
2. **Patrón de Repositorio:**
   - Crear una interfaz robusta y validada de lectura/escritura (`game-repository.ts`).
3. **Desacoplamiento de Vista:**
   - Mover la lógica de `penaltyBtnRefs` desde la vista `GameBoard.tsx` al view-model `useGameBoard.ts`.
4. **Desacoplamiento de Infraestructura API:**
   - Extraer el texto estático de prompts largos a `api/prompts/domino-prompt.ts`.

## Fase 3: Estructura de Directorios (FSD Lite) (Bajo riesgo, pero masivo)
Se debe reestructurar `src/` bajo las siguientes capas:
- `src/app/`: `App.tsx`, `main.tsx`, `index.css`.
- `src/domain/`: `types/`, `game-reducer.ts`, score y stats engine.
- `src/domain/storage/`: Repositorios y validadores.
- `src/infrastructure/`: Clientes de API externa (Vercel serverless).
- `src/shared/`: Componentes base (Button, Modal), i18n, custom hooks (ej. timer) y configs de entorno.
- `src/store/`: Contexto de juego limpio y hook de persistencia.
- `src/features/`: Se aplanarán carpetas redundantes de View-Models para co-localizar archivos por módulo (`dashboard/`, `setup/`, `game/`, `results/`).

## Fase 4: Testing (Consolidación)
1. Escribir tests unitarios en `game-reducer.test.ts` para cubrir todas las acciones (`START_GAME`, `SUBMIT_ROUND`, `EDIT_ROUND_SCORE`, etc).
2. Tests unitarios en la capa domain para `score-engine.ts` y funciones matemáticas.
3. Asegurar pruebas de integración del pipeline completo de configuración e inicio (ej. `useGameSetup`).
