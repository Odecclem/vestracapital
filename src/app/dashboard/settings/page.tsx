"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Settings, ShieldCheck, Upload, AlertCircle, Loader2, KeyRound, Lock } from "lucide-react";

export default function UserSettingsPage() {
  const { user, userData, changePassword } = useAuth();
  
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const kycStatus = userData?.kycStatus || "unverified";

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) return;
    if (!frontImage || !backImage) {
      return setError("Please upload both front and back of your ID.");
    }

    try {
      setLoading(true);
      
      // Upload Front
      const frontRef = ref(storage, `kyc/${user.uid}/front_${frontImage.name}`);
      await uploadBytes(frontRef, frontImage);
      const frontUrl = await getDownloadURL(frontRef);

      // Upload Back
      const backRef = ref(storage, `kyc/${user.uid}/back_${backImage.name}`);
      await uploadBytes(backRef, backImage);
      const backUrl = await getDownloadURL(backRef);

      // Update User Document
      await updateDoc(doc(db, "users", user.uid), {
        kycStatus: "pending",
        kycDocuments: {
          front: frontUrl,
          back: backUrl,
        }
      });

      setSuccess("Your KYC documents have been submitted and are pending review.");
      setFrontImage(null);
      setBackImage(null);
    } catch (err: unknown) {
      console.error("KYC Upload Error:", err);
      setError("Failed to upload documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!user) return;
    try {
      const newValue = !userData?.twoFactorEnabled;
      await updateDoc(doc(db, "users", user.uid), {
        twoFactorEnabled: newValue
      });
    } catch (err) {
      console.error("Failed to toggle 2FA", err);
      alert("Failed to update 2FA settings.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      return setPasswordError("Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return setPasswordError("Password must be at least 6 characters.");
    }

    try {
      setPasswordLoading(true);
      await changePassword(newPassword);
      setPasswordSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password Change Error:", err);
      if (err.code === "auth/requires-recent-login") {
        setPasswordError("For security reasons, please log out and log back in before changing your password.");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          Settings & Verification
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and verify your identity.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gray-500" />
            Identity Verification (KYC)
          </h2>
        </div>

        <div className="p-6">
          {kycStatus === "verified" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-800 mb-1">Identity Verified</h3>
              <p className="text-sm text-green-600">Your account is fully verified. All features are unlocked.</p>
            </div>
          ) : kycStatus === "pending" ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <Loader2 className="h-12 w-12 text-yellow-500 mx-auto mb-3 animate-spin" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-1">Verification Pending</h3>
              <p className="text-sm text-yellow-600">We are reviewing your documents. This usually takes 1-2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleKycSubmit} className="space-y-6">
              {kycStatus === "rejected" && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Verification Rejected</p>
                    <p>Your previous submission was rejected. Please ensure the documents are clear, readable, and valid, then try again.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-200">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front of ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front of ID (Passport, Driver's License)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept="image/*"
                            onChange={(e) => e.target.files && setFrontImage(e.target.files[0])}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      {frontImage && <p className="text-xs font-semibold text-gray-700 mt-2">{frontImage.name}</p>}
                    </div>
                  </div>
                </div>

                {/* Back of ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back of ID
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept="image/*"
                            onChange={(e) => e.target.files && setBackImage(e.target.files[0])}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      {backImage && <p className="text-xs font-semibold text-gray-700 mt-2">{backImage.name}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Submit Documents"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2FA Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gray-500" />
            Two-Factor Authentication (2FA)
          </h2>
          <button
            onClick={handleToggle2FA}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              userData?.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={userData?.twoFactorEnabled}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                userData?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600">
            {userData?.twoFactorEnabled 
              ? "Two-factor authentication is enabled. You will receive an email code every time you log in." 
              : "Enable two-factor authentication to add an extra layer of security to your account. When enabled, you'll need to enter a verification code sent to your email during login."}
          </p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-500" />
            Change Password
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-200">
                {passwordSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordLoading || !newPassword || !confirmPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
