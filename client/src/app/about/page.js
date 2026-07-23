import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { getSiteContent } from '../admin/actions';

export const metadata = {
  title: 'About Us | Scouts Emergency Response',
  description: 'Learn about Scouts Emergency Response (SER), our vision, mission, leadership, and our commitment to emergency preparedness and youth empowerment across Kenya.',
  openGraph: {
    title: 'About Us | Scouts Emergency Response',
    description: 'Learn about Scouts Emergency Response (SER), our vision, mission, leadership, and our commitment to emergency preparedness and youth empowerment.',
    url: '/about',
  },
  alternates: {
    canonical: '/about',
  },
};

export default async function About() {
  const siteContent = await getSiteContent();

  return (
    <>
      <section className="about-intro page-hero">
        <h1>{siteContent.about.title}</h1>
        <p>{siteContent.about.mission}</p>
        {siteContent.about.quote && (
          <blockquote style={{ fontStyle: 'italic', marginTop: '1.5rem', fontSize: '1.2rem', color: 'var(--accent-color)' }}>
            "{siteContent.about.quote}"
          </blockquote>
        )}
      </section>

      <section className="about-pillars" style={{ marginTop: '2rem' }}>
        <h2 className="brochure-title">Our <span>Pillars</span></h2>
        
        <div className="pillar-card">
          <h3>Our Vision</h3>
          <p>{siteContent.about.vision}</p>
        </div>

        <div className="pillar-card">
          <h3>Our Mission</h3>
          <p>{siteContent.about.mission}</p>
        </div>

        <div className="pillar-card">
          <h3>Goal</h3>
          <p>{siteContent.about.goal}</p>
        </div>

        <div className="pillar-card">
          <h3>Objective</h3>
          <p>{siteContent.about.objective}</p>
        </div>
      </section>

      <section className="about-story">
        <h2>Our Story</h2>
        <p>
          In early 2024, Embakasi East in Nairobi County experienced a tragic gas explosion in the Muradi area, which resulted in 17 deaths, 280 injuries, 6 missing persons, and 26 displacements. This marked the beginning of a series of disasters, including heavy rains between March and May that caused severe flooding affecting over 20 counties in Kenya. The floods led to the deaths of 291 people, injuries to 188, 75 went missing, and the displacement of over 55,776 families.
        </p>
        <p>
          These repeated emergencies highlighted a critical gap in emergency preparedness and response, despite efforts from organizations like St. John&apos;s Ambulance, Red Cross Kenya, and the National Disaster Management Unit (NDMU). Recognizing the urgent need for lifesaving skills and community resilience, Scout Emergency Response was established.
        </p>
        <p>
          Our initiative focuses on equipping individuals, especially the youth, with first aid and emergency response training to reduce the burden on healthcare systems and save lives. We are committed to building a safer, more prepared community through awareness, skill-building, and strategic action.
        </p>
      </section>

      <section className="about-values">
        <h2>Core Values</h2>
        <ul>
          <li>Service above self</li>
          <li>Preparedness and action</li>
          <li>Teamwork and trust</li>
          <li>Youth-led, impact-driven</li>
        </ul>
      </section>

      <section className="about-team">
        <h2>Our Team</h2>
        <p>
          SER is powered by youth leaders, volunteer trainers, and community partners who coordinate local response efforts. Each team member brings a mix of scouting experience, emergency readiness training, and a shared commitment to serve during crises.
        </p>
        <h3>Meet the Team</h3>
        <div className="team-grid">
          {siteContent.about.team.map((member, idx) => (
            <article className="team-card" key={idx}>
              <img src={member.image} alt={member.name} />
              <h4>{member.role}</h4>
              {member.name !== member.role && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.8 }}>{member.name}</p>}
            </article>
          ))}
        </div>
        <p>
          Your role could be next, and we’ll help shape the title together based on your strengths and the needs of the mission.
        </p>
      </section>

      <section className="about-socials text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4rem 0' }}>
        <h2>Follow us on TikTok</h2>
        <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@scouts.emergency" data-unique-id="scouts.emergency" data-embed-type="creator" style={{ maxWidth: '780px', minWidth: '288px' }} >
          <section>
            <a target="_blank" rel="noreferrer" href="https://www.tiktok.com/@scouts.emergency?refer=creator_embed">@scouts.emergency</a>
          </section>
        </blockquote> 
        <Script async src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
      </section>

      <section className="about-cta text-center">
        <h2>Get Involved</h2>
        <p>
          Whether you’re a Scout, volunteer, partner, or supporter, you have a place in SER. Join our trainings, attend events, and help strengthen community safety.
        </p>
        <div className="cta-actions">
          <Link className="btn" href="/projects">See Our Projects</Link>
          <Link className="btn btn-accent" href="/contact">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
