'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle } from '../../components/Icons';
const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans-Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function JoinPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    county: '',
    subCounty: '',
    crew: '',
    bloodType: '',
    email: '',
    whatsapp: '',
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          middle_name: formData.middleName || null,
          last_name: formData.lastName,
          county: formData.county,
          sub_county: formData.subCounty,
          crew: formData.crew,
          blood_type: formData.bloodType || null,
          email: formData.email,
          whatsapp: formData.whatsapp,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setFormData({
        firstName: '',
        middleName: '',
        lastName: '',
        county: '',
        subCounty: '',
        crew: '',
        bloodType: '',
        email: '',
        whatsapp: '',
      });
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="join-hero page-hero">
        <h1>Join SER</h1>
        <p>
          Become part of the Scouts Emergency Response family. Fill in the form
          below to register as a member and start making a difference in your
          community.
        </p>
      </section>

      {/* Form Section */}
      <section className="join-form-section">
        <div className="join-form-card">
          <div className="join-form-header">
            <span className="join-form-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '8px' }}><Shield size={32} /></span>
            <h2>Membership Registration</h2>
            <p>Fields marked with <span className="required-star">*</span> are required</p>
          </div>

          {status === 'success' ? (
            <div className="join-success">
              <div className="join-success-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#10b981' }}><CheckCircle size={48} /></div>
              <h3>Registration Successful!</h3>
              <p>
                Welcome to Scouts Emergency Response! We&apos;ve received your
                application. Our team will reach out to you shortly via email or
                WhatsApp.
              </p>
              <button
                className="btn"
                type="button"
                onClick={() => setStatus('idle')}
              >
                Register Another Member
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Name Row */}
              <fieldset className="join-fieldset">
                <legend>Personal Information</legend>
                <div className="join-row join-row--3">
                  <div className="join-field">
                    <label htmlFor="firstName">
                      First Name <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="join-field">
                    <label htmlFor="middleName">Middle Name</label>
                    <input
                      type="text"
                      id="middleName"
                      name="middleName"
                      placeholder="Optional"
                      value={formData.middleName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="join-field">
                    <label htmlFor="lastName">
                      Last Name <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="e.g. Mwangi"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Location Row */}
              <fieldset className="join-fieldset">
                <legend>Location</legend>
                <div className="join-row join-row--2">
                  <div className="join-field">
                    <label htmlFor="county">
                      County <span className="required-star">*</span>
                    </label>
                    <select
                      id="county"
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your county</option>
                      {KENYAN_COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="join-field">
                    <label htmlFor="subCounty">
                      Sub-County <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="subCounty"
                      name="subCounty"
                      placeholder="e.g. Langata"
                      value={formData.subCounty}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Crew & Blood Type */}
              <fieldset className="join-fieldset">
                <legend>Scouting Details</legend>
                <div className="join-row join-row--2">
                  <div className="join-field">
                    <label htmlFor="crew">
                      Crew <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="crew"
                      name="crew"
                      placeholder="Your Scout crew name"
                      value={formData.crew}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="join-field">
                    <label htmlFor="bloodType">Blood Type</label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                    >
                      <option value="">Select (optional)</option>
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Contact Row */}
              <fieldset className="join-fieldset">
                <legend>Contact Information</legend>
                <div className="join-row join-row--2">
                  <div className="join-field">
                    <label htmlFor="email">
                      Email <span className="required-star">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="join-field">
                    <label htmlFor="whatsapp">
                      WhatsApp Number <span className="required-star">*</span>
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      placeholder="+254 7XX XXX XXX"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Error */}
              {status === 'error' && (
                <div className="join-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'flex', color: '#ef4444' }}><AlertTriangle size={20} /></span> {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn join-submit-btn"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <>
                    <span className="join-spinner" /> Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="join-info text-center">
        <h2>What Happens Next?</h2>
        <div className="join-steps">
          <div className="join-step">
            <span className="join-step-number">1</span>
            <h3>Apply</h3>
            <p>Fill in the registration form above with your details.</p>
          </div>
          <div className="join-step">
            <span className="join-step-number">2</span>
            <h3>Review</h3>
            <p>Our team reviews your application and verifies your details.</p>
          </div>
          <div className="join-step">
            <span className="join-step-number">3</span>
            <h3>Welcome</h3>
            <p>You&apos;ll be welcomed into SER and connected with your crew.</p>
          </div>
        </div>
      </section>
    </>
  );
}
