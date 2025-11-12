import { useEffect } from 'react';

export default function ImageLightbox({ images = [], index = 0, onClose }) {
  const [i, setI] = React.useState(index);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') setI(v => (v + 1) % images.length);
      if (e.key === 'ArrowLeft') setI(v => (v - 1 + images.length) % images.length);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  if (!images.length) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,.85)',
        zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'
      }}
    >
      <img
        src={images[i]}
        alt=""
        style={{ maxWidth:'90vw', maxHeight:'90vh', objectFit:'contain', boxShadow:'0 10px 30px rgba(0,0,0,.5)' }}
        onClick={e => e.stopPropagation()}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setI(v => (v - 1 + images.length) % images.length); }}
            style={{ position:'fixed', left:20, top:'50%', transform:'translateY(-50%)', background:'transparent', color:'#fff', border:'1px solid #fff', borderRadius:999, padding:'6px 10px', cursor:'pointer' }}
          >‹</button>
          <button
            onClick={e => { e.stopPropagation(); setI(v => (v + 1) % images.length); }}
            style={{ position:'fixed', right:20, top:'50%', transform:'translateY(-50%)', background:'transparent', color:'#fff', border:'1px solid #fff', borderRadius:999, padding:'6px 10px', cursor:'pointer' }}
          >›</button>
        </>
      )}
      <button
        onClick={onClose}
        style={{ position:'fixed', top:16, right:16, background:'transparent', color:'#fff', border:'1px solid #fff', borderRadius:999, padding:'4px 10px', cursor:'pointer' }}
      >Close</button>
    </div>
  );
}