import type { Metadata } from "next";
import StepInForm from "./StepInForm";

export const metadata: Metadata = {
  title: "Step In — Bad Girl Strength Club",
  description:
    "Begin your first week of The New Standard. No credit card required.",
};

type TierKey = "independent" | "supported" | "immersed";

function normalizeTier(raw: string | string[] | undefined): TierKey | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "independent" || value === "supported" || value === "immersed") {
    return value;
  }
  return null;
}

export default async function StepInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tier = normalizeTier(params.tier);

  return <StepInForm tier={tier} />;
}
