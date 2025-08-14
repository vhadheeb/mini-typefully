'use client';
import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Page() {
  const { data: session } = (require('next-auth/react') as any).useSession();
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  async function schedule() {
    const dt = new Date(`${date}T${time}:00`);
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, scheduled_time: dt.toISOString() })
    });
    const j = await res.json();
    if (j.ok) {
      alert('Scheduled!');
      setContent('');
    } else {
      alert('Error: ' + j.error);
    }
  }

  return (
    <div className="card">
      {!session ? (
        <div className="grid">
          <p>Log in to start scheduling.</p>
          <button className="primary" onClick={() => signIn('twitter')}>Log in with X</button>
        </div>
      ) : (
        <div className="grid" style={{gap:16}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div>Signed in as {(session as any).username || 'your X account'}</div>
            <button onClick={() => signOut()}>Log out</button>
          </div>
          <textarea rows={6} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your tweet here..." />
          <div className="grid grid-2">
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} />
          </div>
          <button className="primary" onClick={schedule}>Schedule</button>
          <p className="small">This MVP schedules text-only. We’ll add media + real posting in the next step.</p>
        </div>
      )}
    </div>
  );
}
