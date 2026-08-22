'use client';

import React, { useState, useRef } from 'react';
import { 
  FiCamera, 
  FiFolder, 
  FiUploadCloud, 
  FiTrash2, 
  FiMaximize2, 
  FiX, 
  FiLink, 
  FiLoader, 
  FiAlertCircle, 
  FiUpload,
  FiDownload
} from 'react-icons/fi';

// In-browser mobile optimization: Resizes high-res phone pictures and converts to modern WebP
async function compressImageForMobile(file, maxDimension = 1600, quality = 0.85) {
  if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanName, { type: 'image/webp' });
            resolve(compressedFile);
          },
          'image/webp',
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

export default function MobileImageUploader({
  value = '',
  onChange,
  label = 'Image',
  placeholder = 'Image URL or upload file...',
  compact = false,
  helperText = '',
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processAndUploadFile = async (rawFile) => {
    if (!rawFile) return;

    if (!rawFile.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, GIF).');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setImgLoadError(false);

    try {
      // Step 1: Optimize and compress client-side
      const optimizedFile = await compressImageForMobile(rawFile);

      // Step 2: Upload via API Route
      const formData = new FormData();
      formData.append('file', optimizedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.url) {
        onChange(result.url);
      } else {
        setUploadError(result.message || 'Failed to upload image. Please check your credentials.');
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const rawFile = e.target.files?.[0];
    if (rawFile) processAndUploadFile(rawFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setImgLoadError(false);
    setUploadError('');
  };

  const openCamera = () => {
    setIsSourceModalOpen(false);
    cameraInputRef.current?.click();
  };

  const openFilePicker = () => {
    setIsSourceModalOpen(false);
    fileInputRef.current?.click();
  };

  const hasImage = typeof value === 'string' && value.trim().length > 0;

  return (
    <div style={{ width: '100%', marginBottom: compact ? '0.75rem' : '1.25rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-color, #1f2937)',
            marginBottom: '0.4rem',
          }}
        >
          {label}
        </label>
      )}

      {/* Main Upload Card & Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging
            ? '2px dashed var(--primary-color, #129a44)'
            : '1.5px solid var(--border-color, #e5e7eb)',
          borderRadius: '12px',
          padding: compact ? '0.75rem' : '1rem',
          backgroundColor: isDragging
            ? 'rgba(18, 154, 68, 0.06)'
            : 'var(--card-bg, #ffffff)',
          boxShadow: isDragging
            ? '0 0 0 4px rgba(18, 154, 68, 0.15)'
            : '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
      >
        {/* Active Drag Overlay */}
        {isDragging && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderRadius: '11px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: 'var(--primary-color, #129a44)',
              pointerEvents: 'none',
            }}
          >
            <FiDownload size={32} style={{ animation: 'bounce 1s infinite' }} />
            <div style={{ fontWeight: '700', fontSize: '1rem' }}>Drop image here to upload</div>
          </div>
        )}

        {/* Hidden File Inputs: Camera & File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />

        {/* State 1: An image exists */}
        {hasImage ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Image Preview Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'rgba(0,0,0,0.02)',
                border: '1px solid var(--border-color, #f3f4f6)',
                borderRadius: '8px',
                padding: '0.5rem',
                overflow: 'hidden',
              }}
            >
              {/* Thumbnail */}
              <div
                onClick={() => !imgLoadError && setIsModalOpen(true)}
                style={{
                  position: 'relative',
                  width: compact ? '56px' : '72px',
                  height: compact ? '56px' : '72px',
                  minWidth: compact ? '56px' : '72px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  cursor: imgLoadError ? 'default' : 'pointer',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Tap to expand preview"
              >
                {imgLoadError ? (
                  <div style={{ textAlign: 'center', color: '#ef4444', padding: '2px' }}>
                    <FiAlertCircle size={20} />
                  </div>
                ) : (
                  <>
                    <img
                      src={value}
                      alt="Preview"
                      onError={() => setImgLoadError(true)}
                      onLoad={() => setImgLoadError(false)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <FiMaximize2 size={16} />
                    </div>
                  </>
                )}
              </div>

              {/* Image Info & Actions */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-color, #4b5563)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    marginBottom: '0.4rem',
                    fontWeight: '500',
                  }}
                  title={value}
                >
                  {value.startsWith('http') ? value.split('/').pop().split('?')[0] : value}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsSourceModalOpen(true)}
                    disabled={isUploading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      borderRadius: '6px',
                      backgroundColor: 'var(--primary-color, #129a44)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      opacity: isUploading ? 0.7 : 1,
                      minHeight: '36px',
                    }}
                  >
                    {isUploading ? (
                      <>
                        <FiLoader className="spin" size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FiUpload size={13} />
                        <span>Upload / Replace</span>
                      </>
                    )}
                  </button>

                  {!imgLoadError && (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: '500',
                        borderRadius: '6px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        cursor: 'pointer',
                        minHeight: '36px',
                      }}
                    >
                      <FiMaximize2 size={13} />
                      <span>View</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      fontWeight: '500',
                      borderRadius: '6px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      cursor: 'pointer',
                      minHeight: '36px',
                    }}
                  >
                    <FiTrash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drop hint under image */}
            <div
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <FiDownload size={12} />
              <span>You can also drag &amp; drop a new image here to replace</span>
            </div>
          </div>
        ) : (
          /* State 2: No image uploaded yet */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsSourceModalOpen(true)}
              disabled={isUploading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.25rem',
                minHeight: '48px',
                borderRadius: '8px',
                backgroundColor: isUploading ? '#f3f4f6' : 'var(--primary-color, #129a44)',
                color: isUploading ? '#6b7280' : '#ffffff',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: 'none',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                boxShadow: isUploading ? 'none' : '0 2px 4px rgba(18, 154, 68, 0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              {isUploading ? (
                <>
                  <FiLoader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Uploading image to S3...</span>
                </>
              ) : (
                <>
                  <FiUpload size={18} />
                  <span>Upload Image</span>
                </>
              )}
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#6b7280',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiUploadCloud size={15} style={{ color: 'var(--primary-color, #129a44)' }} />
                <span><strong>Drag &amp; drop an image</strong> here, or tap <strong>Upload</strong></span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Supports JPG, PNG, WebP, GIF (Auto-optimized)</span>
            </div>
          </div>
        )}

        {/* Upload Error Alert */}
        {uploadError && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Collapsible Manual URL input toggle */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #e5e7eb' }}>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.2rem 0',
              color: 'var(--primary-color, #129a44)',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <FiLink size={13} />
            <span>{showUrlInput ? 'Hide manual URL input' : 'Paste or edit direct image URL'}</span>
          </button>

          {showUrlInput && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setImgLoadError(false);
                  onChange(e.target.value);
                }}
                placeholder={placeholder}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'var(--background-color, #fff)',
                  color: 'var(--text-color, #000)',
                }}
              />
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {helperText && (
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
          {helperText}
        </p>
      )}

      {/* Image Source Selection Modal (Take Photo vs Device Files) */}
      {isSourceModalOpen && (
        <div
          onClick={() => setIsSourceModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              margin: '0 auto',
              marginBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-color, #111827)' }}>
                Upload Image
              </h3>
              <button
                type="button"
                onClick={() => setIsSourceModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiX size={22} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              Choose how you would like to upload your picture:
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
              {/* Option 1: Take Photo */}
              <button
                type="button"
                onClick={openCamera}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-color, #129a44)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(18, 154, 68, 0.25)',
                  textAlign: 'left',
                  transition: 'transform 0.1s ease',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiCamera size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: '700' }}>Take a Photo</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: '400' }}>Use your device camera directly</div>
                </div>
              </button>

              {/* Option 2: Choose from Device Files */}
              <button
                type="button"
                onClick={openFilePicker}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--background-color, #f9fafb)',
                  color: 'var(--text-color, #111827)',
                  border: '1.5px solid #d1d5db',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#e5e7eb',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#374151',
                  }}
                >
                  <FiFolder size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: '700' }}>Upload Device Files</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '400' }}>Select from gallery or file manager</div>
                </div>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setIsSourceModalOpen(false)}
              style={{
                marginTop: '0.25rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lightbox / Full-Screen Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <FiX size={20} />
            </button>
            <img
              src={value}
              alt="Full Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            />
            <div
              style={{
                marginTop: '1rem',
                color: '#ffffff',
                fontSize: '0.85rem',
                textAlign: 'center',
                wordBreak: 'break-all',
                maxWidth: '600px',
              }}
            >
              {value}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
