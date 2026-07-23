'use client';

import { useForm, ValidationError } from '@formspree/react';

export default function ContactForm() {
  const [state, handleSubmit] = useForm('xdaqlwlw');

  if (state.succeeded) {
    return (
      <div className="contact-success-message" style={{ padding: '1.5rem', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Thank you!</h3>
        <p>Your message has been sent successfully. We will get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Full Name</label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Your name"
        required
      />
      <ValidationError prefix="Name" field="name" errors={state.errors} />

      <label htmlFor="email">Email Address</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="you@example.com"
        required
      />
      <ValidationError prefix="Email" field="email" errors={state.errors} />

      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        name="message"
        rows="6"
        placeholder="How can we help?"
        required
      ></textarea>
      <ValidationError prefix="Message" field="message" errors={state.errors} />

      <button type="submit" className="btn" disabled={state.submitting}>
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
