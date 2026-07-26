import Link from 'next/link';
import { HeartPulse, Siren, Brain, Flame } from 'lucide-react';
import InteractiveInfiniteScroll from '../components/InteractiveInfiniteScroll';
import InstagramEmbed from '../components/InstagramEmbed';
import TiktokEmbed from '../components/TiktokEmbed';
import FacebookEmbed from '../components/FacebookEmbed';
import { getSiteContent } from './admin/actions';

export const metadata = {
  title: 'Scouts Emergency Response (SER) | Emergency Preparedness & Youth Empowerment',
  description: 'Scouts Emergency Response (SER) is a youth-centered initiative equipping young people across Kenya with first aid, emergency preparedness, and disaster response skills.',
  openGraph: {
    title: 'Scouts Emergency Response (SER) | Emergency Preparedness & Youth Empowerment',
    description: 'Equipping young people across Kenya with first aid, emergency preparedness, and disaster response skills.',
    url: '/',
  },
  alternates: {
    canonical: '/',
  },
};

async function fetchRecentEvents() {
  try {
    const res = await fetch('http://127.0.0.1:4000/api/events', { cache: 'no-store' });
    if (!res.ok) return [];
    const allEvents = await res.json();
    return allEvents.slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch events from Node API:", error);
    return [];
  }
}

export default async function Home() {
  const siteContent = await getSiteContent();
  const recentEvents = await fetchRecentEvents();

  return (
    <>
      {/* 1. Hero Section */}
      <section 
        className="hero page-hero" 
        style={{ '--hero-bg': `url(${siteContent.siteMeta?.homeHeroBgImage || '/assets/images/backgrounds/scouts_hero_bg.jpg'})` }}
      >
        <h1>{siteContent.home.hero.heading}</h1>
        <p>{siteContent.home.hero.subheading}</p>
        <Link href={siteContent.home.hero.ctaLink} className="btn">{siteContent.home.hero.ctaText}</Link>
      </section>

      {/* 2. Impact in Motion */}
      <section style={{ backgroundColor: 'var(--light-gray-color)' }}>
        <h2 style={{ paddingTop: '3rem', textAlign: 'center', marginBottom: '1rem' }}>Impact in Motion</h2>
        <div className="home-highlight">
          {(siteContent.home.impactInMotion || [
            {
              number: "120+",
              title: "Community Drills",
              description: "Hands-on trainings that keep neighborhoods ready for any emergency."
            },
            {
              number: "45",
              title: "Youth-Led Teams",
              description: "Rapid response groups coordinating relief and safety awareness."
            },
            {
              number: "3000+",
              title: "Lives Reached",
              description: "Preparedness workshops supporting families across our region."
            }
          ]).map((item, index) => (
            <div className="highlight-card" key={index}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. What We Do Section */}
      <section className="what-we-do-container">
        <h2 className="brochure-title-white">What We Do</h2>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '800px', marginBottom: '1rem' }}>
          We prepare the next generation of responders through comprehensive training and emergency services, built on hands-on practice and community-first resilience.
        </p>
        <div className="what-we-do-grid">
          {siteContent.home.features.map((feature, index) => {
            const icons = [HeartPulse, Siren, Brain, Flame];
            const IconComponent = icons[index % icons.length];
            return (
              <div className="service-card" key={index}>
                <div className="service-card-header">
                  <div className="service-card-icon">
                    <IconComponent size={24} />
                  </div>
                  <h3>{feature.title}</h3>
                </div>
                <p>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Who We Are (Consolidated) */}
      <section className="about-us-container brochure-diagonal-accent">
        <div className="brochure-row">
          <div>
            <h2 className="brochure-title">Who We <span>Are</span></h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-color)', marginBottom: '1.5rem' }}>
              We are a youth-centered initiative that focuses on emergency preparedness and response skills among young people. The project aims to equip young people with practical knowledge and confidence to respond effectively during emergencies in schools, homes, and communities.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-color)', marginBottom: '1.5rem' }}>
              Through training, awareness, and hands-on learning, SER empowers young people to become first responders in their communities.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <Link href="/about" className="btn btn-accent">Our History & Leaders</Link>
              <Link href="/projects" className="btn">Scouts & SDGs</Link>
              <Link href="/community" className="btn">Jasiri Rover Scouts</Link>
            </div>
          </div>
          <div className="about-decorative-badge" style={{
            background: 'linear-gradient(135deg, var(--brochure-green) 0%, var(--brochure-dark-green) 100%)',
            borderRadius: '12px',
            padding: '3rem 2rem',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--box-shadow)',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.05)',
              transform: 'rotate(45deg)'
            }} />
            <div style={{
              fontSize: '3.5rem',
              fontWeight: '700',
              lineHeight: '1',
              marginBottom: '0.5rem',
              color: '#ffffff'
            }}>SER</div>
            <div style={{
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '600',
              opacity: '0.9',
              borderBottom: '2px solid #ffffff',
              paddingBottom: '0.5rem',
              marginBottom: '1rem'
            }}>Compassion in Action</div>
            <p style={{ fontSize: '1.1rem', color: '#ffffff', opacity: '0.9', margin: 0, maxWidth: '340px', lineHeight: '1.6' }}>
              Equipping youth with life-saving skills for home, school, and community safety.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Upcoming Events [NEW] */}
      <section className="events-upcoming" style={{ padding: '5rem 2rem', backgroundColor: 'var(--light-gray-color)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '2.5rem' }}>
              <Siren size={32} /> Upcoming Events
            </h2>
            <Link href="/events" className="btn btn-accent">View All Events</Link>
          </div>
          <div className="product-grid grid-spaced" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {recentEvents.length === 0 ? (
              <p className="intro-text">No upcoming events at the moment.</p>
            ) : (
              recentEvents.map((event) => {
                const startDate = new Date(event.event_date || event.eventDate || new Date());
                const endDate = event.end_date 
                  ? new Date(event.end_date) 
                  : new Date(startDate.getTime() + 60 * 60 * 1000);

                const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
                const datesStr = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
                const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${datesStr}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;

                const durationHrs = Math.round((endDate - startDate) / (1000 * 60 * 60) * 10) / 10;
                const durationStr = durationHrs > 0 ? ` (${durationHrs} hour${durationHrs === 1 ? '' : 's'})` : '';

                return (
                  <div className="event-card" key={event.id}>
                    <div className="event-card-header">
                      <h3 className="event-card-title">{event.title}</h3>
                      <div className="event-card-meta">
                        <strong>Date:</strong> <span>{startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="event-card-meta">
                        <strong>Time:</strong> <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{durationStr}</span>
                      </div>
                      {event.location && (
                        <div className="event-card-meta">
                          <strong>Venue:</strong> <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="event-card-actions" style={{ marginTop: '1.5rem' }}>
                      <Link className="btn" href="/contact">Ask to Join</Link>
                      <a className="btn btn-accent" href={googleCalUrl} target="_blank" rel="noopener noreferrer">
                        Add to Calendar
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 6. On-the-Ground Moments */}
      <section>
        <h2 style={{ paddingTop: '3rem' }}>On-the-Ground Moments</h2>
        <InteractiveInfiniteScroll>
          {(siteContent.home.onTheGroundMoments || []).map((moment, index) => (
            <article className="image-card" key={index}>
              <img src={moment.image} alt={moment.title} />
              <div className="image-caption">
                <h3>{moment.title}</h3>
                <p>{moment.description}</p>
              </div>
            </article>
          ))}
        </InteractiveInfiniteScroll>
      </section>

      {/* 7. Socials & Partners */}
      <section className="socials-section">
        <h2>Latest from our Socials</h2>
        <div className="socials-grid">
          <InstagramEmbed url={siteContent.home.featuredInstagramPost} />
          <TiktokEmbed url={siteContent.home.featuredTiktokPost} />
          <FacebookEmbed url={siteContent.home.featuredFacebookPost} />
        </div>
      </section>

      <section className="partners-section">
        <h2>Our Partners</h2>
        <div className="partners-marquee">
          <div className="marquee-track">
            {siteContent.home.partners.map((partner, index) => (
              <span key={`partner-1-${index}`}>{partner}</span>
            ))}
            {siteContent.home.partners.map((partner, index) => (
              <span key={`partner-2-${index}`}>{partner}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="home-register" style={{ marginTop: '2rem' }}>
        <h2>Join the Response Network</h2>
        <p>Be part of the scouts and volunteers who train, respond, and serve across Kenya.</p>
        <Link href="/login/signup" className="btn btn-accent">Register</Link>
      </section>
    </>
  );
}
