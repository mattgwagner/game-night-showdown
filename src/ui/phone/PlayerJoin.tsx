import { useEffect, useState } from 'react';
import { buzzSend, buzzStore, joinAsPlayer, pickTeam } from '../../buzz/client';
import type { TeamInfo } from '../../buzz/protocol';
import { BUZZ_ROOM, getJoinCode } from '../../buzz/room';
import { flashToast } from '../uiStore';

/* ?join=CODE: a player's phone is one big buzzer. */
export function PlayerJoin() {
  const buzz = buzzStore.use();
  const joinCode = getJoinCode() || BUZZ_ROOM;
  const [name, setName] = useState('');
  const [choice, setChoice] = useState<TeamInfo | null>(null);
  const live = buzz.connected && !(buzz.teams.length && !buzz.teamName);

  useEffect(() => { document.body.classList.add('on-buzz'); }, []);
  // A new team list (tonight's, from the TV) means picking again from scratch.
  const teamsKey = buzz.teams.map(t => t.id + ':' + t.name).join('|');
  useEffect(() => { setChoice(null); }, [teamsKey]);

  let body;
  if (!buzz.connected) {
    body = (
      <>
        <h2 style={{ textAlign: 'center', color: 'var(--gold)' }}>Join</h2>
        <div className="buzz-code">{joinCode}</div>
        <div className="team-row">
          <input type="text" placeholder="Your name" maxLength={24} style={{ fontSize: 16 }} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <button className="btn-primary btn-full" onClick={async () => {
          const n = name.trim();
          if (!n) { flashToast('Enter your name'); return; }
          try { await joinAsPlayer(joinCode, n); }
          catch { flashToast('Could not join — is the host online?'); }
        }}>Join</button>
      </>
    );
  } else if (!live) {
    body = (
      <>
        <h2 style={{ textAlign: 'center', color: 'var(--gold)' }}>{buzz.name}</h2>
        <div className="who-line" style={{ textAlign: 'center' }}>Your team</div>
        <div style={{ margin: '10px 0' }}>
          <div className="team-btn-grid">
            {buzz.teams.map(tm => (
              <button key={tm.id} className={`team-btn ${choice?.id === tm.id ? 'on' : ''}`} onClick={() => setChoice(tm)}
                style={{ borderColor: tm.color || 'var(--gold)', background: choice?.id === tm.id ? 'rgba(46,204,113,.25)' : undefined }}>
                {tm.name}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary btn-full" disabled={!choice} onClick={() => choice && pickTeam(choice)}>Continue</button>
      </>
    );
  } else {
    const lead = buzz.queue[0];
    const myPos = buzz.queue.findIndex(q => q.id === buzz.myId);
    const tried = buzz.missed.includes(buzz.myId);
    const canBuzz = buzz.armed && myPos === -1 && !tried;
    let status = 'Wait';
    if (tried) status = 'Out this question';
    else if (canBuzz) status = 'Buzz in!';
    else if (myPos === 0) status = "You're up";
    else if (myPos > 0) status = `#${myPos + 1}`;
    else if (lead) status = `${lead.name} locked`;
    body = (
      <>
        <h2 style={{ textAlign: 'center', color: 'var(--gold)' }}>{buzz.name}</h2>
        <div className="hint" style={{ textAlign: 'center' }}>{buzz.teamName} · {buzz.code}</div>
        <div className="who-line" style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: 12 }}>{status}</div>
        <button className={`buzz-btn ${canBuzz ? 'armed-pulse' : 'locked-out'}`} disabled={!canBuzz}
          onClick={() => buzzSend({ type: 'buzz' })}>{tried ? 'OUT' : 'BUZZ'}</button>
      </>
    );
  }
  return (
    <div id="buzzJoinRoot" className={`panel ${live ? 'buzz-live' : ''}`} style={{ maxWidth: 480, marginTop: 24 }}>{body}</div>
  );
}
