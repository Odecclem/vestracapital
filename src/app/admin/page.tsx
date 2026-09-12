"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, getCountFromServer, query, where } from "firebase/firestore";
import { Users, ArrowDownToLine, ArrowUpFromLine, Clock, Loader2 } from "lucide-react";

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingRequests: 0,
    totalWithdrawals: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Total Users Count
        const usersCol = collection(db, "users");
        const usersSnapshot = await getCountFromServer(usersCol);
        const totalUsers = usersSnapshot.data().count;

        // 2. Pending Requests Count
        const pendingQuery = query(
          collection(db, "transactions"),
          where("status", "==", "pending")
        );
        const pendingSnapshot = await getCountFromServer(pendingQuery);
        const pendingRequests = pendingSnapshot.data().count;

        // 3. Sum of Approved Deposits & Withdrawals
        // Fetching all approved transactions (may require composite index if filtering by type too, 
        // so we filter client-side to avoid index requirement errors during development)
        const approvedQuery = query(
          collection(db, "transactions"),
          where("status", "==", "approved")
        );
        const approvedSnapshot = await getDocs(approvedQuery);
        
        let totalDeposits = 0;
        let totalWithdrawals = 0;

        approvedSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === "deposit") {
            totalDeposits += data.amount || 0;
          } else if (data.type === "withdrawal") {
            totalWithdrawals += data.amount || 0;
          }
        });

        setStats({
          totalUsers,
          totalDeposits,
          pendingRequests,
          totalWithdrawals,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Deposits",
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.totalDeposits),
      icon: ArrowDownToLine,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests.toString(),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Total Withdrawals",
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.totalWithdrawals),
      icon: ArrowUpFromLine,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
