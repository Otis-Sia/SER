"use client";
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  { 
    ssr: false, 
    loading: () => <div style={{ minHeight: '150px', border: '1px solid #ccc', borderRadius: '4px', padding: '10px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Editor...</div> 
  }
);

const RichTextEditor = ({ value, onChange, placeholder = "Enter text here...", className, style }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ]
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  return (
    <div className={`rich-text-wrapper ${className || ''}`} style={{ ...style, position: 'relative' }}>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .rich-text-wrapper .ql-container {
          min-height: 150px;
          font-family: inherit;
          font-size: 1rem;
          background-color: var(--background-color, #fff);
          color: var(--text-color, #333);
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
          border-color: #cbd5e1;
        }
        .rich-text-wrapper .ql-toolbar {
          background-color: #f1f5f9;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          border-color: #cbd5e1;
        }
        :root.dark-mode .rich-text-wrapper .ql-container {
          background-color: #1e293b;
          color: #f1f5f9;
          border-color: #475569;
        }
        :root.dark-mode .rich-text-wrapper .ql-toolbar {
          background-color: #0f172a;
          border-color: #475569;
        }
        :root.dark-mode .rich-text-wrapper .ql-stroke {
          stroke: #f1f5f9;
        }
        :root.dark-mode .rich-text-wrapper .ql-fill {
          fill: #f1f5f9;
        }
        :root.dark-mode .rich-text-wrapper .ql-picker {
          color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
