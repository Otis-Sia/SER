'use client';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectGalleryLightbox({ galleryItems }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index, e) => {
    e.preventDefault();
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  if (!galleryItems || galleryItems.length === 0) {
    return (
      <p className="intro-text text-center" style={{ opacity: 0.7 }}>
        No gallery items uploaded yet.
      </p>
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {galleryItems.map((item, index) => {
          const imgSrc = item.imageUrl || item.image || item.image_url;
          return (
            <div className="gallery-item" key={item.id || index}>
              <a
                href={imgSrc}
                onClick={(e) => openLightbox(index, e)}
                title={item.title}
                style={{ position: 'relative', display: 'block', width: '100%' }}
              >
                <img 
                  src={imgSrc} 
                  alt={item.alt || item.title || `SER Event photo ${index + 1}`} 
                  loading="lazy"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
                <div className="overlay">
                  <span className="overlay-title">{item.title}</span>
                  {item.description && (
                    <p className="overlay-desc" style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>
                      {item.description}
                    </p>
                  )}
                  <span className="overlay-action" style={{ marginTop: '0.5rem' }}>
                    View Image
                  </span>
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflowY: 'auto',
          padding: '2rem 0'
        }} onClick={closeLightbox}>
          <button 
            onClick={closeLightbox}
            style={{ position: 'fixed', top: '25px', right: '25px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', zIndex: 10000, borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          >
            <X size={24} />
          </button>
          
          {galleryItems.length > 1 && (
            <button 
              onClick={prevImage}
              style={{ position: 'fixed', left: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', borderRadius: '50%', padding: '12px', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <div style={{ position: 'relative', width: '85%', maxWidth: '800px', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={galleryItems[lightboxIndex].imageUrl || galleryItems[lightboxIndex].image || galleryItems[lightboxIndex].image_url} 
              alt={galleryItems[lightboxIndex].title} 
              style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            {galleryItems[lightboxIndex].title && (
              <div style={{ color: '#fff', textAlign: 'center', marginTop: '20px', fontSize: '1.25rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {galleryItems[lightboxIndex].title}
              </div>
            )}
            {galleryItems[lightboxIndex].description && (
              <div style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: '8px', fontSize: '0.95rem', maxWidth: '100%', margin: '8px auto 0', lineHeight: 1.5, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {galleryItems[lightboxIndex].description}
              </div>
            )}
          </div>

          {galleryItems.length > 1 && (
            <button 
              onClick={nextImage}
              style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', borderRadius: '50%', padding: '12px', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
