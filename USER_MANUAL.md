# SER Platform — User Manual

> **Version 1.0** · Last updated: July 2026
> Scout's Emergency Response — *Compassion in Action*

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Platform Overview](#2-platform-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Public Visitor Guide](#4-public-visitor-guide)
5. [Registered User Guide](#5-registered-user-guide)
6. [Author Guide](#6-author-guide)
7. [Project Lead Guide](#7-project-lead-guide)
8. [Super Admin Guide](#8-super-admin-guide)
9. [Logging In & Authentication](#9-logging-in--authentication)
10. [Troubleshooting & FAQ](#10-troubleshooting--faq)

---

## 1. Introduction

Welcome to the **Scout's Emergency Response (SER) Platform** user manual. SER is a community-focused web application built for a youth-led emergency preparedness organization in Kenya. It provides a public-facing website (blog, events, gallery, shop, projects, FAQ, and more) together with a powerful admin dashboard for managing all content, members, and users.

This manual covers every role in the system — from a first-time visitor browsing the website, to a Super Admin managing every aspect of the platform.

---

## 2. Platform Overview

### Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js (React) | Public website & Admin dashboard |
| **Backend API** | Express.js (Node) | REST API for blog posts, events, gallery, products, members, uploads |
| **Database** | PostgreSQL | Stores users, admins, posts, events, products, gallery items, members |
| **Cloud Database** | Firebase / Firestore | Stores site content, projects, FAQs, gallery, user roles, blog posts |
| **Authentication** | JWT (server-side) + Firebase Auth (Firestore rules) | Login, token-based sessions (8-hour expiry) |
| **File Storage** | Cloudinary / AWS S3 | Image uploads for blog posts, gallery, products |
| **Contact Forms** | SplitForms API | Handles contact form submissions |

### Public Pages

| Page | URL Path | Description |
|------|----------|-------------|
| Home | `/` | Landing page with hero, mission, featured projects, events, blog, gallery, shop, and social embeds |
| About | `/about` | Organization story, pillars, core values, team profiles, and TikTok embed |
| Blog | `/blog` | Published blog articles in a card grid |
| Blog Post | `/blog/[slug]` | Individual blog article with full markdown content |
| Events | `/events` | Historic milestones and upcoming SER events with Google Calendar integration |
| Gallery | `/gallery` | Photo gallery with hover overlays |
| Shop | `/shop` | Featured products/merchandise catalog (prices in KES) |
| Projects | `/projects` | Ongoing and past project portfolio |
| Community | `/community` | Community overview tab and blog posts tab |
| Join | `/join` | 8-step membership/volunteer registration form |
| Contact | `/contact` | Contact form, phone, email, WhatsApp, and social links |
| FAQ | `/faq` | Frequently Asked Questions with accordion UI and Schema.org SEO |
| Login | `/login` | Sign-in page for admins and users |
| Sign Up | `/login/signup` | Create a new user account |

---

## 3. User Roles & Permissions

SER has **five** distinct roles, each with different levels of access:

| Role | Login Required | Admin Dashboard | Blog Posts | Site Content & Collections | User Management |
|------|:-------------:|:---------------:|:----------:|:--------------------------:|:---------------:|
| **Public Visitor** | ❌ | ❌ | Read only | Read only | ❌ |
| **Registered User** | ✅ | ❌ | Read only | Read only | ❌ |
| **Author** | ✅ | ✅ (Blog only) | ✅ Create / Edit / Delete | ❌ | ❌ |
| **Project Lead** | ✅ | ✅ (Blog only) | ✅ Create / Edit / Delete | ❌ | ❌ |
| **Super Admin** | ✅ | ✅ Full access | ✅ Create / Edit / Delete | ✅ Full CRUD | ✅ Full CRUD |

### Role Hierarchy

```
┌───────────────────────────────────────────────────────────────┐
│                     SER ROLE HIERARCHY                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Super Admin ─────────── Full platform control                │
│       │                  • All content collections             │
│       │                  • User & role management              │
│       │                  • Member applications                 │
│       │                  • Blog posts                          │
│       │                  • Account settings                    │
│       │                                                       │
│  Project Lead ─────────── Blog post management                │
│       │                   • Create / Edit / Delete posts       │
│       │                                                       │
│  Author ───────────────── Blog post management                │
│       │                   • Create / Edit / Delete posts       │
│       │                                                       │
│  Registered User ──────── Browse + Future features            │
│       │                   • Same as visitor + account          │
│       │                                                       │
│  Public Visitor ───────── Browse only                         │
│                           • View all public content            │
│                           • Submit contact & join forms        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Role Definitions

- **Public Visitor**: Anyone on the internet. Can browse all public pages, read blog posts, view events, gallery, and products. Can submit the Contact form and the Join/Membership application form.
- **Registered User**: Has created an account via the Sign Up page. Can log in but has no admin dashboard access. This role is intended for future community features.
- **Author**: A Firestore-managed role assigned by a Super Admin. Can log into the admin dashboard and manage **blog posts only** — create, edit, publish/unpublish, and delete articles.
- **Project Lead**: A Firestore-managed role assigned by a Super Admin. Has the same blog post management capabilities as Author. May also oversee project-related content.
- **Super Admin**: Full control over the entire platform. Can manage all content collections, all blog posts, all members, and all admin users including creating new users and assigning roles.

---

## 4. Public Visitor Guide

As a public visitor, you can access all content on the SER website without creating an account.

### 4.1 Home Page

The home page (`/`) is the main entry point and includes:

- **Hero Section**: Dynamic heading, subheading, and call-to-action button
- **"Why Scout's Emergency Response?" Section**: Core focus on youth emergency preparedness with a "Request Training" button linking to the Contact page
- **About Us Summary**: Narrative overview of SER's origins, an "Our Full Story" button, and a gradient badge displaying *"SER — Compassion in Action"*
- **What We Do**: 4-card grid highlighting key service pillars — First Aid & CPR, Emergency Response, Mental Health First Aid, and Fire Safety
- **Join the Response Network**: Call-to-action inviting volunteers across Kenya to register
- **On-the-Ground Moments**: Infinite horizontal scrolling gallery of media cards with captions
- **Impact in Motion**: Key statistics — 120+ Community Drills, 45 Youth-Led Teams, 3000+ Lives Reached
- **Explore Our Organization**: Featured cards for History of Scouting, Scouts & SDGs, Our Leaders, and Jasiri Rover Scouts
- **Stories on the Move**: Scrollable tiles covering Emergency Prep Hubs, Volunteer Spotlights, and Partnerships
- **Latest from Our Socials**: Embedded Instagram, TikTok, and Facebook content
- **Our Partners**: Infinite scrolling marquee of partner organization names

### 4.2 Navigation

#### Header
The website header provides navigation to all main sections:

> **Home** · **About** · **Projects** · **Events** · **Gallery** · **Shop** · **Community** · **FAQ** · **Contact** · **Join**

Additional header features:
- **Dark/Light Mode Toggle**: Click the theme button to switch between dark and light mode. Your preference is saved in your browser.
- **Mobile Menu**: On smaller screens, a hamburger icon opens a full navigation drawer.

#### Footer
The footer includes:
- **Quick Links**: Home, About, Projects, Events, Gallery
- **Contact Info**: Email (scoutsemergencyresponse@gmail.com), phone (+254 742 435 314), WhatsApp direct link
- **Social Media**: Links to all social platforms
- **Floating Action Button (FAB)**: A floating button for quick access to key actions

### 4.3 About Page

Navigate to `/about` to learn about the organization:

- **Mission Statement** and featured quote block
- **Our Pillars**: Vision, Mission, Goal, and Objective cards
- **Our Story**: History of SER's founding in response to the 2024 Muradi Embakasi gas explosion and severe floods in Kenya
- **Core Values**: Service Above Self, Preparedness & Action, Teamwork & Trust, Youth-Led & Impact-Driven
- **Our Team**: Profile cards with photos, roles, and names of leadership
- **TikTok Integration**: Embedded content from @scouts.emergency
- **Get Involved CTA**: Links to Projects and Contact pages

### 4.4 Reading the Blog

Navigate to `/blog` to see all published blog posts:

- Posts are displayed in a **responsive card grid** with cover images, titles, and publication dates
- Click **"Read article"** on any card to open the full post at `/blog/[slug]`
- Each article displays: title, cover image, publication date, and full markdown-rendered body
- An empty state with a graphic is shown when no posts exist
- Blog content is automatically cached and refreshed every 60 seconds

### 4.5 Viewing Events

Navigate to `/events` to see all events:

- **Historic Milestones Timeline**: Key scouting history dates — 1907 Brownsea Island, 1908 Handbook, 1920 Jamboree, Feb 22 Founder's Day
- **Upcoming SER Events**: Event cards showing title, date, venue/location, and description
- **"Ask to Join" Button**: Links to the Contact page for event inquiries
- **"Add to Calendar" Button**: Generates a Google Calendar link to add the event directly to your calendar
- **Stay Updated CTA**: Links to Contact and Projects pages

### 4.6 Browsing the Gallery

Navigate to `/gallery` to view the photo gallery:

- Photos displayed in a **media grid** layout
- **Hover Overlays**: Hovering over an image reveals a card with the title, description, and "View Image" action
- **Lazy Loading**: Images load progressively as you scroll for better performance
- Hidden items are automatically filtered out
- **CTA Footer**: "Want to Be Part of These Moments?" with links to Events and Contact pages

### 4.7 Browsing the Shop

Navigate to `/shop` to see available products/merchandise:

- **Featured Products Grid**: Product cards with photos, titles, prices in **KES** (Kenyan Shillings), and descriptions
- **Bulk Order Inquiry**: A call-to-action encouraging Scout groups/events to inquire about bulk orders via the Contact page

### 4.8 Projects

Navigate to `/projects` to view the project portfolio:

- **Ongoing & Past Projects Grid**: Cards showing project title, focus area, description, and custom action button/link
- **School & Community Outreach CTA**: Links to Contact and Events pages for inquiries

### 4.9 Community

Navigate to `/community` for the community hub:

- **Tab Navigation**: Switch between two views:
  1. **Community Overview Tab**:
     - "What Our Community Does" — 3 cards: Knowledge Sharing, Volunteer Engagement, Storytelling & Impact
     - "Be Part of the Action" CTA with links to Projects, Contact, and Sign Up
  2. **Blog Posts Tab**:
     - Integrated blog post grid showing recent community articles

### 4.10 Submitting a Membership/Volunteer Application

Navigate to `/join` to apply for membership. This is a comprehensive **8-step registration workflow**:

| Step | Section | Fields |
|------|---------|--------|
| 1 | **Personal Details** | Full Name, Email, Phone (07/01 format), ID Number, Date of Birth, Gender, Blood Type |
| 2 | **Address & Residence** | Current Residence (Sub-county & County), Other Address |
| 3 | **Next of Kin** | Full Name, Phone Number |
| 4 | **Scouting & Education** | Scout status (Yes/No), Highest Education Level, Scout Crew details |
| 5 | **Experience & Training** | Multi-select checkboxes: First Aid, Disaster Management, Medical/Health, or None; Certifications |
| 6 | **Preparedness & Availability** | Community disaster readiness, Availability dropdown, Willingness to participate |
| 7 | **Goals & Recommendations** | Why Join SER, Hope to Contribute, 2026 Calendar Recommendations, Member Goals |
| 8 | **Declaration** | Terms & legal declaration agreement checkbox |

**Application Workflow:**

1. **Fill** → Complete all 8 sections (each section is validated before advancing)
2. **Proofread** → Review a complete summary of all your answers with the ability to edit any response
3. **WhatsApp** → Option to join the official SER WhatsApp Group, or skip
4. **Success** → Confirmation screen with option to "Register Another Member"

> **Note**: Your application is stored securely and reviewed by a Super Admin.

### 4.11 Contacting the Organization

Navigate to `/contact` to get in touch:

**Contact Form:**

| Field | Required | Description |
|-------|:--------:|-------------|
| Name | ✅ | Your full name |
| Email | ✅ | Your email address |
| Phone | ❌ | Your phone number (optional) |
| Message | ✅ | Your message content |

- The form includes built-in spam protection (honeypot field)
- After submission you'll see a green success message with a "Send Another Message" button
- Error alerts appear in red if submission fails

**Other Ways to Reach SER:**
- **Email**: scoutsemergencyresponse@gmail.com
- **Phone (Local)**: +254 742 435 314
- **WhatsApp**: Direct chat link
- **Social Media**: Links to all platforms

### 4.12 Frequently Asked Questions

Navigate to `/faq` to browse commonly asked questions:

- Questions displayed in an **accordion-style** UI — click a question to expand and see the answer
- FAQ data is managed dynamically by admins
- Schema.org `FAQPage` structured data is included for SEO / search engine rich snippets
- "Still Have Questions?" CTA links to the Contact and Events pages

---

## 5. Registered User Guide

### 5.1 Creating an Account

1. Navigate to `/login/signup`
2. Fill in the registration form:

| Field | Required | Description |
|-------|:--------:|-------------|
| Full Name | ✅ | Your full name |
| Email | ✅ | Your email address |
| Password | ✅ | A secure password |
| Confirm Password | ✅ | Re-enter your password |

3. Click **Create Account**
4. If the email is already registered, you will receive an error — use a different email or log in instead

> **Important**: Registration creates a **regular user** account, not an admin account. Admin accounts must be created by a Super Admin.

### 5.2 Logging In

1. Navigate to `/login`
2. Enter your **email** and **password**
3. Click **Sign In**

After logging in, you receive a JWT token valid for **8 hours**.

### 5.3 What Registered Users Can Do

Currently, registered users have the same browsing capabilities as public visitors. Your account is intended for:

- Future community features and interactions
- Personalized content delivery
- Comment systems or engagement features as they are developed

---

## 6. Author Guide

Authors are users with the **"Author"** role assigned in Firestore by a Super Admin. This role grants access to the admin dashboard's **Blog Management** section.

### 6.1 Accessing the Admin Dashboard

1. Navigate to `/login`
2. Log in with your credentials
3. You will be redirected to the admin dashboard at `/admin`
4. You will see the **Blog** tab available in the sidebar/navigation

### 6.2 Managing Blog Posts

As an Author, you have full control over blog posts:

#### Creating a New Post

1. In the Blog tab, click **"New Post"** or the **"+"** button
2. Fill in the post form:

| Field | Required | Description |
|-------|:--------:|-------------|
| Title | ✅ | The blog post headline |
| Slug | Auto-generated | URL-friendly identifier (auto-generated from title via `slugify`, but editable) |
| Cover Image | ❌ | Upload a cover image (via Cloudinary/S3, max **10 MB**, image files only) |
| Body (Markdown) | ✅ | The full article content in Markdown format |
| Published | ✅ | Toggle to publish or save as draft |
| Tags | ❌ | Add tags/categories for filtering |

3. Click **Save** or **Publish** to create the post

> **Note**: The slug must be unique across all posts. If a slug collision is detected, you will receive an error — modify the slug and try again.

#### Editing an Existing Post

1. In the Blog tab, find the post you want to edit
2. Click the **Edit** button (pencil icon)
3. Modify any fields in the editor
4. Click **Save** to apply changes
5. The `updated_at` timestamp is automatically refreshed

#### Publishing / Unpublishing a Post

- Toggle the **Published** switch to control visibility:
  - **Published (ON)**: Post is visible on the public blog and community page
  - **Unpublished/Draft (OFF)**: Post is saved but NOT visible to public visitors
- Hidden posts can also be managed via the `hidden` flag

#### Deleting a Post

1. Find the post you want to delete
2. Click the **Delete** button (trash icon)
3. **Confirm** the deletion in the confirmation dialog

> ⚠️ **Warning**: Deletion is **permanent**. There is no undo. The post is removed from Firestore entirely.

#### Uploading Images

- Use the **image upload** feature when editing a post
- Supported formats: JPEG, PNG, WebP, and other image types (`image/*`)
- **Maximum file size**: 10 MB
- Uploaded images are stored in S3/Cloudinary and the URL is returned for insertion into your post

### 6.3 What Authors Cannot Do

- ❌ Manage site content (hero section, about section, etc.)
- ❌ Manage events, gallery, products, or projects
- ❌ View or manage member applications
- ❌ Create, edit, or delete admin users
- ❌ Change other users' roles or passwords

---

## 7. Project Lead Guide

Project Leads have the **"Project Lead"** role assigned in Firestore by a Super Admin. Their admin dashboard capabilities are equivalent to the Author role.

### 7.1 Capabilities

Project Leads have the same admin dashboard access as Authors:

- ✅ **Blog Post Management**: Create, edit, publish/unpublish, and delete blog posts
- All workflows described in the [Author Guide](#6-author-guide) apply equally to Project Leads

### 7.2 What Project Leads Cannot Do

Same restrictions as Authors:

- ❌ Manage site content collections
- ❌ Manage events, gallery, products, or projects
- ❌ View or manage member applications
- ❌ Create, edit, or delete admin users
- ❌ Change other users' roles or passwords

---

## 8. Super Admin Guide

Super Admins have **complete control** over the entire SER platform. This is the most powerful role and should be assigned only to trusted administrators.

### 8.1 Accessing the Admin Dashboard

1. Navigate to `/login`
2. Log in with your admin credentials
3. You will be redirected to the admin dashboard at `/admin`
4. You will see **all tabs** available in the sidebar

### 8.2 Admin Dashboard Tabs Overview

| Tab | Description |
|-----|-------------|
| **Site Content** | Manage hero section, about text, features, social media posts, partners, and all static content |
| **Blog** | Full blog post management (same as Author) |
| **Events** | Create, edit, and delete events (syncs with Google Calendar) |
| **Gallery** | Upload and manage gallery images with categories |
| **Projects** | Add and manage organization projects |
| **Products** | Manage shop products/merchandise |
| **FAQs** | Create and manage FAQ entries |
| **Members** | View and manage membership/volunteer applications |
| **Users** | Create and manage admin users and assign roles |
| **Settings** | Account settings and password management |

---

### 8.3 Managing Site Content

The **Site Content** tab manages dynamic content that appears across the public website.

1. Select the **Site Content** tab
2. Edit the content sections — these are stored in the Firestore `site_content` collection (document: `main`)
3. Editable content includes:
   - **Hero section**: Heading, subheading, CTA button text
   - **Feature list**: Service pillar descriptions
   - **Ground moments**: On-the-ground media captions
   - **Social media post URLs**: Instagram, TikTok, Facebook embed links
   - **Partner list**: Partner organization names for the marquee
   - **Site metadata**: SEO titles, descriptions, and navigation items
   - **Team members**: Leader profiles (name, role, image)
   - **Contact info**: Email, phone numbers, WhatsApp link, social media handles
4. Click **Save** to publish changes

> Changes are reflected on the public website immediately (with SSR cache revalidation).

---

### 8.4 Managing Blog Posts

Super Admins have the same blog management capabilities as Authors and Project Leads. See [Author Guide — Managing Blog Posts](#62-managing-blog-posts) for detailed instructions.

**Additional Super Admin blog capabilities:**
- Access to the `GET /api/posts/all` endpoint which returns **all** posts including drafts and hidden items
- Ability to manage posts created by any user (Author, Project Lead, or other Super Admins)

---

### 8.5 Managing Events

Events are stored in Firestore and can optionally sync with Google Calendar.

#### Creating an Event

1. Navigate to the **Events** tab
2. Click **"Add Event"** or the **"+"** button
3. Fill in the event form:

| Field | Required | Description |
|-------|:--------:|-------------|
| Title | ✅ | Event name/title |
| Event Date | ✅ | Date of the event |
| Location | ✅ | Event venue/location |
| Description | ❌ | Detailed event description |

4. Click **Save** to create the event
5. The event is automatically synced to Google Calendar (a `google_event_id` is generated)

#### Editing an Event

1. Find the event in the list
2. Click the **Edit** button
3. Modify the fields
4. Click **Save**

#### Deleting an Event

1. Find the event in the list
2. Click the **Delete** button
3. Confirm deletion

> Events appear on the public `/events` page. The system first tries to fetch from Google Calendar; if unavailable, it falls back to the PostgreSQL database.

---

### 8.6 Managing the Gallery

Gallery items are stored in PostgreSQL and displayed on the public `/gallery` page.

#### Adding a Gallery Image

1. Navigate to the **Gallery** tab
2. Click **"Add Image"** or the **"+"** button
3. Fill in the details:

| Field | Required | Description |
|-------|:--------:|-------------|
| Title | ✅ | Image title/caption |
| Image URL | ✅ | Upload an image (via Cloudinary/S3) or provide a URL |
| Category | ❌ | Category for filtering on the public gallery |
| Featured | ❌ | Toggle to mark as featured (featured items appear first) |

4. Click **Save**

#### Sorting Behavior

Gallery items are automatically sorted by:
1. **Featured items first** (descending)
2. **Newest items first** (by `created_at`, descending)

#### Editing / Deleting Gallery Images

- Use the **Edit** and **Delete** buttons on each gallery item
- Confirm deletion when prompted
- Items can be hidden from the public gallery without deletion

---

### 8.7 Managing Projects

Projects are stored in the Firestore `projects` collection.

#### Adding a Project

1. Navigate to the **Projects** tab
2. Click **"Add Project"** or the **"+"** button
3. Fill in the project details:
   - **Title**: Project name
   - **Focus Area**: The project's focus/domain
   - **Description**: Detailed project description
   - **Link**: Custom action URL/button link
4. Click **Save**

#### Editing / Deleting Projects

- Use the **Edit** and **Delete** buttons on each project
- Changes are reflected on the public `/projects` page immediately

---

### 8.8 Managing Products (Shop)

Products are stored in PostgreSQL and displayed on the public `/shop` page.

#### Adding a Product

1. Navigate to the **Products** tab
2. Click **"Add Product"** or the **"+"** button
3. Fill in the product form:

| Field | Required | Description |
|-------|:--------:|-------------|
| Name | ✅ | Product name |
| Price (KES) | ✅ | Price in Kenyan Shillings (must be ≥ 0) |
| Image URL | ❌ | Product image (uploaded via Cloudinary/S3) |
| Description | ❌ | Product description |
| Featured | ❌ | Toggle to mark as featured (featured items appear first) |

4. Click **Save**

#### Sorting Behavior

Products are automatically sorted by:
1. **Featured items first** (descending)
2. **Newest items first** (by `created_at`, descending)

> **Note**: Only **featured** products are shown on the public `/shop` page.

#### Editing / Deleting Products

- Use the **Edit** and **Delete** buttons on each product
- Confirm deletion when prompted

---

### 8.9 Managing FAQs

FAQs are stored in the Firestore `faqs` collection and displayed on the public `/faq` page.

#### Adding a FAQ Entry

1. Navigate to the **FAQs** tab
2. Click **"Add FAQ"** or the **"+"** button
3. Enter the **Question** and **Answer**
4. Click **Save**

#### Editing / Deleting FAQ Entries

- Use the **Edit** and **Delete** buttons on each FAQ
- Changes appear on the public `/faq` page immediately
- FAQ structured data (Schema.org) is automatically updated for SEO

---

### 8.10 Managing Member Applications

The **Members** tab shows all membership/volunteer applications submitted through the `/join` page.

1. Navigate to the **Members** tab
2. View the list of all submitted applications, sorted by submission date (newest first)
3. Each application includes:

| Field | Description |
|-------|-------------|
| Full Name | Applicant's first, middle, and last name |
| County | County of residence |
| Sub-County | Sub-county of residence |
| Crew | Scout crew/group affiliation |
| Blood Type | Blood type (if provided) |
| Email | Contact email address |
| WhatsApp | WhatsApp phone number |
| Submitted At | Application submission date/time |

**Additional fields from the full 8-step form:**
- ID Number, Date of Birth, Gender
- Next of Kin details
- Scouting & Education background
- Experience & Training (First Aid, Disaster Management, Medical/Health)
- Certifications
- Availability and willingness
- Goals and recommendations
- Declaration acceptance

> **Security Note**: Only Super Admins can view member applications. This data is protected at both the Firestore rules level and the API middleware level.

---

### 8.11 Managing Users & Roles

This is one of the most critical Super Admin functions. The **Users** tab allows you to manage all admin users and their roles.

#### Viewing All Users

1. Navigate to the **Users** tab
2. See a list of all users with their:
   - Name / Email
   - Current Role
   - Account creation date

#### Creating a New Admin User

1. Click **"Add User"** or the **"+"** button
2. Fill in the form:

| Field | Required | Description |
|-------|:--------:|-------------|
| Email | ✅ | The new user's email address |
| Password | ✅ | A secure initial password |
| Role | ✅ | Select one: **Super admin**, **Author**, or **Project Lead** |

3. Click **Create** to add the user

> **Important**: Instruct the new user to change their password after first login via the Settings/Change Password screen.

#### Editing a User's Role

1. Find the user in the list
2. Click **Edit** or the role dropdown
3. Select the new role: **Super admin**, **Author**, or **Project Lead**
4. Save the changes

#### Deleting a User

1. Find the user in the list
2. Click the **Delete** button
3. Confirm deletion

> ⚠️ **Caution**: Deleting a user is **permanent** and cannot be undone. The user will immediately lose all access. **Never delete the last Super Admin account** — this would lock everyone out of administrative functions.

---

### 8.12 Changing Your Password

1. Navigate to the **Settings** tab or click on your profile
2. Select **"Change Password"**
3. Fill in the form:

| Field | Required | Description |
|-------|:--------:|-------------|
| Current Password | ✅ | Your existing password (for verification) |
| New Password | ✅ | Your new desired password |
| Confirm New Password | ✅ | Re-enter the new password |

4. Click **Save** / **Update Password**

**Requirements:**
- The new password must be different from the current password
- Both new password fields must match

---

## 9. Logging In & Authentication

### 9.1 Login Page

1. Navigate to `/login`
2. Enter your **email address**
3. Enter your **password**
4. Click **Sign In**

### 9.2 How Login Works

The login system checks credentials in the following order:

1. **Admin check first**: The system checks if the email belongs to an admin account (in the `admins` database table)
2. **User fallback**: If no admin is found, it checks the regular `users` table
3. A **JWT token** is issued on successful login, valid for **8 hours**
4. The token payload contains:
   - `id`: Your user ID
   - `email`: Your email address
   - `role`: Either `"admin"` or `"user"`
   - `full_name`: Your full name (regular users only)

### 9.3 Session Expiry

- Your session expires after **8 hours** from the initial login
- When your session expires, API calls will return `401 Unauthorized`
- You will be redirected to the login page — simply log in again to continue

### 9.4 Accessing Protected Pages

- The admin dashboard (`/admin`) requires authentication with an admin role
- If you access `/admin` without logging in, you will be redirected to `/login`
- After successful login, you will be redirected back to the admin dashboard
- Regular users (`role: "user"`) will **not** be granted access to the admin dashboard

### 9.5 Sign Up (New Account Registration)

1. Navigate to `/login/signup`
2. Fill in: Full Name, Email, Password, Confirm Password
3. Click **Create Account**
4. You will be registered as a **regular user** (not an admin)
5. Navigate to `/login` to sign in with your new credentials

---

## 10. Troubleshooting & FAQ

### Common Issues

#### "Invalid credentials" error when logging in
- Double-check your email and password
- Email addresses are **case-insensitive** (automatically converted to lowercase)
- If you've forgotten your password, contact a Super Admin to reset it or create a new account for you

#### Cannot access the admin dashboard
- Ensure you logged in with an **admin** account (not a regular user account)
- Regular users (`role: "user"`) do not have admin dashboard access
- Contact a Super Admin to create an admin account or assign you an admin role

#### Cannot see certain tabs in the admin dashboard
- Only **Super Admins** can see all tabs (Site Content, Events, Gallery, Projects, Products, FAQs, Members, Users, Settings)
- **Authors** and **Project Leads** can only see the **Blog** tab
- Contact a Super Admin to upgrade your role if you need access to additional sections

#### Blog post not appearing on the public website
- Check that the post's **Published** toggle is set to **ON**
- Verify the post is **not marked as hidden**
- Unpublished/hidden posts are only visible in the admin dashboard's "All Posts" view
- Blog data is cached — it may take up to **60 seconds** to refresh on the public site

#### Slug collision error when creating/editing a blog post
- Each blog post must have a **unique slug**
- Modify the slug field to use a different URL-friendly identifier
- The system auto-generates slugs from titles using `slugify`, but you can customize them

#### Image upload fails
- Ensure the file is a supported **image format** (JPEG, PNG, WebP, etc.)
- **Maximum file size**: 10 MB
- Non-image files (PDFs, videos, etc.) are rejected
- Check with your system administrator if Cloudinary/S3 credentials are correctly configured

#### "Missing token" or "Invalid token" error
- Your session has expired (tokens last **8 hours**)
- Log out and log in again to get a fresh token
- Clear your browser cache/cookies if the issue persists

#### Member application form not submitting
- Ensure **all required fields** in each step are filled in before advancing
- The "None of the above" checkbox in Experience & Training is mutually exclusive with other options
- Check that your email hasn't been used in a previous application (emails must be unique — error code `409`)
- Ensure you've accepted the **Declaration** checkbox in Step 8
- Try refreshing the page and re-submitting

#### Contact form not sending
- Ensure Name, Email, and Message fields are filled in
- The form uses a third-party service (SplitForms) — check your internet connection
- If you see a red error alert, try again in a few moments
- As an alternative, use the direct email, phone, or WhatsApp contact methods listed on the page

#### Events not showing on the public page
- Events are fetched from **Google Calendar** first; if unavailable, the system falls back to the PostgreSQL database
- If no events appear, verify that events have been created in the admin dashboard
- Check that event dates are correct

#### Dark mode not saving
- Theme preference is stored in your browser's `localStorage` under the key `"ser-theme"`
- Clearing browser data will reset your preference
- The toggle is available in the header on every page

---

### API Endpoint Quick Reference (For Developers)

| Method | Endpoint | Auth Required | Description |
|--------|----------|:------------:|-------------|
| `GET` | `/api/health` | ❌ | Server health check |
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login (admin or user) |
| `GET` | `/api/auth/me` | ✅ Bearer | Get current user info |
| `GET` | `/api/posts` | ❌ | Get published posts |
| `GET` | `/api/posts/all` | ❌* | Get all posts (including drafts) |
| `GET` | `/api/posts/slug/:slug` | ❌ | Get single post by slug |
| `POST` | `/api/posts` | ✅ Admin | Create a new post |
| `PUT` | `/api/posts/:id` | ✅ Admin | Update a post |
| `DELETE` | `/api/posts/:id` | ✅ Admin | Delete a post |
| `GET` | `/api/events` | ❌ | Get all events |
| `POST` | `/api/events` | ✅ Admin | Create an event |
| `GET` | `/api/gallery` | ❌ | Get gallery items |
| `POST` | `/api/gallery` | ✅ Admin | Add a gallery item |
| `GET` | `/api/members` | ❌* | Get all member applications |
| `POST` | `/api/members` | ❌ | Submit a member application |
| `GET` | `/api/products` | ❌ | Get all products |
| `POST` | `/api/products` | ✅ Admin | Add a product |
| `POST` | `/api/upload` | ✅ Admin | Upload an image (max 10 MB) |

*\* These endpoints are currently public but are intended for admin use. Firestore rules provide additional protection on the database layer.*

---

### Firestore Security Rules Summary

| Collection | Public Read | Write Access |
|-----------|:----------:|:------------:|
| `users` | Own record only | Super Admin only |
| `site_content` | ✅ | Super Admin only |
| `projects` | ✅ | Super Admin only |
| `gallery` | ✅ | Super Admin only |
| `faqs` | ✅ | Super Admin only |
| `posts` | ✅ | Super Admin, Author, or Project Lead |
| `members` | Super Admin only | Super Admin only |
| `events` | ✅ | Super Admin only |
| `products` | ✅ | Super Admin only |

---

> **Need help?** Contact your system administrator or Super Admin for assistance with account issues, role changes, or technical problems.
>
> **Email**: scoutsemergencyresponse@gmail.com
> **WhatsApp**: +254 742 435 314
