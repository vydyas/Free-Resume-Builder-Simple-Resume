"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SharedHeader } from "@/components/shared-header";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Image,
  Minus,
} from "lucide-react";

interface FormState {
  title: string;
  excerpt: string;
  tags: string;
  content: string;
}

export default function BlogEditorPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    excerpt: "",
    tags: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const insertMarkdown = (
    before: string,
    after: string = "",
    placeholder: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end);
    const textBefore = form.content.substring(0, start);
    const textAfter = form.content.substring(end);

    const newText =
      textBefore +
      before +
      (selectedText || placeholder) +
      after +
      textAfter;

    setForm((prev) => ({ ...prev, content: newText }));

    // Set cursor position after inserted text
    setTimeout(() => {
      const newCursorPos = start + before.length + (selectedText || placeholder).length + after.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarActions = [
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertMarkdown("# ", "", "Heading"),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => insertMarkdown("## ", "", "Heading"),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertMarkdown("### ", "", "Heading"),
    },
    { icon: Minus, label: "Divider", action: () => insertMarkdown("\n---\n", "") },
    {
      icon: Bold,
      label: "Bold",
      action: () => insertMarkdown("**", "**", "bold text"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertMarkdown("*", "*", "italic text"),
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertMarkdown("`", "`", "code"),
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertMarkdown("[", "](url)", "link text"),
    },
    {
      icon: Image,
      label: "Image",
      action: () => insertMarkdown("![", "](url)", "alt text"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertMarkdown("- ", "\n- ", "Item"),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertMarkdown("1. ", "\n2. ", "Item"),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertMarkdown("> ", "", "Quote"),
    },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      setSuccess("Post created successfully!");
      setForm({ title: "", excerpt: "", tags: "", content: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader variant="landing" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Blog Editor
          </h1>
          <p className="text-gray-600">
            Create new markdown posts for the blog. Content is saved as .md in
            the repository.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Title*
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleChange("title")}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Post title"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={handleChange("tags")}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Resume, Career, Tips"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={handleChange("excerpt")}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Short description (optional)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Content (Markdown)*
            </label>
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-200 rounded-t-lg bg-gray-50">
              {toolbarActions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={item.action}
                    title={item.label}
                    className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Editor and Preview Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-200 border-t-0 rounded-b-lg overflow-hidden">
              {/* Editor */}
              <div className="border-r border-gray-200">
                <textarea
                  ref={textareaRef}
                  required
                  value={form.content}
                  onChange={handleChange("content")}
                  rows={20}
                  className="w-full h-full min-h-[500px] px-4 py-3 font-mono text-sm text-gray-900 focus:outline-none resize-none"
                  placeholder="# Heading\n\nWrite your markdown content here..."
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 overflow-y-auto max-h-[500px]">
                <div className="p-4 prose prose-sm max-w-none 
                  prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-headings:first:mt-0
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:leading-tight
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:leading-tight
                  prose-h3:text-xl prose-h3:font-bold prose-h3:text-gray-900 prose-h3:leading-tight
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
                  prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:text-gray-700 prose-ol:text-gray-700 prose-ul:my-4 prose-ol:my-4
                  prose-li:my-2
                  prose-code:text-emerald-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded prose-pre:p-4 prose-pre:my-4
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
                  prose-img:rounded-lg prose-img:my-4 prose-img:w-full">
                  {form.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkBreaks]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-4 first:mt-0 leading-tight">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4 leading-tight">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-bold text-gray-900 mt-5 mb-3 leading-tight">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-700 leading-relaxed my-4">
                            {children}
                          </p>
                        ),
                        br: () => <br className="my-2" />,
                      }}
                    >
                      {form.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-400 italic">Preview will appear here...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Post"}
            </button>
            <p className="text-sm text-gray-500">
              Markdown will be saved to /content/blog/ as a .md file.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}




