"use client";

import { useState, useEffect } from "react";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  code: string;
  primaryImage: string | null;
  images: string[];
  userProperties: {
    user: {
      name: string | null;
      username: string;
    };
  }[];
}

interface NewPropertyForm {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  code: string;
}

export default function AdminPropertiesTab() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [newProperty, setNewProperty] = useState<NewPropertyForm>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    code: "",
  });

  useEffect(() => {
    fetchProperties();
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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const url = editingProperty
        ? `/api/admin/properties/${editingProperty.id}`
        : "/api/admin/properties";

      const method = editingProperty ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProperty),
      });

      if (response.ok) {
        await fetchProperties();
        setShowCreateForm(false);
        setEditingProperty(null);
        setNewProperty({
          name: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          code: "",
        });
        alert(
          editingProperty
            ? "Property updated successfully!"
            : "Property created successfully!"
        );
      } else {
        const error = await response.json();
        alert(
          `Error ${editingProperty ? "updating" : "creating"} property: ${error.message}`
        );
      }
    } catch (error) {
      console.error(
        `Error ${editingProperty ? "updating" : "creating"} property:`,
        error
      );
      alert(
        `Error ${editingProperty ? "updating" : "creating"} property. Please try again.`
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProperty = async (
    propertyId: string,
    propertyName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete property "${propertyName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProperties();
        alert("Property deleted successfully!");
      } else {
        const error = await response.json();
        alert(`Error deleting property: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Error deleting property. Please try again.");
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setNewProperty({
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      code: property.code,
    });
    setShowCreateForm(true);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingProperty(null);
    setNewProperty({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      code: "",
    });
  };

  if (loading) {
    return (
      <div className="luxury-card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Property Management
          </h2>
          <p className="text-slate-600">
            Create and manage properties in the portfolio
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProperty(null);
            setShowCreateForm(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <span>🏢</span>
          <span>Add New Property</span>
        </button>
      </div>

      {/* Create Property Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {editingProperty ? "Edit Property" : "Create New Property"}
            </h3>
            <form onSubmit={handleCreateProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  value={newProperty.name}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter property name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newProperty.address}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter street address"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newProperty.city}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newProperty.state}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, state: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={newProperty.zip}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, zip: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ZIP Code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Property Code
                </label>
                <input
                  type="text"
                  value={newProperty.code}
                  onChange={(e) =>
                    setNewProperty({
                      ...newProperty,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Unique property code (e.g., PROP001)"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary disabled:opacity-50"
                >
                  {creating
                    ? editingProperty
                      ? "Updating..."
                      : "Creating..."
                    : editingProperty
                      ? "Update Property"
                      : "Create Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="luxury-card overflow-hidden">
            {property.primaryImage ? (
              <img
                src={`/images/properties/${property.primaryImage}`}
                alt={property.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-slate-200 flex items-center justify-center">
                <span className="text-slate-500 text-4xl">🏢</span>
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-800">
                  {property.name}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {property.code}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                {property.address}
                <br />
                {property.city}, {property.state} {property.zip}
              </p>
              <div className="mb-4">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">
                    {property.userProperties.length}
                  </span>{" "}
                  investors
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{property.images.length}</span>{" "}
                  images
                </p>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleEditProperty(property)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleDeleteProperty(property.id, property.name)
                  }
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="luxury-card p-8 text-center">
          <div className="text-slate-400 text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No Properties Found
          </h3>
          <p className="text-slate-600 mb-4">
            Get started by creating your first property.
          </p>
          <button
            onClick={() => {
              setEditingProperty(null);
              setShowCreateForm(true);
            }}
            className="btn-primary"
          >
            Add First Property
          </button>
        </div>
      )}
    </div>
  );
}
