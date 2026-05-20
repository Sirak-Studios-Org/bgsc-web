import { getMemberSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const planOrder: Record<string, number> = { free: 0, trial: 1, club: 2, premium: 3, vip: 4 };

export default async function CommunityPage() {
  const session = await getMemberSession();
  if (!session) redirect("/portal/login");

  const communities = await prisma.community.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      channels: {
        orderBy: { sortOrder: "asc" },
        include: {
          posts: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { author: { select: { name: true } } },
          },
        },
      },
    },
  });

  const userPlanRank = planOrder[session.plan] ?? 0;

  const enriched = communities.map((c) => {
    const required: string[] = JSON.parse(c.planRequired);
    const hasAccess =
      required.length === 0 ||
      required.some((p) => (planOrder[p] ?? 99) <= userPlanRank);
    return { ...c, required, hasAccess };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 lg:px-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: "var(--crimson)", fontFamily: "var(--font-display)" }}>
          Community
        </p>
        <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
          Your Channels
        </h1>
      </div>

      <div className="space-y-8">
        {enriched.map((community) => (
          <div key={community.id}>
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-display)" }}>
              {community.name}
            </p>

            {!community.hasAccess ? (
              <div className="p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">🔒</span>
                  <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
                    {community.name}
                  </p>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--ash)" }}>
                  {community.description || `Requires ${community.required.join(" or ")} plan.`}
                </p>
                <Link
                  href="/portal/profile"
                  className="inline-block px-4 py-2 text-xs uppercase tracking-widest"
                  style={{ background: "var(--crimson)", color: "#fff", fontFamily: "var(--font-display)" }}
                >
                  Upgrade Plan
                </Link>
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)" }}>
                {community.channels.map((ch, i) => (
                  <Link
                    key={ch.id}
                    href={`/portal/community/${ch.slug}`}
                    className="flex items-center justify-between px-4 py-4 hover:bg-white/[0.02] transition-colors"
                    style={{
                      background: "var(--surface-1)",
                      borderBottom: i < community.channels.length - 1 ? "1px solid var(--border)" : "none",
                      display: "flex",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold mb-0.5" style={{ fontFamily: "var(--font-display)", color: "var(--soft-white)" }}>
                        # {ch.name}
                      </p>
                      {ch.posts[0] ? (
                        <p className="text-xs truncate" style={{ color: "var(--ash)" }}>
                          <span style={{ color: "rgba(255,255,255,0.5)" }}>{ch.posts[0].author.name}: </span>
                          {ch.posts[0].content}
                        </p>
                      ) : (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No posts yet — be first!</p>
                      )}
                    </div>
                    <span className="ml-4 text-xs" style={{ color: "var(--crimson)" }}>→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
