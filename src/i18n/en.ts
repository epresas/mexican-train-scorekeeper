import type { TranslationKey } from "./es"

export const en: Record<TranslationKey, string> = {
  // Generic
  "app.title": "Mexican Train",
  "app.subtitle": "Scorekeeper for the domino game",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.next": "Next",
  "common.prev": "Back",
  "common.start": "Start",
  "common.finish": "Finish",
  "common.player": "Player",
  "common.players": "Players",
  "common.round": "Round",
  "common.rounds": "Rounds",
  "common.total": "Total",
  "common.points": "Points",
  "common.rank": "Rank",
  "common.gameRestored": "Game restored",
  "common.storageWarning": "Could not save game on this device",

  // Language toggle
  "lang.label": "Language",

  // Dashboard
  "dashboard.hero": "Mexican Train",
  "dashboard.tagline": "Keep score for your domino games like a true pro.",
  "dashboard.play": "Let's Play!",
  "dashboard.howToPlay": "How to play?",

  // Help modal
  "help.title": "How to play",
  "help.step1.title": "The goal",
  "help.step1.body":
    "Mexican Train is played with dominoes. The goal is to get rid of all your tiles before everyone else and score the fewest points.",
  "help.step2.title": "The rounds",
  "help.step2.body":
    "Each game has several rounds. At the end of each round, players add up the pips on the tiles left in their hand.",
  "help.step3.title": "Reaching the station",
  "help.step3.body":
    "The player who runs out of tiles 'arrives' and scores 0 points that round. Check the 'Arrived' box for them!",
  "help.step4.title": "Enter the scores",
  "help.step4.body":
    "At the end of each round, enter each player's points. Fewer points is better. The app tallies the totals automatically.",
  "help.step5.title": "Lowest score wins",
  "help.step5.body":
    "Once all rounds are complete, the player with the lowest total wins the game. All aboard!",
  "help.step6.title": "Arrival bonus",
  "help.step6.body":
    "If you enable 'Subtract 10 points on arrival', each time a player goes out 10 points are deducted from their running total. The total can turn negative — when it does, you'll see the deduction in parentheses, e.g. -5 (-10).",
  "help.step7.title": "Penalties",
  "help.step7.body":
    "If you enable penalties, a ⚠️ icon appears next to each player's name. Tap it to add penalties during a round. When you confirm scores, each penalty count is multiplied by ×3 or ×5 (as configured) and added to that player's score.",
  "help.step8.title": "Arrivals mode",
  "help.step8.body":
    "If you enable 'Arrivals mode' in setup, instead of adding up tile points for each player, you simply select who went out in each round. The winner will be the player with the most arrivals at the end.",
  "help.progress": "Step {current} of {total}",

  // Setup
  "setup.title": "Game setup",
  "setup.playerCount": "Number of players",
  "setup.roundCount": "Number of rounds",
  "setup.playerNames": "Player names",
  "setup.playerPlaceholder": "Player {n}",
  "setup.additionalRules": "Additional rules",
  "setup.arrivalsOnlyMode": "Arrivals mode",
  "setup.arrivalBonus": "Subtract 10 points on arrival",
  "setup.enablePenalties": "Enable penalties",
  "setup.penaltyMultiplier": "Multiplier",
  "setup.startGame": "Start game",
  "setup.errorNames": "Every player needs a name.",
  "setup.errorDuplicate": "Names cannot be repeated.",

  // Game board
  "game.roundOf": "Round {current} of {total}",
  "game.exit": "Exit",
  "game.arrived": "Arrived",
  "game.endRound": "End round",
  "game.confirmScores": "Confirm scores",
  "game.enterScores": "Enter this round's scores",
  "game.runningTotal": "Running total",
  "game.roundTimer": "Round timer",
  "game.errorScores": "Enter a valid score for each player.",
  "game.addPenaltyTo": "Add penalty to {name}",

  // Results
  "results.title": "Final results",
  "results.winner": "Winner!",
  "results.viewStats": "View stats",
  "results.newGame": "New game",
  "results.arrivals": "arrivals",
  "results.points": "pts",
  "results.shareButton": "Share result",
  "results.shareGenerating": "Generating image...",
  "results.shareError": "Could not generate the image. Please try again.",

  // Stats
  "stats.title": "Stats",
  "stats.scoreProgression": "Score progression",
  "stats.mostArrivals": "Most arrivals",
  "stats.mostLast": "Most times last",
  "stats.totalTime": "Total time",
  "stats.highestRound": "Highest single round",
  "stats.none": "—",

  // Exit modal
  "exit.title": "Exit the game?",
  "exit.body": "You will lose the current game's progress. Are you sure you want to exit?",
  "exit.stay": "Stay",
  "exit.confirm": "Exit",
}
