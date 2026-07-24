"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { FiRefreshCw, FiEdit, FiTrash2, FiSave, FiX, FiPlus } from "react-icons/fi";
import {
  getProjects, addProject, updateProject, deleteProject,
  getEvents, addEvent, updateEvent, deleteEvent,
  getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem,
  getFaqs, addFaq, updateFaq, deleteFaq,
  getProducts, addProduct, updateProduct, deleteProduct
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <div>
          <button className={styles.refreshBtn} onClick={loadItems} style={{ marginRight: '10px' }}>
            <FiRefreshCw /> Refresh
          </button>
          <button className={styles.addButton} onClick={handleAddNew}>
            <FiPlus /> Add New
          </button>
        </div>
      </div>
      
      {loading ? (
        <p>Loading {title}...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {editingId === 'new' && (
            <div className={styles.card} style={{ border: '2px solid var(--primary-color)' }}>
              <h4>Add New {title}</h4>
              {renderFields(editFormData, handleChange)}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button className={styles.btn} onClick={() => handleSave('new')}><FiSave /> Save</button>
                <button className={styles.btn} style={{ background: '#ccc', color: '#333' }} onClick={handleCancel}><FiX /> Cancel</button>
              </div>
            </div>
          )}

          {items.map(item => (
            <div key={item.id} className={styles.card}>
              {editingId === item.id ? (
                <div>
                  {renderFields(editFormData, handleChange)}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.btn} onClick={() => handleSave(item.id)}><FiSave /> Save</button>
                    <button className={styles.btn} style={{ background: '#ccc', color: '#333' }} onClick={handleCancel}><FiX /> Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    {renderFields(item, null, true)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <button className={styles.btn} onClick={() => handleEdit(item)} style={{ background: '#4CAF50' }}><FiEdit /> Edit</button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(item.id)} style={{ position: 'static' }}><FiTrash2 /> Delete</button>
                  </div>
                </div>
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
      <h4>{data.title}</h4>
      <p><strong>Focus:</strong> {data.focus}</p>
      <p>{data.description}</p>
      {data.link && <p><strong>Link:</strong> <a href={data.link} target="_blank" rel="noreferrer">{data.linkText || 'Link'}</a></p>}
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="title" value={data.title || ''} onChange={onChange} placeholder="Title" />
      <input className={styles.input} name="focus" value={data.focus || ''} onChange={onChange} placeholder="Focus" />
      <textarea className={styles.textarea} name="description" value={data.description || ''} onChange={onChange} placeholder="Description" />
      <input className={styles.input} name="link" value={data.link || ''} onChange={onChange} placeholder="Link URL" />
      <input className={styles.input} name="linkText" value={data.linkText || ''} onChange={onChange} placeholder="Link Text" />
    </div>
  );
};

const renderEventFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <>
      <h4>{data.title}</h4>
      <p><strong>Date:</strong> {data.eventDate}</p>
      <p><strong>Location:</strong> {data.location}</p>
      <p>{data.description}</p>
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="title" value={data.title || ''} onChange={onChange} placeholder="Event Title" />
      <input type="date" className={styles.input} name="eventDate" value={data.eventDate || ''} onChange={onChange} />
      <input className={styles.input} name="location" value={data.location || ''} onChange={onChange} placeholder="Location" />
      <textarea className={styles.textarea} name="description" value={data.description || ''} onChange={onChange} placeholder="Description" />
    </div>
  );
};

const renderGalleryFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {data.imageUrl && <img src={data.imageUrl} alt={data.alt} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
      <div>
        <h4>{data.title}</h4>
        <p>{data.description}</p>
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
      <h4>Q: {data.question}</h4>
      <p><strong>A:</strong> {data.answer}</p>
      <p><small>Order: {data.order}</small></p>
    </>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="question" value={data.question || ''} onChange={onChange} placeholder="Question" />
      <textarea className={styles.textarea} name="answer" value={data.answer || ''} onChange={onChange} placeholder="Answer" />
      <input type="number" className={styles.input} name="order" value={data.order || 0} onChange={onChange} placeholder="Sort Order" />
    </div>
  );
};

const renderProductFields = (data, onChange, readOnly = false) => {
  if (readOnly) return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {data.imageUrl && <img src={data.imageUrl} alt={data.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
      <div>
        <h4>{data.name}</h4>
        <p><strong>Price:</strong> KES {data.priceKes}</p>
        <p>{data.description}</p>
        <p><small>{data.featured ? 'Featured' : 'Regular'}</small></p>
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input className={styles.input} name="name" value={data.name || ''} onChange={onChange} placeholder="Product Name" />
      <input type="number" className={styles.input} name="priceKes" value={data.priceKes || 0} onChange={onChange} placeholder="Price (KES)" />
      <input className={styles.input} name="imageUrl" value={data.imageUrl || ''} onChange={onChange} placeholder="Image URL" />
      <textarea className={styles.textarea} name="description" value={data.description || ''} onChange={onChange} placeholder="Description" />
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
