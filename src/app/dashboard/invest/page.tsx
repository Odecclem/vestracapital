"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, collection, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { TrendingUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const PLANS = [
  { id: "basic", name: "Basic Plan", roi: 25, min: 100, max: 999, durationDays: 7 },
  { id: "pro", name: "Pro Plan", roi: 75, min: 1000, max: 4999, durationDays: 14 },
  { id: "vip", name: "VIP Plan", roi: 100, min: 5000, max: 100000, durationDays: 30 },
];

export default function InvestPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const balance = userData?.walletBalance || 0;

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount <= 0) {
      return setError("Please enter a valid amount");
    }

    if (investAmount > balance) {
      return setError(`Insufficient balance. Your balance is $${balance.toFixed(2)}`);
    }

    if (investAmount < selectedPlan.min || investAmount > selectedPlan.max) {
      return setError(`Amount must be between $${selectedPlan.min} and $${selectedPlan.max} for the ${selectedPlan.name}`);
    }

    try {
      setLoading(true);
      
      const expectedROI = investAmount + (investAmount * (selectedPlan.roi / 100));
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + selectedPlan.durationDays);

      // 1. Deduct balance from user
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        walletBalance: increment(-investAmount),
        totalInvested: increment(investAmount)
      });

      // 2. Create investment record
      await addDoc(collection(db, "investments"), {
        userId: user.uid,
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

      // 3. Create transaction history
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "investment",
        amount: investAmount,
        status: "approved", // Automatically approved since it comes from internal balance
        createdAt: serverTimestamp(),
        description: `Invested in ${selectedPlan.name}`
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/investments");
      }, 2000);

    } catch (err) {
      console.error("Investment error:", err);
      setError("An error occurred while processing your investment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#1d4ed8]" />
          Invest Now
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Choose a plan and start growing your portfolio today.
        </p>
      </div>

      {/* Available Balance */}
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-[#1e40af] font-medium">Available Balance</p>
          <p className="text-2xl font-bold text-[#1d4ed8]">${balance.toFixed(2)}</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard/deposit")}
          className="bg-white text-[#1d4ed8] border border-[#bfdbfe] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Fund Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`cursor-pointer rounded-xl border p-6 transition-all duration-200 ${
              selectedPlan.id === plan.id 
                ? "border-[#1d4ed8] shadow-[0_0_0_2px_rgba(29,78,216,0.2)] bg-white" 
                : "border-[#e5e7eb] bg-[#f8fafc] hover:border-[#9ca3af]"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#0a0a0a] text-lg">{plan.name}</h3>
              {selectedPlan.id === plan.id && (
                <CheckCircle2 className="h-5 w-5 text-[#1d4ed8]" />
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">ROI</span>
                <span className="font-semibold text-[#1d4ed8]">{plan.roi}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Duration</span>
                <span className="font-medium text-[#0a0a0a]">{plan.durationDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Min</span>
                <span className="font-medium text-[#0a0a0a]">${plan.min}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Max</span>
                <span className="font-medium text-[#0a0a0a]">${plan.max}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
        <h3 className="font-semibold text-[#0a0a0a] mb-4">Complete Investment</h3>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center mb-4">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Investment successful! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleInvest} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center text-sm">
                <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1">
                Amount to Invest (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min={selectedPlan.min}
                  max={selectedPlan.max}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8] sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d4ed8] disabled:opacity-70 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Invest in ${selectedPlan.name}`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
