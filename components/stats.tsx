"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Stat = {
  number: number;
  suffix?: string;
  label: string;
};

const STATS: Stat[] = [
  { number: 1200, suffix: "+", label: "Active Women" },
  { number: 16, suffix: " Weeks", label: "Structured System" },
  { number: 94, suffix: "%", label: "Completed all phases" },
];

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate(latest) {
        setDisplay(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-16 text-center">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p
                className="text-3xl md:text-5xl font-black text-white"
                style={{ fontFamily: "var(--font-display, 'Poppins', sans-serif)" }}
              >
                <Counter value={s.number} suffix={s.suffix} />
              </p>

              <p
                className="text-xs mt-2 uppercase tracking-widest"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "var(--font-display, 'Poppins', sans-serif)",
                }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}