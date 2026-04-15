# Project: Aspct Ratio

Asset slicing SaaS — upload images, choose ad/ecomm/social formats, adjust crops, export a named ZIP.

## Stack
- Next.js App Router, TypeScript, Tailwind CSS
- Auth: Supabase (email + Google OAuth)
- Payments: Stripe
- Image processing: Sharp (server) + Canvas API (client)
- Export: JSZip, jsPDF

## Rules
- After every code change, always run `git add .`, `git commit` with a descriptive message, and `git push` to main.
- Never skip the git push step — the project auto-deploys on Vercel from the main branch.
