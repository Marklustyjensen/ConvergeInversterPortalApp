"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/adminComponents/adminHeader";
import AdminMenuTabs from "@/components/adminComponents/adminMenuTabs";
import AdminUsersTab from "@/components/adminComponents/adminUsersTab";
import AdminPropertiesTab from "@/components/adminComponents/adminPropertiesTab";
import AdminDocumentsTab from "@/components/adminComponents/adminDocumentsTab";
import AdminBudgetTab from "@/components/adminComponents/adminBudgetTab";
import AdminOverviewTab from "@/components/adminComponents/adminOverviewTab";
import AdminMessagesTab from "@/components/adminComponents/adminMessagesTab";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: false,
      });
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <AdminHeader onSignOut={handleSignOut} />

      {/* Navigation Tabs */}
      <AdminMenuTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && <AdminOverviewTab />}

        {/* Users Management Tab */}
        {activeTab === "users" && <AdminUsersTab />}

        {/* Properties Management Tab */}
        {activeTab === "properties" && <AdminPropertiesTab />}

        {/* Documents Management Tab */}
        {activeTab === "documents" && <AdminDocumentsTab />}

        {/* Budgets Management Tab */}
        {activeTab === "budgets" && <AdminBudgetTab />}

        {/* Messages Management Tab */}
        {activeTab === "messages" && <AdminMessagesTab />}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" &&
          activeTab !== "users" &&
          activeTab !== "properties" &&
          activeTab !== "documents" &&
          activeTab !== "budgets" &&
          activeTab !== "messages" && (
            <div className="luxury-card p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h2>
              <p className="text-slate-600">
                This section is under development. More features coming soon.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}
