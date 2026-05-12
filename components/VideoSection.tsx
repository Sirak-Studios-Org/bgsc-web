"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isShakingNow, setIsShakingNow] = useState(false);
  const VIDEO_EMBED_URL = process.env.NEXT_PUBLIC_VIDEO_EMBED_URL ?? "";

  const shakeAmplitude = 2;
  const shakeSpeed = 9;

  const shakeActiveMs = 700;
  const shakeRestMs = 1800;
  const initialDelayMs = 800;

  useEffect(() => {
    if (isPlaying || hasClicked) {
      setIsShakingNow(false);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const rest = () => {
      if (cancelled) return;
      setIsShakingNow(false);
      timeout = setTimeout(shake, shakeRestMs);
    };
    const shake = () => {
      if (cancelled) return;
      setIsShakingNow(true);
      timeout = setTimeout(rest, shakeActiveMs);
    };

    timeout = setTimeout(shake, initialDelayMs);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isPlaying, hasClicked]);

  // Glow mode: 'static' (solid border/glow) or 'spinning' (circling border)
  let glowMode = 'static';

  // Convert speed level to a duration (speed 1 = ~1.0s, speed 10 = ~0.1s)
  const shakeDuration = `${Math.max(0.1, 1.1 - (shakeSpeed * 0.1))}s`;

  return (
    <section id="video-section" className="py-24 -scroll-mt-12 bg-black">
      {/* Full-width header spanning far left */}
      <div className="w-full px-6 mb-12 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-lg">
            BEFORE YOU <span className="text-crimson">SCROLL!</span>
          </h1>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative">
            {/* Offset Background Frame */}
            <div className="absolute inset-0 translate-x-4 translate-y-4 bg-[#0e0e0ea2] border border-border/50 z-0" />

            {/* The shake animations are defined in globals.css. Options:
                tilt-shaking, horizontal-shaking, vertical-shaking, skew-x-shaking, skew-y-shaking, tilt-n-move-shaking
                Choose whichever you prefer by changing the class below when !isPlaying! */}
            <div
              onClick={() => setHasClicked(true)}
              className={`relative z-10 p-[2px] overflow-hidden shadow-[0_0_70px_-15px_var(--crimson)] ${(!isPlaying && !hasClicked && isShakingNow) ? 'tilt-shaking' : ''}`}
              style={{
                '--shake-amplitude': shakeAmplitude,
                '--shake-duration': shakeDuration
              } as React.CSSProperties}
            >
              {/* Animated or Static border effect */}
              {!isPlaying && (
                glowMode === 'spinning' ? (
                  <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite]"
                    style={{ background: "conic-gradient(from 0deg, transparent 75%, var(--crimson) 100%)" }} />
                ) : (
                  <div className="absolute inset-0 bg-crimson/80" />
                )
              )}

              <div className="video-container relative z-10 overflow-hidden bg-[#0e0e0e]">
                {VIDEO_EMBED_URL ? (
                  <iframe
                    src={VIDEO_EMBED_URL}
                    title="Bad Girl Strength Club — VSL"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                    style={{ background: "#0e0e0e" }}>
                    <div className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage: "repeating-linear-gradient(-45deg, #8F0000 0, #8F0000 1px, transparent 0, transparent 12px)",
                      }} />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="cursor-pointer transition-all hover:scale-110 active:scale-95 bg-crimson w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                      >
                        {isPlaying ? (
                          <Pause size={36} fill="#f5f5f3" color="#f5f5f3" />
                        ) : (
                          <Play size={36} fill="#f5f5f3" color="#f5f5f3" className="ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <div className="mt-6 max-w-3xl mx-auto flex items-center justify-between gap-2">
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
              Sound on. No fluff. Just truth.
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body, 'Inter', sans-serif)" }}>
              ~8 min
            </p>
          </div> */}
        </motion.div>
      </div>
    </section>
  );
}
