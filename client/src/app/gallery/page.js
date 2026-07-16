'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSiteContent } from '../admin/actions';

export default function Gallery() {
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    async function loadData() {
      const content = await getSiteContent();
      setSiteContent(content);
    }
    loadData();
  }, []);

  if (!siteContent) return <div>Loading...</div>;

  const { gallery } = siteContent;

  return (
    <>
      <section className="gallery-intro page-hero text-center">
        <h1>{gallery.title || 'Our Gallery'}</h1>
        <p className="intro-text">
          {gallery.description || 'A collection of moments from our events, projects, trainings, and community activities.'}
        </p>
      </section>

      <section className="gallery-section">
        <div className="gallery-grid">
          {gallery.items.map((item, index) => (
            <div className="gallery-item" key={index}>
              <a href={item.image} title={item.title}>
                <img src={item.image} alt={item.alt || item.title} />
                <div className="overlay">
                  <span className="overlay-title">{item.title}</span>
                  {item.description && <p className="overlay-desc" style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>{item.description}</p>}
                  <span className="overlay-action" style={{ marginTop: '0.5rem' }}>View Image</span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="gallery-cta text-center">
        <h2>Want to Be Part of These Moments?</h2>
        <p className="intro-text">
          Join our trainings and events, volunteer during outreach, or partner with SER to strengthen community readiness.
        </p>

        <div className="cta-actions">
          <Link href="/events" className="btn">View Events</Link>
          <Link href="/contact" className="btn btn-accent">Contact SER</Link>
        </div>
      </section>
    </>
  );
}
