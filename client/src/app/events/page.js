import Link from 'next/link';
import { MapPin, Siren } from '../../components/Icons';

export const metadata = {
  title: 'Events | Scouts Emergency Response',
};

async function getEvents() {
  try {
    const res = await fetch('http://127.0.0.1:4000/api/events', { cache: 'no-store' });
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export default async function Events() {
  const events = await getEvents();

  return (
    <>
      <section className="events-intro page-hero text-center">
        <h1>Scouting Milestones &amp; SER Events</h1>
        <p className="intro-text">
          Scouts Emergency Response (SER) honors key Scouting moments and organizes community-centered preparedness events. Join us to learn, serve, and strengthen local readiness.
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
              const startDate = new Date(event.event_date);
              const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assume 1 hr
              const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
              const datesStr = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
              const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${datesStr}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;

              return (
                <div className="product-card" key={event.id}>
                  <div className="product-card-info">
                    <h3>{event.title}</h3>
                    <p><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}</p>
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
