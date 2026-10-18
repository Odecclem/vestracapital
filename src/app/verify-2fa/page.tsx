"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { KeyRound, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Verify2FAPage() {
  const { user, userData, loading, is2faVerified, setIs2faVerified } = useAuth();
  const router = useRouter();
  
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const hasSentInitialCode = useRef(false);

  useEffect(() => {
    // If not logged in, go to login
    if (!loading && !user) {
      router.push("/login");
    }
    // If already verified or 2FA disabled, go to dashboard
    if (!loading && user) {
      if (is2faVerified || !userData?.twoFactorEnabled) {
        router.push("/dashboard");
      } else if (!hasSentInitialCode.current) {
        // Send initial code
        hasSentInitialCode.current = true;
        handleSendCode();
      }
    }
  }, [user, userData, loading, is2faVerified, router]);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendCode = async () => {
    if (!user) return;
    try {
      setSending(true);
      setError("");
      setMessage("");
      
      const newCode = generateCode();
      await setDoc(doc(db, "2fa_codes", user.uid), {
        email: user.email,
        code: newCode,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins from now
      });

      setMessage("A verification code has been sent to your email.");
    } catch (err) {
      console.error("Error sending 2FA code:", err);
      setError("Failed to send verification code.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || code.length !== 6) return;

    try {
      setVerifying(true);
      setError("");

      const docRef = doc(db, "2fa_codes", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Check expiration
        const now = new Date();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        
        if (now > expiresAt) {
          setError("Verification code has expired. Please request a new one.");
          return;
        }

        if (data.code === code) {
          // Success
          setIs2faVerified(true);
          router.push("/dashboard");
        } else {
          setError("Invalid verification code.");
        }
      } else {
        setError("No verification code found. Please request a new one.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred during verification.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#f8fafc]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Logo variant="full" size="md" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-[#0a0a0a] flex justify-center items-center gap-2">
          <KeyRound className="h-8 w-8 text-blue-600" />
          Two-Factor Auth
        </h2>
        <p className="mt-2 text-center text-sm text-[#6b7280]">
          Enter the 6-digit code sent to your email.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#e5e7eb]">
          <form className="space-y-6" onSubmit={handleVerify}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            {message && (
              <div className="bg-blue-50 text-blue-600 text-sm p-3 rounded-lg border border-blue-200">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-[#374151]">
                Verification Code
              </label>
              <div className="mt-1 relative">
                <input
                  id="code"
                  name="code"
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="appearance-none block w-full px-3 py-2 border border-[#e5e7eb] rounded-lg shadow-sm placeholder-[#9ca3af] focus:outline-none focus:ring-[#1d4ed8] focus:border-[#1d4ed8] sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d4ed8] disabled:opacity-70 transition-colors"
              >
                {verifying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending}
                className="w-full flex justify-center py-2.5 px-4 border border-[#e5e7eb] rounded-lg shadow-sm text-sm font-medium text-[#374151] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d4ed8] disabled:opacity-70 transition-colors"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
