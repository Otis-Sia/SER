"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import { updateSiteContent } from "./actions";

export default function AdminDashboard({ initialData }) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState(Object.keys(initialData)[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
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
      const newData = { ...prev };
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
      const newData = { ...prev };
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
      const newData = { ...prev };
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
      const isLongText = value.length > 50 || key.toLowerCase().includes("description") || key.toLowerCase().includes("story") || key.toLowerCase().includes("mission");
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
          {value.map((item, index) => (
            <div className={styles.nestedGroup} key={index}>
              <button 
                className={styles.deleteButton}
                onClick={() => handleArrayDelete(path, index)}
              >
                Delete
              </button>
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
          ))}
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

  const tabs = Object.keys(initialData);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.navButton} ${activeTab === tab ? styles.active : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
          </h1>
          <button 
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className={styles.formContainer}>
          {renderField(activeTab, data[activeTab], [activeTab])}
        </div>
      </div>

      <div className={`${styles.toast} ${toast.show ? styles.show : ""} ${toast.type === "error" ? styles.error : ""}`}>
        {toast.message}
      </div>
    </div>
  );
}
