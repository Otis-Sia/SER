import Link from 'next/link';
import { MapPin, Siren } from '../../components/Icons';
import { getSiteContent } from '../admin/actions';
import EventCard from '../../components/EventCard';

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const title = 'Upcoming Training & Events | Scouts Emergency Response';
  const description = 'View upcoming emergency preparedness workshops, first aid training sessions, and community safety events hosted by Scouts Emergency Response.';
  const rawImage = siteContent.siteMeta?.eventsHeroBgImage;
  const heroImage = (rawImage && (rawImage.endsWith('.jpg') || rawImage.endsWith('.png') || rawImage.startsWith('http')))
    ? rawImage
    : '/assets/images/backgrounds/scouts_hero_bg.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/events',
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: 'SER Events & Workshops',
        },
      ],
    },
    alternates: {
      canonical: '/events',
    },
  };
}

async function fetchGoogleEvents() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
    // Call our Node.js backend which syncs with Google Calendar!
    const res = await fetch(`${API_BASE}/api/events`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error("Failed to fetch events from Node API:", error);
    return [];
  }
}

export default async function Events() {
  const siteContent = await getSiteContent();
  const events = await fetchGoogleEvents();

  return (
    <>
      <section 
        className="events-intro page-hero text-center"
        style={siteContent.siteMeta?.eventsHeroBgImage ? { '--hero-bg': `url(${siteContent.siteMeta.eventsHeroBgImage})` } : {}}
      >
        <h1>{siteContent.events.title}</h1>
        <p className="intro-text">
          {siteContent.events.description}
        </p>
      </section>

      <section className="events-milestones">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin /> Historic Milestones</h2>
        <ul className="intro-text list-indent">
          <li><strong>1907:</strong> First Scout Camp (Brownsea Island)</li>
          <li><strong>1908:</strong> First Scout Handbook published</li>
          <li><strong>1920:</strong> First World Scout Jamboree</li>
          <li><strong>February 22:</strong> Founder&apos;s Day (Baden-Powell&apos;s Birthday)</li>
        </ul>
      </section>

      <section className="events-upcoming">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Siren /> Upcoming SER Events</h2>
        <div className="product-grid grid-spaced">
          {events.length === 0 ? (
            <p className="intro-text">No upcoming events at the moment.</p>
          ) : (
            events.map((event) => {
              const startDate = new Date(event.event_date || event.eventDate || new Date());
              const endDate = event.end_date 
                ? new Date(event.end_date) 
                : new Date(startDate.getTime() + 60 * 60 * 1000); // Fallback to 1 hr

              const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
              const datesStr = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
              const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${datesStr}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;

              // Calculate duration in hours
              const durationHrs = Math.round((endDate - startDate) / (1000 * 60 * 60) * 10) / 10;
              const durationStr = durationHrs > 0 ? ` (${durationHrs} hour${durationHrs === 1 ? '' : 's'})` : '';

              const now = new Date();
              const isLive = now >= startDate && now <= endDate;

              return (
                <EventCard 
                  key={event.id}
                  event={event}
                  isLive={isLive}
                  startDateStr={startDate.toLocaleDateString(undefined, { timeZone: 'Africa/Nairobi' })}
                  startTimeStr={startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' })}
                  endTimeStr={endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' })}
                  durationStr={durationStr}
                  googleCalUrl={googleCalUrl}
                />
              );
            })
          )}
        </div>
      </section>

      <section className="events-cta text-center">
        <h2>Stay Updated</h2>
        <p className="intro-text">
          Events evolve as opportunities and needs change. If you want to volunteer, host a session, or partner with SER, reach out and we&apos;ll connect you to the team.
        </p>
        <div className="cta-actions">
          <Link href="/contact" className="btn btn-accent">Contact SER</Link>
          <Link href="/projects" className="btn">See Our Projects</Link>
        </div>
      </section>
    </>
  );
}
