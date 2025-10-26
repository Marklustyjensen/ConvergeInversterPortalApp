"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
}

interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function MyProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordUpdate>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
        setProfileForm({
          name: userData.name || "",
          email: userData.email || "",
        });
      } else {
        showMessage("error", "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showMessage("error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      showMessage("error", "Name and email are required");
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditingProfile(false);
        showMessage("success", "Profile updated successfully");
      } else {
        const errorData = await response.json();
        showMessage("error", errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage("error", "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showMessage("error", "All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
        showMessage("success", "Password changed successfully");
      } else {
        const errorData = await response.json();
        showMessage("error", errorData.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage("error", "Failed to change password");
    }
  };

  if (loading) {
    return (
      <div className="luxury-card p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="luxury-card p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Profile Not Found
        </h2>
        <p className="text-slate-600">
          Unable to load your profile information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <div className="luxury-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Profile Information
          </h2>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-sm text-slate-500 mt-1">
                Username cannot be changed
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileForm({
                    name: profile.name || "",
                    email: profile.email || "",
                  });
                }}
                className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <p className="text-slate-900">
                  {profile.name || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <p className="text-slate-900">{profile.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <p className="text-slate-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Member Since
                </label>
                <p className="text-slate-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="luxury-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Change Password</h2>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword ? (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your new password (min. 6 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm your new password"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-slate-600">
              Click "Change Password" to update your account password. You'll
              need to provide your current password for security.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
