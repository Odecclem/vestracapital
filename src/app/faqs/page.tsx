"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Bot,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Headset,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: string;
  category: "all" | "investing" | "deposits" | "withdrawals" | "security" | "copytrading";
  question: string;
  answer: string;
}

const FAQS_LIST: FAQItem[] = [
  {
    id: "f1",
    category: "deposits",
    question: "How do I make a cryptocurrency deposit?",
    answer: "Getting started takes under two minutes. Simply sign in to your user dashboard, click on 'Deposit', select your preferred cryptocurrency (Bitcoin, Ethereum, USDT TRC-20/ERC-20, or Solana), copy your unique custody address or scan the QR code, and send the transaction from your wallet. Once 1 to 3 blockchain confirmations are received, your account balance is instantly updated.",
  },
  {
    id: "f2",
    category: "withdrawals",
    question: "When and how can I withdraw my profits?",
    answer: "Withdrawals can be requested 24/7 directly from your dashboard. Click 'Withdraw', choose the asset, paste your destination wallet address, and enter the amount. Payouts are executed automatically within 1 to 2 hours following network validation with zero hidden fees.",
  },
  {
    id: "f3",
    category: "investing",
    question: "What are the investment tiers and how does ROI work?",
    answer: "We offer 4 distinct plans:\n• Basic Plan: $100 – $499 | 25% ROI in 7 days\n• Standard Plan: $500 – $999 | 45% ROI in 10 days\n• Pro Plan: $1,000 – $4,999 | 75% ROI in 14 days\n• VIP Institutional: $5,000+ | 100% ROI in 21 days\nEarnings accrue dynamically every 24 hours on your dashboard, and 100% of your initial capital is returned upon plan completion.",
  },
  {
    id: "f4",
    category: "security",
    question: "How does Vestra Capital secure investor funds?",
    answer: "We deploy institutional-grade multi-signature cold storage vaults for more than 95% of digital assets. Platform communications and client records are safeguarded by 256-bit SSL encryption, Cloudflare enterprise DDoS protection, and automated algorithmic hedging to protect against downside volatility.",
  },
  {
    id: "f5",
    category: "copytrading",
    question: "How does automated Copy Trading work?",
    answer: "Vestra Copy Trading allows you to mirror the real-time trades of elite, audited cryptocurrency traders with historical win rates of 85%+. Execution takes milliseconds without slippage. You maintain complete control to start, stop, or adjust capital allocation at any time.",
  },
  {
    id: "f6",
    category: "investing",
    question: "Can I run multiple investment plans simultaneously?",
    answer: "Yes, you can hold multiple active contracts concurrently across different tiers. Each plan operates independently with its own elapsed timer, daily accrual rate, and maturity date.",
  },
  {
    id: "f7",
    category: "security",
    question: "Is Two-Factor Authentication (2FA) supported?",
    answer: "Yes! We strongly advise all investors to activate 2FA in Dashboard > Settings. When enabled, withdrawals and sensitive account changes require an authentication code, safeguarding your portfolio even if your credentials are compromised.",
  },
  {
    id: "f8",
    category: "copytrading",
    question: "What is the referral bonus rate?",
    answer: "Our referral program pays a direct 8% commission on every active investment made by investors who sign up using your referral link. Commissions are credited instantly to your available balance and can be withdrawn immediately or reinvested.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "investing", label: "Investing & ROI" },
  { id: "deposits", label: "Deposits & Crypto" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "security", label: "Security & Custody" },
  { id: "copytrading", label: "Copy Trading & Referrals" },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(["f1", "f3"]);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQS_LIST.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAIChatbot = (promptText?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-vestra-chat", {
          detail: { prompt: promptText },
        })
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 bg-[#f8fafc]">
        {/* Top Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Knowledge Base & Support</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0a0a0a] tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
              Find instant answers to questions regarding our investment contracts, deposit protocols,
              institutional security, and daily payouts.
            </p>

            {/* Search Bar */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. deposit, ROI, withdrawal)..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openIds.includes(faq.id);
                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:border-blue-200 transition-colors"
                  >
                    <button
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-gray-900 text-sm sm:text-base cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 shrink-0 transform transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 whitespace-pre-line">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
                <HelpCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900">No matching questions found</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Try adjusting your search terms or ask our AI Concierge directly.
                </p>
                <button
                  onClick={() => openAIChatbot(searchQuery)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  <Bot className="h-4 w-4" />
                  <span>Ask AI Concierge "{searchQuery}"</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Helpdesk CTA Box */}
          <div className="mt-14 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Still have questions?</h3>
              <p className="text-blue-100 text-sm mt-1 max-w-md">
                Our 24/7 AI Concierge and senior wealth managers are ready to assist you right now.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => openAIChatbot("I have a question about my account")}
                className="w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Bot className="h-4 w-4" />
                <span>Chat with AI Concierge</span>
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto bg-blue-600/50 hover:bg-blue-600 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <Headset className="h-4 w-4" />
                <span>Contact Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
