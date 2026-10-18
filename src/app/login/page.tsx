"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const { login, resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      return setError("Please enter your email and password");
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === "auth/invalid-credential" || firebaseErr.code === "auth/user-not-found" || firebaseErr.code === "auth/wrong-password") {
        setError("Invalid email or password");
      } else if (firebaseErr.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    
    if (!email) {
      return setError("Please enter your email address first to reset your password");
    }

    try {
      setResetLoading(true);
      await resetPassword(email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Logo variant="full" size="md" />
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-[#0a0a0a]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#6b7280]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#1d4ed8] hover:text-[#3b82f6] transition-colors">
            Sign Up
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:rounded-2xl sm:px-10 border border-[#e5e7eb]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center text-sm">
                <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                {error}
              </div>
            )}
            
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 flex items-center text-sm">
                <CheckCircle2 className="h-5 w-5 mr-2 shrink-0" />
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#374151]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8] sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#374151]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8] sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#1d4ed8] focus:ring-[#1d4ed8]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#374151]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="font-medium text-[#1d4ed8] hover:text-[#3b82f6] focus:outline-none disabled:opacity-70"
                >
                  {resetLoading ? "Sending..." : "Forgot Password?"}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-[#1d4ed8] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3b82f6] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
