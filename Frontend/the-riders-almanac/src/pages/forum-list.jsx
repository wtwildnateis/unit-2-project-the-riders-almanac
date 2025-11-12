import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { feed } from '../lib/forumApi';
import { useAuthStore } from '../stores/auth';
import PostComposer from '../components/Forum/PostComposer';

import TagPicker from '../components/Forum/TagPicker';
import TagChips from '../components/Forum/TagChips';
import TagManager from '../components/Forum/TagManager';
import { useAuthStoreRoles } from '../stores/auth';
import { PostImagesPreview } from '../components/Forum/PostImagesPreview';



export default function ForumList() {
    const [page, setPage] = useState(0);
    const [data, setData] = useState({ items: [], page: 0, size: 20, total: 0 });

    const [filterTags, setFilterTags] = useState([]);


    const { user } = useAuthStore();
    const { hasAnyRole } = useAuthStoreRoles();

    async function load(p = page) {
        try {
            setData(await feed({ page: p, size: 20, tags: filterTags.map(t => t.slug ?? t), match: 'OR' }));
        } catch (e) { console.error(e); }
    }

    useEffect(() => { load(0); setPage(0); }, [filterTags]); // initial + tags

    return (
        <div className="universalpagecontainer">
            <h1>Forum</h1>

            {/* Filter bar */}
            <div style={{ margin: '12px 0', padding: 12, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
                <div style={{ display: 'grid', gap: 8 }}>
                    <TagPicker value={filterTags} onChange={setFilterTags} placeholder="Filter by tag(s)..." />
                    <TagChips tags={filterTags} onRemove={(t) => setFilterTags(filterTags.filter(x => (x.slug ?? x) !== (t.slug ?? t)))} />                </div>
            </div>

            {user && (
                <>
                    <PostComposer onCreated={() => load(0)} />
                    {/* Staff-only Tag Manager */}
                    <TagManager hasAnyRole={hasAnyRole} />
                </>
            )}

            <ul>
                {data.items.map(p => (
                    <li key={p.id} style={{ margin: '12px 0', padding: 12, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <Link to={`/forum/${p.id}`} style={{ fontWeight: 600 }}>{p.title}</Link>
                            <span style={{ fontSize: 12, opacity: .7 }}>{new Date(p.createdAt).toLocaleString()}</span>
                        </div>
                        {Array.isArray(p.tags) && p.tags.length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {p.tags.map(t => (
                                    <span key={t.slug} style={{ fontSize: 12, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 999, padding: '2px 8px' }}>
                                        {t.label}
                                    </span>
                                ))}

                            </div>
                        )}
                        {Array.isArray(p.images) && p.images.length > 0 && (
                            <PostImagesPreview urls={p.images} />
                        )}
                    </li>
                ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button onClick={() => { const n = Math.max(0, page - 1); setPage(n); load(n); }} disabled={page <= 0}>Prev</button>
                <span style={{ fontSize: 12, opacity: .7 }}>Page {data.page + 1} / {Math.max(1, Math.ceil(data.total / data.size))}</span>
                <button
                    onClick={() => { const n = page + 1; setPage(n); load(n); }}
                    disabled={((data.page + 1) * data.size) >= data.total}
                >
                    Next
                </button>
            </div>
        </div>
    );
}