"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from 'next/dynamic';
import styles from "./admin.module.css";
import { getAdminPosts, createPost, updatePost, deletePost, uploadImage } from "./actions";
import { FiEdit, FiTrash2, FiPlus, FiImage, FiLoader } from "react-icons/fi";
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const ReactQuillWrapper = ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
    ReactQuillWrapper.displayName = 'ReactQuillWrapper';
    return ReactQuillWrapper;
  },
  { ssr: false }
);

export default function BlogManager({ showToast, currentUserEmail, currentUserRole, currentUserUsername }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const quillRef = useRef(null);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getAdminPosts();
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreateNew = () => {
    setEditingPost("new");
    setFormData({
      title: "",
      slug: "",
      author: currentUserUsername || "Admin",
      cover_url: "",
      body_md: "",
      published: true,
      created_by_email: currentUserEmail
    });
  };

  const handleEdit = (post) => {
    setEditingPost(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      author: post.author || "",
      cover_url: post.cover_url || "",
      body_md: post.body_md,
      published: post.published,
      created_by_email: post.created_by_email || currentUserEmail
    });
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete the post "${title}"?`)) return;
    const res = await deletePost(id);
    if (res.success) {
      showToast(`Post deleted successfully`);
      loadPosts();
    } else {
      showToast("Error deleting post: " + res.message, "error");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const form = new FormData();
    form.append("file", file);

    const res = await uploadImage(form);
    setUploadingImage(false);

    if (res.success) {
      setFormData((prev) => ({ ...prev, cover_url: res.url }));
      showToast("Image uploaded successfully");
    } else {
      showToast("Upload failed: " + res.message, "error");
    }
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const form = new FormData();
      form.append("file", file);
      
      showToast("Uploading image to S3...");
      const res = await uploadImage(form);
      
      if (res.success) {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', res.url);
          editor.setSelection(range.index + 1);
        }
      } else {
        showToast("Image upload failed: " + res.message, "error");
      }
    };
  }, [showToast]);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image'
  ];

  const handleSave = async () => {
    if (!formData.title || !formData.body_md) {
      return showToast("Title and Body are required", "error");
    }

    let res;
    if (editingPost === "new") {
      res = await createPost(formData);
    } else {
      res = await updatePost(editingPost, formData);
    }

    if (res.success) {
      showToast(`Post saved successfully`);
      setEditingPost(null);
      loadPosts();
    } else {
      showToast("Error saving post: " + res.message, "error");
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}><FiLoader className={styles.spin} size={24} /> Loading posts...</div>;

  if (editingPost) {
    return (
      <div className={styles.blogEditor}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3>{editingPost === "new" ? "Create New Post" : "Edit Post"}</h3>
          <button onClick={() => setEditingPost(null)} className={styles.cancelBtn}>Cancel</button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Post Title"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Author's Name</label>
          <input
            className={styles.input}
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="e.g. John Doe"
            readOnly={currentUserRole === "Author"}
            style={currentUserRole === "Author" ? { backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" } : {}}
            title={currentUserRole === "Author" ? "Authors cannot change their display name" : ""}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Slug (optional - auto-generated from title if blank)</label>
          <input
            className={styles.input}
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="my-awesome-post"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Cover Image</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              className={styles.input}
              type="text"
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              placeholder="https://..."
              style={{ flex: 1 }}
            />
            <label className={styles.actionBtn}>
              <FiImage /> {uploadingImage ? "Uploading..." : "Upload"}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
            </label>
          </div>
          {formData.cover_url && (
            <div style={{ marginTop: '1rem', width: '100%', maxHeight: '200px', borderRadius: '8px', overflow: 'hidden', background: 'var(--light-gray-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={formData.cover_url}
                alt="Cover Preview"
                style={{ maxWidth: '100%', maxHeight: '200px', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '6px', display: 'block' }}
              />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Blog Content</label>
          <div style={{ background: '#fff', color: '#000', borderRadius: '4px', overflow: 'hidden' }}>
            <ReactQuill 
              forwardedRef={quillRef}
              theme="snow" 
              value={formData.body_md} 
              onChange={(val) => setFormData({ ...formData, body_md: val })} 
              modules={quillModules}
              formats={quillFormats}
              style={{ height: '300px', paddingBottom: '42px' }}
            />
          </div>
        </div>

        <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          />
          <label htmlFor="published" style={{ margin: 0, fontWeight: 'bold' }}>Published</label>
        </div>

        <button className={styles.saveButton} onClick={handleSave}>Save Post</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3>Manage Blog Posts</h3>
        <button onClick={handleCreateNew} className={styles.actionBtn} style={{ background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '4px' }}>
          <FiPlus /> Create New
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '12px', textAlign: 'center' }}>No posts found.</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}><strong>{post.title}</strong><br/><small style={{ color: '#666' }}>/{post.slug}</small></td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.85em', 
                    background: post.published ? '#e8f5e9' : '#fff3e0',
                    color: post.published ? '#2e7d32' : '#e65100'
                  }}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{new Date(post.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {(currentUserRole !== "Author" || post.created_by_email === currentUserEmail) && (
                    <>
                      <button onClick={() => handleEdit(post)} className={styles.iconBtn} style={{ color: '#2196F3', marginRight: '8px', cursor: 'pointer', background: 'none', border: 'none' }} title="Edit"><FiEdit size={18} /></button>
                      <button onClick={() => handleDelete(post.id, post.title)} className={styles.iconBtn} style={{ color: '#f44336', cursor: 'pointer', background: 'none', border: 'none' }} title="Delete"><FiTrash2 size={18} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
