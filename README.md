# Scouts Emergency Response (SER) Platform

> **Compassion in Action** — A community-driven web platform and management portal for emergency preparedness and volunteer response in Kenya.

---

## 🌐 Live Deployments

| Component | Provider | Live URL |
| :--- | :--- | :--- |
| **Frontend Website** | Cloudflare (OpenNext) | [https://seresponse.org](https://seresponse.org) <br> *(Preview: [ser-client.elvissia2.workers.dev](https://ser-client.elvissia2.workers.dev))* |
| **Backend REST API** | Cloudflare Workers (Hono) | [https://api.seresponse.org](https://api.seresponse.org) <br> *(Preview: [ser-worker.elvissia2.workers.dev](https://ser-worker.elvissia2.workers.dev))* |

---

## 🏗️ Architecture & Monorepo Structure

This project is organized as an npm workspaces monorepo:

```text
├── client/              # Next.js 16 (React 19) Frontend App Router
│   ├── src/app/         # Public pages & Admin dashboard
│   ├── src/components/  # UI components
│   ├── open-next.config.ts  # OpenNext Cloudflare configuration
│   └── wrangler.jsonc   # Cloudflare deployment settings
├── worker/              # Cloudflare Workers Backend API
│   ├── src/routes/      # Hono API endpoints (auth, posts, events, gallery, members, reports)
│   ├── src/middleware/  # JWT & Admin role verification
│   └── wrangler.jsonc   # Worker configuration & bindings
├── server/              # Express.js backend service (PostgreSQL & S3)
├── .github/workflows/   # CI/CD pipelines (Auto-deploy on git push)
└── deploy-cloudflare.sh # One-click full deployment script
```

---

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Framer Motion, Lucide Icons
- **Edge Backend**: Hono on Cloudflare Workers (`nodejs_compat`)
- **Database**: PostgreSQL & Supabase
- **Authentication**: JWT & Role-Based Access Control (Admin, Author, Events Manager)
- **Media Storage**: AWS S3 / Supabase Storage
- **Deployment & CI/CD**: Cloudflare Workers, OpenNext, GitHub Actions

---

## 🛠️ Local Development

### 1. Prerequisites
- Node.js `>= 22.0.0`
- npm `>= 10.0.0`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Otis-Sia/SER.git
cd SER

# Install all workspace dependencies
npm install
```

### 3. Run Development Servers
```bash
# Run both Frontend and Backend concurrently
npm run dev

# Or run individual workspaces:
npm run dev --workspace=client    # Next.js at http://localhost:3000
npm run dev --workspace=worker    # Hono API at http://localhost:8787
```

---

## 🚢 Deployment

### Continuous Deployment (GitHub Actions)
Deployments are fully automated via GitHub Actions:
- Any `git push origin main` triggers [`.github/workflows/deploy-cloudflare.yml`](.github/workflows/deploy-cloudflare.yml).
- Automatically builds and deploys both **`ser-worker`** and **`ser-client`** to Cloudflare.

### One-Click CLI Deployment
You can also deploy manually using the automated deployment script:

```bash
# Syncs environment secrets, builds, and deploys both projects
./deploy-cloudflare.sh

# Or via npm script:
npm run deploy:cf
```

---

## 📄 Documentation

For the full user manual and platform administration guidelines, see [USER_MANUAL.md](USER_MANUAL.md).

---

## 📜 License

Private repository © Scouts Emergency Response. All rights reserved.
