import PropertyCard from "./propertyCard";

export default function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="luxury-card p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Welcome to Your Investment Portal
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Monitor your hospitality investments, track performance, and access
            all your financial documents in one secure location. Your portfolio
            is professionally managed by the Converge Hospitality team.
          </p>
        </div>
      </div>

      {/* Properties Section */}
      <div className="luxury-card p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">
          Your Hotel Properties
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PropertyCard />
          <PropertyCard />
          <PropertyCard />
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="luxury-card p-8">
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
      </div> */}
    </div>
  );
}
