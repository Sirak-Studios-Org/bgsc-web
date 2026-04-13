import { motion } from "framer-motion";

const WORDS = [
  "EAT CLEAN", "LIFT HEAVY", "GET COACHED", "BAD GIRL STRENGTH CLUB",
  "NOT SMALL", "STRENGTH IS FEMININE", "BGSC", "DONE PLAYING SMALL",
];

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <div className="marquee-track" aria-hidden={hidden}>
      {WORDS.map((w, i) => (
        <span key={i}
          className="text-xs font-bold uppercase tracking-[0.35em] py-px mx-8 shrink-0"
          style={{
            fontFamily: "var(--font-display, 'Poppins', sans-serif)",
            color: "#FFFFFF",
            opacity: i % 4 === 3 ? 0.45 : 1,
          }}>
          {w}
        </span>
      ))}
    </div>
  );
}

export default function MarqueeBar() {
  return (
    <motion.div 
      initial={{ rotate: 0 }}
      whileInView={{ rotate: -2 }}
      viewport={{ margin: "-100px" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
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
