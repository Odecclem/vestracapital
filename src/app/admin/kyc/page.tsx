"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, FileImage } from "lucide-react";
import Image from "next/image";

interface KycSubmission {
  id: string;
  fullName: string;
  email: string;
  kycStatus: "pending" | "verified" | "rejected";
  kycDocuments?: {
    front: string;
    back: string;
  };
  createdAt: { seconds: number } | null;
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingKyc = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("kycStatus", "==", "pending"),
          // Note: ordering requires a composite index if combining where and orderBy on different fields.
          // For now, we will sort in memory.
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as KycSubmission[];
        
        // Sort by date descending
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        setSubmissions(list);
      } catch (error) {
        console.error("Error fetching KYC submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingKyc();
  }, []);

  const handleAction = async (userId: string, action: "verified" | "rejected") => {
    if (!confirm(`Are you sure you want to ${action === 'verified' ? 'approve' : 'reject'} this KYC submission?`)) return;

    try {
      setProcessingId(userId);
      await updateDoc(doc(db, "users", userId), {
        kycStatus: action
      });
      setSubmissions(submissions.filter(s => s.id !== userId));
    } catch (error) {
      console.error(`Error updating KYC to ${action}:`, error);
      alert(`Failed to ${action} KYC. Please try again.`);
    } finally {
      setProcessingId(null);
    }
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
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          Pending KYC Verifications
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve user identity documents.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          {submissions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShieldCheck className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No pending verifications
              </h3>
              <p className="text-sm text-gray-500">
                All KYC submissions have been reviewed.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left bg-gray-50">
                  <th className="px-6 py-3 font-medium text-gray-500">User</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Documents</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Submitted</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sub.fullName}</div>
                      <div className="text-gray-500">{sub.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.kycDocuments ? (
                        <div className="flex items-center gap-4">
                          <a 
                            href={sub.kycDocuments.front} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <FileImage className="h-4 w-4" />
                            Front
                          </a>
                          <a 
                            href={sub.kycDocuments.back} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <FileImage className="h-4 w-4" />
                            Back
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No documents provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {sub.createdAt ? new Date(sub.createdAt.seconds * 1000).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleAction(sub.id, "rejected")}
                        disabled={processingId === sub.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, "verified")}
                        disabled={processingId === sub.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-md font-medium transition-colors disabled:opacity-50"
                      >
                        {processingId === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Approve
                      </button>
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
