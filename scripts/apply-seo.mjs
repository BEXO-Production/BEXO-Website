/**
 * Apply Portfolio Discovery SEO for mybexo.cyou marketing site.
 * - Rebuilds sitemap.xml (core pages + all guides)
 * - Patches guide <head> (title, canonical, OG, twitter)
 * - Aligns visible domains to mybexo.cyou / dash.mybexo.cyou
 *
 * Run: node scripts/apply-seo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ORIGIN = "https://mybexo.cyou";
const GUIDES_DIR = path.join(ROOT, "pages", "guides");

const DOMAIN_REPLACEMENTS = [
  [/dash\.mybexo\.com/g, "dash.mybexo.cyou"],
  [/yourname\.atbexo\.com/g, "yourname.mybexo.cyou"],
  [/myname\.atbexo\.com/g, "myname.mybexo.cyou"],
  [/you\.atbexo\.com/g, "you.mybexo.cyou"],
  [/\.atbexo\.com/g, ".mybexo.cyou"],
  [/atbexo\.com/g, "mybexo.cyou"],
  [/https:\/\/mybexo\.com/g, "https://mybexo.cyou"],
  [/\bmybexo\.com\b/g, "mybexo.cyou"],
];

function walkHtmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkHtmlFiles(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function applyDomainReplacements(html) {
  let out = html;
  for (const [re, to] of DOMAIN_REPLACEMENTS) {
    out = out.replace(re, to);
  }
  return out;
}

function escapeAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function unescapeAttr(s) {
  let out = String(s || "");
  for (let i = 0; i < 5; i++) {
    const next = out
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    if (next === out) break;
    out = next;
  }
  return out;
}

function patchGuideHead(html, filePath) {
  const slug = path.basename(filePath, ".html");
  const canonical = `${ORIGIN}/pages/guides/${slug}`;

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const titleText = (h1Match ? h1Match[1] : slug)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const description = unescapeAttr(
    (descMatch && descMatch[1]) ||
      `${titleText} — practical BEXO guide for student portfolios and placements.`,
  );

  const ogImageMatch = html.match(
    /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i,
  );
  const coverMatch = html.match(
    /<div class="post-cover[^"]*">[\s\S]*?<img[^>]*\ssrc=["']([^"']+)["']/i,
  );
  const ogImage = unescapeAttr(
    (ogImageMatch && ogImageMatch[1]) ||
      (coverMatch && coverMatch[1]) ||
      `${ORIGIN}/assets/og-default.jpg`,
  );

  const pageTitle = `${titleText} | BEXO Guides`;

  const seoBlock = `    <title>${escapeAttr(pageTitle)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:site_name" content="BEXO" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeAttr(titleText)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(titleText)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />`;

  let out = html;
  // Strip existing SEO tags we will replace (keep charset/viewport/icon/styles)
  out = out.replace(/<title>[^<]*<\/title>\s*/i, "");
  out = out.replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, "");
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");
  out = out.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, "");
  out = out.replace(
    /<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi,
    "",
  );

  out = out.replace(
    /(<meta\s+name=["']viewport["'][^>]*>\s*)/i,
    `$1\n${seoBlock}\n`,
  );

  // Cover alt from title
  out = out.replace(
    /(<div class="post-cover[^"]*">[\s\S]*?<img[^>]*\salt=")[^"]*(")/i,
    `$1${escapeAttr(titleText)}$2`,
  );

  return out;
}

function writeRobots() {
  const body = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, "robots.txt"), body);
}

function writeSitemap(guideFiles) {
  const today = new Date().toISOString().slice(0, 10);
  const core = [
    { loc: `${ORIGIN}/`, priority: "1.0", changefreq: "weekly" },
    { loc: `${ORIGIN}/pages/pricing`, priority: "0.9", changefreq: "weekly" },
    { loc: `${ORIGIN}/pages/about`, priority: "0.8", changefreq: "monthly" },
    { loc: `${ORIGIN}/pages/customers`, priority: "0.8", changefreq: "weekly" },
    { loc: `${ORIGIN}/pages/blog`, priority: "0.9", changefreq: "daily" },
  ];

  const guides = guideFiles.map((f) => {
    const slug = path.basename(f, ".html");
    return {
      loc: `${ORIGIN}/pages/guides/${slug}`,
      priority: "0.6",
      changefreq: "monthly",
    };
  });

  const urls = [...core, ...guides]
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
}

function main() {
  const htmlFiles = [
    path.join(ROOT, "index.html"),
    ...walkHtmlFiles(path.join(ROOT, "pages")),
  ];

  let patched = 0;
  for (const file of htmlFiles) {
    let html = fs.readFileSync(file, "utf8");
    html = applyDomainReplacements(html);
    if (file.includes(`${path.sep}guides${path.sep}`)) {
      html = patchGuideHead(html, file);
    }
    fs.writeFileSync(file, html);
    patched += 1;
  }

  const guides = walkHtmlFiles(GUIDES_DIR);
  writeRobots();
  writeSitemap(guides);

  console.log(`SEO applied: ${patched} HTML files, ${guides.length} guides in sitemap.`);
  console.log(`Origin: ${ORIGIN}`);
}

main();
