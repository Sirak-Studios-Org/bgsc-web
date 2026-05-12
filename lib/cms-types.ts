export type SiteContent = {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  video: {
    embedUrl: string;
    eyebrow: string;
  };
  marquee: {
    words: string[];
  };
  scrollReveal: {
    text: string;
    highlightedWords: string[];
  };
  problems: {
    headline: string;
    subheadline: string;
    items: { hook: string; body: string }[];
  };
  method: {
    headline: string;
    subheadline: string;
    pillars: { label: string; img: string; blurb: string }[];
  };
  tiers: {
    headline: string;
    subheadline: string;
    trialLine: string;
    items: {
      name: string;
      positioning: string;
      problem: string;
      outcome: string;
      inclusions: string[];
      monthly: string | null;
      annualPerMonth: string | null;
      annualTotal: string | null;
      applyOnly?: boolean;
      highlighted?: boolean;
      cta: string;
    }[];
  };
  culture: {
    headline: string;
    testimonials: { quote: string; name: string; tag: string }[];
    stats: { number: string; label: string }[];
  };
  bocaHq: {
    eyebrow: string;
    headline: string;
    body1: string;
    body2: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  objections: {
    items: { q: string; a: string }[];
  };
  close: {
    headline: string;
    subheadline: string;
    trialEyebrow: string;
    trialBody: string;
    perks: string[];
  };
  stickyBar: {
    label: string;
    ctaText: string;
  };
};

export const CMS_DEFAULTS: SiteContent = {
  hero: {
    headline: "You Were Never Meant To Stay Small",
    subheadline: "For women who are done playing small.",
    ctaText: "Choose Your Immersion Level",
  },
  video: {
    embedUrl: "",
    eyebrow: "BEFORE YOU SCROLL!",
  },
  marquee: {
    words: ["NOURISH", "TRAIN", "CONNECT", "STRENGTH IS A STANDARD, NOT A MOOD", "BAD GIRL STRENGTH CLUB"],
  },
  scrollReveal: {
    text: "you were not built to shrink. strength is a standard, not a mood. the standard does not bend to how you feel today.",
    highlightedWords: ["shrink", "standard", "mood", "bend"],
  },
  problems: {
    headline: "You Were Taught to Train for Less.",
    subheadline: "If you are looking for permission to stay small, this is not for you.",
    items: [
      { hook: "The problem was never your discipline.", body: "You've started programs. You've been consistent. But the programs were built around the wrong goal — shrinking. No system designed for less will ever produce more." },
      { hook: "You don't lack motivation. You lack a standard.", body: "Motivation is temporary. A standard is permanent. Bad Girl Strength Club gives you the standard the fitness industry never offered you." },
      { hook: "You've been training alone in a room built against you.", body: "The environment you train in shapes the woman you become. When your circle doesn't lift heavy, you won't either. BGSC puts you inside a culture where strength is the baseline — not the exception." },
    ],
  },
  method: {
    headline: "The Bad Girl Method.",
    subheadline: "Three pillars. One standard. Nourish. Train. Connect.",
    pillars: [
      { label: "Nourish", img: "/images/eat-clean.jpg", blurb: "Fuel the work. Macro awareness, real food, intentional intake — the foundation that makes the training translate." },
      { label: "Train", img: "/images/lift-heavy.jpg", blurb: "Disciplined resistance, structured repetition, mind-muscle connection. Heavy lifting done with intent — not random programming." },
      { label: "Connect", img: "/images/get-coached.jpg", blurb: "Stay connected to your body, your coach, and the women training beside you. Strength is held by a standard and a circle." },
    ],
  },
  tiers: {
    headline: "Choose Your Immersion Level.",
    subheadline: "Three ways into The New Standard. Each one solves a different problem. Pick the level of support that matches where you are.",
    trialLine: "Experience your first week of The New Standard — free.",
    items: [
      {
        name: "Independent",
        positioning: "You don't need more time. You need the right system.",
        problem: "Solves the time problem.",
        outcome: "Flexible, on-demand training built around the standard. You move when you can — the structure stays the same.",
        inclusions: ["Full video training library", "Self-paced programming", "Private community access"],
        monthly: "$49",
        annualPerMonth: "$39",
        annualTotal: "$468 billed yearly",
        highlighted: false,
        cta: "Start Independent",
      },
      {
        name: "Supported",
        positioning: "You don't need more motivation. You need accountability.",
        problem: "Solves the consistency problem.",
        outcome: "Live remote classes, weekly check-ins, macro guidance — the structure plus a coach holding the line with you.",
        inclusions: ["Everything in Independent", "Live remote training sessions", "Macro guidance + weekly check-ins"],
        monthly: "$199",
        annualPerMonth: "$159",
        annualTotal: "$1,908 billed yearly",
        highlighted: true,
        cta: "Choose Supported",
      },
      {
        name: "Immersed",
        positioning: "You don't need more information. You need guidance.",
        problem: "Solves the certainty problem.",
        outcome: "In-person coaching at the Boca Raton HQ. The full standard, taught and held by Steph and the BGSC team.",
        inclusions: ["Everything in Supported", "In-person coaching at Boca HQ", "Premium accountability + member rhythm"],
        monthly: null,
        annualPerMonth: null,
        annualTotal: null,
        applyOnly: true,
        cta: "Apply for Immersed",
      },
    ],
  },
  culture: {
    headline: "More Than a Workout Plan.",
    testimonials: [
      { quote: "I spent 10 years chasing a smaller body. In 16 weeks I stopped caring about size and started caring about what I could DO. I deadlifted 185 lbs. I cried.", name: "Mariana D.", tag: "Phase 3 graduate" },
      { quote: "They told me I'd get bulky. I didn't. I got powerful. There's a difference and now I know why Steph calls it a new standard! This has changed every aspect of my daily life.", name: "Kezia T.", tag: "12 weeks in" },
      { quote: "Its not just an online course, its my Family! The women I met in the club have become my closest friends and I have unlocked levels to myself I never knew existed before.", name: "Simone A.", tag: "Community member, 8 months" },
    ],
    stats: [
      { number: "1,200+", label: "Active Members" },
      { number: "94%", label: "Complete All 3 Phases" },
      { number: "16 wks", label: "Full System" },
    ],
  },
  bocaHq: {
    eyebrow: "The Flagship · Boca Raton",
    headline: "Where The New Standard Lives.",
    body1: "The Boca HQ is the physical proof of the brand — a members-only training environment where the method is taught, filmed, and held to the standard.",
    body2: "Immersed members train on-site with Steph and the BGSC coaching team. It is not a gym you join. It is a club you are coached inside.",
    ctaPrimary: "Apply for Immersed",
    ctaSecondary: "Join the BGSC community channel →",
  },
  objections: {
    items: [
      { q: "Will lifting heavy weights make me bulky?", a: "Strength enhances shape; it doesn't remove femininity. Heavy training builds structure, definition, and the way you carry yourself — the 'bulky' story is a myth designed to keep women out of the weight room." },
      { q: "I always fall off. Why would this be different?", a: "That's a support problem, not a discipline problem. If you've fallen off before, you didn't have the right structure or the right circle. Choose Supported or Immersed — the standard is held with you, not just handed to you." },
      { q: "I'm a complete beginner. Will I be lost?", a: "No. The method starts with movement patterns and structural integrity, then progresses you methodically. You don't need experience — you need a standard, and that's what you step into." },
      { q: "I don't have access to a real gym. Does this still work?", a: "Yes. Independent and Supported are built to translate from minimal equipment all the way up to full barbell work. The standard travels with you. Immersed adds in-person coaching at the Boca HQ." },
      { q: "What's the difference between Independent, Supported, and Immersed?", a: "Independent solves the time problem — flexible, on-demand training. Supported solves the consistency problem — live coaching, weekly check-ins, accountability. Immersed solves the certainty problem — in-person coaching at Boca HQ." },
      { q: "What happens if I want to stop?", a: "You leave. No friction, no questions. The standard is an invitation, not a trap." },
    ],
  },
  close: {
    headline: "Step Into The New Standard.",
    subheadline: "If you are ready to build something stronger, you are in the right place.",
    trialEyebrow: "Trial Invitation",
    trialBody: "Experience your first week of The New Standard — free. Step out anytime in the first seven days. No friction. No questions.",
    perks: [
      "Three immersion levels — Independent, Supported, Immersed",
      "Coached method, structured repetition, real progression",
      "Active community channel — not a course, a club",
      "Boca Raton HQ for in-person training",
      "Step out anytime. The standard is an invitation.",
    ],
  },
  stickyBar: {
    label: "First week free",
    ctaText: "Step In",
  },
};
