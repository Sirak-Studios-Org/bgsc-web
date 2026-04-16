"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShakingNow, setIsShakingNow] = useState(false);
  const VIDEO_EMBED_URL = process.env.NEXT_PUBLIC_VIDEO_EMBED_URL ?? "";

  // Shake configuration:
  // shakeAmplitude: How far it physically moves (scale: 1-10+)
  // shakeSpeed: How fast it shakes (scale: 1-10+)
  const shakeAmplitude = 2;
  const shakeSpeed = 9;

  // Intermittent Shake Controls:
  const shakeIntervalMs = 2000; // Time between shakes in milliseconds (e.g. 4000 = 4s)
  const shakeActiveMs = 2000;    // How long it actually shakes for (e.g. 800 = 0.8s)

  // Intermittent shake effect
  useEffect(() => {
    if (isPlaying) {
      setIsShakingNow(false);
      return;
    }

    // Initial burst
    const initialTimeout = setTimeout(() => {
      setIsShakingNow(true);
      setTimeout(() => setIsShakingNow(false), shakeActiveMs);
    }, 1000);

    const intervalId = setInterval(() => {
      setIsShakingNow(true);
      setTimeout(() => setIsShakingNow(false), shakeActiveMs);
    }, shakeIntervalMs);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [isPlaying]);

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
            WATCH THIS <span className="text-crimson">NOW!</span>
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
              className={`relative z-10 p-[2px] overflow-hidden shadow-[0_0_70px_-15px_var(--crimson)] ${(!isPlaying && isShakingNow) ? 'tilt-shaking' : ''}`}
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
