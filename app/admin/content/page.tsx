"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { SiteContent, CMS_DEFAULTS } from "@/lib/cms-types";

const SECTIONS: { key: keyof SiteContent; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "video", label: "Video" },
  { key: "marquee", label: "Marquee" },
  { key: "scrollReveal", label: "Scroll Reveal" },
  { key: "problems", label: "Problems" },
  { key: "method", label: "Method" },
  { key: "tiers", label: "Tiers" },
  { key: "culture", label: "Culture" },
  { key: "bocaHq", label: "Boca HQ" },
  { key: "objections", label: "FAQs" },
  { key: "close", label: "Close" },
  { key: "stickyBar", label: "Sticky Bar" },
];

function Field({ label, value, onChange, multiline, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none resize-y"
          style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none"
          style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }} />
      )}
    </div>
  );
}

function Card({ title, onRemove, children }: { title: string; onRemove?: () => void; children: React.ReactNode }) {
  return (
    <div className="p-4 space-y-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <div className="flex justify-between items-center">
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>{title}</p>
        {onRemove && <button onClick={onRemove} className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Remove</button>}
      </div>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="text-xs uppercase tracking-widest px-4 py-2 border transition-colors hover:border-white/30"
      style={{ borderColor: "var(--border)", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-display)" }}>
      + {label}
    </button>
  );
}

function SectionEditor({ sectionKey, content, onChange }: {
  sectionKey: keyof SiteContent; content: SiteContent; onChange: (key: keyof SiteContent, value: unknown) => void;
}) {
  if (sectionKey === "hero") {
    const v = content.hero;
    return (
      <div className="space-y-4">
        <Field label="Headline" value={v.headline} onChange={val => onChange("hero", { ...v, headline: val })} />
        <Field label="Subheadline" value={v.subheadline} onChange={val => onChange("hero", { ...v, subheadline: val })} />
        <Field label="CTA Button Text" value={v.ctaText} onChange={val => onChange("hero", { ...v, ctaText: val })} />
      </div>
    );
  }

  if (sectionKey === "video") {
    const v = content.video;
    return (
      <div className="space-y-4">
        <Field label="Eyebrow Text" value={v.eyebrow} onChange={val => onChange("video", { ...v, eyebrow: val })} />
        <Field label="Video Embed URL (YouTube/Vimeo)" value={v.embedUrl} onChange={val => onChange("video", { ...v, embedUrl: val })} placeholder="https://www.youtube.com/embed/..." />
      </div>
    );
  }

  if (sectionKey === "marquee") {
    const v = content.marquee;
    return (
      <div>
        <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Words (one per line)</label>
        <textarea value={v.words.join("\n")} onChange={e => onChange("marquee", { words: e.target.value.split("\n") })}
          rows={8} className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none resize-y"
          style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }} />
      </div>
    );
  }

  if (sectionKey === "scrollReveal") {
    const v = content.scrollReveal;
    return (
      <div className="space-y-4">
        <Field label="Reveal Text (all lowercase)" value={v.text} onChange={val => onChange("scrollReveal", { ...v, text: val })} multiline />
        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Highlighted Words (comma-separated)</label>
          <input value={v.highlightedWords.join(", ")} onChange={e => onChange("scrollReveal", { ...v, highlightedWords: e.target.value.split(",").map(w => w.trim()).filter(Boolean) })}
            className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none"
            style={{ borderColor: "var(--border)", color: "#fff" }} />
        </div>
      </div>
    );
  }

  if (sectionKey === "problems") {
    const v = content.problems;
    return (
      <div className="space-y-4">
        <Field label="Headline" value={v.headline} onChange={val => onChange("problems", { ...v, headline: val })} />
        <Field label="Subheadline" value={v.subheadline} onChange={val => onChange("problems", { ...v, subheadline: val })} multiline />
        <div className="space-y-3">
          {v.items.map((item, i) => (
            <Card key={i} title={`Problem ${i + 1}`} onRemove={v.items.length > 1 ? () => onChange("problems", { ...v, items: v.items.filter((_, idx) => idx !== i) }) : undefined}>
              <Field label="Hook" value={item.hook} onChange={val => { const items = [...v.items]; items[i] = { ...item, hook: val }; onChange("problems", { ...v, items }); }} />
              <Field label="Body" value={item.body} onChange={val => { const items = [...v.items]; items[i] = { ...item, body: val }; onChange("problems", { ...v, items }); }} multiline />
            </Card>
          ))}
        </div>
        <AddBtn onClick={() => onChange("problems", { ...v, items: [...v.items, { hook: "", body: "" }] })} label="Add Problem" />
      </div>
    );
  }

  if (sectionKey === "method") {
    const v = content.method;
    return (
      <div className="space-y-4">
        <Field label="Headline" value={v.headline} onChange={val => onChange("method", { ...v, headline: val })} />
        <Field label="Subheadline" value={v.subheadline} onChange={val => onChange("method", { ...v, subheadline: val })} />
        <div className="space-y-3">
          {v.pillars.map((p, i) => (
            <Card key={i} title={p.label || `Pillar ${i + 1}`}>
              <Field label="Label" value={p.label} onChange={val => { const pillars = [...v.pillars]; pillars[i] = { ...p, label: val }; onChange("method", { ...v, pillars }); }} />
              <Field label="Description" value={p.blurb} onChange={val => { const pillars = [...v.pillars]; pillars[i] = { ...p, blurb: val }; onChange("method", { ...v, pillars }); }} multiline />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (sectionKey === "tiers") {
    const v = content.tiers;
    return (
      <div className="space-y-4">
        <Field label="Headline" value={v.headline} onChange={val => onChange("tiers", { ...v, headline: val })} />
        <Field label="Subheadline" value={v.subheadline} onChange={val => onChange("tiers", { ...v, subheadline: val })} multiline />
        <Field label="Trial Line" value={v.trialLine} onChange={val => onChange("tiers", { ...v, trialLine: val })} />
        <div className="space-y-4">
          {v.items.map((tier, i) => (
            <Card key={i} title={tier.name || `Tier ${i + 1}`}>
              <Field label="Name" value={tier.name} onChange={val => { const items = [...v.items]; items[i] = { ...tier, name: val }; onChange("tiers", { ...v, items }); }} />
              <Field label="Positioning Line" value={tier.positioning} onChange={val => { const items = [...v.items]; items[i] = { ...tier, positioning: val }; onChange("tiers", { ...v, items }); }} />
              <Field label="Problem Solved" value={tier.problem} onChange={val => { const items = [...v.items]; items[i] = { ...tier, problem: val }; onChange("tiers", { ...v, items }); }} />
              <Field label="Outcome" value={tier.outcome} onChange={val => { const items = [...v.items]; items[i] = { ...tier, outcome: val }; onChange("tiers", { ...v, items }); }} multiline />
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Inclusions (one per line)</label>
                <textarea value={tier.inclusions.join("\n")} onChange={e => { const items = [...v.items]; items[i] = { ...tier, inclusions: e.target.value.split("\n").filter(Boolean) }; onChange("tiers", { ...v, items }); }}
                  rows={3} className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none resize-y"
                  style={{ borderColor: "var(--border)", color: "#fff" }} />
              </div>
              {!tier.applyOnly && (
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Monthly Price" value={tier.monthly ?? ""} onChange={val => { const items = [...v.items]; items[i] = { ...tier, monthly: val || null }; onChange("tiers", { ...v, items }); }} />
                  <Field label="Annual / Month" value={tier.annualPerMonth ?? ""} onChange={val => { const items = [...v.items]; items[i] = { ...tier, annualPerMonth: val || null }; onChange("tiers", { ...v, items }); }} />
                  <Field label="Annual Total" value={tier.annualTotal ?? ""} onChange={val => { const items = [...v.items]; items[i] = { ...tier, annualTotal: val || null }; onChange("tiers", { ...v, items }); }} />
                </div>
              )}
              <Field label="CTA Button Text" value={tier.cta} onChange={val => { const items = [...v.items]; items[i] = { ...tier, cta: val }; onChange("tiers", { ...v, items }); }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (sectionKey === "culture") {
    const v = content.culture;
    return (
      <div className="space-y-4">
        <Field label="Headline" value={v.headline} onChange={val => onChange("culture", { ...v, headline: val })} />
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Testimonials</p>
          {v.testimonials.map((t, i) => (
            <Card key={i} title={t.name || `Testimonial ${i + 1}`} onRemove={() => onChange("culture", { ...v, testimonials: v.testimonials.filter((_, idx) => idx !== i) })}>
              <Field label="Quote" value={t.quote} onChange={val => { const testimonials = [...v.testimonials]; testimonials[i] = { ...t, quote: val }; onChange("culture", { ...v, testimonials }); }} multiline />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={t.name} onChange={val => { const testimonials = [...v.testimonials]; testimonials[i] = { ...t, name: val }; onChange("culture", { ...v, testimonials }); }} />
                <Field label="Tag" value={t.tag} onChange={val => { const testimonials = [...v.testimonials]; testimonials[i] = { ...t, tag: val }; onChange("culture", { ...v, testimonials }); }} />
              </div>
            </Card>
          ))}
          <AddBtn onClick={() => onChange("culture", { ...v, testimonials: [...v.testimonials, { quote: "", name: "", tag: "" }] })} label="Add Testimonial" />
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Stats</p>
          {v.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-3">
              <Field label="Number" value={s.number} onChange={val => { const stats = [...v.stats]; stats[i] = { ...s, number: val }; onChange("culture", { ...v, stats }); }} />
              <Field label="Label" value={s.label} onChange={val => { const stats = [...v.stats]; stats[i] = { ...s, label: val }; onChange("culture", { ...v, stats }); }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sectionKey === "bocaHq") {
    const v = content.bocaHq;
    return (
      <div className="space-y-4">
        <Field label="Eyebrow" value={v.eyebrow} onChange={val => onChange("bocaHq", { ...v, eyebrow: val })} />
        <Field label="Headline" value={v.headline} onChange={val => onChange("bocaHq", { ...v, headline: val })} />
        <Field label="Body (Paragraph 1)" value={v.body1} onChange={val => onChange("bocaHq", { ...v, body1: val })} multiline />
        <Field label="Body (Paragraph 2)" value={v.body2} onChange={val => onChange("bocaHq", { ...v, body2: val })} multiline />
        <Field label="Primary CTA" value={v.ctaPrimary} onChange={val => onChange("bocaHq", { ...v, ctaPrimary: val })} />
        <Field label="Secondary CTA" value={v.ctaSecondary} onChange={val => onChange("bocaHq", { ...v, ctaSecondary: val })} />
      </div>
    );
  }

  if (sectionKey === "objections") {
    const v = content.objections;
    return (
      <div className="space-y-3">
        {v.items.map((item, i) => (
          <Card key={i} title={`FAQ ${i + 1}`} onRemove={() => onChange("objections", { items: v.items.filter((_, idx) => idx !== i) })}>
            <Field label="Question" value={item.q} onChange={val => { const items = [...v.items]; items[i] = { ...item, q: val }; onChange("objections", { items }); }} />
            <Field label="Answer" value={item.a} onChange={val => { const items = [...v.items]; items[i] = { ...item, a: val }; onChange("objections", { items }); }} multiline />
          </Card>
        ))}
        <AddBtn onClick={() => onChange("objections", { items: [...v.items, { q: "", a: "" }] })} label="Add FAQ" />
      </div>
    );
  }

  if (sectionKey === "close") {
    const v = content.close;
    return (
      <div className="space-y-4">
        <Field label="Headline" value={v.headline} onChange={val => onChange("close", { ...v, headline: val })} />
        <Field label="Subheadline" value={v.subheadline} onChange={val => onChange("close", { ...v, subheadline: val })} multiline />
        <Field label="Trial Eyebrow" value={v.trialEyebrow} onChange={val => onChange("close", { ...v, trialEyebrow: val })} />
        <Field label="Trial Body" value={v.trialBody} onChange={val => onChange("close", { ...v, trialBody: val })} multiline />
        <div>
          <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>Perks (one per line)</label>
          <textarea value={v.perks.join("\n")} onChange={e => onChange("close", { ...v, perks: e.target.value.split("\n").filter(Boolean) })}
            rows={5} className="w-full px-3 py-2.5 text-sm bg-transparent border outline-none resize-y"
            style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-body)" }} />
        </div>
      </div>
    );
  }

  if (sectionKey === "stickyBar") {
    const v = content.stickyBar;
    return (
      <div className="space-y-4">
        <Field label="Label" value={v.label} onChange={val => onChange("stickyBar", { ...v, label: val })} />
        <Field label="CTA Button Text" value={v.ctaText} onChange={val => onChange("stickyBar", { ...v, ctaText: val })} />
      </div>
    );
  }

  return null;
}

export default function ContentPage() {
  const [active, setActive] = useState<keyof SiteContent>("hero");
  const [content, setContent] = useState<SiteContent>(CMS_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/content")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = useCallback((key: keyof SiteContent, value: unknown) => {
    setContent(prev => ({ ...prev, [key]: value }));
  }, []);

  async function save() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: active, value: content[active] }),
      });
      setSaveMsg(res.ok ? "Saved." : "Failed.");
    } catch {
      setSaveMsg("Error saving.");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 2500);
  }

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xs uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>Site Content</h1>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-xs" style={{ color: saveMsg === "Saved." ? "#4ade80" : "var(--crimson)" }}>{saveMsg}</span>}
            <button onClick={save} disabled={saving}
              className="px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
              {saving ? "Saving…" : `Save ${SECTIONS.find(s => s.key === active)?.label}`}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div className="md:hidden mb-4">
          <select value={active} onChange={e => setActive(e.target.value as keyof SiteContent)}
            className="w-full px-4 py-3 text-sm border outline-none"
            style={{ borderColor: "var(--border)", color: "#fff", fontFamily: "var(--font-display)", background: "var(--surface-1)" }}>
            {SECTIONS.map(({ key, label }) => (
              <option key={key} value={key} style={{ background: "#1a1a1a" }}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-36 flex-shrink-0">
            <nav className="space-y-0.5">
              {SECTIONS.map(({ key, label }) => (
                <button key={key} onClick={() => setActive(key)}
                  className="w-full text-left px-3 py-2.5 text-xs uppercase tracking-widest transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: active === key ? "#fff" : "rgba(255,255,255,0.35)",
                    background: active === key ? "var(--surface-1)" : "transparent",
                    borderLeft: active === key ? "2px solid var(--crimson)" : "2px solid transparent",
                  }}>
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Editor */}
          <div className="flex-1 p-4 md:p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            {loading ? (
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</p>
            ) : (
              <SectionEditor sectionKey={active} content={content} onChange={handleChange} />
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
