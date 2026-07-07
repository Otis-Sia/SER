import Link from 'next/link';
import SocialIcons from './SocialIcons';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-column footer-brand">
            <div className="footer-logo">
              <img src="/assets/images/brand/logo.svg" alt="SER Logo" />
              <span>Scout's Emergency Response</span>
            </div>
            <p className="footer-tagline">
              Compassion in Action — equipping scouts with life-saving skills and fostering community resilience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-nav">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul className="footer-contact-list">
              <li>
                <span className="footer-contact-label">Email</span>
                <a href="mailto:scoutsemergencyresponse@gmail.com">scoutsemergencyresponse@gmail.com</a>
              </li>
              <li>
                <span className="footer-contact-label">Phone</span>
                <a href="tel:+254742435314">+254 742 435 314</a>
              </li>
              <li>
                <span className="footer-contact-label">WhatsApp</span>
                <a href="https://wa.me/254742435314" target="_blank" rel="noopener noreferrer">Chat with us</a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="footer-column">
            <h3>Connect</h3>
            <p className="footer-connect-text">Follow us on social media for updates, events, and stories from the field.</p>
            <SocialIcons />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Scouts Emergency Response. All rights reserved.</p>
          <p className="footer-subtitle">Youths &middot; Volunteers &middot; Members</p>
        </div>
      </div>
    </footer>
  );
}
