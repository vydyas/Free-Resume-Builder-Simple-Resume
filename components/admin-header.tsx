"use client";

import Link from "next/link";

export function AdminHeader() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 z-50">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <span className="text-xl font-semibold text-gray-900">
              Admin Panel
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}


