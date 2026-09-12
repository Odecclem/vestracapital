"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "David Chen",
      country: "🇸🇬", // Singapore
      role: "VIP Investor",
      text: "Vestra Capital delivered exactly what they promised. My VIP investment of $10,000 yielded a 100% ROI in just 30 days. Fast withdrawals and excellent support!",
      rating: 5,
    },
    {
      name: "Sarah Jenkins",
      country: "🇬🇧", // UK
      role: "Pro Investor",
      text: "I invested $1,000 in the Pro Plan, and after 14 days, I received my principal plus a $750 profit directly to my Bitcoin wallet. This platform is life-changing!",
      rating: 5,
    },
    {
      name: "Michael R.",
      country: "🇨🇦", // Canada
      role: "Basic Investor",
      text: "Started with the Basic Plan with $500 to test the waters. Within 7 days, my balance grew to $625 with the 25% ROI. The process is completely transparent and reliable.",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-[#0a0a0a]"
          >
            Trusted by Investors Worldwide
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-[#6b7280] max-w-2xl mx-auto"
          >
            Don&apos;t just take our word for it. Here&apos;s what our clients have to say about their experience with Vestra Capital.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-[#e5e7eb] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col h-full"
            >
              <div className="flex text-[#1d4ed8] mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-[#374151] italic mb-8 flex-1 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#eff6ff] rounded-full flex items-center justify-center text-xl mr-4">
                  {testimonial.country}
                </div>
                <div>
                  <h4 className="font-bold text-[#0a0a0a]">{testimonial.name}</h4>
                  <span className="text-sm text-[#6b7280]">{testimonial.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
