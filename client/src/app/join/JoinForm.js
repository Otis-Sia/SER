'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, MessageSquare } from '../../components/Icons';
import { FaWhatsapp } from "react-icons/fa";
import { FiCheckCircle, FiInfo, FiClipboard, FiCheck, FiEdit2, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { submitMemberRegistration } from '../admin/actions';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A (Don\'t know)'];

export default function JoinForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentAddress: '',
    otherAddress: '',
    phone: '',
    idNumber: '',
    dob: '',
    gender: 'Male',
    bloodType: 'N/A (Don\'t know)',
    nextOfKinName: '',
    nextOfKinPhone: '',
    communityPreparedness: '',
    calendarRecommendations: '',
    memberGoals: '',
    isScout: 'Yes',
    crewDetails: '',
    educationLevel: '',
    trainings: [],
    certifications: '',
    availability: 'Very available',
    willingToParticipate: 'Yes',
    whyJoin: '',
    hopeToContribute: '',
    declaration: false,
  });

  // Workflow steps: 'fill' | 'proofread' | 'whatsapp' | 'success'
  const [step, setStep] = useState('fill');
  const [waChoice, setWaChoice] = useState(null); // null | 'no'
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Validate Sections 1-7
  const isForm1To7Filled =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.idNumber.trim() !== '' &&
    formData.dob.trim() !== '' &&
    formData.currentAddress.trim() !== '' &&
    formData.otherAddress.trim() !== '' &&
    formData.nextOfKinName.trim() !== '' &&
    formData.nextOfKinPhone.trim() !== '' &&
    formData.educationLevel.trim() !== '' &&
    formData.crewDetails.trim() !== '' &&
    formData.trainings.length > 0 &&
    formData.certifications.trim() !== '' &&
    formData.communityPreparedness.trim() !== '' &&
    formData.whyJoin.trim() !== '' &&
    formData.hopeToContribute.trim() !== '' &&
    formData.calendarRecommendations.trim() !== '' &&
    formData.memberGoals.trim() !== '';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTrainingToggle = (option) => {
    setFormData((prev) => {
      let current = [...prev.trainings];
      if (option === 'None of the above') {
        current = current.includes(option) ? [] : [option];
      } else {
        current = current.filter((item) => item !== 'None of the above');
        if (current.includes(option)) {
          current = current.filter((item) => item !== option);
        } else {
          current.push(option);
        }
      }
      return { ...prev, trainings: current };
    });
  };

  // Step 1 & 2 -> Move to Proofread
  const handleProceedToProofread = (e) => {
    e.preventDefault();
    if (!isForm1To7Filled) {
      setErrorMessage('Please complete all required fields in Sections 1–7 above.');
      setStatus('error');
      return;
    }
    if (!formData.declaration) {
      setErrorMessage('You must agree to the Declaration in Section 8 before proceeding.');
      setStatus('error');
      return;
    }
    setErrorMessage('');
    setStatus('idle');
    setStep('proofread');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Execute Final Form Submission to Database
  const executeSubmission = async (joinedWhatsappBool) => {
    setStatus('submitting');
    setErrorMessage('');

    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0] || '';

    const payload = {
      ...formData,
      joinedWhatsapp: joinedWhatsappBool,
      firstName,
      lastName,
      middleName: nameParts.length > 2 ? nameParts[1] : '',
      county: formData.currentAddress.includes('-') ? formData.currentAddress.split('-').pop().trim() : formData.currentAddress,
      subCounty: formData.currentAddress.includes('-') ? formData.currentAddress.split('-')[0].trim() : formData.currentAddress,
      crew: formData.crewDetails || 'N/A',
      whatsapp: formData.phone,
    };

    try {
      const result = await submitMemberRegistration(payload);
      if (!result.success) {
        throw new Error(result.message || 'Something went wrong. Please try again.');
      }

      setSubmittedData(result.data || payload);
      setStatus('success');
      setStep('success');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setStep('fill');
    setWaChoice(null);
    setSubmittedData(null);
    setErrorMessage('');
    setFormData({
      name: '',
      email: '',
      currentAddress: '',
      otherAddress: '',
      phone: '',
      idNumber: '',
      dob: '',
      gender: 'Male',
      bloodType: 'N/A (Don\'t know)',
      nextOfKinName: '',
      nextOfKinPhone: '',
      communityPreparedness: '',
      calendarRecommendations: '',
      memberGoals: '',
      isScout: 'Yes',
      crewDetails: '',
      educationLevel: '',
      trainings: [],
      certifications: '',
      availability: 'Very available',
      willingToParticipate: 'Yes',
      whyJoin: '',
      hopeToContribute: '',
      joinedWhatsapp: false,
      declaration: false,
    });
  };

  return (
    <div className="join-form-card">
      <div className="join-form-header">
        <span className="join-form-icon" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '8px' }}>
          <Shield size={32} />
        </span>
        <h2>SER Volunteer Registration Form</h2>
        <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
          Scouts Emergency Response is a youth initiative that equips young people and communities with essential first aid and emergency response skills.
        </p>
      </div>

      {/* STAGE 4: SUCCESS SCREEN */}
      {step === 'success' && status === 'success' ? (
        <div className="join-success">
          <div className="join-success-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#10b981' }}>
            <CheckCircle size={56} />
          </div>
          <h3>Application Submitted Successfully!</h3>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.25rem', lineHeight: '1.6' }}>
            Thank you for registering with Scouts Emergency Response (SER). Your information has been securely recorded. Our leadership team will review your application and contact you soon.
          </p>
          
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            padding: '1rem',
            maxWidth: '500px',
            margin: '0 auto 1.5rem',
            textAlign: 'left'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#047857' }}>
              <strong>Status:</strong> Registration stored in database
              <br />
              <strong>WhatsApp Group Status:</strong> {submittedData?.joinedWhatsapp ? <><FiCheckCircle style={{ marginRight: '4px', color: '#10b981' }} /> Registered as Group Member</> : <><FiInfo style={{ marginRight: '4px', color: '#3b82f6' }} /> Skipped / Not joined yet</>}
            </p>
          </div>

          <button className="btn" type="button" onClick={handleReset}>
            Register Another Member
          </button>
        </div>
      ) : step === 'whatsapp' ? (
        /* STAGE 3: WHATSAPP GROUP STEP */
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(18, 140, 126, 0.05) 100%)',
            border: '1.5px solid #25D366',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ color: '#128C7E', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <MessageSquare size={24} />
              Final Step: Official SER WhatsApp Group
            </h3>

            <p style={{ fontSize: '1rem', color: '#0f172a', margin: '1rem 0', fontWeight: 500 }}>
              Are you already a member of our official SER WhatsApp Group?
            </p>

            {/* Step 4: Answer whether part of WA group */}
            {waChoice === null && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', flex: 1, minWidth: '180px', padding: '0.85rem 1.25rem' }}
                  disabled={status === 'submitting'}
                  onClick={() => executeSubmission(true)}
                >
                  <FaWhatsapp style={{ marginRight: '6px' }} /> Yes, I am a Member <FiArrowRight style={{ marginLeft: '4px' }} /> Submit Form
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#64748b', borderColor: '#64748b', color: 'white', flex: 1, minWidth: '180px', padding: '0.85rem 1.25rem' }}
                  disabled={status === 'submitting'}
                  onClick={() => setWaChoice('no')}
                >
                  No, I am Not a Member Yet
                </button>
              </div>
            )}

            {/* Step 5: If No, present single tap link button to join & submit simultaneously */}
            {waChoice === 'no' && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed #cbd5e1', animation: 'fadeIn 0.3s ease' }}>
                <p style={{ fontSize: '0.95rem', color: '#334155', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  We invite you to join our official WhatsApp group for real-time announcements, training schedules, and emergency response updates. Tap below to join and submit:
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://chat.whatsapp.com/L8q012XwN6B0jX7z9k0S"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn join-whatsapp-link"
                    style={{
                      backgroundColor: '#25D366',
                      borderColor: '#25D366',
                      color: 'white',
                      flex: 2,
                      minWidth: '240px',
                      padding: '0.85rem 1.25rem',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textDecoration: 'none',
                      margin: 0
                    }}
                    onClick={() => executeSubmission(true)}
                  >
                    <FaWhatsapp style={{ marginRight: '8px', fontSize: '1.3rem' }} /> Tap to Join WhatsApp Group &amp; Submit Application
                  </a>

                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: '#94a3b8', borderColor: '#94a3b8', color: 'white', flex: 1, minWidth: '180px', padding: '0.85rem 1.25rem' }}
                    disabled={status === 'submitting'}
                    onClick={() => executeSubmission(false)}
                  >
                    {status === 'submitting' ? 'Submitting...' : 'Skip Group & Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {status === 'error' && (
            <div className="join-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', color: '#ef4444', flexShrink: 0 }}>
                <AlertTriangle size={20} />
              </span>{' '}
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            className="clearBtn"
            style={{ marginTop: '1rem' }}
            onClick={() => setStep('proofread')}
          >
            <FiArrowLeft style={{ marginRight: '6px' }} /> Back to Proofread Summary
          </button>
        </div>
      ) : step === 'proofread' ? (
        /* STAGE 2: PROOFREAD / PREVIEW STEP */
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiClipboard style={{ marginRight: '6px' }} /> Step 3: Proofread &amp; Review Your Application
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Please carefully review your responses below to ensure all details are accurate before final submission.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Section 1 summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>1. Personal Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div><strong>Full Name:</strong> <div>{formData.name}</div></div>
                  <div><strong>Email Address:</strong> <div>{formData.email}</div></div>
                  <div><strong>Phone Number:</strong> <div>{formData.phone}</div></div>
                  <div><strong>National ID No:</strong> <div>{formData.idNumber}</div></div>
                  <div><strong>Date of Birth:</strong> <div>{formData.dob}</div></div>
                  <div><strong>Gender:</strong> <div>{formData.gender}</div></div>
                  <div><strong>Blood Type:</strong> <div>{formData.bloodType}</div></div>
                </div>
              </div>

              {/* Section 2 summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>2. Address &amp; Residence</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div><strong>Current Residence:</strong> <div>{formData.currentAddress}</div></div>
                  <div><strong>Other Address:</strong> <div>{formData.otherAddress}</div></div>
                </div>
              </div>

              {/* Section 3 summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>3. Next of Kin</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div><strong>Next of Kin Name:</strong> <div>{formData.nextOfKinName}</div></div>
                  <div><strong>Next of Kin Phone:</strong> <div>{formData.nextOfKinPhone}</div></div>
                </div>
              </div>

              {/* Section 4 summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>4. Scouting &amp; Education</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div><strong>Is Scout:</strong> <div>{formData.isScout}</div></div>
                  <div><strong>Crew Details:</strong> <div>{formData.crewDetails}</div></div>
                  <div><strong>Highest Education:</strong> <div>{formData.educationLevel}</div></div>
                </div>
              </div>

              {/* Section 5 summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>5. Experience &amp; Training</h4>
                <div style={{ fontSize: '0.9rem' }}>
                  <div><strong>Trainings / Experience:</strong> <div>{formData.trainings.join(', ')}</div></div>
                  <div style={{ marginTop: '0.5rem' }}><strong>Certifications:</strong> <div>{formData.certifications}</div></div>
                </div>
              </div>

              {/* Section 6 summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>6. Preparedness &amp; Availability</h4>
                <div style={{ fontSize: '0.9rem' }}>
                  <div><strong>Community Preparedness:</strong> <div>{formData.communityPreparedness}</div></div>
                  <div style={{ marginTop: '0.5rem' }}><strong>Availability Level:</strong> <div>{formData.availability}</div></div>
                  <div style={{ marginTop: '0.5rem' }}><strong>Willing to Participate:</strong> <div>{formData.willingToParticipate}</div></div>
                </div>
              </div>

              {/* Section 7 summary */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)' }}>7. Goals &amp; Calendar Recommendations</h4>
                <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>Why Join SER:</strong> <div>{formData.whyJoin}</div></div>
                  <div><strong>Hope to Contribute:</strong> <div>{formData.hopeToContribute}</div></div>
                  <div><strong>2026 Calendar Recommendations:</strong> <div>{formData.calendarRecommendations}</div></div>
                  <div><strong>Member Goals:</strong> <div>{formData.memberGoals}</div></div>
                </div>
              </div>

              {/* Section 8 Declaration confirmation */}
              <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '8px', border: '1px solid #10b981', fontSize: '0.9rem', color: '#065f46' }}>
                <strong><FiCheck style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Declaration Confirmed:</strong> Legal guidelines and terms accepted.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: '#64748b', borderColor: '#64748b', color: 'white', flex: 1, minWidth: '180px' }}
              onClick={() => { setStep('fill'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
            >
              <FiEdit2 style={{ marginRight: '6px' }} /> Edit Answers
            </button>
            <button
              type="button"
              className="btn"
              style={{ flex: 2, minWidth: '220px' }}
              onClick={() => { setStep('whatsapp'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
            >
              <FiCheckCircle style={{ marginRight: '6px' }} /> Answers Look Good <FiArrowRight style={{ marginLeft: '4px' }} /> Continue to Final Step
            </button>
          </div>
        </div>
      ) : (
        /* STAGE 1: FORM FILLING (Questions 1-7 + Declaration) */
        <form onSubmit={handleProceedToProofread} autoComplete="off">
          {/* Section 1: Personal Details */}
          <fieldset className="join-fieldset">
            <legend>1. Personal Details</legend>

            <div className="join-row join-row--2">
              <div className="join-field">
                <label htmlFor="name">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. John Doe Mwangi"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <span className="join-field-hint">(Insert full name)</span>
              </div>

              <div className="join-field">
                <label htmlFor="email">
                  Email Address <span className="required-star">*</span>
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
            </div>

            <div className="join-row join-row--2" style={{ marginTop: '1rem' }}>
              <div className="join-field">
                <label htmlFor="phone">
                  Phone Number <span className="required-star">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="e.g. 0712345678 or 0112345678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <span className="join-field-hint">(Begin with 07 or 01, Not +254)</span>
              </div>

              <div className="join-field">
                <label htmlFor="idNumber">
                  National Identification Number (ID No.) <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  placeholder="e.g. 12345678"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="join-row join-row--3" style={{ marginTop: '1rem' }}>
              <div className="join-field">
                <label htmlFor="dob">
                  Date of Birth <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="dob"
                  name="dob"
                  placeholder="DD/MM/YYYY"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
                <span className="join-field-hint">Format: DD/MM/YYYY</span>
              </div>

              <div className="join-field">
                <label htmlFor="gender">
                  Gender <span className="required-star">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="join-field">
                <label htmlFor="bloodType">
                  Blood Type <span className="required-star">*</span>
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                >
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
                <span className="join-field-hint">(Indicate N/A if you do not know)</span>
              </div>
            </div>
          </fieldset>

          {/* Section 2: Address & Location */}
          <fieldset className="join-fieldset">
            <legend>2. Address &amp; Residence</legend>

            <div className="join-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="currentAddress">
                Current Address - Sub-county and County <span className="required-star">*</span>
              </label>
              <textarea
                id="currentAddress"
                name="currentAddress"
                rows="2"
                placeholder="e.g. Thika West - Kiambu or Embakasi - Nairobi"
                value={formData.currentAddress}
                onChange={handleChange}
                required
              />
              <span className="join-field-hint">This refers to your main residence right now.</span>
            </div>

            <div className="join-field">
              <label htmlFor="otherAddress">
                Other Address (optional) - Sub-county and County <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="otherAddress"
                name="otherAddress"
                placeholder="e.g. school address, relative’s address, or N/A"
                value={formData.otherAddress}
                onChange={handleChange}
                required
              />
              <span className="join-field-hint">Indicate N/A if you have none</span>
            </div>
          </fieldset>

          {/* Section 3: Next of Kin */}
          <fieldset className="join-fieldset">
            <legend>3. Next of Kin</legend>

            <div className="join-row join-row--2">
              <div className="join-field">
                <label htmlFor="nextOfKinName">
                  Next of Kin Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="nextOfKinName"
                  name="nextOfKinName"
                  placeholder="Insert full name"
                  value={formData.nextOfKinName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="join-field">
                <label htmlFor="nextOfKinPhone">
                  Next of Kin Phone Number <span className="required-star">*</span>
                </label>
                <input
                  type="tel"
                  id="nextOfKinPhone"
                  name="nextOfKinPhone"
                  placeholder="e.g. 0712345678"
                  value={formData.nextOfKinPhone}
                  onChange={handleChange}
                  required
                />
                <span className="join-field-hint">(Begin with 07 or 01, Not +254)</span>
              </div>
            </div>
          </fieldset>

          {/* Section 4: Scouting & Education */}
          <fieldset className="join-fieldset">
            <legend>4. Scouting &amp; Education Background</legend>

            <div className="join-row join-row--2">
              <div className="join-field">
                <label>
                  Are you a Scout? <span className="required-star">*</span>
                </label>
                <div className="join-options-grid">
                  <label className="join-option-label">
                    <input
                      type="radio"
                      name="isScout"
                      value="Yes"
                      checked={formData.isScout === 'Yes'}
                      onChange={handleChange}
                    />
                    Yes
                  </label>
                  <label className="join-option-label">
                    <input
                      type="radio"
                      name="isScout"
                      value="No"
                      checked={formData.isScout === 'No'}
                      onChange={handleChange}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="join-field">
                <label htmlFor="educationLevel">
                  Highest Level of Education <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="educationLevel"
                  name="educationLevel"
                  placeholder="Primary, Secondary, University/College"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="join-field" style={{ marginTop: '1rem' }}>
              <label htmlFor="crewDetails">
                Scout Crew Details <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="crewDetails"
                name="crewDetails"
                placeholder="e.g. Alpha Rover Crew - Embakasi - Nairobi (or N/A)"
                value={formData.crewDetails}
                onChange={handleChange}
                required
              />
              <span className="join-field-hint">If not a scout, indicate N/A</span>
            </div>
          </fieldset>

          {/* Section 5: Experience & Training */}
          <fieldset className="join-fieldset">
            <legend>5. Experience &amp; Training</legend>

            <div className="join-field" style={{ marginBottom: '1rem' }}>
              <label>
                Do you have training or experience in the following: (Select all that apply) <span className="required-star">*</span>
              </label>
              <div className="join-options-grid">
                {['First Aid', 'Disaster Management', 'Medical or Health related', 'None of the above'].map((item) => (
                  <label key={item} className="join-option-label">
                    <input
                      type="checkbox"
                      checked={formData.trainings.includes(item)}
                      onChange={() => handleTrainingToggle(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="join-field">
              <label htmlFor="certifications">
                If trained, please specify certifications (if any) <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="certifications"
                name="certifications"
                placeholder="e.g. St. John First Aid, Red Cross BLS, or N/A"
                value={formData.certifications}
                onChange={handleChange}
                required
              />
              <span className="join-field-hint">If not trained, indicate N/A</span>
            </div>
          </fieldset>

          {/* Section 6: Preparedness & Availability */}
          <fieldset className="join-fieldset">
            <legend>6. Community Preparedness &amp; Availability</legend>

            <div className="join-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="communityPreparedness">
                Based on your current location, how would you describe the community’s level of preparedness to handle a disaster? <span className="required-star">*</span>
              </label>
              <textarea
                id="communityPreparedness"
                name="communityPreparedness"
                rows="3"
                placeholder="Describe local readiness, vulnerabilities, or existing response gaps..."
                value={formData.communityPreparedness}
                onChange={handleChange}
                required
              />
            </div>

            <div className="join-row join-row--2">
              <div className="join-field">
                <label>
                  How available are you for SER activities? <span className="required-star">*</span>
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  required
                >
                  <option value="Very available">Very available</option>
                  <option value="Occasionally available">Occasionally available</option>
                  <option value="Limited availability">Limited availability</option>
                </select>
              </div>

              <div className="join-field">
                <label>
                  Are you willing to actively participate in: Trainings, Webinars &amp; Deployments when called upon? <span className="required-star">*</span>
                </label>
                <div className="join-options-grid">
                  <label className="join-option-label">
                    <input
                      type="radio"
                      name="willingToParticipate"
                      value="Yes"
                      checked={formData.willingToParticipate === 'Yes'}
                      onChange={handleChange}
                    />
                    Yes
                  </label>
                  <label className="join-option-label">
                    <input
                      type="radio"
                      name="willingToParticipate"
                      value="No"
                      checked={formData.willingToParticipate === 'No'}
                      onChange={handleChange}
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Section 7: Goals & Contributions */}
          <fieldset className="join-fieldset">
            <legend>7. Goals &amp; Calendar Recommendations</legend>

            <div className="join-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="whyJoin">
                Why do you want to join SER? <span className="required-star">*</span>
              </label>
              <textarea
                id="whyJoin"
                name="whyJoin"
                rows="3"
                placeholder="Share your motivation for joining Scouts Emergency Response..."
                value={formData.whyJoin}
                onChange={handleChange}
                required
              />
            </div>

            <div className="join-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="hopeToContribute">
                What do you hope to contribute to SER? <span className="required-star">*</span>
              </label>
              <textarea
                id="hopeToContribute"
                name="hopeToContribute"
                rows="3"
                placeholder="Skills, time, ideas, enthusiasm, leadership..."
                value={formData.hopeToContribute}
                onChange={handleChange}
                required
              />
            </div>

            <div className="join-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="calendarRecommendations">
                What activities would you recommend for our 2026 calendar? <span className="required-star">*</span>
              </label>
              <textarea
                id="calendarRecommendations"
                name="calendarRecommendations"
                rows="3"
                placeholder="e.g. First aid workshops, community drills, blood drives..."
                value={formData.calendarRecommendations}
                onChange={handleChange}
                required
              />
            </div>

            <div className="join-field">
              <label htmlFor="memberGoals">
                What do you aim to achieve as a member of the team? <span className="required-star">*</span>
              </label>
              <textarea
                id="memberGoals"
                name="memberGoals"
                rows="3"
                placeholder="Personal growth, certifications, leadership experience..."
                value={formData.memberGoals}
                onChange={handleChange}
                required
              />
            </div>
          </fieldset>

          {/* Section 8: Declaration */}
          <fieldset className="join-fieldset">
            <legend>8. Declaration</legend>

            <div className="join-declaration-box">
              <label className="join-option-label" style={{ alignItems: 'flex-start', border: 'none', background: 'transparent' }}>
                <input
                  type="checkbox"
                  name="declaration"
                  checked={formData.declaration}
                  onChange={handleChange}
                  style={{ marginTop: '0.2rem', flexShrink: 0 }}
                  required
                />
                <span style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
                  <strong>Declaration:</strong> I hereby confirm that the information I have provided is true and accurate to the best of my knowledge. I understand that my participation in Scouts Emergency Response (SER) activities requires adherence to safety guidelines and that my details may be used for communication, coordination, and emergency response purposes. I agree to actively participate responsibly and uphold the values of SER. <span className="required-star">*</span>
                </span>
              </label>
            </div>
          </fieldset>

          {/* Error Banner */}
          {status === 'error' && (
            <div className="join-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', color: '#ef4444', flexShrink: 0 }}>
                <AlertTriangle size={20} />
              </span>{' '}
              {errorMessage}
            </div>
          )}

          {/* Proceed to Proofread Button */}
          <button type="submit" className="btn join-submit-btn">
            Review &amp; Proofread Application <FiArrowRight style={{ marginLeft: '6px' }} />
          </button>
        </form>
      )}
    </div>
  );
}
