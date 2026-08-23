"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiSave, 
  FiCheck, 
  FiArrowUp, 
  FiArrowDown, 
  FiExternalLink, 
  FiStar, 
  FiClock, 
  FiLoader,
  FiX
} from "react-icons/fi";
import { getHistoricMilestones, saveHistoricMilestones } from "./actions";

export default function MilestonesManager({ showToast }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    description: "",
    active: false,
  });

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const data = await getHistoricMilestones();
      setMilestones(data || []);
    } catch (e) {
      console.error("Failed to load milestones:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const handleStartAdd = () => {
    setEditingIndex(null);
    setFormData({
      year: "",
      title: "",
      description: "",
      active: false,
    });
    setIsAddingNew(true);
  };

  const handleStartEdit = (index) => {
    setIsAddingNew(false);
    setEditingIndex(index);
    setFormData({ ...milestones[index] });
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    setFormData({ year: "", title: "", description: "", active: false });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveFormItem = async () => {
    if (!formData.year.trim() || !formData.title.trim()) {
      if (showToast) showToast("Year and Title are required", "error");
      return;
    }

    let updatedList = [...milestones];
    if (isAddingNew) {
      // If marking as active, optionally ensure only one or multiple can be active
      updatedList.push({ ...formData });
    } else if (editingIndex !== null) {
      updatedList[editingIndex] = { ...formData };
    }

    setMilestones(updatedList);
    handleCancelForm();
    await saveList(updatedList);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;
    const updatedList = milestones.filter((_, i) => i !== index);
    setMilestones(updatedList);
    await saveList(updatedList);
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;
    const updatedList = [...milestones];
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;
    setMilestones(updatedList);
    await saveList(updatedList);
  };

  const handleToggleActive = async (index) => {
    const updatedList = milestones.map((item, i) => {
      if (i === index) {
        return { ...item, active: !item.active };
      }
      return item;
    });
    setMilestones(updatedList);
    await saveList(updatedList);
  };

  const saveList = async (listToSave) => {
    setIsSaving(true);
    try {
      const res = await saveHistoricMilestones(listToSave);
      if (res.success) {
        if (showToast) showToast("Milestones updated successfully!");
      } else {
        if (showToast) showToast("Failed to save: " + (res.message || "Unknown error"), "error");
      }
    } catch (e) {
      if (showToast) showToast("Error: " + e.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FiClock size={20} style={{ color: "var(--primary-color, #129a44)" }} />
            <span>Historic Milestones &amp; History Timeline</span>
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-color, #666)", opacity: 0.85 }}>
            Manage the historic moments displayed under the <strong>events#events-milestones</strong> section.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a
            href="/events#events-milestones"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              color: "var(--primary-color, #129a44)",
              textDecoration: "none",
              fontWeight: "600",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              backgroundColor: "rgba(18, 154, 68, 0.08)",
            }}
          >
            <span>View on Site</span>
            <FiExternalLink size={14} />
          </a>

          <button
            type="button"
            className={styles.addBtn}
            onClick={handleStartAdd}
            disabled={isAddingNew || editingIndex !== null}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <FiPlus size={16} />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Inline Form */}
      {(isAddingNew || editingIndex !== null) && (
        <div
          style={{
            backgroundColor: "var(--card-bg, #ffffff)",
            border: "2px solid var(--primary-color, #129a44)",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, fontWeight: "700", color: "var(--primary-color, #129a44)" }}>
              {isAddingNew ? "Add New Historic Milestone" : "Edit Milestone"}
            </h4>
            <button
              type="button"
              onClick={handleCancelForm}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}
            >
              <FiX size={20} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                Year / Date (e.g. 1907, February 22, 2024) *
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleFormChange}
                placeholder="e.g. 1907 or February 22"
                className={styles.input}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                Milestone Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g. First Scout Camp (Brownsea Island)"
                className={styles.input}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
              Description / Historical Significance
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleFormChange}
              placeholder="Brief details about what happened and why it matters to Scouting and SER..."
              className={styles.input}
              rows={3}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <input
              type="checkbox"
              id="milestone-active"
              name="active"
              checked={formData.active || false}
              onChange={handleFormChange}
              style={{ width: "18px", height: "18px", accentColor: "var(--primary-color, #129a44)", cursor: "pointer" }}
            />
            <label htmlFor="milestone-active" style={{ fontSize: "0.9rem", fontWeight: "600", cursor: "pointer" }}>
              🌟 Reveal as Active / Current Milestone (Highlights this milestone on the website timeline)
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={handleCancelForm}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                backgroundColor: "#f3f4f6",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.85rem",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSaveFormItem}
              disabled={isSaving}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <FiSave size={16} />
              <span>{isSaving ? "Saving..." : "Save Milestone"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Milestones List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          <FiLoader className={styles.spinner} size={28} />
          <div style={{ marginTop: "0.5rem" }}>Loading milestones...</div>
        </div>
      ) : milestones.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", border: "2px dashed #e5e7eb", borderRadius: "12px", color: "#666" }}>
          <FiClock size={36} style={{ color: "#9ca3af", marginBottom: "0.5rem" }} />
          <div style={{ fontWeight: "600" }}>No Historic Milestones added yet</div>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Click "Add Milestone" to create the first milestone entry.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {milestones.map((item, index) => {
            const isEditingThis = editingIndex === index;
            if (isEditingThis) return null;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: item.active ? "rgba(18, 154, 68, 0.04)" : "var(--card-bg, #ffffff)",
                  border: item.active
                    ? "2px solid var(--primary-color, #129a44)"
                    : "1px solid var(--border-color, #e5e7eb)",
                  borderRadius: "10px",
                  boxShadow: item.active ? "0 2px 10px rgba(18, 154, 68, 0.12)" : "0 1px 3px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "6px",
                        backgroundColor: item.active ? "var(--primary-color, #129a44)" : "rgba(0,0,0,0.08)",
                        color: item.active ? "#ffffff" : "var(--text-color, #1f2937)",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                      }}
                    >
                      {item.year}
                    </span>

                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "var(--text-color, #111827)" }}>
                      {item.title}
                    </h4>

                    {item.active && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                        }}
                      >
                        <FiStar size={12} fill="#166534" />
                        <span>Active Reveal</span>
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.85rem", color: "var(--text-color, #4b5563)", opacity: 0.9, lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                  {/* Active Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(index)}
                    title={item.active ? "Deactivate active reveal" : "Set as active reveal"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.4rem 0.65rem",
                      borderRadius: "6px",
                      border: item.active ? "1px solid #86efac" : "1px solid #e5e7eb",
                      backgroundColor: item.active ? "#ecfdf5" : "#f9fafb",
                      color: item.active ? "#047857" : "#6b7280",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    <FiStar size={13} fill={item.active ? "#047857" : "none"} />
                    <span>{item.active ? "Active" : "Make Active"}</span>
                  </button>

                  {/* Reorder Up */}
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      color: index === 0 ? "#d1d5db" : "#4b5563",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <FiArrowUp size={14} />
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === milestones.length - 1}
                    title="Move down"
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      color: index === milestones.length - 1 ? "#d1d5db" : "#4b5563",
                      cursor: index === milestones.length - 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <FiArrowDown size={14} />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(index)}
                    title="Edit milestone"
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      color: "#2563eb",
                      cursor: "pointer",
                    }}
                  >
                    <FiEdit size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    title="Delete milestone"
                    style={{
                      padding: "0.4rem",
                      borderRadius: "6px",
                      border: "1px solid #fee2e2",
                      backgroundColor: "#fef2f2",
                      color: "#dc2626",
                      cursor: "pointer",
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
