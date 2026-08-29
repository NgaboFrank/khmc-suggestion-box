'use client';

import { useEffect, useState } from 'react';

type AdminUser = {
  id: number; name: string; email: string; username?: string; is_active: boolean; is_owner: boolean; created_at?: string;
};

export default function AdminManagement() {
  const [open, setOpen] = useState(false), [admins, setAdmins] = useState<AdminUser[]>([]);
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [error, setError] = useState(''), [saving, setSaving] = useState(false), [loading, setLoading] = useState(false);

  async function loadAdmins() {
    setLoading(true); setError('');
    try { const r = await fetch('/api/admin/users', { cache: 'no-store' }); const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Unable to load admins'); setAdmins(d.admins || []); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load admins'); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (open) loadAdmins(); }, [open]);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Unable to create admin');
      setAdmins(c => [d.admin, ...c]); setName(''); setEmail(''); setPassword('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create admin'); }
    finally { setSaving(false); }
  }
  async function toggleAdmin(admin: AdminUser) {
    const r = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: admin.id, is_active: !admin.is_active }) });
    const d = await r.json(); if (!r.ok) return setError(d.error || 'Unable to update admin');
    setAdmins(c => c.map(x => x.id === admin.id ? d.admin : x));
  }
  async function removeAdmin(admin: AdminUser) {
    if (!confirm(`Remove ${admin.name} from KHMC admin access?`)) return;
    const r = await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: admin.id }) });
    const d = await r.json(); if (!r.ok) return setError(d.error || 'Unable to remove admin'); setAdmins(c => c.filter(x => x.id !== admin.id));
  }

  return <>
    <button className="adminManagementButton" onClick={() => setOpen(true)} title="Manage administrators"><span>⚙</span> Admin management</button>
    {open && <div className="adminManagerOverlay" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section className="adminManagerCard" role="dialog" aria-modal="true" aria-label="Admin management">
        <header className="adminManagerHeader"><div><div className="adminManagerEyebrow">OWNER ONLY</div><h2>Admin management</h2><p>Create and control individual KHMC admin accounts.</p></div><button className="adminManagerClose" onClick={() => setOpen(false)} aria-label="Close">×</button></header>
        <div className="adminManagerBody">
          <form className="adminAddForm" onSubmit={addAdmin}><h3>Add a new admin</h3><p>Each admin gets their own email and password. Only you can create these accounts.</p><div className="adminFormGrid">
            <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Staff member name" required /></label>
            <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@khmc.com" required /></label>
            <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
            <button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create admin'}</button>
          </div></form>
          {error && <div className="adminManagerError">{error}</div>}
          <div className="adminListHeader"><div><h3>Administrators</h3><p>{admins.length} account{admins.length === 1 ? '' : 's'}</p></div>{loading && <span>Loading…</span>}</div>
          <div className="adminList">{admins.map(admin => <div className="adminListRow" key={admin.id}>
            <div className="adminAvatar">{admin.name.charAt(0).toUpperCase()}</div><div className="adminIdentity"><strong>{admin.name} {admin.is_owner && <em>Owner</em>}</strong><span>{admin.email}</span></div>
            <span className={`adminStatus ${admin.is_active ? 'active' : 'inactive'}`}>{admin.is_active ? 'Active' : 'Disabled'}</span>
            {!admin.is_owner && <><button className="adminSmallButton" onClick={() => toggleAdmin(admin)}>{admin.is_active ? 'Disable' : 'Enable'}</button><button className="adminRemoveButton" onClick={() => removeAdmin(admin)}>Remove</button></>}
          </div>)}</div>
        </div>
      </section>
    </div>}
    <style jsx global>{`
      .adminManagementButton{position:fixed;right:24px;bottom:24px;z-index:20;background:#087845;color:#fff;border:0;border-radius:12px;padding:12px 16px;font-size:12px;font-weight:800;box-shadow:0 10px 25px #08784535;cursor:pointer}.adminManagementButton:hover{transform:translateY(-1px);box-shadow:0 13px 28px #08784545}.adminManagementButton span{margin-right:7px}
      .adminManagerOverlay{position:fixed;inset:0;z-index:100;background:#10251b88;backdrop-filter:blur(4px);display:grid;place-items:center;padding:22px}.adminManagerCard{width:min(900px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:20px;border:1px solid #d8e6de;box-shadow:0 25px 70px #10251b30;color:#173b2b}.adminManagerHeader{display:flex;justify-content:space-between;gap:20px;padding:24px 26px;border-bottom:1px solid #e6eee9}.adminManagerEyebrow{font-size:9px;letter-spacing:.14em;font-weight:900;color:#16804b}.adminManagerHeader h2{margin:5px 0;font-size:24px}.adminManagerHeader p{margin:0;color:#718079;font-size:12px}.adminManagerClose{background:#f1f5f3;color:#38564a;border:0;border-radius:9px;width:34px;height:34px;font-size:22px;cursor:pointer}.adminManagerBody{padding:22px 26px}.adminAddForm{background:#f7faf8;border:1px solid #dfeae4;border-radius:15px;padding:18px}.adminAddForm h3,.adminListHeader h3{margin:0;font-size:15px}.adminAddForm p,.adminListHeader p{margin:4px 0 14px;color:#7a8881;font-size:11px}.adminFormGrid{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end}.adminFormGrid label{font-size:10px;font-weight:800;color:#4b6257}.adminFormGrid input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:10px;border:1px solid #cedbd4;border-radius:9px;background:#fff;font-size:12px;outline:0}.adminFormGrid input:focus{border-color:#16804b;box-shadow:0 0 0 3px #16804b15}.adminFormGrid>button{height:38px;white-space:nowrap;background:#087845;color:#fff;border:0;border-radius:9px;padding:0 14px;font-weight:800;font-size:11px;cursor:pointer}.adminFormGrid>button:disabled{opacity:.6}.adminManagerError{margin-top:12px;background:#fff0f0;border:1px solid #efcdca;color:#a33f39;border-radius:9px;padding:10px;font-size:11px}.adminListHeader{display:flex;justify-content:space-between;align-items:center;margin:22px 2px 10px}.adminListHeader p{margin:3px 0 0}.adminListHeader>span{font-size:10px;color:#8a968f}.adminList{border:1px solid #e0e9e4;border-radius:13px;overflow:hidden}.adminListRow{display:flex;align-items:center;gap:11px;padding:13px 14px;border-bottom:1px solid #edf2ef}.adminListRow:last-child{border-bottom:0}.adminAvatar{width:34px;height:34px;flex:0 0 34px;border-radius:50%;display:grid;place-items:center;background:#e6f5ed;color:#087845;font-size:12px;font-weight:900}.adminIdentity{min-width:0;flex:1}.adminIdentity strong,.adminIdentity span{display:block}.adminIdentity strong{font-size:12px}.adminIdentity span{margin-top:3px;font-size:10px;color:#7b8982}.adminIdentity em{font-style:normal;font-size:8px;background:#e6f5ed;color:#16804b;border-radius:5px;padding:3px 5px;margin-left:5px}.adminStatus{font-size:9px;font-weight:800;border-radius:7px;padding:5px 8px}.adminStatus.active{background:#e6f5ed;color:#16804b}.adminStatus.inactive{background:#f2f3f3;color:#7b8580}.adminSmallButton,.adminRemoveButton{background:#fff;border:1px solid #d4e0da;color:#4c6258;border-radius:7px;padding:7px 9px;font-size:9px;font-weight:750;cursor:pointer}.adminRemoveButton{color:#a94c46;border-color:#efd6d3}.adminSmallButton:hover{background:#f5faf7}.adminRemoveButton:hover{background:#fff3f2}
      @media(max-width:760px){.adminManagementButton{right:14px;bottom:14px}.adminManagerOverlay{padding:10px}.adminManagerHeader,.adminManagerBody{padding:18px}.adminFormGrid{grid-template-columns:1fr}.adminFormGrid>button{width:100%}.adminListRow{flex-wrap:wrap}.adminStatus{margin-left:auto}}
    `}</style>
  </>;
}
