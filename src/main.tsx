import { createRoot } from 'react-dom/client';
import { getHostCode, getJoinCode } from './buzz/room';
import { getAudioCtx } from './game/sound';
import { getState, update } from './game/store';
import { setWakeLock } from './game/wakeLock';
import { HostCompanion } from './ui/phone/HostCompanion';
import { PlayerJoin } from './ui/phone/PlayerJoin';
import { Stage } from './ui/Stage';
import { overlayStore } from './ui/uiStore';
import './styles.css';

// iOS won't make a peep until a real tap.
document.addEventListener('touchstart', function unlockAudioOnce() {
  try { getAudioCtx(); } catch { /* ignore */ }
  document.removeEventListener('touchstart', unlockAudioOnce, true);
}, true);

// One URL, three apps: ?host= is the host phone, ?join= is a player, anything else is the show.
const phone = getHostCode() ? 'host' : getJoinCode() ? 'player' : null;
if (phone) setWakeLock(true); // phones stay awake for the whole game

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div id="app"><div id="scoreboard" style={{ display: 'none' }} /><main id="main">{children}</main></div>
);

// Dev server only: lets the browser tests (and you, in the console) poke the game.
if (import.meta.env.DEV) Object.assign(window, { gns: { getState, update, overlayStore } });

createRoot(document.getElementById('root')!).render(
  phone === 'host' ? <Shell><HostCompanion /></Shell>
    : phone === 'player' ? <Shell><PlayerJoin /></Shell>
      : <Stage />,
);
