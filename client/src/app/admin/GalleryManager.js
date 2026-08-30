"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./admin.module.css";
import {
  FiPlus,
  FiUploadCloud,
  FiTrash2,
  FiEdit,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiFlag,
  FiRefreshCw,
  FiCheck,
  FiLoader,
  FiImage,
  FiLayers,
  FiFilter,
  FiSearch,
  FiAlertCircle,
  FiMaximize2
} from "react-icons/fi";
import MobileImageUploader from "../../components/MobileImageUploader";
import {
  getGalleryItems,
  addGalleryItem,
  addBatchGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
  flagCmsDocument,
  hideCmsDocument
} from "./actions";

// Fast client-side image compression for batch uploading
async function compressImageForBatch(file, maxDimension = 1600, quality = 0.85) {
  if (!file || !file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = (file.name || "photo").replace(/\.[^.]+$/, "") + ".webp";
            const compressedFile = new File([blob], cleanName, { type: "image/webp" });
            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function GalleryManager({ currentUserEmail, currentUserRole, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", imageUrl: "", alt: "", description: "" });
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  // Batch upload state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchQueue, setBatchQueue] = useState([]);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchError, setBatchError] = useState("");
  const [isDraggingBatch, setIsDraggingBatch] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'untitled' | 'hidden' | 'flagged'

  const batchFileInputRef = useRef(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getGalleryItems(false);
      setItems(data || []);
    } catch (e) {
      console.error("Error loading gallery:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditFormData({
      title: item.title || "",
      imageUrl: item.imageUrl || item.image_url || "",
      alt: item.alt || "",
      description: item.description || ""
    });
    setIsBatchMode(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({ title: "", imageUrl: "", alt: "", description: "" });
  };

  const handleAddNewSingle = () => {
    setEditingId("new");
    setEditFormData({ title: "", imageUrl: "", alt: "", description: "" });
    setIsBatchMode(false);
  };

  const handleSaveSingle = async () => {
    if (!editFormData.imageUrl || !editFormData.imageUrl.trim()) {
      if (showToast) showToast("Please upload an image first", "error");
      else alert("Please upload an image first");
      return;
    }

    let result;
    if (editingId === "new") {
      result = await addGalleryItem({
        ...editFormData,
        created_by_email: currentUserEmail || ""
      });
    } else {
      result = await updateGalleryItem(editingId, editFormData);
    }

    if (result.success) {
      if (showToast) showToast(editingId === "new" ? "Gallery item added!" : "Gallery item updated!");
      handleCancelEdit();
      loadItems();
    } else {
      if (showToast) showToast(`Error saving: ${result.message}`, "error");
      else alert("Error saving: " + result.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    const result = await deleteGalleryItem(id);
    if (result.success) {
      if (showToast) showToast("Image deleted from gallery");
      loadItems();
    } else {
      if (showToast) showToast(`Error deleting: ${result.message}`, "error");
      else alert("Error deleting: " + result.message);
    }
  };

  const handleFlag = async (item) => {
    const nextFlagged = !item.flagged;
    const label = item.title || "this image";
    if (!confirm(`Are you sure you want to ${nextFlagged ? "flag" : "unflag"} "${label}"?`)) return;
    const result = await flagCmsDocument("gallery", item.id, nextFlagged, currentUserEmail);
    if (result.success) {
      loadItems();
    } else {
      alert("Error updating flag: " + result.message);
    }
  };

  const handleHide = async (id, currentHidden) => {
    const nextHidden = !currentHidden;
    if (!confirm(`Are you sure you want to ${nextHidden ? "hide" : "unhide"} this gallery item?`)) return;
    const result = await hideCmsDocument("gallery", id, nextHidden, currentUserEmail);
    if (result.success) {
      loadItems();
    } else {
      alert("Error updating visibility: " + result.message);
    }
  };

  // --- Batch Upload Handlers ---
  const handleBatchFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addFilesToBatchQueue(files);
  };

  const addFilesToBatchQueue = (files) => {
    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length === 0) return;

    const newItems = validImageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      status: "queued", // 'queued' | 'uploading' | 'done' | 'error'
      error: ""
    }));

    setBatchQueue((prev) => [...prev, ...newItems]);
    setBatchError("");
  };

  const handleRemoveFromQueue = (index) => {
    setBatchQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearBatchQueue = () => {
    setBatchQueue([]);
    setBatchError("");
    if (batchFileInputRef.current) batchFileInputRef.current.value = "";
  };

  const handleStartBatchUpload = async () => {
    if (batchQueue.length === 0) return;

    setIsBatchUploading(true);
    setBatchError("");
    setBatchProgress({ current: 0, total: batchQueue.length });

    const uploadedRecords = [];

    for (let i = 0; i < batchQueue.length; i++) {
      const item = batchQueue[i];
      setBatchProgress({ current: i + 1, total: batchQueue.length });

      // Update queue item status
      setBatchQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: "uploading" } : q))
      );

      try {
        // 1. Client-side compress
        const compressedFile = await compressImageForBatch(item.file);

        // 2. Upload to S3 via API Route
        const formData = new FormData();
        formData.append("file", compressedFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (response.ok && result.success && result.url) {
          uploadedRecords.push({
            imageUrl: result.url,
            title: "",
            alt: "",
            description: "",
            created_by_email: currentUserEmail || ""
          });

          setBatchQueue((prev) =>
            prev.map((q, idx) => (idx === i ? { ...q, status: "done" } : q))
          );
        } else {
          setBatchQueue((prev) =>
            prev.map((q, idx) =>
              idx === i ? { ...q, status: "error", error: result.message || "Failed" } : q
            )
          );
        }
      } catch (err) {
        setBatchQueue((prev) =>
          prev.map((q, idx) =>
            idx === i ? { ...q, status: "error", error: err.message } : q
          )
        );
      }
    }

    // 3. Batch insert records into Supabase
    if (uploadedRecords.length > 0) {
      try {
        const dbResult = await addBatchGalleryItems(uploadedRecords, currentUserEmail || "");
        if (dbResult.success) {
          if (showToast) {
            showToast(`Batch upload complete! ${uploadedRecords.length} images added to gallery.`);
          }
          await loadItems();
          setTimeout(() => {
            handleClearBatchQueue();
            setIsBatchMode(false);
          }, 1200);
        } else {
          setBatchError(`Images uploaded to S3 but failed to save in database: ${dbResult.message}`);
        }
      } catch (dbErr) {
        setBatchError(`Database insert error: ${dbErr.message}`);
      }
    } else {
      setBatchError("None of the images could be uploaded. Please check your credentials.");
    }

    setIsBatchUploading(false);
  };

  // Drag and drop for batch dropzone
  const handleBatchDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingBatch) setIsDraggingBatch(true);
  };

  const handleBatchDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDraggingBatch(false);
  };

  const handleBatchDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBatch(false);
    const files = Array.from(e.dataTransfer?.files || []);
    addFilesToBatchQueue(files);
  };

  // Filtered gallery items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === "untitled") {
      return !item.title || item.title.trim() === "";
    }
    if (filterType === "hidden") {
      return !!item.hidden;
    }
    if (filterType === "flagged") {
      return !!item.flagged;
    }
    return true;
  });

  const untitledCount = items.filter((item) => !item.title || item.title.trim() === "").length;

  return (
    <div className={styles.section}>
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}
      >
        <div>
          <h3 className={styles.sectionTitle} style={{ marginBottom: "0.25rem" }}>
            Gallery Items ({items.length})
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-color, #666)", opacity: 0.85 }}>
            Upload single or batch images. Batch images are saved without title or description and can be edited later.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <button className={styles.refreshBtn} onClick={loadItems}>
            <FiRefreshCw /> Refresh
          </button>

          {/* Batch Upload Button */}
          <button
            type="button"
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              setEditingId(null);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.65rem 1.15rem",
              borderRadius: "8px",
              backgroundColor: isBatchMode ? "var(--text-color, #374151)" : "var(--primary-color, #129a44)",
              color: "#ffffff",
              fontWeight: "600",
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <FiLayers size={16} />
            <span>{isBatchMode ? "Close Batch Mode" : "⚡ Batch Upload Images"}</span>
          </button>

          {/* Add Single Item Button */}
          <button
            className={styles.addButton}
            style={{ width: "auto", marginTop: 0, padding: "0.65rem 1.15rem" }}
            onClick={handleAddNewSingle}
          >
            <FiPlus /> Add Single Item
          </button>
        </div>
      </div>

      {/* Batch Upload Section */}
      {isBatchMode && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.5rem",
            backgroundColor: "var(--card-bg, #ffffff)",
            border: "2px solid var(--primary-color, #129a44)",
            borderRadius: "14px",
            boxShadow: "0 6px 20px rgba(18, 154, 68, 0.12)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "var(--primary-color, #129a44)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiLayers size={20} />
                <span>Batch Image Uploader</span>
              </h4>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-color, #666)" }}>
                Select multiple photos at once. They will be uploaded and added to the gallery without titles so you can quickly fill them in later.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBatchMode(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
            >
              <FiX size={22} />
            </button>
          </div>

          {/* Hidden multi-file input */}
          <input
            ref={batchFileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleBatchFileSelect}
            style={{ display: "none" }}
            disabled={isBatchUploading}
          />

          {/* Batch Dropzone */}
          <div
            onDragOver={handleBatchDragOver}
            onDragLeave={handleBatchDragLeave}
            onDrop={handleBatchDrop}
            onClick={() => !isBatchUploading && batchFileInputRef.current?.click()}
            style={{
              border: isDraggingBatch
                ? "2px dashed var(--primary-color, #129a44)"
                : "2px dashed #d1d5db",
              borderRadius: "12px",
              padding: "2rem 1.5rem",
              textAlign: "center",
              backgroundColor: isDraggingBatch ? "rgba(18, 154, 68, 0.08)" : "#f9fafb",
              cursor: isBatchUploading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <FiUploadCloud size={42} style={{ color: "var(--primary-color, #129a44)" }} />
            <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-color, #111827)" }}>
              Drag &amp; drop multiple images here, or tap to choose files
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
              Select as many images as you like (JPG, PNG, WebP). Automatic client-side compression applied.
            </p>
          </div>

          {/* Error display */}
          {batchError && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FiAlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{batchError}</span>
            </div>
          )}

          {/* Selected Queue */}
          {batchQueue.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                  Selected Files ({batchQueue.length})
                </span>
                {!isBatchUploading && (
                  <button
                    type="button"
                    onClick={handleClearBatchQueue}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Progress Bar during upload */}
              {isBatchUploading && (
                <div style={{ backgroundColor: "#e5e7eb", borderRadius: "999px", height: "10px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      backgroundColor: "var(--primary-color, #129a44)",
                      width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                      transition: "width 0.2s ease"
                    }}
                  />
                </div>
              )}

              {/* Thumbnail List */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "0.75rem",
                  maxHeight: "320px",
                  overflowY: "auto",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff"
                }}
              >
                {batchQueue.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <div style={{ width: "100%", height: "90px", position: "relative" }}>
                      <img
                        src={item.preview}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {item.status === "done" && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(22, 163, 74, 0.75)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff"
                          }}
                        >
                          <FiCheck size={24} />
                        </div>
                      )}
                      {item.status === "uploading" && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff"
                          }}
                        >
                          <FiLoader className={styles.spinner} size={22} />
                        </div>
                      )}
                      {item.status === "error" && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(220, 38, 38, 0.75)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff"
                          }}
                        >
                          <FiAlertCircle size={22} />
                        </div>
                      )}
                      {!isBatchUploading && item.status === "queued" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromQueue(idx)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                          }}
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                    <div style={{ padding: "0.35rem 0.5rem", fontSize: "0.72rem", color: "#4b5563", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleClearBatchQueue}
                  disabled={isBatchUploading}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#f3f4f6",
                    cursor: isBatchUploading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartBatchUpload}
                  disabled={isBatchUploading || batchQueue.length === 0}
                  className={styles.saveBtn}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 1.25rem",
                    fontSize: "0.95rem"
                  }}
                >
                  {isBatchUploading ? (
                    <>
                      <FiLoader className={styles.spinner} size={16} />
                      <span>Uploading ({batchProgress.current}/{batchProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud size={18} />
                      <span>Upload All {batchQueue.length} Images</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single Add / Edit Form */}
      {editingId !== null && (
        <div
          className={styles.collectionCard}
          style={{
            border: "2px solid var(--primary-color, #129a44)",
            marginBottom: "1.5rem",
            padding: "1.25rem"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h4 style={{ margin: 0, fontWeight: "700", color: "var(--primary-color, #129a44)" }}>
              {editingId === "new" ? "Add Single Gallery Item" : "Edit Gallery Item Details"}
            </h4>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
            >
              <FiX size={20} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                Title (Optional — will be displayed on hover &amp; lightbox)
              </label>
              <input
                className={styles.input}
                name="title"
                value={editFormData.title || ""}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Fire Safety Drill at Nairobi Camp"
                style={{ width: "100%" }}
              />
            </div>

            <MobileImageUploader
              label="Gallery Image *"
              value={editFormData.imageUrl || ""}
              onChange={(url) => setEditFormData((prev) => ({ ...prev, imageUrl: url }))}
              placeholder="Image URL or choose file from device..."
            />

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                Alt Text (For accessibility &amp; SEO)
              </label>
              <input
                className={styles.input}
                name="alt"
                value={editFormData.alt || ""}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, alt: e.target.value }))}
                placeholder="Brief description of the image content"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                Description (Optional story / caption)
              </label>
              <textarea
                className={styles.textarea}
                name="description"
                value={editFormData.description || ""}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Details about what happened in this photo..."
                rows={3}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button className={styles.actionBtnCancel} onClick={handleCancelEdit}>
                <FiX /> Cancel
              </button>
              <button className={styles.actionBtn} onClick={handleSaveSingle}>
                <FiSave /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "10px",
          border: "1px solid #e5e7eb"
        }}
      >
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: "200px" }}>
          <FiSearch size={16} style={{ color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search gallery by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.35rem 0.5rem",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem"
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterType("all")}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: filterType === "all" ? "var(--primary-color, #129a44)" : "#e5e7eb",
              color: filterType === "all" ? "#ffffff" : "#374151",
              fontSize: "0.78rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("untitled")}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: filterType === "untitled" ? "#f59e0b" : "#e5e7eb",
              color: filterType === "untitled" ? "#ffffff" : "#374151",
              fontSize: "0.78rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Needs Details ({untitledCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("hidden")}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: filterType === "hidden" ? "#6b7280" : "#e5e7eb",
              color: filterType === "hidden" ? "#ffffff" : "#374151",
              fontSize: "0.78rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Hidden
          </button>
        </div>
      </div>

      {/* Gallery Items Grid / List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <FiLoader className={styles.spinner} size={28} />
          <div style={{ marginTop: "0.5rem" }}>Loading gallery items...</div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            border: "2px dashed #e5e7eb",
            borderRadius: "12px",
            color: "#6b7280"
          }}
        >
          <FiImage size={38} style={{ color: "#9ca3af", marginBottom: "0.5rem" }} />
          <div style={{ fontWeight: "600", fontSize: "1rem" }}>No gallery images found</div>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: "0.25rem 0 1rem 0" }}>
            {searchQuery || filterType !== "all"
              ? "Try adjusting your search or filters."
              : "Upload images individually or use '⚡ Batch Upload Images' to add multiple photos at once."}
          </p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setIsBatchMode(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <FiLayers size={16} />
            <span>Start Batch Upload</span>
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {filteredItems.map((item) => {
            const isOwner = Boolean(
              item.created_by_email &&
                currentUserEmail &&
                item.created_by_email.toLowerCase() === currentUserEmail.toLowerCase()
            );
            const isGrandpa = currentUserEmail?.toLowerCase() === "grandpa@seresponse.org";
            const canDelete = isOwner || ["Super Admin", "Project Lead"].includes(currentUserRole);
            const canFlag = !isOwner || ["Super Admin", "Admin", "Project Lead"].includes(currentUserRole);
            const canHide = ["Super Admin", "Admin", "Project Lead"].includes(currentUserRole);
            const canEdit = isOwner || ["Super Admin", "Project Lead"].includes(currentUserRole) || isGrandpa;

            const isUntitled = !item.title || item.title.trim() === "";

            return (
              <div
                key={item.id}
                className={styles.collectionCard}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: item.hidden ? "#fef3c7" : "var(--card-bg, #ffffff)",
                  border: item.hidden ? "1.5px dashed #f59e0b" : "1px solid var(--border-color, #e5e7eb)",
                  borderRadius: "10px"
                }}
              >
                {/* Left: Thumbnail & Details */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: 0 }}>
                  {item.imageUrl ? (
                    <div
                      onClick={() => setPreviewModalUrl(item.imageUrl)}
                      style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      title="Click to preview"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.alt || item.title || "Gallery thumbnail"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "8px",
                        backgroundColor: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        flexShrink: 0
                      }}
                    >
                      <FiImage size={24} />
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.25rem", alignItems: "center" }}>
                      {isUntitled ? (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                            fontWeight: 700,
                            border: "1px solid #fde68a"
                          }}
                        >
                          Untitled (Needs Details)
                        </span>
                      ) : null}

                      {item.flagged && (
                        <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", background: "#fee2e2", color: "#ef4444", fontWeight: 600 }}>
                          Flagged
                        </span>
                      )}

                      {item.hidden && (
                        <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", background: "#fff3e0", color: "#e65100", fontWeight: 600 }}>
                          Hidden from site
                        </span>
                      )}

                      {item.created_by_email && ["Super Admin", "Project Lead"].includes(currentUserRole) && (
                        <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                          by {item.created_by_email}
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: isUntitled ? "#6b7280" : "var(--text-color, #111827)" }}>
                      {item.title || "Untitled Image"}
                    </h4>

                    {item.description ? (
                      <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.82rem", color: "var(--text-color, #6b7280)", opacity: 0.9, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {item.description}
                      </p>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
                        No description added yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center", flexShrink: 0 }}>
                  {canHide && (
                    <button
                      type="button"
                      className={styles.actionBtnHide}
                      onClick={() => handleHide(item.id, item.hidden)}
                      title={item.hidden ? "Unhide" : "Hide"}
                    >
                      {item.hidden ? <FiEye /> : <FiEyeOff />}
                      <span>{item.hidden ? "Unhide" : "Hide"}</span>
                    </button>
                  )}

                  {canFlag && (
                    <button
                      type="button"
                      className={styles.actionBtnFlag}
                      onClick={() => handleFlag(item)}
                      title={item.flagged ? "Unflag" : "Flag"}
                    >
                      <FiFlag />
                      <span>{item.flagged ? "Unflag" : "Flag"}</span>
                    </button>
                  )}

                  {canEdit && (
                    <button
                      type="button"
                      className={styles.actionBtnEdit}
                      onClick={() => handleEdit(item)}
                      title="Edit title &amp; description"
                    >
                      <FiEdit />
                      <span>Edit Details</span>
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      className={styles.actionBtnDelete}
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarged Image Preview Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer"
              }}
            >
              <FiX />
            </button>
            <img
              src={previewModalUrl}
              alt="Enlarged gallery preview"
              style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
