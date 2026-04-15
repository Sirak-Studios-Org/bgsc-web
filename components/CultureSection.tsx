"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Eyebrow, Display } from "./ui";

const TESTIMONIALS = [
  {
    quote: "I spent 10 years chasing a smaller body. In 16 weeks I stopped caring about size and started caring about what I could DO. I deadlifted 185 lbs. I cried.",
    name: "Mariana D.", tag: "Phase 3 graduate", img: "/images/avatar-1.jpg",
  },
  {
    quote: "They told me I'd get bulky. I didn't. I got powerful. There's a difference and now I know why Steph calls it a new standard! This has changed every aspect of my daily life.",
    name: "Kezia T.", tag: "12 weeks in", img: "/images/avatar-2.jpg",
  },
  {
    quote: "Its not just an online course, its my Family! The women I met in the club have become my  closest friends and I have unlocked levels to myself I never knew existed before.",
    name: "Simone A.", tag: "Community member, 8 months", img: "/images/avatar-3.jpg",
  },
];

const STATS = [
  { number: "1,200+", label: "Active Members" },
  { number: "94%", label: "Complete All 3 Phases" },
  { number: "16 wks", label: "Full System" },
];

export default function CultureSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--near-black)" }}>
      <div className="max-w-5xl mx-auto">

        <motion.div className="mb-16" initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          {/* <Eyebrow>Culture &amp; Outcomes</Eyebrow> */}
          <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
            More Than a{" "}
            <span style={{ color: "var(--crimson)" }}>Workout Plan.</span>
          </Display>
          <p className="text-sm md:text-base max-w-3xl leading-relaxed"
            style={{ color: "var(--ash)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
            A new standard for women who are done playing small. Will you accept the challenge?
          </p>
        </motion.div>

        {/* Community image collage */}
        <motion.div className="mb-16 md:mb-6 overflow-hidden"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}>

          {/* Mobile: simple 2-col grid */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {[
              {
                src: "/images/community-1.jpg",
                alt: "BGSC community",
                clip: "polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)",
              },
              {
                src: "/images/community-2.jpg",
                alt: "Members training together",
                clip: "polygon(0 0, 100% 0, 100% 100%, 15% 100%, 0 85%)",
              },
              {
                src: "/images/community-3.jpg",
                alt: "Chalk and preparation",
                clip: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)",
              },
              {
                src: "/images/community-4.jpg",
                alt: "Rest between sets",
                clip: "polygon(15% 0, 100% 0, 100% 100%, 0 100%, 0% 15%)",
              },
            ].map((img) => (
              <div key={img.src} className="relative" style={{ height: 160 }}>

                {/* Border Container */}
                <div
                  className="w-full h-full bg-border p-px"
                  style={{ clipPath: img.clip }}
                >

                  {/* Image Wrapper */}
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{ clipPath: img.clip }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover select-none pointer-events-none brightness-80"
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Desktop: editorial collage */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <div className="col-span-2 relative" style={{ height: 320 }}>
              <Image src="/images/community-1.jpg" alt="BGSC community" fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover select-none pointer-events-none border border-border brightness-80" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="relative flex-1" style={{ minHeight: 156 }}>
                <Image src="/images/community-2.jpg" alt="Members training together" fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover select-none pointer-events-none border border-border brightness-80" />
              </div>
              <div className="relative flex-1">
                <Image src="/images/community-3.jpg" alt="Chalk and preparation" fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover select-none pointer-events-none border border-border brightness-80" />
              </div>
            </div>
            <div className="relative" style={{ height: 200 }}>
              <Image src="/images/community-4.jpg" alt="Rest between sets" fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover select-none pointer-events-none border border-border brightness-80" />
            </div>
            <div className="col-span-2 relative" style={{ height: 200 }}>
              <Image src="/images/community-5.jpg" alt="The barbell" fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover object-top select-none pointer-events-none border border-border brightness-80" />
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((v, i) => (
            <motion.div key={v.name} className="p-6 flex flex-col bg-surface-1 border border-border"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border">
                  <Image src={v.img} alt={v.name} fill sizes="48px" className="object-cover select-none pointer-events-none" />
                </div>
                <div>
                  <p className="text-sm font-bold"
                    style={{ color: "#FFFFFF", fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}>{v.name}</p>
                  <p className="text-xs mt-0.5"
                    style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>{v.tag}</p>
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: "var(--crimson)", letterSpacing: "0.1em" }}>★★★★★</p>
              <p className="text-sm leading-relaxed flex-1"
                style={{ color: "#FFFFFF", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
                &ldquo;{v.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
