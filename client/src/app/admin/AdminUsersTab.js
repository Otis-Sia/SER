"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { FiLoader, FiTrash2, FiFlag, FiChevronDown, FiMail, FiKey } from "react-icons/fi";
import { getAdminUsers, addAdminUser, deleteAdminUser, updateAdminRole, resetAdminPassword, flagAdminUser, updateAdminEmail } from "./actions";

export default function AdminUsersTab({ showToast, currentUserEmail, currentUserRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Admin");
  const [openDropdown, setOpenDropdown] = useState(null);

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
    if (!newName || !newEmail || !newPassword || !newRole) {
      showToast("Please fill all fields", "error");
      return;
    }
    const res = await addAdminUser(newName, newEmail, newPassword, newRole);
    if (res.success) {
      showToast(`User ${newEmail} added as ${newRole}`);
      setNewName("");
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

  const handleFlagUser = async (email, flagged) => {
    if (email === currentUserEmail) {
      showToast("Cannot flag yourself", "error");
      return;
    }
    if (!confirm(`Are you sure you want to ${flagged ? 'flag' : 'unflag'} ${email}?`)) return;
    const res = await flagAdminUser(email, flagged, currentUserEmail);
    if (res.success) {
      showToast(`User ${email} ${flagged ? 'flagged' : 'unflagged'} successfully`);
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

  const handleChangeEmail = async (oldEmail, uid) => {
    const newEmail = prompt(`Enter a new email for ${oldEmail}:`);
    if (!newEmail || newEmail === oldEmail) return;
    if (!newEmail.includes("@")) {
      showToast("Invalid email format.", "error");
      return;
    }

    const res = await updateAdminEmail(oldEmail, newEmail, uid);
    if (res.success) {
      showToast(`Email updated to ${newEmail}`);
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
      {(currentUserRole === "Super Admin" || currentUserRole === "Project Lead") && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Add New Admin User</h3>
          <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className={styles.input} required />
            </div>
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
      )}
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Existing Admin Users</h3>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}><FiLoader className={styles.spinner} style={{ fontSize: '2rem' }} /></div> : (
          <div className={styles.tableWrapper}>
            <table className={styles.regTable}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Email</th>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th style={{ textAlign: 'left' }}>Role</th>
                <th style={{ textAlign: 'left' }}>Created At</th>
                <th style={{ textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    {u.email}
                    {u.mustChangePassword && (
                      <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }} title="User must change password on next login">Pwd Reset Pending</span>
                    )}
                    {u.flagged && (
                      <>
                        <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: '#fee2e2', color: '#ef4444' }}>Flagged</span>
                        {(currentUserRole === "Super Admin" || currentUserRole === "Project Lead") && u.flaggedByEmail && (
                          <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '4px' }} title={`Flagged by ${u.flaggedByEmail}`}>(by {u.flaggedByEmail})</span>
                        )}
                      </>
                    )}
                  </td>
                  <td>{u.name || "-"}</td>
                  <td>
                    {u.email === currentUserEmail || currentUserRole !== "Super Admin" ? (
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
                      <div style={{ position: 'relative' }}>
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === u.email ? null : u.email)}
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                        >
                          Manage User <FiChevronDown />
                        </button>
                        
                        {openDropdown === u.email && (
                          <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, marginTop: '0.2rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '160px', overflow: 'hidden' }}>
                            {(currentUserRole === "Super Admin" || currentUserRole === "Project Lead") && (
                              <>
                                <button 
                                  onClick={() => { setOpenDropdown(null); handleChangeEmail(u.email, u.uid); }}
                                  style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', borderBottom: '1px solid #f3f4f6' }}
                                >
                                  <FiMail /> Change Email
                                </button>
                                <button 
                                  onClick={() => { setOpenDropdown(null); handleResetPassword(u.email, u.uid); }}
                                  style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', borderBottom: '1px solid #f3f4f6' }}
                                >
                                  <FiKey /> Reset Password
                                </button>
                              </>
                            )}
                            
                            {!u.flagged ? (
                              <button 
                                onClick={() => { setOpenDropdown(null); handleFlagUser(u.email, true); }}
                                style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', borderBottom: '1px solid #f3f4f6' }}
                              >
                                <FiFlag /> Flag / Restrict
                              </button>
                            ) : (
                              (currentUserRole === "Project Lead" || currentUserRole === "Super Admin") && (
                                <button 
                                  onClick={() => { setOpenDropdown(null); handleFlagUser(u.email, false); }}
                                  style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', borderBottom: '1px solid #f3f4f6' }}
                                >
                                  <FiFlag /> Unflag
                                </button>
                              )
                            )}

                            {(currentUserRole === "Super Admin" || currentUserRole === "Project Lead") && (
                              <button 
                                onClick={() => { setOpenDropdown(null); handleDeleteUser(u.email, u.uid); }}
                                style={{ width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}
                              >
                                <FiTrash2 /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
