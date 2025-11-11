import api from './api';

export async function register({ username, email, password }) {
  const { data } = await api.post('/api/auth/register', { username, email, password });
  return data; // { token, user? }
}

export async function login({ username, password }) {
  const { data } = await api.post('/api/auth/login', { username, password });
  return data; // { token, user }
}

export async function me() {
  const { data } = await api.get('/api/account/me');
  return data; // MeResponse
}

