"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

export default function InvestmentPlans() {
  const plans = [
    {
      name: "Basic Plan",
      minDeposit: "$100",
      maxDeposit: "$999",
      roi: "25%",
      duration: "7 days",
      popular: false,
    },
    {
      name: "Pro Plan",
      minDeposit: "$1,000",
      maxDeposit: "$4,999",
      roi: "75%",
      duration: "14 days",
      popular: true,
    },
    {
      name: "VIP Plan",
      minDeposit: "$5,000",
      maxDeposit: "$100,000",
      roi: "100%",
      duration: "30 days",
      popular: false,
    },
  ];

  return (
    <section id="plans" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-[#0a0a0a]"
          >
            Our Investment Plans
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-[#6b7280] max-w-2xl mx-auto"
          >
            Choose the perfect investment tier tailored to your financial goals and risk profile.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full ${
                plan.popular 
                  ? 'border-2 border-[#1d4ed8] bg-[#eff6ff]/30 transform md:-translate-y-4 shadow-[0_8px_30px_-4px_rgba(29,78,216,0.15)]' 
                  : 'border border-[#e5e7eb]'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">{plan.name}</h3>
                <div className="flex items-baseline text-[#0a0a0a]">
                  <span className="text-3xl font-extrabold tracking-tight">{plan.roi}</span>
                  <span className="ml-1 text-sm font-medium text-[#6b7280]">ROI</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                <li className="flex items-center text-sm text-[#374151]">
                  <Check className="h-5 w-5 text-[#1d4ed8] mr-3 shrink-0" />
                  <span>Min Deposit: <span className="font-semibold text-[#0a0a0a]">{plan.minDeposit}</span></span>
                </li>
                <li className="flex items-center text-sm text-[#374151]">
                  <Check className="h-5 w-5 text-[#1d4ed8] mr-3 shrink-0" />
                  <span>Max Deposit: <span className="font-semibold text-[#0a0a0a]">{plan.maxDeposit}</span></span>
                </li>
                <li className="flex items-center text-sm text-[#374151]">
                  <Check className="h-5 w-5 text-[#1d4ed8] mr-3 shrink-0" />
                  <span>Duration: <span className="font-semibold text-[#0a0a0a]">{plan.duration}</span></span>
                </li>
              </ul>

              <Link
                href="/register"
                className={`w-full py-3 px-4 rounded-lg font-medium text-center transition-colors duration-200 ${
                  plan.popular
                    ? 'bg-[#1d4ed8] hover:bg-[#3b82f6] text-white shadow-md hover:shadow-lg'
                    : 'bg-white border border-[#1d4ed8] text-[#1d4ed8] hover:bg-[#eff6ff]'
                }`}
              >
                Invest Now
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
