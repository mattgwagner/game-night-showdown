import { useEffect, useState } from 'react';
import { buzzPop, buzzSend, buzzStore, connectBuzzSocket, resolveBuzzTeam } from '../../buzz/client';
import { BUZZ_ROOM, getHostCode } from '../../buzz/room';
import { playWrong } from '../../game/sound';
import { AnswerClock } from '../common';

/* ?host=CODE: answers stay on this phone, not on the TV. */
export function HostCompanion() {
  const buzz = buzzStore.use();
  const code = getHostCode() || BUZZ_ROOM;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.body.classList.add('on-buzz', 'on-host');
    connectBuzzSocket(code, 'controller', { name: 'Host' }).catch(() => setFailed(true));
  }, [code]);

  const badge = <div className="host-screen-badge">HOST SCREEN</div>;
  let body;
  if (!buzz.connected && failed) {
    body = (
      <>
        {badge}
        <h2 style={{ textAlign: 'center', color: 'var(--gold)' }}>Connecting…</h2>
        <div className="buzz-code">{code}</div>
        <div className="who-line" style={{ textAlign: 'center' }}>Open the show on the TV, then tap Retry.</div>
        <button className="btn-primary btn-full" onClick={() => location.reload()}>Retry</button>
      </>
    );
  } else if (!buzz.connected) {
    body = <>{badge}<div className="who-line" style={{ textAlign: 'center' }}>Connecting…</div></>;
  } else if (!buzz.prompt) {
    body = (
      <>
        {badge}
        <h2 style={{ textAlign: 'center', color: 'var(--gold)' }}>Ready</h2>
        <div className="buzz-code">{buzz.code}</div>
        <div className="who-line" style={{ textAlign: 'center' }}>Waiting for a question on the TV…</div>
        <div className="hint" style={{ textAlign: 'center' }}>Answers stay on this phone. TV is the show.</div>
        <div className="hint" style={{ textAlign: 'center' }}>{buzz.players.length} player{buzz.players.length === 1 ? '' : 's'} · {buzz.armed ? 'buzzers live' : 'idle'}</div>
      </>
    );
  } else {
    const p = buzz.prompt;
    const lead = buzz.queue[0];
    const awardTeam = resolveBuzzTeam(lead, buzz.teams);
    body = (
      <>
        {badge}
        <div className="tag">{p.cat} — {p.val}</div>
        {p.hint && <div className="who-line">{p.hint}</div>}
        <div className="qtext">{p.q}</div>
        <AnswerClock deadline={buzz.answerBy} total={buzz.answerTotal} />
        <div className="atext">{p.a}</div>
        {lead ? (
          <div className="buzz-panel">
            <div className="buzz-meta">Buzzed in</div>
            <div className="buzz-lead">{lead.name}{lead.teamName ? ' · ' + lead.teamName : ''}</div>
            <div className="row-gap judge-row">
              <button className="btn-primary" disabled={!awardTeam} onClick={() => awardTeam && buzzSend({ type: 'remoteAward', teamId: awardTeam.id })}>Correct (+{p.val})</button>
              <button className="btn-secondary" onClick={() => { playWrong(); buzzPop(); }}>Wrong</button>
            </div>
          </div>
        ) : (
          <div className="hint" style={{ textAlign: 'center' }}>{buzz.armed ? 'Listening for buzzes…' : ''}</div>
        )}
        <div className="who-line" style={{ marginTop: 12 }}>Award team</div>
        <div className="team-btn-grid">
          {buzz.teams.map(tm => (
            <button key={tm.id} className="team-btn" style={{ borderColor: tm.color || 'var(--gold)' }}
              onClick={() => buzzSend({ type: 'remoteAward', teamId: tm.id })}>{tm.name}</button>
          ))}
        </div>
        <button className="btn-secondary btn-full" style={{ marginTop: 12 }} onClick={() => buzzSend({ type: 'revealAnswer' })}>
          {p.revealed ? 'Answer on TV' : 'Show Answer on TV'}
        </button>
        <button className="btn-secondary btn-full" onClick={() => buzzSend({ type: 'remoteNobody' })}>Nobody</button>
      </>
    );
  }
  return <div id="buzzHostRoot" className="panel" style={{ maxWidth: 560, marginTop: 24 }}>{body}</div>;
}
