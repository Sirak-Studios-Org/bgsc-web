# BGSC Platform Roadmap

**Last Updated:** 2026-05-20
**Status:** Active — Phase 1 in progress

## Vision

Bad Girl Strength Club is building the definitive home for women who train seriously. The platform replaces Passion.io with a fully owned, extensible membership portal that gives Stephie complete control over the member experience — from onboarding quiz to VIP coaching. Over the next six months, the goal is to ship native iOS and Android apps, build a professional-grade content and coaching platform, drive sustainable growth through referrals and retention tooling, and establish the infrastructure to scale to thousands of members without performance or reliability regressions.

---

> **Quick Wins — Next 48 Hours**
>
> 1. **Create a `push_tokens` table** via a Prisma migration (memberId, token, platform, createdAt) and update the subscription logic to write there instead of SiteConfig.
> 2. **Set up Sentry** in both the Next.js app and Capacitor shell — free tier, two-minute integration. Start capturing errors in staging now before they reach iOS review.
> 3. **Configure Cloudflare cache rules** for the R2 bucket so video segments are edge-cached — eliminates the dev-only local file serving gap before any real traffic hits.
> 4. **Add rate limiting middleware** to `/api/` routes using the `@upstash/ratelimit` package (Redis-backed, works on Vercel Edge) — prevents abuse before launch.
> 5. **Register Apple Developer and Google Play developer accounts** if not already done — Apple takes up to 2 business days to approve; don't let it be the critical path blocker for Phase 1.

---

## Phase 0 — Complete ✅

Core member portal is live. Login, onboarding quiz, course library, lesson player (video / text / timer / exercise journal), community channels, DMs, reactions, goal tracking, check-in history charts, profile with badges and XP, cancellation save flow (pause / discount / extend), admin panel (course editor, member management, moderation), Stripe subscriptions and webhooks, PWA manifest + service worker, Capacitor project scaffolded for Android and iOS.

---

## 📱 Phase 1 — Native Mobile Apps

**Duration:** 4 weeks
**Goal:** Ship to the App Store and Play Store. Members should be able to install a real native app and receive push notifications.

### Overview

The Capacitor shell is already scaffolded. The primary work is setting up push notification infrastructure, configuring the native build pipelines, handling Apple's in-app purchase policy (sidestepping it by making the iOS app login-only with no purchase flow), and getting through the review processes at both stores.

iOS requires a Mac build environment. If the primary developer does not have a Mac, set up a CI runner via GitHub Actions with a macOS runner, or use a service like Codemagic or Bitrise. Do not underestimate Apple review — budget at minimum one round-trip (5–7 business day delay is common for fitness apps).

### Push Notifications

- **Android:** Firebase Cloud Messaging (FCM). Add `@capacitor/push-notifications` plugin. Register device tokens on app launch and store in the new `push_tokens` table.
- **iOS:** Apple Push Notification service (APNs). Same Capacitor plugin handles both platforms. Requires an APNs key uploaded to Firebase Console (if using FCM as the unified sender) or direct APNs credentials.
- Server-side: a `/api/notifications/send` internal endpoint that accepts a memberId or segment, looks up tokens from `push_tokens`, and dispatches via FCM HTTP v1 API (works for both Android and iOS when using Firebase for both).

### Apple IAP Decision

Apple requires that any subscription purchasable on iOS goes through IAP (30% fee). The plan is to ship the iOS app as a **login-only client** — members sign up on the web, then log into the app. No subscription purchase UI in the iOS app. This is a common, Apple-approved approach. The App Store listing description must clearly state that a membership is required and must be purchased at the website.

### Deep Linking

Configure Capacitor's App plugin for deep links so that email links (`app.bgsc.com/lesson/xyz`) open the native app if installed. Requires Associated Domains on iOS and an App Links intent filter on Android.

### Offline Video Caching

Allow members to download lessons for offline viewing. Capacitor Filesystem API + a "Download" button on the lesson player. Store downloaded HLS segments locally. Scope to one lesson at a time in Phase 1; multi-download queue is Phase 2.

### Progress Photos — Camera Integration

Members can take progress photos from within the app using `@capacitor/camera`. Photos upload to R2 via a pre-signed URL (never route binary through the Next.js API server). Display in the check-in history view with a before/after comparison toggle.

### TestFlight Beta

Before submitting to App Store review, distribute to a TestFlight group (Stephie + internal testers) for at least one full week. Catch crash-level bugs here. Submit to App Store only after a clean TestFlight cycle.

### Phase 1 Task Table

| Task | Owner | Days | Notes |
|------|-------|------|-------|
| Create `push_tokens` Prisma migration | Developer | 0.5 | memberId FK, platform enum (ios/android), token TEXT UNIQUE |
| Integrate `@capacitor/push-notifications` | Developer | 1 | Android FCM + iOS APNs, register on app launch |
| Server-side push dispatch endpoint | Developer | 1 | Internal-only, POST /api/notifications/send |
| Send push on new community reply / DM | Developer | 1 | Hook into existing post/DM creation logic |
| Configure Associated Domains (iOS deep links) | Developer | 0.5 | apple-app-site-association JSON on domain |
| Configure App Links (Android deep links) | Developer | 0.5 | assetlinks.json + AndroidManifest intent filter |
| Offline video download — lesson player button | Developer | 2 | Capacitor Filesystem + HLS segment caching |
| Camera integration — progress photos | Developer | 1.5 | @capacitor/camera → R2 pre-signed upload |
| Before/after photo comparison UI | Designer | 1 | Side-by-side in check-in history |
| iOS app icon + splash screen assets | Designer | 1 | All required sizes for App Store |
| Android app icon + splash screen assets | Designer | 0.5 | Adaptive icon for Play Store |
| App Store Connect setup + provisioning | Developer | 1 | Certificates, identifiers, profiles |
| Play Console setup + signing keystore | Developer | 0.5 | Upload key, generate signed AAB |
| Set up macOS CI runner (Codemagic or GHA) | Developer | 1 | Required for iOS builds |
| TestFlight internal build + 1-week beta | Developer | 1 | Target: Stephie + 5 testers minimum |
| App Store submission (login-only, no IAP) | Developer | 0.5 | Budget 5–7 days for review turnaround |
| Play Store submission (open beta → production) | Developer | 0.5 | Budget 2–3 days for review |
| QA pass on physical iOS + Android devices | Developer | 1 | Test push, camera, offline, deep links |

---

## 🎬 Phase 2 — Content Platform

**Duration:** 3 weeks
**Goal:** Professional-grade video delivery, searchable content, and structured learning progression.

### Overview

The current video delivery path (local files in dev) must be replaced with a production-grade pipeline before scale. The content platform phase delivers: reliable video transcoding, adaptive streaming, auto-captions, lesson search, downloadable resources, completion certificates, drip scheduling, and a "continue watching" home screen widget.

### Video Transcoding Pipeline

1. **Upload:** Admin uploads source video (MP4, MOV) via the course editor. The browser posts directly to R2 using a pre-signed upload URL.
2. **Transcode:** An R2 event notification triggers a Cloudflare Worker (or a Vercel background function) that submits the video to a transcoding queue. Use FFmpeg via a self-hosted worker or a managed service (Mux, Cloudflare Stream, or a Hetzner VM running a queue consumer).
3. **Output:** Generate HLS playlist (`master.m3u8`) with three renditions: 360p, 720p, 1080p. Store all segments in R2 under `/hls/<lessonId>/`.
4. **CDN:** Cloudflare proxies R2 reads. Set `Cache-Control: public, max-age=31536000` on `.ts` segment files. Set short TTL on `master.m3u8` and `index.m3u8` playlists.
5. **Player:** Use `hls.js` in the web lesson player (Capacitor webview inherits this). Detect network speed for automatic quality switching.

### Auto-Generated Captions

After transcoding completes, the same worker submits the audio track to OpenAI Whisper API. Output is a VTT file stored alongside the HLS segments in R2. The lesson player loads it as a `<track kind="captions">` element. Captions are editable from the admin course editor.

### Lesson Search

Implement Postgres full-text search across course titles, lesson titles, lesson text content, and widget labels. Use `tsvector` columns with `GIN` indexes. Expose via `GET /api/search?q=`. Add a search bar to the course library page. Rank results by course → lesson → widget match level.

If full-text search proves insufficient at scale, swap to Algolia — the API surface is narrow and the migration is a single-day task.

### Downloadable Resources

Each lesson can have attached PDF resources (workout templates, nutrition guides, etc.). Admin uploads PDFs via the course editor to R2. Lesson player shows a "Resources" tab listing attachments with download links. Downloads served via R2 signed URLs with a short TTL (5 minutes) to prevent link sharing.

### Course Completion Certificates

When a member completes all lessons in a course, generate a PDF certificate server-side using `@react-pdf/renderer` or `puppeteer`. Certificate includes member name, course name, completion date, and BGSC branding. Store generated PDF in R2. Show a "Download Certificate" button on the course completion screen and send a congratulatory email via Resend.

### Drip Content Scheduling

In the course editor, each lesson can be given an `unlockAfterDays` value (0 = immediate). Lessons with a future unlock date show as locked in the course library with a countdown ("Unlocks in 3 days"). Unlock is computed relative to the member's subscription start date (from Stripe). A daily cron job (Vercel Cron or GitHub Actions) sends a push + email notification when a new lesson unlocks.

### Coach Video Responses

On any lesson, the coach can record or upload a short video response ("coach note"). Appears above the comments section for all members. Uploaded via the admin panel to R2. Useful for adding timely context to older lessons without re-editing them.

### Continue Watching Widget

Track `LessonProgress` (already exists for check-ins — extend or create a new model). On the home dashboard, show the last in-progress lesson with a progress bar and "Resume" CTA. This is the single highest-impact retention feature in the phase.

### Phase 2 Task Table

| Task | Owner | Days | Notes |
|------|-------|------|-------|
| R2 pre-signed upload integration in course editor | Developer | 1 | Replace local multipart upload |
| FFmpeg transcoding worker setup | Developer | 2 | Cloudflare Worker or Hetzner queue consumer |
| HLS output (3 renditions) + R2 storage | Developer | 1.5 | master.m3u8 + rendition playlists |
| Cloudflare cache rules for R2 video segments | Developer | 0.5 | Long TTL on .ts, short TTL on .m3u8 |
| hls.js integration in lesson player | Developer | 1 | Replace <video src> with HLS adaptive |
| Whisper API integration for auto-captions | Developer | 1 | Triggered after transcode complete |
| Caption editor in admin course editor | Developer | 1 | Editable VTT display + save back to R2 |
| Postgres full-text search (tsvector + GIN) | Developer | 1.5 | Migration + /api/search endpoint |
| Search bar UI in course library | Designer | 0.5 | Instant results dropdown |
| PDF resource upload in course editor | Developer | 1 | R2 upload + lesson attachment model |
| Resources tab in lesson player | Designer | 0.5 | List attachments with signed download links |
| Completion certificate PDF generation | Developer | 1.5 | @react-pdf/renderer, R2 storage |
| Certificate email (Resend) + download button | Developer | 0.5 | Triggered on course completion |
| Drip scheduling model + unlockAfterDays field | Developer | 1 | Prisma migration + unlock computation |
| Locked lesson UI with countdown | Designer | 0.5 | Show unlock date in course library |
| Drip unlock cron + push/email notification | Developer | 0.5 | Vercel Cron daily |
| Coach video response upload + display | Developer | 1 | Admin upload, member-facing display above comments |
| LessonProgress tracking model | Developer | 0.5 | Prisma migration if not exists |
| Continue Watching home widget | Developer + Designer | 1 | Last in-progress lesson, progress bar |

---

## 🏋️ Phase 3 — Coaching Platform

**Duration:** 3 weeks
**Goal:** Give Stephie powerful tools to deliver and scale personalized VIP coaching.

### Overview

VIP at $299/month demands a fundamentally different experience from Club and Premium. This phase builds the infrastructure for Stephie to see all her VIP clients in one place, respond to weekly check-ins, run group coaching sessions, and automate the routine touchpoints that make members feel seen without consuming all of her time.

### VIP Coach Dashboard

A dedicated `/admin/coaching` view. Shows all VIP members sorted by last check-in date (oldest first). Each card shows: member photo, name, streak, last check-in summary, last journal entry, latest progress photo, and a flag if they have been inactive for 7+ days. Clicking a card opens a full coaching profile: all tracking history, all journal entries, all progress photos in a timeline, and the 1:1 message thread.

### In-App 1:1 Messaging (VIP)

Separate from community DMs. VIP members see a "Message Stephie" tab in their profile. Messages go into a dedicated `CoachingThread` model (distinct from community DMs). Stephie sees all threads in the coach dashboard, sorted by unread/newest. Unread messages trigger a push notification to Stephie's device. Community DMs continue to work as-is for all tiers.

### Weekly Check-In Form

Every Monday at 8am member-local-time (use stored timezone from onboarding quiz), VIP members receive a push notification + email prompting them to complete their weekly check-in. The check-in form is a structured questionnaire: weight, body measurements (optional), energy level (1–5), sleep quality (1–5), training compliance (yes/no per day), nutrition notes (free text), wins this week (free text), challenges (free text). Stephie sees submissions in the coach dashboard and can leave a written response that the member receives as a push + email notification.

### Coach Notes on Member Profiles

Any admin (eventually any coach) can add private notes to a member's profile. Notes are timestamped and author-attributed. Visible only to admins/coaches. Useful for tracking context across coaching conversations ("mentioned knee injury 2026-04-10", "considering upgrading to VIP").

### Group Coaching Sessions (Live Video)

Embed Daily.co or Whereby. Admin creates a "Live Session" in the admin panel with a title, date/time, and tier access level (Premium + VIP, or VIP-only). Members see upcoming sessions on a Sessions page. At session time, they click "Join" and enter the embedded video room. Session recordings stored in R2 post-session. Replay available on the Sessions page for 30 days.

### Automated Coaching Touchpoints

| Trigger | Action |
|---------|--------|
| Day 7 after signup | Email: "How's your first week going?" + check-in form link |
| Day 30 | Email: "You've been a Bad Girl for a month!" — milestone email + coach review prompt |
| Day 90 | Email: "90-day review" — personalized email queued for Stephie to send (drafted by automation, she reviews and sends) |
| 7 days no activity | Push + email to member: "We miss you" + coach flagged in dashboard |
| VIP check-in not submitted by Wednesday | Reminder push to member |

Implemented via Vercel Cron jobs querying the database daily and dispatching via Resend.

### Phase 3 Task Table

| Task | Owner | Days | Notes |
|------|-------|------|-------|
| CoachingThread model + Prisma migration | Developer | 0.5 | Separate from community DMs |
| 1:1 message UI for VIP members | Designer | 1 | "Message Stephie" tab in member profile |
| Messaging backend (send/receive/read status) | Developer | 1.5 | REST or WebSocket; unread badge |
| Push notification to coach on new message | Developer | 0.5 | Use push_tokens for Stephie's device |
| VIP coach dashboard — member list view | Developer + Designer | 2 | Sorted by last check-in, inactivity flag |
| VIP coach dashboard — full coaching profile view | Developer + Designer | 2 | History, journals, photos, messages |
| Weekly check-in form (structured questionnaire) | Developer + Designer | 1.5 | All fields, mobile-optimized |
| Monday check-in cron + push/email dispatch | Developer | 0.5 | Timezone-aware, VIP members only |
| Coach response to check-in submission | Developer | 1 | Response stored, push + email to member |
| Coach notes model + UI | Developer | 0.5 | Admin-only, timestamped, author-attributed |
| Daily.co / Whereby embed for live sessions | Developer | 1.5 | Admin creates room, members join |
| Live sessions admin creation UI | Designer | 1 | Title, date/time, access tier, recording toggle |
| Sessions page (upcoming + replays) | Designer | 1 | Calendar view, replay thumbnails |
| Session replay upload to R2 post-session | Developer | 1 | Auto-upload via Daily.co recording webhook |
| Day 7 / day 30 / day 90 automated emails | Developer | 1 | Vercel Cron + Resend templates |
| Inactivity detection cron + coach dashboard flag | Developer | 0.5 | 7-day no-activity query, daily |
| VIP check-in reminder (Wednesday if not submitted) | Developer | 0.5 | Cron checks submission table |

---

## 🎯 Phase 4 — Growth & Retention

**Duration:** 2 weeks
**Goal:** Install the growth loops and retention tools that turn satisfied members into promoters and lapsed members back into active ones.

### Overview

Member acquisition is currently entirely dependent on Stephie's social audience. This phase introduces structural growth mechanisms: a referral program, an affiliate program for partner coaches, trial flow for cold traffic, and a win-back campaign for lapsed members. Retention tooling includes a member spotlight system and an opt-in leaderboard to drive community engagement.

### Referral Program

Each member gets a unique referral link (`bgsc.com/join?ref=<code>`). When a referred member subscribes, the referrer receives 1 week free (a Stripe coupon applied to their next billing cycle). Track referrals in a `Referral` table (referrerId, referredMemberId, status, creditAppliedAt). Show each member their referral stats on their profile page ("You've referred 3 Bad Girls — that's 3 free weeks!").

### Affiliate Program

Partner coaches (fitness influencers, personal trainers) get an affiliate link with a custom code. Signups via their link attribute 20% recurring commission to the affiliate for the lifetime of the subscription. Commission tracked in an `Affiliate` table. Monthly payout via Stripe (manual review + transfer in Phase 1 of the affiliate program). Admin panel shows affiliate performance (clicks, signups, MRR attributed, commissions owed).

### Annual Billing Upgrade Campaign

A Stripe coupon for annual billing (2 months free equivalent) is triggered via:
- **Email sequence at day 45:** Resend email with the annual offer.
- **In-app nudge:** A dismissible banner on the member's home dashboard (only shown after 30 days of membership, dismissed state persisted).

### Free Trial Flow

7-day free trial via Stripe `trial_period_days`. Landing page CTA changes to "Start Your Free 7-Day Trial." No credit card required is a separate business decision — recommend requiring card (reduces fraud, higher conversion at Stripe trial-end). Implement a trial end email sequence: day 5 (reminder), day 6 (last day), day 7 (access expires + win-back offer if they cancel).

### Win-Back Campaign

For members who cancel, trigger a time-delayed email sequence via Resend:
- Day 30 post-cancel: 50% off first month back.
- Day 60: Same offer.
- Day 90: Final offer + a personal note from Stephie.

Unsubscribe-respecting (Resend list management). Members who rejoin are removed from the sequence.

### Member Spotlight

In the admin panel, Stephie can select any member as "Bad Girl of the Week." This displays a spotlight card on the community home page (photo, name, a short quote or coach note). The featured member receives a push + email notification. Rotate weekly — previous spotlights archived in a public "Hall of Fame" section.

### Leaderboard

Opt-in weekly activity ranking. Members who opt in appear on a leaderboard sorted by XP earned in the current week (lessons completed, check-ins submitted, community posts, reactions given). Display top 10 on the community home. Opt-in toggle in member profile settings. Do not make it opt-out — not all members want public comparison.

### Phase 4 Task Table

| Task | Owner | Days | Notes |
|------|-------|------|-------|
| Referral model + code generation | Developer | 0.5 | Unique code per member, /join?ref= routing |
| Referral credit logic (Stripe coupon on trigger) | Developer | 1 | On referred member subscription confirmed |
| Referral stats on member profile | Designer | 0.5 | Count, free weeks earned |
| Affiliate table + link attribution | Developer | 1 | Commission rate 20%, lifetime recurring |
| Affiliate admin dashboard | Developer + Designer | 1.5 | Performance stats, commissions owed |
| Annual billing email at day 45 (Resend) | Developer | 0.5 | Stripe coupon + Resend template |
| Annual billing in-app nudge (dismissible banner) | Developer + Designer | 0.5 | 30-day+ members only |
| 7-day free trial Stripe flow | Developer | 1 | trial_period_days, landing page CTA |
| Trial end email sequence (day 5/6/7) | Developer | 0.5 | Resend timed sequence |
| Win-back email sequence (day 30/60/90) | Developer | 1 | Resend + list management for unsubscribes |
| Member spotlight admin selection UI | Designer | 0.5 | Dropdown + quote field in admin panel |
| Spotlight display on community home | Designer | 0.5 | Featured card with photo + quote |
| Spotlight push + email to featured member | Developer | 0.5 | Trigger on admin save |
| Opt-in leaderboard model + XP query | Developer | 1 | Weekly XP aggregation, top 10 |
| Leaderboard display on community home | Designer | 0.5 | Top 10 with rank + avatar |
| Leaderboard opt-in toggle in profile settings | Developer | 0.5 | Default off |

---

## 📊 Phase 5 — Scale & Analytics

**Duration:** Ongoing
**Goal:** Instrument the platform to understand what drives retention, optimize revenue recovery, and prepare for multi-coach and potentially white-label growth.

### PostHog Product Analytics

Install PostHog (self-hosted or cloud). Capture events on:
- `page_view` (all pages)
- `lesson_started`, `lesson_completed` (with courseId, lessonId)
- `check_in_submitted`
- `community_post_created`, `community_reaction_added`
- `subscription_started`, `subscription_upgraded`, `subscription_cancelled`
- `trial_started`, `trial_converted`

Build funnels:
1. Landing page → Sign up → Onboarding quiz → First lesson (target: >40% through)
2. First lesson → Second lesson within 7 days (target: >70%)
3. Club → Premium upgrade (identify trigger events)

Identify the "aha moment" — the action that correlates most strongly with 90-day retention. Use this to optimize the onboarding quiz and first-lesson experience.

### Stripe Revenue Recovery

In the Stripe dashboard:
- Enable **Smart Retries** (Stripe's ML-based retry schedule for failed payments).
- Configure **dunning emails**: 3 days before retry, on failure, final warning before cancellation.
- Review **Radar rules** for fraud prevention.
- Set up **revenue reports** sent to Stephie's email weekly.

### Content CDN Optimization

- Set `Cache-Control: public, max-age=31536000, immutable` on all versioned R2 assets (video segments, thumbnails with content-hash in filename).
- Set `Cache-Control: public, max-age=300` on manifests and metadata.
- Enable Cloudflare **Tiered Cache** for R2 origin to reduce origin requests.
- Audit Vercel function cold starts — move any hot API routes to Edge Runtime where possible.

### A/B Testing on Pricing Page

Use PostHog feature flags to test:
- Annual billing presented first vs monthly first.
- 3-tier layout vs highlighted "most popular" tier.
- "Start Free Trial" vs "Join Now" CTA copy.

Run each test for minimum 2 weeks, minimum 100 unique visitors per variant before calling a winner.

### Churn Prediction

Daily cron job queries: members with no `LessonProgress`, `CheckIn`, or `CommunityPost` in the last 7 days. Flag these members in the coach dashboard (same inactivity flag from Phase 3). Add a metric: "at-risk members" count to the admin home. Stephie can send a personal message to at-risk members directly from the list.

### Multi-Coach Support

Stephie can invite other coaches via the admin panel (`/admin/team`). A coach role has access to: the coaching dashboard (filtered to their assigned members), the course editor (read-only unless granted edit permission), and community moderation. Coaches do not have access to billing, affiliate payouts, or site configuration. Implement via a `CoachProfile` table linked to `User` with a `role` enum (owner, coach, moderator).

### White-Label Potential

Design for white-labeling from the start:
- Site configuration (logo, color scheme, domain) already lives in `SiteConfig` — extend to cover all brand assets.
- Keep Stripe credentials per-tenant in SiteConfig (or a separate `TenantConfig`).
- Keep coach identity (Stephie) configurable, not hardcoded in copy.
- Document the "deploy a new tenant" runbook so it could be done in under a day.

This is not a commitment to build multi-tenancy — it is a commitment not to build in ways that make it impossible.

### Phase 5 Task Table

| Task | Owner | Days | Notes |
|------|-------|------|-------|
| PostHog install + base event tracking | Developer | 1 | All page_view + lesson events |
| Subscription lifecycle events to PostHog | Developer | 0.5 | started, upgraded, cancelled, trial_converted |
| Funnel dashboards in PostHog | Developer | 0.5 | Landing → signup → first lesson |
| Stripe Smart Retries + dunning config | Developer | 0.5 | Dashboard config, no code required |
| Cloudflare cache rules audit + tiered cache | Developer | 1 | R2 asset TTLs, manifest TTLs |
| Vercel Edge Runtime migration for hot routes | Developer | 1 | /api/auth, /api/lessons — assess each |
| PostHog feature flags for A/B pricing page | Developer | 0.5 | Flag + variant split setup |
| Pricing page A/B variants | Designer | 1 | 2 variants per test |
| A/B test analysis + winner deploy | Developer | 0.5 | After 2-week run |
| At-risk members daily cron + dashboard flag | Developer | 0.5 | 7-day inactivity query |
| CoachProfile model + invite flow | Developer | 1.5 | Prisma migration + invite email |
| Coach role permissions enforcement | Developer | 1 | Middleware checks on admin routes |
| SiteConfig brand asset extensions | Developer | 0.5 | Ensure all copy is config-driven |
| Multi-tenant runbook documentation | Developer | 0.5 | Internal doc, not public |

---

## 🔗 Phase 6 — Integrations

**Duration:** Future (prioritize based on Stephie's workflow needs)
**Goal:** Connect BGSC to the tools already in Stephie's ecosystem and extend member tracking into fitness platforms they already use.

### Zapier / Make Webhook Triggers

Expose outbound webhooks for key member lifecycle events:
- `member.created` — new subscription confirmed
- `subscription.cancelled` — member cancelled
- `badge.earned` — member earns a badge
- `check_in.submitted` — weekly check-in data
- `course.completed` — member finishes a course

Webhooks configured in admin panel: URL + event types + optional secret for HMAC verification. Enables Stephie (or her team) to connect BGSC to any tool via Zapier/Make without developer involvement.

### Slack Notifications

Send Slack notifications to a dedicated BGSC workspace channel:
- New member signup (with plan and referral source)
- Subscription cancellation (with cancellation reason from the save flow)
- VIP message received (so Stephie can respond from Slack in a pinch)
- Daily summary: new members, cancellations, MRR delta

Implemented via a Slack Incoming Webhook URL stored in `SiteConfig`.

### Google Calendar Sync

Live coaching sessions (Phase 3) push to Stephie's Google Calendar via OAuth. Members who opt in can also add session events to their own Google Calendar via a "Add to Calendar" link (standard `.ics` file — no OAuth required for members).

### Strava Integration

Members can connect their Strava account (OAuth). Completed Strava activities (runs, rides, strength workouts) are automatically imported as tracking check-ins. Strava activity type maps to check-in category. Members can review imported check-ins before they are finalized. Requires Strava API access application.

### Apple Health / Google Fit

On mobile (Capacitor), use `@capacitor-community/health-kit` (iOS) and the Android Health Connect API to import:
- Daily steps
- Workout sessions
- Body weight (if member has logged it in Health)

Imported data displayed in the tracking history alongside manually entered check-ins. Members must explicitly grant permission.

### MyFitnessPal Macro Import

MyFitnessPal has a public API (currently invite-only for new apps — apply early). Members can connect their MFP account and daily macro totals appear in their nutrition notes. Alternatively, members can paste MFP export data manually until API access is granted.

### Email Marketing Platform Sync

Sync member data to Klaviyo or ConvertKit:
- Segment by plan (Club, Premium, VIP)
- Segment by activity level (active, at-risk, lapsed)
- Segment by engagement (lesson completions last 30 days)

Triggered on: subscription changes, activity level changes (daily sync). Allows Stephie to run targeted email campaigns from her existing email marketing tool without building new email infrastructure in BGSC.

---

## 🏗️ Infrastructure & DevOps

### Staging Environment

Vercel Preview Deployments are enabled per branch. Every pull request gets a unique preview URL. Use Neon branching to give each preview deployment its own database branch (Neon's branching is near-instantaneous, clones production schema + anonymized seed data).

**Environment tiers:**
- `main` branch → Production (Vercel Production, Neon `main` branch)
- `develop` branch → Staging (Vercel Preview, Neon `develop` branch)
- Feature branches → Preview (Vercel Preview, Neon ephemeral branch per PR)

### Database Branching

Neon database branching enables safe migration testing:
1. Open a PR with a Prisma migration.
2. CI creates a Neon branch from `main`.
3. CI runs `prisma migrate deploy` on the branch.
4. If migration fails, the PR is blocked.
5. On merge to `main`, migration runs against production.

Never run migrations directly against production without a successful branch test.

### Error Monitoring

Sentry for both Next.js (server + client) and Capacitor (native crash reporting via Sentry's Capacitor SDK). Set up:
- Performance monitoring (track slow API routes, Vercel function duration)
- Error alerts to a Slack channel (not email — email alert fatigue)
- Session replays for UI bug investigation (Sentry Session Replay, GDPR-safe config)
- Source maps uploaded in CI so stack traces are readable

### Uptime Monitoring

Better Uptime (or UptimeRobot free tier for start). Monitor:
- `https://bgsc.com` (homepage)
- `https://bgsc.com/api/health` (a lightweight health endpoint — add this if it doesn't exist)
- Stripe webhook endpoint
- R2 video delivery (ping a known-good `.m3u8` URL)

Alert to Slack and SMS (Better Uptime supports both).

### Automated Backups

Neon PITR (Point-In-Time Recovery) is included on paid plans — enable it and confirm the retention window (7 days minimum, 30 days recommended). Test restoration quarterly: create a Neon branch from a timestamp 24 hours ago and verify data integrity.

R2 does not have built-in versioning — enable R2 object versioning for the media bucket so accidental deletions are recoverable.

### Secret Management

- All secrets in Vercel Environment Variables (never in `.env.local` committed to git).
- Vercel preview environments use separate Stripe test-mode keys.
- Rotate secrets on any team member departure.
- `.env.local` is in `.gitignore` — verify this is enforced in the repo.
- Use `@vercel/env` or the Vercel CLI to pull environment variables locally — do not maintain a shared `.env.local` file in a team channel.

### CI Pipeline (GitHub Actions)

```
on: push, pull_request

jobs:
  quality:
    - typecheck (tsc --noEmit)
    - lint (eslint)
    - format check (prettier)

  test:
    - unit tests (vitest)
    - integration tests against Neon branch

  build:
    - next build (validates no build-time errors)

  deploy:
    - on merge to main: Vercel production deployment
    - on PR: Vercel preview deployment
    - on merge to main: prisma migrate deploy (Neon production)
```

All jobs run in parallel except deploy (depends on all others passing). Target CI time under 4 minutes.

---

## 📈 Key Metrics to Track

| Metric | Target | Notes |
|--------|--------|-------|
| MRR | Track weekly | Broken down by Club / Premium / VIP |
| Churn rate | < 5%/month | Industry benchmark for fitness memberships |
| LTV by plan | Track quarterly | LTV = ARPU ÷ churn rate |
| DAU / MAU ratio | > 0.4 | Fitness apps that succeed hit 0.4+; social apps target 0.6+ |
| Lesson completion rate | > 60% | Of lessons started; measures content quality + UX |
| 7-day retention after first lesson | > 70% | Single best predictor of long-term retention |
| Community posts per member per week | > 1 | Measures community health |
| Average streak length | Track | Members with streaks > 14 days churn at significantly lower rates |
| Check-in submission rate (VIP) | > 80% | If lower, examine check-in friction or prompt timing |
| NPS | > 50 | Quarterly survey to active members via Resend + Typeform |
| Trial conversion rate | > 40% | If lower, review trial experience + trial-end email sequence |
| Referral rate | > 10% | % of new members who came via referral link |

Review all metrics in a weekly 30-minute session. PostHog for product metrics, Stripe Dashboard for revenue metrics.

---

## 🔧 Tech Debt & Known Gaps

These items should be resolved before the platform reaches 1,000 members. Some are critical for Phase 1 launch.

### 1. Push Token Storage (Critical — fix before Phase 1)
Push tokens are currently stored in the `SiteConfig` table. This does not support multiple devices per member, token rotation, or platform-specific metadata. Create a dedicated `push_tokens` table:
```sql
CREATE TABLE push_tokens (
  id          TEXT PRIMARY KEY,
  member_id   TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX push_tokens_member_id_idx ON push_tokens(member_id);
```

### 2. Video Delivery (Critical — fix before public launch)
Video delivery uses local file serving in development. This does not work in production (Vercel has no persistent filesystem). All video must be served from R2 + Cloudflare CDN. Phase 2 addresses this fully. Do not launch to public traffic before Phase 2 video pipeline is complete.

### 3. Real-Time Community Updates (Medium Priority)
Community channel updates (new posts, reactions) currently use polling (client requests every N seconds). This creates unnecessary load and produces a laggy feel. Replace with Server-Sent Events (SSE) — simpler than WebSockets, works on Vercel (streaming responses), and sufficient for the community use case. WebSockets would require a separate long-running process not compatible with Vercel's serverless model.

### 4. Search Not Implemented (Medium Priority — fix in Phase 2)
Course and lesson search is not built. Members cannot find specific content without browsing. Phase 2 delivers Postgres full-text search. Do not invest in Algolia until the Postgres approach proves insufficient (it is unlikely to for this scale).

### 5. API Rate Limiting (High Priority — fix before public launch)
No rate limiting on API routes. Any unauthenticated or authenticated route can be hammered. Implement with `@upstash/ratelimit` (Redis-backed, Vercel Edge compatible). Apply strict limits to auth endpoints (`/api/auth/login`, `/api/auth/register`) and moderate limits to all other API routes.

### 6. Admin Authentication (High Priority — fix before multi-coach phase)
Admin auth uses a single shared password (from `SiteConfig`). This is unacceptable once multiple coaches have access. Implement proper admin user management before Phase 5 multi-coach support:
- Admin users stored in `User` table with `role: 'admin' | 'coach' | 'moderator'`
- Admin login via the same Prisma-backed auth as members (not a separate password)
- Admin sessions tracked independently from member sessions
- Audit log of admin actions (for moderation and accountability)

### 7. Missing Health Endpoint
No `/api/health` route exists. Uptime monitors and load balancers need a lightweight, unauthenticated endpoint that returns `200 OK` with a JSON body indicating database connectivity. Add this before setting up uptime monitoring.

### 8. Timezone Handling
Member timezones are collected in the onboarding quiz but may not be consistently applied when scheduling cron-triggered notifications (weekly check-in prompts, lesson unlock notifications). Audit all cron jobs to ensure they use member timezone from the database rather than server UTC.

---

## Appendix: Dependency Map

```
Phase 1 (Mobile)       — No hard dependencies on Phase 2–6
Phase 2 (Content)      — Push tokens fix (Tech Debt #1) useful but not blocking
Phase 3 (Coaching)     — Depends on Phase 2 for progress photos via R2
Phase 4 (Growth)       — Independent; referral + affiliate can start any time
Phase 5 (Analytics)    — PostHog can start immediately; multi-coach depends on admin auth fix
Phase 6 (Integrations) — All future; Zapier webhooks are highest ROI, do first
```

---

*This document is the single source of truth for the BGSC platform roadmap. Update it when priorities shift, phases complete, or new requirements emerge. Keep the "last updated" date current.*
