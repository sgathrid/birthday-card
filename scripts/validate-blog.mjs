import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const blogDir = path.join(root, "blog");
const manifestPath = path.join(blogDir, "manifest.json");
const errors = [];

function fail(message) {
  errors.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${path.relative(root, filePath)} is not valid JSON: ${error.message}`);
    return null;
  }
}

function isExternalUrl(value) {
  return /^(https?:)?\/\//.test(value) || value.startsWith("mailto:");
}

function validateManifestPost(post, index, seenSlugs) {
  const location = `blog/manifest.json posts[${index}]`;
  const required = ["slug", "date", "title", "summary", "src"];

  for (const field of required) {
    if (typeof post[field] !== "string" || post[field].trim() === "") {
      fail(`${location} is missing required string field "${field}"`);
    }
  }

  if (typeof post.slug === "string") {
    if (seenSlugs.has(post.slug)) {
      fail(`${location} has duplicate slug "${post.slug}"`);
    }
    seenSlugs.add(post.slug);
  }

  if (typeof post.date === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
    fail(`${location} date should use YYYY-MM-DD`);
  }

  if (post.published !== undefined && typeof post.published !== "boolean") {
    fail(`${location} published must be true or false when present`);
  }

  if (typeof post.src === "string") {
    if (!post.src.startsWith("posts/")) {
      fail(`${location} src should point inside blog/posts/`);
    }

    const markdownPath = path.join(blogDir, post.src);
    if (!existsSync(markdownPath)) {
      fail(`${location} src does not exist: ${post.src}`);
    }
  }

  if (post.cover !== undefined) {
    if (typeof post.cover !== "string" || post.cover.trim() === "") {
      fail(`${location} cover must be a non-empty string when present`);
    } else if (!isExternalUrl(post.cover)) {
      const coverPath = path.join(blogDir, post.cover);
      if (!existsSync(coverPath)) {
        fail(`${location} cover does not exist: ${post.cover}`);
      }
    }
  }
}

function validateMarkdownImages(filePath) {
  const markdown = readFileSync(filePath, "utf8");
  const imagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlImagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  const videoPattern = /<video\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match;

  function validateMarkdownAsset(assetPath, type) {
    if (
      assetPath.startsWith("#") ||
      assetPath.startsWith("data:") ||
      isExternalUrl(assetPath)
    ) {
      return;
    }

    const decodedPath = decodeURI(assetPath.split("#")[0].split("?")[0]);
    const resolved = decodedPath.startsWith("assets/")
      ? path.resolve(blogDir, decodedPath)
      : path.resolve(path.dirname(filePath), decodedPath);

    if (!resolved.startsWith(blogDir)) {
      fail(`${path.relative(root, filePath)} ${type} escapes blog/: ${assetPath}`);
      return;
    }

    if (!existsSync(resolved)) {
      fail(`${path.relative(root, filePath)} ${type} does not exist: ${assetPath}`);
    }
  }

  while ((match = imagePattern.exec(markdown)) !== null) {
    validateMarkdownAsset(match[1], "image");
  }

  while ((match = htmlImagePattern.exec(markdown)) !== null) {
    validateMarkdownAsset(match[1], "image");
  }

  while ((match = videoPattern.exec(markdown)) !== null) {
    validateMarkdownAsset(match[1], "video");
  }
}

const manifest = readJson(manifestPath);

if (manifest) {
  if (typeof manifest.enabled !== "boolean") {
    fail("blog/manifest.json enabled must be true or false");
  }

  if (!Array.isArray(manifest.posts)) {
    fail("blog/manifest.json posts must be an array");
  } else {
    const seenSlugs = new Set();
    manifest.posts.forEach((post, index) => validateManifestPost(post, index, seenSlugs));
  }
}

const postsDir = path.join(blogDir, "posts");
if (!existsSync(postsDir)) {
  fail("blog/posts/ does not exist");
} else {
  for (const entry of readdirSync(postsDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      validateMarkdownImages(path.join(postsDir, entry.name));
    }
  }
}

if (errors.length > 0) {
  console.error("Blog validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Blog validation passed.");
