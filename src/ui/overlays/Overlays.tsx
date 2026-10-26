import { useEffect, useState } from 'react';
import { buzzPop, buzzSend, buzzStore, resolveBuzzTeam } from '../../buzz/client';
import { CLUE_SECONDS } from '../../buzz/protocol';
import { roomLinks } from '../../buzz/room';
import * as act from '../../game/actions';
import { spiceOk, WILDCARD_EVENTS, type WildcardEvent } from '../../game/decks';
import { teamById } from '../../game/rules';
import { playWildcardReveal, playWildcardSpin, playWrong } from '../../game/sound';
import type { Team } from '../../game/state';
import { getState, useGame } from '../../game/store';
import { AnswerClock, Card, copyLink, TeamButton, TeamButtons, Timer, useOnDeadline } from '../common';
import { flashToast, overlayStore, type Overlay } from '../uiStore';

type Of<K extends Overlay['kind']> = Extract<Overlay, { kind: K }>;

export function Overlays() {
  const o = overlayStore.use();
  if (!o) return null;
  switch (o.kind) {
    case 'question': return <QuestionCard key={o.cat + o.val} o={o} />;
    case 'dailyDouble': return <DailyDoubleCard o={o} />;
    case 'wildcard': return <WildcardCard key={o.cat + o.val} o={o} />;
    case 'challenge': return <ChallengeCard key={o.ch.t} o={o} />;
    case 'duel': return <DuelCard o={o} />;
    case 'instant': return (
      <Card>
        <div className="tag wild">{o.label}</div>
        <div className="wild-desc">{o.text}</div>
        <button className="btn-primary" onClick={() => act.finish(o.done)}>Continue</button>
      </Card>
    );
    case 'scoreEditor': return <ScoreEditor />;
    case 'sideQuest': return <SideQuest />;
    case 'final': return <FinalShowdown o={o} />;
    case 'dualScreen': return <DualScreenCard />;
  }
}

/* ---------- Trivia question ---------- */
function QuestionCard({ o }: { o: Of<'question'> }) {
  const { cat, val, item, hint, split } = o;
  const s = useGame();
  const buzz = buzzStore.use();
  const [localReveal, setLocalReveal] = useState(false);
  const [steal, setSteal] = useState(false);
  const remoteReveal = !!(buzz.prompt?.revealed && buzz.prompt.cat === cat && buzz.prompt.val === val);
  const revealed = localReveal || remoteReveal;
  const lead = buzz.queue[0];
  const leadTeam = resolveBuzzTeam(lead, s.teams);
  // The clue gets its full time from when it opened; a buzz-in can add time on
  // the room's clock. Showing the answer stops it so scoring isn't rushed.
  const [openedBy] = useState(() => Date.now() + CLUE_SECONDS * 1000);
  const onThisClue = buzz.prompt?.cat === cat && buzz.prompt.val === val;
  const deadline = revealed ? null : Math.max(openedBy, (split && onThisClue && buzz.answerBy) || 0);
  const total = deadline === openedBy ? CLUE_SECONDS : buzz.answerTotal;
  useOnDeadline(deadline, () => act.nobodySquare(cat, val, true));

  return (
    <Card>
      <div className="tag">{cat} — {val} pts</div>
      {hint && <div className="who-line">{hint}</div>}
      <div className="qtext">{item.q}</div>
      <AnswerClock deadline={deadline} total={total} ticks />
      {split && <BuzzPanel cat={cat} val={val} />}
      {revealed ? (
        <div>
          <div className="atext">{item.a}</div>
          {lead && leadTeam && !steal && (
            <button className="btn-primary btn-full" style={{ marginBottom: 10 }} onClick={() => act.awardSquare(leadTeam.id, cat, val)}>
              ✓ {lead.name} / {leadTeam.name} (+{val})
            </button>
          )}
          <div>{steal ? 'Steal — who got it?' : 'Who got it?'}</div>
          <TeamButtons teams={s.teams} prefix="award" onPick={t => act.awardSquare(t.id, cat, val)} />
          {!steal && <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => setSteal(true)}>Open steals</button>}
          <button className="btn-secondary none-btn" id="noneBtn" onClick={() => act.nobodySquare(cat, val)}>Nobody</button>
        </div>
      ) : split ? (
        <>
          <button className="btn-secondary" id="revealBtn" onClick={() => { buzzSend({ type: 'revealAnswer' }); setLocalReveal(true); }}>Show Answer on TV</button>
          <div className="hint">Answer is on the host phone</div>
        </>
      ) : (
        <button className="btn-primary" id="revealBtn" onClick={() => setLocalReveal(true)}>Reveal Answer</button>
      )}
    </Card>
  );
}

/** Who buzzed in, on the TV. */
function BuzzPanel({ cat, val }: { cat: string; val: number }) {
  const s = useGame();
  const buzz = buzzStore.use();
  const lead = buzz.queue[0];
  if (!buzz.armed && !lead) return <div className="buzz-panel"><div className="buzz-meta">Buzzers on ({buzz.players.length})</div></div>;
  if (!lead) return <div className="buzz-panel"><div className="buzz-meta">Listening… {buzz.players.length}</div></div>;
  const team = resolveBuzzTeam(lead, s.teams);
  const rest = buzz.queue.slice(1).map(q => q.name).join(', ');
  return (
    <div className="buzz-panel">
      <div className="buzz-meta">Buzzed in</div>
      <div className="buzz-lead">{lead.name}{lead.teamName ? ' · ' + lead.teamName : ''}</div>
      <div className="row-gap judge-row">
        <button className="btn-primary" onClick={() => {
          const t = resolveBuzzTeam(buzzStore.get().queue[0], getState().teams) || team;
          if (!t) { flashToast('Pick their team after showing the answer'); return; }
          act.awardSquare(t.id, cat, val);
        }}>Correct{team ? ` (+${val})` : ''}</button>
        <button className="btn-secondary" onClick={() => { playWrong(); buzzPop(); }}>Wrong</button>
      </div>
      {rest && <div className="buzz-queue">Next: {rest}</div>}
    </div>
  );
}

/* ---------- Daily Double ---------- */
function DailyDoubleCard({ o }: { o: Of<'dailyDouble'> }) {
  const s = useGame();
  const reader = teamById(s, o.teamId)!;
  const [maxWager] = useState(() => Math.max(reader.score, 500));
  const [input, setInput] = useState(() => String(Math.min(reader.score || 200, 500) || 200));
  const [wager, setWager] = useState<number | null>(null);
  const [answerBy, setAnswerBy] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  // Time running out on a Daily Double costs the wager, same as a wrong answer.
  const deadline = revealed ? null : answerBy;
  useOnDeadline(deadline, () => wager !== null && act.settleDailyDouble(o.teamId, wager, false, o.cat, o.val, true));

  if (wager === null) {
    return (
      <Card>
        <div className="tag dd">🎯 DAILY DOUBLE! 🎯</div>
        <div className="catval">{o.cat}</div>
        <div className="wild-desc"><strong>{reader.name}</strong> — wager, then answer.</div>
        <div style={{ margin: '16px 0' }}>
          <input type="number" min={0} max={maxWager} value={input} onChange={e => setInput(e.target.value)}
            style={{ width: 140, padding: 10, borderRadius: 8, border: 'none', fontSize: 16, textAlign: 'center' }} />
        </div>
        <div className="row-gap">
          {[100, 300, 500].map(w => <button key={w} className="btn-secondary" onClick={() => setInput(String(w))}>{w}</button>)}
          <button className="btn-secondary" onClick={() => setInput(String(Math.max(reader.score, 100)))}>ALL IN</button>
        </div>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => {
          let w = parseInt(input, 10);
          if (isNaN(w) || w < 0) w = 0;
          setWager(Math.min(w, maxWager));
          setAnswerBy(Date.now() + CLUE_SECONDS * 1000);
        }}>Lock In Wager</button>
      </Card>
    );
  }
  return (
    <Card>
      <div className="tag dd">🎯 DAILY DOUBLE — {wager} PTS 🎯</div>
      <div className="qtext">{o.item.q}</div>
      <AnswerClock deadline={deadline} total={CLUE_SECONDS} ticks />
      {!revealed ? (
        <button className="btn-primary" id="revealDDBtn" onClick={() => setRevealed(true)}>Reveal Answer</button>
      ) : (
        <div>
          <div className="atext">{o.item.a}</div>
          <div className="row-gap">
            <button className="btn-primary" onClick={() => act.settleDailyDouble(o.teamId, wager, true, o.cat, o.val)}>Got It Right (+{wager})</button>
            <button className="btn-secondary" onClick={() => act.settleDailyDouble(o.teamId, wager, false, o.cat, o.val)}>Got It Wrong (−{wager})</button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------- Wildcard: spin, reveal, then hand off to the event ---------- */
function WildcardCard({ o }: { o: Of<'wildcard'> }) {
  const team = teamById(useGame(), o.teamId)!;
  const [spin, setSpin] = useState(0);
  const [event, setEvent] = useState<WildcardEvent | null>(null);

  useEffect(() => {
    playWildcardSpin();
    const tick = setInterval(() => setSpin(i => i + 1), 110);
    // Beat of anticipation on the reveal before the event takes over.
    const done = setTimeout(() => {
      clearInterval(tick);
      setEvent(act.pickWildcardEvent());
      playWildcardReveal();
    }, 1500);
    return () => { clearInterval(tick); clearTimeout(done); };
  }, []);

  if (!event) {
    const pool = WILDCARD_EVENTS.filter(e => spiceOk(getState(), e));
    return (
      <Card>
        <div className="tag wild">★ WILDCARD ★</div>
        <div className="who-line"><strong>{team.name}</strong></div>
        <div className="wild-desc"><span className="spin-text">{spin ? pool[(spin - 1) % pool.length].label : 'Spinning...'}</span></div>
      </Card>
    );
  }
  return (
    <Card>
      <div className="tag wild">{event.label}</div>
      {event.blurb && <div className="wild-desc">{event.blurb}</div>}
      <button className="btn-primary" id="wildGoBtn" onClick={() => act.runWildcardEvent(event, o.cat, o.val, o.teamId)}>Go</button>
    </Card>
  );
}

/* ---------- Live challenge ---------- */
function whoLabel(who: string, team: Team) {
  if (who === 'room') return "Everyone — winner's team scores.";
  if (who === 'team') return `${team.name} — whole team.`;
  return `${team.name} — one person.`;
}

function ChallengeCard({ o }: { o: Of<'challenge'> }) {
  const s = useGame();
  const { ch, val, done } = o;
  const team = teamById(s, o.teamId)!;
  return (
    <Card>
      <div className="tag wild">{ch.type === 'drink' ? '🍺' : '🔥'} {ch.t}</div>
      <div className="who-line">{whoLabel(ch.who, team)}</div>
      <div className="qtext task">{ch.d}</div>
      {ch.drinks && o.forfeit && (
        <div className="forfeit-box">
          <div className="forfeit-label">Or forfeit</div>
          <div className="forfeit-text">{o.forfeit}</div>
          <button className="btn-secondary forfeit-reroll" onClick={act.rerollForfeit}>🎲 Different One</button>
        </div>
      )}
      {ch.timer > 0 && <Timer seconds={ch.timer} />}
      {ch.who === 'room' ? (
        <>
          <div className="who-line" style={{ marginTop: 16 }}>Who won? (+{val})</div>
          <TeamButtons teams={s.teams} prefix="chalaward" onPick={t => act.payChallenge(t.id, val, done)} />
          <button className="btn-secondary none-btn" id="chalNoneBtn" onClick={() => act.noPoints(done)}>Nobody — no points</button>
        </>
      ) : (
        <div className="row-gap judge-row">
          <button className="btn-primary" onClick={() => act.payChallenge(team.id, val, done)}>{team.name} beat it (+{val})</button>
          <button className="btn-secondary" id="chalNoneBtn" onClick={() => act.noPoints(done)}>They choked — nothing</button>
        </div>
      )}
    </Card>
  );
}

/* ---------- Duel ---------- */
function DuelCard({ o }: { o: Of<'duel'> }) {
  const s = useGame();
  const team = teamById(s, o.teamId)!;
  const [rivalId, setRivalId] = useState<number | null>(null);
  const [duel, setDuel] = useState<ReturnType<typeof act.drawDuel> | null>(null);
  const rival = teamById(s, rivalId);

  if (!rival || !duel) {
    return (
      <Card>
        <div className="tag wild">⚔️ DUEL</div>
        <div className="who-line">{team.name} — call out your challenger.</div>
        <div className="team-btn-grid">
          {s.teams.filter(t => t.id !== team.id).map(t => (
            <TeamButton key={t.id} team={t} onClick={() => { setRivalId(t.id); setDuel(act.drawDuel()); }} />
          ))}
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <div className="tag wild">⚔️ {duel.t}</div>
      <div className="who-line">{team.name} vs {rival.name} — winner takes {o.val}, loser drops {Math.round(o.val / 2)}.</div>
      <div className="qtext task">{duel.d}</div>
      {duel.timer && <Timer seconds={duel.timer} />}
      <div className="who-line" style={{ marginTop: 14 }}>Who won?</div>
      <div className="team-btn-grid">
        <TeamButton team={team} onClick={() => act.settleDuel(team.id, rival.id, o.val, o.done)} />
        <TeamButton team={rival} onClick={() => act.settleDuel(rival.id, team.id, o.val, o.done)} />
      </div>
      <button className="btn-secondary none-btn" onClick={() => act.noPoints(o.done)}>Called It a Draw</button>
    </Card>
  );
}

/* ---------- Score editor: for when real life overrules the app ---------- */
function ScoreEditor() {
  const s = useGame();
  return (
    <Card>
      <div className="tag">Adjust Scores</div>
      <div className="who-line">Adjust scores</div>
      {s.teams.map(t => (
        <div className="edit-row" key={t.id}>
          <span className="edit-name">{t.name}</span>
          <button className="btn-secondary edit-btn" onClick={() => act.adjustScore(t.id, -100)}>−100</button>
          <span className="edit-score">{t.score}</span>
          <button className="btn-secondary edit-btn" onClick={() => act.adjustScore(t.id, 100)}>+100</button>
        </div>
      ))}
      <button className="btn-primary btn-full" style={{ marginTop: 16 }} onClick={act.closeOverlay}>Done</button>
    </Card>
  );
}

/* ---------- Side quest: pull a challenge out of thin air, any time ---------- */
function SideQuest() {
  const s = useGame();
  return (
    <Card>
      <div className="tag wild">🎯 SIDE QUEST</div>
      <div className="who-line">Worth 200. Who's taking it?</div>
      <TeamButtons teams={s.teams} prefix="sq" onPick={t => act.startSideQuest(t.id)} />
      <button className="btn-secondary none-btn" onClick={act.closeOverlay}>Never Mind</button>
    </Card>
  );
}

/* ---------- Final Showdown: category revealed, blind wagers, one question ---------- */
function FinalShowdown({ o }: { o: Of<'final'> }) {
  const s = useGame();
  const { item } = o;
  // Only teams with points wager, unless nobody has any.
  const [players] = useState(() => {
    const eligible = s.teams.filter(t => t.score > 0);
    return (eligible.length ? eligible : s.teams).map(t => t.id);
  });
  const [wagers, setWagers] = useState<Record<number, number>>({});
  const [input, setInput] = useState<string | null>(null);
  const [step, setStep] = useState<'wager' | 'question' | 'judge'>('wager');
  const [verdict, setVerdict] = useState<Record<number, boolean>>({});

  if (step === 'wager') {
    const idx = Object.keys(wagers).length;
    const t = teamById(s, players[idx])!;
    const max = Math.max(t.score, 0);
    const value = input ?? String(Math.min(500, max));
    return (
      <Card>
        <div className="tag dd">🏁 THE FINAL SHOWDOWN 🏁</div>
        <div className="catval">Category: {item.cat}</div>
        <div className="who-line"><strong>{t.name}</strong> — wager 0 to {max}</div>
        <div style={{ margin: '16px 0' }}>
          <input type="number" min={0} max={max} value={value} onChange={e => setInput(e.target.value)}
            style={{ width: 160, padding: 12, borderRadius: 8, border: 'none', fontSize: 16, textAlign: 'center' }} />
        </div>
        <div className="row-gap">
          <button className="btn-secondary" onClick={() => setInput('0')}>Nothing</button>
          <button className="btn-secondary" onClick={() => setInput(String(Math.floor(max / 2)))}>Half</button>
          <button className="btn-secondary" onClick={() => setInput(String(max))}>EVERYTHING</button>
        </div>
        <button className="btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => {
          let w = parseInt(value, 10);
          if (isNaN(w) || w < 0) w = 0;
          const next = { ...wagers, [t.id]: Math.min(w, max) };
          setWagers(next);
          setInput(null);
          if (Object.keys(next).length >= players.length) setStep('question');
        }}>Lock It In</button>
        <div className="hint" style={{ marginTop: 8 }}>{idx + 1} of {players.length}</div>
      </Card>
    );
  }

  if (step === 'question') {
    return (
      <Card>
        <div className="tag dd">🏁 {item.cat} 🏁</div>
        <div className="qtext">{item.q}</div>
        <div className="who-line">Write answers down. Reveal when ready.</div>
        <Timer seconds={60} />
        <button className="btn-primary btn-full" id="revealF" style={{ marginTop: 14 }} onClick={() => setStep('judge')}>Reveal the Answer</button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="tag dd">🏁 THE ANSWER 🏁</div>
      <div className="atext">{item.a}</div>
      <div className="who-line">Tap teams that got it.</div>
      {players.map(id => {
        const t = teamById(s, id)!;
        return (
          <div className="edit-row" key={id}>
            <span className="edit-name">{t.name}</span>
            <span className="edit-score">{verdict[id] ? '+' : '−'}{wagers[id]}</span>
            <button className={`btn-secondary edit-btn ${verdict[id] ? 'awarded' : ''}`} onClick={() => setVerdict({ ...verdict, [id]: !verdict[id] })}>
              {verdict[id] ? 'Correct ✓' : 'Wrong ✗'}
            </button>
          </div>
        );
      })}
      <button className="btn-primary btn-full" style={{ marginTop: 16 }}
        onClick={() => act.settleFinal(players.map(id => ({ teamId: id, wager: wagers[id] || 0, right: !!verdict[id] })))}>Settle Up</button>
    </Card>
  );
}

/* ---------- Dual screen links ---------- */
function DualScreenCard() {
  const buzz = buzzStore.use();
  const links = roomLinks(buzz.code);
  return (
    <Card>
      <div className="tag">📺 Dual Screen</div>
      <div className="buzz-code">{buzz.code}</div>
      <div className="who-line"><strong>Host phone (answers)</strong></div>
      <div className="buzz-join-url">{links.host}</div>
      <div className="who-line" style={{ marginTop: 12 }}><strong>Players (buzz in)</strong></div>
      <div className="buzz-join-url">{links.join}</div>
      <div className="who-line">{buzz.players.length} player{buzz.players.length === 1 ? '' : 's'} connected</div>
      <div className="hint" style={{ marginTop: 10 }}>TV = questions. Host phone = answers + scoring.</div>
      <button className="btn-primary btn-full" style={{ marginTop: 14 }} onClick={() => copyLink(links.host, 'Host link', flashToast)}>Copy Host Link</button>
      <button className="btn-secondary btn-full" onClick={() => copyLink(links.join, 'Player link', flashToast)}>Copy Player Link</button>
      <button className="btn-secondary btn-full" onClick={act.closeOverlay}>Done</button>
    </Card>
  );
}
