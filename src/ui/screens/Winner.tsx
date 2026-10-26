import { useEffect, useState } from 'react';
import { bankGameToWeekend, clearSavedGame } from '../../game/persistence';
import { computeSuperlatives, currentRound, resetTeamStats, startRound } from '../../game/rules';
import { playFanfare } from '../../game/sound';
import { getState, resetGame, update, useGame } from '../../game/store';
import { Confetti, WeekendStandings } from '../common';

export function Winner() {
  const s = useGame();
  const [banked, setBanked] = useState(false);
  useEffect(() => { playFanfare(); }, []);
  const sorted = [...s.teams].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const awards = computeSuperlatives(s.teams);
  if (!top) return null;

  return (
    <>
      <Confetti />
      <h1 className="title">🎉 Game Over! 🎉</h1>
      <div className="panel" style={{ textAlign: 'center' }}>
        <div className="medal">🏆</div>
        <div>Champion</div>
        <div className="winner-name">{top.name}</div>
        <div style={{ fontSize: '1.3rem', color: 'var(--gold)', fontWeight: 900 }}>{top.score} points</div>
        <div style={{ marginTop: 20, textAlign: 'left' }}>
          {sorted.map((t, i) => (
            <div className="team-entry" style={{ marginBottom: 6 }} key={t.id}>
              <span>{i + 1}. {t.name}</span>
              <span style={{ fontWeight: 900, color: 'var(--gold)' }}>{t.score}</span>
            </div>
          ))}
        </div>
        {awards.length > 0 && (
          <div className="superlatives">
            <div style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 900, marginBottom: 10 }}>🎖️ Awards of the Night 🎖️</div>
            {awards.map(a => (
              <div className="superlative-row" key={a.label}>
                <span className="label">{a.label}</span>
                <span className="winner">{a.team.name} <span style={{ opacity: 0.7, fontWeight: 400 }}>({a.detail})</span></span>
              </div>
            ))}
          </div>
        )}
        <button className="btn-primary btn-full" disabled={banked} onClick={() => {
          bankGameToWeekend(getState(), currentRound(getState())?.name || '');
          setBanked(true);
        }}>{banked ? '✅ Banked to the Weekend Board' : '🏅 Bank This Game to the Weekend Board'}</button>
        <button className="btn-secondary btn-full" onClick={() => update(d => {
          d.used = {}; d.readerIndex = 0; d.history = []; d.finalDone = false; d.screen = 'roundselect';
        })}>Play a Different Round</button>
        <button className="btn-secondary btn-full" onClick={() => update(d => {
          d.teams.forEach(resetTeamStats);
          startRound(d, d.roundId!); // reshuffles which categories come up
        })}>Replay This Round</button>
        <button className="btn-secondary btn-full" onClick={() => {
          if (!confirm('Reset every team and score? The weekend board is kept.')) return;
          clearSavedGame();
          resetGame();
        }}>New Game (Reset Everyone)</button>
      </div>
      <WeekendStandings version={banked ? 1 : 0} />
    </>
  );
}
