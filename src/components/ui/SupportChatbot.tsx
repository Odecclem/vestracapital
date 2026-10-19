"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Bot,
  Send,
  X,
  Minimize2,
  Headset,
  Sparkles,
  ExternalLink,
  FileText,
  User,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
} from "firebase/firestore";

interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "admin";
  senderName?: string;
  text: string;
  timestamp: string;
  action?: {
    label: string;
    href?: string;
    onAction?: () => void;
  };
}

const INITIAL_PROMPTS = [
  { label: "📊 Investment Plans & ROI", query: "Tell me about the investment plans and returns" },
  { label: "💳 How to Deposit Crypto", query: "How do I deposit funds into my account?" },
  { label: "💸 Withdrawal Limits & Speed", query: "How long do withdrawals take and are there fees?" },
  { label: "📈 How Copy Trading Works", query: "How does copy trading work at Vestra Capital?" },
  { label: "🛡️ Fund Security & Cold Storage", query: "How safe is my money with Vestra Capital?" },
  { label: "🧑‍💼 Speak to a Human Manager", query: "I would like to speak to a human support agent" },
];

export default function SupportChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "ticket">("chat");
  const [showTeaser, setShowTeaser] = useState(true);

  // Persistent Session & Mode
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionMode, setSessionMode] = useState<"ai" | "human_takeover">("ai");

  // Chat State
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "👋 Welcome to Vestra Capital! I am your 24/7 AI Investment Concierge. How can I assist you with your portfolio, deposits, or trading today?",
      timestamp: "Just now",
    },
  ]);

  // Ticket Form State
  const [ticketName, setTicketName] = useState(user?.displayName || "");
  const [ticketEmail, setTicketEmail] = useState(user?.email || "");
  const [ticketCategory, setTicketCategory] = useState("Deposit / Withdrawal");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccessId, setTicketSuccessId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Persistent Session ID in localStorage
  useEffect(() => {
    let sid = "";
    try {
      sid = localStorage.getItem("vestra_chat_session_id") || "";
      if (!sid) {
        sid = "sess_" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem("vestra_chat_session_id", sid);
      }
    } catch (_) {
      sid = "sess_" + Math.random().toString(36).substring(2, 10);
    }
    setSessionId(sid);
  }, []);

  // 2. Real-Time Firestore Subscription (Session Mode + Messages)
  useEffect(() => {
    if (!sessionId) return;

    // A. Listen to session mode changes (whether admin has taken over)
    const unsubSession = onSnapshot(doc(db, "chat_sessions", sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.mode) setSessionMode(data.mode);
      }
    });

    // B. Listen to real-time chat messages
    const q = query(
      collection(db, "chat_sessions", sessionId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubMessages = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list: ChatMessage[] = snapshot.docs.map((d) => {
          const data = d.data();
          let time = "Just now";
          if (data.createdAt?.toDate) {
            time = data.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          }
          return {
            id: d.id,
            sender: data.sender || "bot",
            senderName: data.senderName,
            text: data.text || "",
            timestamp: time,
            action: data.action,
          };
        });
        setMessages(list);
      }
    });

    return () => {
      unsubSession();
      unsubMessages();
    };
  }, [sessionId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isMinimized, activeTab]);

  // Sync user info if available
  useEffect(() => {
    if (user?.displayName && !ticketName) setTicketName(user.displayName);
    if (user?.email && !ticketEmail) setTicketEmail(user.email);
  }, [user, ticketName, ticketEmail]);

  // Listen for global custom events to open chat from any page/button
  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
      setShowTeaser(false);
      if (customEvent.detail?.prompt) {
        handleUserSend(customEvent.detail.prompt);
      }
    };

    window.addEventListener("open-vestra-chat", handleOpenChat);
    return () => window.removeEventListener("open-vestra-chat", handleOpenChat);
  }, [sessionId, sessionMode]);

  const getBotResponse = (query: string): { text: string; action?: { label: string; href?: string; onAction?: () => void } } => {
    const lower = query.toLowerCase();

    // 1. Investment Plans / ROI
    if (
      lower.includes("plan") ||
      lower.includes("roi") ||
      lower.includes("return") ||
      lower.includes("profit") ||
      lower.includes("tier") ||
      lower.includes("invest")
    ) {
      return {
        text: `Vestra Capital provides **4 Institutional Investment Tiers** designed for automated capital growth:\n\n` +
          `• **Basic Plan**: $100 – $499 | **25% ROI** in 7 days (Daily payout: ~3.57%)\n` +
          `• **Standard Plan**: $500 – $999 | **45% ROI** in 10 days (Daily payout: ~4.50%)\n` +
          `• **Pro Plan**: $1,000 – $4,999 | **75% ROI** in 14 days (Daily payout: ~5.35%)\n` +
          `• **VIP Institutional**: $5,000+ | **100% ROI** in 21 days (Daily payout: ~4.76%)\n\n` +
          `✅ Capital Principal is returned 100% at maturity with real-time dynamic accrual on your dashboard.`,
        action: {
          label: "Explore Investment Plans",
          href: user ? "/dashboard/invest" : "/#plans",
        },
      };
    }

    // 2. Deposits / Funding
    if (
      lower.includes("deposit") ||
      lower.includes("fund") ||
      lower.includes("btc") ||
      lower.includes("eth") ||
      lower.includes("usdt") ||
      lower.includes("crypto") ||
      lower.includes("sol")
    ) {
      return {
        text: `Funding your account is instant and secure:\n\n` +
          `1. Go to **Dashboard > Deposit**.\n` +
          `2. Choose your preferred digital asset: **Bitcoin (BTC)**, **Ethereum (ETH)**, **Tether (USDT TRC-20 / ERC-20)**, or **Solana (SOL)**.\n` +
          `3. Copy the official custody address or scan the QR code.\n` +
          `4. Send the transaction from your wallet and upload your Transaction Hash (TXID).\n\n` +
          `⚡ Deposits automatically confirm within 1–3 blockchain block confirmations.`,
        action: {
          label: user ? "Go to Deposit Page" : "Login to Deposit",
          href: user ? "/dashboard/deposit" : "/login",
        },
      };
    }

    // 3. Withdrawals
    if (
      lower.includes("withdraw") ||
      lower.includes("payout") ||
      lower.includes("cash out") ||
      lower.includes("fee")
    ) {
      return {
        text: `Withdrawal requests are processed with institutional priority:\n\n` +
          `• **Availability**: 24/7/365 from your Dashboard.\n` +
          `• **Processing Time**: Instant to 1–2 hours following blockchain validation.\n` +
          `• **Fees**: Zero hidden withdrawal fees.\n` +
          `• **Security**: Automated multi-sig protection and optional 2FA check before payout.\n\n` +
          `To request a payout, navigate to **Withdraw**, enter your destination address, and confirm.`,
        action: {
          label: user ? "Request a Withdrawal" : "Sign In to Withdraw",
          href: user ? "/dashboard/withdraw" : "/login",
        },
      };
    }

    // 4. Copy Trading
    if (
      lower.includes("copy") ||
      lower.includes("trader") ||
      lower.includes("win rate") ||
      lower.includes("strategy")
    ) {
      return {
        text: `**Vestra Capital Copy Trading** allows you to automatically mirror verified institutional cryptocurrency traders:\n\n` +
          `• **Win Rates**: All master traders maintain a verified 85%+ win rate.\n` +
          `• **Execution**: Trades replicate in milliseconds with zero slippage.\n` +
          `• **Total Control**: You can pause, allocate, or adjust trade sizing at any time without locking funds.\n` +
          `• **Performance Fee**: 0% management fee for your first 30 days.`,
        action: {
          label: user ? "Open Copy Trading Hub" : "Get Started Now",
          href: user ? "/dashboard/copy-trading" : "/register",
        },
      };
    }

    // 5. Security & Safety
    if (
      lower.includes("safe") ||
      lower.includes("security") ||
      lower.includes("legit") ||
      lower.includes("cold storage") ||
      lower.includes("hack") ||
      lower.includes("scam") ||
      lower.includes("license")
    ) {
      return {
        text: `Institutional fund protection is our highest priority:\n\n` +
          `🛡️ **Cold Storage**: 95%+ of all digital assets are held in segregated, offline multi-signature vaults.\n` +
          `🔒 **Encryption**: Tier-4 data centers with 256-bit SSL encryption and mandatory 2FA protocols.\n` +
          `📊 **Automated Risk Hedging**: Proprietary algorithmic hedging buffers your capital against extreme market dips.`,
        action: {
          label: "View Security Framework",
          href: "/#about",
        },
      };
    }

    // 6. Referral Program
    if (
      lower.includes("referral") ||
      lower.includes("affiliate") ||
      lower.includes("commission") ||
      lower.includes("invite")
    ) {
      return {
        text: `**Vestra Partner Program**:\n\n` +
          `Earn **8% direct referral commission** on every deposit made by individuals you invite.\n` +
          `• Commissions are credited instantly to your available balance.\n` +
          `• Grab your personalized invite link directly inside your **Dashboard > Referrals** section.`,
        action: {
          label: user ? "View My Referral Link" : "Register to Earn",
          href: user ? "/dashboard/referrals" : "/register",
        },
      };
    }

    // 7. Human Agent / Support Contact / Escalation
    if (
      lower.includes("human") ||
      lower.includes("agent") ||
      lower.includes("manager") ||
      lower.includes("phone") ||
      lower.includes("email") ||
      lower.includes("contact") ||
      lower.includes("ticket") ||
      lower.includes("help")
    ) {
      return {
        text: `Our Live Institutional Support Desk is active right now!\n\n` +
          `• A desk manager can reply to you directly in this chat room.\n` +
          `• You can also switch to the **Leave Ticket / Agent** tab or reach us directly at:\n\n` +
          `✉️ **Official Support**: support@vestracapital.online\n` +
          `📞 **VIP Client Desk**: +1 (212) 555-0198`,
        action: {
          label: "Submit Priority Ticket",
          onAction: () => setActiveTab("ticket"),
        },
      };
    }

    // 8. Greetings
    if (
      lower.includes("hello") ||
      lower.includes("hi") ||
      lower.includes("hey") ||
      lower.includes("good morning") ||
      lower.includes("good evening")
    ) {
      return {
        text: `Hello! I'm here to ensure you get immediate answers about our investment plans, crypto funding, withdrawals, and account management. How can I help you today?`,
      };
    }

    // Default Fallback
    return {
      text: `Thank you for reaching out! I want to make sure you get exact information.\n\n` +
        `You can ask me about:\n` +
        `• **Investment Plans & Daily Yields**\n` +
        `• **Crypto Deposit Guides (BTC/ETH/USDT/SOL)**\n` +
        `• **Withdrawal Speeds & Policy**\n` +
        `• **Copy Trading Automation**\n\n` +
        `Our support desk also monitors this chat live and can step in to assist you directly.`,
      action: {
        label: "Leave a Ticket for Support",
        onAction: () => setActiveTab("ticket"),
      },
    };
  };

  const handleUserSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    setInputMessage("");
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Optimistic local addition (if offline or delayed)
    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Sync with Firestore Session so Admin sees it in real-time
    if (sessionId) {
      try {
        await setDoc(
          doc(db, "chat_sessions", sessionId),
          {
            id: sessionId,
            userId: user?.uid || "guest",
            userName: user?.displayName || "Guest Visitor",
            userEmail: user?.email || "",
            lastMessage: text,
            lastSender: "user",
            updatedAt: serverTimestamp(),
            unreadAdminCount: increment(1),
            status: "active",
          },
          { merge: true }
        );

        await addDoc(collection(db, "chat_sessions", sessionId, "messages"), {
          sender: "user",
          senderName: user?.displayName || "Visitor",
          text,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Firestore message dispatch fallback:", err);
      }
    }

    // 3. If in AI mode (human has not taken over), trigger intelligent AI response
    if (sessionMode !== "human_takeover") {
      setIsTyping(true);

      setTimeout(async () => {
        const response = getBotResponse(text);
        const botMsg: ChatMessage = {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          action: response.action,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);

        // Also save AI message to Firestore
        if (sessionId) {
          try {
            await addDoc(collection(db, "chat_sessions", sessionId, "messages"), {
              sender: "bot",
              senderName: "Vestra AI Concierge",
              text: response.text,
              createdAt: serverTimestamp(),
              action: response.action ? { label: response.action.label, href: response.action.href } : null,
            });

            await updateDoc(doc(db, "chat_sessions", sessionId), {
              lastMessage: response.text,
              lastSender: "bot",
              updatedAt: serverTimestamp(),
            });
          } catch (_) {}
        }
      }, 600);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmail || !ticketMessage) return;

    setTicketSubmitting(true);
    const refCode = `VST-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      await addDoc(collection(db, "support_tickets"), {
        ticketId: refCode,
        userId: user?.uid || "guest",
        name: ticketName || "Valued Client",
        email: ticketEmail,
        category: ticketCategory,
        subject: ticketSubject || `${ticketCategory} Inquiry`,
        message: ticketMessage,
        priority: "High",
        status: "open",
        createdAt: serverTimestamp(),
      });
      setTicketSuccessId(refCode);
    } catch (err) {
      console.warn("Firestore support_tickets write fallback:", err);
      setTicketSuccessId(refCode);
    } finally {
      setTicketSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-[99] flex flex-col items-end">
        {/* Floating Greeting Teaser Bubble */}
        <AnimatePresence>
          {!isOpen && showTeaser && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-3 mr-1 bg-white border border-gray-200 shadow-xl rounded-2xl p-3.5 max-w-xs flex items-start gap-3 relative cursor-pointer hover:border-blue-300 transition-all"
              onClick={() => {
                setIsOpen(true);
                setShowTeaser(false);
              }}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shrink-0 border border-amber-400/30 bg-[#0B132B] p-0.5">
                <img src="/logo-icon.png" alt="Vestra Capital" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-bold text-gray-900">Vestra AI Concierge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  Have questions about investing or withdrawals? Let us help you instantly!
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
            setShowTeaser(false);
          }}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-[0_10px_25px_-5px_rgba(29,78,216,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(29,78,216,0.6)] focus:outline-none transition-shadow"
          aria-label="Open Live Chat"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6" />
              {/* Online Pulse Badge */}
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "64px" : "min(640px, 86vh)",
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-22 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[99] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0a0a0a] via-[#111827] to-[#1e293b] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-400/40 shadow-sm shrink-0 bg-[#0B132B] p-0.5">
                    <img src="/logo-icon.png" alt="Vestra Capital" className="w-full h-full object-contain" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0a0a]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight text-white">Vestra Support Desk</h3>
                    {sessionMode === "human_takeover" ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Agent
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                        AI Concierge
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    <span>
                      {sessionMode === "human_takeover"
                        ? "Specialist connected to chat"
                        : "Instant AI answers • Real desk monitoring"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-400">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:text-white rounded hover:bg-gray-800 transition-colors"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:text-white rounded hover:bg-gray-800 transition-colors"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* If minimized, hide body */}
            {!isMinimized && (
              <>
                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/70 p-1 text-xs font-semibold text-gray-600 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab("chat");
                      setTicketSuccessId(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "chat"
                        ? "bg-white text-blue-700 shadow-sm font-bold"
                        : "hover:text-gray-900"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Live Chat Support</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("ticket")}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === "ticket"
                        ? "bg-white text-blue-700 shadow-sm font-bold"
                        : "hover:text-gray-900"
                    }`}
                  >
                    <Headset className="h-3.5 w-3.5" />
                    <span>Leave Ticket / Agent</span>
                  </button>
                </div>

                {/* Tab Content: Live Chat */}
                {activeTab === "chat" && (
                  <div className="flex-1 flex flex-col min-h-0 bg-[#fafafa]">
                    {/* Live Agent Banner when admin takes over */}
                    {sessionMode === "human_takeover" && (
                      <div className="bg-emerald-50 border-b border-emerald-100 px-3.5 py-1.5 text-[11px] text-emerald-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>A senior support manager is chatting with you live.</span>
                        </div>
                      </div>
                    )}

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.sender === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          {/* Sender Label for Admin messages */}
                          {msg.sender === "admin" && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold mb-1 px-1">
                              <ShieldCheck className="h-3 w-3 text-amber-600" />
                              <span>{msg.senderName || "Support Desk Specialist"}</span>
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-br-none"
                                : msg.sender === "admin"
                                ? "bg-gradient-to-r from-[#0B132B] to-[#1C2541] border border-amber-400/40 text-amber-50 rounded-bl-none shadow-md"
                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <div className="whitespace-pre-line font-normal">{msg.text}</div>

                            {/* Action Button inside bot response */}
                            {msg.action && (
                              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end">
                                {msg.action.href ? (
                                  <Link
                                    href={msg.action.href}
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                                  >
                                    <span>{msg.action.label}</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </Link>
                                ) : (
                                  <button
                                    onClick={msg.action.onAction}
                                    className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                                  >
                                    <span>{msg.action.label}</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {msg.timestamp}
                          </span>
                        </div>
                      ))}

                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-3.5 py-2 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                          </div>
                          <span className="text-[11px] text-gray-400 italic">Vestra Concierge is typing...</span>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
                      {INITIAL_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleUserSend(prompt.query)}
                          className="shrink-0 text-[11px] bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-full px-2.5 py-1 transition-all flex items-center gap-1"
                        >
                          {prompt.label}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUserSend();
                      }}
                      className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message to support..."
                        className="flex-1 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none transition-all placeholder:text-gray-400"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isTyping}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2 rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}

                {/* Tab Content: Submit Ticket / Speak to Human */}
                {activeTab === "ticket" && (
                  <div className="flex-1 overflow-y-auto p-4 bg-white text-xs">
                    {ticketSuccessId ? (
                      <div className="text-center py-8 px-2 space-y-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-gray-900">Support Ticket Created!</h4>
                          <p className="text-gray-500 text-xs mt-1">
                            Your reference code is{" "}
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              #{ticketSuccessId}
                            </span>
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-left space-y-1 text-gray-600 text-[11px]">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                            <Clock className="h-3.5 w-3.5 text-blue-600" />
                            <span>Estimated Response Time: &lt; 15 minutes</span>
                          </div>
                          <p>
                            A senior portfolio specialist has been notified and will email you directly at{" "}
                            <strong className="text-gray-800">{ticketEmail}</strong>.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setTicketSuccessId(null);
                            setActiveTab("chat");
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all"
                        >
                          Return to Live Chat
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleTicketSubmit} className="space-y-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-blue-900 text-[11px] flex items-start gap-2.5">
                          <Headset className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Direct VIP & Institutional Escalation</span>
                            Leave a direct message with our desk. Average reply time is under 15 minutes.
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Your Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={ticketName}
                            onChange={(e) => setTicketName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Your Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={ticketEmail}
                            onChange={(e) => setTicketEmail(e.target.value)}
                            placeholder="investor@example.com"
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Inquiry Category
                          </label>
                          <select
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          >
                            <option value="Deposit / Withdrawal">Deposit & Withdrawal Assistance</option>
                            <option value="Investment Plans">Investment Plans & Daily ROI</option>
                            <option value="Copy Trading">Copy Trading Setup</option>
                            <option value="KYC / Account Verification">Account Verification / KYC</option>
                            <option value="Institutional Consultation">Institutional & High-Net-Worth Desk</option>
                            <option value="Other">Other Inquiry</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                            Message / Request
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                            placeholder="Please explain how we can assist you..."
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs focus:outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={ticketSubmitting}
                          className="w-full bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
                        >
                          {ticketSubmitting ? (
                            <span>Submitting Ticket...</span>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              <span>Dispatch to Senior Support Desk</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Direct Social Messengers */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium text-center mb-2">
                        Need instant personal messaging?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="https://wa.me/12125550198"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp Desk</span>
                        </a>
                        <a
                          href="mailto:support@vestracapital.online"
                          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors"
                        >
                          <Headset className="h-3.5 w-3.5" />
                          <span>Email Support</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
