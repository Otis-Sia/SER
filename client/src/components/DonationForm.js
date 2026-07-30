'use client';

import { useState } from 'react';

export default function DonationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: 500,
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pesapal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error('No redirect URL provided');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDonate} className="donation-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
      {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', background: '#fee' }}>{error}</div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label htmlFor="amount" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Amount (KES) *</label>
        <input 
          type="number" 
          id="amount" 
          name="amount" 
          value={formData.amount} 
          onChange={handleChange} 
          required 
          min="10"
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
          <label htmlFor="firstName" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>First Name *</label>
          <input 
            type="text" 
            id="firstName" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            required 
            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', flex: 1 }}>
          <label htmlFor="lastName" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Last Name *</label>
          <input 
            type="text" 
            id="lastName" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            required 
            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label htmlFor="email" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Email Address *</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label htmlFor="phone" style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
        style={{ padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Processing...' : 'Donate with PesaPal'}
      </button>
    </form>
  );
}
