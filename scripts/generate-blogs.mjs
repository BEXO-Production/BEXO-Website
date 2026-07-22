/**
 * Seed 100 useful BEXO Guides as DB-shaped JSON + static HTML pages.
 * Run: node scripts/generate-blogs.mjs
 *
 * Content model mirrors docs/blog-cms-schema.sql (marketing_blogs).
 * When admin CMS ships: import JSON → Postgres, then fetch via API or rebuild static.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "blogs");
const POSTS_DIR = path.join(CONTENT, "posts");
const PAGES_DIR = path.join(ROOT, "pages", "guides");

const COVERS = [
  { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — modern workspace" },
  { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — glass architecture" },
  { url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — resume and laptop" },
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — analytics dashboard" },
  { url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — students collaborating" },
  { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — focused learning" },
  { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — planning desk" },
  { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — team workshop" },
  { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — professional portrait" },
  { url: "https://images.unsplash.com/photo-1553877522-432597ce554b?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — startup meeting" },
  { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — code on desk" },
  { url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — creative studio" },
  { url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — interview conversation" },
  { url: "https://images.unsplash.com/photo-1432888498266-38ffec0f9dd2?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — notebook and coffee" },
  { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — laptop brainstorm" },
  { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — night workspace" },
  { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — team at screens" },
  { url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — typing on laptop" },
  { url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — presentation moment" },
  { url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80", credit: "Unsplash — handshake meeting" },
];

const AUTHORS = [
  { name: "Maya Krishnan", role: "Career Editor, Ace Digital" },
  { name: "Arjun Mehta", role: "Product Story, BEXO" },
  { name: "Leah Fontaine", role: "Design Desk" },
  { name: "Rohan Iyer", role: "Placement Field Notes" },
  { name: "Sofia Rahman", role: "Student Voices" },
  { name: "BEXO Editorial", role: "Ace Digital" },
];

/** 100 unique, user-facing titles */
const TITLES = [
  ["Why a live portfolio beats a PDF in placement season", "placements"],
  ["How yourname.atbexo.com makes you memorable in 3 seconds", "branding"],
  ["Resume vs portfolio: what recruiters actually open", "recruiters"],
  ["The Hire Me page: your ATS-friendly first impression", "recruiters"],
  ["Stand out without learning Webflow overnight", "getting-started"],
  ["What to put on a student portfolio (and what to skip)", "students"],
  ["Five portfolio mistakes that quietly kill interviews", "tips"],
  ["How to name your subdomain so it feels like you", "branding"],
  ["Turn campus projects into recruiter-ready case studies", "students"],
  ["LinkedIn + live portfolio: the combo that works", "branding"],
  ["Why “I’ll build a site later” costs you offers", "motivation"],
  ["A 20-minute checklist before you hit Publish", "getting-started"],
  ["How freelancers use a personal site to win first clients", "freelance"],
  ["Placement forms ask for a link — make yours count", "placements"],
  ["Photos that look professional (without a studio)", "tips"],
  ["Writing a bio that sounds human, not robotic", "writing"],
  ["Projects section: show outcomes, not just tools", "tips"],
  ["The quiet power of a clean URL on your CV", "branding"],
  ["Career switchers: prove transferable skills visually", "career"],
  ["What “agency-grade template” means for students", "design"],
  ["How to refresh your portfolio before every drive", "placements"],
  ["Internships: one page that proves you showed up", "students"],
  ["Why recruiters skim — and how to design for skim", "recruiters"],
  ["From messy Drive folder to a single shareable link", "getting-started"],
  ["Personal branding isn’t loud — it’s consistent", "branding"],
  ["The difference between a website and a portfolio", "getting-started"],
  ["Showcase hackathons without looking noisy", "students"],
  ["How to talk about unfinished projects honestly", "writing"],
  ["Mobile-first portfolios: most clicks are on phones", "tips"],
  ["What to update after every internship", "career"],
  ["Make your about section feel like a conversation", "writing"],
  ["Certificates: useful proof or clutter?", "tips"],
  ["Design students: let the work lead, not the layout", "design"],
  ["Engineers: show systems thinking in simple words", "career"],
  ["MBA hopefuls: a portfolio for leadership stories", "career"],
  ["How a Hire Me page complements your designed site", "recruiters"],
  ["Claim your name early — before someone else does", "branding"],
  ["A week-by-week plan to go live before placements", "placements"],
  ["Stories that stick: structure your experience", "writing"],
  ["Why “looking busy” on a site hurts more than helps", "design"],
  ["Portfolios for quiet achievers", "motivation"],
  ["How mentors review student sites (real signals)", "students"],
  ["The one-link bio for Instagram and Twitter", "branding"],
  ["When to choose Identity vs Essential for your search", "getting-started"],
  ["Keep your site alive through final year chaos", "students"],
  ["Freelancer proposals: attach a living proof URL", "freelance"],
  ["Translate academic jargon into employer language", "writing"],
  ["Accessibility basics that make you look senior", "tips"],
  ["Color and type: enough taste without overthinking", "design"],
  ["How to ask for a testimonial worth publishing", "tips"],
  ["Remote interviews: share your screen with confidence", "recruiters"],
  ["Build once, reuse for every application season", "motivation"],
  ["What belongs on Home vs Portfolio pages", "design"],
  ["Contact that doesn’t feel desperate", "writing"],
  ["Show leadership without inventing titles", "career"],
  ["Data projects: visuals recruiters can grasp fast", "tips"],
  ["Open source contributions as portfolio proof", "career"],
  ["Design case studies in plain English", "design"],
  ["The psychology of a trustworthy personal site", "branding"],
  ["How parents and mentors can help review your draft", "students"],
  ["Avoid template sameness — theme it to you", "design"],
  ["Publish imperfectly, then iterate weekly", "motivation"],
  ["Why speed matters: slow sites feel unprofessional", "tips"],
  ["International applications: a global-ready URL", "career"],
  ["Campus ambassadors: lead with a living example", "students"],
  ["Content creators: portfolio as media kit lite", "freelance"],
  ["Product managers: show product sense visually", "career"],
  ["Researchers: make papers feel approachable", "writing"],
  ["Bootcamp grads: prove intensity and craft", "career"],
  ["Second-year students: start small, stay consistent", "students"],
  ["Final-year panic plan: ship in one weekend", "placements"],
  ["How to retire outdated projects gracefully", "tips"],
  ["SEO for personal sites (without being spammy)", "tips"],
  ["Privacy: what not to publish on a public site", "tips"],
  ["Dark mode portfolios: when they help (and hurt)", "design"],
  ["Typography that feels expensive on a budget", "design"],
  ["Motion: subtle presence vs distracting noise", "design"],
  ["Your first 10 visitors: who to send the link to", "motivation"],
  ["Track interest without becoming a metrics nerd", "tips"],
  ["Coupons and plans: invest when you’re job-active", "getting-started"],
  ["Student+ forever link: when lifetime makes sense", "getting-started"],
  ["Ace Digital + BEXO: trust behind the product", "branding"],
  ["Compare Notion pages vs a real portfolio host", "getting-started"],
  ["Google Sites won’t make you look premium — here’s why", "getting-started"],
  ["Canva resumes + live site: better together", "tips"],
  ["How to intro your portfolio in an email subject", "writing"],
  ["Interview homework: update your site the night before", "placements"],
  ["Alumni stories: keep the link after graduation", "career"],
  ["Side projects that impress more than coursework", "students"],
  ["Community work as career signal", "career"],
  ["Write less, mean more: editing your portfolio copy", "writing"],
  ["The anti-portfolio: what never to include", "tips"],
  ["Seasonal refresh: monsoon placement checklist", "placements"],
  ["Winter internships: a focused one-pager strategy", "students"],
  ["Startup roles: show ownership, not just tasks", "career"],
  ["Consulting hopes: structure problem → action → result", "writing"],
  ["UI/UX juniors: process without 40 screenshots", "design"],
  ["Backend engineers: demystify complexity for humans", "career"],
  ["Full-stack stories that don’t drown readers", "writing"],
  ["Your portfolio as a confidence tool — not a trophy case", "motivation"],
];

/** Per-title angle: hook, problem, do-this list, unique insight, CTA framing */
const ANGLES = {
  "Why a live portfolio beats a PDF in placement season": {
    hook: "PDFs freeze you in last week’s version of yourself. A live site updates the morning of the drive.",
    problem: "Placement cells and HR teams still collect PDFs — but the candidates who get remembered are the ones with a link that opens in one tap and looks intentional on mobile.",
    steps: [
      "Keep the PDF for forms that require it — then add your live URL in the same field or email signature",
      "Put your strongest project above the fold so a 20-second skim still lands",
      "Update one project or bio line the night before each major drive",
    ],
    insight: "A PDF proves you can export. A site proves you can ship and maintain — which is closer to real work.",
  },
  "How yourname.atbexo.com makes you memorable in 3 seconds": {
    hook: "Names stick. Random Bitly links don’t. Your subdomain is the shortest brand asset you’ll ever own.",
    problem: "When ten resumes look similar, recruiters remember the person whose URL they can say out loud.",
    steps: [
      "Claim a handle that matches how you introduce yourself (firstlast, firstinitiallast, or a clear nickname)",
      "Put the full URL on LinkedIn, resume header, and WhatsApp status during placement season",
      "Say it once in interviews: “My work lives at …” — then stop selling and show",
    ],
    insight: "Memorability isn’t about being flashy. It’s about being easy to find again tomorrow.",
  },
  "Resume vs portfolio: what recruiters actually open": {
    hook: "Resumes get you past filters. Portfolios win the human on the other side of the screen.",
    problem: "Students over-optimize keywords and under-invest in the moment a real person decides “interesting” vs “next.”",
    steps: [
      "Treat the resume as a map; treat the portfolio as the destination",
      "Mirror job titles and skills across both so nothing feels inconsistent",
      "Use the Hire Me page for structured facts; use project pages for proof",
    ],
    insight: "If they open anything after your resume, make sure it rewards curiosity in under ten seconds.",
  },
  "The Hire Me page: your ATS-friendly first impression": {
    hook: "Pretty work gets attention. Structured facts get shortlisted. You need both on one shareable link.",
    problem: "Designed portfolios often bury education, skills, and contact under animation. ATS-minded readers bounce.",
    steps: [
      "Keep education, skills, and contact scannable on Hire Me",
      "Link Hire Me from your designed home so recruiters choose their path",
      "Print-test the page once — if it looks chaotic on paper, simplify",
    ],
    insight: "Hire Me isn’t a second portfolio. It’s the résumé that never gets lost in email threads.",
  },
  "Stand out without learning Webflow overnight": {
    hook: "You don’t need to become a web developer to look like you take yourself seriously.",
    problem: "Students postpone publishing for months because “I’ll learn a builder first” — then placements arrive.",
    steps: [
      "Pick a premium template and customize copy, photos, and projects first",
      "Ship a clean v1 in a weekend; learn advanced tools later if you still need them",
      "Spend saved hours on case-study writing — that’s the real differentiator",
    ],
    insight: "Taste and clarity beat custom code when the goal is getting interviews.",
  },
};

const CATEGORY_PLAYBOOK = {
  placements: {
    audience: "students in active placement or internship season",
    standout: "When dozens of CVs arrive the same morning, a calm live site is the signal that you finished something and can share it cleanly.",
    checklist: [
      "URL on resume header and LinkedIn Featured",
      "One hero project with outcome metrics",
      "Working contact method (email or Hire Me CTA)",
    ],
  },
  branding: {
    audience: "people building a recognizable personal brand",
    standout: "Brand isn’t a logo — it’s the feeling someone gets when they land on your page and instantly understand what you care about.",
    checklist: [
      "Consistent name + photo across LinkedIn and site",
      "One-line positioning under your name",
      "Same URL everywhere you show up online",
    ],
  },
  recruiters: {
    audience: "candidates designing for how recruiters actually read",
    standout: "Recruiters skim for risk reduction: clarity, credibility, and an easy next step. Design for that skim.",
    checklist: [
      "Above-the-fold clarity in five seconds",
      "Proof before personality essays",
      "Contact that works on mobile",
    ],
  },
  "getting-started": {
    audience: "first-time portfolio builders",
    standout: "The fastest way to look unique is to publish something true — not to wait for a perfect custom build.",
    checklist: [
      "Claim your handle today",
      "Add three real projects (or two + one strong case study)",
      "Publish, then improve weekly",
    ],
  },
  students: {
    audience: "students turning campus work into career proof",
    standout: "Campus work becomes impressive when you translate it into problem → action → result language employers use.",
    checklist: [
      "Drop internal course codes; explain the problem",
      "Show screenshots or demos, not just titles",
      "Add one line on what you learned",
    ],
  },
  tips: {
    audience: "builders polishing the details that change first impressions",
    standout: "Small craft decisions — photo quality, copy length, load speed — compound into “this person seems sharp.”",
    checklist: [
      "Delete anything you can’t defend in an interview",
      "Test on a phone before you share",
      "Ask one mentor for a 60-second reaction",
    ],
  },
  freelance: {
    audience: "freelancers and creators winning trust before the call",
    standout: "Clients buy confidence. A living site is proof you can deliver something finished — not just pitch it.",
    checklist: [
      "Lead with outcomes for past work",
      "Make the ask clear (book a call / email)",
      "Keep a short media-kit style about section",
    ],
  },
  writing: {
    audience: "anyone whose portfolio will be judged by its words",
    standout: "Clear writing is a career skill. Your site is the public practice ground.",
    checklist: [
      "Cut adjectives; keep verbs and results",
      "Read every bio line out loud",
      "Replace buzzwords with specifics",
    ],
  },
  career: {
    audience: "career switchers and mid-journey professionals",
    standout: "A portfolio lets you reframe your past as evidence for the future role — not as a chronological apology.",
    checklist: [
      "Lead with transferable outcomes",
      "Group projects by theme, not by year alone",
      "State the role you’re aiming for in one sentence",
    ],
  },
  design: {
    audience: "design-minded students who want taste without clutter",
    standout: "Restraint reads as confidence. Empty space and hierarchy often look more expensive than extra widgets.",
    checklist: [
      "One accent color, not five",
      "Let project images breathe",
      "Motion only where it clarifies",
    ],
  },
  motivation: {
    audience: "people stuck in “almost ready”",
    standout: "Published and imperfect beats private and perfect. Momentum is the brand.",
    checklist: [
      "Set a publish date this week",
      "Share with three trusted people",
      "Schedule one improvement every Sunday",
    ],
  },
};

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function categoryLabel(key) {
  const map = {
    placements: "Placements",
    branding: "Personal brand",
    recruiters: "Recruiters",
    "getting-started": "Getting started",
    students: "Students",
    tips: "Practical tips",
    freelance: "Freelance",
    writing: "Writing",
    career: "Career",
    design: "Design",
    motivation: "Mindset",
  };
  return map[key] || "Guides";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function synthesizeAngle(title, category) {
  const play = CATEGORY_PLAYBOOK[category] || CATEGORY_PLAYBOOK["getting-started"];
  if (ANGLES[title]?.steps) return ANGLES[title];
  const h = hash(title);
  const hooks = [
    `Here’s the honest take on “${title.slice(0, 48)}${title.length > 48 ? "…" : ""}” — written for people who want a link that works harder than a PDF.`,
    `Most advice on this topic is vague. This guide is a field note: what to change on your site this week so you stand out for the right reasons.`,
    `You don’t need a louder personal brand. You need a clearer one — and a place online that proves it.`,
    `Standing out isn’t about gimmicks. It’s about making your best work impossible to miss in a 15-second skim.`,
  ];
  const problems = [
    `The default path (Drive folders, Canva PDFs, unfinished Notion pages) makes you look busy — not hire-ready.`,
    `When everyone lists the same tools and clubs, the differentiator becomes how cleanly you present proof.`,
    `People delay publishing until it feels perfect. Meanwhile, peers with simpler sites are already circulating a URL.`,
    `Recruiters and clients don’t owe you a deep read. If the first screen is confusing, they leave.`,
  ];
  const insights = [
    play.standout,
    `A website helps you stand out because it compresses your story into something shareable, memorable, and updatable — qualities a static attachment can’t match.`,
    `Uniqueness comes from your projects and voice. The platform’s job is to get out of the way and make that voice look premium.`,
    `Smart portfolios feel calm: one idea per section, outcomes before tools, and a next step that doesn’t beg.`,
  ];
  const stepBanks = [
    play.checklist,
    [
      `Open your site on a phone and fix anything that feels cramped or slow`,
      `Rewrite your top project in problem → action → result`,
      `Add your live URL to the next application you send today`,
    ],
    [
      `Delete one section that doesn’t earn its space`,
      `Replace one buzzword with a concrete outcome`,
      `Ask a friend: “What do you think I do?” — then align the headline`,
    ],
    [
      `Screenshot your homepage and mark the first thing the eye hits`,
      `Move proof higher; move biography lower if needed`,
      `Publish the change even if it’s imperfect`,
    ],
  ];
  return {
    hook: hooks[h % hooks.length],
    problem: problems[(h >> 3) % problems.length],
    steps: stepBanks[(h >> 5) % stepBanks.length],
    insight: insights[(h >> 7) % insights.length],
  };
}

function topicExtras(title, category, i) {
  const t = title.toLowerCase();
  const blocks = [];

  if (t.includes("pdf") || t.includes("resume")) {
    blocks.push(`<h2>PDF + site, not PDF or site</h2>
<p>Keep the PDF for portals that demand uploads. Use the live site for humans. Put the URL in the resume header so both assets point to each other.</p>`);
  }
  if (t.includes("recruiter") || t.includes("hire me") || t.includes("ats")) {
    blocks.push(`<h2>Design for the skim</h2>
<p>Assume ten seconds. If education, skills, and contact aren’t obvious, a busy recruiter won’t hunt. Pair a designed home with a Hire Me page that prints cleanly.</p>`);
  }
  if (t.includes("student") || t.includes("campus") || t.includes("internship") || t.includes("placement")) {
    blocks.push(`<h2>Translate campus work</h2>
<p>Replace “CSE Mini Project” with the problem you solved, who it helped, and what changed. Faculty titles impress faculty. Outcomes impress employers.</p>`);
  }
  if (t.includes("freelance") || t.includes("client") || t.includes("creator")) {
    blocks.push(`<h2>Proof before pitch</h2>
<p>Attach your live URL in proposals. Clients should see finished craft before the call — it shortens trust-building and filters unserious leads.</p>`);
  }
  if (t.includes("design") || t.includes("typography") || t.includes("motion") || t.includes("dark mode") || t.includes("color")) {
    blocks.push(`<h2>Taste without theatrics</h2>
<p>Premium feels quiet: hierarchy, spacing, and one confident accent. If motion or dark themes fight readability, they cost you interviews.</p>`);
  }
  if (t.includes("write") || t.includes("bio") || t.includes("jargon") || t.includes("stories") || t.includes("email")) {
    blocks.push(`<h2>Edit like a product</h2>
<p>Every sentence should earn a click or a reply. Cut throat-clearing openers. Lead with what you make or the problem you solve.</p>`);
  }
  if (t.includes("google sites") || t.includes("notion") || t.includes("webflow") || t.includes("canva")) {
    blocks.push(`<h2>Tools vs presentation</h2>
<p>Free builders are fine for drafts. When the link goes on a CV, presentation quality becomes part of your professional signal — templates exist so you skip reinventing layout.</p>`);
  }
  if (t.includes("subdomain") || t.includes("url") || t.includes("name") || t.includes("link") || t.includes("atbexo")) {
    blocks.push(`<h2>Own a sayable address</h2>
<p><strong>yourname.atbexo.com</strong> is easier to remember than a long path. Claim it early, then stamp it on every channel you already use.</p>`);
  }
  if (t.includes("privacy") || t.includes("anti-portfolio") || t.includes("never")) {
    blocks.push(`<h2>What to leave out</h2>
<p>Skip private addresses, ID numbers, half-finished clones of famous products, and anything you can’t discuss without cringing. Scarcity of content is better than noise.</p>`);
  }
  if (t.includes("weekend") || t.includes("20-minute") || t.includes("checklist") || t.includes("week-by-week") || t.includes("panic")) {
    blocks.push(`<h2>Time-boxed shipping</h2>
<p>Set a timer. Publish with three projects and a clear bio. Perfection is a moving target; a live URL is a fixed asset you can improve.</p>`);
  }
  if (!blocks.length) {
    const extras = [
      `<h2>Make uniqueness visible</h2>
<p>Your uniqueness is already in your projects and judgment. The website’s job is to frame that judgment so a stranger trusts it quickly.</p>`,
      `<h2>One composition, one job</h2>
<p>Each section should do one thing: introduce you, prove a project, or invite contact. When sections compete, nothing lands.</p>`,
      `<h2>Share like a professional</h2>
<p>Put the link in applications, mentor emails, and community intros. A portfolio that nobody visits is still a draft.</p>`,
    ];
    blocks.push(extras[i % extras.length]);
  }
  return blocks.join("\n");
}

function buildBody(title, category, i) {
  const play = CATEGORY_PLAYBOOK[category] || CATEGORY_PLAYBOOK["getting-started"];
  const angle = synthesizeAngle(title, category);
  const stepList = angle.steps || play.checklist;
  const steps = stepList.map((s) => `<li>${s}</li>`).join("\n");
  const extras = topicExtras(title, category, i);

  return `
<p class="post-lead">${angle.hook}</p>
<p>${angle.problem}</p>
<p>This guide is for <strong>${play.audience}</strong> who want a site that feels intentional — not another generic template dump.</p>
<h2>The real problem</h2>
<p>${angle.insight}</p>
<h2>Do this next</h2>
<ol>
${steps}
</ol>
${extras}
<h2>How a website helps you stand out</h2>
<p>${play.standout}</p>
<p>On BEXO, that path is simple: discover on <strong>mybexo.com</strong>, create on <strong>dash.mybexo.com</strong>, share on <strong>yourname.atbexo.com</strong>. Premium templates and a Hire Me page give you agency-grade presentation without becoming a full-time webmaster.</p>
<h2>Field checklist</h2>
<ul>
${play.checklist.map((c) => `<li>${c}</li>`).join("\n")}
</ul>
<h2>Try this today</h2>
<p>Open your draft (or start one), apply one change from the list above, and publish. Momentum compounds faster than waiting for “ready.”</p>
<p><a class="btn-primary js-dash-login" href="https://dash.mybexo.com/login">Open your BEXO workspace</a></p>
`.trim();
}

function excerptFrom(title, category, angle) {
  const base = angle.hook.replace(/<[^>]+>/g, "");
  const short = `${base} Practical notes for ${categoryLabel(category).toLowerCase()}.`;
  return short.length > 180 ? short.slice(0, 177) + "…" : short;
}

function postHtmlShell(post) {
  return `<!DOCTYPE html>
<html lang="en" data-root="../../">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(post.seo_title || post.title)} — BEXO Guides</title>
    <meta name="description" content="${escapeHtml(post.seo_description || post.excerpt)}" />
    <meta property="og:title" content="${escapeHtml(post.title)}" />
    <meta property="og:description" content="${escapeHtml(post.excerpt)}" />
    <meta property="og:image" content="${escapeHtml(post.cover_image_url)}" />
    <link rel="icon" href="../../assets/bexo-logo.png" type="image/png" />
    <link rel="stylesheet" href="../../css/navbar.css" />
    <link rel="stylesheet" href="../../main.css" />
    <link rel="stylesheet" href="../../css/sample-blog.css" />
    <link rel="stylesheet" href="../../css/blog.css" />
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
  </head>
  <body data-page="guides">
    <div id="site-nav"></div>
    <article class="article-hero">
      <div class="container">
        <p class="eyebrow">${escapeHtml(categoryLabel(post.category))}</p>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="post-meta">${escapeHtml(post.author_name)} · ${post.reading_minutes} min read · ${post.published_at.slice(0, 10)}</p>
      </div>
    </article>
    <div class="post-cover container">
      <img src="${escapeHtml(post.cover_image_url)}" alt="" loading="lazy" />
      <p class="cover-credit">${escapeHtml(post.cover_credit || "")}</p>
    </div>
    <section class="article-body">
      <div class="container post-body">
        ${post.body_html}
      </div>
    </section>
    <div class="container" style="max-width:42rem;padding-bottom:3rem">
      <p><a href="../blog.html">← All guides</a></p>
    </div>
    <div id="site-footer"></div>
    <script src="../../js/config.js"></script>
    <script src="../../js/chrome.js"></script>
  </body>
</html>
`;
}

function main() {
  if (TITLES.length !== 100) {
    console.error(`Expected 100 titles, got ${TITLES.length}`);
    process.exit(1);
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.mkdirSync(PAGES_DIR, { recursive: true });

  for (const f of fs.readdirSync(POSTS_DIR)) {
    if (f.endsWith(".json")) fs.unlinkSync(path.join(POSTS_DIR, f));
  }
  for (const f of fs.readdirSync(PAGES_DIR)) {
    if (f.endsWith(".html")) fs.unlinkSync(path.join(PAGES_DIR, f));
  }

  const posts = TITLES.map(([title, category], i) => {
    const cover = COVERS[i % COVERS.length];
    const author = AUTHORS[i % AUTHORS.length];
    const slug = slugify(title);
    const angle = synthesizeAngle(title, category);
    const published = new Date(Date.UTC(2025, i % 12, 1 + (i % 27), 10, 0, 0));
    const excerpt = excerptFrom(title, category, angle);
    const post = {
      id: `seed-${String(i + 1).padStart(3, "0")}`,
      slug,
      title,
      excerpt,
      body_html: buildBody(title, category, i),
      body_md: null,
      cover_image_url: cover.url,
      cover_credit: cover.credit,
      category,
      tags: [category, "portfolio", "stand-out", "bexo"],
      status: "published",
      featured: i < 8,
      author_name: author.name,
      author_role: author.role,
      seo_title: `${title} | BEXO Guides`,
      seo_description: excerpt.slice(0, 155),
      reading_minutes: 5 + (i % 4),
      published_at: published.toISOString(),
      created_at: published.toISOString(),
      updated_at: published.toISOString(),
    };
    fs.writeFileSync(path.join(POSTS_DIR, `${slug}.json`), JSON.stringify(post, null, 2));
    fs.writeFileSync(path.join(PAGES_DIR, `${slug}.html`), postHtmlShell(post));
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      cover_image_url: post.cover_image_url,
      category: post.category,
      category_label: categoryLabel(post.category),
      featured: post.featured,
      author_name: post.author_name,
      reading_minutes: post.reading_minutes,
      published_at: post.published_at,
      href: `./guides/${post.slug}.html`,
    };
  });

  const manifest = {
    version: 1,
    generated_at: new Date().toISOString(),
    count: posts.length,
    note: "Mirrors marketing_blogs table. Import JSON into Postgres when admin CMS ships.",
    posts: posts.sort((a, b) => (a.published_at < b.published_at ? 1 : -1)),
  };

  fs.writeFileSync(path.join(CONTENT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`✓ Generated ${posts.length} posts → content/blogs + pages/guides`);
}

main();
