import { useState, useEffect } from "react";
import React from "react";
import { useSession } from "next-auth/react";
import PropertySelector from "./PropertySelector";

export default function DocumentTab() {
  const { data: session } = useSession();
  const [expandedYears, setExpandedYears] = useState(new Set(["2025"])); // Start with 2025 expanded
  const [expandedMonths, setExpandedMonths] = useState(new Set()); // Track expanded months
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(err.message || "Failed to load properties");
        setProperties([]); // Set empty array so component still works
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [session]);

  // Generate multiple document types for each month from July 2023 to June 2025
  const generateMonthlyDocuments = () => {
    const documents = [];
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

    // Document types with their characteristics
    const documentTypes = [
      {
        name: "Financial Statement",
        frequency: 1, // Always present
        icon: "financial",
        color: "red",
      },
      {
        name: "Property Report",
        frequency: 1, // Always present
        icon: "property",
        color: "blue",
      },
      {
        name: "Tax Document",
        frequency: 0.8, // 80% chance
        icon: "tax",
        color: "green",
      },
      {
        name: "Maintenance Report",
        frequency: 0.6, // 60% chance
        icon: "maintenance",
        color: "yellow",
      },
      {
        name: "Tenant Report",
        frequency: 0.7, // 70% chance
        icon: "tenant",
        color: "purple",
      },
      {
        name: "Insurance Document",
        frequency: 0.3, // 30% chance
        icon: "insurance",
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
          const fileSize = (Math.random() * 2 + 1.5).toFixed(1); // Random size between 1.5-3.5 MB

          // For demo purposes, randomly assign documents to properties when available
          let assignedPropertyId = null;
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
  const allDocuments = React.useMemo(() => {
    return generateMonthlyDocuments();
  }, [properties]);

  // Filter documents based on selected property
  const filteredDocuments = selectedPropertyId
    ? allDocuments.filter((doc) => doc.propertyId === selectedPropertyId)
    : allDocuments;

  // Group documents by year and then by month
  const documentsByYearAndMonth = filteredDocuments.reduce((acc, doc) => {
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
  }, {});

  // Sort years in descending order (newest first)
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

  // Helper function to get document icon and colors
  const getDocumentIcon = (iconType, color) => {
    const colorClasses = {
      red: { bg: "bg-red-100", text: "text-red-600" },
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
    };

    const icons = {
      financial: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      ),
      property: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
      tax: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      ),
      maintenance: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
      ),
      tenant: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
      insurance: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      ),
    };

    return {
      icon: icons[iconType] || icons.financial,
      colors: colorClasses[color] || colorClasses.red,
    };
  };

  return (
    <>
      <div className="space-y-8">
        <div className="luxury-card p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Financial Documents
          </h2>
          <p className="text-slate-600 mb-6">
            Access your investment documents organized by year and month. Each
            month may contain multiple document types including financial
            statements, property reports, tax documents, maintenance reports,
            tenant reports, and insurance documents.
          </p>

          {/* Property Selector */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Note: {error}. Showing sample documents for demonstration.
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
                const yearData = documentsByYearAndMonth[year];
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
                          {totalDocuments} document
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
                                      {monthData.documents.length} document
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
                                      {monthData.documents.map((doc, index) => {
                                        const { icon, colors } =
                                          getDocumentIcon(doc.icon, doc.color);
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
                                      })}
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
                    ? "No documents found for the selected property."
                    : "No documents available."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
