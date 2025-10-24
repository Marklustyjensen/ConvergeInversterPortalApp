import PropertyCard from "./propertyCard";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Property } from "../../types/property";

interface Message {
  id: string;
  subject: string;
  message: string;
  sentDate: string;
  isRead: boolean;
  property: {
    id: string;
    name: string;
    code: string;
  };
  sender: {
    id: string;
    name: string;
    username: string;
  };
}

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

export default function OverviewTab() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user) return;

      try {
        // Fetch properties
        const propertiesResponse = await fetch("/api/properties");
        if (!propertiesResponse.ok) {
          throw new Error("Failed to fetch properties");
        }
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData);

        // Fetch recent messages (limit to 3)
        const messagesResponse = await fetch("/api/messages");
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setRecentMessages(messagesData.slice(0, 3));
        }

        // Fetch recent documents (limit to 5)
        const documentsResponse = await fetch("/api/documents");
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json();
          setRecentDocuments(documentsData.slice(0, 5));
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);
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
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading your properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600">No properties found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {properties.map((property: Property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="luxury-card p-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">
          Recent Activity
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading recent activity...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recent Messages Section */}
            {recentMessages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4">
                  Latest Messages
                </h4>
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          message.isRead ? "bg-gray-100" : "bg-blue-100"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 ${message.isRead ? "text-gray-600" : "text-blue-600"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-medium truncate ${message.isRead ? "text-slate-700" : "text-slate-900"}`}
                          >
                            {message.subject}
                          </p>
                          {!message.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {message.property.name} •{" "}
                          {new Date(message.sentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Documents Section */}
            {recentDocuments.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4">
                  Latest Documents
                </h4>
                <div className="space-y-3">
                  {recentDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg"
                    >
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {document.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {document.property.name} • {document.documentType} •{" "}
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Activity Message */}
            {recentMessages.length === 0 &&
              recentDocuments.length === 0 &&
              !loading && (
                <div className="text-center py-8">
                  <p className="text-slate-600">
                    No recent activity to display.
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
