"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Display } from "./ui";

const STATS = [
  { number: "1,200+", label: "Active Members" },
  { number: "94%", label: "Complete All 3 Phases" },
  { number: "16 wks", label: "Full System" },
];

export default function CultureSection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--near-black)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Display className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-[1.05]">
            More Than a{" "}
            <span style={{ color: "var(--crimson)" }}>Workout Plan.</span>
          </Display>
        </motion.div>

        <motion.div
          className="mb-16 md:mb-6 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {[
              {
                src: "/images/community-1.jpg",
                alt: "BGSC community",
                clip:
                  "polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)",
              },
              {
                src: "/images/community-2.jpg",
                alt: "Members training together",
                clip:
                  "polygon(0 0, 100% 0, 100% 100%, 15% 100%, 0 85%)",
              },
              {
                src: "/images/community-3.jpg",
                alt: "Chalk and preparation",
                clip:
                  "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)",
              },
              {
                src: "/images/community-4.jpg",
                alt: "BGSC community training",
                clip:
                  "polygon(15% 0, 100% 0, 100% 100%, 0 100%, 0% 15%)",
              },
            ].map((img) => (
              <div
                key={img.src}
                className="relative"
                style={{ height: 160 }}
              >
                <div
                  className="w-full h-full bg-border p-px"
                  style={{ clipPath: img.clip }}
                >
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{ clipPath: img.clip }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 50vw"
                      className="object-cover select-none pointer-events-none brightness-80"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:grid grid-cols-3 gap-6">
            <div className="col-span-2 relative h-[320px] overflow-hidden">
              <Image
                src="/images/community-1.jpg"
                alt="BGSC community"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover object-center select-none pointer-events-none border border-border brightness-80"
              />
            </div>

            <div className="relative h-[320px] overflow-hidden">
              <Image
                src="/images/community-2.jpg"
                alt="Members training together"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center select-none pointer-events-none border border-border brightness-80"
              />
            </div>

            <div className="relative h-[240px] overflow-hidden">
              <Image
                src="/images/community-3.jpg"
                alt="Chalk and preparation"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center select-none pointer-events-none border border-border brightness-80"
              />
            </div>

            <div className="col-span-2 relative h-[240px] overflow-hidden">
              <Image
                src="/images/community-4.jpg"
                alt="BGSC community training"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover object-center select-none pointer-events-none border border-border brightness-80"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}