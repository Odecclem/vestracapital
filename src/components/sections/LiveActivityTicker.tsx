"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "deposit" | "payout";
  user: string;
  amount: string;
  currency: string;
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: "1", type: "payout", user: "0x89...41c", amount: "$3,450.00", currency: "USDT", time: "2m ago" },
  { id: "2", type: "deposit", user: "k***@gmail.com", amount: "$5,000.00", currency: "BTC", time: "4m ago" },
  { id: "3", type: "payout", user: "0x2e...90a", amount: "$1,820.00", currency: "ETH", time: "7m ago" },
  { id: "4", type: "deposit", user: "david_m***", amount: "$2,200.00", currency: "USDT", time: "11m ago" },
  { id: "5", type: "payout", user: "0x77...bb4", amount: "$9,500.00", currency: "USDT", time: "14m ago" },
  { id: "6", type: "deposit", user: "sarah.w***", amount: "$10,000.00", currency: "BTC", time: "18m ago" },
  { id: "7", type: "payout", user: "0x44...32e", amount: "$840.00", currency: "SOL", time: "22m ago" },
  { id: "8", type: "deposit", user: "investor_09", amount: "$1,500.00", currency: "USDC", time: "25m ago" },
];

export default function LiveActivityTicker() {
  return (
    <div className="bg-white border-y border-gray-200/90 py-5 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Live Network Settlement Feed
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>Blockchain Verified</span>
        </div>
      </div>

      {/* Marquee Strip */}
      <div className="relative w-full flex overflow-x-hidden">
        {/* Left & Right subtle gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
          className="flex gap-4 shrink-0"
        >
          {[...ACTIVITIES, ...ACTIVITIES].map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-3 bg-gray-50/90 border border-gray-200/80 rounded-xl px-4 py-2.5 shadow-sm shrink-0 hover:bg-white transition-colors"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  item.type === "deposit"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {item.type === "deposit" ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{item.amount}</span>
                  <span className="text-[10px] font-semibold bg-gray-200/70 text-gray-700 px-1.5 py-0.2 rounded">
                    {item.currency}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span>{item.user}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
