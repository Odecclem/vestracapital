"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { Copy, Loader2, TrendingUp, Users, ShieldAlert, CheckCircle2 } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { createNotification } from "@/lib/firebase/notifications";

const TRADERS = [
  {
    id: "t1",
    name: "Alex Sterling",
    winRate: "94.5%",
    profitShare: "10%",
    totalCopiers: "4,521",
    riskLevel: "Low",
    minFunding: 5000,
    description: "Consistent daily returns with minimal drawdown. Focuses on major forex pairs and BTC/ETH.",
  },
  {
    id: "t2",
    name: "Sarah Jenkins",
    winRate: "91.2%",
    profitShare: "15%",
    totalCopiers: "2,105",
    riskLevel: "Medium",
    minFunding: 5000,
    description: "Swing trader specializing in altcoins and DeFi tokens. Higher returns with moderate risk.",
  },
  {
    id: "t3",
    name: "Marcus Wei",
    winRate: "96.1%",
    profitShare: "20%",
    totalCopiers: "8,932",
    riskLevel: "High",
    minFunding: 10000,
    description: "Aggressive day trading strategy. Capitalizes on market volatility for maximum gains.",
  },
  {
    id: "t4",
    name: "Elena Rodriguez",
    winRate: "93.8%",
    profitShare: "12%",
    totalCopiers: "3,410",
    riskLevel: "Low",
    minFunding: 5000,
    description: "Algorithmic trading using proprietary AI models. Extremely stable equity curve.",
  },
  {
    id: "t5",
    name: "David Chen",
    winRate: "89.5%",
    profitShare: "8%",
    totalCopiers: "1,240",
    riskLevel: "Medium",
    minFunding: 5000,
    description: "Focuses on commodities and crypto. Solid, fundamental-based long-term positions.",
  },
  {
    id: "t6",
    name: "Crypto Whale Alpha",
    winRate: "97.2%",
    profitShare: "25%",
    totalCopiers: "12,045",
    riskLevel: "High",
    minFunding: 15000,
    description: "Exclusive insider strategies and high-leverage scalping. For serious investors only.",
  },
];

export default function CopyTradingPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<typeof TRADERS[0] | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("");

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

  const handleCopyTrader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrader || !user) return;

    const amount = parseFloat(investAmount);

    if (isNaN(amount) || amount < selectedTrader.minFunding) {
      setToast({ message: `Minimum funding required is $${selectedTrader.minFunding}.`, type: "error" });
      return;
    }

    if (amount > balance) {
      setToast({ message: "Insufficient wallet balance. Please deposit more funds.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      
      // Deduct balance and increment totalInvested
      const newBalance = balance - amount;
      await updateDoc(doc(db, "users", user.uid), {
        walletBalance: newBalance,
        totalInvested: increment(amount),
      });
      setBalance(newBalance);

      const winRateNum = parseFloat(selectedTrader.winRate) || 85;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      // Add copy trading investment record with both principal & amount for compatibility
      await addDoc(collection(db, "investments"), {
        userId: user.uid,
        userEmail: user.email || "",
        planName: `Copy Trading: ${selectedTrader.name}`,
        principal: amount,
        amount: amount,
        roiPercentage: winRateNum,
        expectedROI: amount + (amount * (winRateNum / 100)),
        duration: "30 Days",
        status: "active",
        startDate: startDate,
        endDate: endDate,
        createdAt: serverTimestamp(),
      });

      // Send notification
      await createNotification({
        userId: user.uid,
        title: "Copy Trading Activated",
        message: `You started copying trader ${selectedTrader.name} with an allocation of $${amount.toLocaleString()}.`,
        type: "investment",
        link: "/dashboard/investments",
      });

      setToast({
        message: `Successfully started copying ${selectedTrader.name} with $${amount}!`,
        type: "success",
      });
      
      setSelectedTrader(null);
      setInvestAmount("");
    } catch (error) {
      console.error("Error starting copy trade:", error);
      setToast({ message: "Failed to start copy trading. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0a0a0a] flex items-center gap-2">
          <Copy className="h-6 w-6 text-[#1d4ed8]" />
          Copy Trading
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Mirror the trades of our top performing experts. Minimum funding is $5,000.
        </p>
      </div>

      {/* Available Balance */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#eff6ff] flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-[#1d4ed8]" />
          </div>
          <div>
            <p className="text-sm text-[#6b7280]">Wallet Balance</p>
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

      {/* Traders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {TRADERS.map((trader) => (
          <div key={trader.id} className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0a0a0a]">{trader.name}</h3>
              <div className="flex items-center gap-1 text-[#16a34a] bg-green-50 px-2 py-1 rounded-md text-xs font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </div>
            </div>
            
            <p className="text-sm text-[#6b7280] mb-6 flex-1">
              {trader.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="block text-[#6b7280] text-xs">Win Rate</span>
                <span className="font-semibold text-[#0a0a0a]">{trader.winRate}</span>
              </div>
              <div>
                <span className="block text-[#6b7280] text-xs">Profit Share</span>
                <span className="font-semibold text-[#0a0a0a]">{trader.profitShare}</span>
              </div>
              <div>
                <span className="block text-[#6b7280] text-xs">Risk Level</span>
                <span className={`font-semibold ${
                  trader.riskLevel === 'Low' ? 'text-green-600' :
                  trader.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {trader.riskLevel}
                </span>
              </div>
              <div>
                <span className="block text-[#6b7280] text-xs">Total Copiers</span>
                <span className="font-semibold text-[#0a0a0a]">{trader.totalCopiers}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
              <div>
                <span className="block text-[#6b7280] text-xs">Min. Funding</span>
                <span className="font-bold text-[#1d4ed8]">{formatCurrency(trader.minFunding)}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedTrader(trader);
                  setInvestAmount(trader.minFunding.toString());
                }}
                className="px-4 py-2 bg-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af] transition-colors"
              >
                Copy Trader
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Copy Modal */}
      {selectedTrader && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">
              Copy {selectedTrader.name}
            </h3>
            <p className="text-sm text-[#6b7280] mb-6">
              Enter the amount you wish to allocate for copying this trader's portfolio. Minimum required is {formatCurrency(selectedTrader.minFunding)}.
            </p>

            <form onSubmit={handleCopyTrader} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">
                  Funding Amount (USD)
                </label>
                <input
                  type="number"
                  required
                  min={selectedTrader.minFunding}
                  step="1"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8]"
                  placeholder={`Min ${formatCurrency(selectedTrader.minFunding)}`}
                />
              </div>

              <div className="bg-[#eff6ff] rounded-lg p-3 flex gap-2 items-start text-sm text-[#1d4ed8]">
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                <p>By copying this trader, you agree to the {selectedTrader.profitShare} profit share fee deducted from your winning trades.</p>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => setSelectedTrader(null)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-100 text-[#374151] text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center px-4 py-2 bg-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af] transition-colors disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Copy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
