import { useEffect, useRef, useState, type ReactNode } from 'react';
import { loadWeekend } from '../game/persistence';
import { playBuzzer, playTick } from '../game/sound';
import type { Team } from '../game/state';
import { scorePopStore, toastStore } from './uiStore';

/** The full-screen card everything interactive opens in. */
export function Card({ children }: { children: ReactNode }) {
  return <div id="overlay"><div className="card">{children}</div></div>;
}

// The overlay covers the scoreboard, so any button that asks you to choose a
// team has to carry that team's score with it; otherwise you're picking blind.
export function TeamButton({ team, onClick, prefix, disabled }: { team: Team; onClick: () => void; prefix?: string; disabled?: boolean }) {
  return (
    <button className="team-btn" data-prefix={prefix} disabled={disabled} onClick={onClick}
      style={{ borderColor: team.color, borderLeftColor: team.color }}>
      {team.name}<span className="btn-score">{team.score}</span>
    </button>
  );
}

export function TeamButtons({ teams, onPick, prefix }: { teams: Team[]; onPick: (t: Team) => void; prefix: string }) {
  // One tap per card: a double-tap must not pay twice.
  const locked = useRef(false);
  return (
    <div className="team-btn-grid">
      {teams.map(t => (
        <TeamButton key={t.id} team={t} prefix={prefix} onClick={() => {
          if (locked.current) return;
          locked.current = true;
          onPick(t);
        }} />
      ))}
    </div>
  );
}

/** Countdown. Living rooms forget to tap Start, so it starts itself after a beat. */
export function Timer({ seconds }: { seconds: number }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setTimeout(() => setRunning(true), 1600);
    return () => clearTimeout(t);
  }, []);
  const finished = left <= 0;
  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(id);
  }, [running, finished]);
  useEffect(() => {
    if (!running) return;
    if (left <= 5 && left > 0) playTick();
    if (left === 0) playBuzzer();
  }, [running, left]);
  return (
    <div className="timer-wrap">
      <div className={`timer-num ${running && left <= 5 && left > 0 ? 'urgent' : ''} ${finished ? 'done' : ''}`}>
        {finished ? 'TIME' : left}
      </div>
      <div className="timer-track"><div className="timer-fill" style={{ width: `${(Math.max(0, left) / seconds) * 100}%` }} /></div>
      {!running && <button className="btn-secondary timer-btn" onClick={() => setRunning(true)}>▶ Start the Clock</button>}
    </div>
  );
}

export function Toast() {
  const t = toastStore.use();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!t) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(id);
  }, [t]);
  return <div id="toast" className={show ? 'show' : ''}>{t?.msg}</div>;
}

export function ScorePop() {
  const p = scorePopStore.use();
  // Keyed on the pop's counter so the CSS animation replays every time.
  if (!p) return <div id="scorePop" />;
  return <div id="scorePop" key={p.n} className={'show ' + (p.delta > 0 ? 'gain' : 'loss')}>{(p.delta > 0 ? '+' : '') + p.delta}</div>;
}

const CONFETTI_COLORS = ['#f5c518', '#2ecc71', '#e74c3c', '#3498db', '#8e44ad'];

export function Confetti() {
  const [pieces] = useState(() => Array.from({ length: 80 }, (_, i) => ({
    i,
    left: Math.random() * 100 + 'vw',
    background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    animationDuration: 2 + Math.random() * 2 + 's',
    animationDelay: Math.random() * 1.5 + 's',
  })));
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setTimeout(() => setOn(false), 5000); return () => clearTimeout(t); }, []);
  return (
    <div id="confettiWrap">
      {on && pieces.map(({ i, ...style }) => <div key={i} className="confetti" style={style} />)}
    </div>
  );
}

export function WeekendStandings({ version = 0 }: { version?: number }) {
  void version; // bump to re-read after banking a game
  const w = loadWeekend();
  const rows = Object.entries(w.totals).map(([name, t]) => ({ name, ...t })).sort((a, b) => b.points - a.points);
  if (!rows.length) return null;
  return (
    <div className="weekend-box">
      <div className="weekend-title">🏅 Weekend Standings — {w.games.length} game{w.games.length === 1 ? '' : 's'} banked</div>
      {rows.map((r, i) => (
        <div className="superlative-row" key={r.name}>
          <span className="label">{i === 0 ? '👑 ' : i + 1 + '. '}{r.name}</span>
          <span className="winner">{r.points} pts <span style={{ opacity: 0.6, fontWeight: 400 }}>({r.wins} win{r.wins === 1 ? '' : 's'} / {r.games})</span></span>
        </div>
      ))}
    </div>
  );
}

export async function copyLink(url: string, label: string, toast: (m: string) => void) {
  try { await navigator.clipboard.writeText(url); toast(label + ' copied'); }
  catch { toast(url); }
}
