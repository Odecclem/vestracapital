"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, query, where, orderBy, writeBatch, increment } from "firebase/firestore";
import { ArrowDownToLine, Loader2, Check, X as XIcon } from "lucide-react";
import Toast, { ToastState } from "@/components/ui/Toast";
import { createNotification } from "@/lib/firebase/notifications";

interface TransactionData {
  id: string;
  userId: string;
  userEmail: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  txHash?: string;
  createdAt: { seconds: number } | null;
}

export default function PendingDepositsPage() {
  const [deposits, setDeposits] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    const fetchPendingDeposits = async () => {
      try {
        const q = query(
          collection(db, "transactions"),
          where("type", "==", "deposit")
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() })) as TransactionData[];
        
        const pendingDeposits = list
          .filter(tx => tx.status === "pending")
          .sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          
        setDeposits(pendingDeposits);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        setToast({ isOpen: true, message: "Failed to load pending deposits.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingDeposits();
  }, []);

  const handleApprove = async (tx: TransactionData) => {
    if (!confirm(`Are you sure you want to approve this ${tx.amount} deposit for ${tx.userEmail}?`)) return;
    
    setProcessingId(tx.id);
    try {
      const batch = writeBatch(db);
      
      // 1. Update transaction status
      const txRef = doc(db, "transactions", tx.id);
      batch.update(txRef, { status: "approved" });
      
      // 2. Increment user's wallet balance
      const userRef = doc(db, "users", tx.userId);
      batch.update(userRef, {
        walletBalance: increment(tx.amount)
      });
      
      await batch.commit();

      // Send notification to user
      await createNotification({
        userId: tx.userId,
        title: "Deposit Approved",
        message: `Your deposit of $${tx.amount.toLocaleString()} has been approved and added to your wallet balance.`,
        type: "deposit",
        link: "/dashboard",
      });
      
      // Remove from list
      setDeposits(deposits.filter(d => d.id !== tx.id));
      setToast({ isOpen: true, message: "Deposit approved successfully.", type: "success" });
    } catch (error: unknown) {
      console.error("Error approving deposit:", error);
      const msg = error instanceof Error ? error.message : "Failed to approve deposit.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tx: TransactionData) => {
    if (!confirm(`Are you sure you want to reject this deposit for ${tx.userEmail}?`)) return;
    
    setProcessingId(tx.id);
    try {
      const batch = writeBatch(db);
      
      // 1. Update transaction status
      const txRef = doc(db, "transactions", tx.id);
      batch.update(txRef, { status: "rejected" });
      
      await batch.commit();

      // Send notification to user
      await createNotification({
        userId: tx.userId,
        title: "Deposit Rejected",
        message: `Your deposit request of $${tx.amount.toLocaleString()} was rejected. Please contact support or retry.`,
        type: "deposit",
        link: "/dashboard/transactions",
      });
      
      // Remove from list
      setDeposits(deposits.filter(d => d.id !== tx.id));
      setToast({ isOpen: true, message: "Deposit rejected.", type: "success" });
    } catch (error: unknown) {
      console.error("Error rejecting deposit:", error);
      const msg = error instanceof Error ? error.message : "Failed to reject deposit.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return "—";
    return new Date(timestamp.seconds * 1000).toLocaleString("en-US");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast.isOpen && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowDownToLine className="h-6 w-6 text-blue-600" />
          Pending Deposits
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve or reject user deposit requests.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">User Email</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Currency</th>
                <th className="px-6 py-4">TX Hash</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deposits.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{tx.userEmail}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(tx.amount)}</td>
                  <td className="px-6 py-4 text-gray-500 uppercase">{tx.currency}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {tx.txHash ? (
                      <span className="truncate block max-w-[150px]" title={tx.txHash}>
                        {tx.txHash}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(tx.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(tx)}
                        disabled={processingId === tx.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {processingId === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(tx)}
                        disabled={processingId === tx.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {processingId === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XIcon className="h-4 w-4" />}
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {deposits.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No pending deposits.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
