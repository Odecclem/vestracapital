"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CopyTradingFeature() {
  const features = [
    {
      title: "Top Tier Experts",
      description: "Mirror trades from our vetted list of professional traders with proven, high win-rate strategies.",
      icon: <Users className="h-6 w-6 text-[#1d4ed8]" />,
    },
    {
      title: "Automated Profits",
      description: "Once you allocate funds, every trade the expert makes is instantly replicated in your account.",
      icon: <TrendingUp className="h-6 w-6 text-[#1d4ed8]" />,
    },
    {
      title: "Secure & Transparent",
      description: "You remain in full control of your funds. See every past trade, win rate, and risk level before copying.",
      icon: <ShieldCheck className="h-6 w-6 text-[#1d4ed8]" />,
    },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Side: Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-[#0a0a0a]"
            >
              Maximize Returns with <span className="text-[#1d4ed8]">Copy Trading</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-[#6b7280]"
            >
              Don't have the time to analyze the markets? Let the experts do the heavy lifting. 
              Our Copy Trading feature allows you to automatically mirror the portfolios of elite traders. 
              Start with a minimum funding of $5,000 and leverage strategies boasting over 90% win rates.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 space-y-6"
            >
              {features.map((feature, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-12 h-12 bg-[#eff6ff] rounded-xl flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0a0a0a]">{feature.title}</h4>
                    <p className="mt-1 text-[#6b7280]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#1d4ed8] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1e40af] transition-colors shadow-lg hover:shadow-xl"
              >
                Start Copy Trading
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Visual / Graphic */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] p-8 md:p-12 border border-[#bfdbfe] shadow-2xl">
              {/* Dummy UI of a trader card */}
              <div className="bg-white rounded-xl shadow-lg p-6 relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                       <Users className="h-6 w-6 text-gray-500"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0a0a0a]">Alex Sterling</h3>
                      <span className="text-xs text-[#16a34a] bg-green-50 px-2 py-0.5 rounded font-semibold">Verified Pro</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-[#6b7280]">Win Rate</span>
                    <span className="font-bold text-lg text-[#0a0a0a]">94.5%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1d4ed8] w-[94.5%]"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Copiers: 4,521</span>
                    <span className="font-bold text-[#1d4ed8]">Min: $5,000</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 relative z-0 transform rotate-3 mt-[-40px] opacity-90 blur-[1px]">
                 <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                       <Users className="h-6 w-6 text-gray-500"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0a0a0a]">Sarah Jenkins</h3>
                      <span className="text-xs text-[#16a34a] bg-green-50 px-2 py-0.5 rounded font-semibold">Verified Pro</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-[#6b7280]">Win Rate</span>
                    <span className="font-bold text-lg text-[#0a0a0a]">91.2%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1d4ed8] w-[91.2%]"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b7280]">Copiers: 2,105</span>
                    <span className="font-bold text-[#1d4ed8]">Min: $5,000</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative dots */}
              <div className="absolute top-4 right-4 grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#3b82f6] opacity-30"></div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
