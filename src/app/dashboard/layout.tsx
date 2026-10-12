"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
        {/* Sidebar */}
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Unverified Email Warning Banner */}
          {user && !user.emailVerified && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs sm:text-sm text-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Your email is not verified yet. Please check your inbox to verify your account.</span>
              </div>
              <Link
                href="/verify-email"
                className="underline font-semibold text-amber-900 hover:text-amber-700 shrink-0 ml-3"
              >
                Verify Now
              </Link>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
