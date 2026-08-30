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
  deleteAdminUser,
  getDashboardStats,
  getFlaggedPosts,
  flagMemberRegistration,
  updateMemberRegistration,
  updateAdminProfile,
  updateAdminEmail,
  resolveEmailFromUsername,
  getUserCustomTabs
} from "./actions";
import { FiRefreshCw, FiDownload, FiAlertTriangle, FiZoomIn, FiCamera, FiClipboard, FiEye, FiX, FiLoader, FiBookOpen, FiLogOut, FiUsers, FiTrash2, FiSettings, FiHelpCircle, FiSun, FiMoon, FiUser, FiChevronDown, FiShield } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import BlogManager from "./BlogManager";
import RoleManagementTab from "./RoleManagementTab";
import AdminUsersTab from "./AdminUsersTab";
import ChangePasswordScreen from "./ChangePasswordScreen";
import { supabase } from "@/lib/supabaseClient";
import { ProjectsManager, EventsManager, GalleryManager, FaqsManager, ProductsManager, ContactsManager, SocialsManager } from "./CollectionManagers";
import MobileImageUploader from "@/components/MobileImageUploader";
import UserManual from "./UserManual";

const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir', 'Mandera',
  'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia',
  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado',
  'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
  'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];


function MemberRegistrationsView({ showToast, currentUserRole, currentUserEmail }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("ALL");
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

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

  const handleFlagMember = async (id, name, flagged) => {
    if (!confirm(`Are you sure you want to ${flagged ? 'flag' : 'unflag'} ${name}?`)) return;

    const res = await flagMemberRegistration(id, flagged, currentUserEmail);
    if (res.success) {
      showToast(`Member ${name} ${flagged ? 'flagged' : 'unflagged'} successfully.`);
      loadMembers();
    } else {
      showToast("Error: " + res.message, "error");
    }
  };

  const handleSaveEdit = async () => {
    if (!confirm(`Save changes for this member?`)) return;
    const res = await updateMemberRegistration(selectedMemberModal.id, editFormData);
    if (res.success) {
      showToast("Member details updated successfully.");
      setIsEditing(false);
      setSelectedMemberModal({ ...selectedMemberModal, ...editFormData });
      setMembers(prev => prev.map(m => m.id === selectedMemberModal.id ? { ...m, ...editFormData } : m));
    } else {
      showToast("Error updating member: " + res.message, "error");
    }
  };

  const handleEditClick = (member) => {
    setIsEditing(true);
    setEditFormData({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      nationality: member.nationality || "Kenya",
      idType: member.idType || "National ID",
      phone: member.phone || member.whatsapp || "",
      idNumber: member.idNumber || "",
      addressCountry: member.addressCountry || "Kenya",
      city: member.city || "",
      county: member.county || member.currentAddress || "",
      subCounty: member.subCounty || "",
      crew: member.crew || member.crewDetails || "",
      bloodType: member.bloodType || "",
      gender: member.gender || "",
      currentAddress: member.currentAddress || "",
      otherAddressCountry: member.otherAddressCountry || "Kenya",
      otherCity: member.otherCity || "",
      otherCounty: member.otherCounty || "",
      otherSubCounty: member.otherSubCounty || "",
      nextOfKinName: member.nextOfKinName || "",
      nextOfKinPhone: member.nextOfKinPhone || "",
      isScout: member.isScout || "",
      educationLevel: member.educationLevel || "",
      trainings: Array.isArray(member.trainings) ? member.trainings.join(', ') : member.trainings || "",
      certifications: member.certifications || "",
      communityPreparedness: member.communityPreparedness || "",
      availability: member.availability || "",
      willingToParticipate: member.willingToParticipate || "",
      whyJoin: member.whyJoin || "",
      hopeToContribute: member.hopeToContribute || "",
      calendarRecommendations: member.calendarRecommendations || "",
      memberGoals: member.memberGoals || "",
      joinedWhatsapp: member.joinedWhatsapp || false
    });
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
      "Full Name", "Email", "Nationality", "Phone", "ID Type", "ID Number", "Date of Birth", "Gender",
      "Blood Type", "Country", "County", "Sub-County", "City", "Other Country", "Other County", "Other Sub-County", "Other City", "Current Address", "Next of Kin Name",
      "Next of Kin Phone", "Is Scout", "Crew Details", "Education Level",
      "Trainings", "Certifications", "Community Preparedness", "Availability",
      "Willing To Participate", "Why Join", "Hope To Contribute", "2026 Calendar Recommendations",
      "Member Goals", "Joined WhatsApp", "Submitted Date"
    ];

    const rows = filteredMembers.map((m) => [
      `"${(m.name || `${m.firstName || ''} ${m.lastName || ''}`).replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.nationality || "Kenya").replace(/"/g, '""')}"`,
      `"${(m.phone || m.whatsapp || "").replace(/"/g, '""')}"`,
      `"${(m.idType || "National ID").replace(/"/g, '""')}"`,
      `"${(m.idNumber || "").replace(/"/g, '""')}"`,
      `"${(m.dob || "").replace(/"/g, '""')}"`,
      `"${(m.gender || "").replace(/"/g, '""')}"`,
      `"${(m.bloodType || "").replace(/"/g, '""')}"`,
      `"${(m.addressCountry || "Kenya").replace(/"/g, '""')}"`,
      `"${(m.county || "").replace(/"/g, '""')}"`,
      `"${(m.subCounty || "").replace(/"/g, '""')}"`,
      `"${(m.city || "").replace(/"/g, '""')}"`,
      `"${(m.otherAddressCountry || "Kenya").replace(/"/g, '""')}"`,
      `"${(m.otherCounty || "").replace(/"/g, '""')}"`,
      `"${(m.otherSubCounty || "").replace(/"/g, '""')}"`,
      `"${(m.otherCity || "").replace(/"/g, '""')}"`,
      `"${(m.currentAddress || "").replace(/"/g, '""')}"`,
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
          <FiRefreshCw style={{ marginRight: '6px', animation: 'spin 2s linear infinite' }} /> Loading member registration responses...
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
                      {m.flagged && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px', background: '#fee2e2', color: '#ef4444' }}>Flagged</span>
                          {(currentUserRole === "Super Admin" || currentUserRole === "Project Lead") && m.flaggedByEmail && (
                            <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '4px' }} title={`Flagged by ${m.flaggedByEmail}`}>(by {m.flaggedByEmail})</span>
                          )}
                        </div>
                      )}
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
                        {(currentUserRole === "Super Admin" || currentUserRole === "Project Lead") && (
                          <button
                            className={styles.deleteButton}
                            style={{ position: "static", padding: "0.25rem 0.5rem" }}
                            onClick={() => handleDelete(m.id, name)}
                          >
                            Delete
                          </button>
                        )}
                        {!m.flagged ? (
                          <button
                            onClick={() => handleFlagMember(m.id, name, true)}
                            style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Flag / Restrict
                          </button>
                        ) : (
                          (currentUserRole === "Project Lead" || currentUserRole === "Super Admin") && (
                            <button
                              onClick={() => handleFlagMember(m.id, name, false)}
                              style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Unflag
                            </button>
                          )
                        )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
                  {isEditing ? 'Edit Member Application' : 'Member Application Details'}
                </h2>
                <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>
                  Submitted on: {selectedMemberModal.createdAt ? new Date(selectedMemberModal.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              {!isEditing && currentUserRole === "Super Admin" && (
                <button onClick={() => handleEditClick(selectedMemberModal)} style={{ background: '#2196F3', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                  Edit Details
                </button>
              )}
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>First Name</label>
                    <input className={styles.input} type="text" value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Last Name</label>
                    <input className={styles.input} type="text" value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Email</label>
                    <input className={styles.input} type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Phone</label>
                    <input className={styles.input} type="text" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>ID Number</label>
                    <input className={styles.input} type="text" value={editFormData.idNumber} onChange={e => setEditFormData({...editFormData, idNumber: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Gender</label>
                    <input className={styles.input} type="text" value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Blood Type</label>
                    <input className={styles.input} type="text" value={editFormData.bloodType} onChange={e => setEditFormData({...editFormData, bloodType: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>County</label>
                    <select className={styles.input} value={editFormData.county} onChange={e => setEditFormData({...editFormData, county: e.target.value})}>
                      <option value="">Select a county...</option>
                      {KENYA_COUNTIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Sub County</label>
                    <input className={styles.input} type="text" value={editFormData.subCounty} onChange={e => setEditFormData({...editFormData, subCounty: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Crew</label>
                    <input className={styles.input} type="text" value={editFormData.crew} onChange={e => setEditFormData({...editFormData, crew: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Current Address</label>
                    <input className={styles.input} type="text" value={editFormData.currentAddress} onChange={e => setEditFormData({...editFormData, currentAddress: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Other County</label>
                    <input className={styles.input} type="text" value={editFormData.otherCounty} onChange={e => setEditFormData({...editFormData, otherCounty: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Other Sub-County</label>
                    <input className={styles.input} type="text" value={editFormData.otherSubCounty} onChange={e => setEditFormData({...editFormData, otherSubCounty: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Next of Kin Name</label>
                    <input className={styles.input} type="text" value={editFormData.nextOfKinName} onChange={e => setEditFormData({...editFormData, nextOfKinName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Next of Kin Phone</label>
                    <input className={styles.input} type="text" value={editFormData.nextOfKinPhone} onChange={e => setEditFormData({...editFormData, nextOfKinPhone: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Is Scout</label>
                    <input className={styles.input} type="text" value={editFormData.isScout} onChange={e => setEditFormData({...editFormData, isScout: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Education Level</label>
                    <input className={styles.input} type="text" value={editFormData.educationLevel} onChange={e => setEditFormData({...editFormData, educationLevel: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Trainings / Experience</label>
                    <textarea className={styles.input} style={{ width: '100%', minHeight: '60px' }} value={editFormData.trainings} onChange={e => setEditFormData({...editFormData, trainings: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Certifications</label>
                    <textarea className={styles.input} style={{ width: '100%', minHeight: '60px' }} value={editFormData.certifications} onChange={e => setEditFormData({...editFormData, certifications: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Community Preparedness Assessment</label>
                    <textarea className={styles.input} style={{ width: '100%', minHeight: '60px' }} value={editFormData.communityPreparedness} onChange={e => setEditFormData({...editFormData, communityPreparedness: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Availability Level</label>
                    <input className={styles.input} type="text" value={editFormData.availability} onChange={e => setEditFormData({...editFormData, availability: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Willing to Participate in Deployments</label>
                    <input className={styles.input} type="text" value={editFormData.willingToParticipate} onChange={e => setEditFormData({...editFormData, willingToParticipate: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Why Join SER</label>
                    <textarea className={styles.input} style={{ width: '100%', minHeight: '60px' }} value={editFormData.whyJoin} onChange={e => setEditFormData({...editFormData, whyJoin: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Hope to Contribute</label>
                    <textarea className={styles.input} style={{ width: '100%', minHeight: '60px' }} value={editFormData.hopeToContribute} onChange={e => setEditFormData({...editFormData, hopeToContribute: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>2026 Calendar Recommendations</label>
                    <textarea className={styles.input} style={{ width: '100%', minHeight: '60px' }} value={editFormData.calendarRecommendations} onChange={e => setEditFormData({...editFormData, calendarRecommendations: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Member Goals</label>
                    <textarea className={styles.input} style={{ width: '100%', minHeight: '60px' }} value={editFormData.memberGoals} onChange={e => setEditFormData({...editFormData, memberGoals: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={editFormData.joinedWhatsapp} onChange={e => setEditFormData({...editFormData, joinedWhatsapp: e.target.checked})} />
                      Joined WhatsApp Group
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={handleSaveEdit} className={styles.saveButton}>Save Changes</button>
                  <button onClick={() => setIsEditing(false)} style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Personal Info */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>1. Personal &amp; Contact Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div><strong>Full Name:</strong> <div>{selectedMemberModal.name || `${selectedMemberModal.firstName || ''} ${selectedMemberModal.lastName || ''}`}</div></div>
                  <div><strong>Email Address:</strong> <div>{selectedMemberModal.email || '—'}</div></div>
                  <div><strong>Nationality:</strong> <div>{selectedMemberModal.nationality || 'Kenya'}</div></div>
                  <div><strong>Phone Number:</strong> <div>{selectedMemberModal.phone || selectedMemberModal.whatsapp || '—'}</div></div>
                  <div><strong>{selectedMemberModal.idType || 'National ID'}:</strong> <div>{selectedMemberModal.idNumber || '—'}</div></div>
                  <div><strong>Date of Birth:</strong> <div>{selectedMemberModal.dob || '—'}</div></div>
                  <div><strong>Gender:</strong> <div>{selectedMemberModal.gender || '—'}</div></div>
                  <div><strong>Blood Type:</strong> <div>{selectedMemberModal.bloodType || '—'}</div></div>
                </div>
              </div>

              {/* Location & Residence */}
              <div className={styles.section} style={{ marginBottom: 0, padding: '1.25rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginTop: 0 }}>2. Address &amp; Residence</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <div><strong>Country:</strong> <div>{selectedMemberModal.addressCountry || 'Kenya'}</div></div>
                  {selectedMemberModal.addressCountry === 'Kenya' || !selectedMemberModal.addressCountry ? (
                    <>
                      <div><strong>Current Residence (County):</strong> <div>{selectedMemberModal.currentAddress || selectedMemberModal.county || '—'}</div></div>
                      <div><strong>Sub-County:</strong> <div>{selectedMemberModal.subCounty || '—'}</div></div>
                    </>
                  ) : (
                    <div><strong>City/Town:</strong> <div>{selectedMemberModal.city || '—'}</div></div>
                  )}
                  <div><strong>Other Country:</strong> <div>{selectedMemberModal.otherAddressCountry || 'Kenya'}</div></div>
                  {selectedMemberModal.otherAddressCountry === 'Kenya' || !selectedMemberModal.otherAddressCountry ? (
                    <>
                      <div><strong>Other County:</strong> <div>{selectedMemberModal.otherCounty || '—'}</div></div>
                      <div><strong>Other Sub-County:</strong> <div>{selectedMemberModal.otherSubCounty || '—'}</div></div>
                    </>
                  ) : (
                    <div><strong>Other City/Town:</strong> <div>{selectedMemberModal.otherCity || '—'}</div></div>
                  )}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageField({ label, value, onChange, pathStr }) {
  return (
    <div key={pathStr} style={{ marginBottom: '1.25rem' }}>
      <MobileImageUploader
        label={label}
        value={value}
        onChange={onChange}
        placeholder="Image URL or upload from mobile/desktop..."
      />
    </div>
  );
}

function OverviewDashboard({ userName, userRole, tabs, setActiveTab }) {
  const [stats, setStats] = useState({});
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        const posts = await getFlaggedPosts();
        if (isMounted) {
          setStats(data || {});
          setFlaggedPosts(posts || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    
    // Auto-update stats every 15 seconds
    const intervalId = setInterval(fetchStats, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const getTabLabel = (tab) => {
    if (tab === "registrations") return "Form Responses";
    if (tab === "blogs") return "Blog Posts";
    if (tab === "users") return "Users";
    if (tab === "rolemgmt") return "Role Management";
    return tab.charAt(0).toUpperCase() + tab.slice(1);
  };

  const getTabIcon = (tab) => {
    if (tab === "registrations") return <FiClipboard />;
    if (tab === "blogs") return <FiBookOpen />;
    if (tab === "users") return <FiUsers />;
    if (tab === "rolemgmt") return <FiShield />;
    return <FiEye />; // generic icon
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--primary-color, #2563eb)', color: '#fff', borderRadius: '12px' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>Welcome back, {userName || 'Admin'}!</h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
          Role: <strong style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{userRole}</strong>
        </p>
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Quick Stats</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}><FiLoader className={styles.spinner} style={{ fontSize: '2rem', color: 'var(--primary-color)' }} /></div>
        ) : (
          <>
            {tabs.includes('blogs') && (
              <div style={{ padding: '1.5rem', background: 'var(--white-color, #fff)', border: '1px solid var(--light-gray-color, #eaeaea)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.blogs || 0}</div>
                <div style={{ color: 'var(--text-color, #666)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Total Blogs</div>
              </div>
            )}
            {tabs.includes('events') && (
              <div style={{ padding: '1.5rem', background: 'var(--white-color, #fff)', border: '1px solid var(--light-gray-color, #eaeaea)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.events || 0}</div>
                <div style={{ color: 'var(--text-color, #666)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Upcoming Events</div>
              </div>
            )}
            {tabs.includes('projects') && (
              <div style={{ padding: '1.5rem', background: 'var(--white-color, #fff)', border: '1px solid var(--light-gray-color, #eaeaea)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.projects || 0}</div>
                <div style={{ color: 'var(--text-color, #666)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Active Projects</div>
              </div>
            )}
            {tabs.includes('registrations') && (
              <div style={{ padding: '1.5rem', background: 'var(--white-color, #fff)', border: '1px solid var(--light-gray-color, #eaeaea)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.member_registrations || 0}</div>
                <div style={{ color: 'var(--text-color, #666)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Member Registrations</div>
              </div>
            )}
            {tabs.includes('users') && (
              <div style={{ padding: '1.5rem', background: 'var(--white-color, #fff)', border: '1px solid var(--light-gray-color, #eaeaea)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.admin_users || 0}</div>
                <div style={{ color: 'var(--text-color, #666)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Admin Users</div>
              </div>
            )}
            {tabs.includes('products') && (
              <div style={{ padding: '1.5rem', background: 'var(--white-color, #fff)', border: '1px solid var(--light-gray-color, #eaeaea)', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.products || 0}</div>
                <div style={{ color: 'var(--text-color, #666)', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Shop Products</div>
              </div>
            )}
            {(userRole === "Super Admin" || userRole === "Admin" || userRole === "Project Lead") && (
              <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.flagged_items || 0}</div>
                <div style={{ color: '#991b1b', opacity: 0.8, fontSize: '0.9rem', marginTop: '0.5rem' }}>Flagged Items</div>
              </div>
            )}
          </>
        )}
      </div>

      {(userRole === "Super Admin" || userRole === "Admin" || userRole === "Project Lead") && flaggedPosts.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiAlertTriangle /> Flagged Posts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {flaggedPosts.map(post => (
              <div key={post.id} style={{ padding: '1.5rem', background: 'var(--white-color, #fff)', border: '1px solid var(--light-gray-color, #eaeaea)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{post.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', background: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Flagged</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-color, #666)', fontSize: '0.95rem' }}>
                  {post.content?.replace(/<[^>]+>/g, '').substring(0, 150) || "No content available."}...
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
                  Author: {post.author || 'Unknown'} • Flagged by: {post.flagged_by_email || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {tabs.filter(t => t !== 'overview').map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '1.5rem',
              background: 'var(--white-color, #fff)',
              border: '1px solid var(--light-gray-color, #eaeaea)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-color)',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseOver={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--primary-color)', transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' })}
            onMouseOut={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--light-gray-color, #eaeaea)', transform: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' })}
          >
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
              {getTabIcon(tab)}
            </div>
            <span style={{ fontWeight: 500 }}>{getTabLabel(tab)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminProfileSettings({ user, userName, showToast }) {
  if (!user) return null;
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (email !== user.email) {
        const res = await updateAdminEmail(user.email, email, user.uid);
        if (!res.success) {
          showToast(`Error updating email: ${res.message}`, "error");
          setIsSaving(false);
          return;
        }
        showToast("Email updated successfully. You will be signed out.", "success");
        setTimeout(() => {
          supabase.auth.signOut();
        }, 2000);
        return;
      }
      
      const res = await updateAdminProfile(user.email, user.uid, name !== userName ? name : null, password || null);
      if (res.success) {
        showToast("Profile updated successfully!");
        setPassword("");
      } else {
        showToast(`Error: ${res.message}`, "error");
      }
    } catch (err) {
      showToast("Failed to update profile.", "error");
    }
    setIsSaving(false);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px' }}>
      <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--white-color)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color, #eaeaea)', boxShadow: 'var(--box-shadow)' }}>
        <div>
          <label className={styles.label}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={styles.input} />
        </div>
        <div>
          <label className={styles.label}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} required />
          {email !== user?.email && <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}><FiAlertTriangle size={16} /> Changing your email will sign you out.</p>}
        </div>
        <div>
          <label className={styles.label}>New Password (leave blank to keep current)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} minLength={6} placeholder="••••••••" />
        </div>
        <button type="submit" className={styles.saveButton} disabled={isSaving} style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.75rem 2rem' }}>
          {isSaving ? "Saving..." : "Update Profile"}
        </button>
      </form>
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [customTabs, setCustomTabs] = useState(null); // null = use role defaults

  const toggleSection = (sectionPath) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionPath]: !prev[sectionPath]
    }));
  };

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("ser-theme");
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark-mode");
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove("dark-mode");
        setIsDarkMode(false);
      }
    } catch (e) {
      console.warn("localStorage is not accessible");
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    try {
      if (isDarkMode) {
        root.classList.remove('dark-mode');
        localStorage.setItem('ser-theme', 'light');
        setIsDarkMode(false);
      } else {
        root.classList.add('dark-mode');
        localStorage.setItem('ser-theme', 'dark');
        setIsDarkMode(true);
      }
    } catch (e) {
      console.warn("localStorage is not accessible");
      setIsDarkMode(!isDarkMode);
    }
  };

  useEffect(() => {
    // Safety timeout: Never keep the user on infinite loading spinner for more than 4 seconds
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      try {
        if (currentUser) {
          const userData = await getAdminUserData(currentUser.email).catch(() => null);
          if (userData) {
            if (userData.flagged) {
              await supabase.auth.signOut();
              setLoginError("Your account has been restricted. Please contact a Super Admin.");
              return;
            }
            setUserRole(userData.role || "Admin");
            setUserUsername(userData.username || userData.name || "");
            setUserName(userData.name || "");
            setMustChangePassword(userData.mustChangePassword === true);
            // Load per-user custom tab overrides
            const custom = await getUserCustomTabs(currentUser.email).catch(() => null);
            setCustomTabs(custom);
          } else {
            setUserRole("Admin");
            setUserUsername("");
            setUserName("");
            setMustChangePassword(false);
            setCustomTabs(null);
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuthLoading(false);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  const adminUsername = user ? user.email : "";
  const isBlogOnlyUser = userRole === "Author";
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  useEffect(() => {
    if (isBlogOnlyUser) {
      setActiveTab("blogs");
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const hash = window.location.hash;
      const validTabs = ["overview", "registrations", "blogs", "users", "manual", "settings"];
      
      let targetTab = null;
      if (tabParam && validTabs.includes(tabParam)) {
        targetTab = tabParam;
      } else if (hash) {
        const hashTab = hash.substring(1);
        if (validTabs.includes(hashTab)) {
          targetTab = hashTab;
        }
      }
      
      if (targetTab) {
        setActiveTab(targetTab);
      }
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
      const targetEmail = await resolveEmailFromUsername(loginEmail);
      const { error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: loginPassword,
      });
      if (error) {
        setLoginError("Invalid email/username or password.");
      }
    } catch (err) {
      setLoginError("Invalid email/username or password.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      const newTemplate = { ...template };
      if (path[0] === 'gallery' && path[1] === 'items' && typeof newTemplate === 'object') {
        newTemplate.created_by_email = adminUsername;
      }
      current.push(newTemplate);
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

  const handleGalleryHide = (path, index, hidden) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      current[index].hidden = hidden;
      current[index].hiddenByEmail = hidden ? adminUsername : null;
      return newData;
    });
  };

  const renderField = (key, value, path) => {


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
      const isTopLevel = path.length === 2;
      const sectionPathStr = path.join(".");
      const isExpanded = !isTopLevel || expandedSections[sectionPathStr];
      
      return (
        <div className={styles.section} key={sectionPathStr}>
          {isTopLevel ? (
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.75rem', background: 'var(--light-gray-color, #f1f5f9)', borderRadius: '6px', marginBottom: isExpanded ? '1rem' : '0' }}
              onClick={() => toggleSection(sectionPathStr)}
            >
              <h3 className={styles.sectionTitle} style={{ margin: 0, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
              <span style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>{isExpanded ? '−' : '+'}</span>
            </div>
          ) : (
            <h3 className={styles.sectionTitle}>{key}</h3>
          )}

          {isExpanded && (
            <div style={{ paddingLeft: isTopLevel ? '1rem' : '0', borderLeft: isTopLevel ? '2px solid var(--primary-color)' : 'none' }}>
              {value.map((item, index) => {
                const itemImage =
                  typeof item === "object" && item !== null
                    ? item.image || item.photo || item.avatar || item.src || item.logo || item.picture
                    : null;

                const isGallery = path[0] === 'gallery' && path[1] === 'items';
                
                return (
                  <div className={styles.nestedGroup} key={index}>
                    {isGallery ? (
                      <>
                        {(userRole === "Super Admin" || userRole === "Project Lead") && (
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleArrayDelete(path, index)}
                          >
                            Delete
                          </button>
                        )}
                        {!item.hidden ? (
                          <button className={styles.deleteButton} style={{ background: '#ff9800' }} onClick={() => handleGalleryHide(path, index, true)}>
                            Hide
                          </button>
                        ) : (
                          (item.hiddenByEmail === adminUsername || userRole === "Super Admin" || userRole === "Project Lead") && (
                            <button className={styles.deleteButton} style={{ background: '#4caf50' }} onClick={() => handleGalleryHide(path, index, false)}>
                              Unhide
                            </button>
                          )
                        )}
                        {item.hidden && (
                           <span style={{ color: 'red', marginLeft: '10px', fontSize: '0.85em', fontWeight: 'bold' }}>
                             Hidden {item.hiddenByEmail ? `(by ${item.hiddenByEmail})` : ''}
                           </span>
                        )}
                      </>
                    ) : (
                      (userRole === "Super Admin" || userRole === "Project Lead") && (
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleArrayDelete(path, index)}
                        >
                          Delete
                        </button>
                      )
                    )}

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
                + Add New {key.replace(/([A-Z])/g, ' $1').trim()} Item
              </button>
            </div>
          )}
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      const isTopLevel = path.length === 2;
      const sectionPathStr = path.join(".");
      const isExpanded = !isTopLevel || expandedSections[sectionPathStr];

      return (
        <div className={styles.section} key={sectionPathStr}>
          {isTopLevel ? (
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.75rem', background: 'var(--light-gray-color, #f1f5f9)', borderRadius: '6px', marginBottom: isExpanded ? '1rem' : '0' }}
              onClick={() => toggleSection(sectionPathStr)}
            >
              <h3 className={styles.sectionTitle} style={{ margin: 0, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
              <span style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>{isExpanded ? '−' : '+'}</span>
            </div>
          ) : (
            <h3 className={styles.sectionTitle}>{key}</h3>
          )}

          {isExpanded && (
            <div style={{ paddingLeft: isTopLevel ? '1rem' : '0', borderLeft: isTopLevel ? '2px solid var(--primary-color)' : 'none' }}>
              {Object.entries(value).map(([subKey, subValue]) => 
                renderField(subKey, subValue, [...path, subKey])
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Filter tabs based on user role
  const allDataKeys = Array.from(new Set([...Object.keys(initialData || {}), "history"]));
  const allDataTabs = allDataKeys.filter(t => !["projects", "events", "gallery", "faq"].includes(t));
  let tabs = [];
  
  const nonJsonTabs = ["registrations", "blogs", "users", "projects", "events", "gallery", "faq", "products", "contacts", "socials"];

  const isGrandpa = adminUsername?.toLowerCase() === "grandpa@seresponse.org" || user?.email?.toLowerCase() === "grandpa@seresponse.org";

  // Apply custom tab overrides if set for this user (Super Admin manages via Role Management tab)
  if (customTabs && Array.isArray(customTabs) && userRole !== "Super Admin") {
    tabs = [...customTabs];
  } else if (userRole === "Super Admin") {
    tabs = [...nonJsonTabs, ...allDataTabs, "rolemgmt"];
  } else if (userRole === "Admin") {
    tabs = ["registrations", "blogs", "users", "events", "faq", "gallery"];
  } else if (userRole === "Project Lead") {
    tabs = ["registrations", "blogs", "users", "projects", "events", "faq", "gallery", "products"];
  } else if (userRole === "Author") {
    tabs = ["blogs", "gallery"];
  } else if (userRole === "Communication") {
    tabs = ["contacts", "socials", "gallery"];
  } else if (userRole === "Events") {
    tabs = ["events", "blogs", "gallery"];
  }

  if (isGrandpa) {
    if (!tabs.includes("events")) tabs.push("events");
    if (!tabs.includes("history")) tabs.push("history");
  }

  if (!tabs.includes("gallery")) {
    tabs.push("gallery");
  }

  tabs = ["overview", ...tabs, "manual", "settings"];

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
          backgroundColor: 'var(--background-color, #f8fafc)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 9999
        }}>
          {/* Top side: Login form */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem 2rem 2rem',
            backgroundColor: 'var(--white-color, #ffffff)',
            boxShadow: '0 4px 25px rgba(0,0,0,0.05)',
            position: 'relative',
            zIndex: 2,
            minHeight: '100vh'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '450px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              color: 'var(--text-color, #000)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Admin Access</h2>
                <p style={{ color: 'var(--text-secondary, #666)' }}>Sign in to manage the dashboard</p>
              </div>
              {loginError && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>{loginError}</div>}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address or Username</label>
                  <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="Enter email or username" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)', background: 'var(--background-color, #fff)', color: 'var(--text-color, #000)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)', background: 'var(--background-color, #fff)', color: 'var(--text-color, #000)' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.875rem', background: 'var(--primary-color, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>Sign In</button>
              </form>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '4rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-color, #666)', fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: 500 }}>Need help? Scroll down for the Guest User Manual</p>
              <div style={{ fontSize: '2rem', animation: 'bounce 2s infinite', display: 'flex', justifyContent: 'center' }}><FiChevronDown size={32} /></div>
            </div>
          </div>

          {/* Bottom side: User Manual */}
          <div style={{
            flex: '1',
            padding: '4rem 2rem',
            backgroundColor: 'var(--background-color, #f8fafc)',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <UserManual userRole="Guest" />
            </div>
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
              gap: '0.5rem',
              overflow: 'hidden'
            }}>
              <span style={{ fontSize: '1rem', display: 'flex', flexShrink: 0 }}><FiUser size={16} /></span>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={adminUsername}>
                  {adminUsername}
                </span>
                <span style={{ opacity: 0.75, fontWeight: 400, fontSize: '0.7rem' }}>
                  {userRole || 'Unknown Role'}
                </span>
              </div>
            </div>
            <button
              className={styles.navButton}
              onClick={handleLogout}
              style={{ color: '#ef4444', padding: '0.4rem 0.75rem', minHeight: 'auto' }}
            >
              <FiLogOut style={{ marginRight: '6px' }} /> Logout
            </button>
            <button
              className={styles.navButton}
              onClick={toggleTheme}
              style={{ padding: '0.4rem 0.75rem', minHeight: 'auto', display: 'flex', alignItems: 'center' }}
            >
              {isDarkMode ? (
                <><FiSun style={{ marginRight: '6px' }} /> Light Mode</>
              ) : (
                <><FiMoon style={{ marginRight: '6px' }} /> Dark Mode</>
              )}
            </button>
          </div>
        )}
        <div className={styles.tabsWrapper}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.navButton} ${activeTab === tab ? styles.active : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" ? <><FiEye style={{ marginRight: '6px' }} /> Overview</>
              : tab === "registrations" ? <><FiClipboard style={{ marginRight: '6px' }} /> Form Responses</> 
              : tab === "blogs" ? <><FiBookOpen style={{ marginRight: '6px' }} /> Blog Posts</>
              : tab === "users" ? <><FiUsers style={{ marginRight: '6px' }} /> Users</>
              : tab === "manual" ? <><FiHelpCircle style={{ marginRight: '6px' }} /> User Manual</>
              : tab === "settings" ? <><FiSettings style={{ marginRight: '6px' }} /> Account Settings</>
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            {activeTab === "overview" ? "Dashboard Overview"
            : activeTab === "registrations" ? "Membership Form Responses" 
            : activeTab === "blogs" ? "Blog Posts Management"
            : activeTab === "users" ? "User Management"
            : activeTab === "manual" ? "User Manual"
            : activeTab === "settings" ? "Personal Account Settings"
            : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings`}
          </h1>
          {!nonJsonTabs.includes(activeTab) && activeTab !== "overview" && activeTab !== "manual" && activeTab !== "settings" && (
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
          {activeTab === "overview" ? (
            <OverviewDashboard userName={userName} userRole={userRole} tabs={tabs} setActiveTab={setActiveTab} />
          ) : activeTab === "registrations" ? (
            <MemberRegistrationsView showToast={showToast} currentUserRole={userRole} currentUserEmail={adminUsername} />
          ) : activeTab === "blogs" ? (
            <BlogManager showToast={showToast} currentUserEmail={adminUsername} currentUserRole={userRole} currentUserUsername={userUsername} />
          ) : activeTab === "users" ? (
            <AdminUsersTab showToast={showToast} currentUserEmail={adminUsername} currentUserRole={userRole} />
          ) : activeTab === "projects" ? (
            <ProjectsManager currentUserEmail={adminUsername} currentUserRole={userRole} />
          ) : activeTab === "events" ? (
            <EventsManager currentUserEmail={adminUsername} currentUserRole={userRole} currentUserName={userName || userUsername || adminUsername} showToast={showToast} />
          ) : activeTab === "gallery" ? (
            <GalleryManager currentUserEmail={adminUsername} currentUserRole={userRole} showToast={showToast} />
          ) : activeTab === "faq" ? (
            <FaqsManager currentUserEmail={adminUsername} currentUserRole={userRole} />
          ) : activeTab === "products" ? (
            <ProductsManager currentUserEmail={adminUsername} currentUserRole={userRole} />
          ) : activeTab === "contacts" ? (
            <ContactsManager currentUserEmail={adminUsername} currentUserRole={userRole} />
          ) : activeTab === "socials" ? (
            <SocialsManager currentUserEmail={adminUsername} currentUserRole={userRole} />
          ) : activeTab === "rolemgmt" ? (
            <RoleManagementTab showToast={showToast} />
          ) : activeTab === "manual" ? (
            <UserManual userRole={userRole} />
          ) : activeTab === "settings" ? (
            <AdminProfileSettings user={user} userName={userName} showToast={showToast} />
          ) : (
            <div>
              <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #ffeeba', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span><strong>Note:</strong> Data in this tab is tied to a local JSON file. Please ensure you are editing this on <strong>localhost</strong> for your changes to persist properly in the codebase.</span>
              </div>
              {renderField(activeTab, data[activeTab], [activeTab])}
            </div>
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
