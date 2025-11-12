import { useState } from 'react';
import ImageLightbox from './ImageLightbox';

export function PostImagesPreview({ urls = [] }) {
  const [lightbox, setLightbox] = useState({ open:false, index:0 });

  const thumbs = urls.slice(0, 3);
  const extra = urls.length - thumbs.length;

  return (
    <div style={{ marginTop:8 }}>
      <div style={{
        display:'grid',
        gridTemplateColumns: thumbs.length >= 2 ? '1fr 1fr 1fr' : '1fr',
        gap:6
      }}>
        {thumbs.map((u, idx) => (
          <div
            key={u}
            onClick={() => setLightbox({ open:true, index:idx })}
            style={{ position:'relative', borderRadius:8, overflow:'hidden', border:'1px solid #e5e7eb', cursor:'zoom-in', aspectRatio:'1 / 1' }}
          >
            <img src={u} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            {idx === 2 && extra > 0 && (
              <div style={{
                position:'absolute', inset:0, background:'rgba(0,0,0,.45)',
                display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700
              }}>+{extra}</div>
            )}
          </div>
        ))}
      </div>

      {lightbox.open && (
        <ImageLightbox
          images={urls}
          index={lightbox.index}
          onClose={() => setLightbox({ open:false, index:0 })}
        />
      )}
    </div>
  );
}