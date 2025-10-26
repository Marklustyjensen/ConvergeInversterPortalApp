"use client";

interface AdminMenuTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminMenuTabs({
  activeTab,
  setActiveTab,
}: AdminMenuTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "properties", label: "Properties", icon: "🏢" },
    { id: "documents", label: "Documents", icon: "📄" },
    { id: "budgets", label: "Budgets", icon: "💰" },
    { id: "messages", label: "Messages", icon: "✉️" },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
