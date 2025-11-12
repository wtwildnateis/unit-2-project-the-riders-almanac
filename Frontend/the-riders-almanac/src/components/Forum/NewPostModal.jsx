import { useEffect } from 'react';
import PostComposer from './PostComposer';

export default function NewPostModal({ open, onClose, onCreated }) {
  useEffect(() => {
    function onEsc(e){ if (e.key === 'Escape') onClose?.(); }
    if (open) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,.6)', display:'flex',
        alignItems:'flex-start', justifyContent:'center', padding:'6vh 16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'min(760px, 100%)', background:'#0b0f14',
          border:'1px solid #111827', borderRadius:14, padding:16
        }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <h3 style={{ margin:0, color:'#e5e7eb' }}>Create Post</h3>
          <button onClick={onClose} style={{ background:'transparent', color:'#9ca3af', border:'none', fontSize:18, cursor:'pointer' }}>×</button>
        </div>
        <PostComposer
          onCreated={onCreated}
        />
      </div>
    </div>
  );
}