'use client';

import React, { useState, useRef } from 'react';
import { FiCamera, FiUploadCloud, FiTrash2, FiMaximize2, FiX, FiLink, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { uploadImage } from '@/app/admin/actions';

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
  const [imgLoadError, setImgLoadError] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setImgLoadError(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadImage(formData);
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setUploadError(result.message || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
      // Reset input value so the same file can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setImgLoadError(false);
    setUploadError('');
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

      {/* Main Upload Card */}
      <div
        style={{
          border: '1.5px solid var(--border-color, #e5e7eb)',
          borderRadius: '12px',
          padding: compact ? '0.75rem' : '1rem',
          backgroundColor: 'var(--card-bg, #ffffff)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          position: 'relative',
        }}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
          id={`mobile-uploader-${label.replace(/\s+/g, '-').toLowerCase()}`}
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
                    onClick={() => fileInputRef.current?.click()}
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
                        <FiCamera size={13} />
                        <span>Replace</span>
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
          </div>
        ) : (
          /* State 2: No image uploaded yet */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
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
                  <FiCamera size={18} />
                  <span>Choose Image / Take Photo</span>
                </>
              )}
            </button>

            <div
              style={{
                textAlign: 'center',
                fontSize: '0.78rem',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <FiUploadCloud size={14} />
              <span>Supports JPG, PNG, WebP, GIF from mobile gallery or camera</span>
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
