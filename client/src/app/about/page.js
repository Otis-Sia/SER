import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { getSiteContent } from '../admin/actions';
import { ArrowRight, UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'About Us | Scouts Emergency Response';
  const description = 'Learn about Scouts Emergency Response (SER), our vision, mission, leadership, and our commitment to emergency preparedness and youth empowerment across Kenya.';
  const rawImage = siteContent.siteMeta?.aboutHeroBgImage;
  const heroImage = (rawImage && (rawImage.endsWith('.jpg') || rawImage.endsWith('.png') || rawImage.startsWith('http')))
    ? rawImage
    : '/assets/images/backgrounds/scouts_hero_bg.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/about',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: 'About Scouts Emergency Response',
        },
      ],
    },
    alternates: {
      canonical: '/about',
    },
  };
}

export default async function About() {
  const siteContent = await getSiteContent();
  const about = siteContent.about || {};
  const team = about.team || [];

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
          Scouts Emergency Response was established in 2024 following the Embakasi Muradi gas explosion, where our founder was directly involved in the response.
Being on the ground revealed a critical gap: communities are often the first at an emergency, yet many lack the knowledge, skills and confidence to respond effectively before professional help arrives.
        </p>
        <p>
SER was created to bridge this gap by equipping young people, schools and communities with practical first aid, emergency response, disaster preparedness and safety skills.        </p>
        <p>
We believe that lifesaving skills should not be limited to professional responders,they should be accessible to everyone.
We experienced the gap firsthand. We decided to do something about it.
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
              Join the Team <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {team
              .slice()
              .sort((a, b) => {
                const posA = a.position !== undefined && a.position !== "" ? Number(a.position) : 999;
                const posB = b.position !== undefined && b.position !== "" ? Number(b.position) : 999;
                return posA - posB;
              })
              .map((member, idx) => {
              const isFilled = member.name && member.name.trim() !== '' && member.name !== member.role;
              
              if (isFilled) {
                const memberSlug = member.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                return (
                  <Link key={idx} href={`/about/${memberSlug}`} className="flex flex-col w-full mx-auto lg:mx-0" style={{ maxWidth: '280px', textDecoration: 'none', color: 'inherit' }}>
                    <div className="w-full bg-surface-container mb-4 shadow-sm" style={{ borderRadius: '6px', position: 'relative', overflow: 'hidden', paddingBottom: '133.33%' }}>
                      {member.image ? (
                        <Image 
                          src={member.image} 
                          alt={member.name || "Team member"} 
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
                          className="grayscale hover:grayscale-0 transition-all duration-500" 
                          style={{ objectFit: 'cover' }} 
                        />
                      ) : (
                        <div className="bg-surface-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="text-4xl text-primary opacity-20 font-bold">{member.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-on-background m-0 tracking-tight">{member.name}</h4>
                    <p className="text-sm font-label-bold text-secondary m-0 mt-1">{member.role}</p>
                  </Link>
                );
              } else {
                return (
                  <Link href="/community#join" key={idx} className="w-full mx-auto lg:mx-0 border-2 border-dashed border-outline-variant/30 text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors group shadow-sm bg-surface hover:bg-secondary/5" style={{ borderRadius: '6px', maxWidth: '280px', position: 'relative', display: 'block', paddingBottom: '133.33%' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
                        <UserPlus size={48} className="mb-3 opacity-40 group-hover:opacity-100 transition-opacity text-secondary" />
                        <span className="text-sm font-medium">{member.role || 'Open Role'}</span>
                      </div>
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
