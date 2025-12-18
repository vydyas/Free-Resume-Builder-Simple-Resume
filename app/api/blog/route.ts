import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureBlogDir() {
  try {
    await fs.mkdir(BLOG_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to ensure blog directory:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, excerpt, content, tags } = body ?? {};

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const slug = slugify(title);
    if (!slug) {
      return NextResponse.json({ error: "Invalid title." }, { status: 400 });
    }

    await ensureBlogDir();

    const filePath = path.join(BLOG_DIR, `${slug}.md`);

    try {
      await fs.access(filePath);
      return NextResponse.json(
        { error: "A post with this title already exists." },
        { status: 409 }
      );
    } catch {
      // File does not exist, continue
    }

    const now = new Date().toISOString().split("T")[0];
    const parsedTags: string[] =
      Array.isArray(tags) && tags.length > 0
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : [];

    const frontmatter = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: "${now}"`,
      `excerpt: "${(excerpt || "").replace(/"/g, '\\"')}"`,
      parsedTags.length ? `tags: [${parsedTags.map((t) => `"${t}"`).join(", ")}]` : "tags: []",
      'author: "SimpleResu.me Team"',
      "---",
      "",
    ].join("\n");

    // Preserve newlines - only trim trailing newlines, keep content structure
    const trimmedContent = content.replace(/\n+$/, '');
    const fileContents = `${frontmatter}${trimmedContent}\n`;

    await fs.writeFile(filePath, fileContents, "utf8");

    return NextResponse.json({ slug }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post." },
      { status: 500 }
    );
  }
}




