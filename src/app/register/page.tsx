"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (!agreeTerms) {
      return setError("You must agree to the Terms & Conditions");
    }

    try {
      setLoading(true);
      await register(email, password, fullName, refCode);
      router.push("/verify-email");
    } catch (err: unknown) {
      console.error("Firebase registration error:", err);
      const firebaseErr = err as { code?: string, message?: string };
      if (firebaseErr.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (firebaseErr.code === "auth/weak-password") {
        setError("Password must be at least 6 characters");
      } else if (firebaseErr.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError(firebaseErr.message || "Failed to create an account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center text-sm">
          <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {refCode && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 text-sm flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 shrink-0 text-blue-500" />
          You have been referred by {refCode}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-[#374151]">
          Full Name
        </label>
        <div className="mt-1">
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8] sm:text-sm"
            placeholder="John Doe"
          />
        </div>
      </div>

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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8] sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#374151]">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#1d4ed8] focus:outline-none focus:ring-[#1d4ed8] sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="agreeTerms"
          name="agreeTerms"
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#1d4ed8] focus:ring-[#1d4ed8]"
        />
        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-[#374151]">
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-[#1d4ed8] hover:text-[#3b82f6]">
            Terms & Conditions
          </Link>
        </label>
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
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </form>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center text-3xl font-bold tracking-tight text-[#0a0a0a]">
          Vestra Capital
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-[#0a0a0a]">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-[#6b7280]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#1d4ed8] hover:text-[#3b82f6] transition-colors">
            Sign In
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:rounded-2xl sm:px-10 border border-[#e5e7eb]">
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
