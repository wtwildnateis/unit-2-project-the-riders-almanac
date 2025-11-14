import { useState } from 'react';
import { login, me } from '../lib/authApi';
import { useAuthStore } from '../stores/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const nav = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [form, setForm] = useState({ login: '', password: '' });
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await login(form);   
      setToken(res.token);             // store token
      const profile = await me();      // get user { id, username, roles: [...] }
      setUser(profile);                // store user with roles


      nav('/home');
    } catch (e) {
      setErr('Invalid credentials');
    }
  }

  return (
    <div className="universalpagecontainer">
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <input placeholder="Email or Username" value={form.login}
          onChange={e=>setForm(f=>({...f, login:e.target.value}))}/>
        <input type="password" placeholder="Password" value={form.password}
          onChange={e=>setForm(f=>({...f, password:e.target.value}))}/>
        {err && <p style={{color:'crimson'}}>{err}</p>}
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}