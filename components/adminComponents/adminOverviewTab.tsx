"use client";

import { useState, useEffect } from "react";

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalInvestors: number;
  recentActivity: string[];
}

export default function AdminOverviewTab() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalInvestors: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="luxury-card p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Welcome to the Admin Dashboard
        </h2>
        <p className="text-slate-600">
          Manage users, properties, and documents from this central hub.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Properties</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalProperties}
              </p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">
                Active Investors
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalInvestors}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2 p-4">
            <span>➕</span>
            <span>Add New User</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2 p-4">
            <span>🏢</span>
            <span>Add New Property</span>
          </button>
          <button className="btn-primary flex items-center justify-center space-x-2 p-4">
            <span>📄</span>
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Recent Activity
        </h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-slate-700">{activity}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">
            No recent activity to display.
          </p>
        )}
      </div>
    </div>
  );
}
