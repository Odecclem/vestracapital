"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, reloadUser } = useAuth();
  const router = useRouter();

  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    try {
      setResending(true);
      setError(null);
      setMessage(null);
      await sendVerificationEmail();
      setMessage("A fresh verification link has been sent to your email!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend email. Please try again shortly.";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      setError(null);
      setMessage(null);
      await reloadUser();
      if (user?.emailVerified) {
        setMessage("Email successfully verified! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError("Your email is not verified yet. Please open the link in your email inbox and try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error checking verification status.";
      setError(msg);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo variant="full" size="md" />
        </div>
        <div className="mt-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Mail className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#0a0a0a]">
          Verify your email address
        </h2>
        <p className="mt-2 text-sm text-[#6b7280] max-w-sm mx-auto">
          We sent a verification link to{" "}
          <span className="font-semibold text-gray-900">{user?.email || "your email"}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:rounded-2xl sm:px-10 border border-[#e5e7eb] space-y-6">
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 flex items-center text-sm">
              <CheckCircle2 className="h-5 w-5 mr-2 shrink-0" />
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 flex items-center text-sm">
              <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600 space-y-2">
            <p className="font-medium text-gray-800">What to do next:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open your email inbox (and check Spam/Junk if needed).</li>
              <li>Click the verification link from <strong>Vestra Capital</strong>.</li>
              <li>Return to this page and click <strong>&quot;I have verified my email&quot;</strong> below.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d4ed8] disabled:opacity-70 transition-colors"
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking status...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  I have verified my email
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-70"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending email...
                </>
              ) : (
                "Resend verification email"
              )}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4 text-center">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#1d4ed8] hover:text-[#1e40af] inline-flex items-center gap-1 transition-colors"
            >
              Skip to Dashboard for now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
