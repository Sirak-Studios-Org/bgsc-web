"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";

const REACTIONS: { type: string; emoji: string }[] = [
  { type: "heart", emoji: "💗" },
  { type: "fire", emoji: "🔥" },
  { type: "flex", emoji: "🦾" },
  { type: "cheer", emoji: "🎉" },
  { type: "strong", emoji: "💪" },
];

type Author = { id: number; name: string };
type CommentData = { id: number; content: string; createdAt: string; author: Author };
type PostData = {
  id: number;
  content: string;
  isPinned: boolean;
  isAdminPost: boolean;
  createdAt: string;
  author: Author;
  reactionCounts: Record<string, number>;
  userReactions: string[];
  commentCount: number;
};

type ChannelInfo = { id: number; name: string; slug: string; description: string };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function PostCard({
  post,
  currentUserId,
  onReact,
  onDelete,
}: {
  post: PostData;
  currentUserId: number;
  onReact: (postId: number, type: string) => void;
  onDelete: (postId: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  async function loadComments() {
    if (loadingComments) return;
    setLoadingComments(true);
    const res = await fetch(`/api/portal/posts/${post.id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
    setLoadingComments(false);
  }

  function toggleComments() {
    if (!expanded) loadComments();
    setExpanded((v) => !v);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || submittingComment) return;
    setSubmittingComment(true);
    const res = await fetch(`/api/portal/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
    }
    setSubmittingComment(false);
  }

  return (
    <div
      className="p-4"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        position: "relative",
      }}
    >
      {post.isPinned && (
        <div
          className="absolute top-3 right-3 text-xs uppercase tracking-widest"
          style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}
        >
          📌 Pinned
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}
        >
          {initials(post.author.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
              {post.author.name}
            </span>
            {post.isAdminPost && (
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5"
                style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}>
                Admin
              </span>
            )}
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>
        {post.author.id === currentUserId && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-xs hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            ×
          </button>
        )}
      </div>

      <p
        className="text-sm mb-4 leading-relaxed"
        style={{ color: "var(--soft-white)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {post.content}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        {REACTIONS.map((r) => {
          const count = post.reactionCounts[r.type] ?? 0;
          const active = post.userReactions.includes(r.type);
          return (
            <button
              key={r.type}
              onClick={() => onReact(post.id, r.type)}
              className="flex items-center gap-1 px-2 py-1 text-xs transition-opacity hover:opacity-80"
              style={{
                background: active ? "rgba(143,0,0,0.2)" : "var(--surface-2)",
                border: `1px solid ${active ? "var(--crimson)" : "var(--border)"}`,
                color: active ? "var(--soft-white)" : "var(--ash)",
              }}
            >
              <span>{r.emoji}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}

        <button
          onClick={toggleComments}
          className="flex items-center gap-1 px-2 py-1 text-xs transition-opacity hover:opacity-80 ml-1"
          style={{
            background: expanded ? "rgba(255,255,255,0.05)" : "transparent",
            border: "1px solid var(--border)",
            color: "var(--ash)",
          }}
        >
          <span>💬</span>
          <span>{post.commentCount > 0 ? post.commentCount : ""} comment{post.commentCount !== 1 ? "s" : ""}</span>
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          {loadingComments ? (
            <p className="text-xs mb-3" style={{ color: "var(--ash)" }}>Loading…</p>
          ) : (
            <div className="space-y-3 mb-4">
              {comments.length === 0 && (
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No comments yet.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{ background: "rgba(143,0,0,0.4)", color: "#fff", fontFamily: "var(--font-display)" }}
                  >
                    {initials(c.author.name)}
                  </div>
                  <div className="flex-1 p-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: "var(--soft-white)", fontFamily: "var(--font-display)" }}>
                        {c.author.name}
                      </span>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--soft-white)", whiteSpace: "pre-wrap" }}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 px-3 py-2 text-xs bg-transparent border outline-none"
              style={{
                borderColor: "var(--border)",
                color: "var(--soft-white)",
                fontFamily: "var(--font-body)",
                background: "var(--surface-2)",
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submittingComment}
              className="px-3 py-2 text-xs uppercase tracking-widest transition-opacity disabled:opacity-40"
              style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ChannelPage({ params }: { params: Promise<{ channelSlug: string }> }) {
  const { channelSlug } = use(params);
  const router = useRouter();

  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [postText, setPostText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function init() {
      const commRes = await fetch("/api/portal/community");
      if (!commRes.ok) { router.push("/portal/login"); return; }
      const commData = await commRes.json();

      let foundChannel: ChannelInfo | null = null;
      for (const community of commData.communities) {
        for (const ch of community.channels) {
          if (ch.slug === channelSlug) { foundChannel = ch; break; }
        }
        if (foundChannel) break;
      }

      if (!foundChannel) { router.push("/portal/community"); return; }
      setChannel(foundChannel);

      const postsRes = await fetch(`/api/portal/community/${foundChannel.id}/posts`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts);
        if (postsData.posts.length > 0) {
          setCurrentUserId(postsData.posts[0]?.author?.id ?? 0);
        }
      }

      const meRes = await fetch("/api/portal/profile").catch(() => null);
      if (meRes?.ok) {
        const meData = await meRes.json();
        setCurrentUserId(meData.user?.id ?? 0);
      }

      setLoading(false);
    }
    init();
  }, [channelSlug, router]);

  async function handleReact(postId: number, type: string) {
    const res = await fetch(`/api/portal/posts/${postId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const counts = { ...p.reactionCounts };
        const reactions = [...p.userReactions];
        if (data.action === "added") {
          counts[type] = (counts[type] ?? 0) + 1;
          reactions.push(type);
        } else {
          counts[type] = Math.max((counts[type] ?? 1) - 1, 0);
          const idx = reactions.indexOf(type);
          if (idx !== -1) reactions.splice(idx, 1);
        }
        return { ...p, reactionCounts: counts, userReactions: reactions };
      })
    );
  }

  async function handleDelete(postId: number) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/portal/posts/${postId}`, { method: "DELETE" });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const content = postText.trim();
    if (!content || submitting || !channel) return;
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/portal/community/${channel.id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const data = await res.json();
      const newPost: PostData = {
        ...data.post,
        reactionCounts: {},
        userReactions: [],
        commentCount: 0,
      };
      setPosts((prev) => [newPost, ...prev]);
      setPostText("");
    } else {
      setError("Could not post. Try again.");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm" style={{ color: "var(--ash)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8 pb-32">
      <div className="mb-6">
        <button
          onClick={() => router.push("/portal/community")}
          className="text-xs uppercase tracking-widest mb-4 block hover:opacity-70 transition-opacity"
          style={{ color: "var(--ash)", fontFamily: "var(--font-display)" }}
        >
          ← All Channels
        </button>
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
          # {channel?.name}
        </p>
        {channel?.description && (
          <p className="text-xs" style={{ color: "var(--ash)" }}>{channel.description}</p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {posts.length === 0 && (
          <div className="py-12 text-center" style={{ border: "1px dashed var(--border)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>Be the first to post!</p>
          </div>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onReact={handleReact}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 lg:left-[240px] z-40 p-4"
        style={{ background: "var(--near-black)", borderTop: "1px solid var(--border)" }}
      >
        <form onSubmit={handlePost} className="max-w-2xl mx-auto flex gap-3">
          <textarea
            ref={textareaRef}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(e); }}
            placeholder="Write something…"
            rows={2}
            className="flex-1 px-3 py-2 text-sm bg-transparent border outline-none resize-none"
            style={{
              borderColor: "var(--border)",
              color: "var(--soft-white)",
              fontFamily: "var(--font-body)",
              background: "var(--surface-2)",
            }}
          />
          <button
            type="submit"
            disabled={!postText.trim() || submitting}
            className="px-4 text-xs uppercase tracking-widest transition-opacity disabled:opacity-40 self-stretch"
            style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}
          >
            Post
          </button>
        </form>
        {error && (
          <p className="text-xs mt-2 text-center" style={{ color: "var(--crimson)" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
