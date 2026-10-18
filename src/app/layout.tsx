import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { AuthProvider } from "@/contexts/AuthContext";
import TawkToScript from "@/components/layout/TawkToScript";
import SupportChatbot from "@/components/ui/SupportChatbot";

export const metadata: Metadata = {
  title: "Vestra Capital - Invest Smart. Grow Wealth.",
  description: "Production-ready cryptocurrency investment platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <SupportChatbot />
          <TawkToScript />
        </AuthProvider>
      </body>
    </html>
  );
}
