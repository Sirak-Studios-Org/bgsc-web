"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Eyebrow, Display } from "./ui";

const PROBLEMS = [
  {
    hook: "The problem was never your discipline.",
    body: "You've started programs. You've been consistent. But the programs were built around the wrong goal shrinking. No system designed for less will ever produce more.",
  },
  {
    hook: "You don't lack motivation. You lack a standard.",
    body: "Motivation is temporary. A standard is permanent. Bad Girl Strength Club gives you the standard the fitness industry never offered you.",
  },
  {
    hook: "You've been training alone in a room built against you.",
    body: "The environment you train in shapes the woman you become. When your circle doesn't lift heavy, you won't either. BGSC puts you inside a culture where strength is the baseline not the exception.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-24 px-6 bg-surface-1">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Dual Images */}
          <motion.div
            className="lg:col-span-5 grid grid-cols-1 gap-4 lg:gap-6 lg:mb-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Image 1 */}
            <div
              className="bg-border p-px w-full aspect-10/9"
              style={{ clipPath: "polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)" }}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={{ clipPath: "polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)" }}
              >
                <Image
                  src="/images/community-1.jpg"
                  alt="The old standard — Section 1"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Image 2 */}
            <div
              className="bg-border p-px w-full aspect-10/9"
              style={{ clipPath: "polygon(0 0, 80% 0, 100% 20%, 100% 100%, 20% 100%, 0 80%)" }}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={{ clipPath: "polygon(0 0, 80% 0, 100% 20%, 100% 100%, 20% 100%, 0 80%)" }}
              >
                <Image
                  src="/images/community-4.jpg"
                  alt="The old standard — Section 2"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center select-none pointer-events-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* <Eyebrow className="mb-4">What Actually Happened</Eyebrow> */}
            <Display className="text-3xl sm:text-4xl md:text-5xl mb-10 leading-[1.05]">
              You Were Taught to{" "}
              <span className="text-crimson">Train for Less.</span>
            </Display>

            <div className="space-y-5">
              {PROBLEMS.map((p, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group"
                >
                  <p className="text-base md:text-lg font-bold mb-1.5 uppercase tracking-wider flex items-start gap-2">
                    <span className="aspect-square bg-crimson w-1.5 h-1.5 rounded-full mt-2" />
                    <span className="text-soft-white">{p.hook}</span>
                  </p>
                  <p className="text-sm md:text-base leading-relaxed text-ash pl-3.5">
                    {p.body}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div className="mt-10 pt-10 border-t border-crimson"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
              <p className="text-md md:text-xl font-bold uppercase tracking-tight leading-snug text-soft-white">
                If you are looking for permission to stay small, this is not for you.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
