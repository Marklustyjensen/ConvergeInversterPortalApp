"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string | null;
  username: string;
  email: string;
  admin: boolean;
  userProperties: {
    property: {
      id: string;
      name: string;
      code: string;
    };
  }[];
}

interface Property {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
}

interface NewUserForm {
  name: string;
  username: string;
  email: string;
  password: string;
  admin: boolean;
}

interface AdminUsersTabProps {
  quickAction?: string | null;
}

export default function AdminUsersTab({ quickAction }: AdminUsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPropertyAssignModal, setShowPropertyAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: "",
    username: "",
    email: "",
    password: "",
    admin: false,
  });

  useEffect(() => {
    fetchUsers();
    fetchProperties();
  }, []);

  // Handle quick action from overview tab
  useEffect(() => {
    if (quickAction === "create") {
      setShowCreateForm(true);
    }
  }, [quickAction]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        await fetchUsers();
        setShowCreateForm(false);
        setNewUser({
          name: "",
          username: "",
          email: "",
          password: "",
          admin: false,
        });
        alert("User created successfully!");
      } else {
        const error = await response.json();
        alert(`Error creating user: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${username}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUsers();
        alert("User deleted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Delete error response:", errorData);
        alert(`Error deleting user: ${errorData.error || "Unknown error"}`);

        // Log additional details if available
        if (errorData.details) {
          console.error("Error details:", errorData.details);
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please check the console for details.");
    }
  };

  const toggleAdminStatus = async (userId: string, currentAdmin: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admin: !currentAdmin }),
      });

      if (response.ok) {
        await fetchUsers();
        alert(`User admin status updated successfully!`);
      } else {
        const error = await response.json();
        alert(`Error updating user: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user. Please try again.");
    }
  };

  const handleAssignProperty = async (propertyId: string) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `/api/admin/users/${selectedUser.id}/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId }),
        }
      );

      if (response.ok) {
        await fetchUsers();
        // Update the selected user to reflect the new assignment
        const updatedUsers = await fetch("/api/admin/users").then((r) =>
          r.json()
        );
        const updatedUser = updatedUsers.find(
          (u: User) => u.id === selectedUser.id
        );
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
        alert("Property assigned successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error assigning property: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error assigning property:", error);
      alert("Error assigning property. Please try again.");
    }
  };

  const handleUnassignProperty = async (propertyId: string) => {
    if (!selectedUser) return;

    if (!confirm("Are you sure you want to unassign this property?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/users/${selectedUser.id}/properties?propertyId=${propertyId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchUsers();
        // Update the selected user to reflect the removal
        const updatedUsers = await fetch("/api/admin/users").then((r) =>
          r.json()
        );
        const updatedUser = updatedUsers.find(
          (u: User) => u.id === selectedUser.id
        );
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
        alert("Property unassigned successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error unassigning property: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error unassigning property:", error);
      alert("Error unassigning property. Please try again.");
    }
  };

  const openPropertyAssignModal = (user: User) => {
    setSelectedUser(user);
    setShowPropertyAssignModal(true);
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-600">Create and manage user accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add New User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="luxury-card p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Search Users
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          {searchTerm && (
            <div className="text-sm text-slate-600">
              {filteredUsers.length} of {users.length} users shown
            </div>
          )}
        </div>
      </div>

      {/* Create User Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Create New User
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="admin"
                  checked={newUser.admin}
                  onChange={(e) =>
                    setNewUser({ ...newUser, admin: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label
                  htmlFor="admin"
                  className="ml-2 block text-sm text-slate-700"
                >
                  Administrator privileges
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Assignment Modal */}
      {showPropertyAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Manage Properties for{" "}
                {selectedUser.name || selectedUser.username}
              </h3>
              <button
                onClick={() => setShowPropertyAssignModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Current Properties */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-slate-700 mb-3">
                Currently Assigned Properties
              </h4>
              {selectedUser.userProperties.length > 0 ? (
                <div className="space-y-2">
                  {selectedUser.userProperties.map((up) => (
                    <div
                      key={up.property.id}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-slate-800">
                          {up.property.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          Code: {up.property.code}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnassignProperty(up.property.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No properties assigned</p>
              )}
            </div>

            {/* Available Properties */}
            <div>
              <h4 className="text-md font-medium text-slate-700 mb-3">
                Available Properties
              </h4>
              {properties.filter(
                (property) =>
                  !selectedUser.userProperties.some(
                    (up) => up.property.id === property.id
                  )
              ).length > 0 ? (
                <div className="space-y-2">
                  {properties
                    .filter(
                      (property) =>
                        !selectedUser.userProperties.some(
                          (up) => up.property.id === property.id
                        )
                    )
                    .map((property) => (
                      <div
                        key={property.id}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-slate-800">
                            {property.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            Code: {property.code} • {property.address},{" "}
                            {property.city}, {property.state}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssignProperty(property.id)}
                          className="text-green-600 hover:text-green-800 px-3 py-1 text-sm border border-green-300 rounded hover:bg-green-50"
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  All available properties are already assigned
                </p>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPropertyAssignModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="luxury-card">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {searchTerm
              ? `Search Results (${filteredUsers.length})`
              : `All Users (${users.length})`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {user.name || user.username}
                        </div>
                        <div className="text-sm text-slate-500">
                          @{user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.admin
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.admin ? "Administrator" : "Investor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {user.userProperties.length} properties
                      </div>
                      {/* {user.userProperties.length > 0 && (
                        <div className="text-sm text-slate-500">
                          {user.userProperties
                            .map((up) => up.property.name)
                            .join(", ")}
                        </div>
                      )} */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {!user.admin && (
                        <button
                          onClick={() => openPropertyAssignModal(user)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Manage Properties
                        </button>
                      )}
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.admin)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {user.admin ? "Remove Admin" : "Make Admin"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-slate-500">
                      {searchTerm ? (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <p className="mt-2 text-sm">
                            No users found matching "{searchTerm}"
                          </p>
                          <p className="text-xs text-slate-400">
                            Try adjusting your search terms
                          </p>
                        </>
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                            />
                          </svg>
                          <p className="mt-2 text-sm">No users found</p>
                          <p className="text-xs text-slate-400">
                            Get started by creating your first user
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
