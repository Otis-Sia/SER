import Link from 'next/link';
import { ShieldAlert, FireExtinguisher, HeartPulse, Leaf, Users } from 'lucide-react';
import { getSiteContent, getProjects } from '../admin/actions';

export const metadata = {
  title: 'Our Projects | Scouts Emergency Response',
  description: 'Explore community emergency initiatives, first aid training campaigns, and youth safety programs led by Scouts Emergency Response.',
  openGraph: {
    title: 'Our Projects | Scouts Emergency Response',
    description: 'Explore community emergency initiatives, first aid training campaigns, and youth safety programs led by Scouts Emergency Response.',
    url: '/projects',
  },
  alternates: {
    canonical: '/projects',
  },
};

export default async function Projects() {
  const siteContent = await getSiteContent();
  const projects = await getProjects();

  return (
    <>
      <section className="project-intro page-hero text-center">
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
                <p>{project.description}</p>
                {project.link && (
                  <Link href={project.link} className="btn">{project.linkText || 'Learn More'}</Link>
                )}
              </div>
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
