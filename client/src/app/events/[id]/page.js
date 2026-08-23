import { config } from '@/lib/config';
import EventCard from '../../../components/EventCard';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

async function fetchEvent(id) {
  try {
    const res = await fetch(`${config.apiUrl}/api/events/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch event from Node API:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await fetchEvent(id);
  
  if (!event) {
    return { title: 'Event Not Found | Scouts Emergency Response' };
  }

  const title = `${event.title} | Scouts Emergency Response`;
  const description = event.description 
    ? event.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
    : `Join us for ${event.title} at ${event.location || 'various locations'}.`;
  
  const heroImage = event.imageUrl || 'https://seresponse.org/og-image.jpg'; 

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/events/${id}`,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    alternates: {
      canonical: `/events/${id}`,
    },
  };
}

async function fetchReport(googleEventId) {
  try {
    const res = await fetch(`${config.apiUrl}/api/reports/${googleEventId}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function EventPage({ params }) {
  const { id } = await params;
  const event = await fetchEvent(id);

  if (!event) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <h1>Event Not Found</h1>
        <p>Sorry, the event you are looking for does not exist or has been removed.</p>
        <Link href="/events" className="btn btn-accent" style={{ marginTop: '2rem' }}>Back to Events</Link>
      </div>
    );
  }

  const startDate = new Date(event.event_date || event.eventDate || new Date());
  const endDate = event.end_date 
    ? new Date(event.end_date) 
    : new Date(startDate.getTime() + 60 * 60 * 1000);
  
  const isLive = new Date() >= startDate && new Date() <= endDate;

  const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const datesStr = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${datesStr}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;

  const report = await fetchReport(event.google_event_id || event.id);

  return (
    <div style={{ backgroundColor: 'var(--light-gray-color)', minHeight: '100vh', padding: '8rem 1rem 4rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--primary-color)', fontWeight: '600' }}>
          &larr; Back to All Events
        </Link>
        <EventCard 
          event={event} 
          isLive={isLive} 
          googleCalUrl={googleCalUrl} 
        />
        
        {report && (
          <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: 'var(--white-color)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>{report.title}</h2>
            <div style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>
              {report.content_md}
            </div>
            {report.author && (
              <p style={{ marginTop: '2rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                Report by: {report.author}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
