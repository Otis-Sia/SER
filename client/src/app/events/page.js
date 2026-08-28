import Link from 'next/link';
import { MapPin, Siren } from '../../components/Icons';
import { FiClock } from 'react-icons/fi';
import { getSiteContent, getHistoricMilestones } from '../admin/actions';
import EventCard from '../../components/EventCard';
import PastEventsList from '../../components/PastEventsList';
import { config } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const res = await fetch(`${config.apiUrl}/api/events`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error("Failed to fetch events from Node API:", error);
    return [];
  }
}

async function fetchPastGoogleEvents() {
  try {
    const res = await fetch(`${config.apiUrl}/api/events?past=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    if (error.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error("Failed to fetch past events from Node API:", error);
    return [];
  }
}

async function fetchAllEventReports() {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_reports')
      .select('*');
    if (error || !data) return {};
    const map = {};
    for (const r of data) {
      map[r.google_event_id] = r;
    }
    return map;
  } catch (err) {
    console.error("Failed to fetch all event reports:", err);
    return {};
  }
}

export default async function Events() {
  const [siteContent, milestones, events, pastEvents, reports] = await Promise.all([
    getSiteContent(),
    getHistoricMilestones(),
    fetchGoogleEvents(),
    fetchPastGoogleEvents(),
    fetchAllEventReports(),
  ]);

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

      <section className="events-milestones" id="events-milestones" style={{ scrollMarginTop: '6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MapPin /> Historic Milestones
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-color, #666)', opacity: 0.85 }}>
            Key moments in Scouting and SER history
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {milestones.map((item, index) => {
            const isActive = !!item.active;
            return (
              <div
                key={index}
                className={`milestone-item ${isActive ? 'milestone-item--active' : ''}`}
                style={{
                  position: 'relative',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'rgba(18, 154, 68, 0.05)' : 'var(--card-bg, #ffffff)',
                  border: isActive ? '2px solid var(--primary-color, #129a44)' : '1px solid var(--border-color, #e5e7eb)',
                  boxShadow: isActive ? '0 4px 20px rgba(18, 154, 68, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: isActive ? 'var(--primary-color, #129a44)' : 'rgba(0,0,0,0.06)',
                        color: isActive ? '#ffffff' : 'var(--text-color, #111827)',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                      }}
                    >
                      {item.year}
                    </span>

                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-color, #111827)' }}>
                      {item.title}
                    </h3>
                  </div>

                  {isActive && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#16a34a',
                          display: 'inline-block',
                        }}
                      />
                      <span>Active Milestone</span>
                    </span>
                  )}
                </div>

                {item.description && (
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.92rem', color: 'var(--text-color, #4b5563)', opacity: 0.9, lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
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

      {pastEvents.length > 0 && (
        <section className="events-past" style={{ backgroundColor: 'var(--light-gray-color)', padding: '5rem 1.5rem' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', margin: '0 0 0.5rem 0', fontSize: '2.2rem' }}>
                <FiClock size={28} /> Past Events &amp; Reports
              </h2>
              <p style={{ color: 'var(--text-color, #666)', fontSize: '1.05rem', margin: 0 }}>
                Browse past training sessions and drills. Tap any event to read its report and key outcomes.
              </p>
            </div>
            <PastEventsList pastEvents={pastEvents} reports={reports} />
          </div>
        </section>
      )}

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
