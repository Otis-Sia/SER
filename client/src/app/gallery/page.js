import Link from 'next/link';

export const metadata = {
  title: 'Gallery | Scouts Emergency Response',
};

export default function Gallery() {
  return (
    <>
      <section className="gallery-intro page-hero text-center">
        <h1>Our Gallery</h1>
        <p className="intro-text">
          A collection of moments from our events, projects, trainings, and community activities. (Tip: replace the placeholder images with real SER photos when ready.)
        </p>
      </section>

      <section className="gallery-section">
        <div className="gallery-grid">
          <div className="gallery-item">
            <a href="https://3.bp.blogspot.com/-rnOzbc-hyHE/Wo9tcLiRrEI/AAAAAAAAD60/JJ5hoKkHP8Y0WE0Jq7OlxQa0hEYuif4bQCLcBGAs/s1600/Lord%2BBaden-Powell.jpg" title="Robert Baden-Powell">
              <img src="https://3.bp.blogspot.com/-rnOzbc-hyHE/Wo9tcLiRrEI/AAAAAAAAD60/JJ5hoKkHP8Y0WE0Jq7OlxQa0hEYuif4bQCLcBGAs/s1600/Lord%2BBaden-Powell.jpg" alt="Robert Baden-Powell" />
              <div className="overlay">
                <span className="overlay-title">Robert Baden-Powell</span>
                <span className="overlay-action">View Image</span>
              </div>
            </a>
          </div>

          <div className="gallery-item">
            <a href="https://tse3.mm.bing.net/th/id/OIP.QB05OWneQm76l48t7mQKLwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" title="Team Building Exercise">
              <img src="https://tse3.mm.bing.net/th/id/OIP.QB05OWneQm76l48t7mQKLwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" alt="Team building exercise" />
              <div className="overlay">
                <span className="overlay-title">Team Building Exercise</span>
                <span className="overlay-action">View Image</span>
              </div>
            </a>
          </div>

          <div className="gallery-item">
            <a href="https://tse3.mm.bing.net/th/id/OIP.6oWV6nHbsSzQOvgE53-5sAHaFE?rs=1&pid=ImgDetMain&o=7&rm=3" title="First Aid Training">
              <img src="https://tse3.mm.bing.net/th/id/OIP.6oWV6nHbsSzQOvgE53-5sAHaFE?rs=1&pid=ImgDetMain&o=7&rm=3" alt="First aid training session" />
              <div className="overlay">
                <span className="overlay-title">First Aid Training</span>
                <span className="overlay-action">View Image</span>
              </div>
            </a>
          </div>

          <div className="gallery-item">
            <a href="/assets/images/gallery/community-cleanup.jpg" title="Community Cleanup Drive">
              <img src="/assets/images/gallery/community-cleanup.jpg" alt="Community cleanup drive" />
              <div className="overlay">
                <span className="overlay-title">Community Cleanup Drive</span>
                <span className="overlay-action">View Image</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="gallery-cta text-center">
        <h2>Want to Be Part of These Moments?</h2>
        <p className="intro-text">
          Join our trainings and events, volunteer during outreach, or partner with SER to strengthen community readiness.
        </p>

        <div className="cta-actions">
          <Link href="/events" className="btn">View Events</Link>
          <Link href="/contact" className="btn btn-accent">Contact SER</Link>
        </div>
      </section>
    </>
  );
}
