"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, Globe2, Activity } from "lucide-react";

export default function Statistics() {
  const stats = [
    {
      label: "Investors",
      value: "10,000+",
      icon: <Users className="h-6 w-6 text-[#3b82f6]" />,
    },
    {
      label: "Invested",
      value: "$50M+",
      icon: <DollarSign className="h-6 w-6 text-[#3b82f6]" />,
    },
    {
      label: "Countries",
      value: "150+",
      icon: <Globe2 className="h-6 w-6 text-[#3b82f6]" />,
    },
    {
      label: "Uptime",
      value: "99.9%",
      icon: <Activity className="h-6 w-6 text-[#3b82f6]" />,
    },
  ];

  return (
    <section className="py-20 bg-[#111827] relative overflow-hidden">
      {/* Abstract background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm md:text-base font-medium text-gray-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
