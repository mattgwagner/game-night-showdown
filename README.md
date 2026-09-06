# Game Night Showdown

A Jeopardy-style party game built for one specific friend group — no build step, no
backend, no accounts. One HTML file. Open it and play.

Built for a long weekend in a house full of people, which is why it is not only trivia:
roughly a fifth of every board is live-action — challenges, dares, duels and public votes.

## Run it

Double-click `index.html`, or serve it so the TV or an iPad can join over WiFi:

```bash
cd GameNight
python3 -m http.server 8934
# then http://localhost:8934 here,
# or http://<this-machine's-LAN-IP>:8934 from anything else on the network
```

## How it plays

**Setup** — add 2–10 teams or solo players, then pick a spice level:

- ☀️ **Family Friendly** — kids in the room, grandma on the couch.
- 🌙 **After Dark** — unlocks the dares that involve your camera roll and your text history.

The setting filters every deck in the game, so the same app works at 4pm and at 11pm.

**Pick a board** — fourteen full boards, 8 categories × 5 values each. Thirteen are
trivia, spanning 104 categories: beer, firearms, Disney, AI, college football, grilling,
boats, Labor Day, NBA, golf, soccer, the Olympics, Star Wars, horror, dinosaurs, sharks,
bourbon, presidents, Field Artillery, and a lot more. One board is nothing but formats
that get people shouting — emoji decode, riddles, Before & After, brand slogans, Odd One
Out. And one is different from all of them:

> **Round 9: The Reckoning** — no trivia at all. Forty squares of physical feats,
> performances, speed rounds, duels, group votes, hot seats and dares. Every square
> draws live from the decks, so the board is never the same twice.

**Play** — turn to pick and read rotates automatically, so nobody gets stuck operating
the board all night. Anyone can still shout out the answer.

**Wildcards** — eight unmarked squares per board hijack the game:

| | |
|---|---|
| 🔥 Challenge Accepted | Put the phone down. You're doing something. |
| ⚔️ Duel | Pick an opponent. Only one of you walks away with points. |
| 🗳️ The People's Court | The room votes. The majority gets paid. |
| 🪑 Hot Seat | A question about you — guess how the room answers it. |
| 🏹 Robin Hood | Take points straight off the leader. |
| 🔄 Swap Meet | Trade scores with any team. Choose cruelly. |
| 💸 Everybody Pays | You're exempt. Everyone else isn't. |
| 🛡️ Insurance Policy | A shield that eats your next loss. |
| 🍀 Lucky Break · 🍻 Bar Tab · 📣 Crowd Save · 🎲 Double Down | Point swings and free-for-alls. |

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
fifth square becomes the surprise on its own.
- `CHALLENGES` — tasks, tagged `physical` / `performance` / `speed` / `social` / `room`
- `GROUP_VOTES`, `HOT_SEAT`, `DUELS`, `BONUS_QUESTIONS`, `FINAL_SHOWDOWN`
- `WILDCARD_EVENTS` — each carries a `weight` that biases the draw

Add `spice: "party"` to any item to hide it in Family Friendly mode. Decks draw without
repeats until exhausted, so you won't get the same dare twice in a night.
