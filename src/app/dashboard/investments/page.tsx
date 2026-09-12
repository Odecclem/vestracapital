"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { TrendingUp, Loader2 } from "lucide-react";

interface Investment {
  id: string;
  planName: string;
  principal: number;
  expectedROI: number;
  roiPercentage: number;
  status: "active" | "completed";
  startDate: { seconds: number } | null;
  endDate: { seconds: number } | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (timestamp: { seconds: number } | null) => {
  if (!timestamp) return "—";
  return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getProgressPercent = (start: { seconds: number } | null, end: { seconds: number } | null) => {
  if (!start || !end) return 0;
  const now = Date.now() / 1000;
  const total = end.seconds - start.seconds;
  const elapsed = now - start.seconds;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchInvestments = async () => {
      try {
        const q = query(
          collection(db, "investments"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const list: Investment[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Investment[];
        
        list.sort((a, b) => {
          const timeA = a.startDate?.seconds || 0;
          const timeB = b.startDate?.seconds || 0;
          return timeB - timeA;
        });
        
        setInvestments(list);
      } catch (error) {
        console.error("Error fetching investments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d4ed8]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#1d4ed8]" />
          My Investments
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Track all of your investment plans and their progress.
        </p>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-16 text-center">
          <TrendingUp className="h-12 w-12 text-[#e5e7eb] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">
            No investments yet
          </h3>
          <p className="text-sm text-[#6b7280] mb-6">
            When you invest in a plan, it will appear here.
          </p>
          <a href="/dashboard/invest" className="inline-flex items-center justify-center rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white hover:bg-[#3b82f6] transition-colors">
            Start Investing
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {investments.map((inv) => {
            const progress = getProgressPercent(inv.startDate, inv.endDate);
            const isCompleted = inv.status === "completed";

            return (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#0a0a0a]">
                    {inv.planName}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                      isCompleted
                        ? "bg-gray-50 text-gray-600 border-gray-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-y-3 text-sm mb-5">
                  <div>
                    <span className="text-[#6b7280]">Principal</span>
                    <p className="font-semibold text-[#0a0a0a]">{formatCurrency(inv.principal)}</p>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">Expected ROI</span>
                    <p className="font-semibold text-[#0a0a0a]">{formatCurrency(inv.expectedROI)}</p>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">ROI Rate</span>
                    <p className="font-semibold text-[#1d4ed8]">{inv.roiPercentage}%</p>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">Duration</span>
                    <p className="font-semibold text-[#0a0a0a]">
                      {formatDate(inv.startDate)} — {formatDate(inv.endDate)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-[#6b7280] mb-1.5">
                    <span>Progress</span>
                    <span>{isCompleted ? 100 : progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-green-500" : "bg-[#1d4ed8]"
                      }`}
                      style={{ width: `${isCompleted ? 100 : progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
