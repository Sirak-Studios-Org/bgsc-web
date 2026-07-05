"use client";
import { useRef, useState, useCallback } from "react";
import { publicUrl } from "@/lib/r2";

interface Chapter { time: number; label: string }

interface Props {
  videoKey: string;
  chapters?: Chapter[];
  onEnd?: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({ videoKey, chapters = [], onEnd }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errored, setErrored] = useState(false);
  const progressSavedRef = useRef(0);

  const hasSource = Boolean(videoKey && videoKey.trim());

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = Math.floor((v.currentTime / v.duration) * 100);
    setProgress(pct);
    // Save progress every 10% milestone
    if (pct > progressSavedRef.current + 10) {
      progressSavedRef.current = pct;
    }
  }, []);

  function setPlaybackSpeed(s: number) {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  }

  function seekToChapter(time: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  }

  const videoUrl = hasSource ? (videoKey.startsWith("http") ? videoKey : publicUrl(videoKey)) : "";

  // Empty or failed source → show a clear placeholder instead of a dead black box.
  if (!hasSource || errored) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-2 text-center px-6"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)", aspectRatio: "16/9" }}>
        <span style={{ fontSize: 28 }}>🎬</span>
        <p className="text-sm font-bold" style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
          {hasSource ? "This video is being refreshed" : "Video coming soon"}
        </p>
        <p className="text-xs" style={{ color: "var(--ash)" }}>
          {hasSource
            ? "The clip couldn’t load right now. You can still mark the lesson complete below."
            : "This lesson’s video hasn’t been uploaded yet."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Video */}
      <div className="relative" style={{ background: "#000", aspectRatio: "16/9" }}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={e => setDuration((e.target as HTMLVideoElement).duration)}
          onEnded={onEnd}
          onError={() => setErrored(true)}
          playsInline
        />
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between px-3 py-2"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        {/* Speed */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase tracking-wider mr-2" style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}>
            Speed
          </span>
          {SPEEDS.map(s => (
            <button key={s} onClick={() => setPlaybackSpeed(s)}
              className="px-2 py-0.5 text-[10px] transition-all"
              style={{
                background: speed === s ? "var(--crimson)" : "transparent",
                color: speed === s ? "#fff" : "var(--ash)",
                fontFamily: "var(--font-display)",
              }}>
              {s}x
            </button>
          ))}
        </div>
        {/* Progress */}
        {duration > 0 && (
          <span className="text-[10px]" style={{ color: "var(--ash)" }}>
            {progress}%
          </span>
        )}
      </div>

      {/* Chapters */}
      {chapters.length > 0 && (
        <div className="mt-2 space-y-1">
          {chapters.map((ch, i) => (
            <button key={i} onClick={() => seekToChapter(ch.time)}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-left transition-opacity hover:opacity-80"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
              <span style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
                {Math.floor(ch.time / 60)}:{String(Math.floor(ch.time % 60)).padStart(2, "0")}
              </span>
              <span style={{ color: "var(--soft-white)" }}>{ch.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
