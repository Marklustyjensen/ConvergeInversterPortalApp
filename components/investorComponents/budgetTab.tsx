import { useState, useEffect } from "react";
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

export default function BudgetTab() {
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
        // Only fetch budgets for the budget tab
        params.append("documentType", "budget");

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
  const filteredDocuments = documents;

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

  const getDocumentIcon = (documentType: string) => {
    const types: Record<string, { bg: string; text: string }> = {
      financial: {
        bg: "bg-blue-100",
        text: "text-blue-600",
      },
      star_report: {
        bg: "bg-yellow-100",
        text: "text-yellow-600",
      },
    };

    return types[documentType] || types.star_report;
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("document") || type.includes("word")) return "📝";
    if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📊";
    return "📁";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getDocumentTypeDisplay = (type: string) => {
    return type === "financial" ? "Financial Document" : "Star Report";
  };

  if (loading) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading budgets...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="text-slate-400 text-6xl mb-4">🔐</div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Authentication Required
        </h3>
        <p className="text-slate-600">Please log in to access your budgets.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Error Loading Data
        </h3>
        <p className="text-slate-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="luxury-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Budgets</h2>
            <p className="text-slate-600">
              View budget files for your properties
            </p>
          </div>
          <div className="md:w-64">
            <PropertySelector
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={setSelectedPropertyId}
            />
          </div>
        </div>
      </div>

      <div className="luxury-card">
        {documentsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading budgets...</p>
          </div>
        ) : years.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No Budget Files Found
            </h3>
            <p className="text-slate-600">
              {selectedPropertyId
                ? "No budgets available for the selected property."
                : "No budgets have been uploaded yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {years.map((year) => {
              const yearData = documentsByYearAndMonth[parseInt(year)];
              const isYearExpanded = expandedYears.has(year);
              const monthsInYear = Object.keys(yearData).sort(
                (a, b) => yearData[b].monthIndex - yearData[a].monthIndex
              );

              return (
                <div key={year}>
                  <button
                    onClick={() => toggleYear(year)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-slate-400">
                        {isYearExpanded ? "▼" : "▶"}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {year}
                      </h3>
                    </div>
                    <div className="text-sm text-slate-500">
                      {Object.values(yearData).reduce(
                        (total, month) => total + month.documents.length,
                        0
                      )}{" "}
                      documents
                    </div>
                  </button>

                  {isYearExpanded && (
                    <div className="bg-slate-50">
                      {monthsInYear.map((month) => {
                        const monthData = yearData[month];
                        const monthKey = `${year}-${month}`;
                        const isMonthExpanded = expandedMonths.has(monthKey);

                        return (
                          <div
                            key={month}
                            className="border-t border-slate-200"
                          >
                            <button
                              onClick={() => toggleMonth(year, month)}
                              className="w-full px-8 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="text-slate-400">
                                  {isMonthExpanded ? "▼" : "▶"}
                                </div>
                                <h4 className="font-medium text-slate-700">
                                  {month}
                                </h4>
                              </div>
                              <div className="text-sm text-slate-500">
                                {monthData.documents.length} documents
                              </div>
                            </button>

                            {isMonthExpanded && (
                              <div className="bg-white">
                                {monthData.documents.map((doc) => {
                                  const docTypeInfo = getDocumentIcon(
                                    doc.documentType
                                  );

                                  return (
                                    <div
                                      key={doc.id}
                                      className="px-10 py-4 border-t border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                          <div
                                            className={`p-2 rounded-lg ${docTypeInfo.bg}`}
                                          >
                                            <span
                                              className={`text-sm font-medium ${docTypeInfo.text}`}
                                            >
                                              {doc.documentType === "financial"
                                                ? "FIN"
                                                : "STAR"}
                                            </span>
                                          </div>

                                          <span className="text-2xl">
                                            {getFileIcon(doc.type)}
                                          </span>

                                          <div>
                                            <h5 className="font-medium text-slate-800">
                                              {doc.name}
                                            </h5>
                                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                                              <span>
                                                {getDocumentTypeDisplay(
                                                  doc.documentType
                                                )}
                                              </span>
                                              <span>•</span>
                                              <span>
                                                {formatFileSize(doc.size)}
                                              </span>
                                              <span>•</span>
                                              <span>{doc.property.name}</span>
                                              <span>•</span>
                                              <span>
                                                {new Date(
                                                  doc.uploadDate
                                                ).toLocaleDateString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                          <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                          >
                                            <span>📥</span>
                                            <span>Download</span>
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* <div className="luxury-card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Star Report Access
            </h3>
            <p className="text-blue-700">
              Star reports are organized by year and month for easy navigation.
              Use the property selector above to filter reports for a specific
              property. Star reports contain detailed property performance
              metrics, analytics, and investment insights.
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
