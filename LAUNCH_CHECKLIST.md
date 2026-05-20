# BGSC Portal — Launch Checklist

Live deployment: **https://bgsc.vercel.app**
Repo: **https://github.com/KingBodhi/bgsc-web**

---

## Status Overview

| Area | Status | Notes |
|---|---|---|
| Portal (auth, courses, community, tracking) | ✅ Live | Neon DB, JWT auth |
| Admin panel | ✅ Live | /admin — password in Vercel env |
| Database | ✅ Live | Neon PostgreSQL, auto-migrates on deploy |
| Stripe payments | ⏳ Pending | Placeholder keys — no charges will process |
| Video content (R2) | ⏳ Pending | Placeholder credentials — videos won't load |
| Transactional email | ⏳ Pending | Placeholder Resend key — no emails sent |
| Custom domain | ⏳ Pending | Still on bgsc.vercel.app |
| Mobile apps (iOS/Android) | ⏳ Phase 1 | See PLATFORM_ROADMAP.md |

---

## 1. Stripe — Paid Memberships

### 1a. Create Products & Prices

Log into Stripe Dashboard → Products → Add product.

Create **3 products**, each with a monthly and annual price:

| Product | Monthly Price | Annual Price |
|---|---|---|
| Club | e.g. $29/mo | e.g. $249/yr |
| Premium | e.g. $59/mo | e.g. $499/yr |
| VIP | e.g. $99/mo | e.g. $849/yr |

Copy the **Price ID** for each (format: `price_1ABC...`).

### 1b. Update Vercel Environment Variables

In Vercel dashboard → bgsc project → Settings → Environment Variables, update:

```
STRIPE_SECRET_KEY        sk_live_...
STRIPE_WEBHOOK_SECRET    whsec_...  (from step 1c below)
STRIPE_PRICE_CLUB_MONTHLY      price_...
STRIPE_PRICE_CLUB_ANNUAL       price_...
STRIPE_PRICE_PREMIUM_MONTHLY   price_...
STRIPE_PRICE_PREMIUM_ANNUAL    price_...
STRIPE_PRICE_VIP_MONTHLY       price_...
STRIPE_PRICE_VIP_ANNUAL        price_...
```

### 1c. Configure Stripe Webhook

In Stripe Dashboard → Developers → Webhooks → Add endpoint:

- **Endpoint URL:** `https://bgsc.vercel.app/api/stripe/webhook`
- **Events to listen for:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET`.

### 1d. Redeploy After Updating Keys

After updating all env vars, trigger a redeploy:
```bash
vercel --prod
```

---

## 2. Cloudflare R2 — Video Content

### 2a. Create R2 Bucket

In Cloudflare Dashboard → R2 → Create bucket.

- **Bucket name:** `bgsc-content`
- **Region:** Auto (or closest to your audience)

### 2b. Enable Public Access

In the bucket settings → Public access → Allow public access.

Set a custom domain (recommended): e.g. `content.badgirlstrength.club`
- Add a CNAME in your DNS: `content` → `<bucket-public-url>.r2.dev`

### 2c. Create API Token

Cloudflare Dashboard → R2 → Manage R2 API Tokens → Create token:
- Permissions: Object Read & Write
- Scope: Specific bucket — `bgsc-content`

Copy **Access Key ID** and **Secret Access Key**.

### 2d. Upload Content Files

Upload your video/image files maintaining this directory structure:
```
bgsc-content/
  courses/
    <course-slug>/
      <lesson-slug>.mp4
      thumbnail.jpg
  images/
    ...
```

The `R2_PUBLIC_URL` env var is the base URL for all content. A video stored at
`courses/foundations/intro.mp4` in the bucket is accessed at `{R2_PUBLIC_URL}/courses/foundations/intro.mp4`.

### 2e. Update Vercel Environment Variables

```
CLOUDFLARE_ACCOUNT_ID    <your account ID>
R2_ACCESS_KEY_ID         <access key>
R2_SECRET_ACCESS_KEY     <secret key>
R2_BUCKET_NAME           bgsc-content
R2_PUBLIC_URL            https://content.badgirlstrength.club
```

---

## 3. Resend — Transactional Email

Emails are sent for: welcome on signup, password reset, subscription confirmations.

### 3a. Create Resend Account

Sign up at resend.com.

### 3b. Verify Domain

Resend Dashboard → Domains → Add domain → `badgirlstrength.club`

Add the DNS records Resend provides (SPF, DKIM, DMARC). Wait for verification (usually <10 min).

### 3c. Create API Key

Resend Dashboard → API Keys → Create API key.

### 3d. Update Vercel Environment Variables

```
RESEND_API_KEY    re_...
EMAIL_FROM        noreply@badgirlstrength.club
```

---

## 4. Custom Domain

### 4a. Add Domain in Vercel

Vercel Dashboard → bgsc project → Settings → Domains → Add `badgirlstrength.club` and `www.badgirlstrength.club`.

### 4b. Update DNS

Point your domain registrar DNS to Vercel's nameservers, or add the A/CNAME records Vercel provides.

### 4c. Update NEXT_PUBLIC_APP_URL

Once the domain is live, update in Vercel env vars:
```
NEXT_PUBLIC_APP_URL    https://badgirlstrength.club
```

Also update `app/layout.tsx` metadata URLs from `bgsc.vercel.app` → `badgirlstrength.club` and redeploy.

---

## 5. Seed Production Data

After Stripe is live, run the course seeder against production:

```bash
# Pull production env vars locally
vercel env pull .env.production.local

# Run seeder against production DB
NODE_ENV=production npx tsx scripts/seed-courses.ts
```

This seeds: courses, lessons, lesson widgets, community channels, and badges.

**Note:** The seeder is idempotent — safe to re-run. It uses `upsert` throughout.

---

## 6. Admin Account

An admin account must be created manually after the production database is initialized:

```bash
# Pull production env, then run:
npx tsx scripts/create-admin.ts
```

Or use the Neon console to run:
```sql
INSERT INTO "Member" (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'admin@badgirlstrength.club', '<bcrypt-hash>', 'Admin', 'ADMIN', now(), now());
```

The admin panel is at `/admin`. Cookie name: `bgsc_admin`.

---

## 7. Pre-Launch Smoke Test

Once all credentials are in place, verify:

- [ ] `/` — Marketing homepage loads
- [ ] `/portal/login` — Login form renders, error state works
- [ ] Stripe checkout — Test a purchase with a Stripe test card (`4242 4242 4242 4242`)
- [ ] `/portal` — Dashboard loads after login
- [ ] `/portal/learn` — Course list visible
- [ ] `/portal/learn/<course>/<lesson>` — Video plays (requires R2 content uploaded)
- [ ] `/portal/community` — Channels and posts load
- [ ] Welcome email — Received on signup
- [ ] `/admin` — Admin panel accessible
- [ ] Stripe webhook — Subscription status updates after checkout

---

## Environment Variables Reference

Full list of required production env vars:

```
# Database (Neon — already configured)
BGSC_POSTGRES_PRISMA_URL
BGSC_POSTGRES_URL_NON_POOLING

# Auth
JWT_SECRET

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_CLUB_MONTHLY
STRIPE_PRICE_CLUB_ANNUAL
STRIPE_PRICE_PREMIUM_MONTHLY
STRIPE_PRICE_PREMIUM_ANNUAL
STRIPE_PRICE_VIP_MONTHLY
STRIPE_PRICE_VIP_ANNUAL

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL

# Email
RESEND_API_KEY
EMAIL_FROM

# App
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_POSTHOG_KEY       (optional — PostHog analytics)
NEXT_PUBLIC_POSTHOG_HOST      (optional)
```
