# Game Night Showdown

A Jeopardy-style party game built for one specific friend group — no build step, no
backend, no accounts. One HTML file. Open it and play.

Built for a long weekend in a house full of people, which is why it is not only trivia:
a few squares on every board are live-action — challenges, duels and point swings.

## Run it

Double-click `index.html`, or serve it so the TV or an iPad can join over WiFi:

```bash
cd GameNight
python3 -m http.server 8934
# then http://localhost:8934 here,
# or http://<this-machine's-LAN-IP>:8934 from anything else on the network
```

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

**Play** — turn to pick and read rotates automatically, so nobody gets stuck operating
the board all night. Anyone can still shout out the answer.

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

## Editing the content

Everything lives in plain JS objects at the top of `index.html`:

- `ROUNDS` — the boards, categories, questions and Daily Doubles

Adding a category is just adding an entry to `categories` and a matching block in
`questions`. **You do not maintain the wildcard slots** — at load, any square with no
question automatically becomes a wildcard, and a Daily Double that lands on one slides
to the richest real question in its category. Give a category four questions and the
fifth square becomes the surprise on its own. At game start only about one empty square
per three categories stays a wildcard; the rest play as off-category `BONUS_QUESTIONS`.
- `CHALLENGES` — 111 tasks, tagged `physical` / `burn` / `performance` / `speed` / `social` / `room` / `drink`
- `DUELS`, `BONUS_QUESTIONS`, `FINAL_SHOWDOWN`, `LIST_PROMPTS`, `FORFEITS`
- `WILDCARD_EVENTS` — each carries a `weight` that biases the draw

Add `spice: "party"` to hide an item in Family Friendly mode, or `drinks: true` to put
it behind the drinking toggle. Set `who` to `"room"` for a challenge the whole party plays
at once — 39 of the 111 are whole-room or whole-team, which are the ones that actually get
people laughing. Decks draw without
repeats until exhausted, so you won't get the same dare twice in a night.
