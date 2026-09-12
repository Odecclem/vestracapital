"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Briefcase, Clock, Zap } from "lucide-react";

export default function AboutUs() {
  const features = [
    {
      title: "Bank-Grade Security",
      description: "Your assets are protected with industry-leading 256-bit encryption and offline cold storage for maximum security.",
      icon: <ShieldCheck className="h-8 w-8 text-[#1d4ed8]" />,
    },
    {
      title: "Expert Management",
      description: "Our professional portfolio managers have decades of combined experience from top Wall Street firms.",
      icon: <Briefcase className="h-8 w-8 text-[#1d4ed8]" />,
    },
    {
      title: "24/7 Support",
      description: "Our dedicated support team is available round-the-clock to assist you with any questions or concerns.",
      icon: <Clock className="h-8 w-8 text-[#1d4ed8]" />,
    },
    {
      title: "Fast Withdrawals",
      description: "Experience lightning-fast liquidity. We process all withdrawal requests securely within 24 hours.",
      icon: <Zap className="h-8 w-8 text-[#1d4ed8]" />,
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-[#0a0a0a]"
          >
            Why Choose Vestra Capital
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-[#6b7280] max-w-2xl mx-auto"
          >
            We combine institutional-grade infrastructure with seamless user experience to deliver premium cryptocurrency investment services.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-[#e5e7eb] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="w-16 h-16 bg-[#eff6ff] rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0a0a0a] mb-3">
                {feature.title}
              </h3>
              <p className="text-[#374151] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
