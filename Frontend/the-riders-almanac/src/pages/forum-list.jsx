import { useEffect, useState } from 'react';
import { feed } from '../lib/forumApi';
import { Link } from 'react-router-dom';

export default function ForumList() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ items:[], page:0, size:20, total:0 });

  useEffect(() => {
    feed({ page, size:20 }).then(setData).catch(console.error);
  }, [page]);

  return (
    <div className="universalpagecontainer">
      <h1>Forum</h1>
      <ul>
        {data.items.map(p => (
          <li key={p.id}>
            <Link to={`/forum/${p.id}`}>{p.title}</Link>
            <small style={{marginLeft:8}}>by {p.authorUsername}</small>
          </li>
        ))}
      </ul>
      <div style={{marginTop:16}}>
        <button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span style={{margin:'0 8px'}}>Page {page+1}</span>
        <button disabled={(page+1)*data.size >= data.total} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  );
}