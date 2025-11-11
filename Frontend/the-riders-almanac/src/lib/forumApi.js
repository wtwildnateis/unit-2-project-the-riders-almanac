import api from './api';

export async function feed({ page=0, size=20 }={}) {
  const { data } = await api.get('/api/forum/posts', { params:{ page, size }});
  return data; // PageResponse<PostResponse>
}

export async function getPost(id) {
  const { data } = await api.get(`/api/forum/posts/${id}`);
  return data;
}

export async function createPost(body) {
  const { data } = await api.post('/api/forum/posts', body);
  return data;
}

export async function updatePost(id, body) {
  const { data } = await api.put(`/api/forum/posts/${id}`, body);
  return data;
}

export async function deletePost(id) {
  await api.delete(`/api/forum/posts/${id}`);
}

export async function listComments(postId, {page=0,size=20}={}) {
  const { data } = await api.get(`/api/forum/posts/${postId}/comments`, { params:{ page, size }});
  return data; // PageResponse<CommentResponse>
}

export async function addComment(body) {
  const { data } = await api.post('/api/forum/comments', body);
  return data;
}

export async function updateComment(id, body) {
  const { data } = await api.put(`/api/forum/comments/${id}`, body);
  return data;
}

export async function deleteComment(id) {
  await api.delete(`/api/forum/comments/${id}`);
}