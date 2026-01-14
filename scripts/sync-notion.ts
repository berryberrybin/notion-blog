import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "../src/content/posts");
const IMAGES_DIR = path.join(__dirname, "../public/images/posts");

// Validate environment variables
if (!process.env.NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN is required");
}
if (!process.env.NOTION_DATABASE_ID) {
  throw new Error("NOTION_DATABASE_ID is required");
}

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Type definitions
interface PostProperties {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  publishStatus: boolean;
  status: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface NotionPage {
  id: string;
  properties: Record<string, any>;
}

// Fetch published posts from Notion database
async function fetchPublishedPosts(): Promise<NotionPage[]> {
  const allPages: NotionPage[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: "PublishStatus",
        checkbox: { equals: true },
      },
      sorts: [
        { property: "Number", direction: "ascending" },
        { property: "PublishedAt", direction: "descending" },
      ],
      start_cursor: cursor,
    });

    allPages.push(...(response.results as NotionPage[]));
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return allPages;
}

// Extract properties from Notion page
function extractProperties(page: NotionPage): PostProperties {
  const props = page.properties;

  // Helper to safely get text from various property types
  const getText = (prop: any, type: string): string => {
    if (!prop) return "";
    switch (type) {
      case "title":
        return prop.title?.[0]?.plain_text || "";
      case "rich_text":
        return prop.rich_text?.[0]?.plain_text || "";
      default:
        return "";
    }
  };

  // Sanitize slug: replace special characters with dash
  const rawSlug = getText(props.Slug, "rich_text") || page.id.replace(/-/g, "");
  const sanitizedSlug = rawSlug
    .toLowerCase()
    .replace(/[\/\\:*?"<>|]/g, "-")  // Replace invalid filename chars
    .replace(/\s+/g, "-")             // Replace spaces
    .replace(/-+/g, "-")              // Replace multiple dashes with single
    .replace(/^-|-$/g, "");           // Remove leading/trailing dashes

  return {
    title: getText(props.Title, "title") || "Untitled",
    slug: sanitizedSlug,
    summary: getText(props.Summary, "rich_text"),
    category: props.Category?.select?.name || "Uncategorized",
    tags: props.Tags?.multi_select?.map((t: any) => t.name) || [],
    publishStatus: props.PublishStatus?.checkbox || false,
    status: props.Status?.select?.name || "Draft",
    number: props.Number?.number || 0,
    createdAt: props.CreatedAt?.created_time || new Date().toISOString(),
    updatedAt: props.UpdatedAt?.last_edited_time || new Date().toISOString(),
    publishedAt: props.PublishedAt?.date?.start || null,
  };
}

// Download image and return local path
async function downloadImage(url: string, slug: string, index: number): Promise<string> {
  try {
    // Parse URL to get extension
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    let ext = path.extname(pathname) || ".png";

    // Clean extension (remove query params if any)
    ext = ext.split("?")[0];
    if (!ext.match(/^\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      ext = ".png";
    }

    const imageFileName = `${slug}-${index}${ext}`;
    const imagePath = path.join(IMAGES_DIR, imageFileName);

    // Create directory if not exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Download image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(imagePath, Buffer.from(buffer));

    console.log(`    Downloaded: ${imageFileName}`);
    return `/notion-blog/images/posts/${imageFileName}`;
  } catch (error) {
    console.error(`    Failed to download image: ${url}`, error);
    return url; // Return original URL if download fails
  }
}

// Process images in markdown content
async function processImages(markdown: string, slug: string): Promise<string> {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let processedMarkdown = markdown;
  const matches = [...markdown.matchAll(imageRegex)];

  let imageIndex = 0;
  for (const match of matches) {
    const [fullMatch, alt, url] = match;

    // Only download external images (Notion hosted or other URLs)
    if (url.startsWith("http")) {
      const localPath = await downloadImage(url, slug, imageIndex++);
      processedMarkdown = processedMarkdown.replace(fullMatch, `![${alt}](${localPath})`);
    }
  }

  return processedMarkdown;
}

// Post-process markdown for better rendering
function postProcessMarkdown(markdown: string): string {
  let processed = markdown;

  // 1. Convert **text** inside <summary> tags to <strong>text</strong>
  processed = processed.replace(
    /<summary>\*\*([^*]+)\*\*<\/summary>/g,
    "<summary><strong>$1</strong></summary>"
  );

  // 2. Add blank line after </summary> for proper markdown parsing
  processed = processed.replace(
    /<\/summary>\n([^\n])/g,
    "</summary>\n\n$1"
  );

  // 3. Ensure </details> has proper spacing
  processed = processed.replace(
    /([^\n])\n<\/details>/g,
    "$1\n\n</details>"
  );

  // 4. Convert **`code`** to <strong><code>code</code></strong>
  processed = processed.replace(
    /\*\*`([^`]+)`\*\*/g,
    "<strong><code>$1</code></strong>"
  );

  return processed;
}

// Create frontmatter for markdown file
function createFrontmatter(props: PostProperties): string {
  const escapeQuotes = (str: string) => str.replace(/"/g, '\\"');

  return `---
title: "${escapeQuotes(props.title)}"
slug: "${props.slug}"
summary: "${escapeQuotes(props.summary)}"
category: "${props.category}"
tags: [${props.tags.map((t) => `"${t}"`).join(", ")}]
publishedAt: ${props.publishedAt ? `"${props.publishedAt}"` : "null"}
updatedAt: "${props.updatedAt}"
createdAt: "${props.createdAt}"
number: ${props.number}
---

`;
}

// Main sync function
async function syncNotionToMarkdown() {
  console.log("Starting Notion sync...\n");

  // Clear content directory
  try {
    await fs.rm(CONTENT_DIR, { recursive: true, force: true });
  } catch (e) {
    // Directory might not exist
  }
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  // Fetch published posts
  const posts = await fetchPublishedPosts();
  console.log(`Found ${posts.length} published posts\n`);

  if (posts.length === 0) {
    console.log("No published posts found. Creating placeholder...");
    // Create a placeholder file to prevent build errors
    const placeholderPath = path.join(CONTENT_DIR, ".gitkeep");
    await fs.writeFile(placeholderPath, "");
    return;
  }

  for (const post of posts) {
    const props = extractProperties(post);
    console.log(`Processing: ${props.title}`);

    try {
      // Convert Notion page to markdown
      const mdBlocks = await n2m.pageToMarkdown(post.id);
      let markdown = n2m.toMarkdownString(mdBlocks).parent;

      // Process images (download and update paths)
      markdown = await processImages(markdown, props.slug);

      // Post-process markdown for better rendering
      markdown = postProcessMarkdown(markdown);

      // Combine frontmatter and content
      const content = createFrontmatter(props) + markdown;

      // Write markdown file
      const filePath = path.join(CONTENT_DIR, `${props.slug}.md`);
      await fs.writeFile(filePath, content, "utf-8");

      console.log(`  -> Saved: ${props.slug}.md\n`);
    } catch (error) {
      console.error(`  -> Error processing ${props.title}:`, error);
    }
  }

  console.log("\nSync completed!");
}

// Run sync
syncNotionToMarkdown().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
