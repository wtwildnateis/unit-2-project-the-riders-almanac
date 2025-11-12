import { Link } from 'react-router-dom';

// tiny helper until you add real avatars
function Avatar({ name }) {
  const letter = (name || '?').slice(0,1).toUpperCase();
  return (
    <div style={{
      width:36, height:36, borderRadius:'50%',
      background:'#1f2937', color:'#9ca3af',
      display:'grid', placeItems:'center', fontWeight:700
    }}>
      {letter}
    </div>
  );
}

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime())/1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  const m = s/60; if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m/60; if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h/24; return `${Math.floor(d)}d ago`;
}

export default function PostListItem({ post }) {
  // post: {id,title,authorUsername,createdAt,tags,images}
  return (
    <li
      style={{
        listStyle:'none',
        background:'#0b0f14', border:'1px solid #111827',
        borderRadius:12, padding:14, display:'grid', gap:8
      }}
    >
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <Avatar name={post.authorUsername} />
        <div style={{ minWidth:0 }}>
          <Link to={`/forum/${post.id}`} state={{ from: '/forum' }}
            style={{ fontWeight:700, color:'#e5e7eb', textDecoration:'none' }}
          >
            {post.title}
          </Link>
          <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>
            {post.authorUsername} · {timeAgo(post.createdAt)}
          </div>
        </div>
        {/* right-side minimal counter or thumbnail could go here later */}
      </div>

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginLeft:48 }}>
          {post.tags.map(t => (
            <span
              key={t.slug ?? t.id}
              style={{
                fontSize:12, color:'#9ae6b4',
                background:'rgba(16,185,129,.08)',
                border:'1px solid rgba(16,185,129,.2)',
                padding:'2px 8px', borderRadius:999
              }}
            >
              #{t.label}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}