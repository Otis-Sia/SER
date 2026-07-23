"use client";

import { useState } from "react";
import { updatePassword } from "firebase/auth";
import { clearMustChangePassword } from "./actions";
import styles from "./admin.module.css";
import { FiLoader, FiLock } from "react-icons/fi";

export default function ChangePasswordScreen({ user, initialName, initialUsername, onPasswordChanged }) {
  const [name, setName] = useState(initialName || "");
  const [username, setUsername] = useState(initialUsername || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Update password in Firebase Auth
      await updatePassword(user, newPassword);
      
      // Clear flag in Firestore and save name/username
      const res = await clearMustChangePassword(user.email, name, username);
      if (!res.success) {
        throw new Error(res.message);
      }

      // Notify parent to proceed to dashboard
      onPasswordChanged();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FiLock size={24} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Complete Your Profile</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            For security reasons, you must change your password and set up your profile before continuing.
          </p>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#334155' }}>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={styles.input} 
              required 
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#334155' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className={styles.input} 
              required 
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#334155' }}>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              className={styles.input} 
              required 
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#334155' }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className={styles.input} 
              required 
              style={{ width: '100%' }}
            />
          </div>
          <button 
            type="submit" 
            className={styles.saveButton} 
            style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <FiLoader className={styles.spinner} /> : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
