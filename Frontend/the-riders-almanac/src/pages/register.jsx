import { useState } from 'react';
import { register, me } from '../lib/authApi';
import { useAuthStore } from '../stores/auth';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const nav = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await register(form); // { token, maybe user }
      setToken(res.token);
      const profile = await me();
      setUser(profile);

      nav('/home');
    } catch (e) {
      setErr('Registration failed');
    }
}

  return (
    <div className="universalpagecontainer">
      <h1>Create Account</h1>
      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <input placeholder="Username" value={form.username}
          onChange={e=>setForm(f=>({...f, username:e.target.value}))}/>
        <input placeholder="Email" value={form.email}
          onChange={e=>setForm(f=>({...f, email:e.target.value}))}/>
        <input type="password" placeholder="Password" value={form.password}
          onChange={e=>setForm(f=>({...f, password:e.target.value}))}/>
        {err && <p style={{color:'crimson'}}>{err}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}