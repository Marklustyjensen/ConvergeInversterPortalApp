import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Property } from "../../types/property";
import PropertySelector from "./PropertySelector";

interface Document {
  title: string;
  type: string;
  date: string;
  size: string;
  year: number;
  month: string;
  monthIndex: number;
  propertyId?: string | null;
  icon: string;
  color: string;
}

export default function StarReportTab() {
  const { data: session } = useSession();
  const [expandedYears, setExpandedYears] = useState(new Set(["2025"])); // Start with 2025 expanded
  const [expandedMonths, setExpandedMonths] = useState(new Set()); // Track expanded months
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties on component mount
  useEffect(() => {
    async function fetchProperties() {
      // Skip if session is still loading (undefined) vs no session (null)
      if (session === undefined) {
        return; // Still loading session
      }

      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/properties");
        if (!response.ok) {
          // Log the error but don't throw - just set empty properties array
          console.warn(
            `Failed to fetch properties: HTTP ${response.status}: ${response.statusText}`
          );
          const errorData = await response.text();
          console.warn("Error response:", errorData);
          setError(`Failed to load properties: ${response.status}`);
          setProperties([]); // Set empty array so component still works
          return;
        }
        const propertiesData = await response.json();
        setProperties(propertiesData);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load properties"
        );
        setProperties([]); // Set empty array so component still works
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [session]);

  // Generate multiple star report types for each month from July 2023 to June 2025
  const generateMonthlyStarReports = (): Document[] => {
    const documents: Document[] = [];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Document types with their characteristics for star reports
    const documentTypes = [
      {
        name: "Star Report",
        frequency: 1, // Always present
        icon: "star",
        color: "yellow",
      },
      {
        name: "Performance Analytics",
        frequency: 1, // Always present
        icon: "analytics",
        color: "blue",
      },
      {
        name: "Market Analysis",
        frequency: 0.8, // 80% chance
        icon: "market",
        color: "green",
      },
      {
        name: "Portfolio Summary",
        frequency: 0.9, // 90% chance
        icon: "portfolio",
        color: "purple",
      },
      {
        name: "Risk Assessment",
        frequency: 0.6, // 60% chance
        icon: "risk",
        color: "red",
      },
      {
        name: "Investment Forecast",
        frequency: 0.7, // 70% chance
        icon: "forecast",
        color: "indigo",
      },
    ];

    // Start from July 2023
    let year = 2023;
    let month = 6; // July is index 6 (0-based)

    // Generate until June 2025
    while (year < 2025 || (year === 2025 && month < 6)) {
      const monthName = months[month];

      // Generate documents for this month
      documentTypes.forEach((docType) => {
        // Check if this document type should be generated this month
        if (Math.random() < docType.frequency) {
          const fileSize = (Math.random() * 3 + 2.0).toFixed(1); // Random size between 2.0-5.0 MB

          // For demo purposes, randomly assign documents to properties when available
          let assignedPropertyId: string | null = null;
          let propertyName = "";

          if (properties.length > 0) {
            const randomProperty =
              properties[Math.floor(Math.random() * properties.length)];
            assignedPropertyId = randomProperty.id;
            propertyName = ` - ${randomProperty.name}`;
          }

          documents.push({
            title: `${monthName} ${year} ${docType.name}${propertyName}`,
            type: docType.name,
            date: `${monthName.substring(0, 3)} ${Math.floor(Math.random() * 28) + 1}, ${year}`,
            size: `${fileSize} MB`,
            year: year,
            month: monthName,
            monthIndex: month,
            propertyId: assignedPropertyId,
            icon: docType.icon,
            color: docType.color,
          });
        }
      });

      // Move to next month
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }

    // Sort by year and month (most recent first)
    return documents.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.monthIndex - a.monthIndex;
    });
  };

  // Use useMemo to regenerate documents when properties change
  const allDocuments = useMemo(() => {
    return generateMonthlyStarReports();
  }, [properties]);

  // Filter documents based on selected property
  const filteredDocuments = selectedPropertyId
    ? allDocuments.filter((doc) => doc.propertyId === selectedPropertyId)
    : allDocuments;

  // Group documents by year and then by month
  const documentsByYearAndMonth = filteredDocuments.reduce(
    (
      acc: {
        [key: number]: {
          [key: string]: { monthIndex: number; documents: Document[] };
        };
      },
      doc
    ) => {
      if (!acc[doc.year]) {
        acc[doc.year] = {};
      }
      if (!acc[doc.year][doc.month]) {
        acc[doc.year][doc.month] = {
          monthIndex: doc.monthIndex,
          documents: [],
        };
      }
      acc[doc.year][doc.month].documents.push(doc);
      return acc;
    },
    {}
  );

  // Sort years in descending order (newest first)
  const years = Object.keys(documentsByYearAndMonth).sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  const toggleYear = (year: string) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  const toggleMonth = (year: string, month: string) => {
    const monthKey = `${year}-${month}`;
    const newExpandedMonths = new Set(expandedMonths);
    if (newExpandedMonths.has(monthKey)) {
      newExpandedMonths.delete(monthKey);
    } else {
      newExpandedMonths.add(monthKey);
    }
    setExpandedMonths(newExpandedMonths);
  };

  // Helper function to get document icon and colors
  const getDocumentIcon = (iconType: string, color: string) => {
    const colorClasses = {
      red: { bg: "bg-red-100", text: "text-red-600" },
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
    };

    const icons = {
      star: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      ),
      analytics: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      market: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      ),
      portfolio: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      ),
      risk: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      ),
      forecast: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      ),
    };

    return {
      icon: icons[iconType as keyof typeof icons] || icons.star,
      colors:
        colorClasses[color as keyof typeof colorClasses] || colorClasses.yellow,
    };
  };

  return (
    <>
      <div className="space-y-8">
        <div className="luxury-card p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Star Report Documents
          </h2>
          <p className="text-slate-600 mb-6">
            Access your star reports organized by year and month. Each month may
            contain multiple report types including star reports, performance
            analytics, market analysis, portfolio summaries, risk assessments,
            and investment forecasts.
          </p>

          {/* Property Selector */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Note: {error}. Showing sample reports for demonstration.
              </p>
            </div>
          )}
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={setSelectedPropertyId}
            loading={loading}
          />

          <div className="space-y-6">
            {years.length > 0 ? (
              years.map((year) => {
                const yearData = documentsByYearAndMonth[parseInt(year)];
                const totalDocuments = Object.values(yearData).reduce(
                  (sum, monthData) => sum + monthData.documents.length,
                  0
                );

                return (
                  <div
                    key={year}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    {/* Year Header */}
                    <button
                      onClick={() => toggleYear(year)}
                      className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-slate-800">
                          {year}
                        </h3>
                        <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-full text-sm">
                          {totalDocuments} report
                          {totalDocuments !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-500 transition-transform ${
                          expandedYears.has(year) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Months in Year */}
                    {expandedYears.has(year) && (
                      <div className="bg-white">
                        {Object.entries(yearData)
                          .sort(([, a], [, b]) => b.monthIndex - a.monthIndex)
                          .map(([month, monthData]) => {
                            const monthKey = `${year}-${month}`;
                            return (
                              <div
                                key={monthKey}
                                className="border-t border-slate-100 first:border-t-0"
                              >
                                {/* Month Header */}
                                <button
                                  onClick={() => toggleMonth(year, month)}
                                  className="w-full px-8 py-3 bg-slate-25 hover:bg-slate-50 transition-colors flex items-center justify-between"
                                >
                                  <div className="flex items-center space-x-3">
                                    <h4 className="text-lg font-medium text-slate-700">
                                      {month}
                                    </h4>
                                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">
                                      {monthData.documents.length} report
                                      {monthData.documents.length !== 1
                                        ? "s"
                                        : ""}
                                    </span>
                                  </div>
                                  <svg
                                    className={`w-4 h-4 text-slate-400 transition-transform ${
                                      expandedMonths.has(monthKey)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>

                                {/* Documents Grid */}
                                {expandedMonths.has(monthKey) && (
                                  <div className="px-8 pt-4 pb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {monthData.documents.map(
                                        (doc: Document, index: number) => {
                                          const { icon, colors } =
                                            getDocumentIcon(
                                              doc.icon,
                                              doc.color
                                            );
                                          return (
                                            <div
                                              key={`${monthKey}-${index}`}
                                              className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                              <div className="flex items-start justify-between mb-3">
                                                <div
                                                  className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}
                                                >
                                                  <svg
                                                    className={`w-5 h-5 ${colors.text}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    {icon}
                                                  </svg>
                                                </div>
                                                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                  {doc.type}
                                                </span>
                                              </div>
                                              <h5 className="font-medium text-slate-800 mb-2 text-sm leading-tight">
                                                {doc.title}
                                              </h5>
                                              <p className="text-xs text-slate-500 mb-3">
                                                {doc.date} • {doc.size}
                                              </p>
                                              <button className="w-full py-2 px-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                                Download
                                              </button>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">
                  {selectedPropertyId
                    ? "No star reports found for the selected property."
                    : "No star reports available."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
