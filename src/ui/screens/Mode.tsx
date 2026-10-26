import { useEffect, useState } from 'react';
import { drawFrom } from '../../game/decks';
import { aliveTeams, exitMode, payKnockoutWinner, scoreEvent, startMode, teamById } from '../../game/rules';
import { playBuzzer, playCorrect, playFanfare, playTick, playWrong } from '../../game/sound';
import type { ModeState } from '../../game/state';
import { getState, update, useGame } from '../../game/store';
import { flashScorePop } from '../uiStore';

const quit = () => update(exitMode);

/** Edit the running mode's state. */
function edit<K extends ModeState['kind']>(kind: K, f: (ms: Extract<ModeState, { kind: K }>, d: ReturnType<typeof getState>) => void) {
  update(d => { if (d.modeState?.kind === kind) f(d.modeState as Extract<ModeState, { kind: K }>, d); });
}

export function Mode() {
  const s = useGame();
  const ms = s.modeState;
  useEffect(() => { if (!ms) quit(); }, [ms]);
  if (!ms) return null;
  if (ms.kind === 'lightning') return <Lightning />;
  if (ms.kind === 'standing') return <Standing />;
  return <Potato />;
}

/* ---------- Lightning Round ---------- */
function Lightning() {
  const s = useGame();
  const ms = s.modeState as Extract<ModeState, { kind: 'lightning' }>;
  const team = teamById(s, ms.order[ms.idx]);

  if (ms.phase === 'done' || !team) {
    const rows = ms.order.map(id => ({ t: teamById(s, id), n: ms.correct[id] || 0 })).filter(r => r.t).sort((a, b) => b.n - a.n);
    return (
      <>
        <h1 className="title">⚡ Lightning Round ⚡</h1>
        <div className="panel" style={{ textAlign: 'center' }}>
          <h2>Final Tally</h2>
          {rows.map((r, i) => (
            <div className="team-entry" style={{ marginBottom: 6 }} key={r.t!.id}>
              <span>{i === 0 ? '🏆 ' : ''}{r.t!.name}</span>
              <span style={{ fontWeight: 900, color: 'var(--gold)' }}>{r.n} correct · +{r.n * 100}</span>
            </div>
          ))}
          <button className="btn-primary btn-full" style={{ marginTop: 16 }} onClick={quit}>Back to the Board</button>
        </div>
      </>
    );
  }

  if (ms.phase === 'ready') {
    return (
      <>
        <h1 className="title">⚡ Lightning Round ⚡</h1>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="who-line">Team {ms.idx + 1} of {ms.order.length}</div>
          <div className="winner-name">{team.name}</div>
          <div className="who-line">60 seconds · 100 pts each · pass freely</div>
          <button className="btn-primary btn-full" onClick={() => edit('lightning', (m, d) => {
            m.phase = 'playing';
            m.deadline = Date.now() + 60000;
            m.q = drawFrom(d, 'bonus');
          })}>Start</button>
          <button className="btn-secondary btn-full" onClick={quit}>Quit</button>
        </div>
      </>
    );
  }
  return <LightningClock key={team.id + ':' + ms.deadline} />;
}

function LightningClock() {
  const s = useGame();
  const ms = s.modeState as Extract<ModeState, { kind: 'lightning' }>;
  const team = teamById(s, ms.order[ms.idx])!;
  const remaining = () => Math.max(0, Math.ceil((ms.deadline - Date.now()) / 1000));
  const [left, setLeft] = useState(remaining);

  useEffect(() => {
    const id = setInterval(() => {
      const rem = remaining();
      setLeft(rem);
      if (rem <= 5 && rem > 0) playTick();
      if (rem <= 0) {
        clearInterval(id);
        playBuzzer();
        let got = 0;
        edit('lightning', (m, d) => {
          got = m.correct[team.id] || 0;
          if (got > 0) scoreEvent(d, team.id, got * 100, { isAnswer: true });
          m.idx++;
          m.phase = m.idx >= m.order.length ? 'done' : 'ready';
        });
        flashScorePop(got * 100);
      }
    }, 250);
    return () => clearInterval(id);
  }, []); // keyed on the deadline by the parent, so this clock never restarts

  const next = (scored: boolean) => {
    if (scored) playCorrect();
    edit('lightning', (m, d) => {
      if (scored) m.correct[team.id] = (m.correct[team.id] || 0) + 1;
      m.q = drawFrom(d, 'bonus');
    });
  };

  return (
    <>
      <h1 className="title" style={{ marginBottom: 0 }}>⚡ {team.name} ⚡</h1>
      <div className="panel" style={{ textAlign: 'center' }}>
        <div className={`timer-num ${left <= 5 ? 'urgent' : ''}`}>{left}</div>
        <div className="timer-track"><div className="timer-fill" style={{ width: `${(left / 60) * 100}%` }} /></div>
        <div className="lightning-count">{ms.correct[team.id] || 0} correct</div>
        <div className="qtext">{ms.q?.q}</div>
        <div className="atext" style={{ opacity: 0.55, fontSize: '1rem' }}>{ms.q?.a}</div>
        <div className="row-gap judge-row">
          <button className="btn-primary" onClick={() => next(true)}>✓ Got It</button>
          <button className="btn-secondary" onClick={() => next(false)}>Pass</button>
        </div>
      </div>
    </>
  );
}

/** Knockout modes pay the last one standing 1000 the moment they're alone. */
function knockOut(kind: 'standing' | 'potato', teamId: number, extra?: (d: ReturnType<typeof getState>) => void) {
  let paid: number | null = null;
  update(d => {
    const m = d.modeState;
    if (!m || m.kind !== kind) return;
    m.alive = m.alive.filter(id => id !== teamId);
    if (m.idx >= m.alive.length) m.idx = 0;
    extra?.(d);
    paid = payKnockoutWinner(d);
  });
  if (paid != null) { flashScorePop(1000); playFanfare(); }
}

/* ---------- Last Team Standing ---------- */
function Standing() {
  const s = useGame();
  const ms = s.modeState as Extract<ModeState, { kind: 'standing' }>;
  const alive = aliveTeams(s, ms.alive);

  if (alive.length <= 1) {
    const winner = alive[0];
    return (
      <>
        <h1 className="title">🎯 Last Team Standing 🎯</h1>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="medal">🏆</div>
          <div className="winner-name">{winner ? winner.name : 'Nobody'}</div>
          <div className="who-line">{winner ? 'Survived the whole room. +1000.' : 'Everybody went out. Nobody gets paid.'}</div>
          <button className="btn-primary btn-full" onClick={quit}>Back to the Board</button>
        </div>
      </>
    );
  }

  const team = teamById(s, ms.alive[ms.idx >= ms.alive.length ? 0 : ms.idx])!;
  return (
    <>
      <h1 className="title">🎯 Last Team Standing 🎯</h1>
      <div className="panel" style={{ textAlign: 'center' }}>
        <div className="who-line">{alive.length} team{alive.length === 1 ? '' : 's'} still alive{ms.out.length ? ' · out: ' + ms.out.join(', ') : ''}</div>
        <div className="winner-name" style={{ fontSize: '1.6rem' }}>{team.name}</div>
        <div className="qtext">{ms.q.q}</div>
        {ms.phase === 'reveal' ? (
          <>
            <div className="atext">{ms.q.a}</div>
            <div className="row-gap judge-row">
              <button className="btn-primary" onClick={() => {
                playCorrect();
                edit('standing', (m, d) => { m.idx++; if (m.idx >= m.alive.length) m.idx = 0; m.phase = 'question'; m.q = drawFrom(d, 'bonus'); });
              }}>Survived</button>
              <button className="btn-secondary" onClick={() => {
                playWrong();
                knockOut('standing', team.id, d => {
                  const m = d.modeState as Extract<ModeState, { kind: 'standing' }>;
                  m.out.push(team.name);
                  m.phase = 'question';
                  m.q = drawFrom(d, 'bonus');
                });
              }}>Eliminated</button>
            </div>
          </>
        ) : (
          <button className="btn-primary btn-full" id="sReveal" onClick={() => edit('standing', m => { m.phase = 'reveal'; })}>Reveal Answer</button>
        )}
        <button className="btn-secondary btn-full" style={{ marginTop: 10 }} onClick={quit}>Quit This Mode</button>
      </div>
    </>
  );
}

/* ---------- Hot Potato ---------- */
function Potato() {
  const s = useGame();
  const ms = s.modeState as Extract<ModeState, { kind: 'potato' }>;
  const alive = aliveTeams(s, ms.alive);

  if (alive.length <= 1) {
    const winner = alive[0];
    return (
      <>
        <h1 className="title">🥔 Hot Potato 🥔</h1>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="medal">🏆</div>
          <div className="winner-name">{winner ? winner.name : 'Nobody'}</div>
          <div className="who-line">{ms.said} answers deep on <strong>{ms.prompt}</strong>{winner ? ' — and they were the last one standing. +1000.' : '.'}</div>
          <button className="btn-primary btn-full" onClick={() => update(d => startMode(d, 'potato'))}>Another Category</button>
          <button className="btn-secondary btn-full" onClick={quit}>Back to the Board</button>
        </div>
      </>
    );
  }

  const team = teamById(s, ms.alive[ms.idx >= ms.alive.length ? 0 : ms.idx])!;
  return (
    <>
      <h1 className="title">🥔 Hot Potato 🥔</h1>
      <div className="panel" style={{ textAlign: 'center' }}>
        <div className="who-line">Name something in this category. No repeats. Five seconds of silence and you're out.</div>
        <div className="potato-cat">{ms.prompt}</div>
        <div className="who-line">{ms.said} named so far · {alive.length} teams alive</div>
        <div className="winner-name" style={{ fontSize: '1.7rem' }}>{team.name}</div>
        <div className="row-gap judge-row">
          <button className="btn-primary" onClick={() => {
            playCorrect();
            edit('potato', m => { m.said++; m.idx++; if (m.idx >= m.alive.length) m.idx = 0; });
          }}>✓ Named One</button>
          <button className="btn-secondary" onClick={() => { playWrong(); knockOut('potato', team.id); }}>Stalled — Out</button>
        </div>
        <button className="btn-secondary btn-full" style={{ marginTop: 10 }} onClick={quit}>Quit This Mode</button>
      </div>
    </>
  );
}
