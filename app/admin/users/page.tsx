'use client';

import { FormEvent, useEffect, useState } from 'react';
import '../admin.css';

type AdminUser = { id:number; name:string; username:string; is_active:boolean; created_at:string };

export default function AdminUsers() {
  const [admins,setAdmins]=useState<AdminUser[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [name,setName]=useState('');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');

  async function load(){
    setLoading(true); setError('');
    try { const r=await fetch('/api/admin/users',{cache:'no-store'}); const d=await r.json(); if(!r.ok) throw new Error(d.error||'Unable to load admin accounts'); setAdmins(d.admins||[]); }
    catch(e){setError(e instanceof Error?e.message:'Unable to load admin accounts');}
    finally{setLoading(false);}
  }
  useEffect(()=>{load()},[]);

  async function addAdmin(e:FormEvent){
    e.preventDefault(); setSaving(true); setError(''); setMessage('');
    try { const r=await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,username,password})}); const d=await r.json(); if(!r.ok) throw new Error(d.error||'Unable to create admin'); setAdmins(a=>[d.admin,...a]); setName('');setUsername('');setPassword('');setMessage('Admin account created successfully.'); }
    catch(e){setError(e instanceof Error?e.message:'Unable to create admin');}
    finally{setSaving(false);}
  }

  async function toggleAdmin(a:AdminUser){
    if(!confirm(`${a.is_active?'Disable':'Enable'} ${a.name}'s account?`)) return;
    const r=await fetch('/api/admin/users',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:a.id,is_active:!a.is_active})});
    const d=await r.json(); if(!r.ok){setError(d.error||'Unable to update account');return;} setAdmins(list=>list.map(x=>x.id===a.id?d.admin:x));
  }

  async function removeAdmin(a:AdminUser){
    if(!confirm(`Delete the admin account for ${a.name}? This cannot be undone.`)) return;
    const r=await fetch('/api/admin/users',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:a.id})});
    const d=await r.json(); if(!r.ok){setError(d.error||'Unable to delete account');return;} setAdmins(list=>list.filter(x=>x.id!==a.id));
  }

  return <main className="adminShell"><aside className="sidebar"><div className="sidebarBrand"><img src="/khmc-logo.png" alt="KivuHills Medical Center"/></div><div className="sideLabel">WORKSPACE</div><nav><a className="navItem" href="/admin"><span className="navIcon">⌂</span><span>Dashboard</span></a><a className="navItem active" href="/admin/users"><span className="navIcon">♙</span><span>Admin users</span></a></nav></aside><section className="adminMain"><header className="topbar"><span className="topContext">Administration / Admin users</span><div className="topActions"><a href="/admin">Dashboard</a><a href="/">Patient Form</a></div></header><div className="content"><section className="dashboardHero"><div><div className="eyebrow">KHMC • ACCESS MANAGEMENT</div><h1>Admin users</h1><p>Give each administrator their own secure login credentials.</p></div><div className="heroActions"><button className="outlineButton" onClick={load}>↻ Refresh</button></div></section><section className="workspace"><div className="workspaceHead"><div><h2>Create an admin account</h2><p>Passwords are securely hashed and are never displayed.</p></div></div><form onSubmit={addAdmin} className="adminUserForm"><label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Jane Doe" required/></label><label>Username<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. jane.doe" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required/></label><button className="primaryButton" type="submit" disabled={saving}>{saving?'Creating…':'Create admin'}</button></form>{message&&<div className="successBox">{message}</div>}{error&&<div className="error">{error}</div>}</section><section className="workspace"><div className="workspaceHead"><div><h2>Administrator accounts</h2><p>{admins.length} account{admins.length===1?'':'s'}</p></div></div>{loading?<div className="empty"><h2>Loading accounts…</h2></div>:admins.length===0?<div className="empty"><h2>No admin accounts yet</h2><p>Create the first account above.</p></div>:<div className="tableWrap"><table><thead><tr><th>NAME</th><th>USERNAME</th><th>STATUS</th><th>CREATED</th><th>ACTIONS</th></tr></thead><tbody>{admins.map(a=><tr key={a.id}><td><strong>{a.name}</strong></td><td>{a.username}</td><td><span className={`departmentPill ${a.is_active?'':'inactivePill'}`}>{a.is_active?'Active':'Disabled'}</span></td><td>{new Date(a.created_at).toLocaleDateString()}</td><td><button className="outlineButton smallButton" onClick={()=>toggleAdmin(a)}>{a.is_active?'Disable':'Enable'}</button>{admins.length>1&&<button className="delete" onClick={()=>removeAdmin(a)}>Delete</button>}</td></tr>)}</tbody></table></div>}</section><footer>© {new Date().getFullYear()} KivuHills Medical Center • Administration</footer></div></section></main>;
}
