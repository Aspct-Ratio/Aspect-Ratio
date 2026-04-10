# Aspct Ratio

Asset slicing SaaS — upload images/videos, choose ad/ecomm/social formats, adjust crops, export a named ZIP.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase (email + Google OAuth) |
| Payments | Stripe |
| Image processing | Sharp (server) + Canvas API (client) |
| ZIP export | JSZip |
| PDF export | jsPDF |

## Quick start

```bash
# 1. Install deps
npm install

# 2. Copy env file and fill in values
cp .env.local.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project settings → API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard → API keys |
| `STRIPE_SECRET_KEY` | Stripe dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Email** provider in Authentication → Providers
3. Enable **Google** OAuth:
   - Go to Authentication → Providers → Google
   - Add your Google Client ID + Secret (from Google Cloud Console)
   - Set callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Add your app URL to Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Routes

| Route | Description |
|---|---|
| `/` | Redirects → `/app` or `/login` |
| `/login` | Email/password + Google OAuth |
| `/app` | Main slicer (protected) |
| `/api/process` | Sharp image processor (POST) |
| `/auth/callback` | Supabase OAuth callback |

## Sharp API (`POST /api/process`)

Accepts `multipart/form-data`:

| Field | Type | Description |
|---|---|---|
| `file` | File | Source image |
| `formats` | JSON string | Array of `{id, w, h, cropX, cropY, cropW, cropH}` |
| `quality` | number | 60–100 |
| `outputFormat` | `jpeg\|png\|webp` | Output format |

Returns `{ results: [{id, data: base64, mimeType}] }`.
