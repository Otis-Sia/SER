"use client";

import { FiBookOpen, FiCheck, FiX, FiAlertTriangle, FiInfo, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { useState } from "react";
import styles from "./admin.module.css";

/* ───────────────────────────────────────────────────
   Reusable presentational helpers
   ─────────────────────────────────────────────────── */

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'var(--white-color, #fff)',
      border: '1px solid var(--light-gray-color, #eaeaea)',
      borderRadius: '12px',
      marginBottom: '1.25rem',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.25rem 1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-color)',
          fontSize: '1.15rem',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        {icon && <span style={{ color: 'var(--primary-color)', fontSize: '1.25rem', display: 'flex' }}>{icon}</span>}
        <span style={{ flex: 1 }}>{title}</span>
        <span style={{ opacity: 0.4, fontSize: '1.1rem', display: 'flex' }}>
          {open ? <FiChevronDown /> : <FiChevronRight />}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Callout({ type = "info", children }) {
  const palette = {
    info:    { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af', icon: <FiInfo /> },
    warning: { bg: '#fffbeb', border: '#fcd34d', color: '#92400e', icon: <FiAlertTriangle /> },
    danger:  { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b', icon: <FiAlertTriangle /> },
    success: { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: <FiCheck /> },
  }[type];

  return (
    <div style={{
      display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem',
      background: palette.bg, borderLeft: `4px solid ${palette.border}`,
      borderRadius: '8px', color: palette.color, margin: '1rem 0',
      fontSize: '0.9rem', alignItems: 'flex-start'
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>{palette.icon}</span>
      <div>{children}</div>
    </div>
  );
}

function PermBadge({ allowed }) {
  return allowed
    ? <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck size={16} /> Yes</span>
    : <span style={{ color: '#dc2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiX size={16} /> No</span>;
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontSize: '0.9rem', background: 'var(--white-color, #fff)',
        borderRadius: '8px', overflow: 'hidden',
        border: '1px solid var(--light-gray-color, #eaeaea)'
      }}>
        <thead>
          <tr style={{ background: 'rgba(18,154,68,0.08)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '0.75rem 1rem', textAlign: 'left',
                fontWeight: 600, borderBottom: '2px solid var(--light-gray-color, #eaeaea)',
                whiteSpace: 'nowrap'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--light-gray-color, #eaeaea)' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '0.65rem 1rem' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StepList({ steps }) {
  return (
    <ol style={{ paddingLeft: '1.5rem', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {steps.map((s, i) => (
        <li key={i} style={{ lineHeight: 1.6 }}>{s}</li>
      ))}
    </ol>
  );
}

function GuestManual() {
  return (
    <Section title="How to Access the Dashboard" icon={<FiInfo />}>
      <p>
        If you are an administrator, project lead, author, or have another assigned role within the SER platform, you must sign in to access your dashboard.
      </p>
      <StepList steps={[
        'Enter your registered Email Address in the form above.',
        'Enter your Password.',
        'Click the "Sign In" button.',
      ]} />
      <Callout type="info">
        If you do not have an account or forgot your password, please contact the Super Admin for assistance.
      </Callout>
    </Section>
  );
}

/* ───────────────────────────────────────────────────
   SUPER ADMIN MANUAL
   ─────────────────────────────────────────────────── */

function SuperAdminManual() {
  return (
    <>
      <Section title="Your Role — Super Admin" icon={<FiBookOpen />}>
        <p>
          As a <strong>Super Admin</strong>, you have <strong>complete control</strong> over the entire SER platform. 
          You can manage all content, users, member applications, and system settings. This is the most powerful role 
          and should only be assigned to trusted administrators.
        </p>
        <Table
          headers={["Capability", "Access"]}
          rows={[
            ["Dashboard Overview & Stats", <PermBadge allowed />],
            ["Blog Posts — Create / Edit / Delete", <PermBadge allowed />],
            ["Member Form Responses — View / Edit / Delete / Export", <PermBadge allowed />],
            ["User Management — Create / Edit / Delete admin users", <PermBadge allowed />],
            ["Events — Create / Edit / Delete", <PermBadge allowed />],
            ["Gallery — Upload / Hide / Delete images", <PermBadge allowed />],
            ["Projects — Create / Edit / Delete", <PermBadge allowed />],
            ["Products (Shop) — Create / Edit / Delete", <PermBadge allowed />],
            ["FAQs — Create / Edit / Delete", <PermBadge allowed />],
            ["Site Content — Edit hero, about, social links, etc.", <PermBadge allowed />],
            ["Account Settings — Update profile, email, password", <PermBadge allowed />],
          ]}
        />
      </Section>

      <Section title="Dashboard Overview" defaultOpen={false}>
        <p>The <strong>Overview</strong> tab is your landing page. It shows:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
          <li><strong>Quick Stats</strong> — Total blogs, upcoming events, active projects, member registrations, admin users, and shop products.</li>
          <li><strong>Quick Actions</strong> — One-click shortcuts to jump to any management section.</li>
        </ul>
      </Section>

      <Section title="Managing Blog Posts" defaultOpen={false}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Creating a New Post</h4>
        <StepList steps={[
          'Navigate to the "Blog Posts" tab from the sidebar.',
          'Click the "New Post" or "+" button.',
          'Fill in the Title (required), Slug (auto-generated from title), Cover Image (upload or paste URL), and Body in Markdown format (required).',
          'Toggle the "Published" switch to publish immediately or save as a draft.',
          'Click "Save" to create the post.',
        ]} />
        <Callout type="info">The slug must be unique across all posts. A collision will produce an error — modify the slug and retry.</Callout>

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Editing a Post</h4>
        <StepList steps={[
          'Find the post in the blog list.',
          'Click the "Edit" (pencil) button.',
          'Modify any fields and click "Save".',
        ]} />

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Deleting a Post</h4>
        <StepList steps={[
          'Click the "Delete" (trash) button on the post.',
          'Confirm the deletion in the dialog.',
        ]} />
        <Callout type="danger">Deletion is <strong>permanent</strong>. There is no undo.</Callout>

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Image Uploads</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Supported formats: JPEG, PNG, WebP, and other <code>image/*</code> types.</li>
          <li>Maximum file size: <strong>10 MB</strong>.</li>
          <li>Drag-and-drop is supported on upload zones.</li>
        </ul>
      </Section>

      <Section title="Managing Member Form Responses" defaultOpen={false}>
        <p>The <strong>Form Responses</strong> tab displays all membership/volunteer applications submitted via the public <code>/join</code> page.</p>
        
        <h4 style={{ margin: '0.75rem 0 0.5rem 0' }}>Features</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Search</strong> — Filter by name, email, county, crew, or phone number.</li>
          <li><strong>County Filter</strong> — Dropdown to filter by county.</li>
          <li><strong>View Details</strong> — Click "Details" on any row to see the full 8-section application.</li>
          <li><strong>Edit Details</strong> — As Super Admin, click "Edit Details" inside the modal to modify any field.</li>
          <li><strong>Flag / Unflag</strong> — Mark members as flagged (restricted) or clear a flag.</li>
          <li><strong>Delete</strong> — Permanently remove a registration.</li>
          <li><strong>Export to CSV</strong> — Download all filtered results as a CSV file for Excel.</li>
          <li><strong>Refresh</strong> — Reload data from Supabase.</li>
        </ul>
        <Callout type="info">Only Super Admins and Project Leads can delete member registrations and see who flagged a member.</Callout>
      </Section>

      <Section title="Managing Users & Roles" defaultOpen={false}>
        <p>The <strong>Users</strong> tab allows you to create, edit, and delete admin accounts and assign roles.</p>
        
        <h4 style={{ margin: '0.75rem 0 0.5rem 0' }}>Creating a New Admin User</h4>
        <StepList steps={[
          'Click "Add User" or the "+" button.',
          'Enter the email address, a secure initial password, and select a role (Super Admin, Project Lead, Author, Admin, Communication, or Events).',
          'Click "Create" to add the user.',
          'Instruct the new user to change their password on first login.',
        ]} />

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Available Roles</h4>
        <Table
          headers={["Role", "Dashboard Access"]}
          rows={[
            ["Super Admin", "Full access to all tabs and features (including JSON site content)"],
            ["Project Lead", "Form Responses, Blog, Users, Events, Gallery, Projects, Products"],
            ["Admin", "Form Responses, Blog, Users, Events, FAQ, Gallery"],
            ["Communication", "Contacts, Social Media, Gallery"],
            ["Events", "Events, Blog Posts (Event Reports), Gallery"],
            ["Author", "Blog Posts, Gallery"],
          ]}
        />

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Editing & Deleting Users</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Click "Edit" to change a user's role or flag/unflag their account.</li>
          <li>Click "Delete" to permanently remove a user.</li>
        </ul>
        <Callout type="danger"><strong>Never delete the last Super Admin account</strong> — this would lock everyone out of administrative functions.</Callout>
      </Section>

      <Section title="Managing Events" defaultOpen={false}>
        <p>Events are stored in Supabase and can sync with Google Calendar.</p>
        <h4 style={{ margin: '0.75rem 0 0.5rem 0' }}>Creating an Event</h4>
        <StepList steps={[
          'Navigate to the "Events" tab.',
          'Click "Add Event" or the "+" button.',
          'Fill in: Title (required), Event Date (required), Location (required), and Description (optional).',
          'Click "Save". The event syncs to Google Calendar automatically.',
        ]} />
        <p>Events appear on the public <code>/events</code> page with "Add to Calendar" buttons for visitors.</p>
      </Section>

      <Section title="Managing Gallery" defaultOpen={false}>
        <p>Upload and manage images shown on the public gallery page.</p>
        <h4 style={{ margin: '0.75rem 0 0.5rem 0' }}>Adding an Image</h4>
        <StepList steps={[
          'Navigate to the "Gallery" tab.',
          'Click "Add Image" or the "+" button.',
          'Provide a Title (required), upload an Image (required), set a Category (optional), and toggle Featured (optional).',
          'Click "Save".',
        ]} />
        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Hiding vs. Deleting</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Hide</strong> — Removes the image from the public site but keeps it in the database. You can unhide later.</li>
          <li><strong>Delete</strong> — Permanently removes the image. No undo.</li>
          <li>You can only delete images you uploaded yourself, or hide images uploaded by others.</li>
          <li>As Super Admin, you can unhide any image regardless of who hid it.</li>
        </ul>
      </Section>

      <Section title="Managing Projects" defaultOpen={false}>
        <p>Projects appear on the public <code>/projects</code> page.</p>
        <StepList steps={[
          'Navigate to the "Projects" tab.',
          'Click "Add Project" to create a new entry with Title, Focus Area, Description, and Link.',
          'Use "Edit" or "Delete" on existing projects.',
        ]} />
      </Section>

      <Section title="Managing Products (Shop)" defaultOpen={false}>
        <p>Products appear on the public <code>/shop</code> page. Only <strong>featured</strong> products are shown publicly.</p>
        <h4 style={{ margin: '0.75rem 0 0.5rem 0' }}>Adding a Product</h4>
        <Table
          headers={["Field", "Required", "Description"]}
          rows={[
            ["Name", <><FiCheck size={14} style={{ color: '#16a34a' }} /></>, "Product name"],
            ["Price (KES)", <><FiCheck size={14} style={{ color: '#16a34a' }} /></>, "Price in Kenyan Shillings (must be ≥ 0)"],
            ["Image", "Optional", "Product image (uploaded via S3/Cloudinary)"],
            ["Description", "Optional", "Product description"],
            ["Featured", "Optional", "Toggle to show on the public shop page"],
          ]}
        />
      </Section>

      <Section title="Managing FAQs" defaultOpen={false}>
        <p>FAQs appear on the public <code>/faq</code> page with accordion-style expand/collapse UI.</p>
        <StepList steps={[
          'Navigate to the "FAQ" tab.',
          'Click "Add FAQ" to add a new Question and Answer.',
          'Edit or delete existing entries as needed.',
        ]} />
        <Callout type="info">FAQs also generate Schema.org structured data for SEO rich snippets in search results.</Callout>
      </Section>

      <Section title="Site Content Management" defaultOpen={false}>
        <p>Additional tabs (like Home, Contact, Footer, etc.) let you edit dynamic site content stored as JSON in Supabase.</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Hero Section</strong> — Heading, subheading, CTA button text</li>
          <li><strong>Features</strong> — Service pillar descriptions</li>
          <li><strong>Social Media Posts</strong> — Instagram, TikTok, Facebook embed URLs</li>
          <li><strong>Partners</strong> — Partner organization names (shown in the marquee)</li>
          <li><strong>Team Members</strong> — Leader profiles (name, role, photo)</li>
          <li><strong>Contact Info</strong> — Email, phone numbers, WhatsApp, social links</li>
        </ul>
        <Callout type="warning">After editing, click <strong>"Save Changes"</strong> (the floating green button). Changes go live immediately.</Callout>
      </Section>

      <Section title="Account Settings" defaultOpen={false}>
        <p>The <strong>Account Settings</strong> tab lets you manage your own profile:</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Update Name</strong> — Change your display name.</li>
          <li><strong>Update Email</strong> — Changing your email will sign you out. You'll need to log in with the new email.</li>
          <li><strong>Change Password</strong> — Enter a new password (minimum 6 characters). Leave blank to keep the current one.</li>
        </ul>
      </Section>
    </>
  );
}

/* ───────────────────────────────────────────────────
   PROJECT LEAD MANUAL
   ─────────────────────────────────────────────────── */

function ProjectLeadManual() {
  return (
    <>
      <Section title="Your Role — Project Lead" icon={<FiBookOpen />}>
        <p>
          As a <strong>Project Lead</strong>, you have broad management access across the platform. 
          You can manage blog posts, member applications, events, gallery, projects, products, and view user accounts.
        </p>
        <Table
          headers={["Capability", "Access"]}
          rows={[
            ["Dashboard Overview & Stats", <PermBadge allowed />],
            ["Blog Posts — Create / Edit / Delete", <PermBadge allowed />],
            ["Member Form Responses — View / Delete / Flag / Export", <PermBadge allowed />],
            ["User Management — View users", <PermBadge allowed />],
            ["Events — Create / Edit / Delete", <PermBadge allowed />],
            ["Gallery — Upload / Hide images", <PermBadge allowed />],
            ["Projects — Create / Edit / Delete", <PermBadge allowed />],
            ["Products (Shop) — Create / Edit / Delete", <PermBadge allowed />],
            ["FAQs — Manage", <PermBadge allowed={false} />],
            ["Site Content — Edit hero, about, social links", <PermBadge allowed={false} />],
            ["User Management — Create / Delete users", "Limited"],
            ["Account Settings", <PermBadge allowed />],
          ]}
        />
      </Section>

      <Section title="Managing Blog Posts" defaultOpen={false}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Creating a New Post</h4>
        <StepList steps={[
          'Navigate to the "Blog Posts" tab from the sidebar.',
          'Click the "New Post" or "+" button.',
          'Fill in the Title (required), Slug (auto-generated), Cover Image, and Body in Markdown format (required).',
          'Toggle "Published" to publish or save as draft.',
          'Click "Save" to create the post.',
        ]} />
        <Callout type="info">Slugs must be unique. The system auto-generates one from the title, but you can customize it.</Callout>

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Editing & Deleting Posts</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Click <strong>"Edit"</strong> (pencil icon) to modify a post, then "Save".</li>
          <li>Click <strong>"Delete"</strong> (trash icon) and confirm to permanently remove a post.</li>
        </ul>
        <Callout type="danger">Deletion is <strong>permanent</strong>. There is no undo.</Callout>

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Image Uploads</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Supported: JPEG, PNG, WebP and other image formats.</li>
          <li>Max size: <strong>10 MB</strong>. Drag-and-drop supported.</li>
        </ul>
      </Section>

      <Section title="Managing Member Form Responses" defaultOpen={false}>
        <p>View and manage all membership/volunteer applications from the <strong>Form Responses</strong> tab.</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Search</strong> by name, email, county, crew, or phone.</li>
          <li><strong>County Filter</strong> dropdown to narrow results.</li>
          <li><strong>View Details</strong> — Click "Details" to see the full application.</li>
          <li><strong>Flag / Unflag</strong> — Mark members as restricted.</li>
          <li><strong>Delete</strong> — Permanently remove a registration.</li>
          <li><strong>Export to CSV</strong> — Download filtered data for Excel.</li>
        </ul>
        <Callout type="info">You can see who flagged a member and unflag them.</Callout>
      </Section>

      <Section title="Managing Events" defaultOpen={false}>
        <StepList steps={[
          'Go to the "Events" tab.',
          'Click "Add Event" to create with Title, Date, Location, and Description.',
          'Events sync to Google Calendar automatically.',
          'Edit or delete existing events as needed.',
        ]} />
      </Section>

      <Section title="Managing Gallery & Site Content" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Upload images with Title, Image, Category, and Featured toggle.</li>
          <li><strong>Note on Deletion:</strong> Only Super Admins and Project Leads can delete items (like pictures) permanently.</li>
          <li>Other roles like Communication or Admin can only <strong>hide</strong> or <strong>flag</strong> images, which removes them from the public site but keeps them in the database.</li>
        </ul>
      </Section>

      <Section title="Managing Projects" defaultOpen={false}>
        <StepList steps={[
          'Navigate to the "Projects" tab.',
          'Add new projects with Title, Focus Area, Description, and Link.',
          'Edit or delete existing projects.',
        ]} />
        <p>Changes appear on the public <code>/projects</code> page immediately.</p>
      </Section>

      <Section title="Managing Products (Shop)" defaultOpen={false}>
        <Table
          headers={["Field", "Required", "Description"]}
          rows={[
            ["Name", <><FiCheck size={14} style={{ color: '#16a34a' }} /></>, "Product name"],
            ["Price (KES)", <><FiCheck size={14} style={{ color: '#16a34a' }} /></>, "Price in Kenyan Shillings (must be ≥ 0)"],
            ["Image", "Optional", "Product image"],
            ["Description", "Optional", "Product description"],
            ["Featured", "Optional", "Toggle to show on the public shop page"],
          ]}
        />
        <Callout type="info">Only <strong>featured</strong> products appear on the public <code>/shop</code> page.</Callout>
      </Section>

      <Section title="Account Settings" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Update Name</strong> — Change your display name.</li>
          <li><strong>Update Email</strong> — This will sign you out.</li>
          <li><strong>Change Password</strong> — Enter a new password (min 6 characters).</li>
        </ul>
      </Section>

      <Section title="What You Cannot Do" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Edit site content (hero section, about page text, social links, etc.) — Super Admin only.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Manage FAQs — Super Admin only.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Edit member application details — Super Admin only.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Assign the Super Admin role — Super Admin only.</li>
        </ul>
      </Section>
    </>
  );
}

/* ───────────────────────────────────────────────────
   AUTHOR MANUAL
   ─────────────────────────────────────────────────── */

function AuthorManual() {
  return (
    <>
      <Section title="Your Role — Author" icon={<FiBookOpen />}>
        <p>
          As an <strong>Author</strong>, your primary responsibility is creating and managing <strong>blog posts</strong> for the SER platform. 
          You also have access to the gallery for uploading images.
        </p>
        <Table
          headers={["Capability", "Access"]}
          rows={[
            ["Dashboard Overview", <PermBadge allowed />],
            ["Blog Posts — Create / Edit / Delete", <PermBadge allowed />],
            ["Gallery — Upload images", <PermBadge allowed />],
            ["Member Form Responses", <PermBadge allowed={false} />],
            ["User Management", <PermBadge allowed={false} />],
            ["Events", <PermBadge allowed={false} />],
            ["Projects", <PermBadge allowed={false} />],
            ["Products (Shop)", <PermBadge allowed={false} />],
            ["FAQs", <PermBadge allowed={false} />],
            ["Site Content", <PermBadge allowed={false} />],
            ["Account Settings", <PermBadge allowed />],
          ]}
        />
      </Section>

      <Section title="Managing Blog Posts" defaultOpen={false}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Creating a New Post</h4>
        <StepList steps={[
          'From the sidebar, click "Blog Posts".',
          'Click "New Post" or the "+" button.',
          'Fill in the required fields: Title and Body (Markdown).',
          'Optionally add a cover image and customize the slug.',
          'Toggle "Published" to go live, or leave off to save as draft.',
          'Click "Save".',
        ]} />

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Writing Tips</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>The body supports full <strong>Markdown</strong> — headings, bold, italic, links, images, code blocks, and lists.</li>
          <li>Use <code># Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>[link text](url)</code> for formatting.</li>
          <li>The slug is auto-generated from the title but can be manually edited.</li>
        </ul>

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Editing a Post</h4>
        <StepList steps={[
          'Find the post in the blog list.',
          'Click the "Edit" (pencil) button.',
          'Make your changes and click "Save".',
        ]} />

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Publishing / Unpublishing</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Published (ON)</strong> — Visible on the public blog and community page.</li>
          <li><strong>Draft (OFF)</strong> — Saved but not visible to the public.</li>
        </ul>

        <h4 style={{ margin: '1rem 0 0.5rem 0' }}>Deleting a Post</h4>
        <p>Click "Delete", then confirm. </p>
        <Callout type="danger">Deletion is <strong>permanent</strong> and cannot be undone.</Callout>
      </Section>

      <Section title="Uploading Images" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Supported formats: JPEG, PNG, WebP, and other image types.</li>
          <li>Maximum file size: <strong>10 MB</strong>.</li>
          <li>You can <strong>drag and drop</strong> images into upload zones.</li>
          <li>You can also paste a URL directly into the image field.</li>
        </ul>
      </Section>

      <Section title="Managing the Gallery" defaultOpen={false}>
        <p>You have access to the <strong>Gallery</strong> tab where you can upload images.</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Upload images with a Title, Image file, and optional Category.</li>
          <li>You can <strong>delete</strong> images that <em>you</em> uploaded.</li>
          <li>You cannot delete or hide images uploaded by other admins.</li>
        </ul>
      </Section>

      <Section title="Account Settings" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Update Name</strong> — Change your display name.</li>
          <li><strong>Update Email</strong> — Changing your email will sign you out.</li>
          <li><strong>Change Password</strong> — Enter a new password (min 6 characters).</li>
        </ul>
      </Section>

      <Section title="What You Cannot Do" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> View or manage member form responses.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Create, edit, or delete admin users.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Manage events, projects, products, or FAQs.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Edit site content (hero section, about page, social links, etc.).</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Change other users' roles or passwords.</li>
        </ul>
        <Callout type="info">If you need access to other sections, contact a Super Admin to upgrade your role.</Callout>
      </Section>
    </>
  );
}

/* ───────────────────────────────────────────────────
   ADMIN MANUAL
   ─────────────────────────────────────────────────── */

function AdminRoleManual() {
  return (
    <>
      <Section title="Your Role — Admin" icon={<FiBookOpen />}>
        <p>
          As an <strong>Admin</strong>, you have access to form responses, blog management, user viewing, events, FAQs, gallery, 
          and contact-related site content.
        </p>
        <Table
          headers={["Capability", "Access"]}
          rows={[
            ["Dashboard Overview", <PermBadge allowed />],
            ["Blog Posts — Create / Edit / Delete", <PermBadge allowed />],
            ["Member Form Responses — View / Flag / Export", <PermBadge allowed />],
            ["User Management — View users", <PermBadge allowed />],
            ["Events — Create / Edit / Delete", <PermBadge allowed />],
            ["Gallery — Upload / Hide images", <PermBadge allowed />],
            ["FAQs — Create / Edit / Delete", <PermBadge allowed />],
            ["Contact Site Content — Edit", <PermBadge allowed />],
            ["Projects", <PermBadge allowed={false} />],
            ["Products (Shop)", <PermBadge allowed={false} />],
            ["Full Site Content", <PermBadge allowed={false} />],
            ["Account Settings", <PermBadge allowed />],
          ]}
        />
      </Section>

      <Section title="Managing Blog Posts" defaultOpen={false}>
        <StepList steps={[
          'Navigate to "Blog Posts" in the sidebar.',
          'Create new posts with Title, Slug, Cover Image, and Markdown Body.',
          'Edit or delete existing posts.',
          'Toggle "Published" to control public visibility.',
        ]} />
        <Callout type="info">Image uploads support drag-and-drop and are limited to <strong>10 MB</strong>.</Callout>
      </Section>

      <Section title="Managing Member Form Responses" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>View all membership applications with search and county filtering.</li>
          <li>Flag members as restricted.</li>
          <li>Export filtered data to CSV.</li>
          <li>View full application details in a modal.</li>
        </ul>
      </Section>

      <Section title="Managing Events" defaultOpen={false}>
        <StepList steps={[
          'Go to the "Events" tab.',
          'Create events with Title, Date, Location, and Description.',
          'Events sync to Google Calendar and appear on the public site.',
        ]} />
      </Section>

      <Section title="Managing FAQs" defaultOpen={false}>
        <StepList steps={[
          'Navigate to the "FAQ" tab.',
          'Add new Q&A entries or edit/delete existing ones.',
          'Changes appear on the public /faq page immediately.',
        ]} />
      </Section>

      <Section title="Account Settings" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Update your name, email (signs you out), or password.</li>
        </ul>
      </Section>

      <Section title="What You Cannot Do" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Manage projects or products.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Edit full site content (hero, about, partners, etc.) — only contact section.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Create or delete admin users.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Delete or edit member applications.</li>
        </ul>
      </Section>
    </>
  );
}

/* ───────────────────────────────────────────────────
   COMMUNICATION MANUAL
   ─────────────────────────────────────────────────── */

function CommunicationManual() {
  return (
    <>
      <Section title="Your Role — Communication" icon={<FiBookOpen />}>
        <p>
          As a <strong>Communication</strong> team member, you manage the public-facing content — social media links, 
          homepage text, footer details, and contact information.
        </p>
        <Table
          headers={["Capability", "Access"]}
          rows={[
            ["Dashboard Overview", <PermBadge allowed />],
            ["Site Content — Home, Contact, Social, Footer", <PermBadge allowed />],
            ["Blog Posts", <PermBadge allowed={false} />],
            ["Member Form Responses", <PermBadge allowed={false} />],
            ["User Management", <PermBadge allowed={false} />],
            ["Events / Gallery / Projects / Products / FAQs", <PermBadge allowed={false} />],
            ["Account Settings", <PermBadge allowed />],
          ]}
        />
      </Section>

      <Section title="Editing Site Content" defaultOpen={false}>
        <p>Your available tabs depend on the site content structure, but typically include:</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Home</strong> — Hero section text, feature descriptions, partner names.</li>
          <li><strong>Communications</strong> — Social media embed URLs (Instagram, TikTok, Facebook).</li>
          <li><strong>Contact</strong> — Email, phone numbers, WhatsApp link.</li>
          <li><strong>Social / Socials</strong> — Social media profile links and handles.</li>
          <li><strong>Footer</strong> — Footer content and quick links.</li>
        </ul>
        <Callout type="warning">After editing, always click <strong>"Save Changes"</strong> (the green floating button). Changes go live immediately.</Callout>
      </Section>

      <Section title="Adding Social Media Embeds" defaultOpen={false}>
        <p>You can embed social media posts directly onto the public site via the <strong>Communications</strong> tab.</p>
        <StepList steps={[
          'Navigate to the "Communications" tab in the admin panel.',
          'Find the relevant field (e.g., TikTok Embed, Instagram Embed).',
          'Go to the social media platform (TikTok, Instagram, etc.), find the post you want to feature, and look for the "Embed" or "Share" option.',
          'Copy the provided Embed Code (it usually starts with <blockquote...> or <iframe...).',
          'Paste the entire Embed Code into the corresponding field in the Communications tab.',
          'Click the green "Save Changes" button.',
        ]} />
        <Callout type="info">Ensure you paste the full HTML embed code provided by the platform, not just the URL of the post.</Callout>
      </Section>

      <Section title="Account Settings" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Update your name, email (signs you out), or password.</li>
        </ul>
      </Section>

      <Section title="What You Cannot Do" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Create or manage blog posts, events, gallery, projects, products, or FAQs.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> View member form responses.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Create or manage admin users.</li>
        </ul>
        <Callout type="info">If you need broader access, contact a Super Admin to change your role.</Callout>
      </Section>
    </>
  );
}

function EventsRoleManual() {
  return (
    <>
      <Section title="Your Role — Events" icon={<FiBookOpen />}>
        <p>
          As an <strong>Events</strong> manager, you are in charge of creating, editing, and scheduling <strong>events</strong>, 
          as well as writing <strong>event reports</strong> (published via Blog Posts).
        </p>
        <Table
          headers={["Capability", "Access"]}
          rows={[
            ["Dashboard Overview", <PermBadge allowed />],
            ["Events — Create / Edit / Delete", <PermBadge allowed />],
            ["Blog Posts — Write & Edit Event Reports", <PermBadge allowed />],
            ["Member Form Responses", <PermBadge allowed={false} />],
            ["User Management", <PermBadge allowed={false} />],
            ["Gallery / Projects / Products / FAQs", <PermBadge allowed={false} />],
            ["Site Content & Settings", <PermBadge allowed={false} />],
            ["Account Settings", <PermBadge allowed />],
          ]}
        />
      </Section>

      <Section title="Managing Events" defaultOpen={false}>
        <p>Events appear on the public site and sync automatically to Google Calendar.</p>
        <StepList steps={[
          'Navigate to the "Events" tab.',
          'Click "+ Add Event".',
          'Fill in Title, Date, Location, and Description.',
          'Save to publish the event live.',
        ]} />
      </Section>

      <Section title="Writing Event Reports" defaultOpen={false}>
        <p>You can publish event write-ups, summaries, and reports through the <strong>Blog Posts</strong> tab.</p>
        <StepList steps={[
          'Navigate to the "Blog Posts" tab.',
          'Click "New Post".',
          'Title your post (e.g. "Event Report: Emergency Prep Hub Drill").',
          'Write the event report content using Markdown and upload cover media.',
          'Toggle Published to make it live.',
        ]} />
      </Section>

      <Section title="What You Cannot Do" defaultOpen={false}>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Manage projects, shop products, or FAQs.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> View or delete member form responses.</li>
          <li><FiX size={14} style={{ color: '#dc2626', marginRight: '6px', verticalAlign: 'middle' }} /> Manage admin users or site-wide JSON content.</li>
        </ul>
        <Callout type="info">If you need additional permissions, contact a Super Admin.</Callout>
      </Section>
    </>
  );
}

/* ───────────────────────────────────────────────────
   COMMON SECTIONS (shown for all roles)
   ─────────────────────────────────────────────────── */

function CommonSections() {
  return (
    <>
      <Section title="Logging In" defaultOpen={false}>
        <StepList steps={[
          'Navigate to the admin page (/admin).',
          'Enter your email address and password in the sign-in form.',
          'Click "Sign In".',
          'If this is your first login, you may be prompted to change your password.',
        ]} />
        <Callout type="info">Sessions last <strong>8 hours</strong>. After expiry, you'll need to sign in again.</Callout>
      </Section>

      <Section title="Troubleshooting" defaultOpen={false}>
        <Table
          headers={["Issue", "Solution"]}
          rows={[
            ['"Invalid email or password"', 'Double-check your credentials. Emails are case-insensitive. Contact a Super Admin if you forgot your password.'],
            ["Can't see certain tabs", "Your role determines which tabs are visible. Contact a Super Admin to change your role."],
            ["Blog post not showing on the site", "Ensure 'Published' is toggled ON and the post isn't hidden. Blog cache refreshes every ~60 seconds."],
            ["Image upload fails", "Check: file must be an image type, max 10 MB. Try a different format."],
            ['"Your account has been restricted"', "Your account was flagged by an admin. Contact a Super Admin."],
            ["Session expired / signed out", "Sessions last 8 hours. Simply sign in again."],
            ["Changes not saving", "Click the green 'Save Changes' button. Check your internet connection."],
          ]}
        />
      </Section>

      <Section title="Need Help?" defaultOpen={false}>
        <p>If you encounter issues not covered here, contact your Super Admin or reach out:</p>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>Email:</strong> <a href="mailto:admin@seresponse.org" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>admin@seresponse.org</a></li>
          <li><strong>WhatsApp:</strong> <a href="https://wa.me/254742435314" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>+254 742 435 314</a>, <a href="https://wa.me/254718612549" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>+254 718 612 549</a></li>
        </ul>
      </Section>
    </>
  );
}

/* ───────────────────────────────────────────────────
   MAIN EXPORT
   ─────────────────────────────────────────────────── */

export default function UserManual({ userRole }) {
  const roleLabel = userRole || "Admin";

  return (
    <div style={{ padding: '1rem', maxWidth: '900px' }}>
      {/* Header badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '2rem', padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--primary-color, #2563eb), #047857)',
        color: '#fff', borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(18,154,68,0.25)'
      }}>
        <FiBookOpen style={{ fontSize: '2rem', flexShrink: 0 }} />
        <div>
          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>User Manual</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
            Showing the guide for your role: <strong style={{ background: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{roleLabel}</strong>
          </p>
        </div>
      </div>

      {/* Role-specific content */}
      {roleLabel === "Guest" && <GuestManual />}
      {roleLabel === "Super Admin" && <SuperAdminManual />}
      {roleLabel === "Project Lead" && <ProjectLeadManual />}
      {roleLabel === "Author" && <AuthorManual />}
      {roleLabel === "Admin" && <AdminRoleManual />}
      {roleLabel === "Communication" && <CommunicationManual />}
      {roleLabel === "Events" && <EventsRoleManual />}

      {/* Fallback for unknown roles */}
      {!["Super Admin", "Project Lead", "Author", "Admin", "Communication", "Events", "Guest"].includes(roleLabel) && (
        <Section title={`Your Role — ${roleLabel}`} icon={<FiBookOpen />}>
          <p>Your role-specific manual is not yet available. Please contact a Super Admin for guidance on your permissions and responsibilities.</p>
        </Section>
      )}

      {/* Common sections for all roles */}
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
          General Information
        </h3>
        <CommonSections />
      </div>
    </div>
  );
}
