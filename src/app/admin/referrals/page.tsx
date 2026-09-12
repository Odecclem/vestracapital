"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { Network, Loader2 } from "lucide-react";

interface UserWithReferral {
  id: string;
  fullName: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  createdAt: { seconds: number } | null;
}

export default function AdminReferralsPage() {
  const [users, setUsers] = useState<UserWithReferral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserWithReferral[];
        setUsers(list);
      } catch (error) {
        console.error("Error fetching users for referrals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  // Filter users who were referred by someone
  const referredUsers = users.filter((u) => u.referredBy);

  // Helper to find referrer name
  const getReferrerName = (code?: string) => {
    if (!code) return "Unknown";
    const referrer = users.find((u) => u.referralCode === code);
    return referrer ? `${referrer.fullName} (${referrer.email})` : code;
  };

  const formatDate = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return "—";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Network className="h-6 w-6 text-blue-600" />
          Referral Network
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor platform-wide referrals and network growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Network className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{referredUsers.length}</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Total Successful Referrals</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          {referredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Network className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No referrals yet
              </h3>
              <p className="text-sm text-gray-500">
                No users have signed up with a referral code.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left bg-gray-50">
                  <th className="px-6 py-3 font-medium text-gray-500">New User</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Referred By</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Signup Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {referredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {getReferrerName(user.referredBy)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(user.createdAt)}
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
