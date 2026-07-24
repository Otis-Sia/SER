import Link from 'next/link';
import { MapPin, Siren } from '../../components/Icons';
import { getSiteContent, getEvents } from '../admin/actions';

export const metadata = {
  title: 'Upcoming Training & Events | Scouts Emergency Response',
  description: 'View upcoming emergency preparedness workshops, first aid training sessions, and community safety events hosted by Scouts Emergency Response.',
  openGraph: {
    title: 'Upcoming Training & Events | Scouts Emergency Response',
    description: 'View upcoming emergency preparedness workshops, first aid training sessions, and community safety events.',
    url: '/events',
  },
  alternates: {
    canonical: '/events',
  },
};

export default async function Events() {
  const siteContent = await getSiteContent();
  const events = await getEvents();

  return (
    <>
      <section className="events-intro page-hero text-center">
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
              const startDate = new Date(event.eventDate || event.event_date || new Date());
              const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assume 1 hr
              const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
              const datesStr = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
              const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${datesStr}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;

              return (
                <div className="product-card" key={event.id}>
                  <div className="product-card-info">
                    <h3>{event.title}</h3>
                    <p><strong>Date:</strong> {startDate.toLocaleDateString()}</p>
                    <p><strong>Venue:</strong> {event.location}</p>
                    <p>{event.description}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <Link className="btn" href="/contact">Ask to Join</Link>
                      <a className="btn btn-accent" href={googleCalUrl} target="_blank" rel="noopener noreferrer">
                        Add to Calendar
                      </a>
                    </div>
                  </div>
                </div>
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
