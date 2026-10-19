"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  User,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Check,
  Headset,
  Mail,
  ChevronRight,
  RefreshCw,
  Trash2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";

interface ChatSession {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  lastMessage?: string;
  lastSender?: "user" | "bot" | "admin";
  updatedAt?: any;
  status?: "active" | "closed";
  mode?: "ai" | "human_takeover";
  unreadAdminCount?: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "admin";
  senderName?: string;
  text: string;
  createdAt?: any;
}

interface SupportTicket {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt?: any;
}

interface ContactMessage {
  id: string;
  referenceId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  subject?: string;
  message: string;
  status: string;
  createdAt?: any;
}

const CANNED_RESPONSES = [
  "Hello! I am a senior representative from the Vestra Capital Investment Desk. How may I assist you today?",
  "Thank you for reaching out. Your deposit is currently being verified on the blockchain and will reflect shortly.",
  "Your withdrawal request has been received and is being processed by our vault custody team.",
  "Our Pro Plan (75% ROI) and VIP Institutional (100% ROI) feature automatic daily accrual with 100% principal return at maturity.",
  "Please provide your transaction hash (TXID) so I can verify your transfer directly on the network.",
  "For your security, Vestra Capital will never ask for your private keys, wallet seed phrase, or account password.",
];

export default function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState<"live_chat" | "tickets" | "contact_forms">("live_chat");

  // Live Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Tickets & Contact Messages
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to Live Chat Sessions
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "chat_sessions"),
      (snapshot) => {
        const list: ChatSession[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ChatSession[];

        // In-memory sort by updatedAt descending
        list.sort((a, b) => {
          const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
          const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
          return tB - tA;
        });

        setSessions(list);

        // Auto-select first session if none selected or if previously selected is missing
        setSelectedSessionId((prev) => {
          if (!prev && list.length > 0) return list[0].id;
          if (prev && !list.some((s) => s.id === prev) && list.length > 0) return list[0].id;
          return prev;
        });
      },
      (error) => {
        console.warn("Live chat sessions listener fallback:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Messages of Selected Session
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "chat_sessions", selectedSessionId, "messages"),
      (snapshot) => {
        const list: ChatMessage[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ChatMessage[];

        // In-memory sort by createdAt ascending
        list.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return tA - tB;
        });

        setMessages(list);

        // Mark as read by admin
        try {
          updateDoc(doc(db, "chat_sessions", selectedSessionId), {
            unreadAdminCount: 0,
          });
        } catch (_) {}
      },
      (error) => {
        console.warn("Messages listener fallback:", error);
      }
    );

    return () => unsubscribe();
  }, [selectedSessionId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Real-Time Tickets and Contact Inquiries
  useEffect(() => {
    setLoadingExtras(true);

    const unsubTickets = onSnapshot(
      collection(db, "support_tickets"),
      (snap) => {
        const tList = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SupportTicket[];
        tList.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return tB - tA;
        });
        setTickets(tList);
        setLoadingExtras(false);
      },
      (err) => {
        console.warn("Tickets listener fallback:", err);
        setLoadingExtras(false);
      }
    );

    const unsubContact = onSnapshot(
      collection(db, "contact_messages"),
      (snap) => {
        const cList = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ContactMessage[];
        cList.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return tB - tA;
        });
        setContactMessages(cList);
      },
      (err) => {
        console.warn("Contact messages listener fallback:", err);
      }
    );

    return () => {
      unsubTickets();
      unsubContact();
    };
  }, []);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Send Admin Reply
  const handleSendAdminReply = async (textToSend?: string) => {
    const text = (textToSend || adminReply).trim();
    if (!text || !selectedSessionId) return;

    setSendingReply(true);
    try {
      // 1. Add message to subcollection
      await addDoc(collection(db, "chat_sessions", selectedSessionId, "messages"), {
        sender: "admin",
        senderName: "Support Desk Manager",
        text,
        createdAt: serverTimestamp(),
      });

      // 2. Update session
      await updateDoc(doc(db, "chat_sessions", selectedSessionId), {
        lastMessage: text,
        lastSender: "admin",
        updatedAt: serverTimestamp(),
        mode: "human_takeover", // Auto-switch to human takeover when admin speaks!
      });

      setAdminReply("");
    } catch (err) {
      console.error("Failed to send admin reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  // Toggle AI Mode for active session
  const toggleAIMode = async () => {
    if (!selectedSessionId || !selectedSession) return;
    const newMode = selectedSession.mode === "human_takeover" ? "ai" : "human_takeover";
    try {
      await updateDoc(doc(db, "chat_sessions", selectedSessionId), {
        mode: newMode,
      });
    } catch (err) {
      console.error("Failed to toggle AI mode:", err);
    }
  };

  // Close / Resolve Session
  const handleCloseSession = async () => {
    if (!selectedSessionId) return;
    try {
      await updateDoc(doc(db, "chat_sessions", selectedSessionId), {
        status: "closed",
      });
    } catch (err) {
      console.error("Failed to close session:", err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const term = searchFilter.toLowerCase();
    const name = (s.userName || "").toLowerCase();
    const email = (s.userEmail || "").toLowerCase();
    const msg = (s.lastMessage || "").toLowerCase();
    return name.includes(term) || email.includes(term) || msg.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Live Support & Client Desk</h1>
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Console
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Chat live with website visitors and investors in real-time, or manage support tickets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600 shrink-0">
          <button
            onClick={() => setActiveTab("live_chat")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "live_chat" ? "bg-white text-blue-700 shadow-xs font-bold" : "hover:text-gray-900"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Live Chats ({sessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "tickets" ? "bg-white text-blue-700 shadow-xs font-bold" : "hover:text-gray-900"
            }`}
          >
            <Headset className="h-4 w-4" />
            <span>Tickets ({tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("contact_forms")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "contact_forms" ? "bg-white text-blue-700 shadow-xs font-bold" : "hover:text-gray-900"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Contact Forms ({contactMessages.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Live Chat Console */}
      {activeTab === "live_chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
          {/* Left Column: Sessions List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden">
            {/* Search Filter */}
            <div className="p-3.5 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search visitors, emails, chats..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => {
                  const isSelected = session.id === selectedSessionId;
                  const hasUnread = (session.unreadAdminCount || 0) > 0;

                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                        isSelected
                          ? "bg-blue-50/70 border-l-4 border-blue-600"
                          : "hover:bg-gray-50/80 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {session.userName ? session.userName.charAt(0).toUpperCase() : "G"}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {session.userName || "Guest Visitor"}
                          </h4>
                          {hasUnread && (
                            <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                              New
                            </span>
                          )}
                        </div>

                        {session.userEmail && (
                          <p className="text-[11px] text-gray-400 truncate mb-1">
                            {session.userEmail}
                          </p>
                        )}

                        <p className="text-xs text-gray-600 truncate">
                          {session.lastSender === "admin" && (
                            <span className="font-semibold text-blue-600">You: </span>
                          )}
                          {session.lastSender === "bot" && (
                            <span className="font-semibold text-purple-600">AI: </span>
                          )}
                          {session.lastMessage || "Started conversation"}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                          {session.mode === "human_takeover" ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              You are handling
                            </span>
                          ) : (
                            <span className="text-blue-600 font-semibold flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Auto-Pilot
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4 text-gray-400 text-xs">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No active live chat sessions yet.</p>
                  <p className="text-[11px] mt-1 text-gray-400">
                    When visitors open the chat widget on the website, they will appear here live!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Chat Room (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden">
            {selectedSession ? (
              <>
                {/* Active Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {selectedSession.userName ? selectedSession.userName.charAt(0).toUpperCase() : "G"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          {selectedSession.userName || "Guest Visitor"}
                        </h3>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          Connected
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {selectedSession.userEmail || "Anonymous guest visitor browsing site"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle AI mode */}
                    <button
                      onClick={toggleAIMode}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        selectedSession.mode === "human_takeover"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-800 border-blue-200"
                      }`}
                      title="Toggle AI assistance"
                    >
                      {selectedSession.mode === "human_takeover" ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-amber-600" />
                          <span>AI Muted (You are in control)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                          <span>AI Active (Auto-answering)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCloseSession}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Close Session
                    </button>
                  </div>
                </div>

                {/* Message Feed */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fcfcfc]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "admin"
                          ? "items-end"
                          : msg.sender === "bot"
                          ? "items-start"
                          : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
                        {msg.sender === "admin" && (
                          <span className="font-bold text-blue-700 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                            <span>You (Desk Support)</span>
                          </span>
                        )}
                        {msg.sender === "bot" && (
                          <span className="font-bold text-purple-700 flex items-center gap-1">
                            <Bot className="h-3.5 w-3.5 text-purple-600" />
                            <span>Vestra AI Concierge</span>
                          </span>
                        )}
                        {msg.sender === "user" && (
                          <span className="font-bold text-gray-800 flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-gray-600" />
                            <span>{selectedSession.userName || "Customer"}</span>
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs whitespace-pre-line ${
                          msg.sender === "admin"
                            ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-br-none"
                            : msg.sender === "bot"
                            ? "bg-purple-50/70 border border-purple-200 text-purple-950 rounded-bl-none"
                            : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Canned Quick Replies */}
                <div className="px-4 py-2 bg-gray-50/70 border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                    Quick Replies:
                  </span>
                  {CANNED_RESPONSES.slice(0, 3).map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendAdminReply(reply)}
                      className="text-[11px] bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 rounded-lg px-2.5 py-1 transition-all shrink-0 truncate max-w-[200px]"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Reply Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAdminReply();
                  }}
                  className="p-4 bg-white border-t border-gray-200 flex items-center gap-3 shrink-0"
                >
                  <input
                    type="text"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder={`Reply to ${selectedSession.userName || "customer"} in real-time...`}
                    className="flex-1 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!adminReply.trim() || sendingReply}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-bold text-gray-800">Select a Conversation</h3>
                <p className="text-xs max-w-sm mt-1">
                  Choose a visitor from the left pane to view their chat history and reply in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Support Tickets */}
      {activeTab === "tickets" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">In-App Support Tickets</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tickets filed by users from the "Leave a Ticket / Speak to Agent" tab in the chat widget.
              </p>
            </div>
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              {tickets.length} Total Tickets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-6">Ref Code</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Subject & Message</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.length > 0 ? (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-700">
                        #{t.ticketId || t.id.slice(0, 6)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{t.name || "Client"}</div>
                        <div className="text-gray-500 text-[11px]">{t.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                          {t.category || "General"}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-semibold text-gray-900 truncate">{t.subject}</div>
                        <div className="text-gray-500 line-clamp-2 text-[11px] mt-0.5">{t.message}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          {t.priority || "High"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {t.status || "open"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={`mailto:${t.email}?subject=Re: [Vestra Capital Ticket #${t.ticketId}] ${t.subject}`}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Reply via Email</span>
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No support tickets submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Contact Form Inquiries */}
      {activeTab === "contact_forms" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Website Contact Inquiries</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Inquiries submitted directly through the public <code className="text-blue-600">/contact</code> page.
              </p>
            </div>
            <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
              {contactMessages.length} Messages
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-6">Reference</th>
                  <th className="py-3.5 px-6">Sender Details</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Message</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contactMessages.length > 0 ? (
                  contactMessages.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-purple-700">
                        #{m.referenceId || m.id.slice(0, 6)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{m.fullName}</div>
                        <div className="text-gray-500 text-[11px]">{m.email}</div>
                        {m.phone && <div className="text-gray-400 text-[10px]">{m.phone}</div>}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {m.department}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-sm">
                        {m.subject && <div className="font-semibold text-gray-900">{m.subject}</div>}
                        <div className="text-gray-600 text-[11px] line-clamp-3 mt-0.5">{m.message}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={`mailto:${m.email}?subject=Vestra Capital Consultation: ${m.subject || m.department}`}
                          className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          <span>Reply to Client</span>
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No contact inquiries received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
