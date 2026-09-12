"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Copy, Check, ArrowDownToLine, Loader2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

const walletAddresses: Record<string, string> = {
  BTC: "bc1qvfus6y9scqlvmxhant63nfq3tfngdmpmgwjgek",
  ETH: "0xC2158c79a836eEEE5C18408d49E24FB8f54325fE",
  USDT: "UQD7heBoGtQUpotHXVGslcsrbj0jcSe5bZIBJdljGARFp4Cy",
};

const cryptoOptions = [
  { symbol: "BTC", name: "Bitcoin", color: "bg-orange-500" },
  { symbol: "ETH", name: "Ethereum (ERC-20)", color: "bg-indigo-500" },
  { symbol: "USDT", name: "Tether (TON)", color: "bg-emerald-500" },
];

export default function DepositPage() {
  const { user } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddresses[selectedCrypto]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = walletAddresses[selectedCrypto];
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setToast({ message: "Please enter a valid amount.", type: "error" });
      return;
    }

    if (!txHash.trim()) {
      setToast({ message: "Please enter your transaction hash.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "transactions"), {
        userId: user?.uid,
        userEmail: user?.email,
        type: "deposit",
        amount: parseFloat(amount),
        currency: selectedCrypto,
        walletAddress: walletAddresses[selectedCrypto],
        txHash: txHash.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setToast({
        message: "Deposit submitted. Awaiting admin confirmation.",
        type: "success",
      });
      setAmount("");
      setTxHash("");
    } catch (error) {
      console.error("Error submitting deposit:", error);
      setToast({ message: "Failed to submit deposit. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
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
          <ArrowDownToLine className="h-6 w-6 text-[#1d4ed8]" />
          Fund Your Account
        </h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Select a cryptocurrency, send funds to the address below, and submit your proof of payment.
        </p>
      </div>

      {/* Step 1: Select crypto */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <h2 className="text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider mb-4">
          Step 1 — Select Cryptocurrency
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {cryptoOptions.map((crypto) => (
            <button
              key={crypto.symbol}
              onClick={() => {
                setSelectedCrypto(crypto.symbol);
                setCopied(false);
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-150 ${
                selectedCrypto === crypto.symbol
                  ? "border-[#1d4ed8] bg-[#eff6ff]"
                  : "border-[#e5e7eb] hover:border-[#3b82f6] bg-white"
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${crypto.color} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{crypto.symbol.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-[#374151]">{crypto.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Wallet address */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <h2 className="text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider mb-4">
          Step 2 — Send {selectedCrypto} to This Address
        </h2>
        <div className="flex items-center gap-2 bg-[#f8fafc] rounded-lg border border-[#e5e7eb] p-3">
          <code className="flex-1 text-sm text-[#374151] break-all font-mono">
            {walletAddresses[selectedCrypto]}
          </code>
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              copied
                ? "bg-green-100 text-green-700"
                : "bg-[#1d4ed8] text-white hover:bg-[#3b82f6]"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-[#6b7280] mt-3">
          Only send {selectedCrypto} to this address. 
          {selectedCrypto === "USDT" && <span className="font-semibold text-emerald-600"> Please ensure you are using the TON network. </span>}
          {selectedCrypto === "ETH" && <span className="font-semibold text-indigo-600"> Please ensure you are using the ERC-20 network. </span>}
          Sending any other cryptocurrency or using the wrong network may result in permanent loss.
        </p>
      </div>

      {/* Step 3: Submit proof */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <h2 className="text-sm font-semibold text-[#0a0a0a] uppercase tracking-wider mb-4">
          Step 3 — Submit Deposit Proof
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-[#374151] mb-1">
              Amount Deposited (USD)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8]"
            />
          </div>

          <div>
            <label htmlFor="txHash" className="block text-sm font-medium text-[#374151] mb-1">
              Transaction Hash / TXID
            </label>
            <input
              id="txHash"
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter your transaction hash"
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
                Submitting...
              </>
            ) : (
              "Submit Deposit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
