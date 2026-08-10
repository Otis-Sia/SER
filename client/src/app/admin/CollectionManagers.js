"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { FiRefreshCw, FiEdit, FiTrash2, FiSave, FiX, FiPlus } from "react-icons/fi";
import RichTextEditor from "../../components/RichTextEditor";
import {
  getProjects, addProject, updateProject, deleteProject,
  getEvents, addEvent, updateEvent, deleteEvent,
  getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem,
  getFaqs, addFaq, updateFaq, deleteFaq,
  getProducts, addProduct, updateProduct, deleteProduct,
  getContacts, addContact, updateContact, deleteContact,
  getSocialMedia, addSocialMedia, updateSocialMedia, deleteSocialMedia
} from "./actions";

// Generic Collection Manager Component
function CollectionManager({ 
  title, fetchAction, addAction, updateAction, deleteAction, defaultItem, renderFields 
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
      result = await addAction(editFormData);
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

          {items.map(item => (
            <div key={item.id} className={styles.collectionCard}>
              {editingId === item.id ? (
                <div>
                  {renderFields(editFormData, handleChange)}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className={styles.actionBtn} onClick={() => handleSave(item.id)}><FiSave /> Save</button>
                    <button className={styles.actionBtnCancel} onClick={handleCancel}><FiX /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.collectionCardContent}>
                    {renderFields(item, null, true)}
                  </div>
                  <div className={styles.collectionCardActions}>
                    <button className={styles.actionBtnEdit} onClick={() => handleEdit(item)}><FiEdit /> Edit</button>
                    <button className={styles.actionBtnDelete} onClick={() => handleDelete(item.id)}><FiTrash2 /> Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
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
        {data.eventDate && <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(18,154,68,0.1)', color: 'var(--primary-color)', fontWeight: 600 }}>{data.eventDate}</span>}
        {data.location && <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', fontWeight: 600 }}>{data.location}</span>}
      </p>
      {data.description && <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>{data.description}</p>}
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="title" value={data.title || ''} onChange={onChange} placeholder="Event Title" />
      <input type="date" className={styles.input} name="eventDate" value={data.eventDate || ''} onChange={onChange} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="title" value={data.title || ''} onChange={onChange} placeholder="Title" />
      <input className={styles.input} name="imageUrl" value={data.imageUrl || ''} onChange={onChange} placeholder="Image URL" />
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
        <p style={{ margin: 0 }}><span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: data.featured ? 'rgba(18,154,68,0.1)' : 'rgba(0,0,0,0.06)', color: data.featured ? 'var(--primary-color)' : 'inherit', fontWeight: 600 }}>{data.featured ? '★ Featured' : 'Regular'}</span></p>
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="name" value={data.name || ''} onChange={onChange} placeholder="Product Name" />
      <input type="number" className={styles.input} name="priceKes" value={data.priceKes || 0} onChange={onChange} placeholder="Price (KES)" />
      <input className={styles.input} name="imageUrl" value={data.imageUrl || ''} onChange={onChange} placeholder="Image URL" />
      <RichTextEditor name="description" value={data.description || ''} onChange={(val) => onChange({ target: { name: 'description', value: val } })} placeholder="Description" />
      <label>
        <input type="checkbox" name="featured" checked={data.featured || false} onChange={onChange} />
        Featured Product
      </label>
    </div>
  );
};

// Export individual managers
export const ProjectsManager = () => <CollectionManager title="Projects" fetchAction={getProjects} addAction={addProject} updateAction={updateProject} deleteAction={deleteProject} defaultItem={{ title: '', focus: '', description: '', link: '', linkText: '' }} renderFields={renderProjectFields} />;
export const EventsManager = () => <CollectionManager title="Events" fetchAction={getEvents} addAction={addEvent} updateAction={updateEvent} deleteAction={deleteEvent} defaultItem={{ title: '', eventDate: '', location: '', description: '' }} renderFields={renderEventFields} />;
export const GalleryManager = () => <CollectionManager title="Gallery Items" fetchAction={getGalleryItems} addAction={addGalleryItem} updateAction={updateGalleryItem} deleteAction={deleteGalleryItem} defaultItem={{ title: '', imageUrl: '', alt: '', description: '' }} renderFields={renderGalleryFields} />;
export const FaqsManager = () => <CollectionManager title="FAQs" fetchAction={getFaqs} addAction={addFaq} updateAction={updateFaq} deleteAction={deleteFaq} defaultItem={{ question: '', answer: '', order: 0 }} renderFields={renderFaqFields} />;
export const ProductsManager = () => <CollectionManager title="Products" fetchAction={getProducts} addAction={addProduct} updateAction={updateProduct} deleteAction={deleteProduct} defaultItem={{ name: '', priceKes: 0, imageUrl: '', description: '', featured: false }} renderFields={renderProductFields} />;

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

export const ContactsManager = () => <CollectionManager title="Contact Info" fetchAction={getContacts} addAction={addContact} updateAction={updateContact} deleteAction={deleteContact} defaultItem={{ type: '', value: '', order: 0 }} renderFields={renderContactFields} />;
export const SocialsManager = () => <CollectionManager title="Social Media" fetchAction={getSocialMedia} addAction={addSocialMedia} updateAction={updateSocialMedia} deleteAction={deleteSocialMedia} defaultItem={{ platform: '', type: '', url: '' }} renderFields={renderSocialFields} />;
