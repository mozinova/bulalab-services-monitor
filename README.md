<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/logo_h_white.webp">
    <img src="./public/logo_h.webp" alt="BulaLab Status" height="48">
  </picture>
</p>

<h3 align="center">BulaLab Status</h3>

<p align="center">
  Open-source service monitoring with uptime tracking, incident reports, and email alerts.
  <br />
  <a href="https://status.withkaya.com"><strong>Live Demo »</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/Astro-6-FF5D01?logo=astro" alt="Astro">
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

---

## Overview

BulaLab Status is a self-hostable status page that monitors your services (HTTP/HTTPS and SIP), tracks uptime and downtime, and notifies subscribers via email when incidents occur.

It features a minimal, flat design with dark mode support, 30-day uptime timeline bars, and a complete incident management system.

## Features

- **Service Monitoring** — Periodic checks of HTTP and SIP endpoints
- **30-Day Uptime Timeline** — Visual bar chart per service with day-level granularity
- **Incident Tracking** — Automatic creation of downtime reports with timestamps, duration, and error details
- **Email Subscriptions** — Users can subscribe to get alerts; verification via code
- **Automatic Email Alerts** — Notifications sent on DOWN → RESOLVED transitions
- **CLI Tool** — Add, remove, and create reports from the command line
- **Dark / Light Mode** — Pure black dark mode, persisted to localStorage
- **Mobile Responsive** — Adaptive navigation with hamburger menu
- **SSR + SEO** — Server-side rendered pages with sitemap, robots.txt, OG tags, and canonical URLs
- **Multiple Deployment Options** — Node.js standalone, Vercel, or Cloudflare Workers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build) 6 (SSR) |
| UI | [React](https://react.dev) 19 + [Tailwind CSS](https://tailwindcss.com) 4 |
| Database | PostgreSQL (via [Prisma](https://prisma.io) 7) |
| Email | Cloudflare Email Service (REST API) |
| Runtime | Node.js 22+ / Bun |
| Language | TypeScript |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) or Node.js 22+
- PostgreSQL database (local or remote — [Neon](https://neon.tech), [Supabase](https://supabase.com), [Aiven](https://aiven.io), etc.)

### 1. Clone and install

```bash
git clone https://github.com/your-org/status.git
cd status
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your database connection string and secrets:

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
CRON_SECRET="generate-a-random-secret"
STATUS_API_BASE_URL="http://localhost:4321"
```

### 3. Generate Prisma client and run migrations

```bash
bun x prisma generate
bun x prisma db push
```

### 4. Start the dev server

```bash
bun dev
```

Visit [http://localhost:4321](http://localhost:4321).

### 5. Add your first service

```bash
bun cli add --data '{"name":"My Site","source":"https://example.com","protocol":"HTTP"}'
```

Or from a JSON file:

```bash
# services.json
echo '[
  {"name":"Website","source":"https://example.com","protocol":"HTTP"},
  {"name":"API","source":"https://api.example.com/health","protocol":"HTTP"}
]' > services.json

bun cli add --data ./services.json
```

## Usage

### CLI Commands

| Command | Description |
|---------|-------------|
| `bun cli add --data <file>` | Add service(s) from a JSON file |
| `bun cli remove --service <id\|url>` | Remove a service |
| `bun cli report --service <id\|url> --error "<msg>" [--status <code>]` | Manually create a downtime report |

### Monitoring

Run the dialer to check services every 5 minutes:

```bash
bun dialer
```

Or use an external cron job to hit the API:

```bash
curl "https://your-domain.com/api/cron?cron_secret=YOUR_SECRET"
```

Set up a cron job (every 5 minutes) with your hosting provider or a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com).

### Email Alerts

1. Set `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `FROM_EMAIL`, and `FROM_NAME` in `.env`
2. Domain must be onboarded to [Cloudflare Email Sending](https://developers.cloudflare.com/email-sending/)
3. Users click **Get Updates** in the app bar, enter their email, verify via code
4. Emails are sent automatically on DOWN and RESOLVED transitions

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Cron /     │────▶│  /api/cron       │────▶│  PostgreSQL  │
│  Dialer     │     │  ServiceMonitor  │     │  (Prisma)    │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │  HTTP    │  │  SIP     │
              │  Check   │  │  Check   │
              └──────────┘  └──────────┘
                    │
                    ▼
              ┌──────────┐
              │  Email   │
              │  Alerts  │
              └──────────┘
```

The system is composed of:

- **Web UI** (Astro SSR) — serves the status page, incident log, and report detail pages
- **ServiceMonitor** — performs health checks on configured endpoints
- **Cron endpoint** (`/api/cron`) — triggers `ServiceMonitor.checkAll()`  (protected by `cron_secret`)
- **Dialer** — optional local scheduler that calls the cron endpoint every 5 minutes
- **Email service** — sends verification codes, DOWN alerts, and RESOLVED notifications via Cloudflare Email API
- **CLI** — management commands for services and reports

### Database Schema

- **Service** — name, url, source, protocol (HTTP/SIP), status (UP/DOWN/DEGRADED), check interval
- **Uptime** — continuous uptime periods with start/end timestamps and duration
- **DowntimeReport** — incident records with start/end, duration, status code, error message, and resolution flag
- **EmailSubscriber** — verified email addresses for alerts

## Deployment

### Node.js (standalone)

```bash
bun run build
node dist/server/entry.mjs
```

Compatible with any Node.js host: Railway, Render, Fly.io, DigitalOcean, or your own VPS.

### Vercel

```bash
bun add @astrojs/vercel
```

Swap the adapter in `astro.config.mjs`:

```js
import vercel from '@astrojs/vercel';
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // ...
});
```

Set environment variables in the Vercel dashboard.

### Cloudflare Workers

```bash
bun add @astrojs/cloudflare
```

Swap the adapter:

```js
import cloudflare from '@astrojs/cloudflare';
export default defineConfig({
  output: 'server',
  adapter: cloudflare({ mode: 'directory' }),
});
```

Note: Cloudflare Workers have limited Node.js compatibility. SIP monitoring (`net` module) and file system access are restricted. The `nodejs_compat` flag must be enabled.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CRON_SECRET` | Yes | Secret to authenticate cron requests |
| `STATUS_API_BASE_URL` | No | Base URL for the dialer (default: `http://localhost:4321`) |
| `CF_API_TOKEN` | For email | Cloudflare API token with email sending permissions |
| `CF_ACCOUNT_ID` | For email | Cloudflare account ID |
| `FROM_EMAIL` | No | Sender email address (default: `noreply@bulalab.com`) |
| `FROM_NAME` | No | Sender name (default: `BulaLab Status`) |
| `NODE_TLS_REJECT_UNAUTHORIZED` | No | Set to `0` to bypass TLS errors with self-signed DB certificates |

## Project Structure

```
/
├── public/               # Static assets (logos, favicon)
├── src/
│   ├── cli.ts            # CLI entry point (add, remove, report)
│   ├── dialer.ts         # Local scheduler (5-minute loop)
│   ├── components/       # React components
│   │   ├── NavMenu.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── IncidentRow.tsx
│   │   ├── SubscribeModal.tsx
│   │   └── ThemeToggle.tsx
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── prisma.ts     # Prisma client singleton
│   │   ├── serviceMonitor.ts
│   │   ├── email.ts
│   │   └── uptime.ts     # 30-day timeline computation
│   ├── pages/
│   │   ├── index.astro
│   │   ├── incidents.astro
│   │   ├── report/[id].astro
│   │   ├── api/
│   │   │   ├── cron.ts
│   │   │   └── subscribe/
│   │   │       ├── index.ts     # Send verification code
│   │   │       └── verify.ts    # Verify code
│   │   └── sitemap.xml.ts
│   └── styles/
│       └── global.css
├── prisma/
│   └── schema.prisma
├── astro.config.mjs
├── package.json
└── README.md
```

## Generating a Cron Secret

```bash
openssl rand -base64 32
```

## License

[MIT](LICENSE)

---

<p align="center">
  Built with ❤️ by <a href="https://withkaya.com">BulaLab</a>
  ·
  <a href="https://status.withkaya.com">Live Status</a>
</p>
