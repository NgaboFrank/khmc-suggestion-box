'use client';

import { FormEvent, useState } from 'react';

export default function AdminLoginPage(){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault(); setLoading(true); setError('');
    try{
      const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
      const d=await r.json();
      if(!r.ok){setError(d.error||'Login failed');return;}
      window.location.href='/admin';
    }catch(e){setError(e instanceof Error?e.message:'Login failed');}
    finally{setLoading(false);}
  }

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f3f5f8',fontFamily:'Arial,sans-serif'}}><section style={{width:'100%',maxWidth:920,minHeight:560,display:'grid',gridTemplateColumns:'46% 54%',overflow:'hidden',background:'#fff',borderRadius:24,boxShadow:'0 24px 60px rgba(15,30,50,.16)'}}><div style={{padding:'40px 48px',display:'flex',flexDirection:'column',background:'#fff'}}><img src="/khmc-logo.png" alt="KivuHills Medical Center" style={{width:230,height:125,objectFit:'contain',objectPosition:'left center',marginBottom:42}}/><div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:'#64748b',marginBottom:8}}>KHMC ADMINISTRATION</div><h1 style={{fontSize:34,lineHeight:1.1,color:'#172033',margin:'0 0 12px'}}>Admin Dashboard</h1><p style={{color:'#64748b',lineHeight:1.6,fontSize:13,margin:0}}>Sign in securely to review and manage patient feedback.</p><div style={{marginTop:'auto'}}><div style={{fontSize:13,fontWeight:750,color:'#172033',marginBottom:5}}>Secure Access</div><p style={{fontSize:12,color:'#64748b',margin:'0 0 10px'}}>Sign in securely to review and manage patient feedback.</p><a href="/" style={{color:'#2164e8',fontSize:12,fontWeight:650,textDecoration:'none'}}>← Back to patient form</a></div></div><div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 48px',background:'#fff'}}><form onSubmit={submit} style={{width:'100%',maxWidth:400,display:'grid',gap:18}}><label style={{display:'grid',gap:8,color:'#172033',fontSize:12,fontWeight:700}}>Admin email<input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin@khmc.com" autoComplete="username" required style={{width:'100%',boxSizing:'border-box',height:46,border:'1px solid #cbd5e1',borderRadius:8,background:'#eef4ff',color:'#172033',padding:'0 14px',fontSize:13,outline:'none'}}/></label><label style={{display:'grid',gap:8,color:'#172033',fontSize:12,fontWeight:700}}>Admin password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required style={{width:'100%',boxSizing:'border-box',height:46,border:'1px solid #cbd5e1',borderRadius:8,background:'#eef4ff',color:'#172033',padding:'0 14px',fontSize:13,outline:'none'}}/></label>{error&&<div style={{padding:10,borderRadius:8,background:'#fff0f0',color:'#b42318',fontSize:12}}>{error}</div>}<button disabled={loading} type="submit" style={{height:46,border:0,borderRadius:8,background:'#2164e8',color:'#fff',fontSize:13,fontWeight:750,cursor:'pointer'}}>{loading?'Signing in…':'Sign in to dashboard'}</button></form></div></section></main>;
}
