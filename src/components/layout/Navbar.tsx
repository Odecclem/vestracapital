"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Plans", href: "/#plans" },
    { name: "FAQs", href: "/faqs" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed w-full bg-white border-b border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Logo size="md" variant="horizontal" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#374151] hover:text-[#1d4ed8] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-[#374151] px-3 py-2 font-medium">
                    <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#1d4ed8]">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm max-w-[120px] truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center text-[#374151] hover:text-[#1d4ed8] px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[#374151] hover:text-[#1d4ed8] px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#1d4ed8] hover:bg-[#3b82f6] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#374151] hover:text-[#1d4ed8] focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
            {user && (
              <div className="flex items-center space-x-3 px-3 py-4 border-b border-gray-100 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#1d4ed8]">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#0a0a0a]">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-[#6b7280]">
                    {user.email}
                  </span>
                </div>
              </div>
            )}
            
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-3 text-base font-medium text-[#374151] hover:text-[#1d4ed8] hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col space-y-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center px-3 py-3 text-base font-medium text-[#1d4ed8] bg-[#eff6ff] rounded-md shadow-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-center px-3 py-3 text-base font-medium text-[#374151] hover:text-[#1d4ed8] bg-gray-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block text-center px-3 py-3 text-base font-medium text-white bg-[#1d4ed8] hover:bg-[#3b82f6] rounded-md shadow-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
