import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const WORDS = [
  "EAT CLEAN", "LIFT HEAVY", "GET COACHED", "BAD GIRL STRENGTH CLUB",
];

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <div className="marquee-track flex items-center" aria-hidden={hidden}>
      {WORDS.map((w, i) => (
        <React.Fragment key={i}>
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.35em] shrink-0"
            style={{
              fontFamily: "var(--font-display, 'Poppins', sans-serif)",
              color: "var(--soft-white)",
            }}>
            {w}
          </span>
          <div className="mx-8 md:mx-10 shrink-0 opacity-60">
            <Image src="/images/logo-notext.svg" alt="" width={80} height={20} className="h-3.5 w-auto select-none" />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function MarqueeBar() {
  return (
    <motion.div 
      className="overflow-hidden flex bg-surface-1"
      style={{
        background: "var(--crimson)",
        borderTop: "1px solid rgba(255,255,255,0.12)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        padding: "10px 0",
        transformOrigin: "center center",
      }}>
      <Track />
      <Track hidden />
    </motion.div>
  );
}
