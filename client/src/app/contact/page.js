import Link from 'next/link';

export const metadata = {
  title: 'Contact SER | Scouts Emergency Response',
};

export default function Contact() {
  return (
    <>
      <section className="contact-intro page-hero">
        <h1>Contact Us</h1>
        <p>
          Want to partner, volunteer, request training, or ask a question? Reach out and the SER team will respond as soon as possible.
        </p>
      </section>

      <section className="contact-form">
        <h2>Send a Message</h2>
        <form action="#" method="post">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" placeholder="Your name" required />

          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" placeholder="you@example.com" required />

          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows="6" placeholder="How can we help?" required></textarea>

          <button type="submit" className="btn">Send Message</button>
        </form>
      </section>

      <section className="contact-info">
        <h2>Other Ways to Reach Us</h2>
        <ul style={{ paddingLeft: 0 }}>
          <li>
            <strong>Email:</strong>{' '}
            <a href="mailto:scoutsemergencyresponse@gmail.com">scoutsemergencyresponse@gmail.com</a>
          </li>
          <li>
            <strong>Phone:</strong>{' '}
            <a href="tel:+254742435314">+254 742 435 314</a>
          </li>
          <li>
            <strong>WhatsApp:</strong>{' '}
            <a href="https://wa.me/254742435314" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
          </li>
        </ul>

        <h3 className="mt-1_5">Follow SER on Social Media</h3>
        <div className="contact-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </section>

      <section className="contact-cta text-center">
        <h2>Want to Join SER?</h2>
        <p>
          Register to become part of our growing network of Scouts, volunteers, and responders.
        </p>
      </section>
    </>
  );
}
