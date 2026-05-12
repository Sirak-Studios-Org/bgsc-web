import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const WORDS = [
  "NOURISH", "TRAIN", "CONNECT", "STRENGTH IS A STANDARD, NOT A MOOD", "BAD GIRL STRENGTH CLUB",
];

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <div className="marquee-track flex items-center" aria-hidden={hidden}>
      {WORDS.map((w, i) => (
        <React.Fragment key={i}>
          <span
            className="text-[16px] md:text-xl font-bold uppercase tracking-[0.35em] shrink-0"
            style={{
              fontFamily: "var(--font-display, 'Poppins', sans-serif)",
              color: "var(--soft-white)",
            }}>
            {w}
          </span>
          <div className="mx-10 md:mx-16 shrink-0 opacity-60">
            <Image src="/images/logo-notext.svg" alt="" width={160} height={40} className="h-[1.4rem] md:h-[1.6rem] w-auto select-none" />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function MarqueeBar() {
  return (
    <motion.div
      className="overflow-hidden flex bg-surface-1 py-[14px] md:py-[18px]"
      style={{
        background: "var(--crimson)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        transformOrigin: "center center",
      }}>
      <Track />
      <Track hidden />
    </motion.div>
  );
}
