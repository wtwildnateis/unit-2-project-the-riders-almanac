import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { getPost, listComments, addComment } from '../lib/forumApi';
import { useAuthStore } from '../stores/auth';
import { PostImagesPreview } from '../components/Forum/PostImagesPreview';

function timeAgo(iso) {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return `${Math.floor(s)}s ago`;
    const m = s / 60; if (m < 60) return `${Math.floor(m)}m ago`;
    const h = m / 60; if (h < 24) return `${Math.floor(h)}h ago`;
    const d = h / 24; return `${Math.floor(d)}d ago`;
}

export default function ForumDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/forum';
    const { user } = useAuthStore();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [busy, setBusy] = useState(false);
    const [body, setBody] = useState('');

    async function loadAll() {
        try {
            const p = await getPost(id);
            setPost(p);
            const cs = await listComments(id, { page: 0, size: 50 });
            setComments(cs.items ?? cs); // your API returns a page; handle both
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => { loadAll(); }, [id]);

    async function submitComment(e) {
        e.preventDefault();
        if (!body.trim()) return;
        setBusy(true);
        try {
            await addComment({ postId: Number(id), body: body.trim(), parentId: null });
            setBody('');
            await loadAll();
        } catch (e) {
            alert(e?.response?.data?.message || String(e));
        } finally {
            setBusy(false);
        }
    }

    if (!post) {
        return (
            <div className="universalpagecontainer" style={{ color: '#e5e7eb' }}>
                <p>Loading…</p>
            </div>
        );
    }

    return (
        <div className="universalpagecontainer" style={{ color: '#e5e7eb' }}>
            <div style={{
                position: 'sticky', top: 0, zIndex: 5,
                backdropFilter: 'blur(6px)',
                background: 'rgba(11,15,20,0.65)',
                borderBottom: '1px solid #111827',
                margin: '-8px 0 12px', padding: '8px 0 6px'
            }}>
                <button
                    onClick={() => navigate(from)}
                    style={{
                        border: '1px solid #1f2937', background: '#0b0f14', color: '#9ca3af',
                        borderRadius: 10, padding: '6px 10px', cursor: 'pointer'
                    }}
                >
                    ← Back
                </button>
            </div>

            {/* Title / meta */}
            <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
                <h1 style={{ margin: '6px 0' }}>{post.title}</h1>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    by <strong style={{ color: '#e5e7eb' }}>{post.authorUsername}</strong> · {timeAgo(post.createdAt)}
                </div>
                {post.locked && (
                    <div style={{ fontSize: 13, color: '#fbbf24' }}>
                        🔒 This post is locked by moderators.
                    </div>
                )}
            </div>

            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {post.tags.map(t => (
                        <span
                            key={t.slug ?? t.id}
                            style={{
                                fontSize: 12, color: '#9ae6b4',
                                background: 'rgba(16,185,129,.08)',
                                border: '1px solid rgba(16,185,129,.2)',
                                padding: '2px 8px', borderRadius: 999
                            }}
                        >
                            #{t.label}
                        </span>
                    ))}
                </div>
            )}


            {/* Body */}
            {post.body && (
                <div
                    style={{
                        whiteSpace: 'pre-wrap',
                        background: '#0b0f14',
                        border: '1px solid #111827',
                        borderRadius: 12, padding: 14, marginTop: 8
                    }}
                >
                    {post.body}
                </div>
            )}

            {/* Attachments (small squares, only if present) */}
            {Array.isArray(post.images) && post.images.length > 0 && (
                <section style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Attachments</div>
                    <PostImagesPreview urls={post.images} variant="compact" />
                </section>
            )}

            {/* Comments */}
            <section style={{ marginTop: 18 }}>
                <h3 style={{ margin: '10px 0' }}>Comments</h3>

                {user && !post.locked && (
                    <form onSubmit={submitComment} style={{ marginBottom: 12, display: 'grid', gap: 8 }}>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Write a comment…"
                            rows={3}
                            style={{ padding: '8px 10px', border: '1px solid #1f2937', borderRadius: 10, background: '#0b0f14', color: '#e5e7eb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button disabled={busy || !body.trim()} style={{ background: '#10b981', color: '#06251a', border: '1px solid #065f46', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 }}>
                                {busy ? 'Posting…' : 'Post comment'}
                            </button>
                        </div>
                    </form>
                )}

                <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                    {comments.map(c => (
                        <li key={c.id} style={{ background: '#0b0f14', border: '1px solid #111827', borderRadius: 12, padding: 12 }}>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
                                <strong style={{ color: '#e5e7eb' }}>{c.authorUsername}</strong> · {timeAgo(c.createdAt)}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap' }}>{c.body}</div>
                        </li>
                    ))}
                    {!comments.length && <li style={{ color: '#94a3b8' }}>No comments yet.</li>}
                </ul>
            </section>
        </div>
    );
}
