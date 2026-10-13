"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatFullDate(timestamp: { seconds: number } | null | any): string {
  if (!timestamp || typeof timestamp.seconds !== "number") return "Just now";
  return new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getIcon(type: string) {
  switch (type) {
    case "deposit":
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <ArrowDownToLine className="h-5 w-5" />
        </div>
      );
    case "withdrawal":
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <ArrowUpFromLine className="h-5 w-5" />
        </div>
      );
    case "investment":
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1d4ed8] flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
      );
    case "kyc":
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
      );
    case "welcome":
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
          <Bell className="h-5 w-5" />
        </div>
      );
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "transactions" | "system">("all");

  useEffect(() => {
    if (!user) return;

    seedWelcomeNotificationIfEmpty(user.uid, user.displayName || undefined);

    const unsubscribe = subscribeNotifications(user.uid, (list) => {
      setNotifications(list);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "transactions") return n.type === "deposit" || n.type === "withdrawal" || n.type === "investment";
    if (filter === "system") return n.type === "kyc" || n.type === "welcome" || n.type === "system";
    return true;
  });

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.uid);
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d4ed8]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a0a0a] flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-[#1d4ed8]" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Stay informed with real-time updates on your deposits, investments, and account security.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1d4ed8] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === "all"
              ? "bg-[#1d4ed8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === "unread"
              ? "bg-[#1d4ed8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("transactions")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === "transactions"
              ? "bg-[#1d4ed8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Transactions & Plans
        </button>
        <button
          onClick={() => setFilter("system")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            filter === "system"
              ? "bg-[#1d4ed8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Account & Security
        </button>
      </div>

      {/* Notifications Container */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-[#f1f5f9]">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No notifications found
            </h3>
            <p className="text-sm text-gray-500">
              {filter === "unread"
                ? "You've read all your notifications!"
                : "Activity updates will appear here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-5 flex items-start gap-4 cursor-pointer transition-colors group relative ${
                notif.read ? "hover:bg-[#f8fafc]" : "bg-blue-50/40 hover:bg-blue-50/70"
              }`}
            >
              {/* Type Icon */}
              {getIcon(notif.type)}

              {/* Main Info */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm ${
                      notif.read ? "font-semibold text-gray-800" : "font-bold text-gray-900"
                    }`}
                  >
                    {notif.title}
                  </h4>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-400">
                    {formatFullDate(notif.createdAt)}
                  </span>
                  {notif.link && (
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                      <span>View details</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, notif.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all rounded-lg hover:bg-white"
                title="Delete notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
