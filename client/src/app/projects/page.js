import Link from 'next/link';

export const metadata = {
  title: 'Projects | Scouts Emergency Response',
};

export default function Projects() {
  return (
    <>
      <section className="project-intro page-hero text-center">
        <h1>Our Work in the Field</h1>
        <p className="intro-text">
          Scouts Emergency Response (SER) runs practical programs that build safety skills, strengthen preparedness, and support communities during emergencies.
        </p>
      </section>

      <section className="project-section">
        <h2>Ongoing &amp; Past Projects</h2>

        <div className="product-grid">
          <div className="product-card">
            <div className="product-card-info">
              <h3>ClickSafe Initiative</h3>
              <p><strong>Focus:</strong> Cybersecurity &amp; Online Safety</p>
              <p>
                A youth-led program training students and communities on safe internet use, digital responsibility, and protection from online risks.
              </p>
              <Link href="/contact" className="btn">Partner / Join</Link>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>Emergency Drill Simulations</h3>
              <p><strong>Focus:</strong> Preparedness &amp; Response Practice</p>
              <p>
                Practical emergency drills for Scouts and schools to build readiness for fire incidents, injuries, evacuations, and disaster scenarios.
              </p>
              <Link href="/events" className="btn">See Events</Link>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>First Aid Camps</h3>
              <p><strong>Focus:</strong> Life-saving Skills</p>
              <p>
                Hands-on first aid training sessions with demonstrations, practice, and community outreach to improve rapid response and confidence.
              </p>
              <Link href="/contact" className="btn">Request Training</Link>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>Environmental Restoration Drives</h3>
              <p><strong>Focus:</strong> Community Resilience</p>
              <p>
                Cleanup and restoration projects that reduce risk, protect public health, and support safer environments for communities.
              </p>
              <Link href="/community" className="btn">Join Community</Link>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>Community Safety Ambassadors</h3>
              <p><strong>Focus:</strong> Awareness &amp; Leadership</p>
              <p>
                Training Scouts and volunteers to champion first aid awareness, safe practices, and emergency readiness in local communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="project-cta text-center">
        <h2>Want SER in Your School or Community?</h2>
        <p className="intro-text">
          SER works with schools, Scout groups, and community partners to run trainings, workshops, and preparedness programs. Tell us what you need and we&apos;ll plan together.
        </p>

        <div className="cta-actions">
          <Link href="/contact" className="btn btn-accent">Contact SER</Link>
          <Link href="/events" className="btn">Upcoming Events</Link>
        </div>
      </section>
    </>
  );
}
