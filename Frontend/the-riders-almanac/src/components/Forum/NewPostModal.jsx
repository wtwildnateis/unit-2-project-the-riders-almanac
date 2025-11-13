import { useEffect, useRef, useState } from "react";
import { createPost, listTags } from "../../lib/forumApi";

export default function NewPostModal({ open, onClose, onCreated }) {
  const panelRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    (async () => {
      try {
        const tags = await listTags();
        setAllTags(tags || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const overlayClick = (e) => {
    if (!panelRef.current) return;
    if (!panelRef.current.contains(e.target)) onClose?.();
  };

  const toggleTag = (slug) =>
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const onPickFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length) setFiles((prev) => [...prev, ...list]);
    e.currentTarget.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const list = Array.from(e.dataTransfer?.files || []);
    if (list.length) setFiles((prev) => [...prev, ...list]);
  };

  async function submit(e) {
    e?.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("body", body.trim());
      selected.forEach((slug) => form.append("tags", slug));
      files.forEach((f) => form.append("images", f));
      const created = await createPost(form);
      onCreated?.(created);
      setTitle(""); setBody(""); setFiles([]); setSelected([]);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Couldn't create post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    
    <div
      role="dialog"
      aria-label="Create Post"
      onMouseDown={overlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(2px)",
        padding: 16,
      }}
    >
      <div
        ref={panelRef}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(680px, 96vw)",                 // slimmer
          maxHeight: "88vh",                          // prevents huge panel
          background: "var(--panel)",
          color: "var(--ink)",
          border: "1px solid var(--ring)",
          borderRadius: 24,
          boxShadow: "0 24px 70px rgba(0,0,0,.55)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",         // header | scroller | footer
          overflow: "hidden", 
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid var(--grid)",
            
          }}
        >
          <h2 style={{ margin: 0, fontSize: 26, letterSpacing: .4 }}>Create Post</h2>
          <button className="np-x ra-pillbtn ra-pillbtn--icon" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ paddingLeft: "9px"}}>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body (single inner scroller) */}
        <form
          onSubmit={submit}
          style={{
            overflow: "auto",                       // only this scrolls
            padding: 18,                            
            display: "grid",
            gap: 14,
                      overflowX: "hidden",                       

          }}
        >
          <label className="fld">
            <div className="lbl">Title</div>
            <input
              className="inp"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="fld">
            <div className="lbl">Body</div>
            <textarea
              className="inp"
              placeholder="Say something…"
              rows={9}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </label>

          {/* Tags */}
          <div className="fld">
            <div className="lbl">Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allTags.map((t) => {
                const slug = t.slug || t.name || t.label;
                const on = selected.includes(slug);
                return (
                  <button
                    type="button"
                    key={slug}
                    onClick={() => toggleTag(slug)}
                    className={`post-chip ${on ? "is-on" : ""}`}
                    style={{
                      borderRadius: 999,
                      padding: "8px 12px",
                      border: "1px solid var(--grid)",
                      background: on ? "rgba(166,217,138,.12)" : "transparent",
                      color: "var(--ink)",
                    }}
                    aria-pressed={on}
                    title={`#${t.label || slug}`}
                  >
                    #{t.label || slug}
                  </button>
                );
              })}
              {!allTags.length && <div className="dim">No tags yet.</div>}
            </div>
          </div>

          {/* Photos */}
          <div className="fld">
            <div className="lbl">Photos</div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              style={{
                border: `1px ${dragOver ? "solid" : "dashed"} var(--grid)`,
                borderRadius: "var(--radius)",
                padding: 14,
                display: "grid",
                gap: 10,
                background: dragOver ? "rgba(166,217,138,.06)" : "linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01))",
              }}
            >
              <label className="ra-pillbtn" style={{ width: "fit-content", cursor: "pointer" }}>
                <input type="file" multiple onChange={onPickFiles} style={{ display: "none" }} />
                Choose Files
              </label>
              {!!files.length ? (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                  {files.map((f, i) => (
                    <li
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        border: "1px solid var(--grid)",
                        borderRadius: 10,
                        background: "rgba(0,0,0,.2)",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.name}
                      </span>
                      <button
                        type="button" 
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="ra-pillbtn ra-pillbtn--icon"
                        aria-label="Remove file" 
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="dim">or drag & drop here</span>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: 12,                         // breathing room bottom
            borderTop: "1px solid var(--grid)",
          }}
        >
          <button className="ra-pillbtn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ra-pillbtn ra-pillbtn--primary"
            onClick={submit}
            disabled={busy || !title.trim() || !body.trim()}
          >
            {busy ? "Posting…" : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}