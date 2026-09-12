"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,#ffffff,#f0f7ff)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjksIDc4LCAyMTYsIDAuMDcpIi8+PC9zdmc+')] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0a0a0a] mb-8"
          >
            Invest Smart. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d4ed8] to-[#3b82f6]">
              Grow Wealth.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#374151] mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Join the next generation of cryptocurrency investors. Bank-grade security meets professional portfolio management to maximize your digital asset growth.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link 
              href="/register" 
              className="w-full sm:w-auto flex items-center justify-center bg-[#1d4ed8] hover:bg-[#3b82f6] text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 shadow-[0_4px_14px_0_rgba(29,78,216,0.39)] hover:shadow-[0_6px_20px_rgba(29,78,216,0.23)] hover:-translate-y-0.5"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="#plans" 
              className="w-full sm:w-auto flex items-center justify-center bg-transparent border-2 border-[#1d4ed8] text-[#1d4ed8] hover:bg-[#eff6ff] px-8 py-4 rounded-xl text-lg font-medium transition-colors duration-200"
            >
              View Plans
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
