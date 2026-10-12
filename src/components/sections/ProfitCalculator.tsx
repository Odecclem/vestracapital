"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calculator, ArrowRight, DollarSign, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

interface PlanConfig {
  id: string;
  name: string;
  min: number;
  max: number;
  roiPercentage: number;
  durationDays: number;
  tag: string;
}

const CALCULATOR_PLANS: PlanConfig[] = [
  {
    id: "basic",
    name: "Basic Plan",
    min: 100,
    max: 499,
    roiPercentage: 25,
    durationDays: 7,
    tag: "Starter",
  },
  {
    id: "standard",
    name: "Standard Plan",
    min: 500,
    max: 999,
    roiPercentage: 45,
    durationDays: 10,
    tag: "$500 Tier",
  },
  {
    id: "pro",
    name: "Pro Plan",
    min: 1000,
    max: 4999,
    roiPercentage: 75,
    durationDays: 14,
    tag: "Most Popular",
  },
  {
    id: "vip",
    name: "VIP Plan",
    min: 5000,
    max: 100000,
    roiPercentage: 100,
    durationDays: 30,
    tag: "Maximum Yield",
  },
];

export default function ProfitCalculator() {
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig>(CALCULATOR_PLANS[1]); // Default to Standard ($500)
  const [amount, setAmount] = useState<number>(500);

  const handlePlanChange = (plan: PlanConfig) => {
    setSelectedPlan(plan);
    if (amount < plan.min) setAmount(plan.min);
    if (amount > plan.max) setAmount(plan.max);
  };

  const netProfit = (amount * selectedPlan.roiPercentage) / 100;
  const totalReturn = amount + netProfit;
  const dailyProfit = netProfit / selectedPlan.durationDays;

  return (
    <section id="calculator" className="py-24 bg-[#f8fafc] border-y border-gray-200/80 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Interactive Profit Forecaster</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0a0a0a] tracking-tight"
          >
            Calculate Your Return on Investment
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-[#4b5563]"
          >
            Select your preferred strategy and adjust the deposit to preview your exact expected payout.
          </motion.p>
        </div>

        {/* Main Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {/* Plan Selector Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 p-3 bg-gray-50/80 border-b border-gray-200 gap-2">
            {CALCULATOR_PLANS.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => handlePlanChange(plan)}
                  className={`flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl transition-all duration-200 text-center relative ${
                    isSelected
                      ? "bg-white text-blue-700 shadow-md border border-gray-200/90 font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">{plan.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200/80 text-gray-600"
                      }`}
                    >
                      {plan.tag}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">
                    +{plan.roiPercentage}% in {plan.durationDays} Days
                  </span>
                </button>
              );
            })}
          </div>

          {/* Calculator Body */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Sliders & Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-900">Deposit Amount</label>
                  <span className="text-xs text-gray-500 font-medium">
                    Range: ${selectedPlan.min.toLocaleString()} – ${selectedPlan.max.toLocaleString()}
                  </span>
                </div>

                {/* Amount Input Display */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-bold text-lg">
                    $
                  </div>
                  <input
                    type="number"
                    min={selectedPlan.min}
                    max={selectedPlan.max}
                    value={amount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAmount(val);
                    }}
                    className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-2xl text-2xl font-extrabold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Range Slider */}
              <div>
                <input
                  type="range"
                  min={selectedPlan.min}
                  max={selectedPlan.max}
                  step={selectedPlan.min >= 1000 ? 100 : 25}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-gray-400 font-semibold mt-1.5">
                  <span>${selectedPlan.min.toLocaleString()}</span>
                  <span>Mid: ${Math.round((selectedPlan.min + selectedPlan.max) / 2).toLocaleString()}</span>
                  <span>${selectedPlan.max.toLocaleString()}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
                <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
                  <span className="text-xs text-gray-500 block">ROI Rate</span>
                  <span className="text-base font-extrabold text-blue-700">+{selectedPlan.roiPercentage}%</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-gray-500 block">Term</span>
                  <span className="text-base font-bold text-gray-900">{selectedPlan.durationDays} Days</span>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                  <span className="text-xs text-gray-500 block">Compounding</span>
                  <span className="text-base font-bold text-emerald-700">Daily</span>
                </div>
              </div>
            </div>

            {/* Right Column: Earnings Summary Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
              {/* Subtle visual glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -z-0" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Yield Breakdown</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    <Zap className="h-3 w-3" /> Guaranteed ROI
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Principal Deposit:</span>
                    <span className="font-semibold text-white">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Daily Profit (~):</span>
                    <span className="font-semibold text-emerald-400">+${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Net Profit Earned:</span>
                    <span className="font-bold text-emerald-400">+${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Total Payout Big Display */}
                <div className="pt-4 border-t border-gray-800">
                  <span className="text-xs font-medium text-gray-400 block mb-1">Total Payout at Maturity</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300">
                    ${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 mt-2"
                >
                  Invest In This Plan <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  <span>Instant withdrawals upon contract completion</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
