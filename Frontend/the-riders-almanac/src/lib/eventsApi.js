import api from './api';

export async function listEvents({ from, to }={}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await api.get('/api/events', { params });
  return data; // EventResponse[]
}

export async function createEvent(body) {
  const { data } = await api.post('/api/events', body);
  return data;
}

export async function updateEvent(id, body) {
  const { data } = await api.put(`/api/events/${id}`, body);
  return data;
}

export async function deleteEvent(id) {
  await api.delete(`/api/events/${id}`);
}