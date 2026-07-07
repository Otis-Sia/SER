import Link from 'next/link';

export const metadata = {
  title: 'About SER | Scouts Emergency Response',
};

export default function About() {
  return (
    <>
      <section className="about-intro page-hero">
        <h1>About Scouts Emergency Response</h1>
        <p>
          We are a youth-centered initiative that focuses on emergency preparedness and response skills among young people. The project aims to equip young people with practical knowledge and confidence to respond effectively during emergencies in schools, homes, and communities. Through training, awareness, and hands-on learning, SER empowers young people to become first responders in their communities.
        </p>
      </section>

      <section className="about-pillars" style={{ marginTop: '2rem' }}>
        <h2 className="brochure-title">Our <span>Pillars</span></h2>
        
        <div className="pillar-card">
          <h3>Our Vision</h3>
          <p>
            To create a generation of empowered and prepared youth who can respond confidently, responsibly, and effectively to emergencies within their communities.
          </p>
        </div>

        <div className="pillar-card">
          <h3>Our Mission</h3>
          <p>
            To equip young people with practical emergency preparedness skills, knowledge, and leadership through training, awareness programs, and community engagement, enabling them to respond effectively and support their communities during emergencies and disasters.
          </p>
        </div>

        <div className="pillar-card">
          <h3>Goal</h3>
          <p>
            To build resilience, enhance the preparedness & response capability of young people & community emergency.
          </p>
        </div>

        <div className="pillar-card">
          <h3>Objective</h3>
          <p>
            To increase awareness among young people and communities on emergency preparedness.
          </p>
        </div>
      </section>

      <section className="about-story">
        <h2>Our Story</h2>
        <p>
          In early 2024, Embakasi East in Nairobi County experienced a tragic gas explosion in the Muradi area, which resulted in 17 deaths, 280 injuries, 6 missing persons, and 26 displacements. This marked the beginning of a series of disasters, including heavy rains between March and May that caused severe flooding affecting over 20 counties in Kenya. The floods led to the deaths of 291 people, injuries to 188, 75 went missing, and the displacement of over 55,776 families.
        </p>
        <p>
          These repeated emergencies highlighted a critical gap in emergency preparedness and response, despite efforts from organizations like St. John&apos;s Ambulance, Red Cross Kenya, and the National Disaster Management Unit (NDMU). Recognizing the urgent need for lifesaving skills and community resilience, Scout Emergency Response was established.
        </p>
        <p>
          Our initiative focuses on equipping individuals, especially the youth, with first aid and emergency response training to reduce the burden on healthcare systems and save lives. We are committed to building a safer, more prepared community through awareness, skill-building, and strategic action.
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

      <section className="about-team">
        <h2>Our Team</h2>
        <p>
          SER is powered by youth leaders, volunteer trainers, and community partners who coordinate local response efforts. Each team member brings a mix of scouting experience, emergency readiness training, and a shared commitment to serve during crises.
        </p>
        <h3>Meet the Team (7 Teammates)</h3>
        <div className="team-grid">
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Team lead placeholder portrait" />
            <h4>Team Lead</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Lead trainer placeholder portrait" />
            <h4>Lead Trainer</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Programs lead placeholder portrait" />
            <h4>Programs Lead</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Volunteer coordinator placeholder portrait" />
            <h4>Volunteer Coordinator</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Finance officer placeholder portrait" />
            <h4>Finance Officer</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Secretary placeholder portrait" />
            <h4>Secretary</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Media and communication placeholder portrait" />
            <h4>Media &amp; Communication</h4>
          </article>
        </div>
        <h3>Volunteer Team (3 Volunteers)</h3>
        <div className="team-grid">
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Volunteer placeholder portrait" />
            <h4>Volunteers</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Legal counsel placeholder portrait" />
            <h4>Lead Psychologist</h4>
          </article>
          <article className="team-card">
            <img src="https://via.placeholder.com/160" alt="Social media management placeholder portrait" />
            <h4>Communications Lead</h4>
          </article>
        </div>
        <p>
          Your role could be next, and we’ll help shape the title together based on your strengths and the needs of the mission.
        </p>
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
