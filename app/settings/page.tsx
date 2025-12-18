"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { 
  User, 
  Bell,
  ChevronRight,
  Loader2
} from "lucide-react";
import { SharedHeader } from "@/components/shared-header";
import { ProfileInfoModal } from "@/components/settings/profile-info-modal";
import { EmailPreferencesModal } from "@/components/settings/email-preferences-modal";

type SettingsSection = "preferences" | "notifications";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [activeSection, setActiveSection] = useState<SettingsSection>("preferences");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    emailSubscriptionEnabled: boolean;
  } | null>(null);

  const fetchUserPreferences = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/users/preferences", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
          emailSubscriptionEnabled: data.emailSubscriptionEnabled ?? true,
        });
      } else {
        setUserData({
          firstName: "",
          lastName: "",
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
          emailSubscriptionEnabled: true,
        });
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      setUserData({
        firstName: "",
        lastName: "",
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
        emailSubscriptionEnabled: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserPreferences();
    }
  }, [isLoaded, user, fetchUserPreferences]);

  const handlePreferencesUpdated = () => {
    fetchUserPreferences();
  };

  const navigationItems = [
    { id: "preferences" as SettingsSection, label: "Preferences", icon: User },
    { id: "notifications" as SettingsSection, label: "Notifications", icon: Bell },
  ];

  const getDisplayName = () => {
    if (!userData) return "User";
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.firstName) return userData.firstName;
    if (userData.lastName) return userData.lastName;
    return userData.email.split("@")[0] || "User";
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        <SharedHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f0]">
        <SharedHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to access settings</p>
            <Link
              href="/sign-in"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <SharedHeader />
      <div className="flex flex-col lg:flex-row">
        {/* Mobile/Tablet: Scrollable Tabs */}
        <div className="lg:hidden border-b border-emerald-100/50 bg-gradient-to-r from-white via-emerald-50/30 to-white">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-4">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={getDisplayName()}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-100"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-medium ring-2 ring-emerald-100 text-sm">
                  {getDisplayName().charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-lg font-bold text-gray-900">Settings</h1>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="flex gap-2 min-w-max pb-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                          : "text-gray-700 hover:bg-emerald-50/50 hover:text-gray-900 bg-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-gray-600"}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Desktop: Left Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-white via-emerald-50/30 to-white border-r border-emerald-100/50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={getDisplayName()}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-medium ring-2 ring-emerald-100">
                  {getDisplayName().charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>

            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50"
                        : "text-gray-700 hover:bg-emerald-50/50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-gray-600"}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Content Panel */}
        <main className="lg:ml-64 flex-1 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Preferences Section */}
              {activeSection === "preferences" && userData && (
                <div className="space-y-6">
                  {/* Profile Information Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Profile information</h2>
                    <div className="space-y-0">
                      <button
                        onClick={() => setProfileModalOpen(true)}
                        className="w-full flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group first:pt-0"
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">Name, location, and industry</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {userData.firstName || userData.lastName
                              ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
                              : "Not set"}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-4" />
                      </button>
                      <button
                        onClick={() => setProfileModalOpen(true)}
                        className="w-full flex items-center justify-between py-4 hover:bg-gray-50 transition-colors group last:pb-0"
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">Personal demographic information</div>
                          <div className="text-sm text-gray-500 mt-1">Manage your personal details</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && userData && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Email preferences</h2>
                    <div className="space-y-0">
                      <button
                        onClick={() => setEmailModalOpen(true)}
                        className="w-full flex items-center justify-between py-4 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">Email notifications</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {userData.emailSubscriptionEnabled ? "Subscribed" : "Unsubscribed"}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {userData && (
        <>
          <ProfileInfoModal
            open={profileModalOpen}
            onOpenChange={setProfileModalOpen}
            userData={userData}
            onUpdate={handlePreferencesUpdated}
          />
          <EmailPreferencesModal
            open={emailModalOpen}
            onOpenChange={setEmailModalOpen}
            userData={userData}
            onUpdate={handlePreferencesUpdated}
          />
        </>
      )}
    </div>
  );
}


