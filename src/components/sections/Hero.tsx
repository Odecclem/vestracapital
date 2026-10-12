"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Sparkles, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden bg-white">
      {/* Background Subtle Gradient & Grid Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/60 via-blue-50/20 to-transparent blur-3xl opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(#1d4ed8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Live Trust Pill */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
              </span>
              <span>Next-Gen Crypto Wealth Management</span>
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0a0a0a] leading-[1.08] mb-6"
            >
              Invest Smart. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6]">
                Multiply Wealth.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-[#4b5563] mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Maximize your digital asset yields with institutional-grade risk hedging, automated compounding, and instant verified withdrawals.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 mb-10"
            >
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 shadow-[0_4px_20px_rgba(29,78,216,0.35)] hover:shadow-[0_8px_25px_rgba(29,78,216,0.45)] hover:-translate-y-0.5"
              >
                Start Investing Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#calculator"
                className="w-full sm:w-auto flex items-center justify-center bg-white border border-[#e5e7eb] hover:border-blue-300 text-[#111827] hover:bg-blue-50/50 px-7 py-4 rounded-xl text-base font-semibold transition-all duration-200 shadow-sm"
              >
                Calculate Profit
              </a>
            </motion.div>

            {/* Social Proof / Investor Rating */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-gray-100 text-sm text-[#4b5563]"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-gray-900 ml-1">4.9/5</span>
                <span className="text-gray-500">(18,400+ Investors)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-700">Bank-Grade 256-Bit SSL</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Animated Glassmorphism Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Background Glow Ring */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl -z-10" />

            {/* Main Portfolio Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Portfolio Performance</h3>
                    <p className="text-xs text-gray-500">Auto-Rebalancing Active</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Active
                </span>
              </div>

              {/* Balance Amount */}
              <div className="my-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value Locked</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">$42,850.00</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +28.4%
                  </span>
                </div>
              </div>

              {/* Dynamic Animated Sparkline Graph */}
              <div className="h-28 w-full my-4 relative">
                <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    d="M 0 80 Q 50 70, 90 55 T 180 35 T 240 25 T 300 10 L 300 100 L 0 100 Z"
                    fill="url(#chartGradient)"
                  />
                  {/* Line stroke */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M 0 80 Q 50 70, 90 55 T 180 35 T 240 25 T 300 10"
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Live Metric Pills */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Today's Profit</span>
                  <span className="text-base font-bold text-gray-900">+$620.40</span>
                </div>
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Active Contracts</span>
                  <span className="text-base font-bold text-blue-700">3 VIP Plans</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Crypto Pill 1: BTC (Bottom Left) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 sm:-left-8 bg-white border border-gray-200/90 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 hidden sm:flex"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                ₿
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Bitcoin Payout</p>
                <p className="text-[11px] font-semibold text-emerald-600">+1.24 BTC Completed</p>
              </div>
            </motion.div>

            {/* Floating Security Badge 2: Top Right */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute -top-6 -right-4 sm:-right-6 bg-white border border-gray-200/90 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-gray-800">Cold Storage Vault</span>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
