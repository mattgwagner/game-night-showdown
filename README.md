# Game Night Showdown

A Jeopardy-style party game built for one specific friend group. No accounts, no
backend beyond a tiny buzzer relay. The TV shows the board, the host's phone holds the
answers, and everybody else's phone is a buzzer.

Built for a long weekend in a house full of people, which is why it is not only trivia:
a few squares on every board are live-action — challenges, duels and point swings.

## Run it

```bash
npm install
npm run dev      # prints a LAN address; open it on the iPad, the TV, or your phone
```

Live at https://mattgwagner.github.io/game-night-showdown/. Every push to `main` is
type-checked, tested, built and deployed to GitHub Pages by `.github/workflows/deploy.yml`.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on your LAN |
| `npm test` | Content and game-rule tests (fast; run these after editing questions) |
| `npm run check` | Type-check + tests, the same gate CI runs before deploying |
| `npm run test:e2e` | Browser tests: show, host phone and a player against a local buzz worker |
| `npm run build` | Production build into `dist/` |

## How it plays

**Setup** — add 2–10 teams or solo players, then set two independent switches.

Spice level:

- ☀️ **Family Friendly** — kids in the room, grandma on the couch.
- 🌙 **After Dark** — unlocks the dares that involve your camera roll and your text history.

And drinking games, on their own toggle — deliberately *not* folded into After Dark,
because an adult room often has somebody sober, pregnant or driving, and they shouldn't
have to give up the spicy deck to spare them. Every drinking card is a sip, never a shot
or a chug, and every one offers **the forfeit** instead — a random ten-second bit drawn from
35 of them (do the last person's impression, sing your next sentence, give a real compliment
to the person on your left). Anybody can call for the forfeit, drinker or not, so taking one
never marks you out — and it's usually funnier than the sip.

Both switches filter every deck in the game, so the same app works at 4pm and at 11pm.

**Pick a board size** — Quick (4 categories, ~20 min, the default), Standard (6, ~35 min) or
Marathon (8, ~50 min). Categories are drawn fresh from the round every time, so playing
the same round twice never gives you the same board. There's a Surprise Me button if
nobody can agree.

**Or skip the board entirely** — three formats that aren't Jeopardy at all:

| | |
|---|---|
| ⚡ **Lightning Round** | 60 seconds per team, rapid fire, 100 a pop. Passing costs only clock. |
| 🎯 **Last Team Standing** | One question each around the room. Miss and you're out. Survive alone, take 1000. |
| 🥔 **Hot Potato** | One category, teams alternate naming things. Stall or repeat and you're eliminated. |

**Pick a board** — fifteen boards, listed in a fresh order every session. Fourteen are
trivia, spanning 112 categories: beer, BattleBots, firearms, Disney, AI, college football, grilling,
boats, Labor Day, NBA, golf, soccer, the Olympics, Star Wars, horror, dinosaurs, sharks,
bourbon, presidents, Field Artillery, and a lot more. One board is nothing but formats
that get people shouting — emoji decode, riddles, Before & After, brand slogans, Odd One
Out. And one is different from all of them:

> **Round 9: The Reckoning** — no trivia at all. Forty squares of physical feats,
> push-ups, performances, speed rounds, duels, hot seats and dares. Every square
> draws live from the decks, so the board is never the same twice.

**Play** — whoever got the last question right picks the next square (and reads it).
A miss leaves the pick where it was, so the board doesn't just rotate. Anyone can
still shout out the answer.

**Daily Double** — one hidden square per board. Wager, then answer.

**Wildcards** — about one unmarked square per three categories hijacks the game:

| | |
|---|---|
| 🔥 Challenge Accepted | Some are yours alone — beat it or get nothing. Some are the whole room, and the winner scores. |
| ⚔️ Duel | Pick an opponent. Only one of you walks away with points. |
| 🍻 Bar Tab | Down the square's value. |
| 🏹 Robin Hood | Take points straight off the leader. |
| 💸 Everybody Pays | You're exempt. Everyone else isn't. |

Challenges need nothing but bodies and phones — no props to hunt down — and nothing is
decided by a room vote.

Challenges and duels come with a real countdown timer that beeps at you.

**Daily Double** — one hidden square per board. Wager up to your whole score.

**The Final Showdown** — clearing the board doesn't just end the game. A category is
revealed, every team wagers blind, one hard question decides it. Games flip on this.

**Weekend Tournament** — bank each finished game to a running leaderboard that persists
across sessions. Play Friday, Saturday and Sunday and crown one champion at the end.

## Host controls

Because real life overrules the app:

- **🎯 Side Quest** — pull a challenge out of thin air, worth 200, without burning a square.
- **🎲 Random Square** — when nobody can decide.
- **✏️ Scores** — nudge anyone's total.
- **↩ Undo** — reverses the last square completely: scores, streaks, the square itself.
- **Autosave** — the game survives a closed tab. Reopen and Resume.

## Adding questions and categories

All the content lives in `src/content/`. You never touch game code to add any of it.

**Add a category** to a round in `src/content/rounds/`: a name and exactly five
questions, easiest first (100 → 500).

```ts
"Grilling & BBQ": [
  { q: "The low-and-slow method that cooks with smoke instead of flame.", a: "Smoking" },
  { q: "...", a: "..." },
  { q: "...", a: "..." },
  { q: "...", a: "..." },
  { q: "Hours to smoke a whole brisket at 225°F?", a: "About 12 (1 to 1.5 hours a pound)", hint: "Closest guess wins." },
],
```

The editor and `npm test` reject a category with four or six questions, a blank
answer, or a question that's already on another board. `hint` is optional and shows
above the question. To show the same hint on every question in a category (in any
round), add it to `src/content/category-hints.ts` instead.

**Add a round**: copy any file in `src/content/rounds/`, give it a new `id` and
`name`, and fill in at least four categories (eight is the norm; the host puts 4, 6
or 8 on the board). Files load automatically, so there is no list to update. Never
reuse or rename a round's `id`, because saved games find their round by it.

**You don't place the Daily Double or the wildcards.** At game start one random square
becomes the Daily Double, and about one square per three categories becomes a wildcard.

**Decks** (each is one file in `src/content/`):

- `challenges.ts` — tasks tagged `physical` / `burn` / `performance` / `speed` / `social` / `room` / `drink`.
  `who` is `"one"`, `"team"` or `"room"` (everybody plays, the winner's team scores).
- `duels.ts`, `bonus-questions.ts` (Lightning Round and Last Team Standing), `final-showdown.ts`,
  `list-prompts.ts` (Hot Potato), `forfeits.ts`, `team-names.ts`

Add `spice: "party"` to hide a card in Family Friendly mode, or `drinks: true` to put it
behind the drinking toggle. Decks draw without repeats for the whole weekend. A card's
title (or question) is how the game remembers it's been drawn, so keep titles unique;
the tests check this.

Fact-check new trivia before it goes on the TV: have a second pass look for wrong answers,
answers with two accepted names, squares that give away another square, and difficulty
that doesn't fit the point value.

## How the code is laid out

```
src/content/   questions, rounds and decks (the only folder most changes touch)
src/game/      rules, state, saving, decks, sounds; no UI
src/buzz/      the WebSocket client for phones and the TV
src/ui/        React screens: screens/ (setup, board, winner, modes), overlays/ (every card), phone/
buzz/          the Cloudflare Worker that relays buzzes between phones and the TV
tests/         content + rules tests (vitest); tests/e2e browser tests (Playwright)
```

The game state is one object (`src/game/state.ts`) that's saved after every change, so a
closed tab resumes. If you add a field, give it a default in `freshState()`; old saves
pick it up from there automatically (`src/game/persistence.ts`).
