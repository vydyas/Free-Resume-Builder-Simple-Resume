"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

interface EmailPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    emailSubscriptionEnabled: boolean;
  };
  onUpdate: () => void;
}

export function EmailPreferencesModal({
  open,
  onOpenChange,
  userData,
  onUpdate,
}: EmailPreferencesModalProps) {
  const [emailSubscriptionEnabled, setEmailSubscriptionEnabled] = useState(
    userData.emailSubscriptionEnabled
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setEmailSubscriptionEnabled(userData.emailSubscriptionEnabled);
      setMessage(null);
    }
  }, [open, userData]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailSubscriptionEnabled,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: emailSubscriptionEnabled
            ? "You've successfully opted in to email notifications"
            : "You've successfully opted out of email notifications",
        });
        setTimeout(() => {
          onUpdate();
          onOpenChange(false);
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        setMessage({
          type: "error",
          text: errorData.error || "Failed to update preferences",
        });
      }
    } catch (error) {
      console.error("Error updating email preferences:", error);
      setMessage({
        type: "error",
        text: "An error occurred while updating preferences",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Email notifications</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          <p className="text-gray-600">
            Control whether you receive emails from SimpleResu.me, including
            product updates, blog posts, job opportunities, and weekly summaries.
          </p>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="email-subscription"
              checked={emailSubscriptionEnabled}
              onChange={(e) => setEmailSubscriptionEnabled(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <div className="flex-1">
              <label
                htmlFor="email-subscription"
                className="block font-medium text-gray-900 cursor-pointer mb-1"
              >
                Receive email notifications
              </label>
              <p className="text-sm text-gray-600">
                {emailSubscriptionEnabled
                  ? "You will receive product updates, blog posts, job opportunities, and weekly summaries via email."
                  : "You will not receive any promotional or update emails from us."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


