# Game Night Showdown

A custom Jeopardy-style trivia game built for one specific friend group — no build step, no backend, just open it in a browser.

## Run it

Double-click `index.html`, or serve it locally so it works on other devices over WiFi (iPad, TV browser, etc.):

```bash
cd GameNight
python3 -m http.server 8934
# then open http://localhost:8934 on this machine,
# or http://<this-machine's-LAN-IP>:8934 from another device on the same network
```

## How it plays

- **Setup**: add 2–10 teams or individual players.
- **Round select**: pick one of several full trivia boards (categories vary by round — beer, firearms, Disney, AI, sports, college football, movies, music, baseball, parenting, Florida living, and more).
- **Board**: an 8-category × 5-value grid, Jeopardy-style. Turn to pick & read rotates automatically after every square, so no single person is stuck operating the board all night — anyone can still shout out the answer.
- **Wildcard squares**: a handful of squares (not visually marked in advance) trigger a random chance event instead of a normal question — bonus points, a point penalty, a steal from the leader, or a free-for-all bonus question.
- **Scoreboard**: always visible at the top, with the current leader highlighted.

All content — categories, questions, answers, wildcard events — lives in plain JS objects near the top of `index.html`. Easy to edit by hand.
