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

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f4f8f5',fontFamily:'Arial,sans-serif'}}><section style={{width:'100%',maxWidth:430,background:'#fff',border:'1px solid #dbe7df',borderRadius:20,padding:32,boxShadow:'0 18px 50px rgba(0,60,40,.08)'}}><img src="/khmc-logo.png" alt="KivuHills Medical Center" style={{width:150,height:75,objectFit:'contain',objectPosition:'left center',marginBottom:10}}/><div style={{fontSize:12,fontWeight:800,letterSpacing:2,color:'#12834c'}}>KHMC ADMINISTRATION</div><h1 style={{fontSize:32,color:'#063d2b',margin:'8px 0'}}>Admin sign in</h1><p style={{color:'#60766b',lineHeight:1.5}}>Use your own administrator username and password.</p><form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}><label style={{display:'grid',gap:7,fontWeight:700,color:'#173f31'}}>Username<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" autoComplete="username" required style={{padding:'13px 14px',border:'1px solid #cbd9d1',borderRadius:10,fontSize:16}}/></label><label style={{display:'grid',gap:7,fontWeight:700,color:'#173f31'}}>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required style={{padding:'13px 14px',border:'1px solid #cbd9d1',borderRadius:10,fontSize:16}}/></label>{error&&<div style={{padding:12,borderRadius:10,background:'#fff0f0',color:'#b42318'}}>{error}</div>}<button disabled={loading} type="submit" style={{padding:'14px 16px',border:0,borderRadius:10,background:'#12834c',color:'#fff',fontWeight:800,fontSize:15,cursor:'pointer'}}>{loading?'Signing in…':'Sign in'}</button></form><div style={{display:'flex',justifyContent:'space-between',marginTop:20,fontSize:14}}><a href="/" style={{color:'#12834c'}}>Patient form</a><a href="/admin" style={{color:'#12834c'}}>Dashboard</a></div></section></main>;
}
