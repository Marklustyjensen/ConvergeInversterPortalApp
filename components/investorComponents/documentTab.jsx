import { useState, useEffect } from "react";
import React from "react";
import { useSession } from "next-auth/react";
import PropertySelector from "./PropertySelector";

export default function DocumentTab() {
  const { data: session } = useSession();
  const [expandedYears, setExpandedYears] = useState(new Set(["2025"]));
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProperties() {
      if (session === undefined) {
        return;
      }

      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/properties");
        if (!response.ok) {
          console.warn("Failed to fetch properties:", response.status);
          setError("Failed to load properties");
          setProperties([]);
          return;
        }
        const propertiesData = await response.json();
        setProperties(propertiesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(err.message || "Failed to load properties");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [session]);

  useEffect(() => {
    async function fetchDocuments() {
      if (!session?.user) return;

      setDocumentsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedPropertyId) {
          params.append("propertyId", selectedPropertyId);
        }

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

  const filteredDocuments = documents;

  const documentsByYearAndMonth = filteredDocuments.reduce((acc, doc) => {
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
    const monthName = monthNames[doc.month - 1];

    if (!acc[doc.year]) {
      acc[doc.year] = {};
    }
    if (!acc[doc.year][monthName]) {
      acc[doc.year][monthName] = {
        monthIndex: doc.month - 1,
        documents: [],
      };
    }
    acc[doc.year][monthName].documents.push(doc);
    return acc;
  }, {});

  const years = Object.keys(documentsByYearAndMonth).sort((a, b) => b - a);

  const toggleYear = (year) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  const toggleMonth = (year, month) => {
    const monthKey = `${year}-${month}`;
    const newExpandedMonths = new Set(expandedMonths);
    if (newExpandedMonths.has(monthKey)) {
      newExpandedMonths.delete(monthKey);
    } else {
      newExpandedMonths.add(monthKey);
    }
    setExpandedMonths(newExpandedMonths);
  };

  const getDocumentIcon = (documentType) => {
    const types = {
      financial: {
        bg: "bg-blue-100",
        text: "text-blue-600",
      },
      star_report: {
        bg: "bg-yellow-100",
        text: "text-yellow-600",
      },
    };

    return types[documentType] || types.financial;
  };

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("document") || type.includes("word")) return "📝";
    if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📊";
    return "📁";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getDocumentTypeDisplay = (type) => {
    return type === "financial" ? "Financial Document" : "Star Report";
  };

  if (loading) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading documents...</p>
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
        <p className="text-slate-600">
          Please log in to access your documents.
        </p>
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
            <h2 className="text-2xl font-bold text-slate-800">Documents</h2>
            <p className="text-slate-600">
              Access your financial reports and property documents
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
            <p className="mt-4 text-slate-600">Loading documents...</p>
          </div>
        ) : years.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No Documents Found
            </h3>
            <p className="text-slate-600">
              {selectedPropertyId
                ? "No documents available for the selected property."
                : "No documents have been uploaded yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {years.map((year) => {
              const yearData = documentsByYearAndMonth[year];
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

      <div className="luxury-card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Document Access
            </h3>
            <p className="text-blue-700">
              Documents are organized by year and month for easy navigation. Use
              the property selector above to filter documents for a specific
              property. Financial documents include profit & loss statements,
              while star reports contain detailed property performance metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
