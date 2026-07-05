/**
 * BGSC Image Generation — fal.ai FLUX
 * Generates all hero/section images per the BGSC visual standard:
 * "Fashion campaign crossed with a strength manifesto."
 * High-contrast, cinematic, editorial. NO influencer poses. NO pastel wellness.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/images");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Provide via env, never commit a key: `FAL_KEY=... node scripts/generate-images.mjs`
const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("FAL_KEY env var is required (get one at https://fal.ai). Aborting.");
  process.exit(1);
}

const BASE_STYLE =
  "cinematic editorial photography, high contrast, dramatic lighting, deep shadows, " +
  "black and white with near-black tones, fashion campaign aesthetic, strength manifesto, " +
  "powerful feminine energy, no influencer poses, no gym selfies, no pastel colors, " +
  "no bright cheerful lighting, strong posture and embodied confidence, photorealistic";

const IMAGES = [
  {
    name: "hero-bg",
    size: "landscape_16_9",
    prompt: `${BASE_STYLE}. Full-bleed hero image: strong athletic Black woman with a heavy barbell across her shoulders in the bottom of a squat, dark industrial gym, smoke and chalk dust in the air, dramatic overhead spotlight, powerful posture, direct fierce gaze into camera, editorial Vogue-meets-strength-manifesto composition`,
  },
  {
    name: "problem-before",
    size: "portrait_4_3",
    prompt: `${BASE_STYLE}. A woman standing in a bright generic gym looking frustrated and constrained, holding tiny pink dumbbells at her sides, surrounded by pastel workout equipment, expression of quiet exhaustion and refusal, the feeling of being told to stay small, moody underexposed, cinematic`,
  },
  {
    name: "standard-power",
    size: "portrait_3_4",
    prompt: `${BASE_STYLE}. Strong Latina athletic woman standing tall in a dark gym, arms at sides, direct commanding eye contact, dramatic side lighting carving muscle definition, short cropped athletic wear, the posture of a founder not a fitness influencer, editorial portrait, conviction`,
  },
  {
    name: "eat-clean",
    size: "landscape_4_3",
    prompt: `${BASE_STYLE}. Extreme close-up of a woman's hands gripping a barbell, chalk dust suspended in air, veins and muscle texture visible, iron plate edge in background, texture of skin and iron, discipline captured in a single moment, macro cinematic`,
  },
  {
    name: "lift-heavy",
    size: "landscape_4_3",
    prompt: `${BASE_STYLE}. Athletic woman mid-deadlift, heavy barbell at knee height, deep concentration, jaw set, back straight, dark gym floor, dramatic low lighting from the side, muscle engagement visible through clothing, raw strength editorial`,
  },
  {
    name: "get-coached",
    size: "landscape_4_3",
    prompt: `${BASE_STYLE}. Athletic woman completing an overhead press, barbell locked out above head, triumphant but composed, dark background, spotlight from above, silhouette of strength, powerful femininity, the culmination of months of discipline`,
  },
  {
    name: "community-1",
    size: "landscape_16_9",
    prompt: `${BASE_STYLE}. Wide shot of a diverse group of strong women in a dark gym, three women lifting together, candid moment of community and shared effort, chalk in the air, laughing and intense simultaneously, real women not models`,
  },
  {
    name: "community-2",
    size: "square",
    prompt: `${BASE_STYLE}. Two women spotting each other on bench press, dark gym, trust and accountability, close crop, editorial`,
  },
  {
    name: "community-3",
    size: "square",
    prompt: `${BASE_STYLE}. Close-up of a woman chalking her hands before a heavy lift, chalk dust floating, ritual and preparation, cinematic`,
  },
  {
    name: "community-4",
    size: "landscape_4_3",
    prompt: `${BASE_STYLE}. Woman sitting on a weight bench between sets, sweat glistening, looking focused and powerful, not exhausted — intentional rest, dark background, cinematic portrait`,
  },
  {
    name: "close-triumph",
    size: "portrait_3_4",
    prompt: `${BASE_STYLE}. Strong athletic woman making direct eye contact with camera, slight confident smile, dark background, dramatic portrait lighting, post-workout but composed, founder energy, this is someone who chose a stronger standard, powerful and feminine simultaneously`,
  },
  {
    name: "avatar-1",
    size: "square",
    prompt: `${BASE_STYLE}. Headshot portrait of a strong Latina woman in her late 20s, confident smile, athletic build, dark background, editorial lighting, natural beauty`,
  },
  {
    name: "avatar-2",
    size: "square",
    prompt: `${BASE_STYLE}. Headshot portrait of a strong Black woman in her early 30s, warm knowing expression, gym setting softly blurred behind her, editorial lighting`,
  },
  {
    name: "avatar-3",
    size: "square",
    prompt: `${BASE_STYLE}. Headshot portrait of a strong woman in her mid-30s with blonde hair, determined expression, confident, dark background, editorial portrait`,
  },
];

async function generateImage(img) {
  const outPath = path.join(OUT_DIR, `${img.name}.jpg`);
  if (fs.existsSync(outPath)) {
    console.log(`  ✓ ${img.name} already exists, skipping`);
    return outPath;
  }

  console.log(`  ⟳ Generating: ${img.name}...`);

  const res = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: img.prompt,
      image_size: img.size,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`fal.ai error for ${img.name}: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) throw new Error(`No image URL returned for ${img.name}`);

  // Download the image
  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✓ Saved: ${img.name}.jpg (${Math.round(buffer.length / 1024)}KB)`);
  return outPath;
}

async function main() {
  console.log(`\nBGSC Image Generation — ${IMAGES.length} images\n`);
  let ok = 0, fail = 0;
  for (const img of IMAGES) {
    try {
      await generateImage(img);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${img.name}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone — ${ok} generated, ${fail} failed\n`);
}

main();
