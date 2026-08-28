'use client';

import { FormEvent, useEffect, useState } from 'react';

const statuses = ['New', 'In Review', 'Resolved'];

export default function Admin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [filter, setFilter] = useState('All');

  async function load() {
    const r = await fetch('/api/admin/suggestions', { cache: 'no-store' });
    if (r.status === 401) { setLoggedIn(false); setLoading(false); return; }
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Unable to load suggestions');
    setItems(d.suggestions || []);
    setLoggedIn(true);
    setLoading(false);
  }

  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginError('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const d = await r.json();
    if (!r.ok) { setLoginError(d.error || 'Login failed'); return; }
    setPassword('');
    setLoading(true);
    await load();
  }

  async function updateStatus(id: string, status: string) {
    const r = await fetch('/api/admin/suggestions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    if (r.ok) setItems(prev => prev.map(x => x.id === id ? { ...x, status } : x));
  }

  async function remove(id: string) {
    if (!confirm('Delete this suggestion permanently?')) return;
    const r = await fetch('/api/admin/suggestions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (r.ok) setItems(prev => prev.filter(x => x.id !== id));
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setLoggedIn(false);
  }

  if (!loggedIn) return (
    <main className="admin loginPage">
      <div className="loginCard">
        <div className="brand">KHMC</div>
        <h1>Admin Dashboard</h1>
        <p>Sign in to view and manage suggestion box messages.</p>
        <form onSubmit={login} className="loginForm">
          <label>Admin password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required /></label>
          {loginError && <div className="error">{loginError}</div>}
          <button type="submit">Sign in</button>
        </form>
        <a href="/">Back to patient form</a>
      </div>
    </main>
  );

  const filtered = filter === 'All' ? items : items.filter(x => (x.status || 'New') === filter);
  const counts = { All: items.length, New: items.filter(x => !x.status || x.status === 'New').length, 'In Review': items.filter(x => x.status === 'In Review').length, Resolved: items.filter(x => x.status === 'Resolved').length };

  return <main className="admin">
    <div className="adminHead">
      <div><div className="brand">KHMC</div><h1>Suggestion Box</h1><p>Review and manage feedback received from patients.</p></div>
      <div className="adminActions"><a href="/">Patient Form</a><button className="logout" onClick={logout}>Sign out</button></div>
    </div>
    <div className="stats">{(['All', ...statuses] as const).map(s => <button key={s} className={filter === s ? 'activeFilter' : ''} onClick={() => setFilter(s)}><strong>{counts[s]}</strong><span>{s}</span></button>)}</div>
    <section className="table">
      {loading ? <p>Loading...</p> : filtered.length === 0 ? <div className="empty"><h2>No {filter === 'All' ? '' : filter.toLowerCase() + ' '}suggestions</h2><p>New messages will appear here when patients submit the form.</p></div> : filtered.map(x => <article className="item" key={x.id}>
        <div className="itemTop"><div className="meta"><b>{x.type || 'Suggestion'}</b><span>{x.department || 'General'}</span><small>{new Date(x.created_at).toLocaleString()}</small></div><select value={x.status || 'New'} onChange={e => updateStatus(x.id, e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></div>
        <p className="message">{x.message}</p>
        <div className="itemBottom"><small>{x.anonymous ? 'Anonymous' : `${x.name || 'No name'}${x.phone ? ` · ${x.phone}` : ''}`}</small><button className="delete" onClick={() => remove(x.id)}>Delete</button></div>
      </article>)}
    </section>
  </main>;
}
