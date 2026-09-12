"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { UserCircle, Loader2, Mail, Hash, Calendar, Wallet } from "lucide-react";
import Toast, { ToastState } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    if (userData?.fullName) {
      setFullName(userData.fullName);
    } else if (user?.displayName) {
      setFullName(user.displayName);
    }
    
    if (userData) {
      setAddress(userData.address || "");
      setCity(userData.city || "");
      setStateRegion(userData.state || "");
      setZip(userData.zip || "");
      setCountry(userData.country || "");
    }
  }, [userData, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      setToast({ isOpen: true, message: "Full Name is required.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: fullName });
      
      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        address: address,
        city: city,
        state: stateRegion,
        zip: zip,
        country: country
      });

      setToast({ isOpen: true, message: "Profile updated successfully.", type: "success" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setToast({ isOpen: true, message: "Failed to update profile.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return "—";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };
  
  const hasChanges = () => {
    if (!userData) return false;
    return (
      fullName !== userData.fullName ||
      address !== (userData.address || "") ||
      city !== (userData.city || "") ||
      stateRegion !== (userData.state || "") ||
      zip !== (userData.zip || "") ||
      country !== (userData.country || "")
    );
  };

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {toast.isOpen && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isOpen: false })}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-blue-600" />
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your account details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {userData.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{userData.fullName || "User"}</h2>
            <p className="text-sm text-gray-500 mb-4 capitalize">{userData.role || "User"}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
              <Wallet className="h-4 w-4" />
              {formatCurrency(userData.walletBalance)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div>
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Mail className="h-4 w-4 mr-2" /> Email Address
              </div>
              <div className="text-sm text-gray-900">{user.email}</div>
            </div>
            <div>
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Hash className="h-4 w-4 mr-2" /> Referral Code
              </div>
              <div className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded inline-block">
                {userData.referralCode || "N/A"}
              </div>
            </div>
            <div>
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Calendar className="h-4 w-4 mr-2" /> Joined Date
              </div>
              <div className="text-sm text-gray-900">{formatDate(userData.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-gray-400 text-xs font-normal">(Cannot be changed)</span>
                  </label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your street address"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="State or Province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      id="zip"
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="ZIP or Postal Code"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !fullName.trim() || !hasChanges()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

