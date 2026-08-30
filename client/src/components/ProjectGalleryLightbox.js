'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Close on Escape key
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex]);

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

  const lightbox = lightboxIndex !== null && (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      overflowY: 'auto',
      padding: '2rem 0'
    }} onClick={closeLightbox}>
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={closeLightbox}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', zIndex: 10004, borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          <X size={24} />
        </button>
        {galleryItems.length > 1 && (
          <button 
            onClick={prevImage}
            style={{ position: 'absolute', left: '15px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', borderRadius: '50%', padding: '12px', zIndex: 10003, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        <img 
          src={galleryItems[lightboxIndex].imageUrl || galleryItems[lightboxIndex].image || galleryItems[lightboxIndex].image_url} 
          alt={galleryItems[lightboxIndex].title} 
          style={{ maxWidth: '95vw', maxHeight: '70vh', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
        />

        {galleryItems.length > 1 && (
          <button 
            onClick={nextImage}
            style={{ position: 'absolute', right: '15px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', borderRadius: '50%', padding: '12px', zIndex: 10003, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', padding: '40px 20px 25px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10002 }} onClick={(e) => e.stopPropagation()}>
        {galleryItems[lightboxIndex].title && (
          <div style={{ color: '#fff', textAlign: 'center', fontSize: '1.25rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {galleryItems[lightboxIndex].title}
          </div>
        )}
        {galleryItems[lightboxIndex].description && (
          <div style={{ color: 'rgba(255,255,255,0.95)', textAlign: 'center', marginTop: '8px', fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.5, textShadow: '0 1px 2px rgba(0,0,0,0.8)', overflowY: 'auto', maxHeight: '20vh' }}>
            {galleryItems[lightboxIndex].description}
          </div>
        )}
      </div>
    </div>
  );

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

      {typeof document !== 'undefined' && lightbox && createPortal(lightbox, document.body)}
    </>
  );
}

