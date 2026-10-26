import { useEffect, useState } from 'react';
import { buzzStore } from '../../buzz/client';
import * as act from '../../game/actions';
import { activeCats, boardCleared, categoryNames, currentReader, currentRound, lockInCategories, resetTeamStats, shuffle, startRound, totalCells, usedCount } from '../../game/rules';
import { isMuted, setMuted } from '../../game/sound';
import { VALUES, squareKey } from '../../game/state';
import { update, useGame } from '../../game/store';
import { Card } from '../common';
import { hostSheetStore, overlayStore } from '../uiStore';

export function Board() {
  const s = useGame();
  const overlay = overlayStore.use();
  const sheet = hostSheetStore.use();
  const buzz = buzzStore.use();
  const round = currentRound(s);
  const cleared = boardCleared(s);

  // Dual screen: keep the show connected so answers stay on the host phone.
  // Retries every few seconds while offline: a Wi-Fi blip mustn't drop the TV to single-screen for the rest of the board.
  useEffect(() => {
    if (buzz.connected) return;
    act.keepStageConnected();
    const id = setInterval(act.keepStageConnected, 3000);
    return () => clearInterval(id);
  }, [buzz.connected]);
  useEffect(() => { if (cleared && s.finalDone) update(d => { d.screen = 'winner'; }); }, [cleared, s.finalDone]);

  if (!round) return null;
  if (s.boardIntro) return <BoardIntro />;
  if (cleared && !s.finalDone) {
    return (
      <Card>
        <div className="tag dd">🏁 BOARD CLEARED 🏁</div>
        <button className="btn-primary btn-full" onClick={act.openFinalShowdown}>Final Showdown</button>
        <button className="btn-secondary btn-full" onClick={act.skipFinal}>Skip to Winner</button>
      </Card>
    );
  }

  const cols = activeCats(s);
  const reader = currentReader(s);
  return (
    <>
      <h1 className="title board-title">🏆 {round.name} 🏆</h1>
      {reader && <div className="reader-banner">🎯 <strong>{reader.name}</strong> picks next</div>}
      <div id="board" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`, ['--cols' as string]: cols.length }}>
        {cols.map(c => <div className="cat-header" key={c}>{c}</div>)}
        {VALUES.map(v => cols.map(cat => {
          const used = !!s.used[squareKey(cat, v)];
          return (
            <div key={cat + v} className={`cell ${used ? 'used' : 'clickable'}`} data-cat={cat} data-val={v}
              onClick={used ? undefined : () => act.openSquare(cat, v)}>{used ? '' : v}</div>
          );
        }))}
      </div>
      {!overlay && <button className="host-fab" type="button" onClick={() => hostSheetStore.set(true)}>☰ Host</button>}
      {sheet && <HostSheet />}
    </>
  );
}

function HostSheet() {
  const s = useGame();
  const buzz = buzzStore.use();
  const [muted, setMutedView] = useState(isMuted);
  const close = () => hostSheetStore.set(false);
  const then = (f: () => void) => () => { close(); f(); };

  return (
    <>
      <div className="host-sheet-backdrop" onClick={close} />
      <div className="host-sheet">
        <h3>Host</h3>
        <div className="hint" style={{ margin: '-4px 0 12px' }}>{usedCount(s)} / {totalCells(s)}</div>
        <div className="host-sheet-grid">
          <button className="btn-primary" onClick={then(() => overlayStore.set({ kind: 'sideQuest' }))}>🎯 Side Quest</button>
          <button className="btn-secondary" onClick={then(act.openRandomSquare)}>🎲 Random</button>
          <button className="btn-secondary" onClick={then(() => overlayStore.set({ kind: 'scoreEditor' }))}>✏️ Scores</button>
          <button className="btn-secondary" disabled={!s.history.length} onClick={() => { if (act.undo()) close(); }}>↩ Undo</button>
          <button className={`btn-secondary ${muted ? 'muted-on' : ''}`} onClick={() => { setMuted(!muted); setMutedView(!muted); }}>
            {muted ? '🔇 Muted' : '🔊 Sound'}
          </button>
          <button className="btn-secondary" onClick={toggleFullscreen}>⛶ Fullscreen</button>
          <button className="btn-secondary sheet-wide" onClick={then(async () => {
            if (!buzzStore.get().connected) await act.connectStage();
            act.openDualScreenCard();
          })}>
            {buzz.connected ? `📺 Dual screen: ${buzz.code} (${buzz.players.length} buzzers)` : '📺 Dual Screen / Buzzers'}
          </button>
          <button className="btn-secondary sheet-wide" onClick={() => {
            if (!confirm("Switch to a different round? This round's progress will be cleared (scores stay).")) return;
            close();
            update(d => { d.used = {}; d.readerIndex = 0; d.finalDone = false; d.boardIntro = false; d.screen = 'roundselect'; });
          }}>Change Round</button>
          <button className="btn-secondary sheet-wide" onClick={() => {
            if (!confirm('Reset this round? Scores and revealed squares will be cleared.')) return;
            close();
            update(d => { d.teams.forEach(resetTeamStats); startRound(d, d.roundId!); });
          }}>Reset Round</button>
          <button className="btn-primary sheet-wide" onClick={close}>Done</button>
        </div>
      </div>
    </>
  );
}

function toggleFullscreen() {
  const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  try {
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
      return;
    }
    (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  } catch { /* not supported */ }
}

function BoardIntro() {
  const s = useGame();
  const round = currentRound(s)!;
  const names = categoryNames(round);
  const max = Math.min(s.boardSize || 4, names.length);
  const selected = s.activeCategories || [];

  const toggle = (c: string) => update(d => {
    const sel = d.activeCategories || [];
    if (sel.includes(c)) d.activeCategories = sel.filter(x => x !== c);
    // Full? Drop the oldest pick so tapping another category swaps in.
    else d.activeCategories = [...(sel.length >= max ? sel.slice(1) : sel), c];
  });

  return (
    <>
      <h1 className="title" style={{ marginTop: 4 }}>{round.name}</h1>
      <div className="panel" style={{ maxWidth: 720, textAlign: 'center' }}>
        <h2>Categories</h2>
        <div className="hint">{selected.length} selected · tap to toggle · up to {max}</div>
        <div className="intro-cats">
          {names.map(c => (
            <button type="button" key={c} className={`intro-cat ${selected.includes(c) ? 'on' : 'off'}`} onClick={() => toggle(c)}>{c}</button>
          ))}
        </div>
        <button className="btn-secondary btn-full" style={{ marginTop: 8 }}
          onClick={() => update(d => { d.activeCategories = shuffle(names).slice(0, max); })}>Random {max}</button>
        <button className="btn-primary btn-full" disabled={selected.length < 1}
          onClick={() => update(d => lockInCategories(d, selected))}>Play ({selected.length})</button>
      </div>
    </>
  );
}
