"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import {
  Users,
  Loader2,
  Edit2,
  X,
  Layers,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import Toast, { ToastState } from "@/components/ui/Toast";
import { createNotification } from "@/lib/firebase/notifications";

interface UserData {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  role: string;
  walletBalance: number;
  totalInvested: number;
  totalProfit?: number;
  activePlans?: number;
  createdAt: { seconds: number } | null;
}

const DEFAULT_PLANS = [
  { id: "basic", name: "Basic Plan", roi: 25, durationDays: 7, min: 100 },
  { id: "standard", name: "Standard Plan", roi: 45, durationDays: 10, min: 500 },
  { id: "pro", name: "Pro Plan", roi: 75, durationDays: 14, min: 1000 },
  { id: "vip", name: "VIP Plan", roi: 100, durationDays: 30, min: 5000 },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit User Portfolio Modal state
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editBalance, setEditBalance] = useState<string>("");
  const [editTotalInvested, setEditTotalInvested] = useState<string>("");
  const [editTotalProfit, setEditTotalProfit] = useState<string>("");
  const [editActivePlans, setEditActivePlans] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Allocate Plan Modal state
  const [allocatingUser, setAllocatingUser] = useState<UserData | null>(null);
  const [selectedPlanTier, setSelectedPlanTier] = useState(DEFAULT_PLANS[3]); // VIP default
  const [planAmount, setPlanAmount] = useState<string>("5000");
  const [planRoi, setPlanRoi] = useState<string>("100");
  const [planDays, setPlanDays] = useState<string>("30");
  const [allocating, setAllocating] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as UserData[];
        setUsers(list);
      } catch (error) {
        console.error("Error fetching users:", error);
        setToast({
          isOpen: true,
          message: "Failed to load users.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const openEditModal = (u: UserData) => {
    setEditingUser(u);
    setEditBalance(Number(u.walletBalance || 0).toString());
    setEditTotalInvested(Number(u.totalInvested || 0).toString());
    setEditTotalProfit(Number(u.totalProfit || 0).toString());
    const derivedPlans =
      u.activePlans !== undefined
        ? u.activePlans
        : (u.totalInvested || 0) > 0
        ? 1
        : 0;
    setEditActivePlans(derivedPlans.toString());
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      const balanceNum = parseFloat(editBalance) || 0;
      const investedNum = parseFloat(editTotalInvested) || 0;
      const profitNum = parseFloat(editTotalProfit) || 0;
      const plansNum = parseInt(editActivePlans, 10) || 0;

      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        walletBalance: balanceNum,
        totalInvested: investedNum,
        totalProfit: profitNum,
        activePlans: plansNum,
      });

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                walletBalance: balanceNum,
                totalInvested: investedNum,
                totalProfit: profitNum,
                activePlans: plansNum,
              }
            : u
        )
      );

      setToast({
        isOpen: true,
        message: "User portfolio updated successfully.",
        type: "success",
      });
      setEditingUser(null);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to update portfolio.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openAllocateModal = (u: UserData) => {
    setAllocatingUser(u);
    const defaultTier = DEFAULT_PLANS[3]; // VIP Tier
    setSelectedPlanTier(defaultTier);
    setPlanAmount(
      u.totalInvested && u.totalInvested > 0
        ? u.totalInvested.toString()
        : defaultTier.min.toString()
    );
    setPlanRoi(defaultTier.roi.toString());
    setPlanDays(defaultTier.durationDays.toString());
  };

  const handleAllocatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingUser) return;

    setAllocating(true);
    try {
      const principal = parseFloat(planAmount);
      const roi = parseFloat(planRoi);
      const days = parseInt(planDays, 10);

      if (isNaN(principal) || principal <= 0) {
        throw new Error("Invalid principal amount");
      }

      const expectedROI = principal + (principal * roi) / 100;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      // 1. Create active investment record in Firestore
      await addDoc(collection(db, "investments"), {
        userId: allocatingUser.id,
        userEmail: allocatingUser.email || "",
        planId: selectedPlanTier.id,
        planName: selectedPlanTier.name,
        principal: principal,
        amount: principal,
        expectedROI: expectedROI,
        roiPercentage: roi,
        duration: `${days} Days`,
        status: "active",
        startDate: startDate,
        endDate: endDate,
        createdAt: serverTimestamp(),
      });

      // 2. Update user doc: ensure totalInvested reflects and activePlans is incremented
      const currentPlans = Number(allocatingUser.activePlans || 0);
      const newPlans = currentPlans + 1;
      const currentInvested = Number(allocatingUser.totalInvested || 0);
      const newInvested =
        currentInvested === principal ? principal : currentInvested + principal;

      await updateDoc(doc(db, "users", allocatingUser.id), {
        totalInvested: newInvested,
        activePlans: newPlans,
      });

      // 3. Send notification to user
      await createNotification({
        userId: allocatingUser.id,
        title: "Active Investment Plan Allocated",
        message: `An active investment plan of $${principal.toLocaleString()} into ${selectedPlanTier.name} (+${roi}% ROI) has been allocated to your portfolio.`,
        type: "investment",
        link: "/dashboard/investments",
      });

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === allocatingUser.id
            ? { ...u, totalInvested: newInvested, activePlans: newPlans }
            : u
        )
      );

      setToast({
        isOpen: true,
        message: `Allocated ${selectedPlanTier.name} to ${allocatingUser.fullName}!`,
        type: "success",
      });
      setAllocatingUser(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to allocate investment plan.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setAllocating(false);
    }
  };

  const handleToggleAdmin = async (targetUser: UserData) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    if (
      !confirm(
        `Are you sure you want to change ${targetUser.fullName}'s role to "${newRole}"?`
      )
    )
      return;

    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, { role: newRole });
      setUsers(
        users.map((u) =>
          u.id === targetUser.id ? { ...u, role: newRole } : u
        )
      );
      setToast({
        isOpen: true,
        message: `Role changed to ${newRole}.`,
        type: "success",
      });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to update role.";
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
        <p className="text-sm text-gray-500 mt-1">
          Manage user balances, portfolio capital, active investment plans, and roles.
        </p>
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
                <th className="px-6 py-4">Active Plans</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => {
                const plansCount =
                  u.activePlans !== undefined
                    ? u.activePlans
                    : (u.totalInvested || 0) > 0
                    ? 1
                    : 0;

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(u.walletBalance)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-700">
                      {formatCurrency(u.totalInvested)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          plansCount > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {plansCount} active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {/* Allocate Plan Button */}
                      <button
                        onClick={() => openAllocateModal(u)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Allocate Investment Plan"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Allocate Plan</span>
                      </button>

                      {/* Edit Portfolio Button */}
                      <button
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        title="Edit User Portfolio"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit Portfolio</span>
                      </button>

                      {/* Toggle Admin */}
                      <button
                        onClick={() => handleToggleAdmin(u)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors ${
                          u.role === "admin"
                            ? "text-red-600 hover:bg-red-50"
                            : "text-purple-600 hover:bg-purple-50"
                        }`}
                      >
                        {u.role === "admin" ? "Demote" : "Admin"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Portfolio Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/70">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Edit Portfolio & Balances
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingUser.fullName} ({editingUser.email})
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePortfolio} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Available Wallet Balance ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-semibold"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Invested ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editTotalInvested}
                    onChange={(e) => setEditTotalInvested(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-semibold text-blue-700"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Profit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editTotalProfit}
                    onChange={(e) => setEditTotalProfit(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-semibold text-emerald-600"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Active Plans Count
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={editActivePlans}
                    onChange={(e) => setEditActivePlans(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm font-semibold"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="pt-2 text-xs text-gray-500">
                Note: Updating these values directly synchronizes with the user&apos;s live dashboard overview stats cards.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Investment Plan Modal */}
      {allocatingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-emerald-50/60">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Allocate Investment Plan
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Allocate a plan directly for {allocatingUser.fullName} ({allocatingUser.email})
                </p>
              </div>
              <button
                onClick={() => setAllocatingUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAllocatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Investment Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_PLANS.map((plan) => {
                    const isSelected = selectedPlanTier.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          setSelectedPlanTier(plan);
                          setPlanRoi(plan.roi.toString());
                          setPlanDays(plan.durationDays.toString());
                          if (parseFloat(planAmount) < plan.min) {
                            setPlanAmount(plan.min.toString());
                          }
                        }}
                        className={`cursor-pointer border rounded-xl p-3 transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-gray-900">
                            {plan.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          +{plan.roi}% ROI • {plan.durationDays}d
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Principal ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={planAmount}
                    onChange={(e) => setPlanAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none text-sm font-semibold"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ROI (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={planRoi}
                    onChange={(e) => setPlanRoi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none text-sm font-semibold"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={planDays}
                    onChange={(e) => setPlanDays(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none text-sm font-semibold"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Projected Return */}
              {parseFloat(planAmount) > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 block">Expected Return:</span>
                    <span className="font-bold text-gray-900 text-sm">
                      $
                      {(
                        parseFloat(planAmount || "0") +
                        (parseFloat(planAmount || "0") * parseFloat(planRoi || "0")) / 100
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-1 rounded-full text-[11px]">
                    +{planRoi}% Net Profit
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAllocatingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocating}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {allocating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {allocating ? "Allocating Plan..." : "Allocate Investment Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
