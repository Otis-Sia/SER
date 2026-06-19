import Link from 'next/link';
import { MapPin, Siren } from '../../components/Icons';

export const metadata = {
  title: 'Events | Scouts Emergency Response',
};

export default function Events() {
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
          <div className="product-card">
            <div className="product-card-info">
              <h3>Fire Safety Awareness Workshop</h3>
              <p><strong>Date:</strong> July 6, 2025</p>
              <p><strong>Venue:</strong> Juja Scouts Hall</p>
              <p>
                Practical fire-safety education, prevention tips, and emergency response basics for Scouts and community members.
              </p>
              <Link className="btn" href="/contact">Ask to Join</Link>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>Disaster Response Camp</h3>
              <p><strong>Date:</strong> August 10–12, 2025</p>
              <p><strong>Venue:</strong> Mount Kenya</p>
              <p>
                A hands-on camp focused on preparedness, simulations, teamwork, and field response readiness.
              </p>
              <Link className="btn" href="/contact">Ask to Join</Link>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>Community First Aid Day</h3>
              <p><strong>Date:</strong> September 21, 2025</p>
              <p><strong>Venue:</strong> JKUAT Grounds</p>
              <p>
                Community engagement day for first aid demonstrations, training, and public safety awareness.
              </p>
              <Link className="btn" href="/contact">Ask to Join</Link>
            </div>
          </div>
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
