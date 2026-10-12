"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do I make a deposit and start earning?",
    answer: "Getting started takes under two minutes. Create a free account, navigate to 'Deposit' in your user dashboard, choose your preferred cryptocurrency (BTC, ETH, USDT, SOL), and send the funds to your unique deposit address. Once confirmed on the blockchain, your balance is credited instantly to start earning daily returns.",
  },
  {
    question: "When and how can I withdraw my profits?",
    answer: "Withdrawals can be requested 24/7 directly from your dashboard. Simply click 'Withdraw', enter your external crypto wallet address, and specify the amount. Requests are processed instantly or within 1 to 2 hours following automated blockchain verification with zero hidden fees.",
  },
  {
    question: "What is the minimum and maximum investment amount?",
    answer: "Our entry-level Basic Plan starts at just $100 up to $999. For larger portfolios, the Pro Plan ranges from $1,000 to $4,999, and the VIP Plan accommodates capital from $5,000 up to $100,000.",
  },
  {
    question: "How does Vestra Capital secure investor funds?",
    answer: "We employ institutional-grade digital asset custody. Over 95% of customer assets are stored in multi-signature offline cold storage vaults protected by 256-bit SSL encryption and automated risk hedging strategies to protect capital against market volatility.",
  },
  {
    question: "What cryptocurrencies are supported?",
    answer: "We support the world's most liquid assets including Bitcoin (BTC), Ethereum (ETH), Tether (USDT on TRC-20 & ERC-20), USD Coin (USDC), and Solana (SOL).",
  },
  {
    question: "Does Vestra Capital offer a referral commission program?",
    answer: "Yes! Every registered member receives a unique referral link inside their dashboard. You earn an immediate 8% direct commission on any investments made by users you refer, paid straight to your wallet balance.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first item by default

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0a0a] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#6b7280]">
            Everything you need to know about investing, withdrawals, and account security.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-blue-300 bg-blue-50/20 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="text-base sm:text-lg font-bold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-blue-600"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-6 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-blue-100/60 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
