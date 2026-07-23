import Link from 'next/link';
import { HeartPulse, Siren, Brain, Flame } from 'lucide-react';
import InteractiveInfiniteScroll from '../components/InteractiveInfiniteScroll';
import InstagramEmbed from '../components/InstagramEmbed';
import TiktokEmbed from '../components/TiktokEmbed';
import FacebookEmbed from '../components/FacebookEmbed';
import { getSiteContent } from './admin/actions';

export default async function Home() {
  const siteContent = await getSiteContent();
  return (
    <>
      <section className="hero page-hero">
        <h1>{siteContent.home.hero.heading}</h1>
        <p>{siteContent.home.hero.subheading}</p>
        <Link href={siteContent.home.hero.ctaLink} className="btn">{siteContent.home.hero.ctaText}</Link>
      </section>

      {/* Why Scouts Emergency Response Section */}
      <section className="why-scouts-container">
        <div className="why-scouts-content">
          <h2 className="brochure-title-white">Why Scouts Emergency Response?</h2>
          <p style={{ fontSize: '1.15rem', color: '#ffffff', opacity: '0.9', lineHeight: '1.7', marginBottom: '1.5rem', fontWeight: '400', maxWidth: '600px' }}>
            Scouts Emergency Response focuses on equipping young people for emergency Preparedness through trainings, conducted both physically and virtually.
          </p>
          <Link href="/contact" className="btn btn-accent" style={{ backgroundColor: '#ffffff', color: 'var(--brochure-green)', border: 'none', boxShadow: 'none' }}>
            Request Training
          </Link>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-us-container brochure-diagonal-accent">
        <div className="brochure-row">
          <div>
            <h2 className="brochure-title">About <span>Us</span></h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-color)', marginBottom: '1.5rem' }}>
              We are a youth-centered initiative that focuses on emergency preparedness and response skills among young people. The project aims to equip young people with practical knowledge and confidence to respond effectively during emergencies in schools, homes, and communities.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-color)', marginBottom: '1.5rem' }}>
              Through training, awareness, and hands-on learning, SER empowers young people to become first responders in their communities.
            </p>
            <Link href="/about" className="btn">Our Full Story</Link>
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
            {/* Geometric accents inside badge */}
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

      {/* What We Do Section */}
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

      <section className="home-register">
        <h2>Join the Response Network</h2>
        <p>Be part of the scouts and volunteers who train, respond, and serve across Kenya.</p>
        <Link href="/login/signup" className="btn btn-accent">Register</Link>
      </section>

      <section>
        <h2>On-the-Ground Moments</h2>
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
            {/* Duplicate for seamless scroll */}
            {siteContent.home.partners.map((partner, index) => (
              <span key={`partner-2-${index}`}>{partner}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
