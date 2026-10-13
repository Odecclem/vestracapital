"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Menu, Shield, LogOut } from "lucide-react";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import { useRouter } from "next/navigation";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#374151] hover:text-[#1d4ed8] p-2 -ml-2 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#0a0a0a] hidden sm:flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#1d4ed8]" />
          Admin Panel
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <NotificationDropdown />

        <div className="w-px h-8 bg-[#e5e7eb]" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-[#0a0a0a] leading-tight max-w-[140px] truncate">
              {user?.displayName || "Admin"}
            </span>
            <span className="text-xs text-[#6b7280] leading-tight max-w-[140px] truncate">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#e5e7eb] hidden sm:block" />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden sm:block">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
