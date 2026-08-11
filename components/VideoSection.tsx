"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isShakingNow, setIsShakingNow] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const VIDEO_EMBED_URL =
    process.env.NEXT_PUBLIC_VIDEO_EMBED_URL ?? "";

  const shakeAmplitude = 2;
  const shakeSpeed = 9;

  const shakeActiveMs = 700;
  const shakeRestMs = 1800;
  const initialDelayMs = 800;

  /*
   * ---------------------------------------------------------
   * PRE-PLAY SHAKE ANIMATION
   * ---------------------------------------------------------
   *
   * The video frame gently shakes before the user interacts
   * with it. Once the user clicks the video or playback starts,
   * the animation stops.
   */
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

  /*
   * ---------------------------------------------------------
   * VIDEO PLAY HANDLER
   * ---------------------------------------------------------
   */
  const handlePlay = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      await video.play();

      setHasClicked(true);
      setIsPlaying(true);
    } catch (error) {
      console.error("Unable to play BGSC video:", error);
    }
  };

  /*
   * ---------------------------------------------------------
   * SHAKE DURATION
   * ---------------------------------------------------------
   *
   * speed 1 ≈ 1.0s
   * speed 10 ≈ 0.1s
   */
  const shakeDuration = `${Math.max(
    0.1,
    1.1 - shakeSpeed * 0.1
  )}s`;

  return (
    <section className="w-full">
      {/* =====================================================
          FULL-WIDTH HEADER ANIMATION
          ===================================================== */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />

      {/* =====================================================
          VIDEO SECTION
          ===================================================== */}
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative w-full">

            {/* =================================================
                OFFSET BACKGROUND FRAME
                ================================================= */}
            <div
              className="
                absolute
                inset-0
                translate-x-4
                translate-y-4
                bg-[#0e0e0e]
                border
                border-border/50
                z-0
              "
            />

            {/* =================================================
                MAIN VIDEO FRAME
                ================================================= */}
            <div
              className={`
                relative
                z-10
                w-full
                p-[2px]
                overflow-hidden
                shadow-[0_0_70px_-15px_var(--crimson)]
                ${
                  !isPlaying &&
                  !hasClicked &&
                  isShakingNow
                    ? "tilt-shaking"
                    : ""
                }
              `}
              style={
                {
                  "--shake-amplitude": shakeAmplitude,
                  "--shake-duration": shakeDuration,
                } as React.CSSProperties
              }
            >

              {/* =================================================
                  STATIC BGSC RED BORDER
                  ================================================= */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-crimson/80" />
              )}

              {/* =================================================
                  VIDEO CONTAINER

                  aspect-video = 16:9

                  This prevents the video/thumbnail from
                  becoming too tall or too short.
                  ================================================= */}
              <div
                className="
                  relative
                  z-10
                  w-full
                  aspect-video
                  overflow-hidden
                  bg-[#0e0e0e]
                "
              >

                {/* =================================================
                    VIDEO EXISTS
                    ================================================= */}
                {VIDEO_EMBED_URL ? (
                  <>
                    {/* =================================================
                        ACTUAL VIDEO
                        ================================================= */}
                    <video
                      ref={videoRef}
                      src={VIDEO_EMBED_URL}
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        bg-black
                      "
                      controls
                      playsInline
                      preload="metadata"
                      onPlay={() => {
                        setIsPlaying(true);
                        setHasClicked(true);
                      }}
                      onPause={() => {
                        setIsPlaying(false);
                      }}
                      onEnded={() => {
                        setIsPlaying(false);
                      }}
                    />

                    {/* =================================================
                        THUMBNAIL + PLAY OVERLAY

                        This is displayed before the first play.

                        It disappears when the video starts.
                        ================================================= */}
                    {!hasClicked && !isPlaying && (
                      <button
                        type="button"
                        aria-label="Play BGSC video"
                        onClick={handlePlay}
                        className="
                          absolute
                          inset-0
                          z-20
                          w-full
                          h-full
                          p-0
                          border-0
                          cursor-pointer
                          group
                          bg-transparent
                        "
                      >

                        {/* =================================================
                            VIDEO THUMBNAIL
                            ================================================= */}
                        <img
                          src="/images/bgsc-video-thumbnail.png"
                          alt="Bad Girl Strength Club"
                          className="
                            absolute
                            inset-0
                            w-full
                            h-full
                            object-cover
                            select-none
                            pointer-events-none
                          "
                        />

                        {/* =================================================
                            DARK CINEMATIC OVERLAY

                            Makes the play button easier to see.
                            ================================================= */}
                        <div
                          className="
                            absolute
                            inset-0
                            bg-black/25
                            transition-all
                            duration-300
                            group-hover:bg-black/10
                          "
                        />

                        {/* =================================================
                            CENTER VIGNETTE

                            Adds subtle cinematic depth.
                            ================================================= */}
                        <div
                          className="
                            absolute
                            inset-0
                            bg-[radial-gradient(
                              circle_at_center,
                              transparent_0%,
                              rgba(0,0,0,0.12)_55%,
                              rgba(0,0,0,0.42)_100%
                            )]
                          "
                        />

                        {/* =================================================
                            PLAY BUTTON

                            Perfectly centered.
                            ================================================= */}
                        <span
                          className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2

                            flex
                            items-center
                            justify-center

                            w-20
                            h-20
                            md:w-24
                            md:h-24

                            rounded-full

                            bg-[#a90000]

                            border-2
                            border-white/90

                            shadow-[0_0_0_8px_rgba(169,0,0,0.20),0_0_45px_rgba(169,0,0,0.65)]

                            transition-all
                            duration-300

                            group-hover:scale-110
                            group-hover:bg-[#c00000]

                            group-hover:shadow-[0_0_0_12px_rgba(169,0,0,0.18),0_0_65px_rgba(169,0,0,0.85)]

                            group-active:scale-95
                          "
                        >
                          <Play
                            className="
                              w-9
                              h-9
                              md:w-11
                              md:h-11
                              text-white
                              ml-1
                            "
                            fill="white"
                          />
                        </span>

                        {/* =================================================
                            WATCH LABEL
                            ================================================= */}
                        <span
                          className="
                            absolute
                            left-1/2
                            top-[calc(50%+65px)]
                            md:top-[calc(50%+75px)]

                            -translate-x-1/2

                            text-[10px]
                            md:text-xs

                            uppercase
                            tracking-[0.28em]
                            font-bold

                            text-white

                            whitespace-nowrap

                            opacity-90

                            transition-all
                            duration-300

                            group-hover:opacity-100
                          "
                        >
                  
                        </span>
                      </button>
                    )}
                  </>
                ) : (

                  /* =================================================
                     FALLBACK

                     Displayed if NEXT_PUBLIC_VIDEO_EMBED_URL
                     is not configured.
                     ================================================= */
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-6
                    "
                    style={{
                      background: "#0e0e0e",
                    }}
                  >

                    {/* =================================================
                        FALLBACK BACKGROUND PATTERN
                        ================================================= */}
                    <div
                      className="
                        absolute
                        inset-0
                        opacity-[0.04]
                      "
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(-45deg, #8F0000 0, #8F0000 1px, transparent 0, transparent 12px)",
                      }}
                    />

                    {/* =================================================
                        FALLBACK PLAY BUTTON
                        ================================================= */}
                    <div
                      className="
                        relative
                        z-10
                        flex
                        flex-col
                        items-center
                        gap-4
                      "
                    >
                      <button
                        type="button"
                        aria-label={
                          isPlaying
                            ? "Pause video"
                            : "Play video"
                        }
                        onClick={() =>
                          setIsPlaying(!isPlaying)
                        }
                        className="
                          cursor-pointer

                          transition-all
                          duration-200

                          hover:scale-110
                          active:scale-95

                          bg-crimson

                          w-20
                          h-20

                          rounded-full

                          flex
                          items-center
                          justify-center

                          shadow-[0_0_40px_rgba(143,0,0,0.55)]

                          border
                          border-white/20
                        "
                      >
                        {isPlaying ? (
                          <Pause
                            className="
                              w-8
                              h-8
                              text-white
                            "
                          />
                        ) : (
                          <Play
                            className="
                              w-8
                              h-8
                              text-white
                              ml-1
                            "
                            fill="white"
                          />
                        )}
                      </button>

                      <span
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.28em]
                          font-bold
                          text-white/80
                        "
                      >
                        Watch the film
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              OPTIONAL VIDEO CAPTION

              Currently disabled.
              ===================================================== */}

          {/*
          <div
            className="
              mt-6
              max-w-3xl
              mx-auto
              flex
              items-center
              justify-between
              gap-2
            "
          >
            <p
              className="text-sm"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontFamily:
                  "var(--font-body, 'Inter', sans-serif)",
              }}
            >
              Sound on. No fluff. Just truth.
            </p>

            <p
              className="text-sm"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontFamily:
                  "var(--font-body, 'Inter', sans-serif)",
              }}
            >
              ~8 min
            </p>
          </div>
          */}
        </motion.div>
      </div>
    </section>
  );
}