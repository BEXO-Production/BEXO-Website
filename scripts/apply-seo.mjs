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

# Primary sitemap index (pages + all guides/blogs)
Sitemap: ${ORIGIN}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, "robots.txt"), body);
}

/** Firebase cleanUrls: /pages/pricing.html → /pages/pricing */
function htmlPathToLoc(filePath) {
  const rel = path.relative(ROOT, filePath).split(path.sep).join("/");
  if (rel === "index.html") return `${ORIGIN}/`;
  const clean = rel.replace(/\.html$/i, "");
  return `${ORIGIN}/${clean}`;
}

function lastmodFor(filePath) {
  try {
    return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function seoMetaFor(filePath) {
  const rel = path.relative(ROOT, filePath).split(path.sep).join("/");
  if (rel === "index.html") {
    return { priority: "1.0", changefreq: "weekly" };
  }
  if (rel === "pages/blog.html") {
    return { priority: "0.9", changefreq: "daily" };
  }
  if (rel === "pages/pricing.html") {
    return { priority: "0.9", changefreq: "weekly" };
  }
  if (rel === "pages/about.html" || rel === "pages/customers.html") {
    return { priority: "0.8", changefreq: "weekly" };
  }
  if (rel.startsWith("pages/guides/")) {
    return { priority: "0.7", changefreq: "monthly" };
  }
  // sample-blog and any other public page
  return { priority: "0.6", changefreq: "monthly" };
}

function renderUrlset(entries) {
  const body = entries
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function writeSitemap(allHtmlFiles) {
  const pageFiles = [];
  const guideFiles = [];

  for (const file of allHtmlFiles) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    if (rel.startsWith("pages/guides/")) guideFiles.push(file);
    else pageFiles.push(file);
  }

  pageFiles.sort();
  guideFiles.sort();

  const toEntry = (file) => {
    const meta = seoMetaFor(file);
    return {
      loc: htmlPathToLoc(file),
      lastmod: lastmodFor(file),
      changefreq: meta.changefreq,
      priority: meta.priority,
    };
  };

  const pageEntries = pageFiles.map(toEntry);
  const guideEntries = guideFiles.map(toEntry);
  const allEntries = [...pageEntries, ...guideEntries];

  // Child sitemaps
  fs.writeFileSync(path.join(ROOT, "sitemap-pages.xml"), renderUrlset(pageEntries));
  fs.writeFileSync(path.join(ROOT, "sitemap-guides.xml"), renderUrlset(guideEntries));

  // Full flat sitemap (GSC can submit either this or the index)
  fs.writeFileSync(path.join(ROOT, "sitemap-all.xml"), renderUrlset(allEntries));

  // Index — proper split: static pages vs all blog/guides
  const today = new Date().toISOString().slice(0, 10);
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${ORIGIN}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${ORIGIN}/sitemap-guides.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), indexXml);

  return {
    pages: pageEntries.length,
    guides: guideEntries.length,
    total: allEntries.length,
  };
}

function main() {
  const htmlFiles = [
    path.join(ROOT, "index.html"),
    ...walkHtmlFiles(path.join(ROOT, "pages")),
  ].sort();

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

  writeRobots();
  const counts = writeSitemap(htmlFiles);

  console.log(
    `SEO applied: ${patched} HTML files · sitemap pages=${counts.pages} guides/blogs=${counts.guides} total=${counts.total}`,
  );
  console.log(`Origin: ${ORIGIN}`);
  console.log(`Index: ${ORIGIN}/sitemap.xml → sitemap-pages.xml + sitemap-guides.xml`);
}

main();
