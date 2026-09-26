# Análisis Arquitectónico: Mexican Train Scorekeeper

> **Autor:** Análisis generado por Antigravity (Google DeepMind)
> **Fecha:** Septiembre 2026
> **Scope:** Evaluación de arquitectura actual, antipatrones, propuesta de refactorización y decisión sobre evolución monorepo

---

## 1. Estado Actual del Proyecto

### 1.1 Visión General

Mexican Train Scorekeeper es una **Progressive Web App (PWA)** de scope pequeño-mediano construida con:

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + Vite |
| Lenguaje | TypeScript 5 |
| Estado | `useReducer` + Context API |
| Estilos | Tailwind CSS |
| Testing | Vitest + Testing Library |
| Backend | Vercel Serverless Function (IA scanner) |
| Persistencia | LocalStorage / IndexedDB (adaptive) |
| i18n | Solución custom (ES/EN) |
| Animaciones | Framer Motion (`motion/react`) |

### 1.2 Mapa de Módulos Actual

```
src/
├── App.tsx                          ← Router de fases (PhaseRouter)
├── main.tsx
├── index.css
├── config/
│   └── featureFlags.ts              ← Feature flags por env var
├── context/
│   ├── GameContext.tsx              ← Provider + efectos de persistencia
│   └── gameReducer.ts               ← Reducer puro + estado inicial
├── types/
│   └── game.types.ts                ← Tipos centralizados
├── helpers/
│   ├── constants.ts                 ← Constantes del dominio
│   ├── scoreHelpers.ts              ← Lógica de cómputo de puntuación
│   ├── statsHelpers.ts              ← Lógica de estadísticas
│   ├── storageAdapter.ts            ← Adaptador multi-plataforma de storage
│   └── persistenceHelpers.ts        ← Interfaz de persistencia del estado
├── i18n/
│   ├── en.ts
│   ├── es.ts
│   └── useTranslation.ts            ← Context de i18n custom
├── hooks/
│   ├── useCameraCheck/
│   └── useTimer/
├── components/                      ← UI genérica: Button, Modal, Badge...
└── features/
    ├── dashboard/
    ├── setup/
    ├── game/
    │   ├── GameBoard.tsx            ← 331 líneas
    │   ├── components/
    │   │   ├── domino-scanner/
    │   │   ├── exit-confirm-modal/
    │   │   └── PenaltyPopover.tsx
    │   └── hooks/
    │       ├── use-game-board/
    │       └── use-domino-scanner/
    └── results/
api/
└── process-domino.ts                ← Vercel Serverless (Gemini AI)
```

---

## 2. Lo que Funciona Bien ✅

Antes de señalar problemas, es justo reconocer las decisiones acertadas:

- **Feature-first structure:** La organización por `features/` es correcta y escala bien para este scope.
- **Patrón View-Model con hooks:** Cada feature tiene su hook de VM (`useGameBoard`, `useGameSetup`, `useGameResults`) que separa la lógica de la presentación. Esto es la decisión más importante y está bien aplicada.
- **Reducer puro:** `gameReducer.ts` es completamente puro (sin efectos secundarios), testeable en aislamiento.
- **Storage Adapter:** El adaptador de almacenamiento con fallback (LocalStorage → IndexedDB → Memory) es una solución robusta y bien pensada para PWA cross-platform.
- **Feature flags tipados:** La configuración de feature flags vía env vars con tipado es una buena práctica.
- **Tipos centralizados:** `game.types.ts` como única fuente de verdad de los tipos del dominio.
- **Helpers puros:** `scoreHelpers.ts` y `statsHelpers.ts` son funciones puras sin side effects, fácilmente testeables.

---

## 3. Antipatrones y Malas Prácticas Detectadas

### 3.1 🔴 CRÍTICO: Mezcla de responsabilidades en `GameContext`

**Archivo:** `src/context/GameContext.tsx`

El provider mezcla tres responsabilidades distintas:

```tsx
// ❌ Antipatrón: Persistencia + UI state dentro del provider de estado de dominio
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  // Responsabilidad 1: Estado del juego (correcto)
  useEffect(() => { loadGameState() ... }, [])             // ← IO en Provider
  useEffect(() => { saveGameState(state) ... }, [state])   // ← IO en Provider

  // Responsabilidad 2: Estado de UI de notificaciones (NO pertenece aquí)
  const [showRestoredBanner, setShowRestoredBanner] = useState(false)
  const [showWarningBanner, setShowWarningBanner] = useState(false)

  // Responsabilidad 3: Dispatch aumentado con lógica condicional silenciosa
  const customDispatch = useCallback((action) => {
    if (action.type === "EXIT_GAME") clearGameState()  // ← side effect escondido
    dispatch(action)
  }, [dispatch])
```

**Problemas:**
- El provider sabe demasiado: gestiona estado de dominio, persistencia Y estado de UI de notificaciones.
- Los banners y sus setters pertenecen al layout de la app, no al contexto del juego.
- La lógica de side-effects (save/load) debería vivir en un hook dedicado (`useGamePersistence`).
- `customDispatch` introduce lógica condicional silenciosa que viola el principio de mínima sorpresa.

**Refactoring propuesto:** Extraer un hook `useGamePersistence` y mover el estado de UI a `App.tsx`.

---

### 3.2 🔴 CRÍTICO: Doble dispatch en `useGameSetup`

**Archivo:** `src/features/setup/useGameSetup.ts` (líneas 83-96)

```tsx
// ❌ Antipatrón: Dos dispatches donde debería ser uno
const startGame = () => {
  dispatch({ type: "SET_GAME_RULES", payload: { ... } })
  dispatch({ type: "START_GAME", payload: { players, totalRounds } })
}
```

**Problema:** Dos renders intermedios y riesgo de estado inconsistente. Las reglas deben ir en el mismo payload que `START_GAME`.

```tsx
// ✅ Fix: Un único dispatch atómico
dispatch({
  type: "START_GAME",
  payload: { players, totalRounds, gameRules: { mode, arrivalBonus, penaltiesEnabled, penaltyMultiplier } }
})
```

---

### 3.3 🟡 IMPORTANTE: `GameContext` expone `dispatch` crudo al árbol de componentes

**Problema:** Cualquier componente puede despachar cualquier acción sin restricciones. Viola el principio de menor privilegio.

**Patrón alternativo (acciones explícitas):**
```tsx
// ✅ Más seguro y autodocumentado
interface GameContextValue {
  state: GameState
  actions: {
    startGame: (players: SetupPlayerInput[], rounds: number, rules: GameRules) => void
    endRound: () => void
    submitRound: (payload: SubmitRoundPayload) => void
    exitGame: () => void
  }
}
```

> **Trade-off:** Para este scope, una variante aceptable es mantener `dispatch` pero documentar que sólo los hooks de View-Model deben consumirlo y aplicar una regla ESLint que lo refuerce.

---

### 3.4 🟡 IMPORTANTE: `useCameraCheck` tiene código duplicado y `console.log` en producción

**Archivo:** `src/hooks/useCameraCheck/useCameraCheck.ts`

```ts
// ❌ console.log de depuración en producción
console.log("useEffect ejecutándose")

// ❌ Bloque de guardia duplicado — el segundo if nunca se ejecuta (dead code)
if (!navigator.mediaDevices?.enumerateDevices) {
  setHasCamera(false)
  return
}
// ↓ Idéntico al anterior — nunca se alcanza esta línea
if (!navigator.mediaDevices?.enumerateDevices) {
  console.warn("⚠️ useCameraCheck: ...")
  setHasCamera(false)
  setIsLoading(false)
  return
}
```

**Problemas:**
- Segundo `if` inalcanzable: dead code.
- `console.log` de depuración sin eliminar filtra información en producción.
- Detección de mobile por user-agent string: frágil y difícil de mantener.

---

### 3.5 🟡 IMPORTANTE: API sin validación de entrada ni tipado estricto

**Archivo:** `api/process-domino.ts`

```ts
// ❌ Typo histórico preservado como fallback
const { image, imag } = req.body   // "imag" es un typo nunca corregido

// ❌ error: any — pérdida total del tipado en el catch
} catch (error: any) {

// ❌ Sin validación del tamaño de imagen — potencial DoS

// ❌ Prompt de 40 líneas embebido en el handler
const prompt = `Eres un experto...`
```

**Correcciones:**
- Corregir el typo `imag` en el cliente y eliminar el fallback.
- Usar `error: unknown` con type guard en el catch.
- Mover el prompt a `api/prompts/domino-prompt.ts`.
- Añadir validación del tamaño del body.

---

### 3.6 🟡 IMPORTANTE: `storageAdapter` — singleton mutable con estado implícito

**Archivos:** `src/helpers/storageAdapter.ts` / `src/helpers/persistenceHelpers.ts`

```ts
// persistenceHelpers.ts
export const storageAdapter = createStorageAdapter()  // ← Singleton global mutable

// storageAdapter.ts
adapter.isAvailable = false              // ← Mutación directa del objeto
adapter.onStorageFailed = onStorageWarning  // ← Callback de UI acoplado a infraestructura
```

**Problemas:**
- `onStorageFailed` como propiedad mutable acopla infraestructura con UI.
- `mode` (closure interna) muta silenciosamente durante llamadas asíncronas concurrentes.
- El singleton global impide el testing en aislamiento.

---

### 3.7 🟠 MENOR: Inconsistencia en naming conventions de directorios

| Patrón | Ejemplos |
|--------|----------|
| kebab-case | `use-game-board/`, `use-domino-scanner/` |
| camelCase | `useCameraCheck/`, `useTimer/` |

**Regla propuesta:** kebab-case para todos los directorios, PascalCase para archivos de componentes React, camelCase para hooks y helpers.

---

### 3.8 🟠 MENOR: Lógica de refs DOM en el componente de presentación

**Archivo:** `src/features/game/GameBoard.tsx` (líneas 60-67)

```tsx
// ❌ Gestión de refs en el componente de presentación
const penaltyBtnRefs = useRef<Record<string, React.RefObject<HTMLButtonElement | null>>>({})
const getPenaltyRef = (id: string) => {
  if (!penaltyBtnRefs.current[id]) {
    penaltyBtnRefs.current[id] = { current: null }
  }
  return penaltyBtnRefs.current[id]
}
```

Esta lógica debería estar en `useGameBoard` para mantener el componente estrictamente presentacional.

---

### 3.9 🟠 MENOR: Colores hardcoded en `StatsPanel` que rompen el design system

**Archivo:** `src/features/results/StatsPanel.tsx` (líneas 67-80)

```tsx
// ❌ Hex literals que no siguen el design system de Tailwind
<CartesianGrid stroke="#334155" />
<XAxis stroke="#64748B" />
contentStyle={{ background: "#1E293B", border: "1px solid #334155" }}
```

Deberían leerse de las CSS custom properties del design system.

---

### 3.10 🟠 MENOR: `formatDuration` mal ubicada semánticamente

**Referencia:** `src/features/results/StatsPanel.tsx` línea 21

```ts
import { formatDuration } from "../../hooks/useTimer/useTimer"
```

`formatDuration` es una función utilitaria pura (no un hook). Debería vivir en `helpers/time-helpers.ts` o `helpers/stats-helpers.ts`.

---

### 3.11 🟠 MENOR: Deserialización de estado sin validación de schema

**Archivo:** `src/helpers/persistenceHelpers.ts` (línea 20)

```ts
// ❌ Cast sin validación — un GameState corrupto puede crashear la app
return JSON.parse(data) as GameState
```

Un estado de una versión antigua o datos corruptos puede causar errores en runtime. Necesita un type guard `isValidGameState(data: unknown): data is GameState`.

---

## 4. Sobreingeniería y Underengineering

### 4.1 ¿Hay sobreingeniería?

**No.** La aplicación está en un nivel de complejidad apropiado para su scope. No hay repositorios abstractos, use cases, puertos/adaptadores hexagonales, inyección de dependencias, ni capas de abstracción vacías. El patrón **Feature-based + View-Model hooks** es el correcto para esta app.

### 4.2 ¿Hay underengineering?

**Sí, en áreas puntuales:**

- **Sin schema validation** en la deserialización de persistencia.
- **Un único test** en todo el proyecto. Los helpers puros y el reducer deberían tener cobertura completa.
- **Sin ESLint** configurado en `package.json` (no hay script `lint`).
- **Tipado `as GameState`** sin validación en la capa de persistencia.

---

## 5. Arquitectura Propuesta

### 5.1 Patrón: Feature-Sliced Design Simplificado + MVVM con Hooks

La arquitectura correcta para este scope es una **variante simplificada de Feature-Sliced Design (FSD)** combinada con el patrón **MVVM implementado con hooks de React**. Es lo que ya existe, pero con capas explícitas y responsabilidades bien delimitadas.

```
src/
├── app/                             ← Bootstrapping
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── domain/                          ← Lógica de negocio pura (sin React, sin IO)
│   ├── types/
│   │   └── game.types.ts
│   ├── game/
│   │   ├── game-reducer.ts
│   │   ├── score-engine.ts          ← scoreHelpers + statsHelpers fusionados
│   │   └── game-constants.ts
│   └── storage/
│       ├── storage-adapter.ts
│       └── game-repository.ts       ← interfaz explícita + validación de schema
│
├── infrastructure/                  ← Integraciones externas
│   └── ai-scanner/
│       └── domino-scanner-client.ts ← extrae el fetch de useDominoScanner
│
├── shared/                          ← UI compartida y utilidades
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── hooks/
│   │   ├── use-timer.ts
│   │   └── use-camera-check.ts
│   ├── i18n/
│   └── config/
│       └── feature-flags.ts
│
├── store/                           ← Estado global
│   ├── game-context.tsx             ← Provider limpio: solo estado y dispatch
│   └── use-game-persistence.ts      ← Hook dedicado a la persistencia
│
└── features/                        ← Pantallas
    ├── dashboard/
    ├── setup/
    ├── game/
    │   ├── GameBoard.tsx
    │   ├── components/
    │   │   ├── PenaltyPopover.tsx
    │   │   ├── DominoScanner.tsx
    │   │   └── ExitConfirmModal.tsx
    │   └── use-game-board.ts        ← aplanar: eliminar carpeta de un solo archivo
    └── results/
```

### 5.2 GameContext Limpio — Separación de Concerns

```tsx
// ✅ store/game-context.tsx — SOLO estado y dispatch
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// ✅ store/use-game-persistence.ts — Hook dedicado a IO
export const useGamePersistence = (
  state: GameState,
  dispatch: Dispatch<GameAction>,
  onRestored: () => void,
  onStorageWarning: () => void,
) => {
  useEffect(() => {
    if (!storageAdapter.isAvailable) onStorageWarning()
    storageAdapter.onStorageFailed = onStorageWarning
  }, [])

  useEffect(() => {
    gameRepository.load().then((saved) => {
      if (saved?.phase === "playing") {
        dispatch({ type: "RESTORE_GAME", payload: saved })
        onRestored()
      }
    })
  }, [])

  useEffect(() => {
    if (state.phase === "dashboard") return
    const timer = setTimeout(() => gameRepository.save(state), 300)
    return () => clearTimeout(timer)
  }, [state])
}

// ✅ app/App.tsx — Los banners pertenecen al layout, no al contexto
const AppShell = () => {
  const { state, dispatch } = useGameContext()
  const [showRestoredBanner, setShowRestoredBanner] = useState(false)
  const [showWarningBanner, setShowWarningBanner] = useState(false)

  useGamePersistence(
    state, dispatch,
    () => setShowRestoredBanner(true),
    () => setShowWarningBanner(true),
  )
  // ...
}
```

### 5.3 Tipado Mejorado

```ts
// domain/types/game.types.ts

// ✅ Tipo nombrado para el multiplicador de penalización
export type PenaltyMultiplier = 3 | 5

// ✅ Merge de reglas en START_GAME (elimina el doble dispatch)
export type GameAction =
  | { type: "GO_SETUP" }
  | {
      type: "START_GAME"
      payload: {
        players: SetupPlayerInput[]
        totalRounds: number
        gameRules: GameRules   // ← reglas en el mismo dispatch
      }
    }
  // ...

// ✅ Type guard para validación de schema al deserializar
export function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  return (
    typeof d.phase === "string" &&
    ["dashboard", "setup", "playing", "results"].includes(d.phase as string) &&
    Array.isArray(d.players) &&
    typeof d.currentRound === "number"
  )
}
```

### 5.4 Repository Pattern para Persistencia

```ts
// domain/storage/game-repository.ts
export interface GameRepository {
  save(state: GameState): Promise<void>
  load(): Promise<GameState | null>
  clear(): Promise<void>
}

export function createGameRepository(adapter: StorageAdapter): GameRepository {
  const KEY = "mexican_train_scorekeeper_state"
  return {
    async save(state) {
      await adapter.save(KEY, JSON.stringify(state))
    },
    async load() {
      const raw = await adapter.load(KEY)
      if (!raw) return null
      try {
        const parsed: unknown = JSON.parse(raw)
        return isValidGameState(parsed) ? parsed : null  // ← Validación de schema
      } catch {
        return null
      }
    },
    async clear() {
      await adapter.remove(KEY)
    },
  }
}
```

---

## 6. Patrón Recomendado vs. Alternativa

### 6.1 Patrón A — RECOMENDADO: Feature-Sliced Design Lite + MVVM con Hooks

**Descripción:** Organización vertical por features con capas horizontales de dominio, shared y store. Cada feature contiene sus componentes y su hook de View-Model. La lógica de negocio vive en `domain/` como funciones puras.

**Aplicabilidad a este proyecto:** ⭐⭐⭐⭐⭐

| Ventaja | Descripción |
|---------|-------------|
| **Bajo overhead** | Sin puertos, adaptadores abstractos ni DI |
| **Separación real de concerns** | Domain (puro) → Store (estado) → Features (UI + VM) |
| **Testabilidad** | El dominio se testea sin React; los hooks con `renderHook` |
| **Escalabilidad** | Añadir una feature = añadir un directorio |
| **Familiaridad** | Cualquier desarrollador React reconoce el patrón |
| **Co-location** | Los archivos relacionados están juntos |

**Trade-offs negativos:**
- El `GameContext` sigue siendo un singleton global; puede crecer si la app escala mucho.
- No hay separación explícita entre Application Layer y Domain Layer.

---

### 6.2 Patrón B — DESCARTADO: Clean Architecture / Hexagonal

**Descripción:** Domain (entidades + use cases) → Application (puertos) → Infrastructure (adaptadores) → Presentation (UI).

**Aplicabilidad a este proyecto:** ⭐⭐ — sobreingeniería clara

| Criterio | Detalle |
|----------|---------|
| ✅ Independencia del framework | El dominio no conoce React |
| ✅ Testabilidad máxima | Use cases testeables sin UI ni storage |
| ✅ Preparada para cambios de infraestructura | Cambiar IndexedDB por SQLite = cambiar un adaptador |
| ❌ **Over-engineering severo** | ~15 archivos de lógica no justifican puertos y adaptadores |
| ❌ **Ceremonia innecesaria** | Entity → Use Case → Port → Adapter → UI para cada acción |
| ❌ **Curva de entrada alta** | Nuevos devs necesitan entender la arquitectura antes de tocar código |
| ❌ **3-4x más código** | Para la misma funcionalidad |

> **Conclusión:** Clean/Hexagonal es la arquitectura correcta para backends de microservicios o apps empresariales. Para una PWA de ~1.500 líneas de código, es **matar moscas a cañonazos**.

---

### 6.3 Comparativa Visual de Trade-offs

```
Beneficio obtenido vs. Complejidad del patrón

  Clean/Hexagonal ──────────────────────────●  ← Mucho overhead, poco beneficio aquí
                                          /
  FSD Lite + MVVM ──────────────────●        ← Punto óptimo para este scope
                                   /
  Estado actual ─────────────●               ← Funcional pero con fricciones

  ▲ Beneficio
  ──────────────────────────────► Complejidad del patrón
```

---

## 7. Estrategia de Refactorización

### Fase 1: Quick Wins — Bajo riesgo, alto impacto

- [ ] Eliminar `console.log` de producción en `useCameraCheck.ts`
- [ ] Corregir bloque de guardia duplicado en `useCameraCheck.ts`
- [ ] Unificar doble dispatch en `useGameSetup.ts` (merge `SET_GAME_RULES` + `START_GAME`)
- [ ] Mover `formatDuration` de `useTimer.ts` a `helpers/time-helpers.ts`
- [ ] Añadir `isValidGameState()` y usarla en `persistenceHelpers.ts`
- [ ] Cambiar `error: any` por `error: unknown` + type guard en `api/process-domino.ts`
- [ ] Añadir script `lint` en `package.json` con ESLint + `@typescript-eslint`
- [ ] Estandarizar naming de directorios a kebab-case

### Fase 2: Refactorización de Concerns — Riesgo medio

- [ ] Extraer `useGamePersistence` del `GameContext.tsx`
- [ ] Mover estado de banners al layout (`App.tsx`)
- [ ] Crear `game-repository.ts` con interfaz explícita + validación de schema
- [ ] Mover `penaltyBtnRefs` de `GameBoard.tsx` a `useGameBoard.ts`
- [ ] Extraer el prompt de AI a `api/prompts/domino-prompt.ts`

### Fase 3: Estructura de Directorios — Riesgo bajo (gradual)

- [ ] Crear capa `domain/` y mover `types/`, `gameReducer.ts`, helpers de lógica
- [ ] Crear capa `shared/` y mover `components/`, hooks globales, `i18n/`, `config/`
- [ ] Crear capa `store/` para `GameContext.tsx` + `useGamePersistence.ts`
- [ ] Aplanar hooks de un solo archivo (eliminar carpetas innecesarias)

### Fase 4: Testing — Imprescindible antes de escalar

- [ ] Tests unitarios de `gameReducer`: todas las acciones y edge cases
- [ ] Tests unitarios de `scoreHelpers`: `rankPlayers`, `standings`, `cumulativeSeries`
- [ ] Tests unitarios de `statsHelpers`: `mostArrivals`, `getHighestSingleRoundScore`
- [ ] Tests de integración de `useGameSetup` y `useGameResults`

---

## 8. Decisión: Monorepo vs. Modificación del Repo Actual

### 8.1 El Escenario

> "Una posible evolución sería añadir otro juego, lo que haría que ya no sea un mexican train scorekeeper sino un game score keeper."

### 8.2 Análisis de Genericidad del Código Actual

¿Qué parte del código actual es **específica de Mexican Train** vs. **reutilizable para cualquier juego**?

| Módulo | Específico de Mexican Train | Reutilizable |
|--------|-----------------------------|--------------|
| `gameReducer.ts` | Arrivals, penalties, domino scanner actions | Estructura de fases (dashboard → setup → playing → results) |
| `game.types.ts` | `Player.arrivals`, `GameRules`, `penaltyMultiplier` | `GamePhase`, estructura de `Round.scores` |
| `scoreHelpers.ts` | Lógica de `arrivalsOnly` mode | `rankPlayers`, `standings`, `cumulativeSeries` |
| `statsHelpers.ts` | `mostArrivals` | `totalTime`, `getHighestSingleRoundScore` |
| `storageAdapter.ts` | Nada | **Todo** |
| `persistenceHelpers.ts` | La storage key específica | El patrón completo |
| `i18n/` | Textos específicos del juego | La infraestructura del sistema |
| `components/` | Nada | **Todo** (Button, Modal, Badge) |
| `featureFlags.ts` | `dominoScanner` | El sistema de flags |
| `api/process-domino.ts` | Todo | El patrón de Vercel Function |

**Conclusión:** ~35% del código es completamente reutilizable tal como está. El 65% restante contiene **patrones** (no código) reutilizables.

---

### 8.3 Opción A: Modificar el Repo Actual (app multi-juego)

```
src/
├── features/
│   ├── game-selector/          ← Nueva pantalla de selección
│   ├── mexican-train/          ← Features actuales movidas aquí
│   └── game-2/                 ← Nuevo juego
├── shared/                     ← Componentes y lógica compartida
└── store/                      ← Estado separado por juego
```

| Ventaja | Inconveniente |
|---------|---------------|
| Un solo repo, un solo deploy | Estado global más complejo |
| Shared components sin overhead | Las rutas requieren React Router |
| Un solo bundle | Mayor complejidad de razonamiento |
| CI/CD simple | Los juegos no pueden deployarse independientemente |
| Una sola configuración | Un bug en shared rompe todos los juegos |

**Cuándo elegir esta opción:** Si el segundo juego tiene una UX prácticamente idéntica (misma tabla de puntuación por rondas, mismo flujo). Por ejemplo: *Mus*, *Truco*, *Burako*.

---

### 8.4 Opción B: Monorepo con pnpm Workspaces

```
game-score-keeper/                    ← Raíz del monorepo
├── packages/
│   ├── ui/                           → @gsk/ui  (Button, Modal, Badge...)
│   ├── storage/                      → @gsk/storage  (StorageAdapter, GameRepository)
│   ├── i18n/                         → @gsk/i18n  (sistema de traducciones)
│   └── config/
│       ├── eslint-config/            → @gsk/eslint-config
│       ├── typescript-config/        → @gsk/tsconfig
│       └── vite-config/              → @gsk/vite-config
├── apps/
│   ├── mexican-train/                ← App actual migrada
│   └── game-2/                       ← Nuevo juego
├── pnpm-workspace.yaml
└── package.json
```

| Ventaja | Inconveniente |
|---------|---------------|
| Cada app es independiente (deploy autónomo) | Setup inicial: 1-2 días |
| Paquetes compartidos con versionado | Breaking changes en `@gsk/ui` afectan a todos los consumers |
| Cada app evoluciona a su ritmo | Requiere Changesets para versionado |
| CI/CD granular | Turborepo/Nx necesario para builds eficientes |
| Escala a N juegos | Curva de entrada mayor para nuevos devs |
| Preparado para publicar `@gsk/ui` como librería pública | pnpm link puede tener comportamientos inesperados |

---

### 8.5 Decisión Final y Argumentación

#### VEREDICTO: La decisión depende de la naturaleza del segundo juego

---

**Subescenario 1 — El segundo juego es similar (puntuación por rondas, misma UX)**
→ **Modificar el repo actual.**

Si el segundo juego sigue el mismo paradigma (tabla de puntuaciones por rondas, mismas pantallas, mismo flujo), lo correcto es generalizar el repo. El overhead de un monorepo no se justifica cuando la diferencia es principalmente de **datos y reglas**, no de **arquitectura UI**.

**Plan de acción:** Refactorizar primero a la arquitectura propuesta (Sección 5), luego añadir `features/game-selector/` y `features/game-2/`.

---

**Subescenario 2 — El segundo juego tiene una UX radicalmente diferente**
→ **Monorepo con pnpm Workspaces + Turborepo.**

Si el segundo juego tiene un paradigma de UI distinto (tablero visual, cartas con estado gráfico, temporizadores en tiempo real, multijugador en red...), el monorepo es la elección correcta.

**¿Por qué no un nuevo repo independiente?**
Un repo independiente duplicaría Button, Modal, Badge, StorageAdapter, el sistema de i18n, la configuración de TS/ESLint/Vite y el patrón de Vercel Functions. Esa duplicación es el antipatrón que el monorepo evita.

**¿Por qué no modificar el repo actual?**
Porque forzar dos UX radicalmente diferentes en una misma app crea un bundle innecesariamente grande, acopla los ciclos de release y mezcla responsabilidades que naturalmente pertenecen a dominios separados.

---

### 8.6 Plan de Migración a Monorepo

```
Paso 1 — Preparar estructura sin romper el repo actual
  └── Crear /game-score-keeper (nueva raíz)
  └── Mover mexican-train-scorekeeper → apps/mexican-train
  └── Crear packages/ vacío

Paso 2 — Extraer paquetes (orden de dependencias)
  └── packages/config/   (sin dependencias)
  └── packages/storage/  (sin dependencias de UI)
  └── packages/i18n/     (sin dependencias)
  └── packages/ui/       (puede depender de config/)

Paso 3 — Actualizar imports en apps/mexican-train
  └── Reemplazar imports relativos por @gsk/ui, @gsk/storage...
  └── Verificar build y tests

Paso 4 — Crear apps/game-2
  └── Usar paquetes compartidos desde el primer commit

Paso 5 — Configurar Turborepo
  └── turbo.json con pipelines build/test/lint
```

**Stack recomendado para el monorepo:**
- **pnpm workspaces** (ya usa pnpm según `pnpm-lock.yaml`)
- **Turborepo** — caching inteligente de builds por cambios
- **Changesets** — versionado semántico de paquetes internos

---

## 9. Resumen Ejecutivo

| Aspecto | Estado Actual | Propuesto |
|---------|--------------|-----------|
| **Patrón arquitectónico** | Feature-based + VM hooks (bien aplicado) | FSD Lite + MVVM Hooks (formalizado con capas explícitas) |
| **Estado global** | Context con demasiadas responsabilidades | Context limpio + `useGamePersistence` separado |
| **Tipado** | Bueno, pero con `any` en catch y cast sin validación | Estricto: `unknown`, type guards, schema validation |
| **Persistencia** | Funcional pero singleton mutable con callback acoplado | Repository pattern con interfaz explícita |
| **Testing** | 1 test (hook de GameBoard) | Suite completa: reducer, helpers, hooks |
| **Código muerto** | `console.log`, bloque duplicado | Eliminado |
| **Naming** | Inconsistente (kebab vs camelCase en dirs) | Estandarizado a kebab-case para directorios |
| **Evolución multi-juego** | No preparado | Monorepo si UX diverge; generalización si es similar |

> **La base del proyecto es sólida.** Las decisiones más importantes — feature-first, VM hooks, reducer puro, storage adapter con fallback, feature flags tipados — están bien tomadas. La refactorización propuesta **no cambia el paradigma**, sino que formaliza y limpia lo que ya existe, y prepara el terreno para la evolución a multi-juego.

---

## Anexo A: Feature-Sliced Design Lite — Guía Conceptual y Técnica

> Este anexo explica el patrón **FSD Lite** que se recomienda para este proyecto, con definiciones conceptuales, razonamiento de diseño, ejemplos de código concretos y casos de uso comparados.

---

### A.1 ¿Qué es Feature-Sliced Design?

**Feature-Sliced Design (FSD)** es una metodología de arquitectura frontend que organiza el código en **capas horizontales** (qué tan cerca está del negocio) y **slices verticales** (a qué dominio o feature pertenece). Fue formalizada por la comunidad frontend rusa alrededor de 2021 y tiene una [especificación oficial](https://feature-sliced.design/).

La versión original completa define **7 capas**, de mayor a menor abstracción:

```
app       ← Inicialización global (providers, router, estilos globales)
processes ← Flujos multi-feature (onboarding, checkout) — opcional
pages     ← Pantallas completas (composición de widgets y features)
widgets   ← Bloques de UI autónomos (Header, Sidebar, Feed)
features  ← Interacciones de usuario con valor de negocio (login, add-to-cart)
entities  ← Objetos de negocio (User, Product, Order)
shared    ← Utilidades, UI kit, config — sin lógica de negocio
```

### A.2 ¿Qué es FSD Lite?

**FSD Lite** es una adaptación pragmática de FSD que elimina las capas innecesarias para aplicaciones de scope pequeño-mediano. En lugar de 7 capas, trabaja con **5 capas esenciales**:

```
app         ← Bootstrapping y providers globales
domain      ← Lógica de negocio pura (tipos, reducers, helpers, repositorios)
shared      ← UI kit genérico, hooks globales, i18n, config
store       ← Estado global (Context/Zustand/Redux)
features    ← Pantallas y sus View-Models
```

La diferencia clave con FSD completo:
- No hay `pages`, `widgets`, `entities` ni `processes` como capas separadas.
- `features` en FSD Lite equivale a lo que FSD llama `pages` + `features` + `widgets` fusionados.
- `domain` en FSD Lite fusiona lo que FSD llama `entities` con la lógica de aplicación pura.

Esto es adecuado cuando la complejidad no justifica tantas capas de indirección.

---

### A.3 El Principio Fundamental: Dirección de Dependencias

La regla más importante de FSD (y de FSD Lite) es que **las dependencias sólo pueden ir hacia abajo**:

```
features    ─── puede importar desde: shared, store, domain
store       ─── puede importar desde: shared, domain
domain      ─── puede importar desde: (nada externo — solo TS puro)
shared      ─── puede importar desde: (nada externo — solo TS puro)
app         ─── puede importar desde: todo
```

**Lo que está explícitamente prohibido:**
```
shared  ✗── NO importa desde features
domain  ✗── NO importa desde store ni features
store   ✗── NO importa desde features
```

Este grafo de dependencias unidireccional es lo que hace la arquitectura **predecible y testeable**: las capas inferiores son completamente agnósticas de las superiores.

**Ejemplo de violación:**
```ts
// ❌ domain/game/score-engine.ts importando de features — PROHIBIDO
import { useGameContext } from "../../features/game/use-game-board"
```

**Ejemplo correcto:**
```ts
// ✅ features/game/use-game-board.ts importando de domain — PERMITIDO
import { rankPlayers } from "../../domain/game/score-engine"
```

---

### A.4 Las 5 Capas en Detalle

#### Capa 1: `domain/` — El corazón de la aplicación

Es la capa más importante y la más estable. Contiene **todo lo que describe el negocio** sin depender de ningún framework, librería de UI ni mecanismo de persistencia concreto.

**Características:**
- Archivos `.ts` puro (nunca `.tsx`)
- Cero imports de React, Tailwind, ni APIs del navegador
- 100% testeable con Vitest sin ningún mock
- Cambia sólo cuando cambian las reglas del negocio

**Contenido típico:**
```
domain/
├── types/
│   └── game.types.ts          ← Tipos, interfaces, enums del dominio
├── game/
│   ├── game-reducer.ts        ← Lógica de transición de estado (pura)
│   ├── score-engine.ts        ← Cálculos: rankings, standings, totales
│   └── game-constants.ts      ← Constantes del dominio (MIN_PLAYERS, etc.)
└── storage/
    ├── storage-adapter.ts     ← Interfaz del adaptador de storage
    └── game-repository.ts     ← Patrón Repository con validación de schema
```

**Ejemplo concreto — función de dominio pura:**
```ts
// domain/game/score-engine.ts
import type { Player, Round, GameMode } from "../types/game.types"

/**
 * Calcula el ranking de jugadores según el modo de juego.
 * En standard: menor puntuación = mejor.
 * En arrivalsOnly: mayor puntuación = mejor.
 * Los empates comparten rango.
 */
export function rankPlayers(
  players: Player[],
  rounds: Round[],
  mode: GameMode = "standard",
): RankedPlayer[] {
  const totals = computeTotals(players, rounds)
  const isArrivalsOnly = mode === "arrivalsOnly"

  const sorted = [...players].sort((a, b) => {
    if (totals[a.id] !== totals[b.id]) {
      return isArrivalsOnly
        ? totals[b.id] - totals[a.id]
        : totals[a.id] - totals[b.id]
    }
    return b.arrivals - a.arrivals // Tie-breaker
  })

  // Asignación de rangos con detección de empates
  let lastTotal: number | null = null
  let lastRank = 0
  return sorted.map((player, i) => {
    const total = totals[player.id]
    const rank = total === lastTotal ? lastRank : i + 1
    lastTotal = total
    lastRank = rank
    return { player, total, rank }
  })
}
```

**Test de esta función — sin React, sin mocks:**
```ts
// domain/game/score-engine.test.ts
import { describe, it, expect } from "vitest"
import { rankPlayers } from "./score-engine"

describe("rankPlayers", () => {
  const players = [
    { id: "p1", name: "Ana", arrivals: 1, roundsAsLast: 0, penaltyCount: 0, arrivalBonusTotal: 0 },
    { id: "p2", name: "Bob", arrivals: 0, roundsAsLast: 1, penaltyCount: 0, arrivalBonusTotal: 0 },
  ]
  const rounds = [
    { index: 1, scores: { p1: 10, p2: 20 }, duration: 60, rankings: ["p1", "p2"] },
    { index: 2, scores: { p1: 5, p2: 15 }, duration: 45, rankings: ["p1", "p2"] },
  ]

  it("clasifica por menor puntuación en modo standard", () => {
    const ranked = rankPlayers(players, rounds, "standard")
    expect(ranked[0].player.id).toBe("p1") // 15 puntos total
    expect(ranked[1].player.id).toBe("p2") // 35 puntos total
  })

  it("comparte rango en caso de empate", () => {
    const equalRounds = [
      { index: 1, scores: { p1: 10, p2: 10 }, duration: 60, rankings: ["p1", "p2"] },
    ]
    const ranked = rankPlayers(players, equalRounds, "standard")
    // Tie-breaker: Ana tiene más arrivals, gana
    expect(ranked[0].player.id).toBe("p1")
    expect(ranked[0].rank).toBe(1)
    expect(ranked[1].rank).toBe(2) // no comparten rank porque arrivals desempata
  })
})
```

---

#### Capa 2: `shared/` — El kit compartido

Contiene todo lo que es **genérico y reutilizable** entre features, sin saber nada del negocio.

**Características:**
- UI kit (componentes sin lógica de negocio)
- Hooks de infraestructura (timer, cámara, scroll)
- Sistema de i18n (la infraestructura, no los textos del juego)
- Configuración (feature flags, constantes de entorno)
- No importa nada de `features/`, `store/` ni `domain/`

**Contenido:**
```
shared/
├── components/
│   ├── Button.tsx          ← Botón genérico con variantes
│   ├── Modal.tsx           ← Modal genérico
│   └── Badge.tsx           ← Badge de estadísticas
├── hooks/
│   ├── use-timer.ts        ← Hook de cronómetro (reutilizable en cualquier juego)
│   └── use-camera-check.ts ← Detección de cámara disponible
├── i18n/
│   ├── en.ts
│   ├── es.ts
│   └── use-translation.ts  ← Context + hook de i18n
└── config/
    └── feature-flags.ts    ← Flags de funcionalidades por env
```

**Ejemplo — componente shared correcto vs. incorrecto:**

```tsx
// ✅ shared/components/Button.tsx — NO sabe nada del juego
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

export const Button = ({ variant = "primary", size = "md", ...props }: ButtonProps) => (
  <button
    className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}
    {...props}
  />
)
```

```tsx
// ❌ INCORRECTO — shared no debe saber nada del juego
// Esto contaminaría shared con lógica de negocio
import { useGameContext } from "../../store/game-context"

export const Button = () => {
  const { state } = useGameContext()  // ← VIOLACIÓN: shared importa de store
  const isDisabled = state.phase === "results"
  // ...
}
```

---

#### Capa 3: `store/` — El estado global

Contiene el **mecanismo de estado compartido** entre features. En esta app es el `GameContext`, pero podría ser Zustand, Redux Toolkit, etc.

**Características:**
- Sabe sobre `domain/` (usa tipos y el reducer)
- No sabe nada de `features/` (no importa componentes ni hooks de features)
- Puede usar `shared/` (hooks de infraestructura para persistencia)

**Contenido:**
```
store/
├── game-context.tsx          ← Provider limpio: solo estado + dispatch
└── use-game-persistence.ts   ← Hook separado: IO de carga/guardado
```

**Por qué separar la persistencia del provider:**

```tsx
// ❌ Antes (mezcla de responsabilidades):
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const [showBanner, setShowBanner] = useState(false)  // ← UI en el store
  useEffect(() => { loadGameState().then(...) }, [])    // ← IO en el store
  // ...
}

// ✅ Después (responsabilidades separadas):

// store/game-context.tsx — SOLO estado
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

// store/use-game-persistence.ts — SOLO IO
export const useGamePersistence = (state, dispatch, onRestored, onWarning) => {
  useEffect(() => { /* cargar al montar */ }, [])
  useEffect(() => { /* guardar al cambiar estado */ }, [state])
}

// app/App.tsx — COMPOSICIÓN: une store + persistencia + notificaciones
const AppShell = () => {
  const { state, dispatch } = useGameContext()
  const [banner, setBanner] = useState(false)
  useGamePersistence(state, dispatch, () => setBanner(true), () => {})
  // ...
}
```

---

#### Capa 4: `features/` — Las pantallas y sus View-Models

Cada feature es una **pantalla o sección de la aplicación** con su lógica propia. En FSD Lite, cada feature tiene como máximo:

```
features/
└── game/
    ├── GameBoard.tsx          ← Componente de presentación (JSX puro)
    ├── use-game-board.ts      ← View-Model: lógica + datos derivados
    └── components/            ← Sub-componentes locales de esta feature
        ├── PenaltyPopover.tsx
        ├── DominoScanner.tsx
        └── ExitConfirmModal.tsx
```

**El patrón View-Model con hooks — el núcleo de FSD Lite:**

El hook de View-Model es el **intermediario** entre el estado global (store) y el componente de presentación. Es responsable de:
1. Leer del store (`useGameContext`)
2. Computar datos derivados (`useMemo`)
3. Exponer handlers tipados (funciones nombradas, no dispatch crudo)
4. Gestionar el estado local de UI de la feature (`useState`)

```ts
// features/game/use-game-board.ts — View-Model completo
export const useGameBoard = () => {
  // 1. Leer del store
  const { state, dispatch } = useGameContext()
  const { t } = useTranslation()

  // 2. Estado local de la feature (no pertenece al store global)
  const [entries, setEntries] = useState<Record<string, ScoreEntry>>({})
  const [error, setError] = useState<string | null>(null)
  const [exitOpen, setExitOpen] = useState(false)

  // 3. Datos derivados (se calculan desde el estado)
  const rankInfo = useMemo(
    () => standings(state.players, state.rounds, state.gameRules.mode),
    [state.players, state.rounds, state.gameRules.mode],
  )

  const players = useMemo(
    () => state.players.map((p, i) => ({
      ...p,
      color: playerColor(i),
      total: playerTotal(p.id, state.rounds),
      rank: rankInfo[p.id]?.rank ?? 0,
      entry: entries[p.id] ?? emptyEntry(),
    })),
    [state.players, state.rounds, entries, rankInfo],
  )

  // 4. Handlers tipados (el componente no conoce dispatch)
  const submitRound = () => {
    // Validación + transformación + dispatch
    const scores = buildScores(entries, state.players)
    if (!scores) { setError(t("game.errorScores")); return }
    dispatch({ type: "SUBMIT_ROUND", payload: scores })
    setEntries({})
  }

  // 5. Interfaz del View-Model (lo que ve el componente)
  return {
    t,
    players,
    rounds: state.rounds,
    currentRound: state.currentRound,
    totalRounds: state.totalRounds,
    isInputPhase: state.isInputPhase,
    error,
    exitOpen,
    endRound: () => dispatch({ type: "END_ROUND" }),
    submitRound,
    setScore,
    toggleArrived,
    requestExit: () => setExitOpen(true),
    cancelExit: () => setExitOpen(false),
    confirmExit: () => { setExitOpen(false); dispatch({ type: "EXIT_GAME" }) },
  }
}
```

**El componente de presentación — máxima simplicidad:**
```tsx
// features/game/GameBoard.tsx — SOLO presentación
export const GameBoard = () => {
  const vm = useGameBoard()  // ← Único punto de contacto con la lógica

  return (
    <main>
      <header>
        <p>Round {vm.currentRound}/{vm.totalRounds}</p>
        <Button onClick={vm.requestExit}>{vm.t("game.exit")}</Button>
      </header>

      <table>
        {vm.players.map(p => (
          <th key={p.id} style={{ color: p.color }}>{p.name}</th>
        ))}
        {/* ... */}
      </table>

      <Button onClick={vm.isInputPhase ? vm.submitRound : vm.endRound}>
        {vm.isInputPhase ? vm.t("game.confirmScores") : vm.t("game.endRound")}
      </Button>
    </main>
  )
}
```

**¿Por qué esto es poderoso?** El componente `GameBoard.tsx` se puede testear con un mock del hook `useGameBoard`, sin necesidad de montar providers ni simular estado global.

---

#### Capa 5: `app/` — El punto de entrada

La capa más delgada posible. Solo compone las piezas y arranca la aplicación.

```
app/
├── App.tsx          ← Composición de providers + layout principal
├── main.tsx         ← Punto de entrada de React (ReactDOM.render)
└── index.css        ← Estilos globales / design tokens
```

```tsx
// app/App.tsx
export const App = () => (
  <I18nProvider>
    <GameProvider>
      <AppShell />
    </GameProvider>
  </I18nProvider>
)

const AppShell = () => {
  const { state, dispatch } = useGameContext()
  const [restoredBanner, setRestoredBanner] = useState(false)
  const [warningBanner, setWarningBanner] = useState(false)

  // Hook de persistencia: conecta store con IO de manera declarativa
  useGamePersistence(
    state, dispatch,
    () => setRestoredBanner(true),
    () => setWarningBanner(true),
  )

  return (
    <div>
      <LanguageToggle />
      <NotificationBanners restored={restoredBanner} warning={warningBanner} />
      <PhaseRouter phase={state.phase} />
    </div>
  )
}
```

---

### A.5 Reglas de Importación — Tabla de Referencia

| Desde \ Hacia | `app` | `features` | `store` | `shared` | `domain` |
|---------------|:-----:|:----------:|:-------:|:--------:|:--------:|
| **`app`** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **`features`** | ❌ | ⚠️* | ✅ | ✅ | ✅ |
| **`store`** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **`shared`** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **`domain`** | ❌ | ❌ | ❌ | ❌ | ✅ |

> ⚠️* Una feature sólo puede importar de otras features si existe una relación de composición explícita (una feature contiene a la otra). En general, features no deben importarse entre sí — si necesitan comunicarse, eso pertenece al `store`.

---

### A.6 FSD Lite vs. Organización Plana vs. FSD Completo

| Criterio | Organización Plana | FSD Lite | FSD Completo |
|----------|--------------------|----------|--------------|
| **Curva de aprendizaje** | Mínima | Baja | Media-Alta |
| **Líneas de código extra** | 0% | ~5% | ~30-40% |
| **Adecuado para** | Proyectos <5 pantallas | 5-20 pantallas | >20 pantallas, equipos grandes |
| **Separación de concerns** | Débil | Buena | Excelente |
| **Testabilidad** | Media | Alta | Muy alta |
| **Predecibilidad de imports** | Baja | Alta | Muy alta |
| **Resistencia al acoplamiento** | Baja | Media-Alta | Alta |

---

### A.7 Casos de Ejemplo: Dónde va cada cosa

A continuación, ejemplos concretos de decisiones de localización aplicados a este proyecto:

#### Caso 1: "Necesito añadir una función que calcule el promedio de puntuación por ronda"

```ts
// ✅ Va en: domain/game/score-engine.ts
// Motivo: es lógica pura de negocio, sin dependencias de UI ni de React

export function averageScorePerRound(
  playerId: string,
  rounds: Round[],
): number {
  if (rounds.length === 0) return 0
  const total = rounds.reduce((sum, r) => sum + (r.scores[playerId] ?? 0), 0)
  return total / rounds.length
}
```

---

#### Caso 2: "Necesito un spinner de carga genérico"

```tsx
// ✅ Va en: shared/components/Spinner.tsx
// Motivo: es UI genérica sin lógica de negocio

export const Spinner = ({ size = 16 }: { size?: number }) => (
  <span
    className="animate-spin rounded-full border-2 border-primary border-t-transparent"
    style={{ width: size, height: size }}
    role="status"
    aria-label="Cargando..."
  />
)
```

---

#### Caso 3: "Necesito mostrar un banner cuando el usuario lleva más de 3 rondas en último lugar"

```ts
// ✅ La LÓGICA va en: domain/game/score-engine.ts
export function isOnLosingStreak(
  playerId: string,
  rounds: Round[],
  threshold = 3,
): boolean {
  if (rounds.length < threshold) return false
  const lastN = rounds.slice(-threshold)
  return lastN.every(r => {
    const maxScore = Math.max(...Object.values(r.scores))
    return r.scores[playerId] === maxScore
  })
}

// ✅ La DECISIÓN DE MOSTRAR va en: features/game/use-game-board.ts
const losingStreak = useMemo(
  () => state.players.map(p => ({
    ...p,
    isOnLosingStreak: isOnLosingStreak(p.id, state.rounds),
  })),
  [state.players, state.rounds],
)

// ✅ La PRESENTACIÓN va en: features/game/GameBoard.tsx
{vm.players.map(p => (
  <th key={p.id}>
    {p.name}
    {p.isOnLosingStreak && <span title="¡Racha perdedora!">🔥</span>}
  </th>
))}
```

---

#### Caso 4: "Necesito guardar las preferencias de idioma en localStorage"

```ts
// ✅ La INFRAESTRUCTURA va en: shared/i18n/lang-storage.ts
// (shared puede usar APIs del navegador, pero no lógica de negocio)

const LANG_KEY = "app_lang"

export function saveLang(lang: Lang): void {
  try { localStorage.setItem(LANG_KEY, lang) } catch {}
}

export function loadLang(): Lang | null {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    return stored === "en" || stored === "es" ? stored : null
  } catch {
    return null
  }
}
```

---

#### Caso 5: "Necesito que la pantalla de resultados muestre datos del juego actual"

```ts
// ✅ El ACCESO AL ESTADO va en: features/results/use-game-results.ts
// (features puede leer del store)

export const useGameResults = () => {
  const { state, dispatch } = useGameContext()   // ← store
  const { t } = useTranslation()                 // ← shared

  const ranked = useMemo(
    () => rankPlayers(state.players, state.rounds, state.gameRules.mode),  // ← domain
    [state.players, state.rounds, state.gameRules.mode],
  )

  return {
    t,
    ranked,
    newGame: () => dispatch({ type: "EXIT_GAME" }),
  }
}

// ✅ El COMPONENTE es solo presentación: features/results/GameResults.tsx
export const GameResults = () => {
  const vm = useGameResults()
  return (
    <main>
      <h1>{vm.t("results.title")}</h1>
      <ol>
        {vm.ranked.map(r => <li key={r.player.id}>{r.player.name}: {r.total}</li>)}
      </ol>
      <Button onClick={vm.newGame}>{vm.t("results.newGame")}</Button>
    </main>
  )
}
```

---

### A.8 Señales de Alarma (Code Smells en FSD Lite)

Estos patrones indican que algo está en el lugar incorrecto:

| Code Smell | Ejemplo | Fix |
|------------|---------|-----|
| `domain` importa de React | `import { useState } from "react"` en un helper | Mover a hook en `features/` o `store/` |
| `shared` importa del `store` | `import { useGameContext }` en `Button.tsx` | El componente shared no necesita saber del estado del juego |
| `features` comparten estado via imports directos | `import { useGameBoard } from "../game/..."` en `GameResults.tsx` | Si deben compartir estado, va al `store` |
| Un componente llama `dispatch` directamente | `dispatch({ type: "SUBMIT_ROUND", ... })` en `GameBoard.tsx` | El dispatch pertenece al View-Model, no al componente |
| Un hook de `domain` retorna JSX | `return <div>...</div>` en un helper | Los helpers de domain son funciones puras, sin JSX |
| Una función pura usa `console.log` de depuración | `console.log("score:", score)` en `score-engine.ts` | Eliminar o usar el logger de infraestructura si existe |

---

### A.9 Comparativa con Otros Patrones de Organización Conocidos

#### vs. Organización por Tipo (la más común en proyectos React)

```
// Organización por tipo (patrón habitual junior/mid)
src/
├── components/   ← Todos los componentes mezclados
├── hooks/        ← Todos los hooks mezclados
├── utils/        ← Todas las utilidades mezcladas
└── types/        ← Todos los tipos mezclados

// FSD Lite
src/
├── domain/       ← Lógica de negocio pura
├── shared/       ← UI genérica + utils sin negocio
├── store/        ← Estado global
└── features/     ← Pantallas con su VM y sub-componentes
```

**Problema de la organización por tipo:** Cuando el proyecto crece, `components/` acaba teniendo 40+ archivos de contextos completamente diferentes. Encontrar el componente correcto requiere conocer el naming convention. Tampoco hay reglas claras de qué puede importar de qué.

**Ventaja de FSD Lite:** La ubicación del archivo comunica inmediatamente **qué es** (dominio, UI genérica, feature) y **de dónde puede depender**.

---

#### vs. Atomic Design (atoms/molecules/organisms)

Atomic Design organiza por **tamaño del componente**, no por **propósito**:

```
// Atomic Design
src/
├── atoms/        ← Button, Input, Label
├── molecules/    ← FormField (Label + Input)
├── organisms/    ← GameSetupForm (múltiples FormFields)
├── templates/    ← GameLayout
└── pages/        ← GamePage
```

**Problema:** No dice nada sobre dónde va la lógica de negocio. Un `organism` puede o no tener lógica; no hay convención. Tampoco hay reglas de imports.

**FSD Lite complementa o reemplaza Atomic Design** porque separa la estructura de la lógica: los `atoms` de Atomic Design vivirían en `shared/components/`, mientras que la lógica de negocio va en `domain/` y la composición de pantallas en `features/`.

---

#### vs. Next.js App Router (organización por rutas)

Next.js App Router organiza por **rutas del sistema de archivos**:

```
app/
├── (game)/
│   ├── setup/page.tsx
│   ├── play/page.tsx
│   └── results/page.tsx
└── layout.tsx
```

**Cuándo coexisten:** FSD Lite y App Router son compatibles. Las `pages` de Next.js son el equivalente a `features/` en FSD Lite — contienen los componentes de pantalla. El `domain/`, `shared/` y `store/` se ubican fuera del directorio `app/` del router.

```
src/
├── app/                   ← Router de Next.js (páginas)
│   ├── (game)/
│   │   ├── setup/page.tsx ← Solo importa desde features/setup/
│   │   └── play/page.tsx  ← Solo importa desde features/game/
│   └── layout.tsx
├── domain/                ← FSD Lite
├── shared/                ← FSD Lite
├── store/                 ← FSD Lite
└── features/              ← FSD Lite (lógica de cada pantalla)
```

---

### A.10 Resumen: Las 5 Preguntas para Ubicar Cualquier Archivo

Cuando no sabes dónde poner algo nuevo, responde estas preguntas en orden:

```
1. ¿Es lógica pura de negocio sin dependencias de UI ni browser?
   → domain/

2. ¿Es UI genérica o una utilidad reutilizable entre juegos/features?
   → shared/

3. ¿Es estado compartido entre múltiples features?
   → store/

4. ¿Es lógica o UI específica de una pantalla/feature concreta?
   → features/<nombre-de-la-feature>/

5. ¿Es configuración global, providers o bootstrapping?
   → app/
```

> **Regla de oro:** Si un archivo tiene que importar de `features/`, no puede estar en `domain/` ni en `shared/`. Si no puede vivir sin React, no puede estar en `domain/`. Si sabe cosas del juego de Mexican Train, no puede estar en `shared/`.
