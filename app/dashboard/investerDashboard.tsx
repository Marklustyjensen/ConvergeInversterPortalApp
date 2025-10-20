"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function InvesterDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <img
                src="/images/Logo.jpg"
                alt="Converge Hospitality"
                className="w-10 h-10 object-contain rounded-lg"
              />
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Investor Portal
                </h1>
                <p className="text-sm text-slate-500">Converge Hospitality</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  Welcome back
                </p>
                <p className="text-xs text-slate-500">
                  Last login: Oct 20, 2025
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 
                         border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Portfolio Overview", icon: "📊" },
              { id: "performance", label: "Performance", icon: "📈" },
              { id: "documents", label: "Documents", icon: "📄" },
              { id: "statements", label: "Statements", icon: "🧾" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="luxury-card p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">
                  Welcome to Your Investment Portal
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Monitor your hospitality investments, track performance, and
                  access all your financial documents in one secure location.
                  Your portfolio is professionally managed by the Converge
                  Hospitality team.
                </p>
              </div>
            </div>

            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="luxury-card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">
                      Total Investment
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      $2,450,000
                    </p>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">
                      Current Value
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      $2,847,300
                    </p>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">
                      Total Return
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      +$397,300
                    </p>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 13v-1a4 4 0 014-4 4 4 0 014 4v1m0 4H8m8-4v4H8v-4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-500">ROI</p>
                    <p className="text-2xl font-bold text-green-600">+16.2%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Section */}
            <div className="luxury-card p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">
                Your Hotel Properties
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        Grand Resort & Spa
                      </h4>
                      <p className="text-slate-500">
                        Luxury Resort • Miami, FL
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Investment Amount:</span>
                      <span className="font-semibold">$1,200,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Value:</span>
                      <span className="font-semibold text-green-600">
                        $1,425,600
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Annual Yield:</span>
                      <span className="font-semibold">8.4%</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        Metropolitan Business Hotel
                      </h4>
                      <p className="text-slate-500">
                        Business Hotel • New York, NY
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Investment Amount:</span>
                      <span className="font-semibold">$1,250,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Value:</span>
                      <span className="font-semibold text-green-600">
                        $1,421,700
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Annual Yield:</span>
                      <span className="font-semibold">7.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="luxury-card p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      Q3 2025 Financial Report Available
                    </p>
                    <p className="text-sm text-slate-500">October 15, 2025</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      Quarterly Distribution Payment
                    </p>
                    <p className="text-sm text-slate-500">
                      October 1, 2025 • $45,230
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-8">
            <div className="luxury-card p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Financial Documents
              </h2>
              <p className="text-slate-600 mb-8">
                Access your investment documents, financial reports, and tax
                statements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Q3 2025 Financial Report",
                    type: "PDF",
                    date: "Oct 15, 2025",
                    size: "2.4 MB",
                  },
                  {
                    title: "Tax Statement 2024",
                    type: "PDF",
                    date: "Mar 15, 2025",
                    size: "1.8 MB",
                  },
                  {
                    title: "Investment Agreement",
                    type: "PDF",
                    date: "Jan 10, 2024",
                    size: "3.2 MB",
                  },
                  {
                    title: "Q2 2025 Performance Report",
                    type: "PDF",
                    date: "Jul 15, 2025",
                    size: "2.1 MB",
                  },
                  {
                    title: "Property Valuation Report",
                    type: "PDF",
                    date: "Sep 1, 2025",
                    size: "4.7 MB",
                  },
                  {
                    title: "Dividend History",
                    type: "PDF",
                    date: "Dec 31, 2024",
                    size: "1.2 MB",
                  },
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {doc.title}
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">
                      {doc.date} • {doc.size}
                    </p>
                    <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" && activeTab !== "documents" && (
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
