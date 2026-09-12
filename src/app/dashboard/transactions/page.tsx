"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { History, Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  createdAt: { seconds: number } | null;
}

type FilterTab = "all" | "deposit" | "withdrawal";

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

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const list: Transaction[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Transaction[];
        
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        
        setTransactions(list);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "deposit", label: "Deposits" },
    { key: "withdrawal", label: "Withdrawals" },
  ];

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
          <History className="h-6 w-6 text-[#1d4ed8]" />
          Transaction History
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          View all your deposits and withdrawals.
        </p>
      </div>

      {/* Card with filter tabs + table */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Filter tabs */}
        <div className="flex border-b border-[#e5e7eb] px-4 sm:px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                filter === tab.key
                  ? "border-[#1d4ed8] text-[#1d4ed8]"
                  : "border-transparent text-[#6b7280] hover:text-[#374151]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <History className="h-12 w-12 text-[#e5e7eb] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">
                No transactions found
              </h3>
              <p className="text-sm text-[#6b7280]">
                {filter === "all"
                  ? "You have no transactions yet."
                  : `No ${filter} transactions found.`}
              </p>
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
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium capitalize ${
                          tx.type === "deposit" ? "text-green-700" : "text-orange-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tx.type === "deposit" ? "bg-green-500" : "bg-orange-500"
                          }`}
                        />
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#374151] font-medium">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-3.5 text-[#374151] uppercase">
                      {tx.currency}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusBadge(
                          tx.status
                        )}`}
                      >
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
    </div>
  );
}
