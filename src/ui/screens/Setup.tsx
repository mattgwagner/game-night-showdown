import { useRef, useState } from 'react';
import { NAME_LEFT, NAME_RIGHT } from '../../content';
import { buzzStore } from '../../buzz/client';
import { getStageCode, randomRoomCode, roomLinks, saveStageCode } from '../../buzz/room';
import { keepStageConnected } from '../../game/actions';
import { clearSavedGame, loadSavedGame } from '../../game/persistence';
import { addTeam } from '../../game/rules';
import { setState, update, useGame } from '../../game/store';
import { copyLink, WeekendStandings } from '../common';
import { flashToast } from '../uiStore';

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export function Setup() {
  const s = useGame();
  const [saved, setSaved] = useState(loadSavedGame);
  const [name, setName] = useState('');
  const [code, setCode] = useState(getStageCode);
  const [codeInput, setCodeInput] = useState(code);
  const nameRef = useRef<HTMLInputElement>(null);
  const links = roomLinks(code);

  const add = () => {
    const n = name.trim();
    if (!n) return;
    update(d => addTeam(d, n));
    setName('');
    nameRef.current?.focus();
  };

  const applyRoom = (raw: string) => {
    const c = saveStageCode(raw);
    if (!c) { flashToast('Game code is 4 letters or numbers'); return; }
    setCode(c);
    setCodeInput(c);
    flashToast('Game code: ' + c);
    // Already live in another room? Move the stage over.
    const b = buzzStore.get();
    if (b.role === 'host' && b.code !== c) keepStageConnected();
  };

  return (
    <>
      <h1 className="title">🏆 Game Night Showdown 🏆</h1>
      <div className="subtitle">Add teams, then start</div>
      <div className="panel">
        {saved && (
          <div className="resume-box">
            <div style={{ fontWeight: 900, color: 'var(--green)', marginBottom: 6 }}>Game in progress</div>
            <div style={{ fontSize: '.9rem', opacity: 0.8, marginBottom: 10 }}>{saved.teams.map(t => t.name).join(', ')}</div>
            <button className="btn-primary btn-full" onClick={() => setState(saved)}>Resume That Game</button>
            <button className="btn-secondary btn-full" onClick={() => { clearSavedGame(); setSaved(null); }}>Start Fresh Instead</button>
          </div>
        )}
        <h2>Who's Playing?</h2>
        <div className="team-row">
          <input ref={nameRef} type="text" placeholder="Team or player name" maxLength={24} value={name}
            onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); }} />
          <button className="btn-primary" onClick={add}>Add</button>
        </div>
        <button className="btn-secondary btn-full" style={{ marginBottom: 10 }}
          onClick={() => setName(`${pick(NAME_LEFT)} ${pick(NAME_RIGHT)}`)}>🎲 Can't Decide? Generate a Team Name</button>
        <div id="teamList">
          {s.teams.map(t => (
            <div className="team-entry" key={t.id}>
              <span>{t.name}</span>
              <button className="btn-danger" onClick={() => update(d => { d.teams = d.teams.filter(x => x.id !== t.id); })}>Remove</button>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 22 }}>Spice Level</h2>
        <div className="spice-toggle">
          <button className={`spice-opt ${s.spice !== 'party' ? 'on' : ''}`} onClick={() => update(d => { d.spice = 'family'; })}>
            <span className="st-name">☀️ Family Friendly</span>
            <span className="st-desc">All ages</span>
          </button>
          <button className={`spice-opt ${s.spice === 'party' ? 'on' : ''}`} onClick={() => update(d => { d.spice = 'party'; })}>
            <span className="st-name">🌙 After Dark</span>
            <span className="st-desc">Adults only</span>
          </button>
        </div>

        <button className={`spice-opt drinks-opt ${s.drinks ? 'on' : ''}`} style={{ width: '100%', marginBottom: 14 }}
          onClick={() => update(d => { d.drinks = !d.drinks; })}>
          <span className="st-name">{s.drinks ? '🍺 Drinking Games: ON' : '🥤 Drinking Games: OFF'}</span>
          <span className="st-desc">{s.drinks ? 'Sips or forfeit' : 'Off'}</span>
        </button>

        <div className="dual-box">
          <h3>Two screens</h3>
          <div className="hint" style={{ margin: '0 0 10px', textAlign: 'left' }}>TV runs the show. Your phone keeps the answers private.</div>
          <div className="room-row">
            <label htmlFor="roomCodeInput">Game code</label>
            <input id="roomCodeInput" maxLength={4} autoCapitalize="characters" autoComplete="off" spellCheck={false}
              value={codeInput} onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyRoom(codeInput); } }} />
            <button className="btn-secondary" type="button" onClick={() => applyRoom(codeInput)}>Set</button>
            <button className="btn-secondary" type="button" onClick={() => applyRoom(randomRoomCode())}>New</button>
          </div>
          <div className="dual-roles">
            <div className="dual-role">
              <div className="dr-title">📺 Show (this iPad → TV)</div>
              <div className="dr-desc">Board + questions. Answers stay hidden until you reveal them from the host phone.</div>
            </div>
            <div className="dual-role">
              <div className="dr-title">📱 Host phone</div>
              <div className="dr-desc">Answers, buzz queue, Correct / Wrong, award points.</div>
              <div className="dr-url">{links.host}</div>
              <button className="btn-primary btn-full" type="button" onClick={() => copyLink(links.host, 'Host link', flashToast)}>Copy Host Link</button>
            </div>
            <div className="dual-role">
              <div className="dr-title">🔔 Player buzzers (optional)</div>
              <div className="dr-desc">Everyone else opens this to ring in.</div>
              <div className="dr-url">{links.join}</div>
              <button className="btn-secondary btn-full" type="button" onClick={() => copyLink(links.join, 'Player link', flashToast)}>Copy Player Link</button>
            </div>
          </div>
        </div>

        <button className="btn-primary btn-full" disabled={s.teams.length < 2}
          onClick={() => update(d => { d.readerIndex = 0; d.screen = 'roundselect'; })}>Start Game</button>
        <div className="hint">Need at least 2 teams. Dual screen wires up automatically.</div>
      </div>
      <WeekendStandings />
    </>
  );
}
