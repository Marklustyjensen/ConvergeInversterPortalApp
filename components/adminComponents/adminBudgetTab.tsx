"use client";

import { useState, useEffect } from "react";

interface Property {
  id: string;
  name: string;
  code: string;
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

export default function AdminBudgetTab() {
  const [budgets, setBudgets] = useState<Document[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadModalData, setUploadModalData] = useState<UploadModalData>({
    propertyId: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    documentType: "budget",
  });

  useEffect(() => {
    fetchBudgets();
    fetchProperties();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/admin/documents?documentType=budget");
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
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
    fileInput.accept = ".pdf";
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
        await fetchBudgets();
        alert(`Successfully uploaded ${selectedFiles.length} budget file(s)!`);
        setShowUploadModal(false);
        setSelectedFiles(null);
        setUploadModalData({
          propertyId: "",
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          documentType: "budget",
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
        await fetchBudgets();
        alert("Budget deleted successfully!");
      } else {
        const error = await response.json();
        alert(`Error deleting budget: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      alert("Error deleting budget. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  if (loading) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Budget Management</h2>
        <p className="text-slate-600">
          Upload and manage budget PDF files for the investor portal
        </p>
      </div>

      {/* Upload Button */}
      <div className="luxury-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Upload Budget Files
        </h3>
        <button
          onClick={handleUploadClick}
          className="btn-primary inline-flex items-center space-x-2"
          disabled={uploading}
        >
          <span>📤</span>
          <span>Upload Budget PDFs</span>
        </button>
        <p className="text-sm text-slate-500 mt-2">
          Upload PDF budget files. You'll be prompted to select property and
          date. Property owners will be automatically notified by email.
        </p>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Upload Budget Details
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
            Uploaded Budget Files ({budgets.length})
          </h3>
        </div>
        {budgets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Budget File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💰</span>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {budget.originalName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {budget.property.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {budget.property.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {getMonthName(budget.month)} {budget.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {formatFileSize(budget.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(budget.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <a
                        href={budget.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </a>
                      <button
                        onClick={() =>
                          handleDeleteDocument(budget.id, budget.originalName)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">�</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No Budget Files Found
            </h3>
            <p className="text-slate-600">
              Upload your first budget PDF to get started.
            </p>
          </div>
        )}
      </div>

      {/* Integration Note */}
      {/* <div className="luxury-card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Vercel Blob Storage Integration
            </h3>
            <p className="text-blue-700">
              The document upload system is now configured to work with Vercel
              Blob storage. Files are organized by property, year, month, and
              document type for easy retrieval in the investor portal. Make sure
              to configure your Vercel Blob storage environment variables for
              production use.
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
