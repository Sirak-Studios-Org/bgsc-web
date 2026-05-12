# BGSC VSL — Refinement Implementation Plan

**Client:** Gigi / Bad Girl Strength Club (BGSC)
**Date:** 2026-04-04
**Status:** Developer-ready spec for all feedback items

---

## Overview: Before → After Brand Direction

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BRAND DIRECTION TRANSFORMATION                       │
├────────────────────────────┬────────────────────────────────────────────┤
│         BEFORE             │              AFTER                         │
├────────────────────────────┼────────────────────────────────────────────┤
│ Mood:                      │ Mood:                                      │
│  Dark, foggy, AI-generated │  High-contrast, clean, powerful            │
│  Masculine energy          │  Feminine + athletic + premium             │
│                            │                                            │
│ Typography:                │ Typography:                                │
│  Georgia / Times (body)    │  Archivo Black (headlines, ALL CAPS)       │
│  Impact / Arial Black      │  Inter / Helvetica Neue (body, sentence)   │
│  Mixed casing              │  Strict hierarchy, no italics              │
│                            │                                            │
│ Color:                     │ Color:                                     │
│  Red everywhere            │  Black bg / White text / Red accent only   │
│  Gray secondary text       │  Pure white for ALL text                   │
│  Muted palette             │  High contrast throughout                  │
│                            │                                            │
│ Hero:                      │ Hero:                                      │
│  5+ competing elements     │  1 idea: glass card, logo→H1→sub→CTA       │
│  Strikethrough copy        │  Clean, centered, animated entrance        │
│  Dark overlay (0.45)       │  Less darkened image (0.55–0.65 max)       │
│                            │                                            │
│ UI/Layout:                 │ UI/Layout:                                 │
│  Boxy rectangles           │  Rounded corners throughout                │
│  Tight element stacking    │  Generous negative space                   │
│  No border-radius          │  border-radius: 12px–24px system           │
└────────────────────────────┴────────────────────────────────────────────┘
```

---

## 1. Design Token Changes (globals.css)

### Color Palette: Before → After

```
BEFORE                              AFTER
─────────────────────────────────   ─────────────────────────────────
  ██████  --crimson:    #8F0000       ██████  --crimson:    #8F0000  (ACCENT ONLY)
  ██████  --near-black: #0D0D0D       ██████  --near-black: #0D0D0D  (PRIMARY BG)
  ██████  --soft-white: #F5F0EB       ██████  --white:      #FFFFFF  (PRIMARY TEXT)
  ██████  --steel-gray: #5A5A5A  ✗    ——      REMOVED (all uses → white)
  ██████  --surface-1:  #111111       ██████  --surface-1:  #111111
  ██████  --surface-2:  #161616       ██████  --surface-2:  #161616
  ██████  --border:     #1E1E1E       ██████  --border:     #1E1E1E

  COLOR USAGE RULES:
  ┌────────────────────────────────────────────┐
  │  --near-black  →  ALL backgrounds          │
  │  #FFFFFF       →  ALL text (primary only)  │
  │  --crimson     →  Primary CTA button ONLY  │
  │                   + key accent highlights  │
  │  (no gray text anywhere)                   │
  └────────────────────────────────────────────┘
```

### Exact Changes to `/home/pythia/bgf-vsl/app/globals.css`

```css
/* REMOVE --soft-white, --steel-gray. ADD --white. FIX body font. */

:root {
  --crimson: #8F0000;
  --near-black: #0D0D0D;
  --white: #FFFFFF;            /* NEW: replaces soft-white and steel-gray */
  --surface-1: #111111;
  --surface-2: #161616;
  --border: #1E1E1E;

  /* Typography scale */
  --font-display: 'Archivo Black', sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', sans-serif;

  /* Radius system */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

body {
  /* CHANGE: was Georgia/Times */
  font-family: var(--font-body);
  background-color: var(--near-black);
  color: var(--white);
}

h1, h2, h3 {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* REMOVE: any rule using --steel-gray or --soft-white */
```

**Variables to delete from codebase:**
- `--soft-white` — replace all usages with `--white` or `#FFFFFF`
- `--steel-gray` — replace ALL usages with `var(--white)` or `#FFFFFF`

---

## 2. Typography System Overhaul

### Font Hierarchy: Before → After

```
BEFORE                              AFTER
──────────────────────────────      ──────────────────────────────────────
H1                                  H1
  Font:  Impact / Arial Black         Font:  Archivo Black
  Case:  Mixed / Title Case           Case:  ALL CAPS (text-transform)
  Size:  varies                       Size:  clamp(2.5rem, 6vw, 5rem)
  Style: sometimes italic             Style: bold, NO italic
                                    
H2 / Subtitle                       H2 / Subtitle
  Font:  Georgia or fallback          Font:  Archivo Black (smaller)
  Case:  Mixed                        Case:  ALL CAPS
  Style: italic present               Style: bold, NO italic
                                    
Body / Paragraph                    Body / Paragraph
  Font:  Georgia / Times New Roman    Font:  Inter / Helvetica Neue
  Case:  Mixed                        Case:  Sentence case
  Style: italic quotes                Style: regular weight, NO italic
                                    
CTA Labels                          CTA Labels
  Font:  unspecified                  Font:  Archivo Black or Inter bold
  Case:  Mixed                        Case:  ALL CAPS for primary CTAs

  RULE: ZERO italic usage anywhere in the codebase.
  RULE: No decorative or serif fonts.
```

### Files Requiring Font Changes

```
FILE                             CHANGES NEEDED
──────────────────────────────   ──────────────────────────────────────────
app/layout.tsx                   ADD Archivo Black + Inter via next/font
                                 (see Section 8 for exact code)

app/globals.css                  CHANGE body font-family (line ~10)
                                 Georgia → var(--font-body) / Inter

components/ui.tsx                CHANGE Display component (line ~N)
                                 Impact/Arial Black → var(--font-display)
                                 ADD text-transform: uppercase
                                 REMOVE any fontStyle: 'italic'

components/HeroSection.tsx       Typography targets:
                                   Remove italic strikethrough block (L42-44)
                                   H1 → Archivo Black, ALL CAPS
                                   Subtitle → Inter, sentence case

components/CloseSection.tsx      Line 98-99: REMOVE italic from quote
                                   font-bold italic → font-bold only
                                   Check all text elements for Georgia/serif

components/ProblemSection.tsx    Audit for Georgia/italic usage
components/MethodSection.tsx     Audit for Georgia/italic usage
components/StandardSection.tsx   Audit for Georgia/italic usage
components/CultureSection.tsx    Audit for Georgia/italic usage
components/ObjectionsSection.tsx Audit for Georgia/italic usage
```

---

## 3. Color Audit & Fixes

### steel-gray and red: Current Distribution vs Target

```
CURRENT STATE — WHERE COLORS APPEAR
─────────────────────────────────────────────────────────────────
Component               --steel-gray used?    --crimson used?
──────────────────────  ──────────────────    ───────────────────
HeroSection.tsx         Possibly (logo text)  YES — logo text
CloseSection.tsx        YES (L31,52,73,81,    possibly pricing
                        88,91) CRITICAL
StickyCtaBar.tsx        YES (L32)             YES (button?)
ProblemSection.tsx      AUDIT NEEDED          AUDIT NEEDED
StandardSection.tsx     AUDIT NEEDED          AUDIT NEEDED
MethodSection.tsx       AUDIT NEEDED          AUDIT NEEDED
CultureSection.tsx      AUDIT NEEDED          AUDIT NEEDED
ObjectionsSection.tsx   AUDIT NEEDED          AUDIT NEEDED
VideoSection.tsx        AUDIT NEEDED          AUDIT NEEDED
MarqueeBar.tsx          AUDIT NEEDED          AUDIT NEEDED
globals.css             DEFINED HERE          DEFINED HERE

TARGET STATE — WHERE COLORS SHOULD APPEAR
─────────────────────────────────────────────────────────────────
  --steel-gray    →   NOWHERE (variable deleted, all → white)
  --crimson       →   Primary CTA buttons ONLY
                      Key accent elements (e.g. marquee highlight)
                      Logo accent (optional, small)
  --white         →   ALL body text
                      ALL headings
                      ALL subtitles
                      ALL secondary/supporting text
  --near-black    →   Backgrounds
  --surface-1/2   →   Card backgrounds, section backgrounds
```

### Component-Level Color Fix List

```
┌──────────────────────┬────────────────────────────────────────────────┐
│ Component            │ Color Fixes                                    │
├──────────────────────┼────────────────────────────────────────────────┤
│ CloseSection.tsx     │ L31:  color:"var(--steel-gray)" → white        │
│                      │ L52:  steel-gray → white                       │
│                      │ L73:  steel-gray → white                       │
│                      │ L81:  steel-gray → white                       │
│                      │ L88:  steel-gray → white                       │
│                      │ L91:  steel-gray → white                       │
│                      │ Pricing box: add borderRadius var(--radius-lg) │
├──────────────────────┼────────────────────────────────────────────────┤
│ StickyCtaBar.tsx     │ L32:  color:"var(--steel-gray)" → white        │
│                      │ L35-37: add borderRadius to button             │
├──────────────────────┼────────────────────────────────────────────────┤
│ HeroSection.tsx      │ Logo text: crimson → white                     │
│                      │ Image brightness: 0.45 → 0.60                  │
├──────────────────────┼────────────────────────────────────────────────┤
│ All other components │ Search: "steel-gray" globally → all → white    │
│                      │ Search: "soft-white" globally → all → white    │
│                      │ Crimson: only keep on primary CTA buttons       │
└──────────────────────┴────────────────────────────────────────────────┘
```

**Global search commands to run before implementation:**
```bash
grep -rn "steel-gray"  components/ app/
grep -rn "soft-white"  components/ app/
grep -rn "crimson"     components/ app/
grep -rn "5A5A5A"      components/ app/
grep -rn "F5F0EB"      components/ app/
grep -rn "Georgia"     components/ app/
grep -rn "italic"      components/ app/
```

---

## 4. Hero Section Redesign

### BEFORE — Current Layout (HeroSection.tsx)

```
┌─────────────────────────────────────────────────────────────┐
│  [Full-bleed hero image — brightness 0.45, very dark]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BGSC · Bad Girl Strength Club   ← crimson text     │   │
│  │  (no logo image, just styled text)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [H1 Main headline]                                 │   │
│  │                                                     │   │
│  │  ~~Stay light. Stay toned. Stay small.~~  ← ITALIC  │   │  ← REMOVE
│  │  strikethrough competing element                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Subtitle paragraph]                                       │
│                                                             │
│  [  CTA BUTTON (red)  ]                                     │
│                                                             │
│  No credit card required · Cancel anytime  ← REMOVE here   │
│                                                             │
│  [Scroll indicator]                                         │
└─────────────────────────────────────────────────────────────┘

PROBLEMS:
  ✗ 5+ elements competing for attention
  ✗ Strikethrough copy distracts from hero message
  ✗ "No credit card" adds friction at hero level
  ✗ Logo is just text in wrong color
  ✗ Image too dark (0.45 brightness)
  ✗ No card / structure to anchor content
```

### AFTER — New Layout (target)

```
┌─────────────────────────────────────────────────────────────┐
│  [Full-bleed hero image — brightness 0.60, clear + defined] │
│                                                             │
│         ╔═══════════════════════════════════╗              │
│         ║   GLASS CARD                      ║              │
│         ║   (backdrop-blur, rounded-2xl)    ║              │
│         ║   Animates: scale 0.92→1.0        ║              │
│         ║   + opacity 0→1 on load           ║              │
│         ║                                   ║              │
│         ║   ┌─────────────────────────┐     ║              │
│         ║   │  [BGSC LOGO — white]    │     ║              │
│         ║   │  wordmark or SVG        │     ║              │
│         ║   └─────────────────────────┘     ║              │
│         ║                                   ║              │
│         ║   ONE HEADLINE                    ║              │
│         ║   Archivo Black / ALL CAPS        ║              │
│         ║   white / large / bold            ║              │
│         ║                                   ║              │
│         ║   Short subtitle                  ║              │
│         ║   Inter / sentence case           ║              │
│         ║   white / comfortable size        ║              │
│         ║                                   ║              │
│         ║   ╔═══════════════════════╗       ║              │
│         ║   ║    JOIN NOW  (red)    ║       ║              │
│         ║   ╚═══════════════════════╝       ║              │
│         ║   rounded-lg, crimson bg          ║              │
│         ╚═══════════════════════════════════╝              │
│                                                             │
│              ▼  [scroll cue — keep]                         │
└─────────────────────────────────────────────────────────────┘

"No credit card required · Cancel anytime" → MOVED to signup modal only
Strikethrough copy → DELETED entirely
Logo crimson text → REPLACED with white wordmark/logo image
```

### Glass Card Implementation Spec

```tsx
// Animated glass card — add to HeroSection.tsx

// 1. Import (top of file)
import { useEffect, useState } from 'react';

// 2. State
const [visible, setVisible] = useState(false);
useEffect(() => { setVisible(true); }, []);

// 3. JSX — replaces current content wrapper
<div
  style={{
    transform: visible ? 'scale(1)' : 'scale(0.92)',
    opacity: visible ? 1 : 0,
    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
    background: 'rgba(13, 13, 13, 0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',                    // rounded-2xl
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '3rem 2.5rem',
    maxWidth: '560px',
    width: '90%',
    margin: '0 auto',
    textAlign: 'center',
  }}
>
  {/* Logo */}
  {/* H1 — ONE headline */}
  {/* Subtitle */}
  {/* CTA Button */}
</div>

// 4. Hero image — change brightness
// L24: filter: "brightness(0.45)"  →  filter: "brightness(0.60)"
```

### Changes to HeroSection.tsx Line Reference

```
LINE    ACTION        DESCRIPTION
──────  ────────────  ──────────────────────────────────────────────
24      CHANGE        brightness(0.45) → brightness(0.60)
36-39   CHANGE        Logo: crimson BGSC text → white wordmark
                      color: "var(--crimson)" → color: "#FFFFFF"
                      font → Archivo Black or use <img> if SVG available
42-44   DELETE        Entire strikethrough italic block
                      "Stay light. Stay toned. Stay small."
72-74   DELETE        "No credit card required · Cancel anytime"
                      (move this string to signup/modal component)
NEW     ADD           Wrap content in animated glass card div
NEW     ADD           useState + useEffect for entrance animation
```

---

## 5. Button & UI Radius System

### Radius Spec Per Element Type

```
ELEMENT TYPE              BEFORE          AFTER
──────────────────────    ────────────    ────────────────────────────
Primary CTA button        0px (square)    border-radius: 12px (--radius-md)
Secondary button          0px             border-radius: 8px  (--radius-sm)
Input fields              0px or 4px      border-radius: 8px  (--radius-sm)
Card / content panel      0px             border-radius: 24px (--radius-xl)
Glass hero card           N/A             border-radius: 24px (--radius-xl)
Pricing box               0px             border-radius: 16px (--radius-lg)
Image thumbnails          0px             border-radius: 12px (--radius-md)
Tag / badge pill          0px             border-radius: 999px (full pill)
Sticky CTA bar            0px             border-radius: 12px on button only
Marquee bar               N/A             No radius needed (full-width strip)

VISUAL REFERENCE:
  Square [0px]    →  Slightly rounded [8px]  →  Rounded [12px]  →  Card [24px]
  ┌──────┐           ╭──────╮                   ╭──────╮            ╭──────╮
  │      │           │      │                   │      │            │      │
  └──────┘           ╰──────╯                   ╰──────╯            ╰──────╯
  boxy/rigid         subtle polish              CTA buttons         cards/glass
```

### StickyCtaBar.tsx Button Fix (L35-37)

```tsx
// BEFORE (lines 35-37):
style={{
  backgroundColor: 'var(--crimson)',
  // no borderRadius
}}

// AFTER:
style={{
  backgroundColor: 'var(--crimson)',
  borderRadius: 'var(--radius-md)',   // 12px
  padding: '0.75rem 2rem',
  fontFamily: 'var(--font-display)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}}
```

### CloseSection.tsx Pricing Box Fix (L70)

```tsx
// BEFORE (line 70):
style={{
  border: '1px solid var(--border)',
  // no borderRadius
}}

// AFTER:
style={{
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',   // 16px
  padding: '2rem',
  background: 'var(--surface-1)',
}}
```

---

## 6. Component-by-Component Change Log

```
PRIORITY LEGEND:
  P1 = Visual (color, contrast, radius) — do first, highest impact
  P2 = Typography (fonts, casing, italic removal)
  P3 = Content (text removal/movement, copy changes)
```

### HeroSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ HeroSection.tsx                                                     │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ L24: image brightness 0.45 → 0.60                            │
│ P1   │ Wrap content in glass card (backdrop-blur, rounded-2xl)      │
│ P1   │ Glass card entrance animation (scale + opacity)              │
│ P1   │ L36-39: Logo color → white; consider SVG logo file           │
│ P2   │ H1: ensure Archivo Black, ALL CAPS, white                    │
│ P2   │ Subtitle: ensure Inter, sentence case, white                 │
│ P2   │ CTA button: Archivo Black or Inter bold, ALL CAPS label      │
│ P3   │ L42-44: DELETE strikethrough italic block entirely           │
│ P3   │ L72-74: DELETE "No credit card" from hero                    │
│      │         ADD same string to signup modal component            │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### VideoSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ VideoSection.tsx                                                    │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ AUDIT: any steel-gray → white                                │
│ P1   │ Video container: add border-radius var(--radius-lg)          │
│ P2   │ Section heading: Archivo Black, ALL CAPS                     │
│ P2   │ Body text: Inter, no italic                                  │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### MarqueeBar.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ MarqueeBar.tsx                                                      │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ AUDIT: steel-gray usage → white                              │
│ P1   │ Accent/highlight items: ensure crimson is only accent        │
│ P2   │ Marquee text: Archivo Black or Inter bold, ALL CAPS          │
│ P2   │ REMOVE any italic                                            │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### ProblemSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ ProblemSection.tsx                                                  │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ AUDIT: steel-gray → white                                    │
│ P1   │ Any card/box: add border-radius                              │
│ P1   │ Reduce negative space tightness — add padding/margin         │
│ P2   │ Section H2: Archivo Black, ALL CAPS                          │
│ P2   │ Body copy: Inter, sentence case, no italic                   │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### StandardSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ StandardSection.tsx                                                 │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ AUDIT: steel-gray → white                                    │
│ P1   │ Cards/panels: add border-radius var(--radius-lg)             │
│ P1   │ Add more vertical spacing between stacked elements           │
│ P2   │ Headings: Archivo Black, ALL CAPS                            │
│ P2   │ Body: Inter, no italic                                       │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### MethodSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ MethodSection.tsx                                                   │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ AUDIT: steel-gray → white                                    │
│ P1   │ Method step cards: rounded corners                           │
│ P1   │ Crimson usage: limit to numbered step accent or dividers     │
│ P2   │ Step headings: Archivo Black, ALL CAPS                       │
│ P2   │ Body: Inter, sentence case, no italic                        │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### CultureSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ CultureSection.tsx                                                  │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ AUDIT: steel-gray → white                                    │
│ P1   │ Image containers: add border-radius var(--radius-md)         │
│ P1   │ Check image overlay darkness — reduce filters if any         │
│ P2   │ Section heading: Archivo Black, ALL CAPS                     │
│ P2   │ Captions/body: Inter, sentence case                          │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### ObjectionsSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ ObjectionsSection.tsx                                               │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ AUDIT: steel-gray → white                                    │
│ P1   │ Objection cards: add border-radius var(--radius-lg)          │
│ P1   │ Add vertical spacing between objection items                 │
│ P2   │ Objection headings: Archivo Black, ALL CAPS                  │
│ P2   │ Answer body: Inter, sentence case, no italic                 │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### CloseSection.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ CloseSection.tsx                      *** HIGHEST PRIORITY ***      │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ L31: color:"var(--steel-gray)" → color:"var(--white)"        │
│ P1   │ L52: steel-gray → white                                      │
│ P1   │ L73: steel-gray → white                                      │
│ P1   │ L81: steel-gray → white                                      │
│ P1   │ L88: steel-gray → white                                      │
│ P1   │ L91: steel-gray → white                                      │
│ P1   │ L70: pricing box → add borderRadius: "var(--radius-lg)"      │
│      │      add background: "var(--surface-1)"                      │
│ P2   │ L98-99: REMOVE italic from quote                             │
│      │         font-bold italic → font-bold only                    │
│ P2   │ All headings: Archivo Black, ALL CAPS                        │
│ P2   │ All body: Inter, sentence case                               │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### StickyCtaBar.tsx

```
┌─────────────────────────────────────────────────────────────────────┐
│ StickyCtaBar.tsx                                                    │
├──────┬────────────────────────────────────────────────────────────  │
│ P1   │ L32: color:"var(--steel-gray)" → color:"var(--white)"        │
│ P1   │ L35-37: CTA button → add borderRadius: "var(--radius-md)"   │
│ P1   │ Bar background: ensure var(--near-black) or surface-1        │
│ P2   │ CTA button label: Archivo Black or Inter bold, ALL CAPS      │
│ P2   │ Supporting text: Inter, white, sentence case                 │
└──────┴────────────────────────────────────────────────────────────  ┘
```

### ui.tsx (Display component)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ui.tsx — Display component                                          │
├──────┬────────────────────────────────────────────────────────────  │
│ P2   │ fontFamily: "'Impact','Arial Black',sans-serif"              │
│      │  → fontFamily: "var(--font-display)"                         │
│      │    (Archivo Black, registered via next/font)                 │
│ P2   │ ADD: textTransform: 'uppercase'                              │
│ P2   │ ADD: letterSpacing: '0.02em'                                 │
│ P2   │ REMOVE: any fontStyle: 'italic' if present                   │
│ P1   │ AUDIT: any hardcoded color values → CSS variables            │
└──────┴────────────────────────────────────────────────────────────  ┘
```

---

## 7. Implementation Order

### Phased Work Plan

```
╔══════════════════════════════════════════════════════════════════╗
║  PHASE 1 — Foundation (do this FIRST, 30–45 min)                ║
║  Affects every component. Do before touching any component.      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  1a. app/layout.tsx                                              ║
║      └─ Add Archivo Black + Inter via next/font/google           ║
║         (see Section 8 for exact code)                           ║
║                                                                  ║
║  1b. app/globals.css                                             ║
║      ├─ Add --white: #FFFFFF                                     ║
║      ├─ Delete --steel-gray, --soft-white                        ║
║      ├─ Add --font-display, --font-body                          ║
║      ├─ Add --radius-* variables                                 ║
║      ├─ Fix body font-family                                     ║
║      └─ Add h1/h2/h3 base rules (uppercase, Archivo)             ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  PHASE 2 — Quick Wins (30–45 min)                                ║
║  Visible, high-impact, minimal structural change                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  2a. components/CloseSection.tsx                                 ║
║      └─ Fix all 6 steel-gray → white lines (L31,52,73,81,88,91) ║
║         Fix pricing box border-radius (L70)                      ║
║         Remove italic from quote (L98-99)                        ║
║                                                                  ║
║  2b. components/StickyCtaBar.tsx                                 ║
║      └─ Fix steel-gray L32 → white                               ║
║         Add border-radius to button (L35-37)                     ║
║                                                                  ║
║  2c. components/ui.tsx                                           ║
║      └─ Fix Display component font → Archivo Black               ║
║         Add uppercase + letter-spacing                           ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  PHASE 3 — Hero Redesign (45–60 min)                             ║
║  Structural change to most visible section                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  3a. HeroSection.tsx — content cleanup                           ║
║      ├─ Remove strikethrough block (L42-44)                      ║
║      ├─ Remove "No credit card" line (L72-74)                    ║
║      └─ Update logo: crimson text → white wordmark               ║
║                                                                  ║
║  3b. HeroSection.tsx — glass card                                ║
║      ├─ Add useState + useEffect for animation                   ║
║      ├─ Wrap content in animated glass card div                  ║
║      └─ Update image brightness 0.45 → 0.60                      ║
║                                                                  ║
║  3c. Move "No credit card" copy                                  ║
║      └─ Add to signup/modal component (wherever CTA modal lives) ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  PHASE 4 — Remaining Components (60–90 min)                      ║
║  Audit + fix each remaining component                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  4a. Global steel-gray audit                                     ║
║      grep -rn "steel-gray" components/ app/ → fix all            ║
║                                                                  ║
║  4b. Per-component: radius, spacing, typography                  ║
║      Order: VideoSection → MarqueeBar → ProblemSection           ║
║             → StandardSection → MethodSection → CultureSection  ║
║             → ObjectionsSection                                   ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  PHASE 5 — QA & Polish (30 min)                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  5a. Visual review: check contrast on all text                   ║
║  5b. Verify crimson ONLY appears on primary CTAs                 ║
║  5c. Verify ZERO italic usage (grep -rn "italic" components/)    ║
║  5d. Verify ZERO steel-gray / soft-white (grep above)            ║
║  5e. Test glass card animation on mobile viewport                ║
║  5f. Test sticky bar on scroll                                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

TOTAL ESTIMATED TIME: 3.5 – 4.5 hours
PHASES 1+2: Can be done in a single sitting (1.5h, all quick wins)
PHASE 3: Hero redesign — most complex single piece
PHASE 4: Systematic pass, mostly find-replace patterns
```

---

## 8. New Font Setup (layout.tsx via next/font/google)

### Exact Code for `/home/pythia/bgf-vsl/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Archivo_Black, Inter } from 'next/font/google';
import './globals.css';

// ─── Font definitions ──────────────────────────────────────────────────────
const archivoBlack = Archivo_Black({
  weight: '400',           // Archivo Black only has weight 400 (it's already black/bold by design)
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// ─── Metadata ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Bad Girl Strength Club',
  description: 'Strong. Athletic. Feminine.',
};

// ─── Root Layout ───────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Why This Works

```
next/font/google automatically:
  ├─ Downloads fonts at build time (no runtime requests)
  ├─ Self-hosts them for performance
  ├─ Generates CSS variables: --font-display, --font-body
  └─ Applies font-display: swap for no FOUT

Then in globals.css:
  body  { font-family: var(--font-body);    }   → Inter
  h1,h2 { font-family: var(--font-display); }   → Archivo Black

And in ui.tsx Display component:
  fontFamily: "var(--font-display)"              → Archivo Black

NOTE: Archivo Black weight '400' IS the heavy black weight.
      The typeface name "Black" = the weight.
      Do NOT use fontWeight: 700 on top of it — redundant.
```

### Fallback Stack for globals.css

```css
:root {
  --font-display: 'Archivo Black', 'Arial Black', 'Impact', sans-serif;
  --font-body:    'Inter', 'Helvetica Neue', Arial, sans-serif;
}
```

Note: When next/font injects via CSS variable, the above fallbacks in `:root` are overridden by the injected variable at runtime. Keep them as safety fallback for SSR flash.

---

## Appendix: Verification Checklist

After completing all phases, run through this checklist:

```
TYPOGRAPHY
  [ ] No Georgia or Times New Roman anywhere in codebase
  [ ] No Impact or Arial Black hardcoded in style props
  [ ] No italic text anywhere (grep: "italic" in components/)
  [ ] All H1/H2 headings render in Archivo Black, ALL CAPS
  [ ] All body text renders in Inter, sentence case
  [ ] Archivo Black renders correctly in browser (check Network tab)

COLOR
  [ ] --steel-gray variable deleted from globals.css
  [ ] --soft-white variable deleted from globals.css
  [ ] Zero references to steel-gray in components (grep confirms)
  [ ] Zero references to soft-white in components (grep confirms)
  [ ] --crimson ONLY appears on: primary CTA buttons + 1-2 accents
  [ ] All text (body, subtitles, captions) is pure white

HERO SECTION
  [ ] Strikethrough italic block completely removed
  [ ] "No credit card required" NOT visible in hero
  [ ] "No credit card required" IS visible inside signup modal
  [ ] Logo is white (not crimson text)
  [ ] Hero image is visibly lighter (0.60 brightness, not 0.45)
  [ ] Glass card animates in on page load (scale + fade)
  [ ] Glass card has backdrop-blur effect
  [ ] Glass card has rounded corners (24px)
  [ ] Only ONE clear headline visible in hero

UI / LAYOUT
  [ ] All primary CTA buttons have border-radius: 12px
  [ ] Pricing box in CloseSection has border-radius: 16px
  [ ] No completely square buttons anywhere
  [ ] Sections have adequate negative space (not packed tight)

OVERALL
  [ ] Site looks high-contrast, clean, powerful on mobile
  [ ] Site looks high-contrast, clean, powerful on desktop
  [ ] No washed-out or low-contrast text anywhere
  [ ] Scroll cue present below hero
  [ ] Sticky CTA bar functional on scroll
```

---

*Plan authored from client feedback doc (8 sections) and live code audit.*
*All line numbers reference the codebase state at time of writing (2026-04-04).*
*Line numbers in components may shift after edits — complete phases in order.*
