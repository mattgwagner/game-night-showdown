import { useEffect } from 'react';
import { ROUNDS } from '../../content';
import { shuffle, startMode, startRound } from '../../game/rules';
import { update, useGame } from '../../game/store';
import { WeekendStandings } from '../common';

const SIZES = [[4, 'Quick', '~20 min'], [6, 'Standard', '~35 min'], [8, 'Marathon', '~50 min']] as const;

/* The non-Jeopardy formats */
const MODES = [
  { key: 'lightning', name: 'Lightning Round', tagline: 'Sixty seconds per team. Rapid fire. Pass costs you nothing but the clock.', icon: '⚡' },
  { key: 'standing', name: 'Last Team Standing', tagline: "One question each, around the room. Miss it and you're out. Survive alone and take 1000.", icon: '🎯' },
  { key: 'potato', name: 'Hot Potato', tagline: "One category, teams alternate naming things. Stall or repeat and you're eliminated.", icon: '🥔' },
] as const;

export function RoundSelect() {
  const s = useGame();
  // Rounds list in a fresh order every session; a new round file reshuffles it.
  const stale = !s.roundOrder || s.roundOrder.length !== ROUNDS.length || s.roundOrder.some(id => !ROUNDS.some(r => r.id === id));
  useEffect(() => {
    if (stale) update(d => { d.roundOrder = shuffle(ROUNDS.map(r => r.id)); });
  }, [stale]);
  const order = stale ? [] : s.roundOrder!;

  return (
    <>
      <h1 className="title">🏆 Game Night Showdown 🏆</h1>
      <div className="subtitle">Pick tonight's board — {s.spice === 'party' ? '🌙 After Dark' : '☀️ Family Friendly'}{s.drinks ? ' · 🍺 Drinking games on' : ''}</div>
      <div className="panel" style={{ maxWidth: 700 }}>
        <h2>Board Size</h2>
        <div className="size-row">
          {SIZES.map(([n, label, time]) => (
            <button key={n} className={`spice-opt ${(s.boardSize || 4) === n ? 'on' : ''}`} onClick={() => update(d => { d.boardSize = n; })}>
              <span className="st-name">{label}</span>
              <span className="st-desc">{n} categories · {time}</span>
            </button>
          ))}
        </div>

        <h2 style={{ marginTop: 24 }}>Game Modes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MODES.map(m => (
            <button key={m.key} className="btn-secondary mode-btn" onClick={() => update(d => startMode(d, m.key))}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--gold)' }}>{m.icon} {m.name}</div>
              <div style={{ opacity: 0.75, fontSize: '.88rem', marginTop: 4 }}>{m.tagline}</div>
            </button>
          ))}
        </div>

        <h2 style={{ marginTop: 24 }}>Rounds</h2>
        <button className="btn-primary btn-full" style={{ marginBottom: 12 }}
          onClick={() => update(d => startRound(d, ROUNDS[Math.floor(Math.random() * ROUNDS.length)].id))}>🎲 Random Round</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {order.map(id => {
            const r = ROUNDS.find(x => x.id === id)!;
            return (
              <button key={id} className="btn-secondary" style={{ textAlign: 'left', padding: '16px 18px' }} onClick={() => update(d => startRound(d, id))}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--gold)' }}>
                  {r.name}{r.kind === 'gauntlet' && <span className="gauntlet-badge">NO TRIVIA</span>}
                </div>
                <div style={{ opacity: 0.75, fontSize: '.9rem', marginTop: 4 }}>{r.tagline}</div>
              </button>
            );
          })}
        </div>
        <button className="btn-secondary btn-full" style={{ marginTop: 14 }} onClick={() => update(d => { d.screen = 'setup'; })}>← Back to Players</button>
      </div>
      <WeekendStandings />
    </>
  );
}
