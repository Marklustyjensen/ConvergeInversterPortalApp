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
  monthIndex: number;
  propertyId?: string | null;
}

export default function StarReportTab() {
  const { data: session } = useSession();
  const [expandedYears, setExpandedYears] = useState(new Set(["2025"])); // Start with 2025 expanded
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

  // Generate monthly star reports from July 2023 to June 2025
  const generateMonthlyStarReports = (): Document[] => {
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

    // Start from July 2023
    let year = 2023;
    let month = 6; // July is index 6 (0-based)

    // Generate until June 2025
    while (year < 2025 || (year === 2025 && month < 6)) {
      const monthName = months[month];
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
        title: `${monthName} ${year} Star Report${propertyName}`,
        type: "PDF",
        date: `${monthName.substring(0, 3)} ${Math.floor(Math.random() * 28) + 1}, ${year}`,
        size: `${fileSize} MB`,
        year: year,
        monthIndex: month,
        propertyId: assignedPropertyId,
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

  // Group documents by year
  const documentsByYear = filteredDocuments.reduce(
    (acc: { [key: number]: Document[] }, doc) => {
      if (!acc[doc.year]) {
        acc[doc.year] = [];
      }
      acc[doc.year].push(doc);
      return acc;
    },
    {}
  );

  // Sort years in descending order (newest first)
  const years = Object.keys(documentsByYear).sort(
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

  return (
    <>
      <div className="space-y-8">
        <div className="luxury-card p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Star Report Documents
          </h2>
          <p className="text-slate-600 mb-6">
            Access your monthly star reports, performance analytics, and
            investment insights organized by year.
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
              years.map((year) => (
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
                        {documentsByYear[parseInt(year)].length} report
                        {documentsByYear[parseInt(year)].length !== 1
                          ? "s"
                          : ""}
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

                  {/* Documents Grid */}
                  {expandedYears.has(year) && (
                    <div className="p-6 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documentsByYear[parseInt(year)].map(
                          (doc: Document, index: number) => (
                            <div
                              key={`${year}-${index}`}
                              className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
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
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
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
