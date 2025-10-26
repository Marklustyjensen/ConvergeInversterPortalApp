"use client";

import { useState, useEffect } from "react";

interface Property {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

interface Document {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  propertyId: string;
  property: Property;
  documentType: string;
  year: number;
  month: number;
  uploadDate: string;
  uploadedBy: string;
}

interface UploadModalData {
  propertyId: string;
  year: number;
  month: number;
  documentType: string;
}

interface AdminDocumentsTabProps {
  quickAction?: string | null;
}

export default function AdminDocumentsTab({
  quickAction,
}: AdminDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [expandedYears, setExpandedYears] = useState(new Set(["2025"]));
  const [expandedMonths, setExpandedMonths] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadModalData, setUploadModalData] = useState<UploadModalData>({
    propertyId: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    documentType: "financial",
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [selectedPropertyId]);

  // Handle quick action from overview tab
  useEffect(() => {
    if (quickAction === "upload") {
      handleUploadClick();
    }
  }, [quickAction]);

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPropertyId) {
        params.append("propertyId", selectedPropertyId);
      }

      const response = await fetch(`/api/admin/documents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
      setDocumentsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/admin/properties");
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.accept =
      ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif";
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        setSelectedFiles(target.files);
        setShowUploadModal(true);
      }
    };
    fileInput.click();
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    if (!uploadModalData.propertyId) {
      alert("Please select a property");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    // Add all files to FormData
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    // Add metadata
    formData.append("propertyId", uploadModalData.propertyId);
    formData.append("year", uploadModalData.year.toString());
    formData.append("month", uploadModalData.month.toString());
    formData.append("documentType", uploadModalData.documentType);

    try {
      const response = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchDocuments();
        alert(`Successfully uploaded ${selectedFiles.length} file(s)!`);
        setShowUploadModal(false);
        setSelectedFiles(null);
        setUploadModalData({
          propertyId: "",
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          documentType: "financial",
        });
      } else {
        const error = await response.json();
        alert(`Error uploading files: ${error.message}`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (
    documentId: string,
    documentName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${documentName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDocuments();
        alert("Document deleted successfully!");
      } else {
        const error = await response.json();
        alert(`Error deleting document: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Error deleting document. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  const getDocumentTypeDisplay = (type: string) => {
    return type === "financial" ? "Financial Document" : "Star Report";
  };

  const getDocumentIcon = (documentType: string) => {
    const types: { [key: string]: { bg: string; text: string } } = {
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

  const getMonthName = (month: number) => {
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
    return months[month - 1];
  };

  const filteredDocuments = documents;

  const documentsByYearAndMonth = filteredDocuments.reduce((acc: any, doc) => {
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

  const years = Object.keys(documentsByYearAndMonth).sort(
    (a: any, b: any) => b - a
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

  if (loading) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Property Selector */}
      <div className="luxury-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Document Management
            </h2>
            <p className="text-slate-600">
              Upload and manage documents for all properties
            </p>
          </div>
          <div className="md:w-64">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Property
            </label>
            <select
              value={selectedPropertyId || ""}
              onChange={(e) => setSelectedPropertyId(e.target.value || null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              <option value="">All Properties</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.city}, {property.state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Upload Documents
        </h3>
        <button
          onClick={handleUploadClick}
          className="btn-primary inline-flex items-center space-x-2"
          disabled={uploading}
        >
          <span>📤</span>
          <span>Upload Files</span>
        </button>
        <p className="text-sm text-slate-500 mt-2">
          Supports PDF, images, documents, and more. You'll be prompted to
          select property, date, and document type. Property owners will be
          automatically notified by email.
        </p>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Upload Document Details
            </h3>

            {selectedFiles && (
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  Selected files ({selectedFiles.length}):
                </p>
                <div className="max-h-20 overflow-y-auto text-xs text-slate-500">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index}>{file.name}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Property Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Property *
                </label>
                <select
                  value={uploadModalData.propertyId}
                  onChange={(e) =>
                    setUploadModalData({
                      ...uploadModalData,
                      propertyId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} ({property.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year *
                </label>
                <select
                  value={uploadModalData.year}
                  onChange={(e) =>
                    setUploadModalData({
                      ...uploadModalData,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Month *
                </label>
                <select
                  value={uploadModalData.month}
                  onChange={(e) =>
                    setUploadModalData({
                      ...uploadModalData,
                      month: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    return (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Document Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={uploadModalData.documentType}
                  onChange={(e) =>
                    setUploadModalData({
                      ...uploadModalData,
                      documentType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="financial">Financial Document</option>
                  <option value="star_report">Star Report</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                className="btn-primary"
                disabled={uploading || !uploadModalData.propertyId}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="luxury-card">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Documents ({documents.length})
          </h3>
        </div>
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
                        (total: number, month: any) =>
                          total + month.documents.length,
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
                                {monthData.documents.map((doc: Document) => {
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
                                              {doc.originalName}
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
                                          <button
                                            onClick={() =>
                                              handleDeleteDocument(
                                                doc.id,
                                                doc.originalName
                                              )
                                            }
                                            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                          >
                                            <span>🗑️</span>
                                            <span>Delete</span>
                                          </button>
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

      {/* Information Note */}
      {/* <div className="luxury-card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Document Management
            </h3>
            <p className="text-blue-700">
              Documents are organized by year and month for easy navigation. Use
              the property selector above to filter documents for a specific
              property or view all properties. Both financial documents and star
              reports are managed here. Investors will be automatically notified
              by email when new documents are uploaded for their properties.
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
