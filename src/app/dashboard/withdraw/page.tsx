"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ArrowUpFromLine, Loader2, Wallet } from "lucide-react";
import Toast from "@/components/ui/Toast";

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDT", name: "Tether" },
];

export default function WithdrawPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BTC");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch user's balance
  useEffect(() => {
    if (!user) return;
    const fetchBalance = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setBalance(userDoc.data().walletBalance || 0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setFetchingBalance(false);
      }
    };
    fetchBalance();
  }, [user]);

  const handleMax = () => {
    setAmount(balance.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      setToast({ message: "Please enter a valid amount.", type: "error" });
      return;
    }

    if (withdrawAmount < 200) {
      setToast({ message: "Minimum withdrawal amount is $200.", type: "error" });
      return;
    }

    if (withdrawAmount > balance) {
      setToast({ message: "Insufficient balance.", type: "error" });
      return;
    }

    if (!walletAddress.trim()) {
      setToast({ message: "Please enter your wallet address.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "transactions"), {
        userId: user?.uid,
        userEmail: user?.email,
        type: "withdrawal",
        amount: withdrawAmount,
        currency,
        walletAddress: walletAddress.trim(),
        txHash: "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setToast({
        message: "Withdrawal request submitted. Processing within 24 hours.",
        type: "success",
      });
      setAmount("");
      setWalletAddress("");
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      setToast({ message: "Failed to submit withdrawal. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] flex items-center gap-2">
          <ArrowUpFromLine className="h-6 w-6 text-[#1d4ed8]" />
          Withdraw Funds
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Request a withdrawal to your personal wallet. Minimum withdrawal is $200.
        </p>
      </div>

      {/* Balance card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#eff6ff] flex items-center justify-center">
            <Wallet className="h-6 w-6 text-[#1d4ed8]" />
          </div>
          <div>
            <p className="text-sm text-[#6b7280]">Available Balance</p>
            <p className="text-2xl font-bold text-[#0a0a0a]">
              {fetchingBalance ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#1d4ed8]" />
              ) : (
                formatCurrency(balance)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal form */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label htmlFor="withdrawAmount" className="block text-sm font-medium text-[#374151] mb-1">
              Amount (USD)
            </label>
            <div className="relative">
              <input
                id="withdrawAmount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 100"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-16 text-sm placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8]"
              />
              <button
                type="button"
                onClick={handleMax}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#eff6ff] text-[#1d4ed8] rounded text-xs font-semibold hover:bg-[#dbeafe] transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Cryptocurrency */}
          <div>
            <label htmlFor="withdrawCurrency" className="block text-sm font-medium text-[#374151] mb-1">
              Select Cryptocurrency
            </label>
            <select
              id="withdrawCurrency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8] bg-white"
            >
              {cryptoOptions.map((crypto) => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  {crypto.name} ({crypto.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Wallet address */}
          <div>
            <label htmlFor="walletAddr" className="block text-sm font-medium text-[#374151] mb-1">
              Your Wallet Address
            </label>
            <input
              id="walletAddr"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder={`Enter your ${currency} wallet address`}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Withdrawal"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
