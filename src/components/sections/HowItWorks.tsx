"use client";

import { motion } from "framer-motion";
import { UserPlus, Wallet, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create an Account",
      description: "Sign up in less than 2 minutes. Verify your identity to ensure the highest level of security for your account.",
      icon: <UserPlus className="h-6 w-6 text-[#1d4ed8]" />,
    },
    {
      number: "02",
      title: "Fund Your Wallet",
      description: "Deposit funds using your preferred cryptocurrency or fiat method. Your assets are secured instantly.",
      icon: <Wallet className="h-6 w-6 text-[#1d4ed8]" />,
    },
    {
      number: "03",
      title: "Earn Profits",
      description: "Select an investment plan and watch your portfolio grow with daily returns directly to your dashboard.",
      icon: <TrendingUp className="h-6 w-6 text-[#1d4ed8]" />,
    },
  ];

  return (
    <section className="py-24 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-[#0a0a0a]"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-[#6b7280] max-w-2xl mx-auto"
          >
            Start your journey to financial freedom in three simple steps.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-[#e5e7eb] z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 bg-white rounded-full border-4 border-[#eff6ff] flex items-center justify-center shadow-lg relative mb-6">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#1d4ed8] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.number}
                  </div>
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-bold text-[#0a0a0a] mb-3">{step.title}</h3>
                <p className="text-[#374151] leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
