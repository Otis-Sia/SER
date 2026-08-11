import Link from 'next/link';
import Image from 'next/image';
import { ShieldAlert, FireExtinguisher, HeartPulse, Leaf, Users } from 'lucide-react';
import { getSiteContent, getProjects, getGalleryItems } from '../admin/actions';

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'Our Projects | Scouts Emergency Response';
  const description = 'Explore community emergency initiatives, first aid training campaigns, and youth safety programs led by Scouts Emergency Response.';
  const rawImage = siteContent.siteMeta?.projectsHeroBgImage;
  const heroImage = (rawImage && (rawImage.endsWith('.jpg') || rawImage.endsWith('.png') || rawImage.startsWith('http')))
    ? rawImage
    : '/assets/images/backgrounds/scouts_hero_bg.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/projects',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: 'Scouts Emergency Response Projects',
        },
      ],
    },
    alternates: {
      canonical: '/projects',
    },
  };
}

export default async function Projects() {
  const siteContent = await getSiteContent();
  const projects = await getProjects();
  const galleryItems = await getGalleryItems();

  return (
    <>
      <section 
        className="project-intro page-hero text-center"
        style={siteContent.siteMeta?.projectsHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.projectsHeroBgImage})` } : {}}
      >
        <h1>{siteContent.projects?.title || "Our Projects"}</h1>
        <p className="intro-text">
          {siteContent.projects?.description || "Explore community emergency initiatives and programs led by Scouts Emergency Response."}
        </p>
      </section>

      <section className="project-section">
        <h2>Ongoing &amp; Past Projects</h2>

        <div className="product-grid">
          {projects.map((project, index) => (
            <div className="product-card" key={project.id || index}>
              <div className="product-card-info">
                <h3>{project.title}</h3>
                <p><strong>Focus:</strong> {project.focus}</p>
                <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: project.description }} />
                {project.link && (
                  <Link href={project.link} className="btn">{project.linkText || 'Learn More'}</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="gallery-section" style={{ marginTop: '4rem' }} id="gallery">
        <h2 className="text-center" style={{ marginBottom: '2rem' }}>Project Gallery</h2>
        <div className="gallery-grid">
          {galleryItems.filter(item => !item.hidden).map((item, index) => (
            <div className="gallery-item" key={item.id || index}>
              <a href={item.imageUrl || item.image} title={item.title} style={{ position: 'relative', display: 'block', width: '100%', height: '100%', minHeight: '240px' }}>
                <Image 
                  src={item.imageUrl || item.image} 
                  alt={item.alt || item.title || `SER Event photo ${index + 1}`} 
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 350px"
                  quality={75}
                  style={{ objectFit: 'cover' }}
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
          ))}
        </div>
      </section>

      <section className="project-cta text-center">
        <h2>Want SER in Your School or Community?</h2>
        <p className="intro-text">
          SER works with schools, Scout groups, and community partners to run trainings, workshops, and preparedness programs. Tell us what you need and we&apos;ll plan together.
        </p>

        <div className="cta-actions">
          <Link href="/contact" className="btn btn-accent">Contact SER</Link>
          <Link href="/events" className="btn">Upcoming Events</Link>
        </div>
      </section>
    </>
  );
}
