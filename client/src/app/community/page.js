import Link from 'next/link';

export const metadata = {
  title: 'Community & Network | Scouts Emergency Response',
  description: 'Connect with Scouts, emergency responders, volunteers, and community leaders dedicated to safety, knowledge sharing, and emergency preparedness.',
  openGraph: {
    title: 'Community & Network | Scouts Emergency Response',
    description: 'Connect with Scouts, emergency responders, volunteers, and community leaders dedicated to safety, knowledge sharing, and emergency preparedness.',
    url: '/community',
  },
  alternates: {
    canonical: '/community',
  },
};

export default function Community() {
  return (
    <>
      <section className="community-intro page-hero">
        <h1>Join the SER Community</h1>
        <p>
          The SER Community brings together Scouts, volunteers, responders, and partners who share a passion for service, preparedness, and saving lives. This is where experiences are shared, ideas grow, and impact begins.
        </p>
      </section>

      <section className="community-pillars">
        <h2>What Our Community Does</h2>
        <div className="product-grid">
          <div className="product-card">
            <div className="product-card-info">
              <h3>Knowledge Sharing</h3>
              <p>
                Members exchange resources, emergency tips, training materials, and lessons learned from the field.
              </p>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>Volunteer Engagement</h3>
              <p>
                Connect with like-minded volunteers and take part in SER trainings, drills, and outreach programs.
              </p>
            </div>
          </div>

          <div className="product-card">
            <div className="product-card-info">
              <h3>Storytelling &amp; Impact</h3>
              <p>
                Read and share stories from Scouts and communities whose lives have been strengthened through preparedness and action.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="community-blog text-center">
        <h2>Community Blog &amp; Updates</h2>
        <p>
          We publish stories, insights, and updates from the SER field on our community blog. Follow along and stay informed.
        </p>
        <a href="https://your-blog-link.blogspot.com" target="_blank" rel="noopener noreferrer" className="btn">
          Visit Community Blog
        </a>
      </section>

      <section className="community-cta text-center">
        <h2>Be Part of the Action</h2>
        <p>
          Whether you&apos;re looking to volunteer, learn, or collaborate, the SER Community welcomes you.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/projects" className="btn">Explore Projects</Link>
          <Link href="/contact" className="btn">Get in Touch</Link>
          <Link href="/login/signup" className="btn btn-accent">Register</Link>
        </div>
      </section>
    </>
  );
}
