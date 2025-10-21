"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/investorComponents/header";
import DashboardMenuTabs from "@/components/investorComponents/menuTabs";
import OverviewTab from "@/components/investorComponents/overviewTab";
import DocumentTab from "@/components/investorComponents/documentTab";
import StarReportTab from "@/components/investorComponents/startReportTab";

export default function InvestorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: false,
      });
      // Explicitly navigate to the home page after sign out
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: still try to navigate to home
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <DashboardHeader onSignOut={handleSignOut} />

      {/* Navigation Tabs */}
      <DashboardMenuTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && <OverviewTab />}

        {/* Star Report Tab */}
        {activeTab === "star report" && <StarReportTab />}

        {/* Documents Tab */}
        {activeTab === "documents" && <DocumentTab />}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" &&
          activeTab !== "documents" &&
          activeTab !== "star report" && (
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
