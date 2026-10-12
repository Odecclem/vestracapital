"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { Users, Loader2, Edit2, X } from "lucide-react";
import Toast, { ToastState } from "@/components/ui/Toast";

interface UserData {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  role: string;
  walletBalance: number;
  totalInvested: number;
  createdAt: { seconds: number } | null;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newBalance, setNewBalance] = useState<string>("");
  const [saving, setSaving] = useState(false);
  
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserData[];
        setUsers(list);
      } catch (error) {
        console.error("Error fetching users:", error);
        setToast({ isOpen: true, message: "Failed to load users.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleEditBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setSaving(true);
    try {
      const balanceNum = parseFloat(newBalance);
      if (isNaN(balanceNum) || balanceNum < 0) {
        throw new Error("Invalid balance amount");
      }
      
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        walletBalance: balanceNum
      });
      
      // Update local state
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, walletBalance: balanceNum } : u));
      setToast({ isOpen: true, message: "Balance updated successfully.", type: "success" });
      setEditingUser(null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update balance.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdmin = async (targetUser: UserData) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    if (!confirm(`Are you sure you want to change ${targetUser.fullName}'s role to "${newRole}"?`)) return;

    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      setToast({ isOpen: true, message: `Role changed to ${newRole}.`, type: "success" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update role.";
      setToast({ isOpen: true, message: msg, type: "error" });
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
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US");
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
          <Users className="h-6 w-6 text-blue-600" />
          Manage Users
        </h1>
        <p className="text-sm text-gray-500 mt-1">View all registered users and manage their wallet balances.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Total Invested</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.fullName}</td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(u.walletBalance)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatCurrency(u.totalInvested)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() => handleToggleAdmin(u)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors ${
                        u.role === 'admin'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setNewBalance(u.walletBalance.toString());
                      }}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Balance
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Wallet Balance</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditBalance} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Updating balance for <span className="font-semibold text-gray-900">{editingUser.fullName}</span> ({editingUser.email}).
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Balance (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
