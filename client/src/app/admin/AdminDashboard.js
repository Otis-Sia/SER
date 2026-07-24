"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import {
  updateSiteContent,
  uploadImage,
  getMemberRegistrations,
  deleteMemberRegistration,
  getAdminUserData,
  getAdminRole,
  getAdminUsers,
  addAdminUser,
  deleteAdminUser
} from "./actions";
import { FiRefreshCw, FiDownload, FiAlertTriangle, FiZoomIn, FiCamera, FiClipboard, FiEye, FiX, FiLoader, FiBookOpen, FiLogOut, FiUsers, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import BlogManager from "./BlogManager";
import AdminUsersTab from "./AdminUsersTab";
import ChangePasswordScreen from "./ChangePasswordScreen";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

function MemberRegistrationsView({ showToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("ALL");
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);

  const loadMembers = async () => {
    setLoading(true);
    const data = await getMemberRegistrations();
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the registration for ${name}?`)) return;

    const res = await deleteMemberRegistration(id);
    if (res.success) {
      showToast(`Registration for ${name} deleted.`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (selectedMemberModal?.id === id) setSelectedMemberModal(null);
    } else {
      showToast("Error deleting: " + res.message, "error");
    }
  };

  const filteredMembers = members.filter((m) => {
    const fullName = (m.name || `${m.firstName || ""} ${m.middleName || ""} ${m.lastName || ""}`).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      (m.email || "").toLowerCase().includes(query) ||
      (m.county || m.currentAddress || "").toLowerCase().includes(query) ||
      (m.subCounty || "").toLowerCase().includes(query) ||
      (m.crew || m.crewDetails || "").toLowerCase().includes(query) ||
      (m.whatsapp || m.phone || "").toLowerCase().includes(query);

    const matchesCounty = selectedCounty === "ALL" || m.county === selectedCounty;

    return matchesSearch && matchesCounty;
  });

  const exportToCSV = () => {
    if (filteredMembers.length === 0) return alert("No data to export!");

    const headers = [
      "Full Name", "Email", "Phone", "ID Number", "Date of Birth", "Gender",
      "Blood Type", "Current Address", "Other Address", "Next of Kin Name",
      "Next of Kin Phone", "Is Scout", "Crew Details", "Education Level",
      "Trainings", "Certifications", "Community Preparedness", "Availability",
      "Willing To Participate", "Why Join", "Hope To Contribute", "2026 Calendar Recommendations",
      "Member Goals", "Joined WhatsApp", "Submitted Date"
    ];

    const rows = filteredMembers.map((m) => [
      `"${(m.name || `${m.firstName || ''} ${m.lastName || ''}`).replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.phone || m.whatsapp || "").replace(/"/g, '""')}"`,
      `"${(m.idNumber || "").replace(/"/g, '""')}"`,
      `"${(m.dob || "").replace(/"/g, '""')}"`,
      `"${(m.gender || "").replace(/"/g, '""')}"`,
      `"${(m.bloodType || "").replace(/"/g, '""')}"`,
      `"${(m.currentAddress || m.county || "").replace(/"/g, '""')}"`,
      `"${(m.otherAddress || "").replace(/"/g, '""')}"`,
      `"${(m.nextOfKinName || "").replace(/"/g, '""')}"`,
      `"${(m.nextOfKinPhone || "").replace(/"/g, '""')}"`,
      `"${(m.isScout || "").replace(/"/g, '""')}"`,
      `"${(m.crewDetails || m.crew || "").replace(/"/g, '""')}"`,
      `"${(m.educationLevel || "").replace(/"/g, '""')}"`,
      `"${(Array.isArray(m.trainings) ? m.trainings.join("; ") : m.trainings || "").replace(/"/g, '""')}"`,
      `"${(m.certifications || "").replace(/"/g, '""')}"`,
      `"${(m.communityPreparedness || "").replace(/"/g, '""')}"`,
      `"${(m.availability || "").replace(/"/g, '""')}"`,
      `"${(m.willingToParticipate || "").replace(/"/g, '""')}"`,
      `"${(m.whyJoin || "").replace(/"/g, '""')}"`,
      `"${(m.hopeToContribute || "").replace(/"/g, '""')}"`,
      `"${(m.calendarRecommendations || "").replace(/"/g, '""')}"`,
      `"${(m.memberGoals || "").replace(/"/g, '""')}"`,
      `"${m.joinedWhatsapp ? 'Yes' : 'No'}"`,
      `"${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SER_Member_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const counties = Array.from(new Set(members.map((m) => m.county).filter(Boolean)));
  const crews = Array.from(new Set(members.map((m) => m.crew || m.crewDetails).filter(Boolean)));

  return (
    <div>
      <div className={styles.regMetrics}>
        <div className={styles.metricCard}>
          <div className={styles.metricVal}>{members.length}</div>
          <div className={styles.metricLbl}>Total Members Registered</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricVal}>{counties.length}</div>
          <div className={styles.metricLbl}>Counties Represented</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricVal}>{crews.length}</div>
          <div className={styles.metricLbl}>Active Scout Crews</div>
        </div>
      </div>

      <div className={styles.regControls}>
        <div style={{ display: "flex", gap: "0.75rem", flex: "1 1 320px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            className={styles.regSearchInput}
            placeholder="Search response by name, email, county, or crew..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {counties.length > 0 && (
            <select
              className={styles.regSelectInput}
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
            >
              <option value="ALL">All Counties ({counties.length})</option>
              {counties.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className={styles.refreshBtn} onClick={loadMembers}>
            <FiRefreshCw style={{ marginRight: '4px' }} /> Refresh
          </button>
          <button className={styles.csvBtn} onClick={exportToCSV}>
            <FiDownload style={{ marginRight: '4px' }} /> Export to CSV / Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", opacity: 0.8 }}>
          <FiRefreshCw style={{ marginRight: '6px', animation: 'spin 2s linear infinite' }} /> Loading member registration responses from Firestore...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className={styles.section} style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>
            {searchQuery || selectedCounty !== "ALL"
              ? "No member registrations matched your filter criteria."
              : "No membership form responses found yet."}
          </p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.regTable}>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>County & Sub-County</th>
                <th>Scout Crew</th>
                <th>Blood Type</th>
                <th>Email</th>
                <th>WhatsApp / Phone</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => {
                const name = m.name || `${m.firstName || ""} ${m.middleName || ""} ${m.lastName || ""}`.trim();
                const phoneNum = m.phone || m.whatsapp || "";
                const formattedWhatsApp = phoneNum.replace(/[^0-9+]/g, "");
                const waUrl = formattedWhatsApp ? `https://wa.me/${formattedWhatsApp.replace("+", "")}` : "#";

                return (
                  <tr key={m.id}>
                    <td>
                      <strong>{name}</strong>
                    </td>
                    <td>
                      <div>{m.currentAddress || m.county || "—"}</div>
                      {m.subCounty && <small style={{ opacity: 0.7 }}>{m.subCounty}</small>}
                    </td>
                    <td>
                      <span className={styles.badge}>{m.crewDetails || m.crew || "Independent"}</span>
                    </td>
                    <td>
                      <strong>{m.bloodType || "—"}</strong>
                    </td>
                    <td>
                      <a href={`mailto:${m.email}`} style={{ color: "inherit", textDecoration: "underline" }}>
                        {m.email}
                      </a>
                    </td>
                    <td>
                      {formattedWhatsApp ? (
                        <a href={waUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>
                          <FaWhatsapp style={{ marginRight: '4px' }} /> {phoneNum}
                        </a>
                      ) : (
                        phoneNum || "—"
                      )}
                    </td>
                    <td>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "Recently"}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className={styles.csvBtn}
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem", backgroundColor: '#2563eb' }}
                          onClick={() => setSelectedMemberModal(m)}
                        >
                          <FiEye style={{ marginRight: '4px' }} /> Details
                        </button>
                        <button
                          className={styles.deleteButton}
                          style={{ position: "static", padding: "0.25rem 0.5rem" }}
                          onClick={() => handleDelete(m.id, name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Registration Details Modal */}
      {selectedMemberModal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedMemberModal(null)}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', padding: '2rem', overflowY: 'auto', display: 'block' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalCloseBtn} onClick={() => setSelectedMemberModal(null)}><FiX /></button>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
              Member Application Details
            </h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Submitted on: {selectedMemberModal.createdAt ? new Date(selectedMemberModal.createdAt).toLocaleString() : 'N/A'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Personal Info */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>1. Personal &amp; Contact Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div><strong>Full Name:</strong> <div>{selectedMemberModal.name || `${selectedMemberModal.firstName || ''} ${selectedMemberModal.lastName || ''}`}</div></div>
                  <div><strong>Email Address:</strong> <div>{selectedMemberModal.email || '—'}</div></div>
                  <div><strong>Phone Number:</strong> <div>{selectedMemberModal.phone || selectedMemberModal.whatsapp || '—'}</div></div>
                  <div><strong>National ID No:</strong> <div>{selectedMemberModal.idNumber || '—'}</div></div>
                  <div><strong>Date of Birth:</strong> <div>{selectedMemberModal.dob || '—'}</div></div>
                  <div><strong>Gender:</strong> <div>{selectedMemberModal.gender || '—'}</div></div>
                  <div><strong>Blood Type:</strong> <div>{selectedMemberModal.bloodType || '—'}</div></div>
                </div>
              </div>

              {/* Location & Residence */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>2. Address &amp; Residence</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div><strong>Current Residence:</strong> <div>{selectedMemberModal.currentAddress || selectedMemberModal.county || '—'}</div></div>
                  <div><strong>Other Address:</strong> <div>{selectedMemberModal.otherAddress || '—'}</div></div>
                </div>
              </div>

              {/* Next of Kin */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>3. Next of Kin</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div><strong>Next of Kin Name:</strong> <div>{selectedMemberModal.nextOfKinName || '—'}</div></div>
                  <div><strong>Next of Kin Phone:</strong> <div>{selectedMemberModal.nextOfKinPhone || '—'}</div></div>
                </div>
              </div>

              {/* Scouting & Background */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>4. Scouting &amp; Education</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div><strong>Is Scout:</strong> <div>{selectedMemberModal.isScout || '—'}</div></div>
                  <div><strong>Crew Details:</strong> <div>{selectedMemberModal.crewDetails || selectedMemberModal.crew || '—'}</div></div>
                  <div><strong>Education Level:</strong> <div>{selectedMemberModal.educationLevel || '—'}</div></div>
                </div>
              </div>

              {/* Experience & Training */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>5. Experience &amp; Training</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div><strong>Training / Experience:</strong> <div>{Array.isArray(selectedMemberModal.trainings) ? selectedMemberModal.trainings.join(', ') : selectedMemberModal.trainings || '—'}</div></div>
                  <div><strong>Certifications:</strong> <div>{selectedMemberModal.certifications || '—'}</div></div>
                </div>
              </div>

              {/* Preparedness & Availability */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>6. Preparedness &amp; Availability</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div><strong>Community Preparedness Assessment:</strong> <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '6px', marginTop: '0.25rem' }}>{selectedMemberModal.communityPreparedness || '—'}</div></div>
                  <div><strong>Availability Level:</strong> <div>{selectedMemberModal.availability || '—'}</div></div>
                  <div><strong>Willing to Participate in Deployments:</strong> <div>{selectedMemberModal.willingToParticipate || '—'}</div></div>
                </div>
              </div>

              {/* Goals & Calendar */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>7. Goals &amp; Calendar Recommendations</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div><strong>Why Join SER:</strong> <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '6px', marginTop: '0.25rem' }}>{selectedMemberModal.whyJoin || '—'}</div></div>
                  <div><strong>Hope to Contribute:</strong> <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '6px', marginTop: '0.25rem' }}>{selectedMemberModal.hopeToContribute || '—'}</div></div>
                  <div><strong>2026 Calendar Recommendations:</strong> <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '6px', marginTop: '0.25rem' }}>{selectedMemberModal.calendarRecommendations || '—'}</div></div>
                  <div><strong>Member Goals:</strong> <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '6px', marginTop: '0.25rem' }}>{selectedMemberModal.memberGoals || '—'}</div></div>
                </div>
              </div>

              {/* Status */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>8. Declaration &amp; Community</h3>
                <div><strong>Joined WhatsApp Group:</strong> <div>{selectedMemberModal.joinedWhatsapp ? 'Yes' : 'No / Not specified'}</div></div>
                <div><strong>Declaration Agreed:</strong> <div>Yes</div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageField({ label, value, onChange, pathStr, onOpenModal }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);

  const processFile = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setImgError(false);
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData);
    setIsUploading(false);

    if (result.success) {
      onChange(result.url);
    } else {
      alert("Failed to upload image: " + result.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const isPreviewable = typeof value === "string" && value.trim() !== "";

  return (
    <div className={styles.formGroup} key={pathStr}>
      <label className={styles.label}>{label}</label>

      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isPreviewable && (
          imgError ? (
            <div className={styles.imageErrorBadge}>
              <FiAlertTriangle style={{ marginRight: '6px' }} /> Preview Unavailable (Invalid or Broken Link)
            </div>
          ) : (
            <div
              className={styles.imagePreviewContainer}
              onClick={() => onOpenModal && onOpenModal(value)}
              title="Click to expand full size"
            >
              <img
                src={value}
                alt="Preview"
                className={styles.imagePreview}
                onError={() => setImgError(true)}
                onLoad={() => setImgError(false)}
              />
              <div className={styles.imagePreviewOverlay}>
                <FiZoomIn style={{ marginRight: '6px' }} /> Expand Preview
              </div>
            </div>
          )
        )}

        <div>
          <p className={styles.dropzoneText}>
            {isUploading
              ? <><FiLoader style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} /> Uploading image to S3...</>
              : isDragging
              ? <><FiDownload style={{ marginRight: '6px' }} /> Drop image here to upload</>
              : "Drag & drop an image here, or browse / paste URL:"}
          </p>
          <div className={styles.imageInputWrapper}>
            <input
              type="text"
              className={styles.input}
              value={value}
              onChange={(e) => {
                setImgError(false);
                onChange(e.target.value);
              }}
              placeholder="Image URL or upload file..."
            />
            {value && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => {
                  setImgError(false);
                  onChange("");
                }}
                title="Clear URL"
              >
                Clear
              </button>
            )}
            <label className={styles.uploadBtn}>
              {isUploading ? "Uploading..." : <><FiCamera style={{ marginRight: '6px' }} /> Browse</>}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ initialData }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userUsername, setUserUsername] = useState("");
  const [userName, setUserName] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Safety timeout: Never keep the user on infinite loading spinner for more than 4 seconds
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 4000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      try {
        if (currentUser) {
          const userData = await getAdminUserData(currentUser.email).catch(() => null);
          if (userData) {
            setUserRole(userData.role || "Admin");
            setUserUsername(userData.username || "");
            setUserName(userData.name || "");
            setMustChangePassword(userData.mustChangePassword === true);
          } else {
            setUserRole("Admin");
            setUserUsername("");
            setUserName("");
            setMustChangePassword(false);
          }
        } else {
          setUserRole(null);
          setUserUsername("");
          setUserName("");
          setMustChangePassword(false);
        }
      } catch (err) {
        console.error("Error loading user role data:", err);
        if (currentUser) setUserRole("Admin");
      } finally {
        clearTimeout(timer);
        setAuthLoading(false);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const adminUsername = user ? user.email : "";
  const isBlogOnlyUser = userRole === "Author";
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState(Object.keys(initialData)[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  useEffect(() => {
    if (isBlogOnlyUser) {
      setActiveTab("blogs");
    }
  }, [isBlogOnlyUser]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      setLoginError("Invalid email or password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSiteContent(data);
    setIsSaving(false);
    if (result.success) {
      showToast("Changes saved successfully!");
    } else {
      showToast("Error saving changes: " + result.message, "error");
    }
  };

  const handleChange = (path, value) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayAdd = (path, template) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      current.push(template);
      return newData;
    });
  };

  const handleArrayDelete = (path, index) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      current.splice(index, 1);
      return newData;
    });
  };

  const renderField = (key, value, path) => {
    if (key === 'featuredInstagramPost') {
      return (
        <div className={styles.formGroup} key={path.join(".")}>
          <label className={styles.label}>Featured Instagram Post URL</label>
          <input
            type="text"
            className={styles.input}
            value={value}
            onChange={(e) => handleChange(path, e.target.value)}
            placeholder="https://www.instagram.com/p/..."
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Paste the base link of the Instagram post you want to feature on the homepage.
          </p>
        </div>
      );
    }

    if (key === 'featuredTiktokPost') {
      return (
        <div className={styles.formGroup} key={path.join(".")}>
          <label className={styles.label}>Featured TikTok Post URL</label>
          <input
            type="text"
            className={styles.input}
            value={value}
            onChange={(e) => handleChange(path, e.target.value)}
            placeholder="https://www.tiktok.com/@..."
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Paste the link to the TikTok video or photo you want to feature on the homepage.
          </p>
        </div>
      );
    }

    if (key === 'featuredFacebookPost') {
      return (
        <div className={styles.formGroup} key={path.join(".")}>
          <label className={styles.label}>Featured Facebook Post URL</label>
          <input
            type="text"
            className={styles.input}
            value={value}
            onChange={(e) => handleChange(path, e.target.value)}
            placeholder="https://www.facebook.com/permalink.php?..."
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Paste the raw Facebook post link you want to feature on the homepage.
          </p>
        </div>
      );
    }

    if (typeof value === "string") {
      const lowerKey = key.toLowerCase();
      const isPostUrl = lowerKey.includes("post") || lowerKey.includes("embed");
      const isImageKey =
        lowerKey.includes("image") ||
        lowerKey.includes("photo") ||
        lowerKey.includes("img") ||
        lowerKey.includes("avatar") ||
        lowerKey.includes("logo") ||
        lowerKey.includes("icon") ||
        lowerKey.includes("banner") ||
        lowerKey.includes("picture") ||
        lowerKey.includes("src") ||
        lowerKey.includes("thumbnail");
      const isImageUrl =
        !isPostUrl &&
        (value.startsWith("http://") ||
          value.startsWith("https://") ||
          value.startsWith("/") ||
          value.startsWith("data:image/")) &&
        (value.includes(".s3.") ||
          value.includes("amazonaws.com") ||
          value.includes("/assets/") ||
          value.includes("/uploads/") ||
          Boolean(value.match(/\.(jpg|jpeg|png|gif|webp|svg)($|\?)/i)));

      const isImage = (isImageKey || isImageUrl) && !isPostUrl;

      if (isImage) {
        return (
          <ImageField
            key={path.join(".")}
            pathStr={path.join(".")}
            label={key}
            value={value}
            onChange={(val) => handleChange(path, val)}
            onOpenModal={(url) => setPreviewModalUrl(url)}
          />
        );
      }

      const isLongText = value.length > 50 || lowerKey.includes("description") || lowerKey.includes("story") || lowerKey.includes("mission");
      return (
        <div className={styles.formGroup} key={path.join(".")}>
          <label className={styles.label}>{key}</label>
          {isLongText ? (
            <textarea
              className={styles.textarea}
              value={value}
              onChange={(e) => handleChange(path, e.target.value)}
            />
          ) : (
            <input
              type="text"
              className={styles.input}
              value={value}
              onChange={(e) => handleChange(path, e.target.value)}
            />
          )}
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      const isStringArray = value.length > 0 && typeof value[0] === 'string';
      const template = isStringArray ? "" : (value.length > 0 ? Object.fromEntries(Object.keys(value[0]).map(k => [k, ""])) : {});
      
      return (
        <div className={styles.section} key={path.join(".")}>
          <h3 className={styles.sectionTitle}>{key}</h3>
          {value.map((item, index) => {
            const itemImage =
              typeof item === "object" && item !== null
                ? item.image || item.photo || item.avatar || item.src || item.logo || item.picture
                : null;

            return (
              <div className={styles.nestedGroup} key={index}>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleArrayDelete(path, index)}
                >
                  Delete
                </button>

                {itemImage && typeof itemImage === "string" && itemImage.trim() !== "" && (
                  <div className={styles.cardHeaderPreview}>
                    <img
                      src={itemImage}
                      alt="Thumbnail"
                      className={styles.cardThumbnail}
                      onClick={() => setPreviewModalUrl(itemImage)}
                      style={{ cursor: "pointer" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <strong style={{ fontSize: "0.95rem" }}>
                      {item.title || item.name || `Item #${index + 1}`}
                    </strong>
                  </div>
                )}

                {isStringArray ? (
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      className={styles.input}
                      value={item}
                      onChange={(e) => handleChange([...path, index], e.target.value)}
                    />
                  </div>
                ) : (
                  Object.entries(item).map(([subKey, subValue]) =>
                    renderField(subKey, subValue, [...path, index, subKey])
                  )
                )}
              </div>
            );
          })}
          <button 
            className={styles.addButton}
            onClick={() => handleArrayAdd(path, template)}
          >
            + Add New {key} Item
          </button>
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className={styles.section} key={path.join(".")}>
          <h3 className={styles.sectionTitle}>{key}</h3>
          {Object.entries(value).map(([subKey, subValue]) => 
            renderField(subKey, subValue, [...path, subKey])
          )}
        </div>
      );
    }

    return null;
  };

  // Filter tabs based on user role
  const allDataTabs = Object.keys(initialData);
  let tabs = [];
  
  if (userRole === "Super Admin") {
    tabs = ["registrations", "blogs", "users", ...allDataTabs];
  } else if (userRole === "Admin") {
    tabs = ["registrations", "blogs", ...allDataTabs];
  } else if (userRole === "Project Lead") {
    tabs = ["registrations", "blogs", ...allDataTabs.filter(t => t.toLowerCase() === 'events')];
  } else if (userRole === "Author") {
    tabs = ["blogs", "gallery"];
  }

  if (!tabs.length && user) tabs = ["blogs"];

  if (authLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><FiLoader className={styles.spinner} style={{ fontSize: '3rem', color: 'var(--primary-color)' }} /></div>;
  }

  if (user && mustChangePassword) {
    return <ChangePasswordScreen user={user} initialName={userName} initialUsername={userUsername} onPasswordChanged={() => setMustChangePassword(false)} />;
  }

  return (
    <div style={{ position: 'relative' }}>
      {!user && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--card-bg, #fff)',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '90%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            color: 'var(--text-primary, #000)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Admin Access</h2>
              <p style={{ color: 'var(--text-secondary, #666)' }}>Sign in to manage the dashboard</p>
            </div>
            {loginError && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>{loginError}</div>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #000)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #000)' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.875rem', background: 'var(--primary-color, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>Sign In</button>
            </form>
          </div>
        </div>
      )}

    <div className={styles.adminContainer} style={{ filter: !user ? 'blur(5px)' : 'none', pointerEvents: !user ? 'none' : 'auto' }}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        {adminUsername && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              background: isBlogOnlyUser ? 'rgba(59,130,246,0.12)' : 'rgba(18,154,68,0.12)',
              fontSize: '0.8rem',
              color: isBlogOnlyUser ? '#3b82f6' : 'var(--primary-color)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <span style={{ fontSize: '1rem' }}>👤</span>
              <span>{adminUsername}</span>
              <span style={{ marginLeft: 'auto', opacity: 0.75, fontWeight: 400 }}>
                {userRole || 'Unknown Role'}
              </span>
            </div>
            <button
              className={styles.navButton}
              onClick={handleLogout}
              style={{ color: '#ef4444', padding: '0.4rem 0.75rem', minHeight: 'auto' }}
            >
              <FiLogOut style={{ marginRight: '6px' }} /> Logout
            </button>
          </div>
        )}
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.navButton} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "registrations" ? <><FiClipboard style={{ marginRight: '6px' }} /> Form Responses</> 
            : tab === "blogs" ? <><FiBookOpen style={{ marginRight: '6px' }} /> Blog Posts</>
            : tab === "users" ? <><FiUsers style={{ marginRight: '6px' }} /> Users</>
            : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}

      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            {activeTab === "registrations" ? "Membership Form Responses" 
            : activeTab === "blogs" ? "Blog Posts Management"
            : activeTab === "users" ? "User Management"
            : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings`}
          </h1>
          {activeTab !== "registrations" && activeTab !== "blogs" && activeTab !== "users" && (
            <button 
              className={styles.saveButton} 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        <div className={styles.formContainer}>
          {activeTab === "registrations" ? (
            <MemberRegistrationsView showToast={showToast} />
          ) : activeTab === "blogs" ? (
            <BlogManager showToast={showToast} currentUserEmail={adminUsername} currentUserRole={userRole} currentUserUsername={userUsername} />
          ) : activeTab === "users" ? (
            <AdminUsersTab showToast={showToast} currentUserEmail={adminUsername} />
          ) : (
            renderField(activeTab, data[activeTab], [activeTab])
          )}
        </div>
      </div>

      <div className={`${styles.toast} ${toast.show ? styles.show : ""} ${toast.type === "error" ? styles.error : ""}`}>
        {toast.message}
      </div>

      {previewModalUrl && (
        <div className={styles.modalOverlay} onClick={() => setPreviewModalUrl(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setPreviewModalUrl(null)}>X</button>
            <img src={previewModalUrl} alt="Enlarged Preview" className={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
