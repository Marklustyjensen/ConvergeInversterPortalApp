import { Property } from "../../types/property";

interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onPropertyChange: (propertyId: string | null) => void;
  loading?: boolean;
}

export default function PropertySelector({
  properties,
  selectedPropertyId,
  onPropertyChange,
  loading = false,
}: PropertySelectorProps) {
  if (loading) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Property
        </label>
        <div className="animate-pulse bg-slate-200 h-10 rounded-lg"></div>
      </div>
    );
  }

  // Only show selector if user has more than one property
  if (properties.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Select Property
      </label>
      <select
        value={selectedPropertyId || ""}
        onChange={(e) => onPropertyChange(e.target.value || null)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900"
      >
        <option value="">All Properties</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name} - {property.city}, {property.state}
          </option>
        ))}
      </select>
    </div>
  );
}
