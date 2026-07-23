"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { FiLoader, FiTrash2 } from "react-icons/fi";
import { getAdminUsers, addAdminUser, deleteAdminUser, updateAdminRole, resetAdminPassword } from "./actions";

export default function AdminUsersTab({ showToast, currentUserEmail }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Admin");

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAdminUsers();
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newRole) {
      showToast("Please fill all fields", "error");
      return;
    }
    const res = await addAdminUser(newEmail, newPassword, newRole);
    if (res.success) {
      showToast(`User ${newEmail} added as ${newRole}`);
      setNewEmail("");
      setNewPassword("");
      setNewRole("Admin");
      loadUsers();
    } else {
      showToast(`Error: ${res.message}`, "error");
    }
  };

  const handleDeleteUser = async (email, uid) => {
    if (email === currentUserEmail) {
      showToast("Cannot delete yourself", "error");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    const res = await deleteAdminUser(email, uid);
    if (res.success) {
      showToast(`User ${email} deleted`);
      loadUsers();
    } else {
      showToast(`Error: ${res.message}`, "error");
    }
  };
  const handleRoleChange = async (email, uid, newRole) => {
    if (email === currentUserEmail) {
      showToast("Cannot change your own role", "error");
      return;
    }
    const res = await updateAdminRole(email, uid, newRole);
    if (res.success) {
      showToast(`Role for ${email} updated to ${newRole}`);
      loadUsers();
    } else {
      showToast(`Error: ${res.message}`, "error");
    }
  };

  const handleResetPassword = async (email, uid) => {
    const tempPassword = prompt(`Enter a temporary password for ${email}:`);
    if (!tempPassword) return;
    if (tempPassword.length < 6) {
      showToast("Temporary password must be at least 6 characters long", "error");
      return;
    }

    const res = await resetAdminPassword(email, uid, tempPassword);
    if (res.success) {
      showToast(`Password for ${email} reset successfully. User will be forced to change it on next login.`);
    } else {
      showToast(`Error: ${res.message}`, "error");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Add New Admin User</h3>
        <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Email</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={styles.input} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={styles.input} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Role</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value)} className={styles.input} style={{ minWidth: '150px' }}>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Project Lead">Project Lead</option>
              <option value="Author">Author</option>
            </select>
          </div>
          <button type="submit" className={styles.saveButton}>Add User</button>
        </form>
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Existing Admin Users</h3>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}><FiLoader className={styles.spinner} style={{ fontSize: '2rem' }} /></div> : (
          <table className={styles.regTable}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Email</th>
                <th style={{ textAlign: 'left' }}>Role</th>
                <th style={{ textAlign: 'left' }}>Created At</th>
                <th style={{ textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    {u.email === currentUserEmail ? (
                      <span className={styles.badge}>{u.role}</span>
                    ) : (
                      <select 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.email, u.uid, e.target.value)}
                        style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Project Lead">Project Lead</option>
                        <option value="Author">Author</option>
                      </select>
                    )}
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</td>
                  <td>
                    {u.email !== currentUserEmail && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleResetPassword(u.email, u.uid)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          Reset Password
                        </button>
                        <button onClick={() => handleDeleteUser(u.email, u.uid)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
