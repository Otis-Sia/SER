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
      <section 
        className="about-intro page-hero"
        style={siteContent.siteMeta?.aboutHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.aboutHeroBgImage})` } : {}}
      >
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

      <section className="py-24 px-4 md:px-10 bg-surface dark:bg-background border-t border-outline-variant/20">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-secondary font-label-bold uppercase tracking-widest text-sm mb-2 block">Our Leaders</span>
              <h2 className="text-primary dark:text-inverse-primary font-display-md md:font-display-lg mb-4">Meet the Team</h2>
              <p className="text-on-surface-variant text-body-lg">
                SER is powered by youth leaders, volunteer trainers, and community partners who coordinate local response efforts.
              </p>
            </div>
            <Link href="/community#join" className="text-secondary font-bold flex items-center gap-1 hover:text-secondary-fixed transition-colors whitespace-nowrap mb-2">
              Join the Team <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {siteContent.about.team.map((member, idx) => {
              const isFilled = member.name && member.name.trim() !== '' && member.name !== member.role;
              
              if (isFilled) {
                return (
                  <div key={idx} className="flex flex-col">
                    <div className="w-full aspect-[3/4] bg-surface-container mb-4 relative overflow-hidden shadow-sm">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container">
                          <span className="text-4xl text-primary opacity-20 font-bold">{member.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-on-background m-0 tracking-tight">{member.name}</h4>
                    <p className="text-sm font-label-bold text-secondary m-0 mt-1">{member.role}</p>
                  </div>
                );
              } else {
                return (
                  <Link href="/community#join" key={idx} className="w-full aspect-[3/4] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors group shadow-sm bg-surface hover:bg-secondary/5">
                    <span className="material-symbols-outlined text-5xl mb-3 opacity-40 group-hover:opacity-100 transition-opacity text-secondary">person_add</span>
                    <span className="text-sm font-medium">{member.role || 'Open Role'}</span>
                  </Link>
                );
              }
            })}
          </div>
        </div>
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
