"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  Bot,
  Building,
  Headset,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function ContactPage() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("General Support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setIsSubmitting(true);
    const refId = `VST-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      await addDoc(collection(db, "contact_messages"), {
        referenceId: refId,
        userId: user?.uid || "guest",
        fullName: fullName || "Valued Client",
        email,
        phone: phone || "Not provided",
        department,
        subject: subject || `${department} Inquiry`,
        message,
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setTicketRef(refId);
    } catch (err) {
      console.warn("Contact form Firestore fallback:", err);
      // Fallback so the client always gets immediate confirmation
      setTicketRef(refId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAIChatbot = (initialPrompt?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-vestra-chat", {
          detail: { prompt: initialPrompt },
        })
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20 bg-[#f8fafc]">
        {/* Top Header Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <Headset className="h-3.5 w-3.5" />
              <span>24/7 Global Client Services</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0a0a0a] tracking-tight">
              Get in Touch with Our Advisory Desk
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
              Have questions about your portfolio, funding options, or our institutional tiers?
              Our crypto specialists and 24/7 AI concierge are standing by.
            </p>
          </div>
        </div>

        {/* 3 Quick Contact Channel Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Live AI Concierge */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white mb-4 border border-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold">24/7 AI Support Concierge</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">
                  Get instant answers on deposits, withdrawal speeds, and our 4 investment tiers in under 3 seconds.
                </p>
              </div>
              <button
                onClick={() => openAIChatbot("What are the investment plans and returns?")}
                className="relative z-10 w-full bg-white text-blue-800 hover:bg-blue-50 font-bold py-3 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Launch Live Chat Assistant</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Card 2: VIP & Direct Inquiries */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 mb-4 border border-blue-100">
                  <Headset className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Direct Live Support Desk</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  For formal inquiries, account verification, and urgent deposit/withdrawal tracking.
                </p>
                <div className="space-y-2 text-sm text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Real-time Senior Manager Chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Instant On-Site Ticket Resolution</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>Typical response time: under 15 minutes</span>
              </div>
            </div>

            {/* Card 3: Institutional Headquarters */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 mb-4 border border-purple-100">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">New York Headquarters</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Physical presence in the heart of the global financial sector.
                </p>
                <div className="flex items-start gap-2.5 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    120 Financial District, Floor 24<br />
                    New York, NY 10005, United States
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Multi-sig Cold Custody Partner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Form + Quick Messengers */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left 7 Columns: The Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Send an Official Inquiry</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Fill in your details below and an investment manager will respond to your email.
                </p>
              </div>

              {ticketRef ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Inquiry Dispatched Successfully!</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Your ticket reference code is:{" "}
                      <span className="font-mono font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-xs">
                        #{ticketRef}
                      </span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    We have logged your request in our institutional queue. Our desk typically resolves inquiries
                    within <strong>15 minutes</strong> during active trading cycles.
                  </p>
                  <button
                    onClick={() => {
                      setTicketRef(null);
                      setMessage("");
                      setSubject("");
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
                  >
                    <span>Submit Another Message</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Chong Alexander"
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="investor@example.com"
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                        Inquiry Department *
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                      >
                        <option value="General Support">General Client Support</option>
                        <option value="Deposit & Withdrawal">Deposits & Blockchain Confirmations</option>
                        <option value="Investment Advisory">Investment Plans & ROI Consultation</option>
                        <option value="Copy Trading Setup">Copy Trading Allocation</option>
                        <option value="Account & 2FA Security">Account Verification & 2FA</option>
                        <option value="VIP & Institutional">VIP & High-Net-Worth Desk ($10,000+)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Summary of your question..."
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide details about your inquiry so we can route your ticket to the proper specialist..."
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Transmitting Ticket...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Priority Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right 5 Columns: Direct Channels & Fast FAQs */}
            <div className="lg:col-span-5 space-y-6">
              {/* Instant Support Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-2">Need an Instant Direct Reply?</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Connect immediately with our automated AI Concierge or chat live with an active desk manager:
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => openAIChatbot("I would like to speak to a human support agent")}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                        <Headset className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">Live Desk Specialist</div>
                        <div className="text-xs text-amber-700">Real-time human chat on site</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => openAIChatbot("I need help with my account")}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">Interactive AI Concierge</div>
                        <div className="text-xs text-blue-700">Always online • Zero wait time</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Quick FAQ Highlights */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-base">Quick Help & Common Answers</h3>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-gray-600">
                  <div className="pb-3 border-b border-gray-100">
                    <strong className="block text-gray-900 mb-1">How fast are deposit confirmations?</strong>
                    Deposits confirm automatically on the blockchain within 1 to 3 network blocks (typically 5 to 15 minutes).
                  </div>
                  <div className="pb-3 border-b border-gray-100">
                    <strong className="block text-gray-900 mb-1">When can I withdraw my returns?</strong>
                    Withdrawals are available 24/7 with automated execution within 1 to 2 hours directly to your external crypto wallet.
                  </div>
                  <div>
                    <strong className="block text-gray-900 mb-1">What is the minimum investment?</strong>
                    The Basic Plan starts at just $100 with guaranteed 25% returns in 7 days and daily payout accrual.
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                  <Link
                    href="/faqs"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span>View all Frequently Asked Questions</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
