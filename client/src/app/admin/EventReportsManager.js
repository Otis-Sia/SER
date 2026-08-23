"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { FiEdit, FiTrash2, FiPlus, FiSave, FiX } from "react-icons/fi";
import { getAdminPastEvents, getAdminReport, saveEventReport, deleteEventReport } from "./actions";

export default function EventReportsManager({ showToast, currentUserUsername }) {
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({ title: "", content_md: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const eventsData = await getAdminPastEvents();
      setEvents(eventsData);
      
      const reportsMap = {};
      for (const ev of eventsData) {
        const evId = ev.google_event_id || ev.id;
        const rep = await getAdminReport(evId);
        if (rep) {
          reportsMap[evId] = rep;
        }
      }
      setReports(reportsMap);
    } catch (error) {
      console.error("Failed to load events/reports", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (event) => {
    const eventId = event.google_event_id || event.id;
    setEditingEventId(eventId);
    const existingReport = reports[eventId];
    setFormData({
      title: existingReport ? existingReport.title : `${event.title} - Report`,
      content_md: existingReport ? existingReport.content_md : ""
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await saveEventReport({
      google_event_id: editingEventId,
      title: formData.title,
      content_md: formData.content_md,
      author: currentUserUsername || "Admin"
    });
    
    if (res.success) {
      showToast("Report saved successfully");
      setEditingEventId(null);
      loadData();
    } else {
      showToast(`Failed to save: ${res.message}`, "error");
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    const res = await deleteEventReport(eventId);
    if (res.success) {
      showToast("Report deleted successfully");
      loadData();
    } else {
      showToast(`Failed to delete report: ${res.message}`, "error");
    }
  };

  if (loading) return <div>Loading events and reports...</div>;

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerHeader}>
        <h2>Event Reports</h2>
        <p>Write reports and summaries for past events.</p>
      </div>

      {editingEventId ? (
        <form onSubmit={handleSave} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>Report Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Content (Markdown supported)</label>
            <textarea 
              value={formData.content_md} 
              onChange={e => setFormData({...formData, content_md: e.target.value})} 
              required 
              rows={10}
              className={styles.input}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}><FiSave /> Save Report</button>
            <button type="button" onClick={() => setEditingEventId(null)} className={styles.cancelButton}><FiX /> Cancel</button>
          </div>
        </form>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.regTable}>
            <thead>
              <tr>
                <th>Event Date</th>
                <th>Event Title</th>
                <th>Report Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign: 'center'}}>No past events found.</td></tr>
              ) : (
                events.map(event => {
                  const eventId = event.google_event_id || event.id;
                  const hasReport = !!reports[eventId];
                  
                  return (
                    <tr key={eventId}>
                      <td>{new Date(event.event_date || event.eventDate).toLocaleDateString()}</td>
                      <td>{event.title}</td>
                      <td>
                        {hasReport ? (
                          <span style={{color: 'green', fontWeight: 'bold'}}>Report Created</span>
                        ) : (
                          <span style={{color: 'gray'}}>No Report</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleEdit(event)} 
                            className={styles.actionBtn} 
                            style={{ color: 'var(--primary-color)' }}
                            title={hasReport ? "Edit Report" : "Write Report"}
                          >
                            {hasReport ? <FiEdit size={18} /> : <FiPlus size={18} />}
                          </button>
                          {hasReport && (
                            <button 
                              onClick={() => handleDelete(eventId)} 
                              className={styles.actionBtn} 
                              style={{ color: 'var(--danger-color, #ef4444)' }}
                              title="Delete Report"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
