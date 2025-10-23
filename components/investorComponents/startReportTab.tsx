import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Property } from "../../types/property";
import PropertySelector from "./PropertySelector";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  property: {
    id: string;
    name: string;
    code: string;
  };
  documentType: string;
  year: number;
  month: number;
  uploadDate: string;
}

export default function StarReportTab() {
  const { data: session } = useSession();
  const [expandedYears, setExpandedYears] = useState(new Set(["2025"])); // Start with 2025 expanded
  const [expandedMonths, setExpandedMonths] = useState(new Set()); // Track expanded months
  const [properties, setProperties] = useState<Property[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
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

  // Fetch star report documents
  useEffect(() => {
    async function fetchDocuments() {
      if (!session?.user) return;

      setDocumentsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedPropertyId) {
          params.append("propertyId", selectedPropertyId);
        }
        // Only fetch star reports for the start report tab
        params.append("documentType", "star_report");

        const response = await fetch(`/api/documents?${params}`);
        if (!response.ok) {
          console.warn("Failed to fetch documents:", response.status);
          setDocuments([]);
          return;
        }
        const documentsData = await response.json();
        setDocuments(documentsData);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setDocuments([]);
      } finally {
        setDocumentsLoading(false);
      }
    }

    fetchDocuments();
  }, [session, selectedPropertyId]);

  // Filter documents based on selected property (documents are already filtered by star_report type from API)
  const filteredDocuments = selectedPropertyId
    ? documents.filter((doc) => doc.property.id === selectedPropertyId)
    : documents;

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
      const monthNames = [
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
      const monthName = monthNames[doc.month - 1]; // API returns 1-based month

      if (!acc[doc.year]) {
        acc[doc.year] = {};
      }
      if (!acc[doc.year][monthName]) {
        acc[doc.year][monthName] = {
          monthIndex: doc.month - 1, // Convert to 0-based for sorting
          documents: [],
        };
      }
      acc[doc.year][monthName].documents.push(doc);
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

  // Helper function to get document icon and colors based on document type
  const getDocumentIcon = (documentType: string) => {
    const colorClasses = {
      red: { bg: "bg-red-100", text: "text-red-600" },
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
    };

    // Default star report icon for all star reports
    const starIcon = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    );

    return {
      icon: starIcon,
      colors: colorClasses.yellow, // Default to yellow for star reports
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

          {/* Loading state for documents */}
          {documentsLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-slate-600">Loading star reports...</p>
            </div>
          )}

          <div className="space-y-6">
            {!documentsLoading && years.length > 0 ? (
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
                                            getDocumentIcon(doc.documentType);
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
                                                {doc.name}
                                              </h5>
                                              <p className="text-xs text-slate-500 mb-3">
                                                {new Date(
                                                  doc.uploadDate
                                                ).toLocaleDateString()}{" "}
                                                •{" "}
                                                {(
                                                  doc.size /
                                                  1024 /
                                                  1024
                                                ).toFixed(1)}{" "}
                                                MB
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
