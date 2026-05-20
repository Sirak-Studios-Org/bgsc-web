import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json() as { csv: string; trialDays?: number };
  if (!body.csv) return NextResponse.json({ error: "No CSV data provided." }, { status: 400 });

  const rows = parseCSV(body.csv);
  if (rows.length === 0) return NextResponse.json({ error: "CSV has no data rows." }, { status: 400 });

  const trialDays = body.trialDays ?? 30;
  const defaultTrialEnd = new Date(Date.now() + trialDays * 86400000);
  const defaultHash = bcrypt.hashSync("ChangeMe2024!", 8);

  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (const row of rows) {
    const email = (row.email ?? "").toLowerCase().trim();
    const name = row.name ?? row.full_name ?? row.username ?? email.split("@")[0];

    if (!email || !email.includes("@")) {
      results.errors.push(`Invalid email: "${email}"`);
      continue;
    }

    try {
      const trialEnd = row.trial_end ? new Date(row.trial_end) : defaultTrialEnd;
      const isActive = row.is_active ? row.is_active !== "0" && row.is_active !== "false" : true;

      await prisma.user.upsert({
        where: { email },
        update: { name: name || email, trialEnd, isActive },
        create: {
          email,
          name: name || email,
          passwordHash: row.password_hash || defaultHash,
          trialEnd,
          isActive,
        },
      });
      results.created++;
    } catch {
      results.skipped++;
      results.errors.push(`Skipped ${email}`);
    }
  }

  return NextResponse.json(results);
}
