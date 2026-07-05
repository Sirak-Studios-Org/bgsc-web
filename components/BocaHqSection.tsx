"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Display } from "./ui";

// TODO[bgsc]: swap placeholder community shots for actual Boca HQ exterior + training-floor photos when assets land
const HQ_IMAGES = [
  { src: "/images/community-1.jpg", alt: "Boca Raton HQ training floor" },
  { src: "/images/community-3.jpg", alt: "Coached repetition at HQ" },
  { src: "/images/community-4.jpg", alt: "Boca HQ rack lineup" },
];

export default function BocaHqSection({ onCta }: { onCta: () => void }) {
  return (
    <section id="hq" className="py-24 px-6" style={{ background: "var(--surface-1)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Copy */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.35em] mb-6"
              style={{ color: "var(--crimson)", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
            >
              The Flagship · Boca Raton
            </p>
            <Display className="text-3xl sm:text-4xl md:text-5xl mb-6 leading-[1.05]">
              Where The New Standard{" "}
              <span style={{ color: "var(--crimson)" }}>Lives.</span>
            </Display>
            <p className="text-base md:text-lg leading-relaxed text-soft-white/85 mb-6">
              The Boca HQ is the physical proof of the brand — a members-only training environment where the method is taught, filmed, and held to the standard.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-soft-white/85 mb-10">
              Immersed members train on-site with Steph and the BGSC coaching team. It is not a gym you join. It is a club you are coached inside.
            </p>

            <button
              onClick={onCta}
              className="h-[56px] px-9 bg-soft-white text-near-black uppercase font-bold text-[11px] md:text-xs tracking-[0.25em] cursor-pointer transition-all duration-300 hover:bg-ash"
              style={{ borderRadius: "2px" }}
            >
              Apply for Immersed
            </button>
          </motion.div>

          {/* Image collage */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[420px] md:h-[520px]">
              <div className="relative col-span-2 md:col-span-1 row-span-2 overflow-hidden border border-border">
                <Image
                  src={HQ_IMAGES[0].src}
                  alt={HQ_IMAGES[0].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover select-none pointer-events-none"
                  style={{ filter: "brightness(0.7) contrast(1.1)" }}
                />
              </div>
              <div className="relative overflow-hidden border border-border hidden md:block">
                <Image
                  src={HQ_IMAGES[1].src}
                  alt={HQ_IMAGES[1].alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover select-none pointer-events-none"
                  style={{ filter: "brightness(0.7) contrast(1.1)" }}
                />
              </div>
              <div className="relative overflow-hidden border border-border hidden md:block">
                <Image
                  src={HQ_IMAGES[2].src}
                  alt={HQ_IMAGES[2].alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover select-none pointer-events-none"
                  style={{ filter: "brightness(0.7) contrast(1.1)" }}
                />
              </div>
            </div>

            {/* Community channel link */}
            {/* TODO[bgsc]: wire real community channel URL (Telegram / Discord) */}
            <a
              href="#"
              className="inline-flex items-center gap-2 mt-6 text-xs uppercase tracking-[0.3em] text-ash hover:text-soft-white transition-colors"
            >
              <span className="w-2 h-2 bg-crimson" />
              Join the BGSC community channel →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
