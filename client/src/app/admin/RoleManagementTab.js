"use client";

import { useState, useEffect } from "react";
import { FiRefreshCw, FiSave, FiX, FiShield, FiUser, FiCheck } from "react-icons/fi";
import styles from "./admin.module.css";
import { getAdminUsers, getUserCustomTabs, setUserCustomTabs, clearUserCustomTabs } from "./actions";

const ALL_TABS = [
  { id: "registrations", label: "Form Responses" },
  { id: "blogs", label: "Blog Posts" },
  { id: "reports", label: "Event Reports" },
  { id: "users", label: "Users" },
  { id: "projects", label: "Projects" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
  { id: "products", label: "Products" },
  { id: "contacts", label: "Contacts" },
  { id: "socials", label: "Socials" },
  { id: "history", label: "History" },
];

const ROLE_DEFAULT_TABS = {
  "Super Admin": ALL_TABS.map(t => t.id),
  "Admin": ["registrations", "blogs", "reports", "users", "events", "faq", "gallery"],
  "Project Lead": ["registrations", "blogs", "reports", "users", "projects", "events", "faq", "gallery", "products"],
  "Author": ["blogs", "reports", "gallery"],
  "Communication": ["contacts", "socials", "gallery"],
  "Events": ["events", "reports", "blogs", "gallery"],
};

export default function RoleManagementTab({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [userTabs, setUserTabs] = useState({});
  const [editingEmail, setEditingEmail] = useState(null);
  const [editTabs, setEditTabs] = useState([]);

  const loadAll = async () => {
    setLoading(true);
    const allUsers = await getAdminUsers();
    setUsers(allUsers || []);
    const tabMap = {};
    await Promise.all((allUsers || []).map(async u => {
      const custom = await getUserCustomTabs(u.email);
      tabMap[u.email] = custom;
    }));
    setUserTabs(tabMap);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleEdit = (user) => {
    const current = userTabs[user.email] ?? ROLE_DEFAULT_TABS[user.role] ?? [];
    setEditTabs([...current]);
    setEditingEmail(user.email);
  };

  const handleCancel = () => { setEditingEmail(null); setEditTabs([]); };

  const toggleTab = (tabId) => {
    setEditTabs(prev => prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]);
  };

  const handleSave = async (email) => {
    setSaving(email);
    const res = await setUserCustomTabs(email, editTabs);
    setSaving(null);
    if (res.success) {
      setUserTabs(prev => ({ ...prev, [email]: editTabs }));
      showToast(`Custom tabs saved for ${email}`);
      setEditingEmail(null);
    } else {
      showToast("Error saving: " + res.message, "error");
    }
  };

  const handleReset = async (email, role) => {
    if (!confirm(`Reset ${email} to default tabs for their role (${role})?`)) return;
    setSaving(email);
    const res = await clearUserCustomTabs(email);
    setSaving(null);
    if (res.success) {
      setUserTabs(prev => ({ ...prev, [email]: null }));
      showToast(`${email} reset to role defaults`);
      if (editingEmail === email) setEditingEmail(null);
    } else {
      showToast("Error resetting: " + res.message, "error");
    }
  };

  const effectiveTabs = (email, role) => {
    const custom = userTabs[email];
    if (custom != null) return custom;
    return ROLE_DEFAULT_TABS[role] ?? [];
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FiShield style={{ color: "var(--primary-color)" }} /> Role Management
          </h2>
          <p style={{ margin: "0.25rem 0 0", color: "#888", fontSize: "0.9rem" }}>
            Control which tabs each admin user can access. Custom overrides take priority over role defaults.
          </p>
        </div>
        <button className={styles.actionBtn} onClick={loadAll} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Loading users…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {users.map(user => {
            const isEditing = editingEmail === user.email;
            const hasCustom = userTabs[user.email] != null;
            const effective = effectiveTabs(user.email, user.role);

            return (
              <div key={user.email} style={{
                background: "var(--white-color, #fff)",
                border: `1px solid ${hasCustom ? "var(--primary-color)" : "var(--light-gray-color, #eaeaea)"}`,
                borderRadius: "8px",
                padding: "1.25rem",
                boxShadow: hasCustom ? "0 0 0 2px rgba(18,154,68,0.08)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <FiUser style={{ color: "#888", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{user.name || user.email}</div>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>{user.email}</div>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, background: "rgba(18,154,68,0.1)", color: "var(--primary-color)" }}>
                      {user.role}
                    </span>
                    {hasCustom && (
                      <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, background: "#e0f2fe", color: "#0369a1" }}>
                        Custom
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {!isEditing && (
                      <>
                        <button className={styles.actionBtnEdit} onClick={() => handleEdit(user)} style={{ fontSize: "0.85rem", padding: "0.3rem 0.7rem" }}>
                          Edit Tabs
                        </button>
                        {hasCustom && (
                          <button className={styles.actionBtnCancel} onClick={() => handleReset(user.email, user.role)} disabled={saving === user.email} style={{ fontSize: "0.85rem", padding: "0.3rem 0.7rem" }}>
                            Reset to Default
                          </button>
                        )}
                      </>
                    )}
                    {isEditing && (
                      <>
                        <button className={styles.actionBtn} onClick={() => handleSave(user.email)} disabled={saving === user.email} style={{ fontSize: "0.85rem", padding: "0.3rem 0.7rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiSave /> {saving === user.email ? "Saving…" : "Save"}
                        </button>
                        <button className={styles.actionBtnCancel} onClick={handleCancel} style={{ fontSize: "0.85rem", padding: "0.3rem 0.7rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <FiX /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.5rem" }}>
                      Select which tabs <strong>{user.email}</strong> can access:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {ALL_TABS.map(tab => {
                        const checked = editTabs.includes(tab.id);
                        return (
                          <label key={tab.id} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "0.4rem 0.75rem", borderRadius: "6px", cursor: "pointer",
                            border: `1px solid ${checked ? "var(--primary-color)" : "var(--light-gray-color, #ccc)"}`,
                            background: checked ? "rgba(18,154,68,0.08)" : "transparent",
                            fontSize: "0.85rem", fontWeight: checked ? 600 : 400,
                            color: checked ? "var(--primary-color)" : "var(--text-color)",
                            transition: "all 0.15s", userSelect: "none"
                          }}>
                            <input type="checkbox" checked={checked} onChange={() => toggleTab(tab.id)} style={{ display: "none" }} />
                            {checked && <FiCheck style={{ flexShrink: 0, width: "12px", height: "12px" }} />}
                            {tab.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {effective.length > 0 ? effective.map(tabId => {
                      const tabDef = ALL_TABS.find(t => t.id === tabId);
                      return (
                        <span key={tabId} style={{
                          padding: "2px 8px", borderRadius: "4px", fontSize: "0.78rem",
                          background: "var(--light-gray-color, #f0f0f0)",
                          color: "var(--text-color)", border: "1px solid rgba(0,0,0,0.07)"
                        }}>
                          {tabDef ? tabDef.label : tabId}
                        </span>
                      );
                    }) : (
                      <span style={{ fontSize: "0.8rem", color: "#888", fontStyle: "italic" }}>No tabs assigned</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {users.length === 0 && (
            <div style={{ textAlign: "center", color: "#888", padding: "2rem" }}>No admin users found.</div>
          )}
        </div>
      )}

      <div style={{ marginTop: "2rem", padding: "0.75rem 1rem", borderRadius: "6px", background: "#fff3cd", color: "#856404", border: "1px solid #ffeeba", fontSize: "0.85rem" }}>
        <strong>Requires Supabase migration:</strong>{" "}
        <code>ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS custom_tabs JSONB;</code>
      </div>
    </div>
  );
}
