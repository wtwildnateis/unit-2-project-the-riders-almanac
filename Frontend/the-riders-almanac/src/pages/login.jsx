import { useState } from 'react';
import { login, me } from '../lib/authApi';
import { useAuthStore } from '../stores/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const nav = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await login(form);   // likely { token }
      setToken(res.token);             // 1) store token so /me works
      const profile = await me();      // 2) get user { id, username, roles: [...] }
      setUser(profile);                // 3) store user with normalized roles

      if (import.meta.env.DEV) {
        console.log('AUTH DEBUG (after login):', useAuthStore.getState().user);
      }

      nav('/home');
    } catch (e) {
      setErr('Invalid credentials');
    }
  }
  
  return (
    <div className="universalpagecontainer">
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <input placeholder="Username" value={form.username}
          onChange={e=>setForm(f=>({...f, username:e.target.value}))}/>
        <input type="password" placeholder="Password" value={form.password}
          onChange={e=>setForm(f=>({...f, password:e.target.value}))}/>
        {err && <p style={{color:'crimson'}}>{err}</p>}
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}