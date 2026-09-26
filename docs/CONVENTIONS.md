# Coding Conventions and Standards

> **Objective:** This document defines the architecture, coding style, and design patterns used in the project. It is designed so that any new developer (or AI agent) can quickly understand **how** the code is structured and, more importantly, **why** these decisions were made.

---

## 1. Architecture: Feature-Sliced Design (FSD) Lite

The project uses a pragmatic variant of **Feature-Sliced Design (FSD)** adapted for the scope of a PWA. The golden rule of FSD is: **Group by domain (business) responsibility, not by technical role**.

### Main Layers
- **`app/`**: Global initialization of the application. It contains the main router (`PhaseRouter`), context providers, and base styles. *Why?* It keeps the entry point clean and isolated from the rest of the logic.
- **`domain/`**: Pure business logic (no React, no side-effects). This is where base types, the reducer (`game-reducer.ts`), and scoring logic live. *Why?* Allows testing game rules in isolation, independent of the UI framework.
- **`features/`**: Screens and user flows (e.g., `dashboard`, `game`, `setup`). Each feature is a self-contained module. *Why?* Scaling the app simply means adding a new folder, without touching existing code.
- **`infrastructure/`**: Code that communicates with the outside world (e.g., APIs, databases). *Why?* Isolates external integrations to facilitate mocking in tests.
- **`shared/`**: Generic UI Kit (buttons, modals), cross-cutting hooks (`use-timer`), and configuration. *Why?* Avoids code duplication for elements that lack specific business logic.
- **`store/`**: Global state of the application. *Why?* Centralizes the knowledge of where and how the state is persisted.

---

## 2. Global State Management

We use **React Context + `useReducer`** instead of external libraries (like Redux or Zustand).
- **Why?** The project's scope doesn't require complex middlewares, and we avoid inflating the bundle size.
- **Separation of Responsibilities in `store/`:**
  - `game-context/`: Houses the provider that injects reactive memory.
  - `use-game-persistence/`: Houses the hook that manages the storage lifecycle (Local Storage).
  - *Decision:* They are in separate folders but at the same level within `store/` because both solve the same business need (Global State), regardless of whether one is a component and the other is a hook. FSD prioritizes domain over technology.

---

## 3. View-Model Pattern (Custom Hooks per Feature)

Every main component of a `feature/` (e.g., `GameBoard.tsx`) delegates all its logic to a sibling custom hook (e.g., `useGameBoard.ts`).
- **Why?** It implements the **MVVM** (Model-View-ViewModel) pattern. The React component becomes 100% presentational (only drawing UI based on props/state), while the hook contains all the "intelligence" (dispatching actions, calculating derivatives, managing timers).
- *Advantage:* Greatly facilitates testing, as you can test the logic by interacting with the hook without mounting the DOM.

---

## 4. Atomic Component Structure

**Strict Rule:** Defining multiple functional React components within the same file (inline or nested components) is strictly prohibited.
- **Why?** Defining a component inside another causes React to destroy and remount it from scratch on every render (losing state and destroying performance).
- **Solution:** If a component (e.g., `GameSetup`) needs complex sub-components (e.g., `Stepper`), these are extracted to: `src/features/setup/components/stepper/Stepper.tsx`.
- *Individual folders:* Each extracted component lives in its own homonymous folder. This allows freely encapsulating styles, sub-hooks, or specific tests without polluting the root directory of the feature.

---

## 5. Naming Conventions

- **Directories and Folders:** Always in `kebab-case` (e.g., `editable-score-cell`, `game-context`). *Why?* Avoids case-sensitivity issues between operating systems (Windows/Mac vs Linux).
- **React Components:** Always in `PascalCase` with a `.tsx` extension (e.g., `GameBoard.tsx`).
- **Hooks:** Always in `camelCase` prefixed with `use` (e.g., `useGamePersistence.ts`).
- **Pure Logic Files:** Utility functions or reducers are written in `kebab-case` with a `.ts` extension (e.g., `score-engine.ts`, `game-reducer.ts`).

---

## 6. Test Co-location

Test files do not live in a global `tests/` folder at the root of the project. Instead, they are placed next to the file they are testing inside a `__tests__/` folder.
- Example: `src/features/game/__tests__/useGameBoard.test.tsx`.
- **Why?** Follows the *Co-location* principle (what changes together, lives together). If you delete or refactor a feature, it is trivial to find and remove/update its associated tests without leaving dead code behind.

---

## 7. Versioning (SemVer)

We follow **Semantic Versioning**:
- **Major (X.y.z):** Deep architectural changes (e.g., FSD migration) or substantial modifications to the persisted data contract.
- **Minor (x.Y.z):** New functionalities (features) that don't break anything from previous versions.
- **Patch (x.y.Z):** Technical bug fixes and design (UX/UI) tweaks.
