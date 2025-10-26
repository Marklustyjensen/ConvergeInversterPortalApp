interface MenuTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MenuTabs({ activeTab, setActiveTab }: MenuTabsProps) {
  return (
    <>
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Portfolio Overview", icon: "📊" },
              { id: "star report", label: "Star Report", icon: "📈" },
              { id: "documents", label: "Documents", icon: "📄" },
              { id: "budgets", label: "Budgets", icon: "💰" },
              { id: "messages", label: "Messages", icon: "✉️" },
              // { id: "statements", label: "Statements", icon: "🧾" },
              // { id: "settings", label: "Settings", icon: "⚙️" },
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
    </>
  );
}
