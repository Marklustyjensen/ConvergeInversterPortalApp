"use client";

import { useState, useEffect } from "react";
import PropertySelector from "./PropertySelector";
import { Property } from "../../types/property";

interface User {
  id: string;
  name: string;
  username: string;
}

interface Message {
  id: string;
  subject: string;
  message: string;
  sentDate: string;
  isRead: boolean;
  readDate?: string;
  property: {
    id: string;
    name: string;
    code: string;
  };
  sender: User;
}

interface MessageTabProps {
  userProperties: Property[];
}

export default function MessageTab({ userProperties }: MessageTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [selectedPropertyId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const url = selectedPropertyId
        ? `/api/messages?propertyId=${selectedPropertyId}`
        : "/api/messages";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch("/api/messages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          isRead: true,
        }),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? { ...msg, isRead: true, readDate: updatedMessage.readDate }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const toggleMessage = (messageId: string) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
      const message = messages.find((msg) => msg.id === messageId);
      if (message && !message.isRead) {
        markAsRead(messageId);
      }
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

  const unreadCount = messages.filter((msg) => !msg.isRead).length;

  return (
    <div className="space-y-6">
      <div className="luxury-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Messages</h2>
            <p className="text-slate-600">
              View and manage your property communications
              {unreadCount > 0 && (
                <span className="text-blue-600 ml-2">
                  • {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600">
                Total: {messages.length}
              </span>
              {unreadCount > 0 && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="md:w-64">
              <PropertySelector
                properties={userProperties}
                selectedPropertyId={selectedPropertyId}
                onPropertyChange={setSelectedPropertyId}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-card">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-6xl mb-4">📬</div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No Messages Found
            </h3>
            <p className="text-slate-600">
              {selectedPropertyId
                ? "No messages found for the selected property."
                : "You don't have any messages yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {messages.map((message) => (
              <div
                key={message.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`p-6 cursor-pointer ${
                    message.isRead ? "" : "bg-blue-50/50"
                  }`}
                  onClick={() => toggleMessage(message.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                      <h3
                        className={`font-semibold text-lg ${
                          message.isRead ? "text-slate-700" : "text-slate-900"
                        }`}
                      >
                        {message.subject}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500">
                        {formatDate(message.sentDate)}
                      </span>
                      <div className="text-slate-400">
                        {expandedMessage === message.id ? "▼" : "▶"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600 space-y-1 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
                      <span>
                        <span className="font-medium">From:</span>{" "}
                        {message.sender.name || message.sender.username}
                      </span>
                      <span>
                        <span className="font-medium">Property:</span>{" "}
                        {message.property.name} ({message.property.code})
                      </span>
                    </div>
                    {message.isRead && message.readDate && (
                      <span className="text-xs text-slate-400 mt-1 sm:mt-0">
                        Read {formatDate(message.readDate)}
                      </span>
                    )}
                  </div>

                  {expandedMessage === message.id && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="luxury-card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Message Management
            </h3>
            <p className="text-blue-700">
              Messages are organized by property and sender. Use the property
              selector above to filter messages for a specific property. Click
              on any message to expand and read the full content. Unread
              messages are highlighted for easy identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
