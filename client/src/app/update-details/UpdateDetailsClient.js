'use client';

import { useState } from 'react';
import JoinForm from '../community/JoinForm';
import { findMemberRegistration } from '../admin/actions';
import { FiSearch, FiAlertCircle } from "react-icons/fi";
import { Country } from '../../lib/countryData';
import SearchableSelect from '../../components/SearchableSelect';

const ID_TYPES = ['National ID', 'Passport', 'Alien ID', 'Military ID', 'Refugee ID', 'N/A'];
const allCountriesRaw = Country.getAllCountries();
const ALL_COUNTRIES = allCountriesRaw.map(c => ({
  value: c.name,
  label: (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src={`https://flagcdn.com/w20/${c.isoCode.toLowerCase()}.png`} 
        srcSet={`https://flagcdn.com/w40/${c.isoCode.toLowerCase()}.png 2x`}
        width="20" 
        alt={c.isoCode} 
        style={{ borderRadius: '2px' }}
      />
      {c.name}
    </div>
  ),
  textLabel: c.name,
  isoCode: c.isoCode,
  phonecode: c.phonecode
}));

export default function UpdateDetailsClient() {
  const [searchState, setSearchState] = useState('idle'); // idle | searching | found | not-found
  const [nationality, setNationality] = useState('Kenya');
  const [idType, setIdType] = useState('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [contactStr, setContactStr] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSearchState('searching');
    
    const result = await findMemberRegistration(idNumber, contactStr, nationality, idType);
    
    if (result.success && result.data) {
      if (result.data.flaggedByEmail === 'self-updated-once') {
        setErrorMsg('You have already updated your details. Each member is only allowed to update their details once. If you need to make further changes, please contact support.');
        setSearchState('not-found');
      } else {
        setMemberData(result.data);
        setSearchState('found');
      }
    } else {
      setErrorMsg(result.message || 'No match found.');
      setSearchState('not-found');
    }
  };

  if (searchState === 'found') {
    return (
      <section className="community-main">
        <JoinForm initialData={memberData} isUpdateMode={true} />
      </section>
    );
  }

  if (searchState === 'not-found') {
    const isAlreadyUpdated = errorMsg.includes('already updated');
    return (
      <section className="community-main" style={{ textAlign: 'center' }}>
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '2rem', display: 'inline-block', maxWidth: '600px' }}>
          <FiAlertCircle size={32} style={{ marginBottom: '1rem', display: 'block', margin: '0 auto' }} />
          <h3>{isAlreadyUpdated ? 'Update Blocked' : 'No Match Found'}</h3>
          <p style={{ marginTop: '0.5rem' }}>{errorMsg}</p>
          {!isAlreadyUpdated && (
            <>
              <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Please check your ID and contact details and try again, or fill the form below to register as a new member.</p>
              <button className="btn" onClick={() => setSearchState('idle')} style={{ background: '#991b1b' }}>
                Try Again
              </button>
            </>
          )}
          {isAlreadyUpdated && (
            <button className="btn" onClick={() => setSearchState('idle')} style={{ background: '#4a5568', marginTop: '1rem' }}>
              Back to Search
            </button>
          )}
        </div>
        <JoinForm />
      </section>
    );
  }

  return (
    <section className="community-main" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Find Your Record</h2>
        <form onSubmit={handleSearch}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nationality</label>
            <SearchableSelect
              id="nationality"
              name="nationality"
              value={nationality}
              onChange={(e) => {
                setNationality(e.target.value);
              }}
              options={ALL_COUNTRIES}
              placeholder="Select nationality"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="idType" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Identity Type</label>
            <select
              id="idType"
              name="idType"
              value={idType}
              onChange={(e) => {
                const val = e.target.value;
                setIdType(val);
                if (val === 'N/A') {
                  setIdNumber('0000');
                } else if (idNumber === '0000') {
                  setIdNumber('');
                }
              }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}
              required
            >
              {ID_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{idType === 'N/A' ? 'Identity' : idType} Number</label>
            <input 
              type="text" 
              required
              value={idNumber}
              onChange={(e) => {
                let val = e.target.value;
                if (nationality === 'Kenya' && idType === 'National ID') {
                  val = val.replace(/\D/g, '');
                }
                setIdNumber(val);
              }}
              placeholder={`Enter your ${idType === 'N/A' ? 'ID' : idType} Number`}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', display: 'block' }}>If you do not have an ID number, please use "0000" (or choose Identity Type "N/A")</span>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email OR Phone Number</label>
            <input 
              type="text" 
              required
              value={contactStr}
              onChange={(e) => setContactStr(e.target.value)}
              placeholder="e.g., example@mail.com or 0712345678"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" disabled={searchState === 'searching'} style={{ width: '100%', padding: '0.85rem', background: '#047857', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <FiSearch /> {searchState === 'searching' ? 'Searching...' : 'Search Record'}
          </button>
        </form>
      </div>
    </section>
  );
}
