import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, listComments, addComment } from '../lib/forumApi';

export default function ForumPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [page, setPage] = useState(0);
  const [comments, setComments] = useState({ items:[], page:0, size:20, total:0 });
  const [text, setText] = useState('');

  useEffect(() => {
    getPost(id).then(setPost);
  }, [id]);

  useEffect(() => {
    listComments(id, { page, size:20 }).then(setComments);
  }, [id, page]);

  async function onAdd(e){
    e.preventDefault();
    if (!text.trim()) return;
    await addComment({ postId: Number(id), body: text });
    setText('');
    const fresh = await listComments(id, { page: 0, size: 20 });
    setComments(fresh);
    setPage(0);
  }

  if (!post) return <div className="universalpagecontainer">Loading…</div>;

  return (
    <div className="universalpagecontainer">
      <h2>{post.title}</h2>
      <p>{post.body}</p>

      <h3 style={{marginTop:24}}>Comments</h3>
      <ul>
        {comments.items.map(c => (
          <li key={c.id}>
            <b>{c.authorUsername}</b>: {c.body}
          </li>
        ))}
      </ul>
      <div style={{marginTop:16}}>
        <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span style={{margin:'0 8px'}}>Page {page+1}</span>
        <button disabled={(page+1)*comments.size >= comments.total} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>

      <form onSubmit={onAdd} style={{marginTop:24}}>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment…" />
        <div><button type="submit">Post Comment</button></div>
      </form>
    </div>
  );
}