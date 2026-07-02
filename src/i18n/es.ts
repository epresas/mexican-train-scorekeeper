export const es = {
  // Generic
  "app.title": "Tren Mexicano",
  "app.subtitle": "Anotador para el juego de dominó",
  "common.cancel": "Cancelar",
  "common.close": "Cerrar",
  "common.next": "Siguiente",
  "common.prev": "Anterior",
  "common.start": "Empezar",
  "common.finish": "Finalizar",
  "common.player": "Jugador",
  "common.players": "Jugadores",
  "common.round": "Ronda",
  "common.rounds": "Rondas",
  "common.total": "Total",
  "common.points": "Puntos",

  // Language toggle
  "lang.label": "Idioma",

  // Dashboard
  "dashboard.hero": "Tren Mexicano",
  "dashboard.tagline": "Lleva el marcador de tus partidas de dominó como todo un profesional.",
  "dashboard.play": "¡A jugar!",
  "dashboard.howToPlay": "¿Cómo se juega?",

  // Help modal
  "help.title": "Cómo se juega",
  "help.step1.title": "El objetivo",
  "help.step1.body":
    "El Tren Mexicano se juega con fichas de dominó. El objetivo es deshacerte de todas tus fichas antes que los demás y sumar la menor cantidad de puntos.",
  "help.step2.title": "Las rondas",
  "help.step2.body":
    "Cada partida tiene varias rondas. Al terminar cada ronda, los jugadores suman los puntos de las fichas que les quedaron en la mano.",
  "help.step3.title": "Llegar a la estación",
  "help.step3.body":
    "El jugador que se queda sin fichas 'llega' y anota 0 puntos en esa ronda. ¡Marca la casilla 'Llegó' para él!",
  "help.step4.title": "Anota los puntos",
  "help.step4.body":
    "Al final de cada ronda, ingresa los puntos de cada jugador. Menos puntos es mejor. La app calcula los totales automáticamente.",
  "help.step5.title": "Gana el que menos suma",
  "help.step5.body":
    "Cuando se completan todas las rondas, el jugador con el menor puntaje total gana la partida. ¡Que empiece el tren!",
  "help.progress": "Paso {current} de {total}",

  // Setup
  "setup.title": "Configurar partida",
  "setup.playerCount": "Número de jugadores",
  "setup.roundCount": "Número de rondas",
  "setup.playerNames": "Nombres de los jugadores",
  "setup.playerPlaceholder": "Jugador {n}",
  "setup.startGame": "Iniciar partida",
  "setup.errorNames": "Todos los jugadores necesitan un nombre.",
  "setup.errorDuplicate": "Los nombres no pueden repetirse.",

  // Game board
  "game.roundOf": "Ronda {current} de {total}",
  "game.exit": "Salir",
  "game.arrived": "Llegó",
  "game.endRound": "Terminar ronda",
  "game.confirmScores": "Confirmar puntos",
  "game.enterScores": "Ingresa los puntos de la ronda",
  "game.runningTotal": "Total acumulado",
  "game.roundTimer": "Tiempo de ronda",
  "game.errorScores": "Ingresa un puntaje válido para cada jugador.",

  // Results
  "results.title": "Resultados finales",
  "results.winner": "¡Ganador!",
  "results.viewStats": "Ver estadísticas",
  "results.newGame": "Nueva partida",
  "results.arrivals": "llegadas",
  "results.points": "pts",

  // Stats
  "stats.title": "Estadísticas",
  "stats.scoreProgression": "Evolución del puntaje",
  "stats.mostArrivals": "Más llegadas",
  "stats.mostLast": "Más veces último",
  "stats.totalTime": "Tiempo total",
  "stats.longestRound": "Ronda más larga",
  "stats.none": "—",

  // Exit modal
  "exit.title": "¿Salir de la partida?",
  "exit.body": "Se perderá el progreso de la partida actual. ¿Seguro que quieres salir?",
  "exit.stay": "Quedarme",
  "exit.confirm": "Salir",
}

export type TranslationKey = keyof typeof es
