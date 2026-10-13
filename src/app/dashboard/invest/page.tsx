"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, collection, writeBatch, serverTimestamp, increment } from "firebase/firestore";
import { TrendingUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createNotification } from "@/lib/firebase/notifications";

const PLANS = [
  { id: "basic", name: "Basic Plan", roi: 25, min: 100, max: 499, durationDays: 7, tag: "Starter" },
  { id: "standard", name: "Standard Plan", roi: 45, min: 500, max: 999, durationDays: 10, tag: "$500 Tier" },
  { id: "pro", name: "Pro Plan", roi: 75, min: 1000, max: 4999, durationDays: 14, tag: "Most Popular" },
  { id: "vip", name: "VIP Plan", roi: 100, min: 5000, max: 100000, durationDays: 30, tag: "Maximum ROI" },
];

export default function InvestPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]); // Default to Standard ($500)
  const [amount, setAmount] = useState<string>("500");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const balance = userData?.walletBalance || 0;

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan);
    setAmount(plan.min.toString());
    setError("");
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      return setError("You must be logged in to invest.");
    }
    setError("");

    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount <= 0) {
      return setError("Please enter a valid amount.");
    }

    if (investAmount > balance) {
      return setError(`Insufficient balance. Your available wallet balance is $${balance.toFixed(2)}. Please fund your wallet first.`);
    }

    if (investAmount < selectedPlan.min || investAmount > selectedPlan.max) {
      return setError(`Deposit for ${selectedPlan.name} must be between $${selectedPlan.min.toLocaleString()} and $${selectedPlan.max.toLocaleString()}.`);
    }

    try {
      setLoading(true);
      
      const expectedROI = investAmount + (investAmount * (selectedPlan.roi / 100));
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + selectedPlan.durationDays);

      // Atomic batch: balance deduction + investment creation + transaction record
      const batch = writeBatch(db);

      // 1. Deduct balance from user
      const userRef = doc(db, "users", user.uid);
      batch.update(userRef, {
        walletBalance: increment(-investAmount),
        totalInvested: increment(investAmount)
      });

      // 2. Create investment record
      const newInvestRef = doc(collection(db, "investments"));
      batch.set(newInvestRef, {
        userId: user.uid,
        userEmail: user.email || "",
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        principal: investAmount,
        expectedROI: expectedROI,
        roiPercentage: selectedPlan.roi,
        status: "active",
        startDate: startDate,
        endDate: endDate,
        createdAt: serverTimestamp()
      });

      // 3. Create transaction history record
      const newTxRef = doc(collection(db, "transactions"));
      batch.set(newTxRef, {
        userId: user.uid,
        userEmail: user.email || "",
        type: "investment",
        amount: investAmount,
        currency: "USD",
        status: "approved",
        createdAt: serverTimestamp(),
        description: `Invested in ${selectedPlan.name} (${selectedPlan.roi}% ROI)`
      });

      await batch.commit();

      // Trigger real-time notification
      await createNotification({
        userId: user.uid,
        title: "Investment Plan Activated",
        message: `You successfully allocated $${investAmount.toLocaleString()} to ${selectedPlan.name} (+${selectedPlan.roi}% ROI). Returns will mature in ${selectedPlan.durationDays} days.`,
        type: "investment",
        link: "/dashboard/investments",
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/investments");
      }, 2000);

    } catch (err: unknown) {
      console.error("Investment error:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while processing your investment.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#1d4ed8]" />
          Invest Now
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Choose an investment tier and allocate capital to start earning daily returns.
        </p>
      </div>

      {/* Available Balance Header */}
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1e40af]">Available Wallet Balance</p>
          <p className="text-3xl font-extrabold text-[#1d4ed8] mt-0.5">${balance.toFixed(2)}</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard/deposit")}
          className="bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1e40af] transition-colors shadow-sm"
        >
          + Fund Wallet
        </button>
      </div>

      {/* Plans Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <div 
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                isSelected 
                  ? "border-[#1d4ed8] shadow-[0_0_0_2px_rgba(29,78,216,0.2)] bg-white ring-2 ring-[#1d4ed8]/20" 
                  : "border-[#e5e7eb] bg-[#f8fafc] hover:border-[#9ca3af] hover:bg-white"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#0a0a0a] text-base">{plan.name}</h3>
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {plan.tag}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-[#1d4ed8] shrink-0" />
                  )}
                </div>

                <div className="space-y-2 text-xs py-2 border-y border-gray-100 my-2">
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">ROI</span>
                    <span className="font-bold text-[#1d4ed8] text-sm">+{plan.roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Duration</span>
                    <span className="font-medium text-[#0a0a0a]">{plan.durationDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Min</span>
                    <span className="font-medium text-[#0a0a0a]">${plan.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Max</span>
                    <span className="font-medium text-[#0a0a0a]">${plan.max.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className={`text-xs font-semibold ${isSelected ? "text-blue-700 font-bold" : "text-gray-500"}`}>
                  {isSelected ? "Selected Tier" : "Click to select"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Investment Form */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">
          Complete Investment in {selectedPlan.name}
        </h3>
        <p className="text-xs text-[#6b7280] mb-6">
          Expected Return: +{selectedPlan.roi}% in {selectedPlan.durationDays} days.
        </p>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-5 rounded-xl flex items-center mb-4">
            <CheckCircle2 className="h-6 w-6 mr-3 text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Investment successfully activated!</p>
              <p className="text-xs text-green-600">Redirecting to your active investments...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInvest} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2.5 shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">
                Amount to Invest (USD)
              </label>
              <div className="relative max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                <input
                  type="number"
                  min={selectedPlan.min}
                  max={selectedPlan.max}
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 pr-4 block w-full rounded-xl border border-gray-300 py-3 shadow-sm text-lg font-bold text-gray-900 focus:border-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 sm:text-base"
                  placeholder="500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Minimum: ${selectedPlan.min.toLocaleString()} | Maximum: ${selectedPlan.max.toLocaleString()}
              </p>
            </div>

            {/* Projected returns preview box */}
            {parseFloat(amount) > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Principal:</span>
                  <span className="font-bold text-gray-900 text-sm">${parseFloat(amount || "0").toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Net Profit:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    +${((parseFloat(amount || "0") * selectedPlan.roi) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 block">Total Payout:</span>
                  <span className="font-extrabold text-blue-700 text-sm">
                    ${(parseFloat(amount || "0") + (parseFloat(amount || "0") * selectedPlan.roi) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-w-[240px] flex justify-center items-center py-3.5 px-8 rounded-xl shadow-md text-sm font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d4ed8] disabled:opacity-70 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Investment...
                </>
              ) : (
                `Invest $${parseFloat(amount || "0").toLocaleString()} in ${selectedPlan.name}`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
