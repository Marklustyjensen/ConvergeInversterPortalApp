export default function DocumentTab() {
  return (
    <>
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
    </>
  );
}
