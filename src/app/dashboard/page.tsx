"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import {
  DollarSign,
  BarChart3,
  TrendingUp,
  Layers,
  Loader2,
} from "lucide-react";

interface UserData {
  walletBalance: number;
  totalInvested: number;
  totalProfit: number;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  createdAt: { seconds: number } | null;
}

interface Investment {
  id: string;
  planName: string;
  principal: number;
  expectedROI: number;
  roiPercentage: number;
  status: "active" | "completed";
  startDate: { seconds: number } | null;
  endDate: { seconds: number } | null;
  progress: number;
}

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return styles[status] || styles.pending;
};

const formatDate = (timestamp: { seconds: number } | null) => {
  if (!timestamp) return "—";
  return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function DashboardOverview() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [activePlansCount, setActivePlansCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const now = Date.now() / 1000;
      try {
        // Fetch user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            walletBalance: data.walletBalance || 0,
            totalInvested: data.totalInvested || 0,
            totalProfit: data.totalProfit || 0,
          });
        }

        // Fetch recent transactions
        const txQuery = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const txSnapshot = await getDocs(txQuery);
        const txList: Transaction[] = txSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Transaction[];
        setTransactions(txList);

        // Fetch active investments
        const invQuery = query(
          collection(db, "investments"),
          where("userId", "==", user.uid),
          where("status", "==", "active")
        );
        const invSnapshot = await getDocs(invQuery);
        const invList = invSnapshot.docs.map((d) => {
          const data = d.data();
          const start = data.startDate as { seconds: number } | null;
          const end = data.endDate as { seconds: number } | null;
          let progress = 0;
          if (start && end) {
            const total = end.seconds - start.seconds;
            const elapsed = now - start.seconds;
            progress = total <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
          }
          return { id: d.id, ...data, progress } as Investment;
        });
        setInvestments(invList);
        setActivePlansCount(invList.length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d4ed8]" />
      </div>
    );
  }

  const stats = [
    {
      label: "Available Balance",
      value: formatCurrency(userData?.walletBalance ?? 0),
      icon: DollarSign,
    },
    {
      label: "Total Invested",
      value: formatCurrency(userData?.totalInvested ?? 0),
      icon: BarChart3,
    },
    {
      label: "Total Profit",
      value: formatCurrency(userData?.totalProfit ?? 0),
      icon: TrendingUp,
    },
    {
      label: "Active Plans",
      value: activePlansCount.toString(),
      icon: Layers,
    },
  ];



  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0a0a0a]">
          Welcome back, {user?.displayName?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Here&apos;s an overview of your portfolio.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-lg bg-[#eff6ff] flex items-center justify-center shrink-0">
              <stat.icon className="h-5 w-5 text-[#1d4ed8]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#6b7280]">{stat.label}</p>
              <p className="text-xl font-bold text-[#0a0a0a] mt-0.5 truncate">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-base font-semibold text-[#0a0a0a]">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#6b7280] text-sm">
              No transactions yet. Make your first deposit to get started.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-left">
                  <th className="px-6 py-3 font-medium text-[#6b7280]">Type</th>
                  <th className="px-6 py-3 font-medium text-[#6b7280]">Amount</th>
                  <th className="px-6 py-3 font-medium text-[#6b7280]">Currency</th>
                  <th className="px-6 py-3 font-medium text-[#6b7280]">Status</th>
                  <th className="px-6 py-3 font-medium text-[#6b7280]">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]">
                    <td className="px-6 py-3.5 capitalize font-medium text-[#0a0a0a]">
                      {tx.type}
                    </td>
                    <td className="px-6 py-3.5 text-[#374151]">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-3.5 text-[#374151] uppercase">
                      {tx.currency}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#6b7280]">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Active Investments */}
      <div>
        <h2 className="text-base font-semibold text-[#0a0a0a] mb-4">
          Active Investments
        </h2>
        {investments.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-12 text-center text-[#6b7280] text-sm">
            No active investments. Explore our investment plans to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#0a0a0a]">{inv.planName}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 capitalize">
                      {inv.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                    <div>
                      <span className="text-[#6b7280]">Principal</span>
                      <p className="font-medium text-[#0a0a0a]">{formatCurrency(inv.principal)}</p>
                    </div>
                    <div>
                      <span className="text-[#6b7280]">Expected ROI</span>
                      <p className="font-medium text-[#0a0a0a]">{formatCurrency(inv.expectedROI)}</p>
                    </div>
                    <div>
                      <span className="text-[#6b7280]">Start Date</span>
                      <p className="font-medium text-[#0a0a0a]">{formatDate(inv.startDate)}</p>
                    </div>
                    <div>
                      <span className="text-[#6b7280]">End Date</span>
                      <p className="font-medium text-[#0a0a0a]">{formatDate(inv.endDate)}</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-[#6b7280] mb-1">
                      <span>Progress</span>
                      <span>{inv.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1d4ed8] rounded-full transition-all duration-500"
                        style={{ width: `${inv.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
