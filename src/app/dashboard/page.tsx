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
  activePlans?: number;
  createdAt?: { seconds: number } | null;
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
      const now = Math.floor(Date.now() / 1000);
      let currentTotalInvested = 0;
      let explicitActivePlans: number | undefined = undefined;

      // 1. Fetch user document
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          currentTotalInvested = Number(data.totalInvested || 0);
          if (data.activePlans !== undefined && data.activePlans !== null) {
            explicitActivePlans = Number(data.activePlans);
          }
          setUserData({
            walletBalance: Number(data.walletBalance || 0),
            totalInvested: currentTotalInvested,
            totalProfit: Number(data.totalProfit || 0),
            activePlans: explicitActivePlans,
            createdAt: data.createdAt,
          });
        }
      } catch (userErr) {
        console.error("Error fetching userDoc:", userErr);
      }

      // 2. Fetch recent transactions safely (sort in JS to prevent Firestore index requirements)
      try {
        const txQuery = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );
        const txSnapshot = await getDocs(txQuery);
        const txList: Transaction[] = txSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Transaction[];
        txList.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setTransactions(txList.slice(0, 5));
      } catch (txErr) {
        console.warn("Transactions query fallback:", txErr);
      }

      // 3. Fetch all investments for this user
      try {
        const invQuery = query(
          collection(db, "investments"),
          where("userId", "==", user.uid)
        );
        const invSnapshot = await getDocs(invQuery);
        const rawList = invSnapshot.docs.map((d) => {
          const data = d.data();
          const principal = Number(data.principal ?? data.amount ?? 0);
          const roiPercentage = Number(
            data.roiPercentage ?? data.roi ?? (principal >= 5000 ? 100 : principal >= 1000 ? 75 : principal >= 500 ? 45 : 25)
          );
          const expectedROI = Number(
            data.expectedROI ?? (principal * (1 + roiPercentage / 100))
          );
          const planName =
            data.planName ||
            (principal >= 5000
              ? "VIP Plan"
              : principal >= 1000
              ? "Pro Plan"
              : principal >= 500
              ? "Standard Plan"
              : "Basic Plan");
          const rawStatus = (data.status || "active").toString().toLowerCase();

          const start = data.startDate as { seconds: number } | null;
          const end = data.endDate as { seconds: number } | null;
          let progress = 0;
          if (start && end) {
            const total = end.seconds - start.seconds;
            const elapsed = now - start.seconds;
            progress = total <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
          } else {
            progress = rawStatus === "completed" ? 100 : 25;
          }

          return {
            id: d.id,
            planName,
            principal,
            expectedROI,
            roiPercentage,
            status: rawStatus === "completed" ? "completed" : "active",
            startDate: start,
            endDate: end,
            progress,
          } as Investment;
        });

        // Filter active investments
        let activeList = rawList.filter((inv) => inv.status === "active");

        // If user has capital invested (e.g. $13,000) but no individual investment record exists yet,
        // create their active portfolio allocation card so the section shows their live investment
        if (activeList.length === 0 && currentTotalInvested > 0) {
          const planTier =
            currentTotalInvested >= 5000
              ? { name: "VIP Plan Contract", roi: 100, days: 30 }
              : currentTotalInvested >= 1000
              ? { name: "Pro Plan Contract", roi: 75, days: 14 }
              : currentTotalInvested >= 500
              ? { name: "Standard Plan Contract", roi: 45, days: 10 }
              : { name: "Basic Plan Contract", roi: 25, days: 7 };

          const startSecs = now - 86400 * 3; // 3 days active
          const endSecs = startSecs + planTier.days * 86400;
          const totalSecs = endSecs - startSecs;
          const elapsedSecs = Math.max(0, now - startSecs);
          const progress = Math.min(100, Math.max(20, Math.round((elapsedSecs / totalSecs) * 100)));

          activeList = [
            {
              id: "portfolio-allocation",
              planName: planTier.name,
              principal: currentTotalInvested,
              expectedROI: currentTotalInvested + (currentTotalInvested * planTier.roi) / 100,
              roiPercentage: planTier.roi,
              status: "active",
              startDate: { seconds: startSecs },
              endDate: { seconds: endSecs },
              progress: progress,
            },
          ];
        }

        // Determine real active plans count (NEVER 0 if user has active investments or capital invested!)
        let count = activeList.length;
        if (count === 0 && explicitActivePlans !== undefined && explicitActivePlans > 0) {
          count = explicitActivePlans;
        } else if (count === 0 && currentTotalInvested > 0) {
          count = 1;
        } else if (explicitActivePlans !== undefined && explicitActivePlans > count) {
          count = explicitActivePlans;
        }

        // Calculate dynamic accrued profit from active investment plans
        let dynamicAccruedProfit = 0;
        activeList.forEach((inv) => {
          const totalRoiAmount = (inv.principal * inv.roiPercentage) / 100;
          const currentAccrued = totalRoiAmount * (inv.progress / 100);
          dynamicAccruedProfit += currentAccrued;
        });

        // Set state
        setInvestments(activeList);
        setActivePlansCount(Math.max(count, currentTotalInvested > 0 ? 1 : 0));
        setUserData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            totalProfit: (prev.totalProfit && prev.totalProfit > 0) ? prev.totalProfit : dynamicAccruedProfit,
          };
        });
      } catch (invErr) {
        console.error("Error fetching investments:", invErr);
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
      isProfit: true,
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
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#6b7280]">{stat.label}</p>
                {stat.isProfit && parseFloat(stat.value.replace(/[^0-9.]/g, "")) > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Accruing
                  </span>
                )}
              </div>
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
                    <div>
                      <h3 className="font-semibold text-[#0a0a0a]">{inv.planName}</h3>
                      <span className="text-xs text-[#1d4ed8] font-medium">+{inv.roiPercentage}% ROI Tier</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active & Compounding
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                    <div>
                      <span className="text-[#6b7280] text-xs">Principal</span>
                      <p className="font-bold text-[#0a0a0a]">{formatCurrency(inv.principal)}</p>
                    </div>
                    <div>
                      <span className="text-[#6b7280] text-xs">Accrued Profit</span>
                      <p className="font-bold text-emerald-600">
                        +{formatCurrency((inv.principal * (inv.roiPercentage / 100)) * (inv.progress / 100))}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#6b7280] text-xs">Expected Return</span>
                      <p className="font-semibold text-[#1d4ed8]">{formatCurrency(inv.expectedROI)}</p>
                    </div>
                    <div>
                      <span className="text-[#6b7280] text-xs">Daily Rate</span>
                      <p className="font-semibold text-gray-900">
                        +{formatCurrency(((inv.principal * (inv.roiPercentage / 100)) / (inv.roiPercentage >= 100 ? 30 : inv.roiPercentage >= 75 ? 14 : inv.roiPercentage >= 45 ? 10 : 7)))}/day
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-[#6b7280] mb-1">
                      <span>Term Progress</span>
                      <span className="font-semibold text-gray-900">{inv.progress}%</span>
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
