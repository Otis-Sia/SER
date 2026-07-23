'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    botcheck: false,
  });
  const [status, setStatus] = useState({
    submitting: false,
    succeeded: false,
    error: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Anti-spam check: honeypot field must remain unchecked
    if (formData.botcheck) {
      setStatus({ submitting: false, succeeded: true, error: null });
      return;
    }

    // Basic client-side validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({
        submitting: false,
        succeeded: false,
        error: 'Please fill in all required fields.',
      });
      return;
    }

    setStatus({ submitting: true, succeeded: false, error: null });

    try {
      const response = await fetch('https://splitforms.com/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: '8789084bed8d420589cd99bd80534fe4',
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ submitting: false, succeeded: true, error: null });
        setFormData({ name: '', email: '', phone: '', message: '', botcheck: false });
      } else {
        setStatus({
          submitting: false,
          succeeded: false,
          error: result.message || 'Something went wrong. Please try again later.',
        });
      }
    } catch (err) {
      setStatus({
        submitting: false,
        succeeded: false,
        error: 'Network error. Please check your connection and try again.',
      });
    }
  };

  if (status.succeeded) {
    return (
      <div
        className="contact-success-message"
        role="alert"
        aria-live="polite"
        style={{
          padding: '1.5rem',
          backgroundColor: '#e6f4ea',
          color: '#137333',
          border: '1px solid #ceead6',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '1rem',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>Thanks, we got it!</h3>
        <p style={{ margin: 0 }}>
          Your message has been sent successfully. We will get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ submitting: false, succeeded: false, error: null })}
          className="btn"
          style={{ marginTop: '1.25rem', backgroundColor: '#137333', color: '#ffffff' }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact Form">
      {/* SplitForms Required Hidden Access Key */}
      <input type="hidden" name="access_key" value="8789084bed8d420589cd99bd80534fe4" />

      {/* Spam trap honeypot (hidden from real users) */}
      <input
        type="checkbox"
        name="botcheck"
        checked={formData.botcheck}
        onChange={handleChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {status.error && (
        <div
          className="contact-error-message"
          role="alert"
          style={{
            padding: '1rem',
            marginBottom: '1.25rem',
            backgroundColor: '#fce8e6',
            color: '#c5221f',
            border: '1px solid #fad2cf',
            borderRadius: '6px',
            fontSize: '0.95rem',
          }}
        >
          {status.error}
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500' }}>
          Full Name <span style={{ color: '#c5221f' }}>*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          required
          aria-required="true"
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500' }}>
          Email Address <span style={{ color: '#c5221f' }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          aria-required="true"
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500' }}>
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="message" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '500' }}>
          Message <span style={{ color: '#c5221f' }}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={formData.message}
          onChange={handleChange}
          placeholder="How can we help?"
          required
          aria-required="true"
        ></textarea>
      </div>

      <button
        type="submit"
        className="btn"
        disabled={status.submitting}
        style={{
          width: '100%',
          opacity: status.submitting ? 0.7 : 1,
          cursor: status.submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {status.submitting ? 'Sending Message...' : 'Send Message'}
      </button>
    </form>
  );
}
