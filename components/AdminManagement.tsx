'use client';

import { useEffect, useState } from 'react';

type AdminUser = {
  id: number;
  name: string;
  email: string;
  username?: string;
  is_active: boolean;
  is_owner: boolean;
  created_at?: string;
};

export default function AdminManagement() {
  const [open, setOpen] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadAdmins() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load admins');
      setAdmins(data.admins || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load admins');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (open) loadAdmins(); }, [open]);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create admin');
      setAdmins((current) => [data.admin, ...current]);
      setName(''); setEmail(''); setPassword('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to create admin');
    } finally {
      setSaving(false);
    }
  }

  async function toggleAdmin(admin: AdminUser) {
    const response = await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: admin.id, is_active: !admin.is_active }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to update admin');
    setAdmins((current) => current.map((item) => item.id === admin.id ? data.admin : item));
  }

  async function removeAdmin(admin: AdminUser) {
    if (!confirm(`Remove ${admin.name} from KHMC admin access?`)) return;
    const response = await fetch('/api/admin/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: admin.id }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || 'Unable to remove admin');
    setAdmins((current) => current.filter((item) => item.id !== admin.id));
  }

  return <>
    <button className="adminManagementButton" onClick={() => setOpen(true)} title="Manage administrators">
      <span>⚙</span> Admin management
    </button>

    {open && <div className="adminManagerOverlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section className="adminManagerCard" role="dialog" aria-modal="true" aria-label="Admin management">
        <header className="adminManagerHeader">
          <div><div className="adminManagerEyebrow">OWNER ONLY</div><h2>Admin management</h2><p>Create and control individual KHMC admin accounts.</p></div>
          <button className="adminManagerClose" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </header>

        <div className="adminManagerBody">
          <form className="adminAddForm" onSubmit={addAdmin}>
            <h3>Add a new admin</h3>
            <p>Each admin gets their own email and password. Only you can create these accounts.</p>
            <div className="adminFormGrid">
              <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Staff member name" required /></label>
              <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@khmc.com" required /></label>
              <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
              <button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create admin'}</button>
            </div>
          </form>

          {error && <div className="adminManagerError">{error}</div>}

          <div className="adminListHeader"><div><h3>Administrators</h3><p>{admins.length} account{admins.length === 1 ? '' : 's'}</p></div>{loading && <span>Loading…</span>}</div>
          <div className="adminList">
            {admins.map((admin) => <div className="adminListRow" key={admin.id}>
              <div className="adminAvatar">{admin.name.charAt(0).toUpperCase()}</div>
              <div className="adminIdentity"><strong>{admin.name} {admin.is_owner && <em>Owner</em>}</strong><span>{admin.email}</span></div>
              <span className={`adminStatus ${admin.is_active ? 'active' : 'inactive'}`}>{admin.is_active ? 'Active' : 'Disabled'}</span>
              {!admin.is_owner && <><button className="adminSmallButton" onClick={() => toggleAdmin(admin)}>{admin.is_active ? 'Disable' : 'Enable'}</button><button className="adminRemoveButton" onClick={() => removeAdmin(admin)}>Remove</button></>}
            </div>)}
          </div>
        </div>
      </section>
    </div>}
  </>;
}
