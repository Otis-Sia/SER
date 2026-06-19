import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-links">
        <div className="footer-group">
          <h3>Connect</h3>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          </div>
        </div>
        <div className="footer-group">
          <h3>Contact</h3>
          <div className="footer-contact">
            <a href="mailto:scoutsemergencyresponse@gmail.com">scoutsemergencyresponse@gmail.com</a>
            <a href="tel:+254742435314">+254 742 435 314</a>
            <a href="https://wa.me/254742435314" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>

      <p>&copy; 2025 Scouts Emergency Response. All rights reserved.</p>
      <div className="footer-bottom-text">
        Youths / Volunteers / Members...
      </div>
    </footer>
  );
}
