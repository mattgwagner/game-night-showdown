import { useLayoutEffect, useRef } from 'react';
import { currentReader } from '../game/rules';
import { useGame } from '../game/store';

export function Scoreboard() {
  const s = useGame();
  const ref = useRef<HTMLDivElement>(null);
  const hidden = s.screen === 'setup' || s.teams.length === 0;

  // Publish the strip's height so the board never sits under it on AirPlay.
  useLayoutEffect(() => {
    const el = ref.current;
    const set = () => document.documentElement.style.setProperty('--sb-h', (el && !hidden ? el.getBoundingClientRect().height : 0) + 'px');
    set();
    if (!el || hidden) return;
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hidden]);

  if (hidden) return <div id="scoreboard" ref={ref} style={{ display: 'none' }} />;
  const maxScore = Math.max(...s.teams.map(t => t.score));
  const picker = s.screen === 'board' && !s.boardIntro ? currentReader(s) : null;
  return (
    <div id="scoreboard" ref={ref} style={{ display: 'flex' }}>
      {s.teams.map(t => (
        <div key={t.id}
          className={`score-chip ${t.score === maxScore && maxScore > 0 ? 'leader' : ''} ${picker?.id === t.id ? 'picking' : ''}`}
          style={{ borderColor: t.color, borderLeftColor: t.color }}>
          <div className="name">{t.name}</div>
          <div className="pts">{t.score}</div>
          {picker?.id === t.id && <div className="picks">picks next</div>}
          {t.currentStreak >= 2 && <div className="streak">🔥 {t.currentStreak} streak</div>}
        </div>
      ))}
    </div>
  );
}
