"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is authenticated
  const checkAuth = (): boolean => {
    try {
      const auth = sessionStorage.getItem("admin_authenticated");
      const loginTime = sessionStorage.getItem("admin_login_time");

      if (!auth || !loginTime) {
        return false;
      }

      // Check if session is expired (24 hours)
      const timeDiff = Date.now() - parseInt(loginTime);
      if (timeDiff > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem("admin_authenticated");
        sessionStorage.removeItem("admin_login_time");
        return false;
      }

      return true;
    } catch (error) {
      // sessionStorage might not be available
      console.error("Error checking admin auth:", error);
      return false;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsChecking(false);
      setIsAuthenticated(false);
      return;
    }

    // Small delay to ensure sessionStorage is set after login
    const timer = setTimeout(() => {
      // Check admin authentication
      const authenticated = checkAuth();

      if (!authenticated) {
        setIsAuthenticated(false);
        setIsChecking(false);
        router.replace("/admin/login");
        return;
      }

      setIsAuthenticated(true);
      setIsChecking(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show loading if not authenticated (redirect is handled in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 overflow-auto pt-16 lg:pt-0">{children}</div>
    </div>
  );
}


