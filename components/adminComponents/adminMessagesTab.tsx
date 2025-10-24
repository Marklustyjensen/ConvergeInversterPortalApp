"use client";

import { useState, useEffect } from "react";

interface Property {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  admin: boolean;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  sentDate: string;
  isRead: boolean;
  emailNotification: boolean;
  property: Property;
  sender: User;
  recipient: User | null;
}

export default function AdminMessagesTab() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    propertyId: "",
    emailNotification: false,
  });

  useEffect(() => {
    fetchProperties();
    fetchMessages();
  }, []);

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

  const fetchMessages = async (propertyId?: string) => {
    try {
      const url = propertyId
        ? `/api/admin/messages?propertyId=${propertyId}`
        : "/api/admin/messages";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handlePropertyFilter = (propertyId: string) => {
    setSelectedProperty(propertyId);
    fetchMessages(propertyId || undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Message sent successfully to ${result.count} recipient(s)!`);
        setFormData({
          subject: "",
          message: "",
          propertyId: "",
          emailNotification: false,
        });
        setShowNewMessageForm(false);
        fetchMessages(selectedProperty || undefined);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Message Center</h2>
          <p className="text-slate-600">
            Send messages to investors about their properties
          </p>
        </div>
        <button
          onClick={() => setShowNewMessageForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>✉️</span>
          <span>New Message</span>
        </button>
      </div>

      <div className="luxury-card">
        {/* Filter by Property */}
        <div className="mb-8 bg-slate-50 p-6 rounded-xl">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            <svg
              className="w-4 h-4 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter by Property
          </label>
          <select
            value={selectedProperty}
            onChange={(e) => handlePropertyFilter(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          >
            <option value="">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} ({property.code})
              </option>
            ))}
          </select>
        </div>

        {/* Messages List */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📬</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Messages Yet
              </h3>
              <p className="text-slate-500 mb-6">
                {selectedProperty
                  ? "No messages found for the selected property"
                  : "Start communicating with your investors by sending your first message"}
              </p>
              <button
                onClick={() => setShowNewMessageForm(true)}
                className="luxury-button px-6 py-3"
              >
                Send First Message
              </button>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-6 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
                  message.isRead
                    ? "bg-white border-slate-200"
                    : "bg-blue-50 border-blue-300 shadow-md"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800 mb-1">
                      {message.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span>
                        <svg
                          className="w-4 h-4 inline mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8"
                          />
                        </svg>
                        <span className="font-medium">Property:</span>{" "}
                        {message.property.name} ({message.property.code})
                      </span>
                      {message.recipient && (
                        <span>
                          <svg
                            className="w-4 h-4 inline mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-medium">To:</span>{" "}
                          {message.recipient.name || message.recipient.username}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      {message.emailNotification && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Email Sent
                        </span>
                      )}
                      {!message.isRead && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          Unread
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">
                      {formatDate(message.sentDate)}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {message.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  Send New Message
                </h3>
                <p className="text-slate-600">
                  Communicate with your investors about property updates
                </p>
              </div>
              <button
                onClick={() => setShowNewMessageForm(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v8"
                    />
                  </svg>
                  Property *
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) =>
                    setFormData({ ...formData, propertyId: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name} ({property.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Message will be sent to all investors of the selected property
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="Enter message subject..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  <svg
                    className="w-4 h-4 inline mr-2"
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
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotification"
                    checked={formData.emailNotification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailNotification: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label
                    htmlFor="emailNotification"
                    className="ml-3 block text-sm font-medium text-slate-700"
                  >
                    <svg
                      className="w-4 h-4 inline mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Send email notification to recipients
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-2 ml-7">
                  Recipients will receive an email alert in addition to the
                  in-app message
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewMessageForm(false)}
                  className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="luxury-button disabled:opacity-50 px-6 py-3 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
