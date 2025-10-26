"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/investorComponents/header";
import DashboardMenuTabs from "@/components/investorComponents/menuTabs";
import OverviewTab from "@/components/investorComponents/overviewTab";
import DocumentTab from "@/components/investorComponents/documentTab";
import StarReportTab from "@/components/investorComponents/startReportTab";
import BudgetTab from "@/components/investorComponents/budgetTab";
import MessageTab from "@/components/investorComponents/messageTab";
import MyProfile from "@/components/investorComponents/myProfile";
import { Property } from "@/types/property";

export default function InvestorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchUserProperties() {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/properties");
        if (response.ok) {
          const propertiesData = await response.json();
          setUserProperties(propertiesData);
        }
      } catch (error) {
        console.error("Error fetching user properties:", error);
      }
    }

    fetchUserProperties();
  }, [session]);

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

        {/* Budget Tab */}
        {activeTab === "budgets" && <BudgetTab />}

        {/* Documents Tab */}
        {activeTab === "documents" && <DocumentTab />}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <MessageTab userProperties={userProperties} />
        )}

        {/* My Profile Tab */}
        {activeTab === "my profile" && <MyProfile />}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" &&
          activeTab !== "documents" &&
          activeTab !== "star report" &&
          activeTab !== "budgets" &&
          activeTab !== "messages" &&
          activeTab !== "my profile" && (
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
