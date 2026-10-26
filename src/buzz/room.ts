/* Room codes and share links.
   Show (TV): plain URL · host phone: ?host=CODE · players: ?join=CODE.
   The show connects to the same code the links use, or phones end up in a
   different room from the TV and the buzzers look broken. */

// Fixed room so links can go out ahead of time.
export const BUZZ_ROOM = 'NITE';
const STAGE_ROOM_KEY = 'gns.room';

export function cleanRoomCode(raw: unknown): string {
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  return /^[A-Z0-9]{4}$/.test(code) ? code : '';
}

function paramCode(name: string): string {
  const q = new URLSearchParams(location.search);
  if (!q.has(name)) return '';
  return cleanRoomCode(q.get(name)) || BUZZ_ROOM;
}

export const getJoinCode = () => paramCode('join');
export const getHostCode = () => paramCode('host');

/** Stage room: ?room=CODE wins, then the last code set on this device, then NITE. */
export function getStageCode(): string {
  const fromUrl = cleanRoomCode(new URLSearchParams(location.search).get('room'));
  if (fromUrl) return fromUrl;
  let saved = '';
  try { saved = cleanRoomCode(localStorage.getItem(STAGE_ROOM_KEY)); } catch { /* ignore */ }
  return saved || BUZZ_ROOM;
}

/** Saves the code and keeps the URL in step so a reload lands in the same room. */
export function saveStageCode(raw: string): string {
  const code = cleanRoomCode(raw);
  if (!code) return '';
  try { localStorage.setItem(STAGE_ROOM_KEY, code); } catch { /* ignore */ }
  const url = new URL(location.href);
  url.searchParams.set('room', code);
  history.replaceState(null, '', url);
  return code;
}

export function randomRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function roomLinks(code: string) {
  const base = location.origin + location.pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
  return { join: base + '?join=' + code, host: base + '?host=' + code };
}
