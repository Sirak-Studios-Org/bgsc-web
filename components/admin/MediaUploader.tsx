"use client";

import { useRef, useState } from "react";
import { uploadToR2, type UploadKind } from "@/lib/upload-client";
import { publicUrl } from "@/lib/r2-public";

interface Props {
  kind: UploadKind;
  value: string | null;
  onChange: (key: string) => void;
  label?: string;
}

export default function MediaUploader({ kind, value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const { key } = await uploadToR2(file, kind, setProgress);
      onChange(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const accept = kind === "video" ? "video/mp4,video/quicktime,video/webm,video/x-m4v"
    : kind === "image" ? "image/png,image/jpeg,image/webp,image/gif"
    : "application/pdf";

  return (
    <div>
      {label && (
        <label className="block text-xs uppercase tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
          {label}
        </label>
      )}

      {kind === "image" && value && (
        <img src={publicUrl(value)} alt="" className="w-full max-w-xs mb-3 border"
          style={{ borderColor: "var(--border)" }} />
      )}
      {kind === "video" && value && (
        <p className="text-xs mb-2 truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
          Current: <code style={{ color: "var(--soft-white)" }}>{value}</code>
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-50"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-display)" }}
        >
          {progress !== null ? `Uploading… ${progress}%` : value ? "Replace" : "Upload"}
        </button>
        {error && <span className="text-xs" style={{ color: "var(--crimson)" }}>{error}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
