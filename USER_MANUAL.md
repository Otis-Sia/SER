# SER Platform — User Manual

> **Version 1.1** · Last updated: August 2026
> Scout's Emergency Response — *Compassion in Action*

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Platform Overview](#2-platform-overview)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Public Visitor Guide](#4-public-visitor-guide)
5. [Registered User Guide](#5-registered-user-guide)
6. [Author Guide](#6-author-guide)
7. [Events Manager Guide](#7-events-manager-guide)
8. [Communication Guide](#8-communication-guide)
9. [Project Lead Guide](#9-project-lead-guide)
10. [Super Admin Guide](#10-super-admin-guide)
11. [Logging In & Authentication](#11-logging-in--authentication)
12. [Troubleshooting & FAQ](#12-troubleshooting--faq)

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
| **Cloud Database** | Supabase (PostgreSQL) | Stores site content, projects, FAQs, gallery, user roles, blog posts |
| **Authentication** | Supabase Auth + Server Actions | Login, token-based sessions (8-hour expiry) |
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

SER supports **role-based access control** and **custom tab overrides** managed by Super Admins:

| Role | Login Required | Admin Dashboard | Blog Posts | Form Responses | Site Content & Collections | User & Role Management |
|------|:-------------:|:---------------:|:----------:|:--------------:|:--------------------------:|:----------------------:|
| **Public Visitor** | ❌ | ❌ | Read only | Submit only | Read only | ❌ |
| **Registered User** | ✅ | ❌ | Read only | Submit only | Read only | ❌ |
| **Author** | ✅ | ✅ | ✅ Create / Edit | ❌ | ❌ | ❌ |
| **Events** | ✅ | ✅ | ✅ Write / Edit | ❌ | ❌ (Events only) | ❌ |
| **Communication** | ✅ | ✅ | ❌ | ❌ | ✅ Socials & Contacts | ❌ |
| **Admin** | ✅ | ✅ | ✅ Create / Edit | ✅ View / Flag | ✅ Limited | ❌ View only |
| **Project Lead** | ✅ | ✅ | ✅ Full CRUD | ✅ View / Delete / Flag | ✅ Most collections | ❌ View only |
| **Super Admin** | ✅ | ✅ Full access | ✅ Full CRUD | ✅ Full CRUD / Edit | ✅ Full CRUD | ✅ Full CRUD + Custom Tabs |

### Role Hierarchy

```
┌───────────────────────────────────────────────────────────────┐
│                     SER ROLE HIERARCHY                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Super Admin ─────────── Full platform control                │
│       │                  • All content & collections           │
│       │                  • User & role management              │
│       │                  • Custom tab overrides                │
│       │                  • Member applications                 │
│       │                                                       │
│  Project Lead ─────────── Platform management                 │
│       │                   • Create / Edit / Delete content     │
│       │                   • Manage member registrations        │
│       │                                                       │
│  Events ───────────────── Event management                    │
│       │                   • Create / Edit Events               │
│       │                   • Manage Historic Milestones         │
│       │                                                       │
│  Communication ────────── Communication & media               │
│       │                   • Social media embeds & handles      │
│       │                   • Contact details & gallery media    │
│       │                                                       │
│  Author ───────────────── Blog post management                │
│       │                   • Create / Edit / Delete posts       │
│       │                   • Upload gallery media               │
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

---

## 4. Public Visitor Guide

As a public visitor, you can access all content on the SER website without creating an account.

### 4.1 Home Page
- **Hero Section**: Dynamic heading, subheading, and CTA button.
- **Why Scout's Emergency Response?**: Core focus on youth emergency preparedness with "Request Training" button linking to Contact page.
- **About Us Summary**: Narrative overview of SER's origins and gradient badge *"SER — Compassion in Action"*.
- **What We Do**: 4-card grid highlighting key service pillars.
- **On-the-Ground Moments**: Infinite horizontal scrolling gallery of media cards with captions.
- **Latest from Our Socials**: Embedded Instagram, TikTok, and Facebook content.
- **Our Partners**: Infinite scrolling marquee of partner organization names.

### 4.2 Navigation
- **Header**: Quick navigation links, Light/Dark mode toggle, and mobile menu drawer.
- **Footer**: Quick links, email, phone, WhatsApp direct link, and social icons.

### 4.3 Membership & Contact Forms
- **Join / Volunteer Application (`/join`)**: 8-step application form covering Personal Details, Address, Next of Kin, Scouting Background, Experience, Preparedness, Goals, and Declaration.
- **Contact Form (`/contact`)**: Name, Email, Phone, Message with honeypot spam protection.

---

## 5. Registered User Guide

Registered users create accounts via `/login/signup` or `/login`.
- Account allows access to future community interaction tools.
- Logging in grants a session token valid for **8 hours**.

---

## 6. Author Guide

Authors manage **blog posts** and upload **gallery** media.

### 6.1 Blog Post Management
1. Click **Blog Posts** in the sidebar.
2. Click **New Post**.
3. Fill in Title, Slug, Cover Image, and Body (Markdown).
4. Toggle **Published** to publish immediately or save as draft.
5. Click **Save**.

---

## 7. Events Manager Guide

Events managers handle event scheduling, historic milestones, and manage gallery photos.

1. **Creating Events**: Go to **Events** tab $\rightarrow$ **Add Event** $\rightarrow$ Enter Title, Date, Location, Description. Auto-syncs to Google Calendar.
2. **Historic Milestones**: Go to **Events** tab $\rightarrow$ **Historic Milestones & Timeline** $\rightarrow$ Add or edit milestones and toggle Active status $\rightarrow$ Save.

---

## 8. Communication Guide

Communication managers manage public media, social links, contact info, and gallery.

1. **Social Media Embeds**: Go to **Socials** tab $\rightarrow$ Paste embed HTML code from TikTok, Instagram, or Facebook into the embed field $\rightarrow$ Click **Save Changes**.
2. **Contact Information**: Update contact phone numbers, emails, and WhatsApp handles.

---

## 9. Project Lead Guide

Project Leads oversee platform operations across form responses, blog posts, events, gallery, projects, products, and FAQs.

- **Form Responses**: View, filter by county, export to CSV, flag restricted members, or delete responses.
- **Projects & Shop**: Create/edit projects and featured products.
- **Content Moderation**: Flag/unflag members and hide/unhide gallery items.

---

## 10. Super Admin Guide

Super Admins have full administrative authority over the entire platform.

### 10.1 Role Management & Custom Tab Overrides
Super Admins can grant custom tab visibility to individual users:
1. Navigate to **Role Management**.
2. Click **Edit Tabs** next to a user.
3. Select/deselect tabs (Form Responses, Blogs, Users, Projects, Events, Gallery, FAQ, Products, Contacts, Socials, History).
4. Click **Save Custom Tabs**.

### 10.2 User Account Management
1. Navigate to **Users**.
2. Click **Add User** $\rightarrow$ Fill Email, Password, and Role (Super Admin, Project Lead, Author, Admin, Communication, Events) $\rightarrow$ **Create**.
3. Edit or delete admin accounts.

### 10.3 Full Content & Collection CRUD
Manage site-wide JSON content, FAQs, products, projects, events, blog posts, and member applications.

---

## 11. Logging In & Authentication

1. Navigate to `/admin`.
2. Enter your email address or username and password.
3. Click **Sign In**.
4. Sessions expire after **8 hours**.
5. Guest visitors viewing `/admin` see a guest login screen with a scrollable **Guest User Manual**.

---

## 12. Troubleshooting & FAQ

| Issue | Cause & Solution |
|-------|─────────────────|
| *"Invalid email or password"* | Check credentials. Usernames or emails are case-insensitive. Contact Super Admin for password resets. |
| *Missing tabs in sidebar* | Roles restrict tab access. Super Admins can grant custom tab overrides via Role Management. |
| *Blog post not appearing on public site* | Ensure **Published** is ON and the post is not hidden. Cache refreshes within 60 seconds. |
| *Image upload error* | Max file size is **10 MB**. File must be an image type (`image/*`). |
| *"Account restricted"* | Your account was flagged. Contact a Super Admin to unflag your account. |

---

> **Need help?** Contact your system administrator or Super Admin.
> **Email**: admin@seresponse.org | **WhatsApp**: +254 742 435 314 / +254 718 612 549
