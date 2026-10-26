import { useEffect } from 'react';
import { stageHooks } from '../buzz/client';
import * as act from '../game/actions';
import { setWakeLock } from '../game/wakeLock';
import { useGame } from '../game/store';
import { ScorePop, Toast } from './common';
import { Overlays } from './overlays/Overlays';
import { Scoreboard } from './Scoreboard';
import { Board } from './screens/Board';
import { Mode } from './screens/Mode';
import { RoundSelect } from './screens/RoundSelect';
import { Setup } from './screens/Setup';
import { Winner } from './screens/Winner';
import { flashToast, overlayStore } from './uiStore';

// The host phone drives the TV through the buzz room.
stageHooks.onQuestion = () => overlayStore.get()?.kind === 'question';
stageHooks.remoteAward = (teamId, cat, val) => act.awardSquare(teamId, cat, val);
stageHooks.remoteNobody = (cat, val) => act.nobodySquare(cat, val);
stageHooks.error = flashToast;

/** The show: the iPad that AirPlays to the TV. */
export function Stage() {
  const s = useGame();
  const overlay = overlayStore.use();
  const onBoard = s.screen === 'board' && !s.boardIntro;

  useEffect(() => {
    document.body.classList.toggle('on-board', onBoard);
    document.body.dataset.screen = s.screen;
  }, [onBoard, s.screen]);
  useEffect(() => {
    setWakeLock(s.screen === 'board' || s.screen === 'mode' || !!overlay);
  }, [s.screen, overlay]);
  useEffect(() => {
    window.addEventListener('keydown', hostKeys);
    return () => window.removeEventListener('keydown', hostKeys);
  }, []);

  return (
    <>
      <div id="app">
        <Scoreboard />
        <main id="main">
          {s.screen === 'setup' && <Setup />}
          {s.screen === 'roundselect' && <RoundSelect />}
          {s.screen === 'board' && <Board />}
          {s.screen === 'mode' && <Mode />}
          {s.screen === 'winner' && <Winner />}
        </main>
      </div>
      <Overlays />
      <Toast />
      <ScorePop />
    </>
  );
}

// Keyboard on the show device: Space reveals, 1–9 award a team, 0 is nobody.
function hostKeys(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement | null)?.tagName || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const ov = document.getElementById('overlay');
  const click = (el: Element | null | undefined) => {
    if (el instanceof HTMLElement) { e.preventDefault(); el.click(); }
  };
  if (e.code === 'Space') {
    click(document.querySelector('#revealBtn, #revealDDBtn, #revealF, #sReveal, #wildGoBtn'));
    return;
  }
  if (!ov) return;
  if (e.key >= '1' && e.key <= '9') {
    click(ov.querySelectorAll('[data-prefix="award"], [data-prefix="chalaward"]')[parseInt(e.key, 10) - 1]);
  } else if (e.key === '0') {
    click(ov.querySelector('#noneBtn, #chalNoneBtn'));
  }
}
