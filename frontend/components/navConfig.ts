// Single source of truth for the app's navigation model.
// The product has two sides — people who FUND impact and people who DELIVER it — plus a
// consistent Learn menu. These configs drive the persistent dropdown tabs (no role selector).

export const GITHUB_REPO_URL = "https://github.com/erinmagennis/ImpactHook";

export type NavItem = { href: string; label: string; external?: boolean };

export type NavItemFull = NavItem & { desc?: string };

export type NavMenu = {
  label: string;
  // Short orienting line shown at the top of the dropdown.
  description?: string;
  // When set, clicking the tab label navigates here (its "Overview"); the caret opens the menu.
  // When omitted (Learn), the label itself toggles the menu.
  href?: string;
  items: NavItemFull[];
};

// Landing-page sections. Hash hrefs work from anywhere — from the landing they scroll, from an
// app page they route to the landing and scroll. Same tabs, same spots, every page.
export const ABOUT: NavMenu = {
  label: "About",
  href: "/",
  description: "How ImpactHook works",
  items: [
    { href: "/#how-it-works", label: "How it works", desc: "Register, fund, verify, release" },
    { href: "/#funding-models", label: "Funding", desc: "Four ways to fund, one milestone gate" },
    { href: "/#verification", label: "Verification", desc: "Verifiable by construction, onchain" },
    { href: "/#principles", label: "Principles", desc: "Aligned with Digital Development" },
    { href: "/#partner", label: "Partner", desc: "Institutions and liquidity providers" },
  ],
};

export const FUNDER: NavMenu = {
  label: "Funder",
  href: "/portfolio",
  description: "Fund impact through swaps, donations, or liquidity",
  items: [
    { href: "/portfolio", label: "Overview", desc: "Everything your funding has built" },
    { href: "/swap", label: "Swap", desc: "Trade through an impact pool" },
    { href: "/donate", label: "Donate", desc: "Send directly to a project" },
    { href: "/partners", label: "Provide liquidity", desc: "Earn while your yield funds impact" },
  ],
};

export const ORGANIZATION: NavMenu = {
  label: "Organization",
  href: "/dashboard",
  description: "Register, verify milestones, and withdraw funds",
  items: [
    { href: "/dashboard", label: "Overview", desc: "Your projects and their status" },
    { href: "/create", label: "Register project", desc: "Set milestones and verifiers" },
    { href: "/milestones", label: "Milestones", desc: "Verify progress, attach evidence" },
    { href: "/withdraw", label: "Withdraw", desc: "Pull released funds" },
  ],
};

export const LEARN: NavMenu = {
  label: "Learn",
  description: "How it works, under the hood",
  items: [
    { href: "/impact", label: "Impact", desc: "The accountability story" },
    { href: "/technical", label: "Technical", desc: "Architecture and contracts" },
    { href: "/pantheon", label: "Committees", desc: "How the committee path verifies" },
    { href: "/agent", label: "Agent", desc: "Autonomous verification agent" },
    { href: GITHUB_REPO_URL, label: "GitHub", desc: "Open-source repository", external: true },
  ],
};
