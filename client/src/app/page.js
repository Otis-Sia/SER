import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="hero page-hero">
        <h1>Scouts Emergency Response</h1>
        <p>Compassion in Action</p>
        <Link href="/about" className="btn">Learn More</Link>
      </section>

      <section className="home-register">
        <h2>Join the Response Network</h2>
        <p>Be part of the scouts and volunteers who train, respond, and serve across Kenya.</p>
        <Link href="/login/signup" className="btn btn-accent">Register</Link>
      </section>

      <section>
        <h2>On-the-Ground Moments</h2>
        <div className="image-scroll" aria-label="Scrollable highlights from SER activities">
          <article className="image-card">
            <img src="/assets/images/home/response-team.svg" alt="Illustration of a response team preparing for action" />
            <div className="image-caption">
              <h3>Response Teams</h3>
              <p>Coordinated scouts ready to mobilize in minutes.</p>
            </div>
          </article>
          <article className="image-card">
            <img src="/assets/images/home/training-day.svg" alt="Illustration of a training day session" />
            <div className="image-caption">
              <h3>Training Days</h3>
              <p>Hands-on drills that keep communities prepared.</p>
            </div>
          </article>
          <article className="image-card">
            <img src="/assets/images/home/community-support.svg" alt="Illustration representing community support" />
            <div className="image-caption">
              <h3>Community Support</h3>
              <p>Outreach efforts that bring safety to every block.</p>
            </div>
          </article>
          <article className="image-card">
            <img src="/assets/images/home/rescue-gear.svg" alt="Illustration of rescue gear and supplies" />
            <div className="image-caption">
              <h3>Rescue Gear</h3>
              <p>Essential kits and tools packed for quick deployment.</p>
            </div>
          </article>
          <article className="image-card">
            <img src="/assets/images/home/volunteer-outreach.svg" alt="Illustration of volunteer outreach" />
            <div className="image-caption">
              <h3>Volunteer Outreach</h3>
              <p>Rover Scouts engaging partners across the region.</p>
            </div>
          </article>
        </div>
      </section>

      <section>
        <h2>Impact in Motion</h2>
        <div className="home-highlight">
          <div className="highlight-card">
            <span>120+</span>
            <h3>Community Drills</h3>
            <p>Hands-on trainings that keep neighborhoods ready for any emergency.</p>
          </div>
          <div className="highlight-card">
            <span>45</span>
            <h3>Youth-Led Teams</h3>
            <p>Rapid response groups coordinating relief and safety awareness.</p>
          </div>
          <div className="highlight-card">
            <span>3000+</span>
            <h3>Lives Reached</h3>
            <p>Preparedness workshops supporting families across our region.</p>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <h2>Explore Our Organization</h2>
        <div className="product-grid">
          <div className="product-card">
            <div className="product-card-info">
              <h3>History of Scouting</h3>
              <p>Discover the origins and growth of the Scouting movement.</p>
              <Link href="/about" className="btn">Read More</Link>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-info">
              <h3>Scouts & SDGs</h3>
              <p>How Scouts contribute to global sustainable development.</p>
              <Link href="/projects" className="btn">See Our Impact</Link>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-info">
              <h3>Our Leaders</h3>
              <p>Meet the leadership guiding SER initiatives.</p>
              <Link href="/about" className="btn">View Leaders</Link>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-info">
              <h3>Jasiri Rover Scouts</h3>
              <p>Learn about our active Rover Scout community.</p>
              <Link href="/community" className="btn">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Stories on the Move</h2>
        <div className="scroll-gallery">
          <div className="scroll-tile">
            <strong>Emergency Prep Hubs</strong>
            <p>Mobile kits and first aid stations deployed across local events.</p>
          </div>
          <div className="scroll-tile">
            <strong>Volunteer Spotlight</strong>
            <p>Rover Scouts leading drills, fire safety lessons, and rapid response.</p>
          </div>
          <div className="scroll-tile">
            <strong>Community Partnerships</strong>
            <p>Collaborations that keep resources and training moving year-round.</p>
          </div>
        </div>
      </section>

      <section className="partners-section">
        <h2>Our Partners</h2>
        <div className="partners-marquee">
          <div className="marquee-track">
            <span>Kenya Scouts Association</span>
            <span>Red Cross Kenya</span>
            <span>St John Ambulance</span>
            <span>National Disaster Management Unit</span>
            <span>County Fire Department</span>
            <span>Community Health Promoters</span>
            {/* Duplicate for seamless scroll */}
            <span>Kenya Scouts Association</span>
            <span>Red Cross Kenya</span>
            <span>St John Ambulance</span>
            <span>National Disaster Management Unit</span>
            <span>County Fire Department</span>
            <span>Community Health Promoters</span>
          </div>
        </div>
      </section>
    </>
  );
}
