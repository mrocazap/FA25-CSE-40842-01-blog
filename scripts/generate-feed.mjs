// scripts/generate-feed.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ---- CONFIG ----
const siteUrl = "https://https://mrocazap.github.io/FA25-CSE-40842-01-blog/"
const title = "Thoughts of a Hacker";
const description = "Reflections and reading notes for Hackers in the Bazaar.";
const language = "en-us";
const ttl = 60;
// ---- /CONFIG ----

function rfc1123(d) {
  return new Date(d).toUTCString(); // e.g., "Sat, 30 Aug 2025 12:00:00 GMT"
}

const root = resolve(".");
const postsJsonPath = resolve(root, "posts.json");

const posts = JSON.parse(readFileSync(postsJsonPath, "utf-8"));

// Ensure newest first
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const lastBuildDate = posts.length ? rfc1123(posts[0].date) : rfc1123(new Date());

const itemsXml = posts.map(p => {
  const slug = p.slug;
  const postUrl = `${siteUrl}/#/post/${encodeURIComponent(slug)}`;
  const guid = slug;
  const pubDate = rfc1123(p.date);
  const summary = (p.summary || "").replace(/]]>/g, ""); // basic safety
  const categories = (p.tags || []).map(tag => `      <category>${escapeXml(tag)}</category>`).join("\n");

  return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[
${summary}
      ]]></description>
${categories}
    </item>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(description)}</description>
    <language>${language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>${ttl}</ttl>
${itemsXml}
  </channel>
</rss>
`;

writeFileSync(resolve(root, "feed.xml"), xml.trim() + "\n", "utf-8");
console.log("feed.xml regenerated from posts.json");

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, c => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;"
  }[c]));
}
