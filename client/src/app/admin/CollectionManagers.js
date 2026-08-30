"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { FiRefreshCw, FiEdit, FiTrash2, FiSave, FiX, FiPlus, FiFlag, FiEye, FiEyeOff, FiStar, FiCalendar, FiClock, FiMap, FiCheck } from "react-icons/fi";
import RichTextEditor from "../../components/RichTextEditor";
import MobileImageUploader from "../../components/MobileImageUploader";
import {
  getProjects, addProject, updateProject, deleteProject,
  getEvents, getPastEvents, addEvent, updateEvent, deleteEvent,
  getAdminReport, saveEventReport, deleteEventReport,
  getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem,
  getFaqs, addFaq, updateFaq, deleteFaq,
  getProducts, addProduct, updateProduct, deleteProduct,
  getContacts, addContact, updateContact, deleteContact,
  getSocialMedia, addSocialMedia, updateSocialMedia, deleteSocialMedia,
  flagCmsDocument, hideCmsDocument
} from "./actions";
import MilestonesManager from "./MilestonesManager";
import GalleryManagerComponent from "./GalleryManager";

// Generic Collection Manager Component
function CollectionManager({ 
  collectionName, title, fetchAction, addAction, updateAction, deleteAction, defaultItem, renderFields,
  currentUserEmail, currentUserRole 
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const loadItems = async () => {
    setLoading(true);
    const data = await fetchAction();
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (id) => {
    let result;
    if (id === 'new') {
      const payload = {
        ...editFormData,
        created_by_email: currentUserEmail || editFormData.created_by_email || ""
      };
      result = await addAction(payload);
    } else {
      result = await updateAction(id, editFormData);
    }
    
    if (result.success) {
      setEditingId(null);
      setEditFormData({});
      loadItems();
    } else {
      alert("Error saving: " + result.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const result = await deleteAction(id);
    if (result.success) {
      loadItems();
    } else {
      alert("Error deleting: " + result.message);
    }
  };

  const handleFlag = async (item) => {
    const nextFlagged = !item.flagged;
    const label = item.title || item.name || item.question || item.type || item.platform || "this item";
    if (!confirm(`Are you sure you want to ${nextFlagged ? 'flag' : 'unflag'} "${label}"?`)) return;
    const result = await flagCmsDocument(collectionName, item.id, nextFlagged, currentUserEmail);
    if (result.success) {
      loadItems();
    } else {
      alert("Error updating flag: " + result.message);
    }
  };

  const handleHide = async (id, currentHidden) => {
    const nextHidden = !currentHidden;
    if (!confirm(`Are you sure you want to ${nextHidden ? 'hide' : 'unhide'} this item?`)) return;
    const result = await hideCmsDocument(collectionName, id, nextHidden, currentUserEmail);
    if (result.success) {
      loadItems();
    } else {
      alert("Error updating visibility: " + result.message);
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditFormData(defaultItem);
  };

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className={styles.refreshBtn} onClick={loadItems}>
            <FiRefreshCw /> Refresh
          </button>
          <button className={styles.addButton} style={{ width: 'auto', marginTop: 0, padding: '0.65rem 1.25rem' }} onClick={handleAddNew}>
            <FiPlus /> Add New
          </button>
        </div>
      </div>
      
      {loading ? (
        <p>Loading {title}...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {editingId === 'new' && (
            <div className={styles.collectionCard} style={{ border: '2px solid var(--primary-color)' }}>
              <h4>Add New {title}</h4>
              {renderFields(editFormData, handleChange)}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className={styles.actionBtn} onClick={() => handleSave('new')}><FiSave /> Save</button>
                <button className={styles.actionBtnCancel} onClick={handleCancel}><FiX /> Cancel</button>
              </div>
            </div>
          )}

          {items.map(item => {
            const isOwner = Boolean(item.created_by_email && currentUserEmail && item.created_by_email.toLowerCase() === currentUserEmail.toLowerCase());
            const isGrandpa = currentUserEmail?.toLowerCase() === "grandpa@seresponse.org";
            const canDelete = isOwner || ["Super Admin", "Project Lead"].includes(currentUserRole);
            const canFlag = !isOwner || ["Super Admin", "Admin", "Project Lead"].includes(currentUserRole);
            const canHide = ["Super Admin", "Admin", "Project Lead"].includes(currentUserRole);
            const canEdit = isOwner || ["Super Admin", "Project Lead"].includes(currentUserRole) || isGrandpa;

            return (
              <div key={item.id} className={styles.collectionCard}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Badges and metadata */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem', alignItems: 'center' }}>
                    {item.flagged && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', fontWeight: 600 }}>
                        Flagged {item.flaggedByEmail ? `by ${item.flaggedByEmail}` : ''}
                      </span>
                    )}
                    {item.hidden && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: '#fff3e0', color: '#e65100', fontWeight: 600 }}>
                        Hidden {item.hiddenByEmail ? `by ${item.hiddenByEmail}` : ''}
                      </span>
                    )}
                    {["Super Admin", "Project Lead"].includes(currentUserRole) && item.created_by_email && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                        Posted by: {item.created_by_email}
                      </span>
                    )}
                  </div>

                  {editingId === item.id ? (
                    <div>
                      {renderFields(editFormData, handleChange)}
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className={styles.actionBtn} onClick={() => handleSave(item.id)}><FiSave /> Save</button>
                        <button className={styles.actionBtnCancel} onClick={handleCancel}><FiX /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.collectionCardContent}>
                      {renderFields(item, null, true)}
                    </div>
                  )}
                </div>
                {editingId !== item.id && (
                  <div className={styles.collectionCardActions} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0' }}>
                    {canFlag && (
                      <button className={styles.actionBtn} style={{ background: item.flagged ? '#dc2626' : '#d97706', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }} onClick={() => handleFlag(item)}>
                        <FiFlag /> {item.flagged ? 'Unflag' : 'Flag'}
                      </button>
                    )}
                    {canHide && (
                      <button className={styles.actionBtn} style={{ background: item.hidden ? '#059669' : '#4b5563', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }} onClick={() => handleHide(item.id, item.hidden)}>
                        {item.hidden ? <FiEye /> : <FiEyeOff />} {item.hidden ? 'Unhide' : 'Hide'}
                      </button>
                    )}
                    {canEdit && (
                      <button className={styles.actionBtnEdit} onClick={() => handleEdit(item)}><FiEdit /> Edit</button>
                    )}
                    {canDelete && (
                      <button className={styles.actionBtnDelete} onClick={() => handleDelete(item.id)}><FiTrash2 /> Delete</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {items.length === 0 && editingId !== 'new' && <p>No items found.</p>}
        </div>
      )}
    </div>
  );
}

// Field renderers for different entities
const renderProjectFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <>
      <h4 style={{ margin: '0 0 0.25rem 0' }}>{data.title}</h4>
      {data.focus && <p style={{ margin: '0 0 0.25rem 0' }}><span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(18,154,68,0.1)', color: 'var(--primary-color)', fontWeight: 600 }}>{data.focus}</span></p>}
      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.8 }}>{data.description}</p>
      {data.link && <p style={{ margin: 0, fontSize: '0.85rem' }}><a href={data.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>{data.linkText || 'View Link →'}</a></p>}
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="title" value={data.title || ''} onChange={onChange} placeholder="Title" />
      <input className={styles.input} name="focus" value={data.focus || ''} onChange={onChange} placeholder="Focus" />
      <RichTextEditor name="description" value={data.description || ''} onChange={(val) => onChange({ target: { name: 'description', value: val } })} placeholder="Description" />
      <input className={styles.input} name="link" value={data.link || ''} onChange={onChange} placeholder="Link URL" />
      <input className={styles.input} name="linkText" value={data.linkText || ''} onChange={onChange} placeholder="Link Text" />
    </div>
  );
};

const renderEventFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <>
      <h4 style={{ margin: '0 0 0.25rem 0' }}>{data.title}</h4>
      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {(data.eventDate || data.event_date) && <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(18,154,68,0.1)', color: 'var(--primary-color)', fontWeight: 600 }}>{data.eventDate || (data.event_date ? new Date(data.event_date).toLocaleDateString() : '')}</span>}
        {data.time && <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600 }}>{data.time}</span>}
        {data.location && <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', fontWeight: 600 }}>{data.location}</span>}
      </p>
      {data.description && <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>{data.description}</p>}
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="title" value={data.title || ''} onChange={onChange} placeholder="Event Title" />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="date" className={styles.input} style={{ flex: 1 }} name="eventDate" value={data.eventDate || (data.event_date ? data.event_date.split('T')[0] : '')} onChange={onChange} />
        <input type="time" className={styles.input} style={{ flex: 1 }} name="time" value={data.time || (data.event_date && data.event_date.includes('T') ? data.event_date.split('T')[1].substring(0, 5) : '')} onChange={onChange} placeholder="Time" />
      </div>
      <input className={styles.input} name="location" value={data.location || ''} onChange={onChange} placeholder="Location" />
      <RichTextEditor name="description" value={data.description || ''} onChange={(val) => onChange({ target: { name: 'description', value: val } })} placeholder="Description" />
    </div>
  );
};

const renderGalleryFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {data.imageUrl && <img src={data.imageUrl} alt={data.alt} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
      <div style={{ minWidth: 0 }}>
        <h4 style={{ margin: '0 0 0.25rem 0' }}>{data.title}</h4>
        {data.description && <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>{data.description}</p>}
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <input className={styles.input} name="title" value={data.title || ''} onChange={onChange} placeholder="Title" />
      <MobileImageUploader
        label="Gallery Image"
        value={data.imageUrl || ''}
        onChange={(url) => onChange({ target: { name: 'imageUrl', value: url } })}
        placeholder="Image URL or choose file from device..."
      />
      <input className={styles.input} name="alt" value={data.alt || ''} onChange={onChange} placeholder="Alt Text" />
      <textarea className={styles.textarea} name="description" value={data.description || ''} onChange={onChange} placeholder="Description" />
    </div>
  );
};

const renderFaqFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <>
      <h4 style={{ margin: '0 0 0.25rem 0' }}>Q: {data.question}</h4>
      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.8 }}><strong>A:</strong> {data.answer}</p>
      <p style={{ margin: 0 }}><span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', fontWeight: 600 }}>Order: {data.order}</span></p>
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="question" value={data.question || ''} onChange={onChange} placeholder="Question" />
      <RichTextEditor name="answer" value={data.answer || ''} onChange={(val) => onChange({ target: { name: 'answer', value: val } })} placeholder="Answer" />
      <input type="number" className={styles.input} name="order" value={data.order || 0} onChange={onChange} placeholder="Sort Order" />
    </div>
  );
};

const renderProductFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {data.imageUrl && <img src={data.imageUrl} alt={data.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
      <div style={{ minWidth: 0 }}>
        <h4 style={{ margin: '0 0 0.25rem 0' }}>{data.name}</h4>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>KES {data.priceKes}</p>
        {data.description && <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', opacity: 0.8 }}>{data.description}</p>}
        <p style={{ margin: 0 }}><span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: data.featured ? 'rgba(18,154,68,0.1)' : 'rgba(0,0,0,0.06)', color: data.featured ? 'var(--primary-color)' : 'inherit', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{data.featured ? <><FiStar size={12} /> Featured</> : 'Regular'}</span></p>
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <input className={styles.input} name="name" value={data.name || ''} onChange={onChange} placeholder="Product Name" />
      <input type="number" className={styles.input} name="priceKes" value={data.priceKes || 0} onChange={onChange} placeholder="Price (KES)" />
      <MobileImageUploader
        label="Product Image"
        value={data.imageUrl || ''}
        onChange={(url) => onChange({ target: { name: 'imageUrl', value: url } })}
        placeholder="Image URL or choose file from device..."
      />
      <RichTextEditor name="description" value={data.description || ''} onChange={(val) => onChange({ target: { name: 'description', value: val } })} placeholder="Description" />
      <label>
        <input type="checkbox" name="featured" checked={data.featured || false} onChange={onChange} />
        Featured Product
      </label>
    </div>
  );
};

// Export individual managers
export const ProjectsManager = (props) => <CollectionManager collectionName="projects" title="Projects" fetchAction={getProjects} addAction={addProject} updateAction={updateProject} deleteAction={deleteProject} defaultItem={{ title: '', focus: '', description: '', link: '', linkText: '' }} renderFields={renderProjectFields} {...props} />;
export const PastEventsManager = ({ currentUserEmail, currentUserRole, currentUserName, showToast, ...props }) => {
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [reportingEventId, setReportingEventId] = useState(null);
  const [reportFormData, setReportFormData] = useState({ title: '', content_md: '', author: '' });
  const [savingReport, setSavingReport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const defaultAuthorName = currentUserName || (currentUserEmail && !currentUserEmail.includes('@') ? currentUserEmail : (currentUserEmail ? currentUserEmail.split('@')[0] : 'Admin'));

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPastEvents();
      setEvents(data || []);
      const repMap = {};
      for (const ev of (data || [])) {
        const evId = ev.google_event_id || ev.id;
        const rep = await getAdminReport(evId);
        if (rep) repMap[evId] = rep;
      }
      setReports(repMap);
    } catch (e) {
      console.error("Error loading past events:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReport = (event) => {
    const eventId = event.google_event_id || event.id;
    if (reportingEventId === eventId) {
      setReportingEventId(null);
      return;
    }
    setReportingEventId(eventId);
    const existing = reports[eventId];
    const initialAuthor = existing?.author 
      ? (existing.author.includes('@') ? existing.author.split('@')[0] : existing.author)
      : defaultAuthorName;

    setReportFormData({
      title: existing?.title || `${event.title} - Event Report`,
      content_md: existing?.content_md || '',
      author: initialAuthor
    });
  };

  const handleSaveReport = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!reportFormData.title.trim()) {
      alert("Please provide a title for the report.");
      return;
    }
    setSavingReport(true);
    const res = await saveEventReport({
      google_event_id: reportingEventId,
      title: reportFormData.title,
      content_md: reportFormData.content_md,
      author: reportFormData.author?.trim() || defaultAuthorName || "Admin"
    });
    setSavingReport(false);
    if (res.success) {
      if (showToast) showToast("Event report saved successfully!");
      else alert("Event report saved successfully!");
      setReportingEventId(null);
      loadData();
    } else {
      if (showToast) showToast(`Failed to save report: ${res.message}`, "error");
      else alert(`Failed to save report: ${res.message}`);
    }
  };

  const handleDeleteReport = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event report?")) return;
    const res = await deleteEventReport(eventId);
    if (res.success) {
      if (showToast) showToast("Report deleted successfully!");
      else alert("Report deleted successfully!");
      if (reportingEventId === eventId) setReportingEventId(null);
      loadData();
    } else {
      if (showToast) showToast(`Failed to delete report: ${res.message}`, "error");
      else alert(`Failed to delete report: ${res.message}`);
    }
  };

  const handleEditEvent = (event) => {
    setEditingId(event.id);
    setEditFormData(event);
    setReportingEventId(null);
  };

  const handleSaveEvent = async (id) => {
    let result;
    if (id === 'new') {
      result = await addEvent(editFormData);
    } else {
      result = await updateEvent(id, editFormData);
    }
    if (result.success) {
      setEditingId(null);
      setEditFormData({});
      loadData();
    } else {
      alert("Error saving event: " + result.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const res = await deleteEvent(id);
    if (res.success) loadData();
    else alert("Error deleting event: " + res.message);
  };

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Past Events</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className={styles.refreshBtn} onClick={loadData}>
            <FiRefreshCw /> Refresh
          </button>
          <button 
            className={styles.addButton} 
            style={{ width: 'auto', marginTop: 0, padding: '0.65rem 1.25rem' }} 
            onClick={() => { setEditingId('new'); setEditFormData({ title: '', eventDate: '', time: '', location: '', description: '' }); setReportingEventId(null); }}
          >
            <FiPlus /> Add New Past Event
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading past events...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {editingId === 'new' && (
            <div className={styles.collectionCard} style={{ border: '2px solid var(--primary-color)' }}>
              <h4>Add New Past Event</h4>
              {renderEventFields(editFormData, (e) => {
                const { name, value } = e.target;
                setEditFormData(prev => ({ ...prev, [name]: value }));
              })}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className={styles.actionBtn} onClick={() => handleSaveEvent('new')}><FiSave /> Save</button>
                <button className={styles.actionBtnCancel} onClick={() => setEditingId(null)}><FiX /> Cancel</button>
              </div>
            </div>
          )}

          {events.map((event) => {
            const eventId = event.google_event_id || event.id;
            const report = reports[eventId];
            const isEditingThisEvent = editingId === event.id;
            const isReportingThisEvent = reportingEventId === eventId;

            return (
              <div key={event.id} className={styles.collectionCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    {isEditingThisEvent ? (
                      <div>
                        <h4>Edit Event</h4>
                        {renderEventFields(editFormData, (e) => {
                          const { name, value } = e.target;
                          setEditFormData(prev => ({ ...prev, [name]: value }));
                        })}
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button className={styles.actionBtn} onClick={() => handleSaveEvent(event.id)}><FiSave /> Save</button>
                          <button className={styles.actionBtnCancel} onClick={() => setEditingId(null)}><FiX /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {renderEventFields(event, null, true)}
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {report ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                              <FiCheck size={14} /> Report Published: &quot;{report.title}&quot;
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}>
                              No Report Written Yet
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditingThisEvent && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenReport(event)}
                        style={{
                          backgroundColor: report ? '#0284c7' : 'var(--primary-color, #129a44)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        <FiEdit /> {report ? 'Edit Report' : 'Write Report'}
                      </button>
                      <button className={styles.actionBtnEdit} onClick={() => handleEditEvent(event)}><FiEdit /> Edit</button>
                      <button className={styles.actionBtnDelete} onClick={() => handleDeleteEvent(event.id)}><FiTrash2 /> Delete</button>
                    </div>
                  )}
                </div>

                {/* WYSIWYG Report Box */}
                {isReportingThisEvent && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '2px solid var(--primary-color, #129a44)',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, color: 'var(--primary-color, #129a44)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiEdit size={18} /> {report ? 'Edit Event Report' : 'Write Event Report'} — {event.title}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setReportingEventId(null)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                      >
                        <FiX size={20} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem', color: '#374151' }}>
                          Report Title
                        </label>
                        <input
                          className={styles.input}
                          type="text"
                          value={reportFormData.title}
                          onChange={(e) => setReportFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Community Preparedness Drill - Post Event Summary"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem', color: '#374151' }}>
                          Report Author (Name)
                        </label>
                        <input
                          className={styles.input}
                          type="text"
                          value={reportFormData.author || ''}
                          onChange={(e) => setReportFormData(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="e.g. Sia, Grandpa, Lead Trainer"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem', color: '#374151' }}>
                          Report Content (WYSIWYG Editor)
                        </label>
                        <RichTextEditor
                          value={reportFormData.content_md}
                          onChange={(val) => setReportFormData(prev => ({ ...prev, content_md: val }))}
                          placeholder="Write the event recap, highlights, key outcomes, photos, or quotes here..."
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={handleSaveReport}
                            disabled={savingReport}
                            className={styles.actionBtn}
                            style={{ padding: '0.55rem 1.25rem', fontSize: '0.9rem' }}
                          >
                            <FiSave /> {savingReport ? 'Saving Report...' : 'Save Report'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportingEventId(null)}
                            className={styles.actionBtnCancel}
                            style={{ padding: '0.55rem 1rem', fontSize: '0.9rem' }}
                          >
                            <FiX /> Cancel
                          </button>
                        </div>

                        {report && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(eventId)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '0.55rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiTrash2 /> Delete Report
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {events.length === 0 && editingId !== 'new' && <p>No past events found.</p>}
        </div>
      )}
    </div>
  );
};

export const EventsManager = (props) => {
  const [subTab, setSubTab] = useState("events");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Sub-Navigation Pill Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color, #e5e7eb)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setSubTab("events")}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: subTab === "events" ? 'var(--primary-color, #129a44)' : 'rgba(0,0,0,0.05)',
            color: subTab === "events" ? '#ffffff' : 'var(--text-color, #374151)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCalendar /> Upcoming Events</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab("past")}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: subTab === "past" ? 'var(--primary-color, #129a44)' : 'rgba(0,0,0,0.05)',
            color: subTab === "past" ? '#ffffff' : 'var(--text-color, #374151)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock /> Past Events</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab("milestones")}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: subTab === "milestones" ? 'var(--primary-color, #129a44)' : 'rgba(0,0,0,0.05)',
            color: subTab === "milestones" ? '#ffffff' : 'var(--text-color, #374151)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiMap /> Historic Milestones &amp; Timeline</span>
        </button>
      </div>

      {subTab === "events" ? (
        <CollectionManager
          collectionName="events"
          title="Upcoming Events"
          fetchAction={getEvents}
          addAction={addEvent}
          updateAction={updateEvent}
          deleteAction={deleteEvent}
          defaultItem={{ title: '', eventDate: '', time: '', location: '', description: '' }}
          renderFields={renderEventFields}
          {...props}
        />
      ) : subTab === "past" ? (
        <PastEventsManager {...props} />
      ) : (
        <MilestonesManager {...props} />
      )}
    </div>
  );
};
export const GalleryManager = (props) => <GalleryManagerComponent {...props} />;
export const FaqsManager = (props) => <CollectionManager collectionName="faqs" title="FAQs" fetchAction={getFaqs} addAction={addFaq} updateAction={updateFaq} deleteAction={deleteFaq} defaultItem={{ question: '', answer: '', order: 0 }} renderFields={renderFaqFields} {...props} />;
export const ProductsManager = (props) => <CollectionManager collectionName="products" title="Products" fetchAction={getProducts} addAction={addProduct} updateAction={updateProduct} deleteAction={deleteProduct} defaultItem={{ name: '', priceKes: 0, imageUrl: '', description: '', featured: false }} renderFields={renderProductFields} {...props} />;

const renderContactFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <>
      <h4 style={{ margin: '0 0 0.25rem 0' }}>{data.type}</h4>
      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', wordBreak: 'break-all', opacity: 0.8 }}>{data.value}</p>
      <p style={{ margin: 0 }}><span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', fontWeight: 600 }}>Order: {data.order}</span></p>
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <select className={styles.input} name="type" value={data.type || ''} onChange={onChange}>
        <option value="">Select Type</option>
        <option value="Email">Email</option>
        <option value="Phone">Phone</option>
        <option value="WhatsApp">WhatsApp</option>
        <option value="Physical Address">Physical Address</option>
      </select>
      <input className={styles.input} name="value" value={data.value || ''} onChange={onChange} placeholder="Contact Value (e.g., +254...)" />
      <input type="number" className={styles.input} name="order" value={data.order || 0} onChange={onChange} placeholder="Sort Order" />
    </div>
  );
};

const renderSocialFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <>
      <h4 style={{ margin: '0 0 0.25rem 0' }}>{data.platform}</h4>
      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', wordBreak: 'break-all', opacity: 0.8 }}><strong>URL:</strong> {data.url}</p>
      <p style={{ margin: 0 }}><span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(18,154,68,0.1)', color: 'var(--primary-color)', fontWeight: 600 }}>{data.type}</span></p>
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <select className={styles.input} name="platform" value={data.platform || ''} onChange={onChange}>
        <option value="">Select Platform</option>
        <option value="Instagram">Instagram</option>
        <option value="Facebook">Facebook</option>
        <option value="TikTok">TikTok</option>
        <option value="Twitter/X">Twitter/X</option>
        <option value="LinkedIn">LinkedIn</option>
      </select>
      <select className={styles.input} name="type" value={data.type || 'Embedded Post'} onChange={onChange}>
        <option value="Embedded Post">Embedded Post</option>
      </select>
      <input className={styles.input} name="url" value={data.url || ''} onChange={onChange} placeholder="URL or Post Link" />
    </div>
  );
};

export const ContactsManager = (props) => <CollectionManager collectionName="contacts" title="Contact Info" fetchAction={getContacts} addAction={addContact} updateAction={updateContact} deleteAction={deleteContact} defaultItem={{ type: '', value: '', order: 0 }} renderFields={renderContactFields} {...props} />;
export const SocialsManager = (props) => <CollectionManager collectionName="social_media" title="Social Media" fetchAction={getSocialMedia} addAction={addSocialMedia} updateAction={updateSocialMedia} deleteAction={deleteSocialMedia} defaultItem={{ platform: '', type: '', url: '' }} renderFields={renderSocialFields} {...props} />;
