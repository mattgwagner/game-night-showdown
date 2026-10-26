/* Keep the iPad awake while AirPlaying (a blank screen mid-question kills the room).
   Player and host phones stay awake for the whole game. */
let lock: WakeLockSentinel | null = null;
let wanted = false;

async function acquire() {
  if (lock || !('wakeLock' in navigator)) return;
  try {
    lock = await navigator.wakeLock.request('screen');
    lock.addEventListener('release', () => { lock = null; });
  } catch {
    lock = null;
  }
}

export function setWakeLock(want: boolean) {
  wanted = want;
  if (want) acquire();
  else {
    try { lock?.release(); } catch { /* ignore */ }
    lock = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wanted) acquire();
});
// Safari can refuse the lock until the user has tapped; retry on the next tap.
document.addEventListener('pointerdown', () => { if (wanted && !lock) acquire(); });
