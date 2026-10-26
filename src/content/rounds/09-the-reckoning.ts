import { defineGauntlet } from '../types';

// No trivia. Every square draws live from the decks, so the board is never the same twice.
export default defineGauntlet({
  id: "r9",
  name: "Round 9: The Reckoning",
  tagline: "No trivia. Forty squares of tasks, dares, duels and push-ups.",
  categories: {
    "Physical Feats": { deck: "challenge", type: "physical" },
    "Center Stage": { deck: "challenge", type: "performance" },
    "Fast Hands": { deck: "challenge", type: "speed" },
    "Head to Head": { deck: "duel" },
    "Feel the Burn": { deck: "challenge", type: "burn" },
    "Dealer's Choice": { deck: "challenge" },
    "Dares": { deck: "challenge", type: ["social", "drink"] },
    "All In": { deck: "challenge", type: "room" },
  },
});
