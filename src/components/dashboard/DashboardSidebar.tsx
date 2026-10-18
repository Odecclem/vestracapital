"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/Logo";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  History,
  Settings,
  LogOut,
  X,
  Users,
  UserCircle,
  Bell,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Deposit", href: "/dashboard/deposit", icon: ArrowDownToLine },
  { name: "Withdraw", href: "/dashboard/withdraw", icon: ArrowUpFromLine },
  { name: "Invest Now", href: "/dashboard/invest", icon: TrendingUp },
  { name: "Copy Trading", href: "/dashboard/copy-trading", icon: Users },
  { name: "My Investments", href: "/dashboard/investments", icon: History },
  { name: "Transactions", href: "/dashboard/transactions", icon: History },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Referrals", href: "/dashboard/referrals", icon: Users },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#e5e7eb] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-[#e5e7eb]">
          <Logo size="sm" variant="horizontal" />
          <button
            onClick={onClose}
            className="lg:hidden text-[#6b7280] hover:text-[#0a0a0a] p-1 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[#eff6ff] text-[#1d4ed8] border-l-[3px] border-[#1d4ed8]"
                    : "text-[#374151] hover:bg-[#f8fafc] hover:text-[#1d4ed8]"
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-[#1d4ed8]" : "text-[#6b7280]"}`} />
                {item.name}
              </Link>
            );
          })}

          {/* Admin Link (Only visible if user is admin) */}
          {userData?.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 text-white bg-gray-900 hover:bg-gray-800 mt-6"
            >
              <LayoutDashboard className="h-5 w-5 shrink-0 text-white" />
              Go to Admin Panel
            </Link>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#e5e7eb]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
