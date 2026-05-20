"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";

type PostItem = {
  id: number;
  content: string;
  isPinned: boolean;
  isAdminPost: boolean;
  createdAt: string;
  author: { id: number; name: string };
  channel: { id: number; name: string; slug: string };
  community: string;
  commentCount: number;
  reactionCount: number;
};

type ChannelItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  communityName: string;
  postCount: number;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminCommunity() {
  const router = useRouter();
  const [tab, setTab] = useState<"posts" | "channels">("posts");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/community/posts");
    if (!res.ok) { router.push("/admin"); return; }
    const data = await res.json();
    setPosts(data.posts);
    setLoading(false);
  }, [router]);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/community/channels");
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setChannels(data.channels);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "posts") loadPosts();
    else loadChannels();
  }, [tab, loadPosts, loadChannels]);

  async function deletePost(id: number) {
    if (!confirm("Hard delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/community/posts/${id}`, { method: "DELETE" });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function togglePin(post: PostItem) {
    const res = await fetch("/api/admin/community/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id, isPinned: !post.isPinned }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isPinned: !p.isPinned } : p))
      );
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--near-black)", color: "#fff" }}>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

        <p className="text-xs uppercase tracking-[0.3em] mb-6"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
          Community Moderation
        </p>

        <div className="flex gap-0 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
          {(["posts", "channels"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2 text-xs uppercase tracking-widest transition-colors"
              style={{
                fontFamily: "var(--font-display)",
                color: tab === t ? "var(--soft-white)" : "rgba(255,255,255,0.35)",
                borderBottom: tab === t ? "2px solid var(--crimson)" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>Loading…</div>
        ) : tab === "posts" ? (
          <>
            {posts.length === 0 ? (
              <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>No posts.</div>
            ) : (
              <div style={{ border: "1px solid var(--border)" }}>
                {posts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="px-4 py-4 hover:bg-white/[0.02] transition-colors"
                    style={{
                      background: "var(--surface-1)",
                      borderBottom: idx < posts.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold"
                            style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
                            {post.author.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest px-1.5"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)" }}>
                            #{post.channel.name} · {post.community}
                          </span>
                          {post.isPinned && (
                            <span className="text-[10px]" style={{ color: "var(--crimson)" }}>📌</span>
                          )}
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {timeAgo(post.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2"
                          style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)" }}>
                          {post.content}
                        </p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                            💬 {post.commentCount}
                          </span>
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                            ❤ {post.reactionCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => togglePin(post)}
                          className="text-xs px-2 py-1 uppercase tracking-widest transition-opacity hover:opacity-80"
                          style={{
                            background: post.isPinned ? "rgba(143,0,0,0.2)" : "var(--surface-2)",
                            border: `1px solid ${post.isPinned ? "var(--crimson)" : "var(--border)"}`,
                            color: post.isPinned ? "var(--crimson)" : "rgba(255,255,255,0.4)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {post.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-xs px-2 py-1 uppercase tracking-widest transition-opacity hover:opacity-80"
                          style={{
                            background: "rgba(143,0,0,0.1)",
                            border: "1px solid rgba(143,0,0,0.4)",
                            color: "var(--crimson)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              {posts.length} post{posts.length !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <>
            {channels.length === 0 ? (
              <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>No channels.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Community", "Channel", "Slug", "Description", "Posts"].map((h) => (
                        <th key={h} className="text-left py-3 pr-6 text-xs uppercase tracking-widest"
                          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((ch) => (
                      <tr key={ch.id} style={{ borderBottom: "1px solid var(--border)" }}
                        className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-6 text-xs" style={{ color: "var(--ash)" }}>{ch.communityName}</td>
                        <td className="py-3 pr-6 text-sm font-bold" style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
                          #{ch.name}
                        </td>
                        <td className="py-3 pr-6 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{ch.slug}</td>
                        <td className="py-3 pr-6 text-xs max-w-xs truncate" style={{ color: "var(--ash)" }}>{ch.description || "—"}</td>
                        <td className="py-3 pr-6 text-sm font-bold" style={{ color: "var(--crimson)" }}>{ch.postCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
