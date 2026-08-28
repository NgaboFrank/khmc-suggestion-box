'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

const statuses = ['New', 'In Review', 'Resolved'] as const;
type Status = (typeof statuses)[number];
type Filter = 'All' | Status;
type Suggestion = {
  id: number;
  type?: string;
  department?: string;
  message?: string;
  anonymous?: boolean;
  name?: string;
  phone?: string;
  created_at?: string;
  status?: Status;
};

export default function Admin() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All departments');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const r = await fetch('/api/admin/suggestions?ts=' + Date.now(), { cache: 'no-store' });
      const text = await r.text();
      let d: { suggestions?: Suggestion[]; error?: string } = {};
      try { d = text ? JSON.parse(text) : {}; } catch {}
      if (r.status === 401) {
        setLoggedIn(false);
        return;
      }
      if (!r.ok) throw new Error(d.error || `Unable to load suggestions (HTTP ${r.status})`);
      if (!Array.isArray(d.suggestions)) throw new Error('Invalid response from admin API');
      setItems(d.suggestions);
      setLoggedIn(true);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Admin load error:', error);
      setLoadError(error instanceof Error ? error.message : 'Unable to load suggestions');
      setLoggedIn(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginError('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setLoginError(d.error || 'Login failed');
        return;
      }
      setPassword('');
      await load();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async function updateStatus(id: number, status: string) {
    const r = await fetch('/api/admin/suggestions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (r.ok) {
      setItems(prev => prev.map(x => x.id === id ? { ...x, status: status as Status } : x));
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this suggestion permanently?')) return;
    const r = await fetch('/api/admin/suggestions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (r.ok) setItems(prev => prev.filter(x => x.id !== id));
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setLoggedIn(false);
  }

  const counts = useMemo(() => ({
    All: items.length,
    New: items.filter(x => !x.status || x.status === 'New').length,
    'In Review': items.filter(x => x.status === 'In Review').length,
    Resolved: items.filter(x => x.status === 'Resolved').length,
  }), [items]);

  const departments = useMemo(() => {
    const values = items.map(x => x.department).filter(Boolean) as string[];
    return ['All departments', ...Array.from(new Set(values)).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(x => {
      const status = x.status || 'New';
      const matchesStatus = filter === 'All' || status === filter;
      const matchesDepartment = department === 'All departments' || (x.department || 'General') === department;
      const haystack = [x.type, x.department, x.message, x.name, x.phone].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && matchesDepartment && (!q || haystack.includes(q));
    });
  }, [items, filter, department, search]);

  const resolvedPercent = counts.All ? Math.round((counts.Resolved / counts.All) * 100) : 0;

  if (!loggedIn) return (
    <main className="admin loginPage">
      <div className="loginCard">
        <div className="brand">KHMC</div>
        <div className="loginIcon">✓</div>
        <h1>Admin Dashboard</h1>
        <p>Sign in securely to review and manage patient feedback.</p>
        <form onSubmit={login} className="loginForm">
          <label>Admin password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required /></label>
          {loginError && <div className="error">{loginError}</div>}
          <button type="submit">Sign in to dashboard</button>
        </form>
        <a href="/">← Back to patient form</a>
      </div>
    </main>
  );

  return (
    <main className="admin">
      <header className="adminTopbar">
        <div className="adminBrand"><div className="brand">KHMC</div><span>Suggestion Management</span></div>
        <div className="adminActions"><a href="/">Patient Form</a><button className="logout" onClick={logout}>Sign out</button></div>
      </header>

      <section className="dashboardHero">
        <div>
          <div className="eyebrow">ADMINISTRATION</div>
          <h1>Suggestion Box</h1>
          <p>Monitor, review and resolve feedback received from patients.</p>
        </div>
        <button className="refreshButton" onClick={load} disabled={loading}>↻ {loading ? 'Refreshing…' : 'Refresh'}</button>
      </section>

      <section className="dashboardStats" aria-label="Suggestion summary">
        <button className={`statCard ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
          <span className="statIcon">◉</span><span className="statLabel">Total feedback</span><strong>{counts.All}</strong><small>All submissions</small>
        </button>
        <button className={`statCard ${filter === 'New' ? 'active' : ''}`} onClick={() => setFilter('New')}>
          <span className="statIcon">●</span><span className="statLabel">New</span><strong>{counts.New}</strong><small>Needs attention</small>
        </button>
        <button className={`statCard ${filter === 'In Review' ? 'active' : ''}`} onClick={() => setFilter('In Review')}>
          <span className="statIcon">◌</span><span className="statLabel">In review</span><strong>{counts['In Review']}</strong><small>Being handled</small>
        </button>
        <button className={`statCard ${filter === 'Resolved' ? 'active' : ''}`} onClick={() => setFilter('Resolved')}>
          <span className="statIcon">✓</span><span className="statLabel">Resolved</span><strong>{counts.Resolved}</strong><small>{resolvedPercent}% of total</small>
        </button>
      </section>

      <section className="workspace">
        <div className="workspaceHead">
          <div><h2>Patient feedback</h2><p>{filtered.length} {filtered.length === 1 ? 'message' : 'messages'} shown</p></div>
          <div className="lastUpdated">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</div>
        </div>

        <div className="toolbar">
          <div className="searchBox"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages, departments or names…" /></div>
          <select value={department} onChange={e => setDepartment(e.target.value)} aria-label="Filter by department">{departments.map(d => <option key={d}>{d}</option>)}</select>
          <select value={filter} onChange={e => setFilter(e.target.value as Filter)} aria-label="Filter by status">
            {(['All', ...statuses] as Filter[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="empty"><div className="loadingDot">•</div><h2>Loading feedback</h2><p>Fetching the latest patient messages…</p></div>
        : loadError ? <div className="empty"><div className="emptyIcon">!</div><h2>Unable to load messages</h2><p>{loadError}</p><button onClick={load}>Try again</button></div>
        : filtered.length === 0 ? <div className="empty"><div className="emptyIcon">✓</div><h2>{items.length === 0 ? 'No suggestions yet' : 'No matching feedback'}</h2><p>{items.length === 0 ? 'New messages will appear here when patients submit the form.' : 'Try changing your search or filters.'}</p>{items.length > 0 && <button onClick={() => { setSearch(''); setDepartment('All departments'); setFilter('All'); }}>Clear filters</button>}</div>
        : <div className="messageList">{filtered.map(x => {
          const status = x.status || 'New';
          return <article className="item" key={x.id}>
            <div className="itemTop">
              <div className="itemTitle">
                <span className={`typeBadge ${String(x.type || 'Suggestion').toLowerCase() === 'complaint' ? 'complaint' : ''}`}>{x.type || 'Suggestion'}</span>
                <h3>{x.department || 'General'}</h3>
                <span className={`statusBadge status-${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
              </div>
              <select value={status} onChange={e => updateStatus(x.id, e.target.value)} aria-label={`Status for message ${x.id}`}>
                {statuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <p className="message">{x.message || 'No message provided.'}</p>
            <div className="itemBottom">
              <div className="sender"><span className="avatar">{x.anonymous ? '?' : (x.name || 'P').charAt(0).toUpperCase()}</span><div><b>{x.anonymous ? 'Anonymous patient' : (x.name || 'No name')}</b><small>{x.anonymous ? 'Identity hidden' : (x.phone || 'No phone number')}</small></div></div>
              <div className="itemMeta"><small>{x.created_at ? new Date(x.created_at).toLocaleString() : 'Date unavailable'}</small><button className="delete" onClick={() => remove(x.id)}>Delete</button></div>
            </div>
          </article>;
        })}</div>}
      </section>
    </main>
  );
}
