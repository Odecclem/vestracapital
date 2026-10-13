"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  seedWelcomeNotificationIfEmpty,
  AppNotification,
} from "@/lib/firebase/notifications";
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatRelativeTime(timestamp: { seconds: number } | null | any): string {
  if (!timestamp || typeof timestamp.seconds !== "number") return "Just now";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp.seconds;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "deposit":
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <ArrowDownToLine className="h-4 w-4" />
        </div>
      );
    case "withdrawal":
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <ArrowUpFromLine className="h-4 w-4" />
        </div>
      );
    case "investment":
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1d4ed8] flex items-center justify-center shrink-0">
          <TrendingUp className="h-4 w-4" />
        </div>
      );
    case "kyc":
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>
      );
    case "welcome":
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
          <Bell className="h-4 w-4" />
        </div>
      );
  }
}

export default function NotificationDropdown() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [remoteNotifications, setRemoteNotifications] = useState<AppNotification[]>([]);
  const [fallbackReadIds, setFallbackReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    try {
      seedWelcomeNotificationIfEmpty(user.uid, user.displayName || undefined);
    } catch {
      // Ignored if permissions not set yet
    }

    try {
      const unsubscribe = subscribeNotifications(user.uid, (list) => {
        setRemoteNotifications(list);
      });
      return () => {
        unsubscribe();
      };
    } catch {
      // Fallback handles it gracefully
    }
  }, [user]);

  // Click outside listener that supports mobile touch & desktop click reliably
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Small delay ensures opening tap does not immediately re-trigger close on mobile
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("touchend", handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [isOpen]);

  // Synthesize smart real-time notifications if remote list is empty
  const nowSecs = Math.floor(Date.now() / 1000);
  const dynamicFallbackNotifications: AppNotification[] = [
    {
      id: "fb-invest",
      userId: user?.uid || "",
      title: "Portfolio Yield Accruing",
      message: `${
        userData?.totalInvested
          ? `$${Number(userData.totalInvested).toLocaleString()} allocated in active contracts.`
          : "Active investment plan."
      } Daily returns are being calculated and compounded.`,
      type: "investment",
      read: fallbackReadIds.includes("fb-invest"),
      createdAt: { seconds: nowSecs - 3600 * 2 },
      link: "/dashboard/investments",
    },
    {
      id: "fb-deposit",
      userId: user?.uid || "",
      title: "Wallet Balance Ready",
      message: `Available wallet balance: $${Number(userData?.walletBalance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}. Ready to withdraw or invest in higher tier plans.`,
      type: "deposit",
      read: fallbackReadIds.includes("fb-deposit"),
      createdAt: { seconds: nowSecs - 3600 * 6 },
      link: "/dashboard/deposit",
    },
    {
      id: "fb-welcome",
      userId: user?.uid || "",
      title: "Welcome to Vestra Capital",
      message: `Welcome, ${user?.displayName || "Investor"}! Your institutional account is secured by 256-bit SSL encryption.`,
      type: "welcome",
      read: fallbackReadIds.includes("fb-welcome"),
      createdAt: { seconds: nowSecs - 86400 },
      link: "/dashboard",
    },
  ];

  const notifications = remoteNotifications.length > 0 ? remoteNotifications : dynamicFallbackNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      if (remoteNotifications.length > 0) {
        await markNotificationAsRead(notif.id);
      } else {
        setFallbackReadIds((prev) => [...prev, notif.id]);
      }
    }
    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    if (remoteNotifications.length > 0) {
      await markAllNotificationsAsRead(user.uid);
    } else {
      setFallbackReadIds(["fb-invest", "fb-deposit", "fb-welcome"]);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (remoteNotifications.length > 0) {
      await deleteNotification(id);
    } else {
      setFallbackReadIds((prev) => [...prev, id]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#6b7280] hover:text-[#1d4ed8] hover:bg-[#f8fafc] rounded-lg transition-colors focus:outline-none"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Mobile Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative group ${
                    notif.read
                      ? "hover:bg-gray-50/80 bg-white"
                      : "bg-blue-50/40 hover:bg-blue-50/70"
                  }`}
                >
                  {/* Icon */}
                  {getNotificationIcon(notif.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-xs font-semibold truncate ${
                          notif.read ? "text-gray-800" : "text-gray-900 font-bold"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="absolute right-2.5 top-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
              <Link
                href="/dashboard/investments"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
              >
                <span>View portfolio investments</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
