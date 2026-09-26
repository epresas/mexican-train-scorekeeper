# Plan de Validación: Migración a FSD Lite

El objetivo del plan de validación es asegurar que, durante la migración arquitectónica, ninguna funcionalidad existente de la aplicación sufra regresiones. La estrategia se basa en comprobaciones manuales (checkpoint QA) y la consolidación de tests automatizados (Fase 4).

## 1. Validación de Quick Wins (Fase 1)
- [ ] **Uso de cámara:** Ingresar al juego (setup > juego) en dispositivo que contenga cámara y verificar que no hay logs sucios y la solicitud de permiso es la misma.
- [ ] **Creación de Partida:** Iniciar una partida con reglas personalizadas. Verificar mediante Redux/React DevTools (o logs) que solo se lanza un único state change para configurar reglas y empezar el juego (el doble render debe desaparecer).
- [ ] **Linter Local:** Correr `npm run lint` y verificar que el código está unificado bajo reglas estándar.
- [ ] **Persistencia robusta:** Inyectar texto corrupto manualmente en LocalStorage/IndexedDB (key `mexican_train_scorekeeper_state`) y asegurar que la app reinicia limpia al Dashboard sin crashear.

## 2. Validación de Concerns y Refactorización (Fase 2)
- [ ] **Banners de estado:** Al forzar un refresco (F5) dentro de una partida, el estado debe restaurarse de manera idéntica y mostrar el `RestoredBanner`.
- [ ] **Fallo de almacenamiento:** Provocar un fallo en persistencia y comprobar que se muestra el `WarningBanner`. Validar que el contexto `GameContext` se siente más liviano en el DevTools.
- [ ] **Penalizaciones UI:** Verificar que el overlay/popover de penalizaciones siga anclándose correctamente a la columna del jugador respectivo tras mover la ref.
- [ ] **Reconocimiento de Fichas (IA):** En caso de estar el scanner activado, escanear una ficha (o fallar el escaneo) y comprobar que la comunicación al Vercel Serverless Function sigue intacta tras abstraer los prompts.

## 3. Validación Estructural (Fase 3 - Migración de archivos)
- [ ] **Verificación de Build:** El comando `npm run build` debe ser exitoso sin rutas huérfanas ni imports cíclicos o perdidos.
- [ ] **Smoke Test de Navegación:** Correr el entorno de desarrollo y navegar todo el flujo:
  1. `Dashboard` -> Mostrar modal de ayuda.
  2. `Setup` -> Editar cantidad de jugadores/rondas y cambiar reglas (Arrivals vs Standard).
  3. `Game` -> Introducir puntuaciones manuales, togglear llegadas, editar puntuación previa.
  4. `Resultados` -> Comprobar que los cálculos finales y gráficos se muestren con los estilos definidos.
- [ ] **Testing de Componentes Compartidos:** Confirmar que `shared/` exporte los componentes y todos los imports apliquen la nomenclatura FSD.

## 4. Validación Automatizada (Fase 4)
- [ ] **Test Coverage:** El coverage general del core de negocio (`src/domain/`) debe ser mayor al 90%.
- [ ] **Ejecución de CI:** El comando `npm run test` debe ejecutar la suite limpia sin advertencias de react-dom/test-utils.
