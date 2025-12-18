"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle2, XCircle, Eye, X, Search } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import type { EmailTemplateType } from "@/lib/email-templates";
import { EmailsShimmer } from "@/components/admin/emails-shimmer";

interface User {
  id: string;
  email: string;
  clerk_user_id: string;
  created_at: string;
  updated_at: string;
  email_subscription_enabled?: boolean;
  first_name?: string;
  last_name?: string;
}

interface EmailTemplate {
  id: EmailTemplateType;
  name: string;
  description: string;
  subject: string;
  html: string;
  variables: string[];
}

export default function AdminEmailsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType | "custom">("custom");
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // WYSIWYG Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-6 space-y-1",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-6 space-y-1",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-emerald-600 underline",
        },
      }),
    ],
    content: emailContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEmailContent(html);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[400px] p-4",
      },
    },
  });

  // Update editor content when emailContent changes externally (e.g., from template)
  useEffect(() => {
    if (editor && emailContent && editor.getHTML() !== emailContent) {
      editor.commands.setContent(emailContent);
    }
  }, [emailContent, editor]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  const replaceVariables = (template: string, vars: Record<string, string>): string => {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, value || "");
    }
    return result;
  };

  useEffect(() => {
    document.title = "Send Emails - Admin Panel - SimpleResu.me";
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate !== "custom" && templates.length > 0) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        setEmailSubject(template.subject);
        setEmailContent(template.html);
        // Initialize variables with empty strings
        setTemplateVariables((prev) => {
          const vars: Record<string, string> = {};
          template.variables.forEach((v) => {
            vars[v] = prev[v] || "";
          });
          return vars;
        });
      }
    } else if (selectedTemplate === "custom") {
      // Clear template variables when switching to custom
      setTemplateVariables({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, templates]);

  const fetchUsers = async () => {
    try {
      // Use cached data with revalidation
      const response = await fetch("/api/admin/users", {
        method: "GET",
        next: { revalidate: 30 }, // Revalidate every 30 seconds
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out users who have opted out of email subscriptions
        const subscribedUsers = (data.users || []).filter(
          (user: User) => user.email_subscription_enabled !== false
        );
        setUsers(subscribedUsers);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      // Templates are cached for 1 hour
      const response = await fetch("/api/admin/email-templates", {
        method: "GET",
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = (filteredUsersList: User[]) => {
    const filteredIds = filteredUsersList.map((u) => u.id);
    const allFilteredSelected = filteredIds.every((id) => selectedUsers.has(id));
    
    if (allFilteredSelected) {
      // Deselect all filtered users
      const newSelection = new Set(selectedUsers);
      filteredIds.forEach((id) => newSelection.delete(id));
      setSelectedUsers(newSelection);
    } else {
      // Select all filtered users
      const newSelection = new Set(selectedUsers);
      filteredIds.forEach((id) => newSelection.add(id));
      setSelectedUsers(newSelection);
    }
  };

  const getPreviewContent = (): string => {
    let content = emailContent;
    if (selectedTemplate !== "custom") {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        content = template.html;
      }
    }
    // Replace variables for preview (use sample data)
    const previewVars = {
      ...templateVariables,
      name: templateVariables.name || "John Doe",
      email: templateVariables.email || "john@example.com",
    };
    return replaceVariables(content, previewVars);
  };

  const getPreviewSubject = (): string => {
    let subject = emailSubject;
    if (selectedTemplate !== "custom") {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        subject = template.subject;
      }
    }
    // Replace variables for preview
    const previewVars = {
      ...templateVariables,
      name: templateVariables.name || "John Doe",
      email: templateVariables.email || "john@example.com",
    };
    return replaceVariables(subject, previewVars);
  };

  const sendBulkEmail = async () => {
    // Get the base content and subject (from template or custom)
    let baseSubject = emailSubject;
    let baseContent = emailContent;

    if (selectedTemplate !== "custom") {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        baseSubject = template.subject;
        baseContent = template.html;
      }
    }

    if (!baseSubject || !baseContent) {
      setToast({
        type: "error",
        message: "Please fill in both subject and content",
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    if (selectedUsers.size === 0) {
      setToast({
        type: "error",
        message: "Please select at least one user",
      });
      setTimeout(() => setToast(null), 5000);
      return;
    }

    setSendingEmail(true);
    setToast(null);

    try {
      // For each user, replace {name} and {email} variables
      // Only send to users who have opted in to emails
      const userIds = Array.from(selectedUsers);
      const selectedUsersData = users.filter(
        (u) => userIds.includes(u.id) && u.email_subscription_enabled !== false
      );

      // Warn if some selected users are unsubscribed
      const unsubscribedCount = users.filter(
        (u) => userIds.includes(u.id) && u.email_subscription_enabled === false
      ).length;

      if (unsubscribedCount > 0) {
        setToast({
          type: "error",
          message: `${unsubscribedCount} selected user${unsubscribedCount !== 1 ? "s have" : " has"} opted out of emails and will not receive this message`,
        });
        setTimeout(() => setToast(null), 7000);
      }

      if (selectedUsersData.length === 0) {
        setToast({
          type: "error",
          message: "No subscribed users selected. All selected users have opted out of emails.",
        });
        setTimeout(() => setToast(null), 5000);
        setSendingEmail(false);
        return;
      }

      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const user of selectedUsersData) {
        // Get user's name (first + last, or first, or email prefix, or "there")
        const userName = user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : user.first_name
          ? user.first_name
          : user.last_name
          ? user.last_name
          : user.email.split("@")[0] || "there";

        // Replace user-specific variables
        const userVars = {
          ...templateVariables,
          name: userName,
          email: user.email,
        };

        const finalSubject = replaceVariables(baseSubject, userVars);
        const finalContent = replaceVariables(baseContent, userVars);

        const response = await fetch("/api/admin/send-email", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            userIds: [user.id],
            subject: finalSubject,
            content: finalContent,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          sent++;
        } else {
          failed++;
          errors.push(`${user.email}: ${data.error || "Failed"}`);
        }
      }

      setToast({
        type: "success",
        message: `Successfully sent ${sent} email(s). ${failed > 0 ? `${failed} failed.` : ""}`,
      });
      setTimeout(() => setToast(null), 5000);

      if (sent > 0) {
        setEmailSubject("");
        setEmailContent("");
        setSelectedUsers(new Set());
        setTemplateVariables({});
        setSelectedTemplate("custom");
      }
    } catch {
      setToast({
        type: "error",
        message: "An error occurred while sending emails",
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return <EmailsShimmer />;
  }

  const currentTemplate = templates.find((t) => t.id === selectedTemplate);
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 max-w-[calc(100vw-2rem)]">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 min-w-[280px] max-w-full ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="flex-1 break-words">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-80 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Send Emails</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Send bulk or targeted emails to users using templates
          </p>
        </div>
        <button
          onClick={sendBulkEmail}
          disabled={sendingEmail || selectedUsers.size === 0}
          className="bg-black text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
        >
          {sendingEmail ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send to {selectedUsers.size} user(s)</span>
              <span className="sm:hidden">Send ({selectedUsers.size})</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Email Composer - Left Side (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Compose Email</h2>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          <div className="space-y-4">
            {/* Selected Users Summary */}
            {selectedUsers.size > 0 && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-sm font-medium text-emerald-900 mb-2">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? "s" : ""} selected
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {users
                    .filter((u) => selectedUsers.has(u.id))
                    .slice(0, 5)
                    .map((user) => (
                      <span
                        key={user.id}
                        className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded"
                      >
                        {user.email}
                      </span>
                    ))}
                  {selectedUsers.size > 5 && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                      +{selectedUsers.size - 5} more
                    </span>
                  )}
                </div>
                <div className="text-xs text-emerald-700">
                  Note: Only users who have opted in to email notifications will receive emails
                </div>
              </div>
            )}

            {/* Template Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as EmailTemplateType | "custom")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="custom">Custom HTML - Write your own HTML email</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
              {selectedTemplate !== "custom" && currentTemplate && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-sm font-medium text-emerald-900">
                    {currentTemplate.name}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    {currentTemplate.variables.length > 0
                      ? `Variables: ${currentTemplate.variables.join(", ")}`
                      : "No variables required"}
                  </div>
                </div>
              )}
            </div>

            {/* Template Variables */}
            {selectedTemplate !== "custom" && currentTemplate && currentTemplate.variables.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Template Variables
                </h3>
                <div className="space-y-3">
                  {currentTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={templateVariables[variable] || ""}
                        onChange={(e) =>
                          setTemplateVariables({
                            ...templateVariables,
                            [variable]: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder={`Enter ${variable}...`}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Note: {"{name}"} and {"{email}"} will be automatically replaced for each user
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (WYSIWYG Editor)
              </label>
              {/* Toolbar */}
              {editor && (
                <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("bold") ? "bg-gray-300" : ""
                    }`}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("italic") ? "bg-gray-300" : ""
                    }`}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <div className="w-px h-6 bg-gray-300" />
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : ""
                    }`}
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
                    }`}
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("heading", { level: 3 }) ? "bg-gray-300" : ""
                    }`}
                    title="Heading 3"
                  >
                    H3
                  </button>
                  <div className="w-px h-6 bg-gray-300" />
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("bulletList") ? "bg-gray-300" : ""
                    }`}
                    title="Bullet List"
                  >
                    •
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("orderedList") ? "bg-gray-300" : ""
                    }`}
                    title="Numbered List"
                  >
                    1.
                  </button>
                  <div className="w-px h-6 bg-gray-300" />
                  <button
                    type="button"
                    onClick={() => {
                      const url = window.prompt("Enter URL:");
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      }
                    }}
                    className={`px-3 py-1.5 text-sm rounded hover:bg-gray-200 ${
                      editor.isActive("link") ? "bg-gray-300" : ""
                    }`}
                    title="Insert Link"
                  >
                    🔗
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive("link")}
                    className="px-3 py-1.5 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                    title="Remove Link"
                  >
                    Unlink
                  </button>
                </div>
              )}
              {/* Editor */}
              <div className="border border-t-0 border-gray-300 rounded-b-lg min-h-[400px] bg-white overflow-y-auto">
                <EditorContent editor={editor} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Format your email content visually. HTML will be generated automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Users List - Right Side (1/3 width) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users by email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-600">
                {selectedUsers.size} of {users.length} selected
              </span>
              <button
                onClick={() => selectAllUsers(filteredUsers)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {filteredUsers.every((u) => selectedUsers.has(u.id)) ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {users.filter((u) => u.email_subscription_enabled !== false).length} subscribed,{" "}
              {users.filter((u) => u.email_subscription_enabled === false).length} unsubscribed
            </div>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {userSearchQuery ? (
                  <>No users found matching &quot;{userSearchQuery}&quot;</>
                ) : (
                  <>No users available</>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedUsers.has(user.id)
                      ? "bg-emerald-50 border-emerald-200"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                    {user.email_subscription_enabled === false && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        Unsubscribed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Email Preview</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Preview how your email will look
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="text-xs text-gray-500 font-medium mb-1">Subject:</div>
                <div className="text-lg font-semibold text-gray-900">
                  {getPreviewSubject() || "No subject"}
                </div>
              </div>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getPreviewContent() || "<p class='text-gray-400'>No content to preview</p>" }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


