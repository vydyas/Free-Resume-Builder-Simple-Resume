"use client";

import { useState } from "react";
import { Loader2, User } from "lucide-react";

interface NamePromptModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
}

export function NamePromptModal({ open, onClose, email }: NamePromptModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please fill in both first and last name");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/users/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      if (response.ok) {
        onClose();
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add your name to personalize your resume
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your first name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your last name"
            />
          </div>

          <p className="text-xs text-gray-500">
            Logged in as <span className="font-medium">{email}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue to Resume Builder"
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 px-6 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

