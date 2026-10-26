import type { Duel } from './types';

export const DUELS: Duel[] = [
  { t: "Thumb War", d: "Best of three. One, two, three, four — declare a thumb war." },
  { t: "Rochambeau", d: "Rock, paper, scissors. Best of five. No shooting late." },
  { t: "The Stare", d: "Staring contest. First to blink or laugh loses." },
  { t: "Arm Wrestle", d: "Find a table. Elbows down. One round." },
  { t: "Deep Breath", d: "Both hold your breath. Last one breathing wins." },
  { t: "Wall Sit Duel", d: "Both against the wall, thighs parallel. Last one up wins." },
  { t: "Plank Duel", d: "Both plank. Last one holding wins." },
  { t: "Push-Up Duel", d: "Twenty seconds. Most clean push-ups wins.", timer: 20 },
  { t: "Flamingo Duel", d: "Both on one foot, eyes closed. Last one balanced wins." },
  { t: "Franchise Volley", d: "Alternate naming NFL teams. First to stall or repeat loses." },
  { t: "State Volley", d: "Alternate naming U.S. states. First to stall or repeat loses." },
  { t: "Topping Volley", d: "Alternate naming pizza toppings. First to stall or repeat loses." },
  { t: "Mouse House Volley", d: "Alternate naming Disney movies. First to stall or repeat loses." },
  { t: "Tap Room Volley", d: "Alternate naming beer brands. First to stall or repeat loses." },
  { t: "Hero Volley", d: "Alternate naming Marvel characters. First to stall or repeat loses." },
  { t: "Backwards Race", d: "Both say the alphabet backwards. First one through, cleanly, wins.", timer: 45 },
  { t: "Split The Difference", d: "The host writes down a number between 1 and 100. Both duelists write a guess down, then reveal together. Closest wins." },
  { t: "Sudden Death", d: "The host reads one trivia question. First correct answer wins it." },
  { t: "Weather Check", d: "Both unlock your phone and open the weather app. First to read the current temperature out loud wins." },
  { t: "Battery Roulette", d: "Both hold up your phone. Lower battery percentage wins. Pure fate." },
  { t: "Middle Names", d: "Alternate naming middle names of people in this room. First to stall loses." },
  { t: "Silent Treatment", d: "Both try to make the other laugh. No touching. First to crack loses.", timer: 60 }
];
