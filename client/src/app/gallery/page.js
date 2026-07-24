import Link from 'next/link';
import { getSiteContent, getGalleryItems } from '../admin/actions';

export const metadata = {
  title: 'Media Gallery | Scouts Emergency Response',
  description: 'Explore photos and highlights from emergency training sessions, youth workshops, and disaster response drills organized by Scouts Emergency Response.',
  openGraph: {
    title: 'Media Gallery | Scouts Emergency Response',
    description: 'Explore photos and highlights from emergency training sessions, youth workshops, and disaster response drills.',
    url: '/gallery',
  },
  alternates: {
    canonical: '/gallery',
  },
};

export default async function Gallery() {
  const siteContent = await getSiteContent();
  const galleryItems = await getGalleryItems();
  const { gallery } = siteContent;

  return (
    <>
      <section className="gallery-intro page-hero text-center">
        <h1>{gallery?.title || 'Our Gallery'}</h1>
        <p className="intro-text">
          {gallery?.description || 'A collection of moments from our events, projects, trainings, and community activities.'}
        </p>
      </section>

      <section className="gallery-section">
        <div className="gallery-grid">
          {galleryItems.filter(item => !item.hidden).map((item, index) => (
            <div className="gallery-item" key={item.id || index}>
              <a href={item.imageUrl || item.image} title={item.title}>
                <img src={item.imageUrl || item.image} alt={item.alt || item.title || `SER Event photo ${index + 1}`} loading="lazy" />
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
          ))}
        </div>
      </section>

      <section className="gallery-cta text-center">
        <h2>Want to Be Part of These Moments?</h2>
        <p className="intro-text">
          Join our trainings and events, volunteer during outreach, or partner with SER to strengthen community readiness.
        </p>

        <div className="cta-actions">
          <Link href="/events" className="btn">
            View Events
          </Link>
          <Link href="/contact" className="btn btn-accent">
            Contact SER
          </Link>
        </div>
      </section>
    </>
  );
}
