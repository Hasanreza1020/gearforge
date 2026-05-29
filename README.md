# ⚡ GearForge — Elite Gaming Gear Store

A full-stack gamified e-commerce website for gaming products built with Next.js 16, Supabase, Stripe, and the "Neon Forge" AAA game UI design system.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database & Auth | Supabase (PostgreSQL + RLS + Auth) |
| Payments | Stripe Checkout + Webhooks |
| Styling | Tailwind CSS v4 + Framer Motion |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Email | Resend |
| Storage | Supabase Storage |
| Deployment | Vercel |
| Package Manager | Bun |

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd gearforge
bun install
```

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in all values:
```bash
cp .env.local.example .env.local
```

### 3. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste the contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to Storage → Create bucket named `product-images` → set to **Public**
4. Enable Google OAuth: Authentication → Providers → Google

### 4. Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Get your keys from Dashboard → Developers → API Keys
3. Set up webhook endpoint: `yourdomain.com/api/stripe/webhook`
   - Events to listen: `checkout.session.completed`, `payment_intent.payment_failed`
4. Get the webhook secret from the webhook endpoint details

### 5. Resend Setup
1. Create account at [resend.com](https://resend.com)
2. Get API key from Dashboard
3. Add and verify your sending domain

### 6. Run Development
```bash
bun dev
```

For Stripe webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Deployment (Vercel)

1. Push code to GitHub
2. Connect GitHub repo to [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy
5. Update `NEXT_PUBLIC_APP_URL` to your production URL
6. Update Stripe webhook URL to production URL

## Creating Admin User

1. Sign up normally through the website
2. Go to Supabase Dashboard → Table Editor → `profiles`
3. Find your row → set `role` to `admin`
4. Access admin dashboard at `/admin`

## Project Structure

```
gearforge/
├── app/
│   ├── (store)/          # Public store routes
│   ├── (auth)/           # Login/Register pages
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes
│   └── auth/callback/    # OAuth callback
├── components/
│   ├── store/            # Store components
│   ├── admin/            # Admin components
│   └── ui/               # Primitive UI components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── stripe.ts         # Stripe helpers
│   ├── cache.ts          # Next.js cache utilities
│   └── utils.ts          # Shared utilities
├── store/                # Zustand stores
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── supabase/migrations/  # Database schema
```

## Features

### Store
- **Neon Forge UI** — AAA game-quality dark UI with cyberpunk aesthetics
- **Product Catalog** — Categories, search, filters, sorting
- **Product Detail** — Image gallery, reviews, tabs
- **Cart** — Zustand-powered with localStorage persistence
- **Checkout** — Stripe Checkout integration with delivery options
- **Orders** — Real-time status tracking with progress indicator

### Gamification
- **XP System** — Earn points for purchases
- **Level Tiers** — Bronze → Silver → Gold → Platinum → Elite
- **Achievements** — First Blood, High Roller, Veteran
- **Free Shipping Milestone** — Cart progress bar at $75

### Admin
- **Command Center** — Revenue charts, stats, alerts
- **Products** — Full CRUD with image upload to Supabase Storage
- **Orders** — Status management, tracking numbers
- **Customers** — Player profiles with XP and spend data
- **Analytics** — 30-day revenue visualization

### Technical
- **Caching** — `unstable_cache` for products, categories
- **Server Components** — All data-fetching pages
- **RLS** — Row Level Security on all Supabase tables
- **Webhooks** — Stripe webhook verification and order automation
- **Email** — Resend transactional confirmation emails
- **SEO** — `generateMetadata`, sitemap, robots.txt

## Design System (Neon Forge)

| Token | Value |
|-------|-------|
| Background | `#080B14` |
| Surface | `#0D1117` |
| Cyan Accent | `#00F5FF` |
| Pink Accent | `#FF3E6C` |
| Gold/XP | `#FFD700` |
| Text | `#E8EAF0` |
| Muted | `#5A6478` |

Fonts: **Orbitron** (headings) · **Rajdhani** (body) · **Share Tech Mono** (prices/code)
